import assert from "node:assert/strict";
import { fresh, places, startBattle } from "../src/game.js";
import {
  enterGame,
  gameClick,
  dismissReports,
  openDetails,
} from "./smoke-menu.mjs";
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
  const click = (name) => gameClick(page, name);
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
  const close = async () => {
    await dismissReports(page);
    const b = page.getByRole("button", { name: "Close panel", exact: true });
    if (await b.isVisible()) await b.click();
  };
  const details = (name) => openDetails(page, name);
  const seed = async (s) => {
    await dismissReports(page);
    const titleContinue = page.getByRole("button", {
        name: "Continue",
        exact: true,
      }),
      menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (!(await titleContinue.isVisible()) && (await menu.isVisible()))
      await menu.click();
    await dismissReports(page);
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
  const base = (role) => {
    const s = fresh();
    s.gold = 500;
    s.food = 200;
    s.knowledge = 10;
    s.inventory.herbs = 30;
    s.inventory.ore = 20;
    Object.assign(s.party[0], {
      role,
      level: 4,
      preparedSpells: null,
      knownSpells: [],
      spellSpent: { 1: 0, 2: 0 },
    });
    for (const p of s.patrols) p.cleared = true;
    return s;
  };
  const site = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
    s.discovered.push(id);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await click("New Company");
  for (const [i, role] of ["Rogue", "Druid", "Paladin", "Wizard"].entries())
    await page
      .getByLabel(`Founder ${i + 1} class`, { exact: true })
      .selectOption(role);
  await click("Begin adventure");
  await page.waitForTimeout(850);
  assert.deepEqual(
    (await state()).party.map((p) => p.role),
    ["Rogue", "Druid", "Paladin", "Wizard"],
  );
  const camp = base("Wizard");
  camp.campOpen = true;
  camp.party[0].preparedSpells = ["aether", "veil", "cinder"];
  camp.party[0].spellSpent[1] = 1;
  camp.arcana.grimoires.prism = 1;
  await seed(camp);
  await click(`Study Prism codex: ${camp.party[0].name} · 2 knowledge, 4h`);
  await page
    .getByLabel(`Prepare Cinder bloom: ${camp.party[0].name}`, { exact: true })
    .uncheck();
  await page
    .getByLabel(`Prepare Lantern of secrets: ${camp.party[0].name}`, {
      exact: true,
    })
    .check();
  await page
    .getByLabel(`Prepare Prismatic mantle: ${camp.party[0].name}`, {
      exact: true,
    })
    .check();
  await click(`Prepare spells: ${camp.party[0].name} · 1h`);
  await page.waitForTimeout(850);
  assert.ok((await state()).party[0].preparedSpells.includes("mirror-ward"));
  assert.equal((await state()).party[0].spellSpent[1], 1);
  await page.screenshot({ path: "docs/screenshots/arcana-camp.png" });
  const city = base("Wizard");
  site(city, 6);
  await seed(city);
  await close();
  const enter = page.getByRole("button", {
    name: "Enter Emberfall",
    exact: true,
  });
  if (await enter.count()) await enter.click();
  else await click("Town");
  await click("Buy Prism codex · 65 crowns");
  await click("Academy reagents · 24 crowns, 1h");
  await click(`Academy tuition: ${city.party[0].name} · 35 crowns, 3h`);
  await page.waitForTimeout(850);
  assert.equal((await state()).arcana.grimoires.prism, 1);
  assert.equal((await state()).gold, 376);
  await page.screenshot({ path: "docs/screenshots/arcana-academy.png" });
  const reveal = base("Wizard");
  site(reveal, 2);
  reveal.party[0].preparedSpells = ["reveal", "aether", "waystep"];
  await seed(reveal);
  await close();
  await details("Exploration magic");
  await click(`Lantern of secrets: ${reveal.party[0].name} · level 1, 1h`);
  await click("Enter unveiled passage");
  await click("Search hidden chamber · 2h");
  await click("Take 18 gold");
  await page.waitForTimeout(850);
  assert.equal((await state()).arcana.passages[2].loot.gold, 0);
  await page.reload();
  await enterGame(page);
  await close();
  await click("Take 2 herbs");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/screenshots/arcana-passage-mobile.png" });
  await click("Leave hidden passage");
  const bridge = base("Druid");
  bridge.event = {
    kind: "region",
    region: "coast",
    title: "Flooded ford",
    text: "The river has flooded a ford ahead.",
  };
  bridge.party[0].preparedSpells = ["wildbridge", "bark", "briar"];
  await seed(bridge);
  await close();
  await details("Exploration magic");
  await click(`Living bridge: ${bridge.party[0].name} · level 2, 1h`);
  await page.waitForTimeout(850);
  assert.equal((await state()).event, null);
  assert.equal((await state()).party[0].spellSpent[2], 1);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [family, role, action] of [
    ["shaman", "Druid", "Wolf form · level 1 slot"],
    ["necromancer", "Paladin", "Protective aura · level 1 slot"],
    ["sorcerer", "Wizard", null],
  ]) {
    const s = base(role),
      patrol = s.patrols.find((p) => p.id === `new-${family}`);
    patrol.cleared = false;
    s.position = { x: patrol.x, y: patrol.y };
    assert.ok(startBattle(s, patrol.id));
    if (role === "Druid") Object.assign(s.battle.units[0], { x: 3, y: 4 });
    await seed(s);
    if (action) await click(action);
    if ((await state()).battle.openingAmbush)
      await page.getByRole("button", { name: /^Finish ambush/ }).click();
    await page.getByRole("button", { name: /^End round / }).click();
    await page.waitForTimeout(850);
    assert.ok((await state()).battle.enemies.some((e) => e.kind === family));
    if (role === "Druid") {
      assert.equal((await state()).battle.units[0].wildshape, 2);
      assert.equal((await state()).party[0]._wildshape, true);
      await page.screenshot({ path: "docs/screenshots/arcana-battle.png" });
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: fantasy founders, camp preparation and grimoire learning, academy services, persistent passage loot/reload/mobile, exploration crossing, Druid form, Paladin aura and all three spellcaster families; no browser errors.",
  );
} finally {
  await browser.close();
}
