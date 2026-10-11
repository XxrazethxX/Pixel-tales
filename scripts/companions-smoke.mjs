import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import { fresh, startBattle } from "../src/game.js";
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
    }),
    errors = [];
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
    await enterGame(page);
    await page.waitForSelector("#tabs button");
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  const s = fresh();
  s.gold = 500;
  await seed(s);
  await click("Visit The Crooked Lantern");
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "Mercenary: +1 attack",
    ),
  );
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "Daily wages: 3 crowns",
    ),
  );
  assert.ok(
    (await page.locator("#panel").textContent()).includes("Daily rations: 2"),
  );
  await page.screenshot({ path: "/tmp/pixel-recruitment.png" });
  await click("Hire Veyra · 80 crowns");
  assert.equal((await state()).party[4].traits[0], "mercenary");
  assert.equal((await state()).gold, 420);
  assert.equal(
    await page
      .getByRole("button", { name: "Hire Veyra · 80 crowns", exact: true })
      .count(),
    0,
  );
  await click("Hire Corin · 50 crowns");
  assert.equal((await state()).party[5].max, 32);
  assert.equal((await state()).gold, 370);
  assert.equal(
    await page
      .getByRole("button", { name: "Recruit companion", exact: true })
      .isDisabled(),
    true,
  );
  await click("Company");
  const veyra = page.locator(".companion-card").filter({
    has: page.getByRole("heading", { name: "Veyra · Level 1", exact: true }),
  });
  assert.ok((await veyra.textContent()).includes("Daily wages: 3 crowns"));
  assert.ok((await veyra.textContent()).includes("Resolve 65/100"));
  await veyra.getByText("Relationships", { exact: true }).click();
  assert.ok(
    (await veyra.textContent()).includes("Mara · Acquaintances · 0/100"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-companions-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await click("Close panel");
  await click("Make camp");
  await page
    .getByLabel("First conversation companion", { exact: true })
    .selectOption("0");
  await page
    .getByLabel("Second conversation companion", { exact: true })
    .selectOption("0");
  assert.equal(
    await page
      .getByRole("button", { name: "Share supper & stories", exact: true })
      .isDisabled(),
    true,
  );
  await page
    .getByLabel("Second conversation companion", { exact: true })
    .selectOption("3");
  const before = (await state()).food;
  await click("Share supper & stories");
  assert.equal((await state()).food, before - 2);
  assert.equal((await state()).bonds["0:3"], 5);
  assert.equal((await state()).party[0].resolve, 73);
  assert.equal(
    await page
      .getByRole("button", { name: "Share supper & stories", exact: true })
      .isDisabled(),
    true,
  );
  await click("Break camp");
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).bonds["0:3"], 5);
  assert.ok((await state()).hiredRecruits.includes("0-veteran"));
  await click("Visit The Crooked Lantern");
  assert.equal(
    await page
      .getByRole("button", { name: "Hire Veyra · 80 crowns", exact: true })
      .count(),
    0,
  );
  const fight = fresh();
  fight.location = 1;
  fight.position = { x: 350, y: 145 };
  fight.contract = { name: "Test", target: 1, reward: 65 };
  fight.bonds = { "0:1": 25 };
  startBattle(fight);
  fight.battle.units[0].x = 3;
  fight.battle.units[0].y = 1;
  fight.battle.units[1].x = 3;
  fight.battle.units[1].y = 2;
  fight.battle.enemies[0].x = 4;
  fight.battle.enemies[0].y = 1;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await seed(fight);
  assert.ok(
    (await page.locator("#objective").textContent()).includes(
      "Trusted support +1 attack",
    ),
  );
  await click("Company");
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "Osric · Trusted · 25/100",
    ),
  );
  const unhappy = fresh();
  unhappy.location = -1;
  unhappy.position = { x: 600, y: 480 };
  unhappy.party[0].resolve = 20;
  await seed(unhappy);
  assert.equal(await page.locator("#survival-warning").isVisible(), true);
  assert.ok(
    (await page.locator("#survival-warning").textContent()).includes(
      "disheartened",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: recruit previews and trait tradeoffs, specialist hiring and capacity, character resolve and bonds, conversation costs and restrictions, persistence, trusted battle support, low-resolve warnings, and mobile layout; no JS errors.",
  );
} finally {
  await browser.close();
}
