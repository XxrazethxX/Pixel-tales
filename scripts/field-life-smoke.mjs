import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  autoFormation,
  battlePath,
  retreatBattle,
} from "../src/game.js";
import { enterGame, dismissReports, gameClick } from "./smoke-menu.mjs";
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
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const rich = () => {
    const s = fresh();
    s.gold = 700;
    s.food = 200;
    s.inventory.wood = 90;
    s.inventory.herbs = 30;
    s.patrols.forEach((p) => (p.cleared = true));
    return s;
  };
  const seed = async (s) => {
    await dismissReports(page);
    const menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
    await page.waitForFunction(() => document.body.dataset.gameArt === "ready");
  };
  const click = (name) => gameClick(page, name),
    state = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
  const tile = async (x, y, hover = false) => {
    const point = await page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect(),
          scale = Number(c.dataset.scale);
        return {
          x: r.left + (136 + x * 62 - Number(c.dataset.viewX)) * scale,
          y: r.top + (28 + y * 60 - Number(c.dataset.viewY)) * scale,
        };
      },
      { x, y },
    );
    if (hover) await page.mouse.move(point.x, point.y);
    else await page.mouse.click(point.x, point.y);
  };
  await seed(rich());
  await click("Company");
  await click("Arrange shields forward and ranged companions behind");
  assert.equal((await state()).fieldLife.deployment[1].x, 2);
  await click("Move Nell forward");
  assert.deepEqual((await state()).fieldLife.order, [0, 2, 1, 3]);
  await page
    .getByRole("combobox", { name: "Deployment for Mara" })
    .selectOption("2,0");
  assert.equal((await state()).fieldLife.deployment[0].y, 0);
  await page.screenshot({ path: "docs/screenshots/field-life-formation.png" });
  await click("Close panel");
  await page.getByRole("combobox", { name: "Travel speed" }).selectOption("3");
  assert.equal((await state()).fieldLife.speed, 3);
  await click("Pause travel");
  assert.ok((await state()).fieldLife.paused);
  await click("Resume travel");
  assert.equal((await state()).fieldLife.paused, false);
  // Threats pause the simulated world before advancing into an encounter.
  let s = rich();
  s.location = -1;
  s.position = { x: 330, y: 380 };
  const bandit = s.patrols.find((p) => p.kind === "bandits");
  bandit.cleared = false;
  bandit.x = 420;
  bandit.y = 380;
  await seed(s);
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem("pixel-tales")).fieldLife.paused,
  );
  await page.screenshot({ path: "docs/screenshots/field-life-travel.png" });
  s = rich();
  s.location = -1;
  s.position = { x: 330, y: 380 };
  s.destination = { x: 800, y: 380 };
  await seed(s);
  // Saved routes intentionally stop on load; issue a real map movement order.
  const walkPoint = await page.locator("#map").evaluate((c) => {
    const r = c.getBoundingClientRect(),
      scale = Number(c.dataset.scale);
    return {
      x: r.left + (430 - Number(c.dataset.viewX)) * scale,
      y: r.top + (380 - Number(c.dataset.viewY)) * scale,
    };
  });
  await page.mouse.click(walkPoint.x, walkPoint.y);
  await click("Pause travel");
  const stopped = await state();
  assert.ok(stopped.destination);
  await page.waitForTimeout(300);
  assert.deepEqual((await state()).position, stopped.position);
  await click("Resume travel");
  await page.waitForTimeout(250);
  assert.ok((await state()).position.x > stopped.position.x);
  // Real clickable interiors preserve the existing buy/hire/repair services.
  await seed(rich());
  await click("Visit Blacksmith");
  await page.locator(".village-interior").waitFor();
  const forgePoint = await page.locator("#map").evaluate((c) => {
    const r = c.getBoundingClientRect(),
      scale = Number(c.dataset.scale);
    return {
      x: r.left + (100 - Number(c.dataset.viewX)) * scale,
      y: r.top + (135 - Number(c.dataset.viewY)) * scale,
    };
  });
  const villagePosition = (await state()).position;
  await page.mouse.click(forgePoint.x, forgePoint.y);
  assert.deepEqual((await state()).position, villagePosition);
  assert.match(
    await page.locator(".room-hint").textContent(),
    /smith sells gear/,
  );
  await page.screenshot({ path: "docs/screenshots/field-life-smith.png" });
  await click("Back to village");
  await click("Visit The Crooked Lantern");
  await click("Inspect Innkeeper and beds");
  assert.match(await page.locator(".room-hint").textContent(), /lodging/);
  await page.screenshot({ path: "docs/screenshots/field-life-tavern.png" });
  s = rich();
  s.location = 6;
  s.position = { x: places[6].x, y: places[6].y };
  await seed(s);
  await click("Enter academy interior");
  await click("Inspect Grimoire shelves");
  assert.match(await page.locator(".room-hint").textContent(), /grimoires/);
  await page.screenshot({ path: "docs/screenshots/field-life-academy.png" });
  // Saved procedural battle, route preview, facing arrows and explicit attack confirmation.
  s = rich();
  const patrol = s.patrols.find((p) => p.id === "caravan");
  patrol.cleared = false;
  s.location = -1;
  s.position = { x: patrol.x, y: patrol.y };
  autoFormation(s);
  startBattle(s, patrol.id);
  await seed(s);
  const battle = (await state()).battle;
  const u = battle.units.find((u) => u.id === 0);
  let target;
  for (let y = 0; y < 7 && !target; y++)
    for (let x = 0; x < 3 && !target; x++)
      if (battlePath(s, u, x, y)?.length) target = { x, y };
  await tile(u.x, u.y);
  await tile(target.x, target.y, true);
  assert.match(
    await page.locator("#combat-route-preview").textContent(),
    /Move/,
  );
  await page.screenshot({ path: "docs/screenshots/field-life-battle.png" });
  // A small fixed-layout duel makes damage/confirmation/death checks deterministic.
  s = rich();
  s.location = 1;
  s.position = { x: places[1].x, y: places[1].y };
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  delete s.battle.fieldSeed;
  s.battle.units[0].x = 1;
  s.battle.units[0].y = 1;
  s.battle.enemies[0].x = 2;
  s.battle.enemies[0].y = 1;
  s.battle.enemies[0].hp = 1;
  s.battle.enemies[1].hp = 100;
  s.battle.enemies[1].max = 100;
  await seed(s);
  await tile(2, 1, true);
  assert.match(
    await page.locator("#combat-route-preview").textContent(),
    /damage/,
  );
  await tile(2, 1);
  assert.equal((await state()).battle.enemies[0].hp, 1);
  await click("Confirm combat action");
  assert.equal((await state()).battle.enemies[0].hp, 0);
  await page.waitForTimeout(180);
  await page.screenshot({ path: "docs/screenshots/field-life-attack.png" });
  // Camp routines animate and original real drag placement remains covered by fieldwork smoke.
  s = rich();
  s.campUpgrades = {
    tents: 2,
    forge: 1,
    cookpot: 1,
    infirmary: 1,
    watchpost: 1,
  };
  s.party[0].profession = "Cook";
  s.campJobs = { cook: 0, guard: 1 };
  s.party[2].fatigue = 75;
  await seed(s);
  await click("Make camp");
  await page.locator("#drawer").evaluate((e) => (e.hidden = true));
  const before = await page.locator("#map").evaluate((c) => c.toDataURL());
  await page.waitForTimeout(950);
  assert.notEqual(
    await page.locator("#map").evaluate((c) => c.toDataURL()),
    before,
  );
  await page.screenshot({ path: "docs/screenshots/field-life-camp.png" });
  s = rich();
  s.location = 1;
  s.position = { x: places[1].x, y: places[1].y };
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  retreatBattle(s);
  await seed(s);
  await dismissReports(page);
  const beforeRecovery = (await state()).food;
  await click("Recover abandoned supplies");
  assert.equal((await state()).food, beforeRecovery + 6);
  await dismissReports(page);
  s = rich();
  s.party[1].hp = 0;
  s.inventory.medicine = 1;
  await seed(s);
  await click("Company");
  await click("Stabilize Osric · 1 medicine, 2h");
  assert.ok((await state()).party[1].hp > 0);
  await dismissReports(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#drawer").evaluate((e) => (e.scrollTop = 0));
  await page.screenshot({ path: "docs/screenshots/field-life-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: formations and saved order, travel speed/pause/threat safety, interactive smith/tavern/academy, procedural battlefield route previews, attack confirmation and falling enemies, animated camp routines, emergency treatment and mobile layout; no browser errors.",
  );
} finally {
  await browser.close();
}
