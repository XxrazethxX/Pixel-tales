import assert from "node:assert/strict";
import {
  fresh,
  places,
  acceptMission,
  startMission,
  beginTravelConversation,
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
  };
  const arrive = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await enterGame(page);
  let s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  await seed(s);
  await close();
  await click("Enter Greyhaven");
  await click("Visit Contract board");
  await details("Tactical missions");
  await click("Accept mission: Hold the supply wagon");
  assert.equal((await state()).expedition.mission, "wagon-watch");
  s = await state();
  arrive(s, 12);
  await seed(s);
  await close();
  await click("Begin mission: Hold the supply wagon");
  assert.equal((await state()).battle.objective.kind, "defense");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-wagon-objective-mobile.png" });
  s = fresh();
  arrive(s, 3);
  acceptMission(s, "captive");
  arrive(s, 2);
  startMission(s);
  s.battle.layoutId = "legacy";
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.units[0], { x: 6, y: 3, acted: false });
  await seed(s);
  await close();
  await click("Free captive");
  assert.equal((await state()).battle.objective.rescuer, 0);
  s = await state();
  s.battle.units[0].x = 1;
  await seed(s);
  await close();
  await click("Extract captive");
  assert.ok((await state()).expedition.missionLedger.captive);
  s = fresh();
  s.party[2].level = 2;
  s.party[2].points = 1;
  await seed(s);
  await close();
  await click("Company");
  await details("Class careers");
  await click("Learn Tracker: Nell");
  assert.equal((await state()).party[2].career, "tracker");
  await details("Class careers");
  await page.screenshot({ path: "/tmp/pixel-class-careers-mobile.png" });
  s = fresh();
  s.location = -1;
  s.position = { x: 625, y: 335 };
  s.party[2].role = "Swordswoman";
  s.patrols.forEach((p) => (p.cleared = true));
  await seed(s);
  await close();
  assert.equal(
    await page
      .getByRole("button", { name: "Read Clawed footprints", exact: true })
      .isEnabled(),
    false,
  );
  await details("Unavailable actions");
  assert.ok(
    await page.getByText(/Requires a conscious Archer or Thief/).count(),
  );
  s = await state();
  s.party[0].profession = "Thief";
  await seed(s);
  await close();
  await click("Read Clawed footprints");
  assert.equal((await state()).expedition.clues.tracks.stage, 1);
  assert.equal((await state()).discovered.includes(14), false);
  await page.screenshot({ path: "/tmp/pixel-observation-trail-mobile.png" });
  s = fresh();
  beginTravelConversation(s);
  await seed(s);
  await close();
  await click("Dismiss their concerns");
  assert.equal((await state()).bonds["0:1"], -6);
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).bonds["0:1"], -6);
  s = fresh();
  s.gold = 1000;
  s.inventory.wood = 100;
  s.inventory.ore = 100;
  s.patrols.forEach((p) => (p.cleared = true));
  arrive(s, 15);
  await seed(s);
  await close();
  await details("Purchase Wayfarer property");
  await click("Buy farm · 320 crowns / 10 wood");
  assert.ok((await state()).expedition.home.owned);
  await click("Enter company home");
  await details("Improve the property");
  await click("Build Storehouse · 60 crowns / 8 wood / 2 ore");
  await details("Improve the property");
  await click("Build Permanent forge · 90 crowns / 6 wood / 6 ore");
  await details("Home stations");
  await page.getByLabel("Home smith", { exact: true }).selectOption("0");
  assert.equal((await state()).expedition.home.staff.smith, 0);
  await details("Store and withdraw supplies");
  await click("Store 5 food");
  assert.equal((await state()).expedition.home.stores.food, 5);
  await details("Store and withdraw supplies");
  await click("Withdraw 1 food");
  assert.equal((await state()).expedition.home.stores.food, 4);
  await page.screenshot({ path: "/tmp/pixel-company-home-mobile.png" });
  await click("Rest at home · 12 hours");
  await click("Leave company home");
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).expedition.home.stores.food, 2);
  assert.equal((await state()).expedition.home.upgrades.forge, 1);
  await close();
  await click("Company");
  assert.ok(
    await page.getByText(/Daily cost: 4 rations and 8 crowns/).isVisible(),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: board-only tactical mission and wagon objective, captive extraction, permanent class career, class-gated multi-stage observations and readable locks, persistent rivalry, purchased home and staffed forge, bounded reserve transfers, paid rest and reload, mobile menus and upkeep forecast; no browser errors.",
  );
} finally {
  await browser.close();
}
