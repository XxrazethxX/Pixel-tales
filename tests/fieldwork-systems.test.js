import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  startBattle,
  endTurn,
  act,
  advanceClock,
  advanceMovement,
  advancePatrols,
  DAY_SECONDS,
  openCamp,
  camp,
  standardBearer,
  unlockStandard,
  assignFlagBearer,
  standardLock,
  concealmentLevel,
  canAutoAmbush,
  prepareAmbush,
  campCapacity,
  campCrowding,
  expandCamp,
  campExpansionLock,
  campBounds,
  placeCampFurniture,
  furniturePlacementLock,
  campFurniturePoint,
  rollCampOpportunity,
  campOpportunity,
  safeRestSites,
  safeRestCost,
  safeRestLock,
  restAtShelter,
  wagonManifest,
  companyCargoCapacity,
  cargoLoad,
  battleTerrain,
  beginAfterAction,
  updateAfterActionReport,
  dismissAfterActionReport,
  inflictWound,
  enterDungeon,
  dungeonAction,
  grantEquipment,
  equipEquipment,
} from "../src/game.js";
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
function rich() {
  const s = fresh();
  s.gold = 500;
  s.food = 200;
  s.knowledge = 20;
  s.inventory.wood = 80;
  s.inventory.ore = 80;
  s.inventory.herbs = 80;
  return s;
}
function at(s, id) {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
}
function patrol(s, id = "knives", forest = false) {
  const p = s.patrols.find((p) => p.id === id);
  if (forest) {
    p.x = 350;
    p.y = 145;
  }
  s.position = { x: p.x, y: p.y };
  s.location = -1;
  return p;
}
test("standard is hidden until unlocked and a conscious bearer is assigned", () => {
  const s = rich();
  assert.equal(standardBearer(s), null);
  assert.ok(standardLock(s));
  s.renown = 5;
  assert.ok(unlockStandard(s));
  assert.equal(s.gold, 460);
  assert.equal(s.knowledge, 16);
  assert.equal(standardBearer(s), null);
  assert.ok(assignFlagBearer(s, 2));
  assert.equal(standardBearer(s).id, 2);
  s.party[2].hp = 0;
  assert.equal(standardBearer(s), null);
  assert.equal(assignFlagBearer(s, 2), false);
  s.party[2].hp = 10;
  assert.equal(save(s).fieldwork.bannerBearer, 2);
  assert.ok(assignFlagBearer(s, null));
  assert.equal(standardBearer(s), null);
});
test("an active standard gives one opening valor and cannot be reassigned during battle", () => {
  const s = rich();
  s.renown = 5;
  unlockStandard(s);
  assignFlagBearer(s, 0);
  const p = patrol(s, "caravan");
  assert.ok(startBattle(s, p.id));
  assert.equal(s.battle.valor, 4);
  assert.equal(assignFlagBearer(s, 1), false);
});
test("forest cover automatically ambushes attacked roaming people without paying preparation costs", () => {
  const s = rich(),
    p = patrol(s, "knives", true),
    food = s.food,
    time = s.timeOfDay;
  assert.equal(s.stealth.active, false);
  assert.equal(concealmentLevel(s), 65);
  assert.ok(canAutoAmbush(s, p));
  assert.ok(startBattle(s, p.id));
  assert.ok(s.battle.openingAmbush);
  assert.equal(s.food, food);
  assert.equal(s.timeOfDay, time);
  const enemies = structuredClone(s.battle.enemies);
  endTurn(s);
  assert.equal(s.battle.openingAmbush, false);
  assert.deepEqual(s.battle.enemies, enemies);
});
test("normal exposed attacks have no free turn and deliberate preparation remains available", () => {
  const s = rich();
  s.position = { x: 600, y: 500 };
  s.location = -1;
  const p = s.patrols.find((p) => p.id === "knives");
  p.x = 600;
  p.y = 500;
  assert.equal(canAutoAmbush(s, p), false);
  assert.ok(prepareAmbush(s));
  assert.equal(s.food, 199);
  assert.equal(s.timeOfDay, 10);
  assert.ok(startBattle(s, p.id));
  assert.ok(s.battle.openingAmbush);
});
test("natural concealment does not grant an automatic opening against beasts", () => {
  const s = rich(),
    p = patrol(s, "pine-wolves", true);
  assert.equal(canAutoAmbush(s, p), false);
  p.enemyFamily = "spider";
  p.kind = "fantasy";
  assert.equal(canAutoAmbush(s, p), false);
});
test("camp capacity grows and five companions need an expansion", () => {
  const s = rich();
  s.party.push({ ...s.party[0], id: 4, name: "Fifth" });
  assert.equal(campCapacity(s), 4);
  assert.equal(campCrowding(s), 1);
  assert.ok(campExpansionLock(s));
  openCamp(s);
  assert.ok(expandCamp(s));
  assert.equal(campCapacity(s), 6);
  assert.equal(campCrowding(s), 0);
  assert.equal(s.gold, 440);
  assert.equal(s.inventory.wood, 70);
  assert.equal(s.timeOfDay, 12);
  assert.ok(campBounds(s).left < 145);
  assert.equal(save(s).fieldwork.campSize, 1);
});
test("crowded rest reduces actual healing and resolve compared with an expanded camp", () => {
  const s = rich();
  s.party.push({ ...s.party[0], id: 4, name: "Fifth" });
  s.party.forEach((p) => (p.hp = 5));
  openCamp(s);
  const roomy = save(s);
  roomy.campOpen = true;
  roomy.fieldwork.campSize = 1;
  assert.ok(camp(s));
  assert.ok(camp(roomy));
  assert.ok(s.party[0].hp < roomy.party[0].hp);
  assert.equal(s.morale, roomy.morale - 3);
  assert.equal(s.party[2].resolve, roomy.party[2].resolve - 2);
});
test("drag placement pays only for construction, saves positions and rejects overlaps", () => {
  const s = rich();
  openCamp(s);
  assert.equal(
    furniturePlacementLock(s, "table", 300, 230),
    "Leave room around companions, stations and other furniture.",
  );
  assert.ok(placeCampFurniture(s, "table", 365, 140));
  assert.equal(s.gold, 485);
  assert.equal(s.inventory.wood, 76);
  assert.equal(s.timeOfDay, 10);
  assert.deepEqual(campFurniturePoint(s, "table"), { x: 365, y: 140 });
  assert.equal(placeCampFurniture(s, "rack", 365, 140), false);
  assert.ok(placeCampFurniture(s, "table", 400, 150));
  assert.equal(s.gold, 485);
  assert.equal(s.timeOfDay, 10);
  assert.deepEqual(save(s).fieldwork.campPositions.table, { x: 400, y: 150 });
  assert.equal(placeCampFurniture(s, "rack", 2000, 150), false);
});
test("expansion creates usable furniture space and has a bounded maximum", () => {
  const s = rich();
  openCamp(s);
  assert.equal(placeCampFurniture(s, "rack", 120, 210), false);
  expandCamp(s);
  assert.ok(placeCampFurniture(s, "rack", 120, 210));
  expandCamp(s);
  assert.equal(expandCamp(s), false);
  assert.equal(campCapacity(s), 8);
});
test("camp opportunities are occasional and cannot be rerolled by reopening camp", () => {
  const s = rich();
  let encounters = 0;
  for (let day = 1; day <= 12; day++) {
    s.day = day;
    openCamp(s);
    if (s.fieldwork.campOpportunity) {
      encounters++;
      assert.ok(campOpportunity(s, s.fieldwork.campOpportunity.id));
    }
    const current = structuredClone(s.fieldwork.campOpportunity);
    assert.equal(rollCampOpportunity(s), false);
    assert.deepEqual(s.fieldwork.campOpportunity, current);
    s.campOpen = false;
  }
  assert.ok(encounters > 0 && encounters < 8);
});
test("secure lodges include Wayfarer and three new world locations", () => {
  assert.equal(safeRestSites.length, 4);
  for (const lodge of safeRestSites) assert.ok(places[lodge.site]);
  assert.ok(safeRestSites.some((v) => v.site === 15));
});
test("secure lodging supplies meals, settles wages and recovers without wilderness interruptions", () => {
  const s = rich();
  at(s, 16);
  s.food = 0;
  s.hungerDays = 2;
  s.party[0].hp = 5;
  s.party[0].fatigue = 90;
  const price = safeRestCost(s),
    gold = s.gold;
  assert.equal(safeRestLock(s), null);
  assert.ok(restAtShelter(s));
  assert.equal(s.gold, gold - price);
  assert.equal(s.food, 0);
  assert.equal(s.hungerDays, 0);
  assert.equal(s.party[0].hp, s.party[0].max);
  assert.equal(s.day, 2);
  assert.equal(s.event, null);
});
test("shelters reject insufficient payment and combat before changing resources", () => {
  const s = fresh();
  at(s, 18);
  s.gold = 0;
  const before = JSON.stringify(s);
  assert.equal(restAtShelter(s), false);
  assert.equal(JSON.stringify(s), before);
});
test("wagon manifest fits every traded unit within a finite cargo hold", () => {
  const s = fresh();
  s.wagon.owned = true;
  s.cargo.grain = 18;
  s.cargo.iron = 10;
  let cells = wagonManifest(s);
  assert.equal(cells.length, companyCargoCapacity(s));
  assert.equal(cells.filter(Boolean).length, cargoLoad(s));
  s.wagon.storage = 2;
  cells = wagonManifest(s);
  assert.equal(cells.length, 50);
  assert.equal(cells.filter(Boolean).length, 28);
});
test("battle terrain changes between fights, stays connected and survives saves", () => {
  const layouts = [];
  for (let i = 0; i < 3; i++) {
    const s = rich();
    s.skirmishes = i;
    const p = patrol(s, "caravan");
    startBattle(s, p.id);
    layouts.push(JSON.stringify(battleTerrain(s)));
    assert.deepEqual(battleTerrain(save(s)), battleTerrain(s));
    assert.ok(
      !battleTerrain(s).some(
        (t) =>
          t.blocked && s.battle.units.some((u) => u.x === t.x && u.y === t.y),
      ),
    );
  }
  assert.equal(new Set(layouts).size, 3);
});
test("event reports list real injuries, loot and costs and do not reopen after acknowledgement", () => {
  const s = rich();
  s.event = { kind: "trail", title: "Lost travelers", templateId: "lost" };
  updateAfterActionReport(s);
  s.gold += 12;
  s.inventory.herbs += 2;
  s.food -= 1;
  s.party[0].hp -= 10;
  inflictWound(s, 0, "sprain");
  s.event = null;
  assert.ok(updateAfterActionReport(s));
  assert.ok(s.fieldwork.report.loot.includes("12 crowns gained"));
  assert.ok(s.fieldwork.report.loot.includes("2 herbs"));
  assert.ok(s.fieldwork.report.costs.includes("1 rations spent or lost"));
  assert.ok(
    s.fieldwork.report.conditions.some((v) => v.includes("Sprained leg")),
  );
  assert.ok(save(s).fieldwork.report);
  assert.ok(dismissAfterActionReport(s));
  assert.equal(updateAfterActionReport(s), false);
  assert.equal(s.fieldwork.report, null);
});
test("combat victory produces a report with actual loot and equipment wear", () => {
  const s = rich(),
    p = patrol(s, "caravan");
  const weapon = grantEquipment(s, "sword-1");
  equipEquipment(s, weapon, 0);
  startBattle(s, p.id);
  updateAfterActionReport(s);
  for (const e of s.battle.enemies) e.hp = 0;
  Object.assign(s.battle.enemies[0], { hp: 1, x: 2, y: 1 });
  Object.assign(s.battle.units[0], { x: 1, y: 1 });
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.battle, null);
  assert.equal(s.fieldwork.report.kind, "battle");
  assert.ok(s.fieldwork.report.loot.length);
  assert.ok(
    s.fieldwork.report.costs.some(
      (v) => v.includes("Road sword") && v.includes("condition"),
    ),
  );
  assert.ok(
    s.fieldwork.report.conditions.length ||
      s.fieldwork.report.loot.some((v) => v.includes("crowns")),
  );
});
test("pending reports pause travel, patrols and day progression", () => {
  const s = rich();
  beginAfterAction(s, "event", "Rest");
  s.gold -= 5;
  assert.ok(updateAfterActionReport(s));
  s.destination = { x: 300, y: 300 };
  const before = JSON.stringify(s);
  assert.equal(advanceClock(s, 10), false);
  assert.equal(advanceMovement(s, 10).changed, false);
  advancePatrols(s, 10);
  assert.equal(JSON.stringify(s), before);
});
test("report checkpoints survive dungeon saves and summarize the entire visit on exit", () => {
  const s = rich();
  at(s, 4);
  assert.ok(enterDungeon(s));
  updateAfterActionReport(s);
  const r = save(s);
  r.inventory.ore += 3;
  assert.ok(dungeonAction(r, "leave"));
  assert.ok(updateAfterActionReport(r));
  assert.ok(r.fieldwork.report.loot.includes("3 ore"));
});
test("automatic occurrences are rarer while active day progression remains normal", () => {
  const s = rich();
  s.location = -1;
  s.position = { x: 650, y: 500 };
  s.day = 2;
  s.timeOfDay = 23.9;
  advanceClock(s, DAY_SECONDS / 24);
  assert.equal(s.day, 3);
  assert.equal(s.event, null);
  s.day = 5;
  s.timeOfDay = 23.9;
  advanceClock(s, DAY_SECONDS / 24);
  assert.equal(s.day, 6);
  assert.ok(s.event);
});
test("older saves get no free flag unlock and malformed new ledgers are sanitized", () => {
  const s = rich();
  s.version = 20;
  delete s.fieldwork;
  const r = save(s);
  assert.equal(r.version, 21);
  assert.equal(standardBearer(r), null);
  const raw = rich();
  raw.fieldwork.standardUnlocked = true;
  raw.fieldwork.bannerBearer = 999;
  raw.fieldwork.campSize = 100;
  raw.fieldwork.campPositions.table = { x: Infinity, y: NaN };
  raw.fieldwork.reportCheckpoint = {
    kind: "event",
    before: {
      gold: 1,
      food: 1,
      knowledge: 1,
      party: [null],
      gear: [],
      inventory: {},
      cargo: {},
    },
  };
  const valid = save(raw);
  assert.equal(valid.fieldwork.bannerBearer, null);
  assert.equal(valid.fieldwork.campSize, 2);
  assert.deepEqual(valid.fieldwork.campPositions, {});
  assert.equal(valid.fieldwork.reportCheckpoint, null);
});
test("battle terrain variations retain a route across the map", () => {
  for (const style of ["road", "forest-edge", "quarry", "ruin-court", "river"])
    for (const variation of [1, 2]) {
      const s = rich();
      s.skirmishes = variation;
      const p = patrol(s, "caravan");
      startBattle(s, p.id);
      s.battle.layoutId = s.battle.terrainBaseLayout = style;
      const blocked = new Set(
          battleTerrain(s)
            .filter((t) => t.blocked)
            .map((t) => `${t.x},${t.y}`),
        ),
        queue = [[0, 3]],
        visited = new Set(["0,3"]);
      while (queue.length) {
        const [x, y] = queue.shift();
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const a = x + dx,
            b = y + dy,
            key = `${a},${b}`;
          if (
            a < 0 ||
            a > 8 ||
            b < 0 ||
            b > 6 ||
            visited.has(key) ||
            blocked.has(key)
          )
            continue;
          visited.add(key);
          queue.push([a, b]);
        }
      }
      assert.ok(
        visited.has("8,3"),
        `${style} variation ${variation} disconnected`,
      );
    }
});
test("camp conversations consume their opportunity and report departures accurately", async () => {
  const { resolveCampOpportunity } = await import("../src/game.js");
  const s = rich();
  s.campOpen = true;
  s.day = 2;
  s.fieldwork.campOpportunity = { id: 0, day: 2 };
  s.party[0].resolve = 20;
  assert.ok(resolveCampOpportunity(s, 0, "release"));
  assert.equal(s.fieldwork.campOpportunity, null);
  assert.ok(
    s.fieldwork.report.conditions.some((v) =>
      v.includes("left the company alive"),
    ),
  );
  assert.ok(!s.fieldwork.report.conditions.some((v) => v.includes("died")));
  assert.equal(resolveCampOpportunity(s, 0, "release"), false);
});
test("resting into a new day can offer a camp conversation without reopening camp", () => {
  const s = rich();
  openCamp(s);
  assert.equal(s.fieldwork.campOpportunity, null);
  camp(s);
  assert.equal(s.fieldwork.lastCampRoll, s.day);
  assert.ok(s.fieldwork.campOpportunity);
});
test("battle reports include the company spell slots actually consumed", () => {
  const s = rich();
  s.party[0].role = "Wizard";
  s.party[0].spellSpent = { 1: 0, 2: 0 };
  s.event = { kind: "trail", title: "Arcane obstacle" };
  updateAfterActionReport(s);
  s.party[0].spellSpent[1] = 1;
  s.event = null;
  updateAfterActionReport(s);
  assert.ok(
    s.fieldwork.report.costs.some((v) =>
      v.includes("1 level 1 spell slot spent"),
    ),
  );
});
test("Rogues can operate side-room locks without gaining an unrelated profession", async () => {
  const { companyLockpicker, realmDungeonAction } = await import(
    "../src/game.js"
  );
  const s = rich();
  s.party[0].role = "Rogue";
  s.party[0].profession = "Cook";
  at(s, 4);
  enterDungeon(s);
  s.event.x = 3;
  s.event.y = 3;
  assert.equal(companyLockpicker(s).id, 0);
  assert.ok(realmDungeonAction(s, "dial"));
  assert.ok(realmDungeonAction(s, "pick"));
  assert.equal(s.party[0].profession, "Cook");
});
test("reports include magical loot stored outside ordinary inventory", () => {
  const s = rich();
  s.event = { kind: "trail", title: "Hidden library" };
  updateAfterActionReport(s);
  s.realm.shards++;
  s.arcana.grimoires.prism = 1;
  s.event = null;
  updateAfterActionReport(s);
  assert.ok(s.fieldwork.report.loot.includes("1 aether shard"));
  assert.ok(s.fieldwork.report.loot.includes("1 Prism codex"));
});
