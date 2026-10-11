import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  DAY_SECONDS,
  advanceClock,
  spendHours,
  clockInfo,
  dailyWages,
  campCost,
  payWages,
  camp,
  openCamp,
  leaveCamp,
  buildCamp,
  campBuildPlan,
  restore,
  moveTo,
  advanceMovement,
  advancePatrols,
  terrainAt,
  startBattle,
  act,
  heal,
  restAtInn,
  recruit,
  livingParty,
  companyLost,
  equipmentRecipe,
} from "../src/game.js";

test("four-minute days charge upkeep once at midnight and pause during camp, battle and events", () => {
  const s = fresh();
  advanceClock(s, DAY_SECONDS / 4);
  assert.equal(s.timeOfDay, 14);
  assert.equal(s.food, 24);
  advanceClock(s, (DAY_SECONDS * 10) / 24);
  assert.equal(s.day, 2);
  assert.equal(s.timeOfDay, 0);
  assert.equal(s.food, 20);
  assert.equal(s.gold, 112);
  for (const key of ["campOpen", "battle", "event"]) {
    s[key] = true;
    assert.equal(advanceClock(s, 10), false);
    assert.equal(s.timeOfDay, 0);
    s[key] = false;
  }
  assert.equal(advanceClock(s, NaN), false);
  assert.equal(advanceClock(s, -1), false);
  s.timeOfDay = 18.5;
  assert.deepEqual(clockInfo(s), {
    period: "Dusk",
    time: "18:30",
    percent: (18.5 / 24) * 100,
  });
});

test("daily wages accrue debt, permit partial repayment, and never create negative funds", () => {
  const s = fresh();
  s.gold = 3;
  spendHours(s, 16);
  assert.equal(s.gold, 0);
  assert.equal(s.wageDebt, 5);
  assert.equal(dailyWages(s), 8);
  s.gold = 2;
  assert.ok(payWages(s));
  assert.equal(s.wageDebt, 3);
  s.gold = 20;
  spendHours(s, 24);
  assert.equal(s.gold, 9);
  assert.equal(s.wageDebt, 0);
  assert.equal(payWages(s), false);
});

test("starvation grows gradually, partial meals reduce damage, and food resets hunger", () => {
  const s = fresh();
  const health = s.party[0].hp;
  s.food = 0;
  spendHours(s, 16);
  assert.equal(s.party[0].hp, health - 3);
  spendHours(s, 24);
  assert.equal(s.party[0].hp, health - 7);
  s.food = 3;
  spendHours(s, 24);
  assert.equal(s.party[0].hp, health - 9);
  s.food = 20;
  spendHours(s, 24);
  assert.equal(s.hungerDays, 0);
  assert.equal(s.party[0].hp, health - 9);
});

test("starvation deaths release equipment, survive reload, cannot be healed, and permit replacing a fallen slot", () => {
  const s = fresh();
  s.food = 0;
  s.gold = 300;
  s.party[0].hp = 2;
  s.gear = [{ id: 1, template: "sword-1" }];
  s.party[0].equipment.weapon = 1;
  spendHours(s, 16);
  assert.equal(s.party[0].dead, true);
  assert.equal(s.party[0].hp, 0);
  assert.equal(s.party[0].equipment.weapon, null);
  assert.equal(s.gear.length, 1);
  assert.equal(livingParty(s).length, 3);
  assert.equal(dailyWages(s), 6);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.party[0].dead, true);
  assert.equal(loaded.gold, s.gold);
  assert.equal(heal(loaded, 0), false);
  assert.ok(restAtInn(loaded));
  assert.equal(loaded.party[0].hp, 0);
  assert.ok(recruit(loaded));
  assert.equal(loaded.party.length, 4);
  assert.equal(loaded.party[0].dead, false);
  assert.equal(loaded.party[0].id, 0);
  assert.equal(new Set(loaded.party.map((p) => p.id)).size, 4);
});

test("the last starvation death ends exploration and remains lost after loading", () => {
  const s = fresh();
  s.food = 0;
  s.party.forEach((p) => (p.hp = 2));
  moveTo(s, 300, 300);
  spendHours(s, 16);
  assert.ok(companyLost(s));
  assert.equal(s.destination, null);
  assert.equal(moveTo(s, 500, 500), false);
  assert.equal(openCamp(s), false);
  assert.equal(camp(s), false);
  assert.equal(recruit(s), false);
  assert.ok(companyLost(restore(JSON.parse(JSON.stringify(s)))));
});

test("camp construction charges resources and time, caps levels, and persists packed improvements", () => {
  const s = fresh();
  s.gold = 300;
  s.inventory.wood = 50;
  s.inventory.ore = 20;
  assert.equal(buildCamp(s, "tents"), false);
  moveTo(s, 300, 300);
  assert.ok(openCamp(s));
  assert.equal(s.destination, null);
  assert.equal(s.timeOfDay, 8);
  assert.ok(buildCamp(s, "tents"));
  assert.equal(s.gold, 280);
  assert.equal(s.inventory.wood, 44);
  assert.equal(s.timeOfDay, 10);
  assert.equal(campBuildPlan(s, "tents").gold, 40);
  assert.ok(buildCamp(s, "tents"));
  assert.equal(buildCamp(s, "tents"), false);
  assert.equal(buildCamp(s, "unknown"), false);
  assert.ok(buildCamp(s, "cookpot"));
  assert.equal(campCost(s), 3);
  assert.ok(buildCamp(s, "forge"));
  assert.equal(equipmentRecipe(s, "sword-2").ore, 4);
  const position = { ...s.position };
  advanceMovement(s, 10);
  advancePatrols(s, 10);
  assert.deepEqual(s.position, position);
  leaveCamp(s);
  assert.equal(equipmentRecipe(s, "sword-2").ore, 5);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.campOpen, false);
  assert.equal(loaded.campUpgrades.tents, 2);
  assert.equal(loaded.campUpgrades.cookpot, 1);
  assert.deepEqual(loaded.position, position);
});

test("tents and medicine tent improve healing while hungry rest never restores health", () => {
  const s = fresh();
  s.campUpgrades = { tents: 2, infirmary: 1 };
  s.party[0].hp = 1;
  s.party[0].injury = true;
  assert.ok(camp(s));
  assert.equal(s.party[0].hp, 27);
  assert.equal(s.party[0].injury, false);
  s.food = 0;
  const hp = s.party[0].hp;
  assert.ok(camp(s));
  assert.equal(s.party[0].hp, hp - 3);
  assert.equal(s.hungerDays, 1);
  assert.equal(s.gold, 104);
  assert.equal(s.day, 3);
});

test("save migration sanitizes new survival fields and retains old company progression", () => {
  const s = fresh();
  s.version = 7;
  s.gold = 77;
  s.timeOfDay = 99;
  s.hungerDays = -1;
  s.wageDebt = -5;
  s.campUpgrades = { tents: 99, forge: -1, infirmary: "yes" };
  s.campOpen = true;
  const loaded = restore(s);
  assert.equal(loaded.version, 12);
  assert.equal(loaded.gold, 77);
  assert.equal(loaded.timeOfDay, 8);
  assert.equal(loaded.hungerDays, 0);
  assert.equal(loaded.wageDebt, 0);
  assert.equal(loaded.campUpgrades.tents, 2);
  assert.equal(loaded.campUpgrades.forge, 0);
  assert.equal(loaded.campUpgrades.infirmary, 0);
  assert.equal(loaded.campOpen, false);
});

test("wolves patrol forests, camp pauses them, and wolf victory awards food and pelts instead of gear", () => {
  const s = fresh();
  const pack = s.patrols.find((p) => p.id === "pine-wolves");
  assert.equal(terrainAt(pack), "forest");
  const before = { x: pack.x, y: pack.y };
  advancePatrols(s, 1);
  assert.notDeepEqual({ x: pack.x, y: pack.y }, before);
  assert.equal(terrainAt(pack), "forest");
  openCamp(s);
  const paused = { x: pack.x, y: pack.y };
  advancePatrols(s, 10);
  assert.deepEqual({ x: pack.x, y: pack.y }, paused);
  leaveCamp(s);
  s.position = { x: pack.x, y: pack.y };
  s.location = -1;
  s.campUpgrades.watchpost = 1;
  assert.ok(startBattle(s, pack.id));
  assert.equal(s.battle.valor, 4);
  assert.ok(s.battle.enemies.every((e) => e.kind === "wolf"));
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { ...s.battle.enemies[0], hp: 1, x: 2, y: 1 };
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.battle, null);
  assert.equal(s.food, 30);
  assert.equal(s.inventory.pelts, 2);
  assert.equal(s.gold, 120);
  assert.equal(s.gear.length, 0);
  assert.equal(pack.cleared, true);
  assert.equal(startBattle(s, pack.id), false);
});
