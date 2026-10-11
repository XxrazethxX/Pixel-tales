import assert from "node:assert/strict";
import { fresh, places } from "../src/game.js";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const click = (name) =>
    page.getByRole("button", { name, exact: true }).click();
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
  const seed = async (s) => {
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await page.waitForSelector("#tabs button");
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  const fixture = fresh();
  fixture.inventory.ore = 6;
  fixture.party[0].hp = 0;
  fixture.party[0].injury = true;
  await seed(fixture);
  await click("Visit Contract board");
  const offers = page.getByRole("button", {
    name: "Accept contract",
    exact: true,
  });
  assert.equal(await offers.count(), 4);
  assert.equal(await offers.nth(3).isDisabled(), true);
  assert.ok(
    (await page.locator("#panel").textContent()).includes("5 renown required"),
  );
  await click("Back to village");
  await click("Visit Market square");
  await click("Sell all ore · 12 crowns");
  assert.equal((await state()).gold, 132);
  assert.equal((await state()).inventory.ore, 0);
  assert.equal(
    await page
      .getByRole("button", {
        name: "Sell 1 ore · 2 crowns (0 owned)",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await click("Back to village");
  await click("Visit The Crooked Lantern");
  await click("Rest at inn · 24 crowns");
  const recovered = await state();
  assert.equal(recovered.gold, 108);
  assert.equal(recovered.day, 2);
  assert.equal(recovered.food, 24);
  assert.equal(recovered.morale, 90);
  assert.ok(recovered.party.every((p) => p.hp === p.max && !p.injury));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/pixel-tales-inn-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  recovered.renown = 5;
  await seed(recovered);
  await click("Company");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("Proven company"),
  );
  await click("Close panel");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await click("Enter Greyhaven");
  await click("Visit Contract board");
  assert.equal(await offers.nth(3).isDisabled(), false);
  await page.screenshot({
    path: "/tmp/pixel-tales-contract-progression.png",
    fullPage: true,
  });
  await offers.nth(3).click();
  let accepted = await state();
  assert.equal(accepted.contract.tier, 2);
  // Seed arrival at the accepted objective; the main smoke test covers free travel.
  accepted.position = { x: places[5].x, y: places[5].y };
  accepted.location = 5;
  accepted.trail = [{ ...accepted.position }];
  await seed(accepted);
  assert.equal(
    await page
      .getByRole("button", { name: "Accept contract", exact: true })
      .count(),
    0,
  );
  await click("Engage raiders");
  const battle = (await state()).battle;
  assert.equal(battle.enemies.length, 4);
  assert.equal(battle.enemies[0].hp, 20);
  assert.equal(battle.enemies[0].damage, 6);
  await click("Retreat · lose 15 crowns");
  accepted = await state();
  accepted.location = 3;
  accepted.position = { x: places[3].x, y: places[3].y };
  accepted.contract = null;
  await seed(accepted);
  await click("Visit Contract board");
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "The chapel smugglers",
    ),
  );
  assert.ok(
    !(await page.locator("#panel").textContent()).includes(
      "Wolves in human clothing",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: local village boards, renown locks and unlocks, market resale, full-party inn recovery, mobile layout, save persistence, and dangerous contract encounters; no JS errors.",
  );
} finally {
  await browser.close();
}
