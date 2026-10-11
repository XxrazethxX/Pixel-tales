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
  assert.equal(migrated.version, 2);
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
