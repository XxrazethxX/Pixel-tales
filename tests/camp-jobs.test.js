import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  openCamp,
  leaveCamp,
  assignCampJob,
  campWorker,
  camp,
  campCost,
  campRoles,
  assignProfession,
  equipmentRecipe,
  spendHours,
  fatiguePenalty,
  fatigueLabel,
  attackPower,
  movementRange,
  restAtInn,
  startBattle,
  endTurn,
  act,
  flankingBonus,
  restore,
} from "../src/game.js";
const builtCamp = () => {
  const s = fresh();
  s.campUpgrades = {
    tents: 2,
    cookpot: 1,
    forge: 1,
    watchpost: 1,
    infirmary: 1,
  };
  s.inventory.wood = 12;
  s.inventory.herbs = 12;
  s.food = 50;
  openCamp(s);
  return s;
};
const battle = () => {
  const s = fresh();
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  return s;
};

test("duties require matching stations and professions, enforce one job, and clear incompatible assignments", () => {
  const s = fresh();
  assert.equal(assignCampJob(s, "cook", 3), false);
  openCamp(s);
  assert.equal(assignCampJob(s, "cook", 3), false);
  s.campUpgrades.cookpot = 1;
  s.campUpgrades.watchpost = 1;
  assert.equal(assignCampJob(s, "cook", 0), false);
  assert.ok(assignCampJob(s, "cook", 3));
  assert.equal(assignCampJob(s, "guard", 3), false);
  assert.equal(assignCampJob(s, "cook", NaN), false);
  assert.equal(assignCampJob(s, "unknown", 0), false);
  assert.ok(assignProfession(s, 3, "Miner"));
  assert.equal(campWorker(s, "cook"), null);
  assert.ok(assignCampJob(s, "guard", 3));
  assert.ok(assignCampJob(s, "guard", null));
  assert.equal(campWorker(s, "guard"), null);
  s.party[1].hp = 0;
  assert.equal(assignCampJob(s, "guard", 1), false);
});

test("staffed camp jobs consume supplies, save rations, add practice and prepare one battle", () => {
  const s = builtCamp();
  for (const [role, id] of [
    ["cook", 3],
    ["smith", 0],
    ["medic", 2],
    ["guard", 1],
  ])
    assert.ok(assignCampJob(s, role, id));
  assert.equal(campCost(s), 2);
  assert.equal(equipmentRecipe(s, "sword-2").ore, 3);
  s.party[0].fatigue = 90;
  s.party[2].hp = 1;
  assert.ok(camp(s));
  assert.equal(s.food, 48);
  assert.equal(s.inventory.wood, 11);
  assert.equal(s.inventory.ore, 2);
  assert.equal(s.inventory.herbs, 10);
  assert.equal(s.party[0].professionXP, 2);
  assert.equal(s.party[2].professionXP, 1);
  assert.equal(s.party[3].professionXP, 1);
  assert.equal(s.party[0].fatigue, 18);
  assert.equal(s.party[2].hp, 22);
  assert.equal(s.preparedValor, 1);
  leaveCamp(s);
  assert.equal(campCost(s), 3);
  assert.equal(equipmentRecipe(s, "sword-2").ore, 5);
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  assert.ok(startBattle(s));
  assert.equal(s.battle.valor, 5);
  assert.equal(s.preparedValor, 0);
  s.battle = null;
  assert.ok(startBattle(s));
  assert.equal(s.battle.valor, 4);
});

test("unassigned companions recover more fatigue than workers and hungry camps do not produce resources", () => {
  const s = builtCamp();
  assignCampJob(s, "smith", 0);
  s.party.forEach((p) => (p.fatigue = 90));
  s.timeOfDay = 16;
  camp(s);
  assert.equal(s.party[0].fatigue, 42);
  assert.equal(s.party[1].fatigue, 10);
  s.food = 0;
  const ore = s.inventory.ore,
    wood = s.inventory.wood;
  camp(s);
  assert.equal(s.inventory.ore, ore);
  assert.equal(s.inventory.wood, wood);
  assert.equal(s.hungerDays, 1);
  assert.equal(s.party[0].fatigue, 18);
});

test("short rests and repeat same-day jobs cannot farm supplies, and workers require inputs", () => {
  const s = builtCamp();
  assignCampJob(s, "smith", 0);
  assignCampJob(s, "medic", 2);
  s.timeOfDay = 7;
  camp(s);
  assert.equal(s.inventory.ore, 0);
  assert.equal(s.lastCampWorkDay, -1);
  s.timeOfDay = 1;
  camp(s);
  assert.equal(s.inventory.ore, 2);
  assert.equal(s.lastCampWorkDay, 1);
  s.timeOfDay = 1;
  camp(s);
  assert.equal(s.inventory.ore, 2);
  s.inventory.wood = 0;
  s.inventory.herbs = 0;
  camp(s);
  assert.equal(s.inventory.ore, 2);
  assert.equal(s.inventory.wood, 0);
  assert.equal(s.inventory.herbs, 0);
});

test("fatigue grows with awake hours, caps safely, affects attack and movement, and inn beds reset it", () => {
  const s = fresh();
  const p = s.party[0],
    attack = attackPower(s, p);
  spendHours(s, 25);
  assert.equal(p.fatigue, 50);
  assert.equal(fatigueLabel(p), "Tired");
  assert.equal(attackPower(s, p), attack - 1);
  assert.equal(movementRange(p), 2);
  spendHours(s, 15);
  assert.equal(p.fatigue, 80);
  assert.equal(fatiguePenalty(p), 2);
  assert.equal(movementRange(p), 1);
  p.talent = "skirmisher";
  assert.equal(movementRange(p), 2);
  spendHours(s, 20);
  assert.equal(p.fatigue, 100);
  s.food = 50;
  s.gold = 200;
  assert.ok(restAtInn(s));
  assert.equal(p.fatigue, 0);
  assert.equal(movementRange(p), 3);
});

test("save migration retains duties, readiness and fatigue, and rejects invalid or duplicate assignments", () => {
  const s = builtCamp();
  assignCampJob(s, "cook", 3);
  assignCampJob(s, "smith", 0);
  s.preparedValor = 1;
  s.party[0].fatigue = 65;
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.version, 18);
  assert.equal(loaded.campOpen, false);
  assert.equal(loaded.campJobs.cook, 3);
  assert.equal(loaded.campJobs.smith, 0);
  assert.equal(loaded.preparedValor, 1);
  assert.equal(loaded.party[0].fatigue, 65);
  loaded.campJobs = { cook: 3, guard: 3, smith: 2, medic: 99 };
  loaded.party[0].fatigue = Infinity;
  const cleaned = restore(loaded);
  assert.deepEqual(cleaned.campJobs, { cook: 3 });
  assert.equal(cleaned.party[0].fatigue, 0);
  const legacy = fresh();
  legacy.version = 8;
  delete legacy.campJobs;
  delete legacy.preparedValor;
  legacy.party.forEach((p) => delete p.fatigue);
  const migrated = restore(legacy);
  assert.equal(migrated.party[0].fatigue, 0);
  assert.deepEqual(migrated.campJobs, {});
});

test("starvation removes a fallen worker assignment instead of transferring it to a new recruit", () => {
  const s = builtCamp();
  assignCampJob(s, "guard", 1);
  s.party[1].hp = 1;
  s.food = 0;
  spendHours(s, 16);
  assert.equal(s.party[1].dead, true);
  assert.equal(s.campJobs.guard, undefined);
  assert.equal(campWorker(s, "guard"), null);
});

test("melee flanking needs a living ally on the opposite tile and adds real damage", () => {
  const s = battle(),
    b = s.battle;
  const u = b.units[0],
    ally = b.units[1],
    e = b.enemies[0];
  u.x = 3;
  u.y = 1;
  e.x = 4;
  e.y = 1;
  ally.x = 5;
  ally.y = 1;
  assert.equal(flankingBonus(s, u, e), 2);
  const before = e.hp;
  assert.ok(act(s, 0, 4, 1));
  assert.equal(e.hp, before - 9);
  ally.y = 2;
  assert.equal(flankingBonus(s, u, e), 0);
  ally.y = 1;
  s.party[1].hp = 0;
  assert.equal(flankingBonus(s, u, e), 0);
});

test("wolves rush two tiles toward reachable wounded targets, while rooting prevents the rush", () => {
  const s = battle(),
    b = s.battle;
  b.units = [b.units[0], b.units[1]];
  b.units[0].x = 1;
  b.units[0].y = 1;
  b.units[1].x = 5;
  b.units[1].y = 1;
  s.party[1].hp = 5;
  b.enemies = [
    { id: 0, x: 3, y: 1, hp: 14, max: 14, kind: "wolf", damage: 4, armor: 0 },
  ];
  endTurn(s);
  assert.equal(b.enemies[0].x, 4);
  assert.equal(s.party[1].hp, 3);
  assert.equal(s.party[0].hp, 28);
  b.enemies[0].x = 7;
  b.enemies[0].root = 1;
  const hp = s.party[1].hp;
  endTurn(s);
  assert.equal(b.enemies[0].x, 7);
  assert.equal(s.party[1].hp, hp);
  b.enemies[0].x = 8;
  endTurn(s);
  assert.equal(b.enemies[0].x, 6);
  assert.equal(s.party[1].hp, 1);
});

test("bandits gain flanking damage and archers keep their distance instead of using melee bonuses", () => {
  const s = battle(),
    b = s.battle;
  b.units = [b.units[0]];
  b.units[0].x = 4;
  b.units[0].y = 3;
  b.enemies = [
    { id: 0, x: 3, y: 3, hp: 20, max: 20, kind: "raider", damage: 5 },
    { id: 1, x: 5, y: 3, hp: 20, max: 20, kind: "raider", damage: 5, stun: 1 },
  ];
  const hp = s.party[0].hp;
  endTurn(s);
  assert.equal(s.party[0].hp, hp - 7);
  b.enemies = [
    { id: 0, x: 3, y: 3, hp: 20, max: 20, kind: "archer", damage: 4 },
  ];
  endTurn(s);
  assert.equal(Math.abs(b.enemies[0].x - 4) + Math.abs(b.enemies[0].y - 3), 2);
  assert.equal(s.party[0].hp, hp - 11);
});

test("wolf pack support adds damage while player bow attacks receive no melee flanking bonus", () => {
  const s = battle(),
    b = s.battle;
  b.units = [b.units[0]];
  b.units[0].x = 4;
  b.units[0].y = 3;
  b.enemies = [
    { id: 0, x: 3, y: 3, hp: 14, max: 14, kind: "wolf", damage: 4 },
    { id: 1, x: 5, y: 3, hp: 14, max: 14, kind: "wolf", damage: 4, stun: 1 },
  ];
  endTurn(s);
  assert.equal(s.party[0].hp, 21);
  const ranged = battle(),
    rb = ranged.battle;
  rb.units[2].x = 3;
  rb.units[2].y = 1;
  rb.units[0].x = 5;
  rb.units[0].y = 1;
  rb.enemies[0].x = 4;
  rb.enemies[0].y = 1;
  const hp = rb.enemies[0].hp;
  assert.ok(act(ranged, 2, 4, 1));
  assert.equal(rb.enemies[0].hp, hp - 6);
});
