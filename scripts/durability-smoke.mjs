import assert from "node:assert/strict";
import {
  fresh,
  grantEquipment,
  equipEquipment,
  startBattle,
} from "../src/game.js";
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
  const id = grantEquipment(s, "greatsword-2");
  equipEquipment(s, id, 0);
  s.gear[0].durability = 0;
  await seed(s);
  await click("Equipment");
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "Broken · Condition 0/100",
    ),
  );
  assert.ok(
    (await page.locator("#panel").textContent()).includes("ATK 7 · Armor 0"),
  );
  await click("Repair Executioner's blade · 42 crowns");
  assert.equal((await state()).gold, 78);
  assert.equal((await state()).gear[0].durability, 100);
  assert.ok(
    (await page.locator("#panel").textContent()).includes("ATK 12 · Armor 0"),
  );
  const camp = await state();
  camp.gear[0].durability = 0;
  camp.location = -1;
  camp.position = { x: 600, y: 480 };
  camp.campUpgrades.forge = 1;
  camp.inventory.ore = 10;
  camp.inventory.wood = 10;
  await seed(camp);
  await click("Make camp");
  await click("Open camp repairs");
  assert.equal(
    await page
      .getByRole("button", {
        name: "Repair Executioner's blade · 4 ore · 1 wood · 2 hours",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await click("Camp");
  await page.getByLabel("Camp smith", { exact: true }).selectOption("0");
  await click("Open camp repairs");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", {
      name: "Repair Executioner's blade · 4 ore · 1 wood · 2 hours",
      exact: true,
    })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/pixel-repair-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await click("Repair Executioner's blade · 4 ore · 1 wood · 2 hours");
  let saved = await state();
  assert.equal(saved.inventory.ore, 6);
  assert.equal(saved.inventory.wood, 9);
  assert.equal(saved.party[0].professionXP, 1);
  assert.equal(saved.gear[0].durability, 100);
  await page.reload();
  assert.equal((await state()).gear[0].durability, 100);
  const combat = await state();
  combat.location = 1;
  combat.position = { x: 350, y: 145 };
  combat.contract = { target: 1, reward: 65 };
  startBattle(combat);
  await seed(combat);
  await click("Retreat · lose 15 crowns");
  saved = await state();
  assert.equal(saved.gear[0].durability, 90);
  assert.equal(saved.battle, null);
  saved.location = 0;
  saved.position = { x: 170, y: 280 };
  await seed(saved);
  await click("Visit Blacksmith");
  await click("Repair Executioner's blade · 5 crowns");
  assert.equal((await state()).gear[0].durability, 100);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "/tmp/pixel-blacksmith-repairs.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: broken gear stats, village repair pricing, staffed forge restrictions, material costs, Smith practice, time-based repair, mobile controls, condition persistence, retreat wear and blacksmith repairs.",
  );
} finally {
  await browser.close();
}
