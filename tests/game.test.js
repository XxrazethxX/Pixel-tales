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
  assert.equal(migrated.version, 3);
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
  assert.deepEqual(s.destination, { x: 12, y: 414 });
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
