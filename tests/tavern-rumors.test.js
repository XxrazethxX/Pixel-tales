import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  tavernRumors,
  hearRumor,
  rumorLock,
  explore as exploreWorld,
  enterSite,
  siteAction,
  resolveRumors,
  restore,
  dailyWages,
  campCost,
} from "../src/game.js";
const explore = (s) => {
  if (![4, 9, 10].includes(s.location)) return exploreWorld(s);
  if (s.explored.includes(s.location) || !enterSite(s)) return false;
  if (s.location === 10) {
    siteAction(s, "search", 8);
    siteAction(s, "search", 2);
    siteAction(s, "search", 7);
    for (const n of [2, 4, 1]) siteAction(s, "pick", n);
    siteAction(s, "take-all");
  } else {
    siteAction(s, "vein");
    siteAction(s, "mine");
  }
  siteAction(s, "leave");
  return true;
};
const arrive = (s, i) => {
  s.location = i;
  s.position = { x: places[i].x, y: places[i].y };
};
const company = (rumor = tavernRumors[0]) => {
  const s = fresh();
  s.gold = 500;
  s.renown = 20;
  arrive(s, rumor.issuer);
  return s;
};
test("a tavern lead marks only its landmark, costs a round and an hour, and preserves contracts", () => {
  const s = company();
  s.contract = { name: "Existing work", target: 1, reward: 65 };
  const chart = s.charted.slice();
  assert.equal(hearRumor(s, "hidden-compartment"), true);
  assert.equal(s.gold, 492);
  assert.equal(s.timeOfDay, 9);
  assert.ok(s.discovered.includes(10));
  assert.deepEqual(s.charted, chart);
  assert.equal(s.contract.name, "Existing work");
  assert.equal(s.rumors["hidden-compartment"].heardDay, 1);
});
for (const r of tavernRumors)
  test(`${r.name} rewards exploration exactly once and persists in saves`, () => {
    const s = company(r);
    hearRumor(s, r.id);
    arrive(s, r.target);
    const control = JSON.parse(JSON.stringify(s));
    control.rumors = {};
    assert.equal(explore(control), true);
    assert.equal(explore(s), true);
    for (const [resource, value] of Object.entries(r.reward))
      assert.equal(
        resource === "gold" || resource === "knowledge"
          ? s[resource] - control[resource]
          : s.inventory[resource] - control.inventory[resource],
        value,
      );
    assert.equal(s.rumors[r.id].resolvedDay, 1);
    const before = JSON.stringify(s);
    resolveRumors(s);
    assert.equal(explore(s), false);
    assert.equal(JSON.stringify(s), before);
    const copy = restore(JSON.parse(JSON.stringify(s)));
    assert.equal(copy.rumors[r.id].resolvedDay, 1);
    const gold = copy.gold;
    resolveRumors(copy);
    assert.equal(copy.gold, gold);
  });
test("multiple rumors coexist with a contract and discoveries do not require a return trip", () => {
  const s = company();
  s.contract = { target: 1, reward: 65 };
  hearRumor(s, "hidden-compartment");
  hearRumor(s, "iron-seam");
  arrive(s, 4);
  explore(s);
  assert.ok(s.rumors["iron-seam"].resolvedDay);
  assert.equal(s.rumors["hidden-compartment"].resolvedDay, undefined);
  assert.equal(s.contract.target, 1);
});
test("tavern context, renown, funds and already-explored gates are atomic", () => {
  for (const mode of [
    "wrong-town",
    "renown",
    "funds",
    "explored",
    "battle",
    "event",
    "camp",
    "travel",
    "lost",
  ]) {
    const r = tavernRumors[3],
      s = company(r);
    if (mode === "wrong-town") arrive(s, 0);
    if (mode === "renown") s.renown = 0;
    if (mode === "funds") s.gold = 7;
    if (mode === "explored") s.explored.push(r.target);
    if (mode === "battle") s.battle = {};
    if (mode === "event") s.event = {};
    if (mode === "camp") s.campOpen = true;
    if (mode === "travel") s.destination = { x: 500, y: 300 };
    if (mode === "lost") s.party.forEach((p) => (p.dead = true));
    const before = JSON.stringify(s);
    assert.equal(hearRumor(s, r.id), false, mode);
    assert.equal(JSON.stringify(s), before);
  }
});
test("heard rumors cannot be paid for twice, even after a reload", () => {
  const s = company();
  hearRumor(s, "hidden-compartment");
  const copy = restore(s);
  assert.equal(hearRumor(copy, "hidden-compartment"), false);
  assert.equal(copy.gold, 492);
  assert.match(rumorLock(copy, "hidden-compartment"), /Already heard/);
  assert.equal(hearRumor(copy, "unknown"), false);
});
test("hearing a midnight rumor still pays wages and consumes food", () => {
  const s = company();
  s.timeOfDay = 23;
  const wages = dailyWages(s),
    food = campCost(s);
  hearRumor(s, "hidden-compartment");
  assert.equal(s.day, 2);
  assert.equal(s.gold, 500 - 8 - wages);
  assert.equal(s.food, 24 - food);
  assert.equal(s.rumors["hidden-compartment"].heardDay, 1);
});
test("old and malformed rumor records migrate safely without revealing terrain", () => {
  const s = company();
  delete s.rumors;
  assert.deepEqual(restore(s).rumors, {});
  s.rumors = {
    "hidden-compartment": { heardDay: 1, resolvedDay: 1 },
    "iron-seam": { heardDay: 2 },
    unknown: { heardDay: 1 },
  };
  const c = restore(s);
  assert.deepEqual(c.rumors, { "hidden-compartment": { heardDay: 1 } });
  assert.ok(c.discovered.includes(10));
  assert.deepEqual(c.charted, s.charted);
});
