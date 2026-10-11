import test from "node:test";
import assert from "node:assert/strict";
import {
  enterSite,
  siteAction,
  fresh,
  advanceClock,
  DAY_SECONDS,
  places,
  travel,
  camp,
  research,
  startBattle,
  act,
  endTurn,
} from "../src/game.js";
test("travel spends supplies; research reduces subsequent travel costs", () => {
  const s = fresh();
  assert.ok(travel(s, 1));
  assert.equal(s.food, 20);
  s.knowledge = 2;
  assert.ok(research(s, "rations"));
  assert.ok(travel(s, 2));
  assert.equal(s.food, 17);
  assert.equal(s.day, 3);
  assert.equal(research(s, "rations"), false);
});
test("camp settles daily wages, heals fed companions, and permits hungry rest", () => {
  const s = fresh();
  s.party[0].hp = 5;
  assert.ok(camp(s));
  assert.equal(s.party[0].hp, 15);
  assert.equal(s.gold, 112);
  s.food = 0;
  assert.equal(camp(s), true);
  assert.equal(s.party[0].hp, 12);
  assert.equal(s.hungerDays, 1);
});
test("battle validates range and actions, victory grants progression", () => {
  const s = fresh();
  s.contract = { target: 1, reward: 65 };
  assert.equal(startBattle(s), false);
  travel(s, 1);
  assert.ok(startBattle(s));
  assert.equal(act(s, 0, 7, 1), false);
  assert.ok(act(s, 0, 3, 1));
  assert.equal(act(s, 0, 4, 1), false);
  endTurn(s);
  assert.equal(s.battle.turn, 2);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { id: 0, x: 4, y: 1, hp: 1, max: 16 };
  assert.ok(act(s, 0, 4, 1));
  assert.equal(s.battle, null);
  assert.equal(s.gold, 177);
  assert.equal(s.knowledge, 2);
  assert.equal(s.party[0].level, 2);
  assert.equal(s.party[0].points, 1);
});
test("defeat recovers the company without an unwinnable state", () => {
  const s = fresh();
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.party.forEach((p) => (p.hp = 0));
  endTurn(s);
  assert.equal(s.location, 0);
  assert.equal(s.battle, null);
  assert.ok(s.party.every((p) => p.hp === 1 && p.injury));
});

import {
  restore,
  recruit,
  recipes,
  craft,
  explore,
  resolveEvent,
  accept,
  deliver,
  buy,
  guard,
  train,
  heal,
} from "../src/game.js";
test("old saves migrate and malformed saves recover", () => {
  const s = fresh();
  s.version = 1;
  delete s.inventory;
  delete s.explored;
  s.gold = 99;
  const migrated = restore(s);
  assert.equal(migrated.gold, 99);
  assert.equal(migrated.version, 13);
  assert.equal(migrated.inventory.medicine, 1);
  assert.equal(restore({ version: 1 }).party.length, 4);
  assert.equal(restore(null).day, 1);
});
test("recruitment increases wages and stops at six companions", () => {
  const s = fresh();
  s.gold = 200;
  assert.ok(recruit(s));
  assert.ok(recruit(s));
  assert.equal(recruit(s), false);
  const gold = s.gold;
  camp(s);
  assert.equal(s.gold, gold - 12);
  assert.equal(s.party[5].id, 5);
});
test("sites award knowledge once, crafting consumes materials and equips armor", () => {
  const s = fresh();
  travel(s, 1);
  assert.ok(explore(s));
  assert.equal(explore(s), false);
  assert.equal(s.knowledge, 1);
  s.inventory.ore = 8;
  assert.ok(craft(s, "blade", 2));
  assert.equal(s.party[2].weapon, 2);
  assert.equal(s.inventory.ore, 5);
  assert.ok(craft(s, "armor", 0));
  assert.equal(s.party[0].armor, 1);
  assert.equal(craft(s, "blade", 0), false);
  assert.equal(craft(s, "unknown"), false);
});
test("roadside choices require medicine and cannot be claimed twice", () => {
  const s = fresh();
  travel(s, 1);
  travel(s, 0);
  assert.ok(s.event);
  s.inventory.medicine = 0;
  assert.equal(resolveEvent(s, "help"), false);
  assert.equal(travel(s, 2), false);
  assert.ok(resolveEvent(s, "trade"));
  assert.equal(s.gold, 116);
  assert.equal(s.event, null);
  assert.equal(resolveEvent(s, "trade"), false);
});
test("delivery contracts award resources without combat and honor destination", () => {
  const s = fresh();
  assert.ok(accept(s, 2));
  assert.equal(deliver(s), false);
  travel(s, 3);
  assert.equal(startBattle(s), false);
  assert.ok(deliver(s));
  assert.equal(s.completed, 1);
  assert.equal(s.gold, 157);
  assert.equal(s.food, 15);
  assert.equal(deliver(s), false);
});
test("movement and attack can happen in the same round; guard uses an action", () => {
  const s = fresh();
  accept(s, 0);
  travel(s, 1);
  startBattle(s);
  s.battle.enemies[0].x = 4;
  s.battle.enemies[0].y = 1;
  assert.ok(act(s, 0, 3, 1));
  assert.ok(act(s, 0, 4, 1));
  assert.equal(s.battle.enemies[0].hp, 9);
  assert.equal(act(s, 0, 4, 1), false);
  assert.ok(guard(s, 1));
  assert.equal(guard(s, 1), false);
  endTurn(s);
  assert.equal(s.battle.units[1].guard, false);
});
test("market, healing, and training validate costs and targets", () => {
  const s = fresh();
  assert.ok(buy(s, "ore"));
  assert.equal(s.inventory.ore, 3);
  s.gold = 0;
  assert.equal(buy(s, "food"), false);
  s.party[0].hp = 2;
  s.party[0].injury = true;
  assert.ok(heal(s, 0));
  assert.equal(s.party[0].hp, 17);
  assert.equal(s.party[0].injury, false);
  assert.equal(heal(s, 0), false);
  s.party[0].points = 1;
  assert.ok(train(s, 0, "vitality"));
  assert.equal(s.party[0].max, 33);
  assert.equal(train(s, 0, "strength"), false);
});

import {
  moveTo,
  advanceMovement,
  stopMovement,
  partyPositions,
  nearbyPlace,
} from "../src/game.js";
test("party walks to arbitrary wilderness coordinates and leaves town services", () => {
  const s = fresh();
  assert.ok(moveTo(s, 280, 300));
  assert.equal(s.position.x, 170);
  advanceMovement(s, 0.5);
  assert.ok(s.position.x > 170 && s.position.x < 280);
  assert.equal(s.location, -1);
  advanceMovement(s, 10);
  assert.equal(s.position.x, 280);
  assert.equal(s.position.y, 300);
  assert.equal(s.destination, null);
  assert.equal(buy(s, "food"), false);
  assert.equal(explore(s), false);
  assert.equal(s.food, 24);
});
test("redirecting changes route, followers trace it, and stopping freezes position", () => {
  const s = fresh();
  moveTo(s, 300, 280);
  advanceMovement(s, 1);
  const before = { ...s.position };
  moveTo(s, 240, 350);
  advanceMovement(s, 0.5);
  assert.ok(s.position.y > before.y);
  const followers = partyPositions(s);
  assert.equal(followers.length, 4);
  assert.notDeepEqual(followers[0], followers[1]);
  stopMovement(s);
  const pos = { ...s.position };
  advanceMovement(s, 5);
  assert.deepEqual(s.position, pos);
});
test("daily costs follow the longer clock independently of walking distance", () => {
  const s = fresh();
  for (let i = 0; i < 4; i++) {
    moveTo(s, s.position.x + 40, s.position.y);
    advanceMovement(s, 1);
  }
  assert.equal(s.food, 24);
  assert.equal(s.day, 1);
  advanceClock(s, (DAY_SECONDS * 16) / 24);
  assert.equal(s.food, 20);
  assert.equal(s.day, 2);
  const r = fresh();
  r.research = ["rations"];
  moveTo(r, 340, 280);
  advanceMovement(r, 3);
  advanceClock(r, (DAY_SECONDS * 16) / 24);
  assert.equal(r.food, 21);
  assert.equal(r.day, 2);
});
test("movement clamps boundaries, pauses for encounters, and remains possible without food", () => {
  const s = fresh();
  assert.equal(moveTo(s, NaN, 5), false);
  moveTo(s, -300, 900);
  assert.deepEqual(s.destination, { x: 12, y: 846 });
  s.event = { title: "Pause" };
  const pos = { ...s.position };
  advanceMovement(s, 9);
  assert.deepEqual(s.position, pos);
  s.event = null;
  s.food = 0;
  moveTo(s, 756, 280);
  advanceMovement(s, 20);
  assert.equal(s.destination, null);
  assert.equal(s.food, 0);
  assert.equal(s.day, 1);
  assert.deepEqual(s.position, { x: 756, y: 280 });
  advanceClock(s, (DAY_SECONDS * 16) / 24);
  assert.equal(s.hungerDays, 1);
});
test("wilderness saves restore exact position, mileage, and a stopped party", () => {
  const s = fresh();
  moveTo(s, 280, 300);
  advanceMovement(s, 1);
  const saved = restore(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(saved.position, s.position);
  assert.equal(saved.walked, s.walked);
  assert.equal(saved.location, -1);
  assert.equal(saved.destination, null);
  assert.equal(nearbyPlace({ x: 170, y: 280 }), 0);
});

import {
  WORLD,
  discoverNearby,
  advancePatrols,
  nearbyPatrols,
  tradeCaravan,
  roadEvent,
} from "../src/game.js";
test("the enlarged world reveals locations once and persists charted terrain", () => {
  const s = fresh();
  assert.equal(WORLD.width, 1536);
  assert.equal(s.discovered.includes(10), false);
  const knowledge = s.knowledge;
  s.position = { x: 350, y: 620 };
  s.location = nearbyPlace(s.position);
  discoverNearby(s);
  assert.ok(s.discovered.includes(10));
  assert.ok(s.knowledge > knowledge);
  const earned = s.knowledge;
  discoverNearby(s);
  assert.equal(s.knowledge, earned);
  const restored = restore(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.discovered, s.discovered);
  assert.deepEqual(new Set(restored.charted), new Set(s.charted));
  assert.deepEqual(restored.position, s.position);
});
test("patrols move, pause during encounters, and remain on their route after reload", () => {
  const s = fresh(),
    before = { ...s.patrols[0] };
  advancePatrols(s, 3);
  assert.notEqual(s.patrols[0].x, before.x);
  const position = s.patrols[0].x;
  s.event = { title: "Pause" };
  assert.equal(advancePatrols(s, 3), false);
  assert.equal(s.patrols[0].x, position);
  const restored = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.patrols[0].x, position);
  assert.deepEqual(restored.patrols[0].route, before.route);
});
test("caravans only trade nearby and barter discounts both caravan and town purchases", () => {
  const s = fresh();
  assert.equal(tradeCaravan(s, "caravan"), false);
  s.position = { x: s.patrols[0].x, y: s.patrols[0].y };
  assert.ok(nearbyPatrols(s).some((p) => p.id === "caravan"));
  assert.ok(tradeCaravan(s, "caravan"));
  assert.equal(s.gold, 108);
  assert.equal(s.food, 34);
  s.research.push("barter");
  assert.ok(tradeCaravan(s, "caravan"));
  assert.equal(s.gold, 98);
  s.location = 0;
  s.gold = 12;
  assert.ok(buy(s, "food"));
  assert.equal(s.gold, 0);
});
test("patrol victories keep the active contract and cannot be farmed again", () => {
  const s = fresh();
  accept(s, 2);
  const contract = { ...s.contract };
  const patrol = s.patrols.find((p) => p.id === "knives");
  assert.equal(startBattle(s, patrol.id), false);
  s.position = { x: patrol.x, y: patrol.y };
  s.location = -1;
  assert.ok(startBattle(s, patrol.id));
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { id: 0, x: 2, y: 1, hp: 1, max: 16 };
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.skirmishes, 1);
  assert.equal(s.completed, 0);
  assert.deepEqual(s.contract, contract);
  assert.equal(patrol.cleared, true);
  assert.equal(s.gold, 160);
  assert.equal(startBattle(s, patrol.id), false);
  assert.equal(
    restore(JSON.parse(JSON.stringify(s))).patrols.find(
      (p) => p.id === "knives",
    ).cleared,
    true,
  );
});
test("cartography has a real prerequisite and does not grant discovery rewards", () => {
  const s = fresh();
  s.knowledge = 20;
  assert.equal(research(s, "cartography"), false);
  assert.ok(research(s, "scouting"));
  const knowledge = s.knowledge;
  assert.ok(research(s, "cartography"));
  assert.equal(s.knowledge, knowledge - 4);
  assert.equal(s.discovered.length, places.length);
});
test("hidden stashes pay once and new event choices have concrete effects", () => {
  const s = fresh();
  s.location = 10;
  s.position = { x: 350, y: 620 };
  assert.equal(explore(s), false);
  enterSite(s);
  siteAction(s, "search", 7);
  for (const v of [2, 4, 1]) siteAction(s, "pick", v);
  siteAction(s, "leave");
  assert.equal(s.gold, 150);
  assert.equal(explore(s), false);
  s.day = 6;
  s.event = roadEvent(s);
  assert.equal(s.event.kind, "camp");
  s.food = 1;
  assert.equal(resolveEvent(s, "search"), false);
  s.food = 3;
  const wood = s.inventory.wood;
  assert.ok(resolveEvent(s, "search"));
  assert.equal(s.food, 1);
  assert.equal(s.inventory.wood, wood + 3);
  s.day = 9;
  s.event = roadEvent(s);
  s.party[1].hp = 0;
  assert.ok(resolveEvent(s, "push"));
  assert.equal(s.party[0].hp, 25);
  assert.equal(s.party[1].hp, 0);
  assert.equal(s.morale, 65);
  assert.equal(resolveEvent(s, "push"), false);
});

import {
  attackPower,
  useSkill,
  learnTalent,
  attackRange,
  movementRange,
  professionRank,
  assignProfession,
  campCost,
  healAmount,
  craftPlan,
  workSite,
} from "../src/game.js";
function battleFixture() {
  const s = fresh();
  accept(s, 0);
  travel(s, 1);
  startBattle(s);
  return s;
}
test("aimed shots validate range, spend valor once, and enforce cooldowns", () => {
  const s = battleFixture();
  assert.equal(useSkill(s, 2, 7, 1), false);
  assert.equal(s.battle.valor, 3);
  assert.ok(useSkill(s, 2, 6, 3));
  assert.equal(s.battle.enemies[1].hp, 11);
  assert.equal(s.battle.valor, 1);
  assert.equal(useSkill(s, 2, 6, 3), false);
  endTurn(s);
  assert.equal(s.battle.units[2].cooldown, 1);
  assert.equal(
    useSkill(s, 2, s.battle.enemies[1].x, s.battle.enemies[1].y),
    false,
  );
  endTurn(s);
  assert.equal(s.battle.units[2].cooldown, 0);
  assert.equal(s.battle.valor, 3);
});
test("shield bash stuns enemies and cleave hits neighboring foes", () => {
  const s = battleFixture();
  s.battle.enemies = [
    { id: 0, x: 2, y: 2, hp: 30, max: 30, damage: 9 },
    { id: 1, x: 2, y: 1, hp: 30, max: 30 },
  ];
  assert.ok(useSkill(s, 1, 2, 2));
  assert.equal(s.battle.enemies[0].stun, 1);
  const hp = s.party[1].hp;
  endTurn(s);
  assert.equal(s.party[1].hp, hp);
  assert.equal(s.battle.enemies[0].stun, 0);
  const c = battleFixture();
  c.battle.enemies = [
    { id: 0, x: 2, y: 1, hp: 30, max: 30 },
    { id: 1, x: 3, y: 1, hp: 30, max: 30 },
  ];
  assert.ok(useSkill(c, 0, 2, 1));
  assert.deepEqual(
    c.battle.enemies.map((e) => e.hp),
    [21, 21],
  );
  assert.equal(c.battle.valor, 1);
});
test("specializations share level-up points and preserve their branch in saves", () => {
  const s = fresh();
  assert.equal(learnTalent(s, 0, "duelist"), false);
  s.party[0].level = 2;
  s.party[0].points = 2;
  assert.ok(learnTalent(s, 0, "duelist"));
  assert.equal(s.party[0].points, 1);
  assert.equal(attackPower(s, s.party[0]), 9);
  assert.equal(learnTalent(s, 0, "reaver"), false);
  assert.equal(learnTalent(s, 0, "marksman"), false);
  const saved = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(saved.party[0].talent, "duelist");
  s.party[2].talent = "marksman";
  assert.equal(attackRange(s.party[2]), 5);
  assert.equal(attackRange(s.party[2], true), 6);
  s.party[3].talent = "skirmisher";
  assert.equal(movementRange(s.party[3]), 3);
});
test("bleeding can finish a fight during the enemy turn", () => {
  const s = battleFixture();
  s.party[3].talent = "bloodletter";
  s.battle.enemies = [{ id: 0, x: 3, y: 4, hp: 10, max: 10, armor: 0 }];
  assert.ok(useSkill(s, 3, 3, 4));
  assert.equal(s.battle.enemies[0].hp, 2);
  assert.equal(s.battle.enemies[0].bleed, 2);
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.completed, 1);
});
test("rooting prevents movement but permits ranged attacks, and archers retreat from melee", () => {
  const s = battleFixture();
  s.party[2].talent = "pinning";
  s.battle.enemies = [
    { id: 0, x: 6, y: 3, hp: 30, max: 30, kind: "archer", damage: 4 },
  ];
  assert.ok(useSkill(s, 2, 6, 3));
  endTurn(s);
  assert.equal(s.battle.enemies[0].x, 6);
  assert.equal(s.battle.enemies[0].root, 1);
  const r = battleFixture();
  r.battle.enemies = [
    { id: 0, x: 2, y: 1, hp: 30, max: 30, kind: "archer", damage: 4 },
  ];
  endTurn(r);
  assert.notDeepEqual(
    { x: r.battle.enemies[0].x, y: r.battle.enemies[0].y },
    { x: 2, y: 1 },
  );
  assert.ok(r.party[0].hp < 28);
});
test("bulwark protects adjacent allies and bracing restores capped valor", () => {
  const s = battleFixture();
  s.party[1].talent = "bulwark";
  s.battle.enemies = [{ id: 0, x: 2, y: 1, hp: 30, max: 30, damage: 5 }];
  s.battle.valor = 5;
  assert.ok(guard(s, 1));
  assert.equal(s.battle.valor, 5);
  endTurn(s);
  assert.equal(s.party[0].hp, 25);
  assert.equal(s.battle.valor, 5);
});
test("profession assignments retain independent experience and rank bonuses are real", () => {
  const s = fresh();
  s.party[0].professionXP = 8;
  assert.equal(professionRank(s.party[0]), 2);
  assert.equal(craftPlan(s, "blade").cost.ore, 1);
  assert.ok(assignProfession(s, 0, "Cook"));
  assert.equal(s.party[0].professionXP, 0);
  assert.ok(assignProfession(s, 0, "Smith"));
  assert.equal(s.party[0].professionXP, 8);
  assert.equal(assignProfession(s, 0, "Mage"), false);
  s.party[3].professionXP = 3;
  assert.equal(campCost(s), 3);
  s.party[2].professionXP = 8;
  assert.equal(healAmount(s), 21);
  const saved = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(saved.party[0].professionXPBy.Smith, 8);
});
test("repeated fieldwork advances professions and costs supplies and time", () => {
  const s = fresh();
  travel(s, 4);
  const food = s.food,
    day = s.day;
  assert.ok(workSite(s));
  assert.equal(s.inventory.ore, 3);
  assert.equal(s.party[1].professionXP, 2);
  assert.ok(workSite(s));
  assert.equal(professionRank(s.party[1]), 1);
  assert.ok(workSite(s));
  assert.equal(s.inventory.ore, 11);
  assert.equal(s.food, food - 10);
  assert.equal(s.day, day + 1);
  s.food = 1;
  assert.equal(workSite(s), false);
});
test("crafting uses the proper profession and higher ranks increase output", () => {
  const s = fresh();
  s.inventory.herbs = 9;
  s.inventory.wood = 2;
  s.party[2].professionXP = 8;
  s.party[3].professionXP = 3;
  assert.ok(craft(s, "medicine"));
  assert.equal(s.inventory.medicine, 3);
  assert.equal(s.party[2].professionXP, 9);
  assert.equal(s.party[0].professionXP, 0);
  assert.ok(craft(s, "meal"));
  assert.equal(s.food, 34);
  s.party[2].hp = 0;
  assert.equal(craft(s, "medicine"), false);
});

import { contracts, buyGear } from "../src/game.js";
test("village offers disappear outside towns and gear purchases equip the selected companion", () => {
  const s = fresh();
  assert.equal(contracts(s).length, 4);
  assert.ok(buyGear(s, "weapon", 1));
  assert.equal(s.party[1].weapon, 2);
  assert.equal(s.gold, 85);
  assert.ok(buyGear(s, "armor", 0));
  assert.equal(s.party[0].armor, 1);
  s.location = -1;
  assert.deepEqual(contracts(s), []);
  assert.equal(accept(s, 0), false);
  assert.equal(buyGear(s, "armor"), false);
  s.location = 0;
  s.gold = 200;
  s.party[0].weapon = 4;
  assert.equal(buyGear(s, "weapon"), false);
  assert.equal(s.gold, 200);
});
test("caravan attacks require proximity, end trade, persist hostility and award cargo without clearing contracts", () => {
  const s = fresh();
  accept(s, 2);
  const contract = s.contract;
  assert.equal(startBattle(s, "caravan"), false);
  s.position = { x: s.patrols[0].x, y: s.patrols[0].y };
  assert.ok(startBattle(s, "caravan"));
  assert.equal(s.morale, 65);
  assert.equal(s.battle.caravanRaid, true);
  assert.equal(restore(s).patrols[0].hostile, true);
  assert.equal(tradeCaravan(s, "caravan"), false);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { id: 0, x: 2, y: 1, hp: 1, max: 16 };
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.battle, null);
  assert.equal(s.gold, 180);
  assert.equal(s.food, 34);
  assert.equal(s.renown, 0);
  assert.equal(s.contract, contract);
  assert.equal(s.patrols[0].cleared, true);
  assert.equal(startBattle(s, "caravan"), false);
});

import {
  companyStanding,
  contractDifficulty,
  sell,
  restAtInn,
  innCost,
} from "../src/game.js";
test("village boards offer local work and enforce renown requirements at acceptance", () => {
  const s = fresh();
  assert.equal(companyStanding(s).name, "Greenhands");
  assert.equal(companyStanding(s).next.renown, 5);
  const greyJobs = contracts(s);
  assert.equal(accept(s, 3), false);
  assert.equal(s.contract, null);
  s.location = 3;
  assert.notDeepEqual(
    contracts(s).map((c) => c.name),
    greyJobs.map((c) => c.name),
  );
  assert.equal(accept(s, 2), false);
  s.renown = 5;
  assert.equal(companyStanding(s).name, "Proven company");
  assert.ok(accept(s, 2));
  assert.equal(s.contract.issuer, 3);
  assert.equal(s.contract.target, 6);
  s.contract = null;
  s.location = 6;
  s.renown = 14;
  assert.equal(accept(s, 2), false);
  s.renown = 15;
  assert.ok(accept(s, 2));
  assert.equal(contractDifficulty(s.contract).enemies, 5);
  assert.equal(restore(s).contract.tier, 3);
  s.renown = 30;
  assert.equal(companyStanding(s).next, null);
});
test("dangerous contracts increase enemy strength and progression while old contracts stay standard", () => {
  const s = fresh();
  s.renown = 5;
  assert.ok(accept(s, 3));
  s.location = s.contract.target;
  assert.ok(startBattle(s));
  assert.equal(s.battle.enemies.length, 4);
  assert.equal(s.battle.enemies[0].hp, 20);
  assert.equal(s.battle.enemies[0].damage, 6);
  assert.equal(new Set(s.battle.enemies.map((e) => `${e.x},${e.y}`)).size, 4);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { id: 0, x: 2, y: 1, hp: 1, max: 20 };
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.gold, 250);
  assert.equal(s.renown, 15);
  assert.equal(s.knowledge, 3);
  assert.equal(s.inventory.ore, 3);
  assert.equal(s.party[0].level, 2);
  assert.equal(s.party[0].xp, 15);
  assert.equal(s.contract, null);
  assert.equal(contractDifficulty({ target: 1, reward: 65 }).enemies, 3);
});
test("market resale validates inventory and quantity and cannot create a buying profit loop", () => {
  const s = fresh();
  assert.ok(buy(s, "ore"));
  assert.equal(s.gold, 110);
  assert.equal(sell(s, "ore", 4), false);
  for (const quantity of [
    -1,
    0,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    assert.equal(sell(s, "ore", quantity), false);
  assert.equal(sell(s, "gold"), false);
  assert.ok(sell(s, "ore", 3));
  assert.equal(s.gold, 116);
  assert.equal(s.inventory.ore, 0);
  assert.equal(sell(s, "ore"), false);
  s.inventory.wood = 3;
  s.location = -1;
  assert.equal(sell(s, "wood"), false);
  s.location = 0;
  s.event = { kind: "courier" };
  assert.equal(sell(s, "wood"), false);
  s.event = null;
  s.battle = {};
  assert.equal(sell(s, "wood"), false);
  s.battle = null;
  assert.ok(sell(s, "wood", 3));
  assert.equal(s.gold, 119);
});
test("inn recovery includes incapacitated companions, wages and meals without consuming rations", () => {
  const s = fresh();
  s.party[0].hp = 0;
  s.party[0].injury = true;
  s.party[1].hp = 2;
  s.morale = 96;
  assert.equal(innCost(s), 24);
  assert.ok(restAtInn(s));
  assert.equal(s.gold, 96);
  assert.equal(s.food, 24);
  assert.equal(s.day, 2);
  assert.equal(s.morale, 100);
  assert.ok(s.party.every((p) => p.hp === p.max && !p.injury));
  s.gold = 23;
  const before = structuredClone(s);
  assert.equal(restAtInn(s), false);
  assert.deepEqual(s, before);
  s.gold = 100;
  s.location = -1;
  assert.equal(restAtInn(s), false);
  s.location = 0;
  s.event = { kind: "courier" };
  assert.equal(restAtInn(s), false);
  s.event = null;
  s.battle = {};
  assert.equal(restAtInn(s), false);
  s.battle = null;
  recruit(s);
  assert.equal(innCost(s), 30);
  assert.ok(restAtInn(s));
  assert.equal(restore(s).party[0].hp, s.party[0].max);
});

test("elite contracts deploy five stronger enemies and legacy accepted work remains valid", () => {
  const s = fresh();
  s.location = 6;
  s.renown = 15;
  assert.ok(accept(s, 2));
  s.location = 11;
  assert.ok(startBattle(s));
  assert.equal(s.battle.enemies.length, 5);
  assert.equal(s.battle.enemies[0].hp, 24);
  assert.equal(s.battle.enemies[0].damage, 7);
  assert.equal(new Set(s.battle.enemies.map((e) => `${e.x},${e.y}`)).size, 5);
  assert.equal(restore(s).battle.enemies.length, 5);
  const old = fresh();
  old.contract = {
    name: "A crown in the dirt",
    kind: "battle",
    target: 11,
    reward: 180,
  };
  old.position = { x: places[11].x, y: places[11].y };
  old.location = 11;
  const migrated = restore(old);
  assert.ok(startBattle(migrated));
  assert.equal(migrated.battle.enemies.length, 3);
});

import {
  equipmentCatalog,
  grantEquipment,
  gearItem,
  gearOwner,
  equippedItem,
  armorPower,
  equipEquipment,
  unequipEquipment,
  buyEquipment,
  sellEquipment,
  equipmentRecipe,
  craftEquipment,
} from "../src/game.js";
test("gear slots apply real combat bonuses, respect classes, replace items and transfer without duplication", () => {
  const s = fresh();
  const sword = grantEquipment(s, "sword-1"),
    mace = grantEquipment(s, "mace-1"),
    armor = grantEquipment(s, "armor-1");
  const attack = attackPower(s, s.party[0]);
  assert.equal(equipEquipment(s, sword, 2), false);
  assert.ok(equipEquipment(s, sword, 0));
  assert.equal(attackPower(s, s.party[0]), attack + 2);
  assert.equal(equipEquipment(s, sword, 0), false);
  assert.ok(equipEquipment(s, armor, 0));
  assert.equal(armorPower(s, s.party[0]), 1);
  assert.ok(equipEquipment(s, armor, 1));
  assert.equal(armorPower(s, s.party[0]), 0);
  assert.equal(gearOwner(s, armor).id, 1);
  assert.equal(s.gear.length, 3);
  s.party[0].weapon = 2;
  assert.equal(attackPower(s, s.party[0]), attack + 4);
  const replacement = grantEquipment(s, "sword-2");
  assert.ok(equipEquipment(s, replacement, 0));
  assert.equal(gearOwner(s, sword), null);
  assert.equal(attackPower(s, s.party[0]), attack + 5);
  assert.ok(unequipEquipment(s, 0, "weapon"));
  assert.equal(attackPower(s, s.party[0]), attack + 2);
  assert.equal(unequipEquipment(s, 0, "weapon"), false);
  assert.equal(unequipEquipment(s, 0, "invalid"), false);
  assert.equal(equipEquipment(s, 999, 0), false);
  assert.equal(equipEquipment(s, mace, 99), false);
  s.battle = {};
  assert.equal(equipEquipment(s, mace, 1), false);
  assert.equal(unequipEquipment(s, 1, "armor"), false);
  s.battle = null;
  s.event = { kind: "courier" };
  assert.equal(equipEquipment(s, mace, 1), false);
});
test("equipped armor reduces enemy damage rather than only changing the displayed stat", () => {
  const s = fresh();
  equipEquipment(s, grantEquipment(s, "armor-2"), 0);
  s.contract = { target: 1, reward: 65 };
  s.location = 1;
  startBattle(s);
  s.battle.enemies = [
    { id: 0, x: 2, y: 1, hp: 20, max: 20, damage: 5, kind: "raider" },
  ];
  endTurn(s);
  assert.equal(s.party[0].hp, 25);
});
test("blacksmith purchases and resale validate stock, standing, ownership, funds and village access", () => {
  const s = fresh();
  assert.equal(buyEquipment(s, "sword-3"), false);
  assert.equal(buyEquipment(s, "sword-2"), false);
  assert.equal(buyEquipment(s, "missing"), false);
  assert.ok(buyEquipment(s, "sword-1"));
  assert.equal(s.gold, 88);
  const sword = s.gear[0].id;
  equipEquipment(s, sword, 0);
  assert.equal(sellEquipment(s, sword), false);
  unequipEquipment(s, 0, "weapon");
  assert.ok(sellEquipment(s, sword));
  assert.equal(s.gold, 100);
  assert.equal(sellEquipment(s, sword), false);
  s.research.push("barter");
  s.renown = 5;
  assert.ok(buyEquipment(s, "bow-2"));
  assert.equal(s.gold, 44);
  s.location = -1;
  assert.equal(buyEquipment(s, "armor-1"), false);
  assert.equal(sellEquipment(s, s.gear[0].id), false);
  s.location = 0;
  s.gold = 1;
  assert.equal(buyEquipment(s, "armor-1"), false);
  assert.equal(s.gear.length, 1);
});
test("battle loot matches encounter tier, stays in inventory, and is never auto-equipped", () => {
  for (const tier of [1, 2, 3]) {
    const s = fresh();
    s.contract = { target: 1, reward: 65, tier };
    s.location = 1;
    startBattle(s);
    s.battle.enemies = [{ id: 0, x: 2, y: 1, hp: 1, max: 1 }];
    act(s, 0, 2, 1);
    assert.equal(s.gear.length, 1);
    assert.equal(gearItem(s, s.gear[0].id).tier, tier);
    assert.equal(gearOwner(s, s.gear[0].id), null);
    assert.equal(s.party[0].equipment.weapon, null);
  }
});
test("fine gear crafting requires research and a conscious Smith, consumes ranked costs, and adds practice", () => {
  const s = fresh();
  s.inventory.ore = 20;
  s.inventory.wood = 10;
  s.knowledge = 20;
  assert.equal(research(s, "armorer"), false);
  assert.equal(craftEquipment(s, "sword-2"), false);
  assert.ok(research(s, "steel"));
  assert.ok(research(s, "armorer"));
  s.party[0].professionXP = 8;
  assert.equal(equipmentRecipe(s, "sword-2").ore, 3);
  assert.ok(craftEquipment(s, "sword-2"));
  assert.equal(s.inventory.ore, 17);
  assert.equal(s.inventory.wood, 8);
  assert.equal(s.party[0].professionXP, 10);
  assert.equal(gearItem(s, s.gear[0].id).name, "Tempered sword");
  assert.equal(craftEquipment(s, "sword-3"), false);
  s.party[0].hp = 0;
  assert.equal(craftEquipment(s, "armor-2"), false);
  s.party[0].hp = s.party[0].max;
  s.inventory.ore = 0;
  assert.equal(craftEquipment(s, "armor-2"), false);
});
test("gear migration preserves old upgrades and valid equipment while rejecting duplicate IDs and invalid assignments", () => {
  const old = fresh();
  old.version = 6;
  delete old.gear;
  delete old.nextGearId;
  old.party[0].weapon = 4;
  old.party[0].armor = 3;
  delete old.party[0].equipment;
  const migrated = restore(old);
  assert.equal(migrated.version, 13);
  assert.deepEqual(migrated.gear, []);
  assert.equal(migrated.party[0].weapon, 4);
  assert.equal(armorPower(migrated, migrated.party[0]), 3);
  const s = fresh();
  const sword = grantEquipment(s, "sword-2"),
    armor = grantEquipment(s, "armor-3");
  equipEquipment(s, sword, 0);
  equipEquipment(s, armor, 1);
  const loaded = restore(s);
  assert.equal(
    equippedItem(loaded, loaded.party[0], "weapon").name,
    "Tempered sword",
  );
  assert.equal(armorPower(loaded, loaded.party[1]), 3);
  assert.equal(grantEquipment(loaded, "bow-1"), 3);
  s.gear.push(
    { id: sword, template: "bow-1" },
    { id: 99, template: "fake" },
    { id: -2, template: "sword-1" },
  );
  s.party[1].equipment.weapon = sword;
  s.party[2].equipment.armor = armor;
  s.party[3].equipment.weapon = armor;
  const sanitized = restore(s);
  assert.equal(sanitized.gear.length, 2);
  assert.equal(sanitized.party[1].equipment.weapon, null);
  assert.equal(sanitized.party[2].equipment.armor, null);
  assert.equal(sanitized.party[3].equipment.weapon, null);
  assert.equal(grantEquipment(sanitized, "missing"), false);
});
