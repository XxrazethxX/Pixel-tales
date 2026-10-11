import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  enterDungeon,
  openCamp,
  companionStory,
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
  const arrive = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
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
  const close = async () => {
    const b = page.getByRole("button", { name: "Close panel", exact: true });
    if (await b.isVisible()) await b.click();
  };
  const worldClick = async (x, y) => {
    const pt = await page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect();
        return {
          x: r.x + (x - Number(c.dataset.viewX)) * Number(c.dataset.scale),
          y: r.y + (y - Number(c.dataset.viewY)) * Number(c.dataset.scale),
        };
      },
      { x, y },
    );
    await page.mouse.click(pt.x, pt.y);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await click("New Company");
  await page
    .getByLabel("Founder 1 class", { exact: true })
    .selectOption("Wizard");
  await page.getByLabel("Founder 1 race", { exact: true }).selectOption("elf");
  await page
    .getByLabel("Founder 2 class", { exact: true })
    .selectOption("Cleric");
  await page
    .getByLabel("Founder 2 race", { exact: true })
    .selectOption("dwarf");
  await page.getByLabel("Founder 4 race", { exact: true }).selectOption("orc");
  await page.screenshot({ path: "/tmp/pixel-fantasy-company.png" });
  await click("Begin adventure");
  const magic = await state();
  assert.equal(magic.party[0].race, "elf");
  assert.equal(magic.party[0].role, "Wizard");
  assert.equal(magic.party[1].role, "Cleric");
  const chapter = fresh();
  await seed(chapter);
  await click("Visit Contract board");
  await click("Begin Hungry Roads");
  assert.equal((await state()).campaign.phase, "inquiry");
  let progress = await state();
  arrive(progress, 13);
  await seed(progress);
  await click("Explore abandoned farm");
  await click("Read the farmer’s ledger");
  await click("Search the old well");
  await click("Rescue Sella · 1 medicine");
  assert.equal((await state()).travelers.tamsin, "rescued");
  await click("Leave farm");
  progress = await state();
  arrive(progress, 0);
  await seed(progress);
  await click("Meet Sella again");
  assert.equal((await state()).travelers.tamsin, "settled");
  await click("Escort Merrit to Saltbridge");
  await close();
  await page.screenshot({ path: "/tmp/pixel-merrit-escort.png" });
  progress = await state();
  progress.location = -1;
  progress.position = { x: places[3].x - 70, y: places[3].y };
  progress.trail = [{ ...progress.position }];
  await seed(progress);
  await close();
  await worldClick(places[3].x, places[3].y);
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("pixel-tales")).travelers.merrit ===
      "arrived",
  );
  await click("Meet Merrit · collect 50 crowns");
  assert.equal((await state()).travelers.merrit, "settled");
  progress = await state();
  arrive(progress, 12);
  await seed(progress);
  await click("Explore dungeon");
  for (let x = 1; x <= 7; x++)
    await page
      .getByRole("button", { name: `Dungeon tile ${x + 1},6`, exact: true })
      .click();
  assert.equal((await state()).battle.enemies[0].name, "Captain Venn");
  const victory = await state();
  victory.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(victory.battle.enemies[0], { x: 2, y: 1, hp: 1, armor: 0 });
  await seed(victory);
  await worldClick(260, 88);
  assert.ok((await state()).strongholds.briar.cleared);
  await click("Leave dungeon");
  await click("Decide the grain's fate");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-grain-choice-mobile.png" });
  await click("Give grain to hungry villagers");
  assert.equal((await state()).campaign.branch, "villagers");
  progress = await state();
  arrive(progress, 0);
  await seed(progress);
  await click("Report recovered grain");
  assert.equal((await state()).campaign.phase, "completed");
  assert.ok((await state()).travelers.farmRebuilt);
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).campaign.phase, "completed");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const quest = fresh();
  quest.gold = 200;
  quest.inventory.ore = 8;
  openCamp(quest);
  companionStory(quest, 0, "support");
  quest.campOpen = false;
  quest.siteProgress["cart-4"] = true;
  arrive(quest, 4);
  await seed(quest);
  await click("Investigate for Mara");
  await click("Make camp");
  await click("Share Mara's discovery");
  assert.equal((await state()).party[0].personalPerk, "linebreaker");
  await click("Break camp");
  const battle = magic;
  battle.inventory.herbs = 10;
  battle.inventory.ore = 5;
  arrive(battle, 1);
  battle.contract = { target: 1, reward: 65 };
  startBattle(battle);
  Object.assign(battle.battle.enemies[0], { x: 3, y: 1, hp: 100, max: 100 });
  battle.battle.enemies.forEach((e) => (e.stun = 5));
  await seed(battle);
  await page
    .locator("summary")
    .filter({ hasText: "Spells · level 1 2 / level 2 0" })
    .click();
  await click("Prepare Aether dart · level 1 slot");
  await click("Cast Aether dart on raider");
  assert.equal((await state()).party[0].spellSpent[1], 1);
  assert.equal((await state()).battle.enemies[0].hp, 93);
  await click("End round 1");
  await click("Cast Aether dart on raider");
  assert.equal((await state()).party[0].spellSpent[1], 2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-spell-slots-mobile.png" });
  assert.equal(
    await page
      .getByRole("button", {
        name: "Prepare Aether dart · level 1 slot",
        exact: true,
      })
      .isEnabled(),
    false,
  );
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).party[0].spellSpent[1], 2);
  await click("Retreat · lose 15 crowns");
  await click("Make camp");
  await click("Meditate · restore spell slots");
  assert.equal((await state()).party[0].spellSpent[1], 0);
  assert.equal((await state()).inventory.herbs, 8);
  await click("Break camp");
  const temple = await state();
  temple.party[0].spellSpent = { 1: 1, 2: 0 };
  arrive(temple, 6);
  temple.gold = 200;
  await seed(temple);
  await click("Restore spell slots at temple");
  assert.equal((await state()).gold, 185);
  assert.equal((await state()).party[0].spellSpent[1], 0);
  await click("Company");
  await page.getByText("Elf:", { exact: false }).first().waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: fantasy founder races/classes, village campaign acceptance, farm investigation and rescued traveler reunion, visible escort and arrival payment, Captain Venn and lasting stronghold clearance, mobile grain choice and chapter persistence, multi-stage companion ability, two persistent spell casts, mobile slot exhaustion, paid camp and temple recovery.",
  );
} finally {
  await browser.close();
}
