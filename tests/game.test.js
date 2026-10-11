import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
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
test("camp requires wages and food and heals wounds", () => {
  const s = fresh();
  s.party[0].hp = 5;
  assert.ok(camp(s));
  assert.equal(s.party[0].hp, 15);
  assert.equal(s.gold, 112);
  s.food = 0;
  assert.equal(camp(s), false);
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
  assert.equal(s.gold, 185);
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
  assert.equal(migrated.version, 4);
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
  assert.equal(s.gold, 132);
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
  assert.equal(s.gold, 165);
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
test("distance costs persist across short clicks, research lowers upkeep", () => {
  const s = fresh();
  for (let i = 0; i < 4; i++) {
    moveTo(s, s.position.x + 40, s.position.y);
    advanceMovement(s, 1);
  }
  assert.equal(s.food, 20);
  assert.equal(s.day, 2);
  const r = fresh();
  r.research = ["rations"];
  moveTo(r, 340, 280);
  advanceMovement(r, 3);
  assert.equal(r.food, 21);
  assert.equal(r.day, 2);
});
test("movement clamps boundaries, pauses for encounters, and stops when out of food", () => {
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
  assert.ok(s.log[0].includes("Provisions exhausted"));
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
  assert.equal(s.discovered.length, 12);
});
test("hidden stashes pay once and new event choices have concrete effects", () => {
  const s = fresh();
  s.location = 10;
  s.position = { x: 350, y: 620 };
  assert.ok(explore(s));
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
