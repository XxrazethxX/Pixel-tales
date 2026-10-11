import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import { fresh } from "../src/game.js";
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
  s.location = -1;
  s.position = { x: 600, y: 480 };
  s.timeOfDay = 16;
  s.food = 50;
  s.campUpgrades = {
    tents: 2,
    cookpot: 1,
    forge: 1,
    watchpost: 1,
    infirmary: 1,
  };
  s.inventory.wood = 20;
  s.inventory.herbs = 10;
  s.party.forEach((p) => (p.fatigue = 90));
  await seed(s);
  assert.equal(await page.locator("#survival-warning").isVisible(), true);
  await click("Make camp");
  for (const [role, id] of [
    ["Camp cook", "3"],
    ["Camp smith", "0"],
    ["Camp medic", "2"],
    ["Night guard", "1"],
  ])
    await page.getByLabel(role, { exact: true }).selectOption(id);
  assert.equal(
    await page
      .getByLabel("Night guard", { exact: true })
      .locator('option[value="3"]')
      .isDisabled(),
    true,
  );
  const before = await state();
  assert.equal(before.campJobs.cook, 3);
  await click("Rest until dawn");
  let saved = await state();
  assert.equal(saved.day, 2);
  assert.equal(saved.food, 48);
  assert.equal(saved.inventory.wood, 19);
  assert.equal(saved.inventory.ore, 2);
  assert.equal(saved.inventory.herbs, 8);
  assert.equal(saved.preparedValor, 1);
  const expectedFatigue = Math.max(
    0,
    before.party[0].fatigue - ((8 - before.timeOfDay + 24) % 24 || 24) * 3,
  );
  assert.ok(Math.abs(saved.party[0].fatigue - expectedFatigue) < 1e-6);
  assert.equal(saved.party[0].professionXP, 2);
  await click("View camp");
  await page.screenshot({ path: "/tmp/pixel-staffed-camp.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-staffed-camp-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await click("Return to camp menu");
  await page.getByLabel("Night guard", { exact: true }).selectOption("");
  assert.equal((await state()).campJobs.guard, undefined);
  await click("Break camp");
  await page.reload();
  await enterGame(page);
  saved = await state();
  assert.equal(saved.campJobs.cook, 3);
  assert.ok(
    Math.abs(
      saved.party[0].fatigue - expectedFatigue - (saved.timeOfDay - 8) * 2,
    ) < 1e-6,
  );
  await click("Make camp");
  assert.equal(
    await page.getByLabel("Camp cook", { exact: true }).inputValue(),
    "3",
  );
  await click("Company");
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      `Fatigue ${Math.round((await state()).party[0].fatigue)}/100`,
    ),
  );
  const battle = fresh();
  battle.location = 1;
  battle.position = { x: 350, y: 145 };
  battle.contract = { name: "Test raiders", target: 1, reward: 65 };
  battle.party[0].fatigue = 85;
  await seed(battle);
  await click("Engage raiders");
  assert.ok(
    (await page.locator("#objective").textContent()).includes("Exhausted"),
  );
  assert.ok(
    (await page.locator("#objective").textContent()).includes(
      "move up to 1 tiles",
    ),
  );
  assert.ok(
    (await page.locator("#objective").textContent()).includes(
      "Melee flanking +2",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: camp duty assignment and uniqueness, material costs and output, profession practice, reduced ration cost, fatigue recovery and penalties, readiness, staffed camp artwork, mobile layout and saved duties; no JS errors.",
  );
} finally {
  await browser.close();
}
