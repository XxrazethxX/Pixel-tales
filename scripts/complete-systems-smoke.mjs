import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  grantEquipment,
  equipEquipment,
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
  const tile = async (x, y) => {
    const point = await page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect();
        return {
          x:
            r.x +
            (136 + x * 62 - Number(c.dataset.viewX)) * Number(c.dataset.scale),
          y:
            r.y +
            (28 + y * 60 - Number(c.dataset.viewY)) * Number(c.dataset.scale),
        };
      },
      { x, y },
    );
    await page.mouse.click(point.x, point.y);
  };
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
  const arrive = async (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
    await seed(s);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  const merchant = fresh();
  merchant.gold = 500;
  merchant.food = 50;
  await seed(merchant);
  await click("Visit Market square");
  await click("Buy 5 grain · 30 crowns");
  await click("Buy 5 grain · 30 crowns");
  assert.equal((await state()).cargo.grain, 10);
  assert.equal(
    await page
      .getByRole("button", { name: "Buy 5 grain · 30 crowns", exact: true })
      .isDisabled(),
    true,
  );
  await arrive(await state(), 6);
  await click("Visit Market square");
  await click("Sell 10 grain · 158 crowns");
  let s = await state();
  assert.equal(s.gold, 598);
  assert.equal(s.reputation.guild, 2);
  assert.equal(s.cargo.grain, 0);
  await page.screenshot({ path: "/tmp/pixel-regional-market.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: "/tmp/pixel-regional-market-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const gear = fresh();
  gear.gold = 1000;
  gear.renown = 5;
  await seed(gear);
  await click("Visit Blacksmith");
  await click("Buy Round shield · 24 crowns");
  await click("Buy Iron cap · 22 crowns");
  await click("Buy Iron greatsword · 58 crowns");
  await click("Equipment");
  await click("Equip Round shield");
  await click("Equip Iron cap");
  await click("Equip Iron greatsword");
  s = await state();
  assert.equal(s.party[0].equipment.shield, null);
  assert.ok(s.party[0].equipment.helmet);
  assert.equal(
    await page
      .getByRole("button", { name: "Equip Round shield", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel("Equipment companion").selectOption("1");
  await click("Equip Round shield");
  await page.reload();
  assert.ok((await state()).party[1].equipment.shield);
  const story = fresh();
  story.gold = 500;
  story.food = 50;
  await seed(story);
  await click("Visit Contract board");
  await click("Accept Salt on the road");
  await arrive(await state(), 2);
  await click("Investigate Salt on the road");
  assert.equal(
    await page
      .getByRole("button", {
        name: "Return the cargo to the League",
        exact: true,
      })
      .count(),
    1,
  );
  const time = (await state()).timeOfDay;
  await page.waitForTimeout(350);
  assert.equal((await state()).timeOfDay, time);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-story-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await click("Feed the refugees · 6 rations");
  assert.equal((await state()).food, 44);
  await arrive(await state(), 0);
  await page
    .locator("#panel")
    .getByRole("button", { name: "Claim story reward", exact: true })
    .click();
  s = await state();
  assert.equal(s.gold, 555);
  assert.equal(s.stories.road.status, "completed");
  assert.equal(s.reputation.freefolk, 8);
  await click("Company");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("Salt on the road"),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  s.renown = 5;
  await arrive(s, 3);
  await click("Visit Contract board");
  await click("Accept Whispering Grove oath");
  await arrive(await state(), 7);
  await click("Investigate Whispering Grove oath");
  await click("Defend the grove");
  await click("Fight for your chosen faction");
  s = await state();
  assert.equal(s.battle.enemies.length, 4);
  assert.equal(s.contract.phase, "battle");
  await page.screenshot({ path: "/tmp/pixel-terrain-battle.png" });
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { ...s.battle.enemies[0], hp: 1, x: 2, y: 1 };
  await seed(s);
  await tile(2, 1);
  s = await state();
  assert.equal(s.battle, null);
  assert.equal(s.contract.phase, "return");
  await arrive(s, 3);
  await page
    .locator("#panel")
    .getByRole("button", { name: "Claim story reward", exact: true })
    .click();
  s = await state();
  assert.equal(s.stories.grove.status, "completed");
  assert.ok(s.gear.some((g) => g.template === "pike-2"));
  assert.ok(s.reputation.freefolk >= 10);
  // Verify a free disengagement is exposed by a Scout hood, with its saved action cost.
  const combat = fresh();
  combat.location = 1;
  combat.position = { x: places[1].x, y: places[1].y };
  combat.contract = { name: "Test", target: 1, reward: 65 };
  const hood = grantEquipment(combat, "hood-2");
  equipEquipment(combat, hood, 0);
  startBattle(combat);
  combat.battle.units[0].x = 3;
  combat.battle.units[0].y = 1;
  combat.battle.enemies[0].x = 4;
  combat.battle.enemies[0].y = 1;
  await seed(combat);
  await click("Disengage · 0 valor");
  s = await state();
  assert.equal(s.battle.units[0].safeMove, true);
  assert.equal(s.battle.units[0].acted, true);
  const hp = s.party[0].hp;
  await tile(2, 1);
  s = await state();
  assert.equal(s.party[0].hp, hp);
  assert.equal(s.battle.units[0].moved, true);
  const caravan = fresh();
  const trader = caravan.patrols.find((p) => p.id === "caravan");
  caravan.location = -1;
  caravan.position = { x: trader.x, y: trader.y };
  caravan.gold = 250;
  await seed(caravan);
  await click("View caravan cargo");
  await click("Buy caravan grain · 9 crowns");
  s = await state();
  assert.equal(s.cargo.grain, 1);
  assert.equal(s.patrols.find((p) => p.id === "caravan").cargo.grain, 3);
  assert.deepEqual(errors, []);
  console.log(
    "Complete systems browser smoke passed: regional stock, profitable routes, shortages, four equipment slots, two-handed restrictions, story choices/rewards, mobile menus, faction battles, free disengagement, and save persistence.",
  );
} finally {
  await browser.close();
}
