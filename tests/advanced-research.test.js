import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  studies,
  research,
  researchLock,
  restore,
  campCost,
  dailyWages,
  spendHours,
  startBattle,
  grantEquipment,
  equipEquipment,
  wearBattleEquipment,
} from "../src/game.js";
const advanced = [
  "preservation",
  "endurance",
  "paymaster",
  "maintenance",
  "drills",
];
for (const id of advanced)
  test(`${id} requires its parent, renown and knowledge; purchases once and survives reload`, () => {
    const s = fresh(),
      r = studies.find((r) => r.id === id);
    s.knowledge = 30;
    assert.equal(research(s, id), false);
    assert.match(researchLock(s, id), /Requires/);
    s.research.push(r.requires);
    s.renown = r.minRenown - 1;
    assert.equal(research(s, id), false);
    s.renown = r.minRenown;
    s.knowledge = r.cost - 1;
    assert.equal(research(s, id), false);
    s.knowledge = r.cost;
    assert.equal(research(s, id), true);
    assert.equal(s.knowledge, 0);
    s.knowledge = 30;
    assert.equal(research(s, id), false);
    assert.equal(s.knowledge, 30);
    assert.ok(restore(JSON.parse(JSON.stringify(s))).research.includes(id));
  });
test("research is blocked in encounters and for a lost company", () => {
  const s = fresh();
  s.knowledge = 30;
  s.renown = 30;
  s.research = ["rations"];
  for (const field of ["battle", "event"]) {
    s[field] = {};
    assert.equal(research(s, "preservation"), false);
    s[field] = null;
  }
  s.party.forEach((p) => (p.dead = true));
  assert.equal(research(s, "preservation"), false);
});
test("preservation reduces daily food consumption with a minimum of one", () => {
  const s = fresh();
  s.research = ["rations"];
  const before = campCost(s);
  s.research.push("preservation");
  assert.equal(campCost(s), Math.max(1, before - 1));
  s.campUpgrades.cookpot = 2;
  assert.equal(campCost(s), 1);
  s.party.forEach((p) => (p.dead = true));
  assert.equal(campCost(s), 0);
});
test("marching discipline stacks with tireless and respects resting", () => {
  const s = fresh();
  s.research = ["endurance"];
  s.party[0].traits = ["tireless"];
  spendHours(s, 4);
  assert.equal(s.party[0].fatigue, 4.5);
  assert.equal(s.party[1].fatigue, 6);
  spendHours(s, 1, { resting: true });
  assert.equal(s.party[1].fatigue, 6);
});
test("charter reduces new wages but settles the entire existing debt", () => {
  const s = fresh();
  s.party[0].traits = ["mercenary"];
  const base = dailyWages(s);
  s.research = ["paymaster"];
  const reduced = Math.ceil(base * 0.8);
  assert.equal(dailyWages(s), reduced);
  s.wageDebt = 9;
  s.gold = 100;
  s.timeOfDay = 23;
  spendHours(s, 1);
  assert.equal(s.gold, 100 - reduced - 9);
  assert.equal(s.wageDebt, 0);
});
for (const [outcome, weapon, armor] of [
  ["victory", 90, 95],
  ["retreat", 95, 95],
  ["defeat", 85, 85],
])
  test(`maintenance reduces ${outcome} wear exactly once`, () => {
    const s = fresh();
    s.research = ["maintenance"];
    const w = grantEquipment(s, "greatsword-2"),
      a = grantEquipment(s, "armor-1");
    equipEquipment(s, w, 0);
    equipEquipment(s, a, 0);
    s.location = 1;
    s.contract = { target: 1, reward: 65 };
    startBattle(s);
    wearBattleEquipment(s, outcome);
    assert.equal(s.gear.find((g) => g.id === w).durability, weapon);
    assert.equal(s.gear.find((g) => g.id === a).durability, armor);
    assert.equal(wearBattleEquipment(s, outcome), false);
  });
test("tactical drills increase starting valor and stack with camp preparations to the cap", () => {
  const s = fresh();
  s.research = ["drills"];
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  assert.equal(s.battle.valor, 4);
  s.battle = null;
  s.preparedValor = 1;
  s.campUpgrades.watchpost = 2;
  startBattle(s);
  assert.equal(s.battle.valor, 5);
  assert.equal(s.preparedValor, 0);
});
