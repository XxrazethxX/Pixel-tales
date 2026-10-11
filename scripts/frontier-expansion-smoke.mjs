import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  beginCaravanRaid,
  spendHours,
  updateRoadConflicts,
  acceptCaravanEscort,
} from "../src/game.js";
import { enterGame } from "./smoke-menu.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
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
  const close = async () => {
    const b = page.getByRole("button", { name: "Close panel", exact: true });
    if (await b.isVisible()) await b.click();
  };
  const seed = async (s) => {
    const menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
  };
  const arrive = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
  };
  const near = (s, id) => {
    const p = s.patrols.find((p) => p.id === id);
    s.position = { x: p.x, y: p.y };
    s.location = -1;
    return p;
  };
  const mobile = async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  };
  const battle = (s, family) => {
    const p = s.patrols.find((p) => p.enemyFamily === family);
    near(s, p.id);
    startBattle(s, p.id);
    s.battle.layoutId = "legacy";
    return s;
  };
  const clearBattle = async () => {
    const s = await state();
    s.battle.enemies.forEach((e) => (e.hp = 0));
    Object.assign(s.battle.enemies[0], { hp: 1, x: 2, y: 1 });
    Object.assign(s.battle.units[0], { x: 1, y: 1, acted: false });
    await seed(s);
    await page
      .locator("summary")
      .filter({ hasText: /^Target previews$/ })
      .click();
    await page.getByRole("button", { name: /^raider: Attack:/ }).click();
    assert.equal((await state()).battle, null);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const noScout = fresh();
  noScout.party[2].role = "Swordswoman";
  noScout.location = -1;
  noScout.position = { x: 400, y: 350 };
  await seed(noScout);
  await close();
  assert.ok(
    await page
      .getByRole("button", { name: "Scout surroundings · 1 hour", exact: true })
      .isDisabled(),
  );
  await click("Company");
  await page
    .getByLabel("Profession for Mara", { exact: true })
    .selectOption("Thief");
  await close();
  assert.ok(
    await page
      .getByRole("button", { name: "Scout surroundings · 1 hour", exact: true })
      .isEnabled(),
  );
  const wagon = fresh();
  wagon.gold = 650;
  wagon.inventory.wood = 30;
  wagon.inventory.ore = 30;
  await seed(wagon);
  assert.ok(
    await page
      .getByRole("button", {
        name: "Buy company wagon · 250 crowns",
        exact: true,
      })
      .isVisible(),
  );
  await click("Buy company wagon · 250 crowns");
  assert.equal((await state()).wagon.owned, true);
  await click("Company");
  await page
    .getByLabel("Quartermaster travel duty", { exact: true })
    .selectOption("0");
  await page
    .getByLabel("Rear guard travel duty", { exact: true })
    .selectOption("1");
  await page.getByLabel("Scout travel duty", { exact: true }).selectOption("2");
  await close();
  await click("Make camp");
  await click("Build Cargo racks · 50 crowns / 5 wood / 1 ore");
  await click("Build Portable workbench · 70 crowns / 4 wood / 3 ore");
  await click("Build Reinforced rails · 60 crowns / 4 wood / 4 ore");
  await page.getByLabel("Camp smith", { exact: true }).selectOption("0");
  await mobile();
  await page.screenshot({ path: "/tmp/pixel-company-wagon-mobile.png" });
  assert.equal((await state()).wagon.storage, 1);
  assert.equal((await state()).campJobs.smith, 0);
  const covert = await state();
  covert.campOpen = false;
  arrive(covert, 12);
  covert.patrols.forEach((p) => (p.cleared = true));
  covert.stealth = { active: true, concealment: 100 };
  await seed(covert);
  await close();
  await click("Scout Briarhide · 1 hour");
  await page
    .getByText("Stronghold scouting & infiltration", { exact: true })
    .click();
  await click("Steal stronghold supplies");
  await page
    .getByText("Stronghold scouting & infiltration", { exact: true })
    .click();
  await click("Rescue captive Edda");
  let intel = await state();
  assert.equal(intel.party.at(-1).profession, "Thief");
  intel.stealth.concealment = 100;
  await seed(intel);
  await page
    .getByText("Stronghold scouting & infiltration", { exact: true })
    .click();
  await click("Sabotage stores · 2 ore");
  await page
    .getByText("Stronghold scouting & infiltration", { exact: true })
    .click();
  await click("Open drainage entrance");
  await page
    .getByText("Stronghold scouting & infiltration", { exact: true })
    .click();
  await page.screenshot({ path: "/tmp/pixel-infiltration-mobile.png" });
  await click("Explore dungeon");
  assert.equal((await state()).event.x, 6);
  assert.equal((await state()).event.y, 4);
  const escort = fresh();
  await seed(escort);
  await click("Visit Contract board");
  await click("Escort Golden Sheaf wagon · 80 crowns");
  assert.equal((await state()).caravanEscort.patrolId, "wheat-caravan");
  let arrived = await state();
  arrive(arrived, 3);
  await seed(arrived);
  await click("Collect caravan escort payment");
  assert.equal((await state()).gold, 200);
  const road = fresh(),
    merchant = road.patrols.find((p) => p.id === "wheat-caravan"),
    bandit = road.patrols.find((p) => p.id === "knives");
  bandit.x = merchant.x + 30;
  bandit.y = merchant.y;
  beginCaravanRaid(road, merchant.id, bandit.id);
  road.position = { x: merchant.x + 50, y: merchant.y };
  road.location = -1;
  await seed(road);
  await page
    .getByRole("button", { name: "Defend the caravan", exact: true })
    .waitFor();
  await page.screenshot({ path: "/tmp/pixel-caravan-defense-mobile.png" });
  await click("Demand 15 crowns, then defend");
  assert.equal((await state()).gold, 135);
  assert.equal((await state()).battle.caravanDefense, "wheat-caravan");
  await clearBattle();
  assert.equal(
    (await state()).patrols.find((p) => p.id === "wheat-caravan").raid,
    null,
  );
  const wreck = fresh(),
    a = wreck.patrols.find((p) => p.id === "armor-caravan"),
    b = wreck.patrols.find((p) => p.id === "knives");
  b.x = a.x + 30;
  b.y = a.y;
  beginCaravanRaid(wreck, a.id, b.id);
  spendHours(wreck, 3);
  updateRoadConflicts(wreck);
  wreck.position = { x: a.x, y: a.y };
  wreck.location = -1;
  b.cleared = true;
  await seed(wreck);
  await click("Search wreck: Ironbound armory wagon");
  assert.ok((await state()).gear.some((g) => g.template === "armor-1"));
  const mage = battle(fresh(), "mage");
  mage.battle.units = [mage.battle.units[0]];
  Object.assign(mage.battle.units[0], { x: 4, y: 2 });
  Object.assign(mage.battle.enemies[0], { x: 7, y: 2 });
  mage.battle.enemies[1].hp = 0;
  mage.battle.enemies[2].hp = 0;
  await seed(mage);
  await click("End round 1");
  assert.equal((await state()).battle.enemies[0].mana, 1);
  assert.ok((await state()).battle.enemies[0].casting);
  await page.screenshot({ path: "/tmp/pixel-enemy-spellcaster-mobile.png" });
  const goblin = battle(fresh(), "goblin");
  Object.assign(goblin.battle.units[2], { x: 5, y: 2 });
  await seed(goblin);
  await click("End round 1");
  const trap = (await state()).battle.traps[0];
  await click("Nell");
  await click(`Disarm snare ${trap.x + 1},${trap.y + 1}`);
  assert.ok((await state()).battle.traps[0].used);
  const schools = fresh();
  schools.party[0].role = "Wizard";
  schools.party[0].level = 3;
  schools.party[0].points = 2;
  schools.inventory.herbs = 10;
  schools.inventory.ore = 10;
  await seed(schools);
  await click("Company");
  await click("Learn Illusionist · 1 point");
  assert.equal((await state()).party[0].spellSchool, "illusion");
  await page.screenshot({ path: "/tmp/pixel-magic-specialization-mobile.png" });
  const phantom = await state();
  battle(phantom, "mage");
  Object.assign(phantom.battle.enemies[0], { x: 3, y: 1 });
  await seed(phantom);
  await page.getByText(/^Spells · level 1/).click();
  await click("Prepare Phantom whisper · level 1 slot");
  await click("Cast Phantom whisper on Rogue spellbinder");
  assert.equal((await state()).battle.enemies[0].distracted, 2);
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).party[0].spellSchool, "illusion");
  assert.equal((await state()).battle.enemies[0].distracted, 2);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: class and Thief scouting gates, purchased wagon and staffed upgrades, travel duties, stronghold scouting and four infiltration consequences, issuer-only caravan escorts and payment, defended raids and persistent wreck loot, enemy spell slots and telegraphs, goblin snare disarming, permanent magical schools and enemy-targeted illusions on mobile.",
  );
} finally {
  await browser.close();
}
