import assert from "node:assert/strict";
import {
  fresh,
  places,
  enterDungeon,
  startBattle,
  inflictWound,
  grantEquipment,
  equipEquipment,
  campFurniturePoint,
} from "../src/game.js";
import { enterGame, dismissReports } from "./smoke-menu.mjs";
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
    await dismissReports(page);
    const titleContinue = page.getByRole("button", {
        name: "Continue",
        exact: true,
      }),
      menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (!(await titleContinue.isVisible()) && (await menu.isVisible()))
      await menu.click();
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
  const rich = () => {
    const s = fresh();
    s.gold = 500;
    s.food = 200;
    s.knowledge = 20;
    s.renown = 5;
    s.inventory.wood = 80;
    s.inventory.ore = 80;
    s.inventory.herbs = 80;
    for (const p of s.patrols) p.cleared = true;
    return s;
  };
  const at = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
    if (!s.discovered.includes(id)) s.discovered.push(id);
  };
  const point = async (x, y) =>
    page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect(),
          scale = Number(c.dataset.scale);
        return {
          x: r.left + (x - Number(c.dataset.viewX)) * scale,
          y: r.top + (y - Number(c.dataset.viewY)) * scale,
        };
      },
      { x, y },
    );
  const tile = async (x, y) => {
    const p = await point(136 + x * 62, 28 + y * 60);
    await page.mouse.click(p.x, p.y);
  };
  const summary = async (text) => {
    const el = page.locator("summary").filter({ hasText: text }).first();
    if (!(await el.evaluate((e) => e.parentElement.open))) await el.click();
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const company = rich();
  await seed(company);
  await close();
  await click("Company");
  await click("Unlock company standard");
  assert.equal((await state()).fieldwork.bannerBearer, null);
  await page
    .getByLabel("Designated flag bearer", { exact: true })
    .selectOption("2");
  assert.equal((await state()).fieldwork.bannerBearer, 2);
  await close();
  await page.screenshot({ path: "docs/screenshots/fieldwork-standard.png" });
  const travel = rich();
  travel.location = -1;
  travel.position = { x: 650, y: 550 };
  await seed(travel);
  await close();
  const before = (await state()).position;
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowRight");
  assert.ok((await state()).position.x > before.x);
  const y = (await state()).position.y;
  await page.keyboard.down("w");
  await page.waitForTimeout(250);
  await page.keyboard.up("w");
  assert.ok((await state()).position.y < y);
  const camp = rich();
  camp.campOpen = true;
  camp.party.push({ ...camp.party[0], id: 4, name: "Elin" });
  camp.wagon.owned = true;
  camp.cargo.grain = 9;
  camp.cargo.iron = 7;
  await seed(camp);
  assert.ok(
    await page.getByRole("navigation", { name: "Camp categories" }).isVisible(),
  );
  await click("Build");
  assert.ok(await page.getByText(/5\/4 sleeping spaces/).isVisible());
  await click("Build Shared table");
  let p = await point(382, 153);
  await page.mouse.move(p.x - 40, p.y - 35);
  await page.mouse.down();
  await page.mouse.move(p.x, p.y, { steps: 6 });
  await page.mouse.up();
  assert.deepEqual((await state()).fieldwork.campPositions.table, {
    x: 365,
    y: 140,
  });
  const start = await point(382, 153),
    end = await point(417, 163);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 6 });
  await page.mouse.up();
  assert.deepEqual((await state()).fieldwork.campPositions.table, {
    x: 400,
    y: 150,
  });
  await click("Return to camp menu");
  await click("Expand camp · capacity 6");
  assert.equal((await state()).fieldwork.campSize, 1);
  await click("Wagon");
  await summary("Wagon hold");
  assert.equal(await page.locator(".cargo-cell.occupied").count(), 16);
  assert.equal(await page.locator(".cargo-cell").count(), 30);
  await click("Build");
  await page.screenshot({ path: "docs/screenshots/fieldwork-camp-build.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/screenshots/fieldwork-camp-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const dungeon = rich();
  at(dungeon, 4);
  assert.ok(enterDungeon(dungeon));
  await seed(dungeon);
  await close();
  assert.equal(await page.locator(".dungeon-grid:visible").count(), 0);
  await tile(1, 5);
  assert.equal((await state()).event.x, 1);
  await page.keyboard.press("ArrowUp");
  assert.equal((await state()).event.y, 4);
  await page.keyboard.press("w");
  await page.keyboard.press("w");
  await page.keyboard.press("w");
  assert.equal((await state()).event.y, 1);
  const ore = (await state()).inventory.ore;
  await tile(1, 1);
  assert.ok((await state()).inventory.ore > ore);
  await page.screenshot({ path: "docs/screenshots/fieldwork-dungeon.png" });
  await summary("Dungeon actions");
  await click("Leave dungeon");
  await page.getByRole("dialog", { name: "After-action report" }).waitFor();
  assert.ok(await page.getByText(/ore/, { exact: false }).count());
  await click("Continue adventure");
  assert.equal((await state()).fieldwork.report, null);
  const door = rich();
  at(door, 4);
  door.party[0].role = "Wizard";
  door.party[0].level = 4;
  enterDungeon(door);
  door.event.x = 4;
  door.event.y = 2;
  await seed(door);
  await close();
  await tile(4, 3);
  assert.ok(
    await page
      .getByRole("button", {
        name: "Dissolve seal · level 1 spell slot",
        exact: true,
      })
      .isVisible(),
  );
  await click("Dissolve seal · level 1 spell slot");
  await tile(4, 3);
  assert.ok((await state()).realm.dungeons[4].cache);
  await click("Leave dungeon");
  await click("Continue adventure");
  const lodge = rich();
  at(lodge, 16);
  lodge.food = 0;
  lodge.party[0].hp = 5;
  await seed(lodge);
  await close();
  await click("Rest at secure lodge");
  await page.getByRole("dialog", { name: "After-action report" }).waitFor();
  assert.equal((await state()).hungerDays, 0);
  assert.equal((await state()).party[0].hp, (await state()).party[0].max);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/fieldwork-report-mobile.png",
  });
  await click("Continue adventure");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const battle = rich(),
    merchant = battle.patrols.find((p) => p.id === "caravan");
  merchant.cleared = false;
  battle.position = { x: merchant.x, y: merchant.y };
  const sword = grantEquipment(battle, "sword-1");
  equipEquipment(battle, sword, 0);
  startBattle(battle, merchant.id);
  battle.party[0].hp -= 10;
  inflictWound(battle, 0, "sprain");
  for (const e of battle.battle.enemies) e.hp = 0;
  Object.assign(battle.battle.enemies[0], { hp: 1, x: 2, y: 1, armor: 0 });
  Object.assign(battle.battle.units[0], { x: 1, y: 1 });
  await seed(battle);
  await tile(2, 1);
  await click("Confirm combat action");
  await page.getByRole("dialog", { name: "After-action report" }).waitFor();
  assert.ok(
    await page
      .getByRole("dialog", { name: "After-action report" })
      .getByText(/Sprained leg/)
      .isVisible(),
  );
  assert.ok(await page.getByText(/condition/, { exact: false }).count());
  await page.screenshot({ path: "docs/screenshots/fieldwork-report.png" });
  const reportBox = await page
      .getByRole("dialog", { name: "After-action report" })
      .boundingBox(),
    headingBox = await page
      .getByRole("heading", { name: "After-action report", exact: true })
      .boundingBox();
  assert.ok(
    headingBox.y >= reportBox.y &&
      headingBox.y + headingBox.height <= reportBox.y + reportBox.height,
    "Report heading must remain in view",
  );
  const saved = await state();
  await page.reload();
  await enterGame(page);
  await page.getByRole("dialog", { name: "After-action report" }).waitFor();
  assert.equal((await state()).fieldwork.report.id, saved.fieldwork.report.id);
  await click("Continue adventure");
  const ambush = rich(),
    bandit = ambush.patrols.find((p) => p.id === "knives");
  bandit.cleared = false;
  bandit.x = 350;
  bandit.y = 145;
  ambush.location = 1;
  ambush.position = { x: 350, y: 145 };
  await seed(ambush);
  await close();
  await click(`Ambush ${bandit.name}`);
  assert.ok((await state()).battle.openingAmbush);
  await page.getByRole("button", { name: /^Finish ambush/ }).click();
  assert.equal((await state()).battle.openingAmbush, false);
  const village = rich();
  await seed(village);
  await close();
  await click("Enter Greyhaven");
  assert.ok(
    await page
      .getByRole("button", { name: "Visit Market square", exact: true })
      .isVisible(),
  );
  assert.equal(
    await page
      .getByRole("button", {
        name: "Repair village · 20 crowns, 3 timber, 2h",
        exact: true,
      })
      .isVisible(),
    false,
  );
  await summary("Village affairs");
  assert.ok(
    await page
      .getByRole("button", {
        name: "Repair village · 20 crowns, 3 timber, 2h",
        exact: true,
      })
      .isVisible(),
  );
  await page.screenshot({ path: "docs/screenshots/fieldwork-village.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: flag unlock/bearer, keyboard travel, organized camps/villages, real drag construction and relocation, camp expansion, fitted wagon cargo, direct dungeon tiles/keys/door/cache, secure lodging, combat/event reports and reload, natural ambush, desktop/mobile; no browser errors.",
  );
} finally {
  await browser.close();
}
