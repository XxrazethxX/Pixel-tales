import assert from "node:assert/strict";
import { fresh, places, startBattle, beginWagonEvent } from "../src/game.js";
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
  };
  const arrive = (s, id) => {
    s.location = id;
    s.position = { x: places[id].x, y: places[id].y };
  };
  const details = (label) => openDetails(page, label);
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await enterGame(page);
  let s = fresh();
  s.gold = 300;
  s.food = 30;
  await seed(s);
  await close();
  await click("Enter Greyhaven");
  await details("Back a faction charter");
  await click("Back Grove Freefolk · 40 crowns / 6 rations");
  assert.equal((await state()).realm.territories[0], "freefolk");
  s = await state();
  s.reputation.freefolk = -16;
  await seed(s);
  await close();
  await click("Enter Greyhaven");
  assert.equal(
    await page
      .getByRole("button", { name: "Visit Market square", exact: true })
      .isEnabled(),
    false,
  );
  await click("Buy village day pass · 25 crowns");
  assert.ok(
    await page
      .getByRole("button", { name: "Visit Market square", exact: true })
      .isEnabled(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-territory-mobile.png" });
  s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  arrive(s, 14);
  s.inventory.wood = 6;
  s.stealth = { active: true, concealment: 100 };
  await seed(s);
  await close();
  await details("Bramble den · scout");
  await click("Survey Bramble den");
  await details("Bramble den · scout");
  await click("Burn stolen stores · 3 wood");
  assert.ok((await state()).realm.strongholds.goblin.disrupted);
  await details("Bramble den · scout");
  await page.screenshot({ path: "/tmp/pixel-fantasy-stronghold-mobile.png" });
  await click("Assault Bramble den");
  assert.equal((await state()).battle.enemies[0].name, "Mossfang");
  s = fresh();
  s.party[0].race = "elf";
  s.patrols.forEach((p) => (p.cleared = true));
  await seed(s);
  await close();
  await click("Make camp");
  await click("Company");
  await details("Companion heritage stories");
  await click("Discuss heritage: Mara");
  assert.equal((await state()).realm.lineage[0].stage, 1);
  s = await state();
  s.campOpen = false;
  arrive(s, 7);
  await seed(s);
  await close();
  await click("Investigate personal lead: Mara");
  await click("Make camp");
  await click("Company");
  await details("Companion heritage stories");
  await click("Honor the discovery: Mara");
  assert.equal((await state()).party[0].lineagePerk, "grove");
  await details("Companion heritage stories");
  await page.screenshot({ path: "/tmp/pixel-heritage-mobile.png" });
  s = fresh();
  s.party[0].profession = "Thief";
  s.patrols.forEach((p) => (p.cleared = true));
  arrive(s, 2);
  await seed(s);
  await close();
  await click("Explore dungeon");
  await details("Side chamber");
  await click("Scout dungeon hazards");
  assert.ok((await state()).realm.dungeons[2].spotted);
  s = await state();
  s.event.x = 3;
  s.event.y = 3;
  await seed(s);
  await close();
  for (const dial of [1, 3, 2]) {
    await details("Side chamber");
    while ((await state()).realm.dungeons[2].dial !== dial) {
      await click("Adjust side-room lock tension");
      await details("Side chamber");
    }
    await click("Pick side-room tumbler");
  }
  for (const name of ["Root", "Flame", "Star"]) {
    await details("Side chamber");
    await click(`Touch ${name} rune`);
  }
  await details("Side chamber");
  await page.screenshot({ path: "/tmp/pixel-dungeon-runes-mobile.png" });
  await click("Search side chamber");
  assert.ok((await state()).realm.dungeons[2].cache);
  assert.equal((await state()).realm.shards, 1);
  s = fresh();
  s.wagon.owned = true;
  s.travelJobs.quartermaster = 0;
  beginWagonEvent(s, "wheel");
  await seed(s);
  await close();
  await page.screenshot({ path: "/tmp/pixel-wagon-incident-mobile.png" });
  await click("Use assigned travel specialist");
  assert.equal((await state()).event, null);
  assert.equal((await state()).wagon.condition, 100);
  s = fresh();
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.party[0].spellSpent = { 1: 2, 2: 0 };
  s.realm.shards = 1;
  await seed(s);
  await close();
  await click("Make camp");
  await click("Company");
  await details("Companion heritage stories");
  await click("Use aether shard: Mara");
  assert.equal((await state()).realm.shards, 0);
  assert.equal((await state()).party[0].spellSpent[1], 0);
  s = fresh();
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.inventory.herbs = 10;
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 65 };
  startBattle(s);
  s.battle.layout = "legacy";
  s.battle.units[0].x = 2;
  s.battle.units[0].y = 2;
  s.battle.enemies.forEach((e, i) => {
    e.x = 5 + i;
    e.y = 2;
    e.hp = e.max = 50;
  });
  await seed(s);
  await close();
  await details("Spells ·");
  await click("Prepare Veil of Night · level 1 slot / 1 herb");
  await details("Spells ·");
  await click("Cast Veil of Night on tile 5,3");
  assert.equal((await state()).battle.realmMagic.surfaces[0].kind, "darkness");
  await page.locator("summary").filter({ hasText: "Spells ·" }).click();
  await page.screenshot({ path: "/tmp/pixel-darkness-magic-mobile.png" });
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).battle.realmMagic.surfaces[0].kind, "darkness");
  s = fresh();
  s.realm.strongholds.goblin = {
    known: true,
    scouted: true,
    disrupted: false,
    cleared: false,
    lastSpawn: 1,
    waves: 0,
  };
  await seed(s);
  await close();
  await click("Company");
  await details("Known leads and consequences");
  await click("Track: Bramble den");
  assert.equal((await state()).realm.tracked, "hold-goblin");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: faction charter and hostile day pass, mobile stronghold scouting/disruption/assault, elf heritage progression, persistent lock and rune puzzle, assigned wagon specialist incident, ground-targeted darkness and reload, journal lead tracking; no browser errors.",
  );
} finally {
  await browser.close();
}
