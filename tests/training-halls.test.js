import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  villageTutors,
  lessonQuote,
  lessonLock,
  takeLesson,
  professionRank,
  assignProfession,
  restore,
  dailyWages,
  campCost,
} from "../src/game.js";
const company = () => {
  const s = fresh();
  s.gold = 500;
  s.renown = 30;
  return s;
};
const arrive = (s, i) => {
  s.location = i;
  s.position = { x: places[i].x, y: places[i].y };
};
test("villages offer distinct tutors and reject professions they do not teach", () => {
  const s = company();
  assert.deepEqual(villageTutors[0], ["Cook", "Smith"]);
  assert.equal(takeLesson(s, 1), false);
  assert.match(lessonLock(s, 1), /does not teach Miner/);
  arrive(s, 6);
  assert.equal(takeLesson(s, 1), true);
  assert.equal(s.party[1].professionXP, 3);
});
test("a lesson purchases a rank with exact crowns, time, fatigue and retained profession experience", () => {
  const s = company();
  const q = lessonQuote(s, 0);
  assert.equal(takeLesson(s, 0), true);
  assert.equal(s.gold, 500 - q.price);
  assert.equal(s.timeOfDay, 11);
  assert.equal(professionRank(s.party[0]), 1);
  assert.equal(s.party[0].professionXPBy.Smith, 3);
  assert.equal(s.party[1].fatigue, 6);
});
test("daily lock follows companions across villages and profession changes, including reload", () => {
  const s = company();
  takeLesson(s, 0);
  assignProfession(s, 0, "Cook");
  assert.equal(takeLesson(s, 0), false);
  arrive(s, 3);
  assert.equal(takeLesson(s, 0), false);
  const copy = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(takeLesson(copy, 0), false);
  copy.day++;
  assert.equal(takeLesson(copy, 0), true);
});
test("one companion can learn without blocking another", () => {
  const s = company();
  takeLesson(s, 0);
  assert.equal(takeLesson(s, 3), true);
  assert.equal(s.timeOfDay, 14);
});
test("rank progression has renown gates and mastery stops paid lessons", () => {
  const s = company();
  s.renown = 0;
  s.party[0].professionXP = 3;
  assert.equal(takeLesson(s, 0), false);
  s.renown = 5;
  assert.equal(takeLesson(s, 0), true);
  s.day++;
  s.party[0].professionXP = 8;
  assert.equal(takeLesson(s, 0), false);
  s.renown = 15;
  assert.equal(takeLesson(s, 0), true);
  s.day++;
  s.party[0].professionXP = 15;
  assert.equal(takeLesson(s, 0), false);
  assert.match(lessonLock(s, 0), /Already a Master/);
});
test("regional tuition rises with rank and barter applies rounded discounts", () => {
  const s = company();
  assert.equal(lessonQuote(s, 0).price, 24);
  s.party[0].professionXP = 3;
  assert.equal(lessonQuote(s, 0).price, 36);
  arrive(s, 6);
  assert.equal(lessonQuote(s, 0).price, 44);
  s.research = ["barter"];
  assert.equal(lessonQuote(s, 0).price, 36);
});
test("failed purchases preserve resources and progress", () => {
  const s = company();
  s.gold = 23;
  const before = JSON.stringify(s);
  assert.equal(takeLesson(s, 0), false);
  assert.equal(JSON.stringify(s), before);
  assert.equal(lessonQuote(s, 99), null);
  assert.equal(takeLesson(s, 99), false);
});
test("lessons reject wilderness, camp, travel, encounters and incapacitated companions", () => {
  for (const mode of [
    "wild",
    "camp",
    "travel",
    "battle",
    "event",
    "dead",
    "wounded",
  ]) {
    const s = company();
    if (mode === "wild") arrive(s, 1);
    if (mode === "camp") s.campOpen = true;
    if (mode === "travel") s.destination = { x: 200, y: 200 };
    if (mode === "battle") s.battle = {};
    if (mode === "event") s.event = {};
    if (mode === "dead") s.party[0].dead = true;
    if (mode === "wounded") s.party[0].hp = 0;
    assert.equal(takeLesson(s, 0), false, mode);
    assert.equal(s.gold, 500);
  }
});
test("midnight lessons pay daily upkeep and use their completion day for the lock", () => {
  const s = company();
  s.timeOfDay = 23;
  const cost = lessonQuote(s, 0).price,
    wages = dailyWages(s),
    food = campCost(s);
  takeLesson(s, 0);
  assert.equal(s.day, 2);
  assert.equal(s.timeOfDay, 2);
  assert.equal(s.gold, 500 - cost - wages);
  assert.equal(s.food, 24 - food);
  assert.equal(s.lessonLedger[0], 2);
  assert.equal(takeLesson(s, 0), false);
});
test("old saves migrate with empty ledgers; invalid days and unknown companions are removed", () => {
  const s = company();
  delete s.lessonLedger;
  assert.deepEqual(restore(s).lessonLedger, {});
  s.lessonLedger = { 0: 1, 1: 2, 2: -1, 3: 1.5, 99: 1 };
  assert.deepEqual(restore(s).lessonLedger, { 0: 1 });
});
