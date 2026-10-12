import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  recruitmentOffers,
  recruit,
  dailyWages,
  campCost,
  innCost,
  restAtInn,
  spendHours,
  traitSummary,
  changeResolve,
  bondValue,
  bondLabel,
  changeBond,
  bondSupport,
  bondProtection,
  shareStories,
  openCamp,
  camp,
  heal,
  startBattle,
  act,
  endTurn,
  attackPower,
  guard,
  restore,
} from "../src/game.js";
const battle = () => {
  const s = fresh();
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  return s;
};

test("village recruitment previews actual trait costs, rejects unknown offers and removes hired specialists", () => {
  const s = fresh();
  s.gold = 500;
  const offers = recruitmentOffers(s);
  assert.equal(offers.length, 4);
  assert.equal(offers.find((p) => p.id === "0-veteran").cost, 80);
  assert.equal(recruit(s, "fake"), false);
  assert.ok(recruit(s, "0-veteran"));
  const p = s.party[4];
  assert.equal(p.name, "Veyra");
  assert.equal(traitSummary(p), "Mercenary");
  assert.equal(s.gold, 420);
  assert.equal(dailyWages(s), 11);
  assert.equal(innCost(s), 31);
  assert.equal(attackPower(s, p), 7);
  assert.equal(recruit(s, "0-veteran"), false);
  assert.equal(recruitmentOffers(s).length, 3);
  spendHours(s, 16);
  assert.equal(s.gold, 409);
  assert.equal(s.food, 19);
  const gold = s.gold;
  assert.ok(restAtInn(s));
  assert.equal(s.gold, gold - 31);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(recruit(loaded, "0-veteran"), false);
  s.location = -1;
  assert.deepEqual(recruitmentOffers(s), []);
  assert.equal(recruit(s), false);
});

test("a hardy hire gains health at the price of an extra daily ration, while a tireless hire accumulates less fatigue", () => {
  const s = fresh();
  s.gold = 200;
  assert.ok(recruit(s, "0-ranger"));
  assert.equal(s.party[4].max, 32);
  assert.equal(campCost(s), 6);
  spendHours(s, 16);
  assert.equal(s.food, 18);
  assert.equal(s.gold, 140);
  const r = fresh();
  r.gold = 200;
  r.food = 100;
  assert.ok(recruit(r));
  spendHours(r, 25);
  assert.equal(r.party[4].fatigue, 37.5);
  assert.equal(r.party[0].fatigue, 50);
});

test("resolve reacts to hunger, unpaid wages and exhaustion, and resolute companions withstand hardship", () => {
  const s = fresh();
  s.food = 0;
  s.gold = 0;
  s.party[1].traits = ["mercenary"];
  s.party[2].fatigue = 90;
  spendHours(s, 16);
  assert.equal(s.party[0].resolve, 58);
  assert.equal(s.party[1].resolve, 47);
  assert.equal(s.party[2].resolve, 49);
  const p = s.party[3];
  changeResolve(p, -1000);
  assert.equal(p.resolve, 0);
  assert.equal(attackPower(s, p), p.damage - 1 - 1); // injury plus disheartened penalty
  changeResolve(p, 1000);
  assert.equal(p.resolve, 100);
});

test("camp conversations cost time and food, boost selected companions, and cannot be repeated or self-targeted", () => {
  const s = fresh();
  assert.equal(shareStories(s, 0, 3), false);
  openCamp(s);
  assert.equal(shareStories(s, 0, 0), false);
  assert.equal(shareStories(s, "0", 3), false);
  assert.ok(shareStories(s, 0, 3));
  assert.equal(s.food, 22);
  assert.equal(s.timeOfDay, 10);
  assert.equal(bondValue(s, 0, 3), 5);
  assert.equal(s.party[0].resolve, 73);
  assert.equal(s.party[3].resolve, 73);
  assert.equal(bondValue(s, 0, 1), 0);
  assert.equal(shareStories(s, 1, 2), false);
  s.day++;
  s.food = 1;
  assert.equal(shareStories(s, 1, 2), false);
});

test("travel meals, fed rests and medicine grow bonds while repeated same-day rests cannot farm them", () => {
  const s = fresh();
  spendHours(s, 16);
  assert.equal(bondValue(s, 0, 1), 1);
  s.timeOfDay = 1;
  camp(s);
  assert.equal(bondValue(s, 0, 1), 3);
  assert.equal(s.party[0].resolve, 72);
  s.timeOfDay = 1;
  camp(s);
  assert.equal(bondValue(s, 0, 1), 3);
  s.party[0].hp = 1;
  assert.ok(heal(s, 0));
  assert.equal(bondValue(s, 0, 2), 6);
  assert.equal(s.party[0].resolve, 75);
  s.food = 0;
  camp(s);
  assert.equal(bondValue(s, 0, 1), 3);
});

test("trusted adjacent friends add one real attack damage, and moving away or being disheartened removes support", () => {
  const s = battle(),
    b = s.battle,
    p = s.party[0],
    u = b.units[0],
    ally = b.units[1],
    e = b.enemies[0];
  changeBond(s, 0, 1, 25);
  u.x = 3;
  u.y = 1;
  ally.x = 3;
  ally.y = 2;
  e.x = 4;
  e.y = 1;
  assert.equal(bondSupport(s, p), 1);
  assert.equal(attackPower(s, p), 8);
  const hp = e.hp;
  assert.ok(act(s, 0, 4, 1));
  assert.equal(e.hp, hp - 8);
  ally.x = 1;
  assert.equal(bondSupport(s, p), 0);
  ally.x = 3;
  p.resolve = 24;
  assert.equal(bondSupport(s, p), 0);
  assert.equal(attackPower(s, p), 6);
  assert.equal(bondLabel(25), "Trusted");
  assert.equal(bondLabel(50), "Sworn companions");
});

test("a trusted steadfast guard reduces actual incoming damage and the best adjacent protection wins", () => {
  const s = battle(),
    b = s.battle;
  changeBond(s, 0, 1, 25);
  changeBond(s, 0, 2, 25);
  b.units[0].x = 4;
  b.units[0].y = 3;
  b.units[1].x = 4;
  b.units[1].y = 4;
  b.units[2].x = 4;
  b.units[2].y = 2;
  guard(s, 2);
  guard(s, 1);
  assert.equal(bondProtection(s, b.units[0]), 2);
  b.enemies = [
    { id: 0, x: 3, y: 3, hp: 16, max: 16, kind: "raider", damage: 5 },
  ];
  endTurn(s);
  assert.equal(s.party[0].hp, 25);
  assert.equal(bondProtection(s, b.units[0]), 0);
});

test("combat victories build bonds only between conscious survivors", () => {
  const s = battle(),
    b = s.battle;
  s.party[2].hp = 0;
  b.enemies.forEach((e) => (e.hp = 0));
  b.enemies[0] = { ...b.enemies[0], hp: 1, x: 2, y: 1 };
  assert.ok(act(s, 0, 2, 1));
  assert.equal(bondValue(s, 0, 1), 3);
  assert.equal(bondValue(s, 0, 2), 0);
  assert.equal(s.party[0].resolve, 70);
});

test("compassionate companions react to peaceful caravan attacks and trusted survivors grieve starvation deaths", () => {
  const s = fresh(),
    caravan = s.patrols.find((p) => p.kind === "merchant");
  s.position = { x: caravan.x, y: caravan.y };
  s.location = -1;
  assert.ok(startBattle(s, caravan.id));
  assert.equal(s.party[2].resolve, 57);
  assert.equal(s.party[0].resolve, 65);
  const r = fresh();
  changeBond(r, 2, 3, 25);
  r.party[3].hp = 1;
  r.food = 0;
  spendHours(r, 16);
  assert.equal(r.party[3].dead, true);
  assert.equal(r.party[2].resolve, 45);
  assert.equal(r.party[1].resolve, 51);
  r.gold = 200;
  assert.ok(recruit(r));
  assert.equal(bondValue(r, 2, 3), 0);
  assert.equal(r.party[3].resolve, 65);
});

test("save migration retains personality, bonds and hired offers while sanitizing malformed fields", () => {
  const s = fresh();
  changeBond(s, 0, 1, 50);
  s.lastConversationDay = 1;
  s.party[0].resolve = 20;
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.version, 21);
  assert.equal(loaded.party[0].resolve, 20);
  assert.equal(bondValue(loaded, 1, 0), 50);
  assert.equal(loaded.lastConversationDay, 1);
  s.party[0].traits = ["resolute", "fake", "resolute"];
  s.party[1].resolve = Infinity;
  s.bonds = { "0:1": 500, "1:0": 25, "0:999": 50, "1:2": -5 };
  s.hiredRecruits = ["0-veteran", "bad", "0-veteran"];
  const clean = restore(s);
  assert.deepEqual(clean.party[0].traits, ["resolute"]);
  assert.equal(clean.party[1].resolve, 65);
  assert.deepEqual(clean.bonds, { "0:1": 100, "1:2": 0 });
  assert.deepEqual(clean.hiredRecruits, ["0-veteran"]);
  const old = fresh();
  old.version = 9;
  delete old.bonds;
  old.party.forEach((p) => {
    delete p.resolve;
    delete p.traits;
  });
  const migrated = restore(old);
  assert.equal(migrated.gold, 120);
  assert.equal(migrated.party[0].resolve, 65);
  assert.deepEqual(migrated.party[0].traits, ["resolute"]);
  assert.deepEqual(migrated.bonds, {});
});
