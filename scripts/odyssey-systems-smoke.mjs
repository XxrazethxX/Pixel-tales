import assert from "node:assert/strict";
import {
  fresh,
  places,
  checkRegionalTravel,
  startBattle,
  refreshSurrender,
  grantEquipment,
  equipEquipment,
  continueCompanion,
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
  const details = async (label) => {
    const el = page.locator("summary").filter({ hasText: label }).first();
    if (!(await el.evaluate((el) => el.parentElement.open))) await el.click();
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
    if (s.campOpen) {
      await close();
      await click("Make camp");
    }
  };
  const arrive = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
    s.destination = null;
    s.patrols.forEach((p) => (p.cleared = true));
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await enterGame(page);
  let s = fresh();
  s.location = -1;
  s.position = { x: 1220, y: 80 };
  checkRegionalTravel(s, 650);
  await seed(s);
  await close();
  assert.ok(
    await page
      .getByText("A scree fall blocks the mountain approach.", { exact: true })
      .isVisible(),
  );
  await click("Find a route with a specialist · 1 hour");
  assert.equal((await state()).knowledge, 1);
  await click("Company");
  await details("Regions ·");
  assert.ok(await page.getByText(/Whispering Wilds.*Pale roots/).isVisible());
  await page.screenshot({ path: "/tmp/pixel-regional-atlas.png" });
  s = fresh();
  await seed(s);
  await close();
  await click("Enter Greyhaven");
  await click("Buy harvest bundle · 18 crowns / 12 rations");
  assert.equal((await state()).food, 36);
  await page.setViewportSize({ width: 390, height: 844 });
  s = fresh();
  s.gold = 500;
  s.food = 100;
  s.inventory.ore = 10;
  s.party[0].personalQuest = { stage: 3, outcome: "shared" };
  s.bonds["0:1"] = 12;
  s.campOpen = true;
  await seed(s);
  if (!s.campOpen) await close();
  await click("Company");
  await details("Companion continuations");
  await click("Begin Mara's follow-up");
  assert.equal((await state()).odyssey.journeys[0].stage, 1);
  s = await state();
  s.campOpen = false;
  arrive(s, 0);
  await seed(s);
  await close();
  await click("Enter Greyhaven");
  await click("Hear testimony for Mara");
  assert.equal((await state()).odyssey.journeys[0].stage, 2);
  s = await state();
  arrive(s, 5);
  await seed(s);
  await close();
  await click("Recover evidence for Mara");
  assert.equal((await state()).odyssey.journeys[0].stage, 3);
  s = await state();
  s.campOpen = true;
  await seed(s);
  if (!s.campOpen) await close();
  await click("Company");
  await details("Companion continuations");
  await click("Swear an oath with Mara");
  assert.equal((await state()).odyssey.journeys[0].outcome, "swear");
  await details("Companion continuations");
  await page.screenshot({ path: "/tmp/pixel-companion-oath-mobile.png" });
  s = await state();
  s.campOpen = false;
  arrive(s, 1);
  s.contract = { name: "Road threat", target: 1, tier: 1, reward: 40 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  Object.assign(s.battle.enemies[0], { hp: 60, max: 60, x: 2, y: 1 });
  await seed(s);
  await close();
  await details("Personal technique · oathstrike");
  await click("Use oathstrike on raider 1");
  assert.equal((await state()).battle.units[0].questUsed, true);
  s = fresh();
  s.gold = 200;
  s.food = 50;
  arrive(s, 1);
  s.contract = { name: "Road threat", target: 1, tier: 1, reward: 40 };
  startBattle(s);
  s.battle.turn = 2;
  s.battle.enemies.forEach((e, i) => (e.hp = i === 0 ? 6 : 0));
  refreshSurrender(s);
  await seed(s);
  await close();
  await details("Enemy surrender");
  await page.screenshot({ path: "/tmp/pixel-enemy-surrender-mobile.png" });
  await click("Take prisoner: raider 1");
  assert.equal((await state()).odyssey.prisoners.length, 1);
  assert.equal((await state()).battle, null);
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).odyssey.prisoners.length, 1);
  s = await state();
  arrive(s, 3);
  await seed(s);
  await close();
  await click("Enter Saltbridge");
  await details("Prisoners ·");
  await click("Deliver Bram the captive for bounty · 30 crowns");
  assert.equal((await state()).odyssey.prisoners.length, 0);
  s = fresh();
  s.gold = 200;
  s.food = 50;
  s.campOpen = true;
  s.odyssey.serial = 1;
  s.odyssey.prisoners = [
    {
      id: 1,
      name: "Hale the captive",
      kind: "archer",
      day: 1,
      trust: 0,
      unfed: 0,
    },
  ];
  await seed(s);
  await click("Rest until dawn");
  assert.equal((await state()).odyssey.prisoners[0].trust, 1);
  await click("Rest until dawn");
  assert.equal((await state()).odyssey.prisoners[0].trust, 2);
  await details("Prisoners ·");
  await click("Recruit Hale the captive · 60 crowns");
  assert.equal((await state()).party.at(-1).role, "Archer");
  assert.equal((await state()).party.at(-1).profession, "Thief");
  s = fresh();
  s.knowledge = 2;
  s.inventory.ore = 4;
  arrive(s, 9);
  await seed(s);
  await close();
  await click("Recover Winterglass pike");
  assert.ok((await state()).gear.some((g) => g.template === "winter-pike"));
  await click("Equipment");
  await page
    .getByLabel("Equipment companion", { exact: true })
    .selectOption("3");
  assert.ok(await page.getByText(/Gain: Basic attacks root/).isVisible());
  await page.screenshot({ path: "/tmp/pixel-equipment-comparison-mobile.png" });
  await click("Equip Winterglass pike");
  assert.ok((await state()).party[3].equipment.weapon);
  s = await state();
  s.campOpen = false;
  arrive(s, 6);
  s.gold = 200;
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.party[0].spellSpent = { 1: 0, 2: 0 };
  await seed(s);
  await close();
  await click("Enter Emberfall");
  await details("Academy gates");
  await click("Arcane passage to Greyhaven");
  assert.equal((await state()).location, 0);
  assert.equal((await state()).party[0].spellSpent[2], 1);
  // Inspect the actual regional scenery and equipped world avatars at desktop scale.
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [id, name] of [
    [0, "farmlands"],
    [7, "haunted-wilds"],
    [9, "mountain-passes"],
    [6, "emberfall-city"],
  ]) {
    s = fresh();
    arrive(s, id);
    s.discovered = places.map((_, i) => i);
    s.charted = Array.from({ length: 336 }, (_, i) => i);
    const sword = grantEquipment(s, "spellbreaker"),
      helmet = grantEquipment(s, "grove-helmet"),
      shield = grantEquipment(s, "shield-2"),
      bow = grantEquipment(s, "horizon-bow"),
      pike = grantEquipment(s, "winter-pike");
    equipEquipment(s, sword, 0);
    equipEquipment(s, helmet, 0);
    equipEquipment(s, shield, 1);
    equipEquipment(s, bow, 2);
    equipEquipment(s, pike, 3);
    await seed(s);
    await close();
    await page.screenshot({ path: `/tmp/pixel-${name}.png` });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: regional hazards and atlas, village services, complete companion continuation and real personal battle technique, surrender/capture/reload/bounty, prisoner recruitment, finite relic and equipment comparison, paid arcane travel on desktop/mobile; no browser errors.",
  );
} finally {
  await browser.close();
}
