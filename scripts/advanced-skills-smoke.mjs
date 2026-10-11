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
    await page.waitForSelector("#tabs button");
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  const s = fresh();
  s.party[2].level = 4;
  s.party[2].points = 3;
  await seed(s);
  await click("Company");
  const card = page
    .locator(".companion-card")
    .filter({ hasText: "Nell · Level 4" });
  await card
    .locator("details")
    .filter({ hasText: "Class abilities & specialization" })
    .evaluate((el) => (el.open = true));
  assert.equal(
    await card
      .getByRole("button", {
        name: "Master Piercing shot · 2 points",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await click("Learn Trapper · 1 point");
  await card
    .locator("details")
    .filter({ hasText: "Class abilities & specialization" })
    .evaluate((el) => (el.open = true));
  await click("Master Piercing shot · 2 points");
  assert.equal((await state()).party[2].points, 0);
  assert.equal((await state()).party[2].advancedSkill, "piercing");
  await card
    .locator("details")
    .filter({ hasText: "Class abilities & specialization" })
    .evaluate((el) => (el.open = true));
  assert.equal(
    await card
      .getByRole("button", {
        name: "Master Quick shot · 2 points",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/pixel-advanced-training-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.reload();
  assert.equal((await state()).party[2].advancedSkill, "piercing");
  const b = await state();
  b.location = 1;
  b.position = { x: 350, y: 145 };
  b.contract = { name: "Training fixture", target: 1, reward: 65 };
  startBattle(b);
  b.battle.units[2].x = 3;
  b.battle.units[2].y = 4;
  Object.assign(b.battle.enemies[0], { x: 3, y: 2, hp: 30, max: 30, armor: 5 });
  await seed(b);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await click("Nell");
  await click("Piercing shot · 3 valor");
  assert.ok(
    (await page.locator("#objective").textContent()).includes(
      "ignores enemy armor and terrain cover",
    ),
  );
  const point = await page.locator("#map").evaluate((c) => {
    const r = c.getBoundingClientRect();
    return {
      x:
        r.x +
        (136 + 3 * 62 - Number(c.dataset.viewX)) * Number(c.dataset.scale),
      y:
        r.y + (28 + 2 * 60 - Number(c.dataset.viewY)) * Number(c.dataset.scale),
    };
  });
  await page.mouse.click(point.x, point.y);
  const after = await state();
  assert.equal(after.battle.enemies[0].hp, 20);
  assert.equal(after.battle.enemies[0].root, 2);
  assert.equal(after.battle.units[2].cooldown, 3);
  assert.equal(after.battle.valor, 0);
  assert.equal(
    await page
      .getByRole("button", {
        name: "Piercing shot · 3 valor · cooldown 3",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-advanced-combat.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: advanced training prerequisites, two-point cost, permanent choice, save persistence, mobile layout, upgraded action targeting, armor/cover piercing, specialization compatibility and cooldown/valor restrictions.",
  );
} finally {
  await browser.close();
}
