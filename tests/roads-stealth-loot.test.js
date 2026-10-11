import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  nearbyPlace,
  entryRadius,
  moveTo,
  advanceMovement,
  advancePatrols,
  confrontPatrol,
  negotiateBandits,
  banditDemand,
  startBattle,
  endTurn,
  act,
  restore,
  toggleStealth,
  advanceStealth,
  isHidden,
  battleTerrain,
  battlePath,
  terrainCell,
  hasLineOfSight,
  tradeCaravanEquipment,
  tradeCaravanCargo,
  enterSite,
  siteAction,
  hearRumor,
  battleLayouts,
} from "../src/game.js";
const copy = (s) => restore(JSON.parse(JSON.stringify(s)));
function nearPatrol(s, id) {
  const p = s.patrols.find((p) => p.id === id);
  s.position = { x: p.x, y: p.y };
  s.location = nearbyPlace(s.position);
  return p;
}
function stash(s = fresh()) {
  s.position = { x: places[10].x, y: places[10].y };
  s.location = 10;
  enterSite(s);
  siteAction(s, "search", 8);
  siteAction(s, "search", 2);
  siteAction(s, "search", 7);
  return s;
}
function open(s) {
  for (const n of [2, 4, 1]) siteAction(s, "pick", n);
}

test("expanded entry radius offers the nearest location and still excludes distant services", () => {
  const s = fresh();
  assert.equal(entryRadius(places[0]), 64);
  assert.equal(entryRadius(places[10]), 54);
  assert.equal(nearbyPlace({ x: places[0].x + 60, y: places[0].y }), 0);
  assert.equal(nearbyPlace({ x: places[0].x + 70, y: places[0].y }), -1);
  assert.equal(nearbyPlace({ x: places[10].x + 50, y: places[10].y }), 10);
  moveTo(s, places[0].x + 80, places[0].y);
  advanceMovement(s, 2);
  assert.equal(s.location, -1);
});
test("specialized caravans have distinct finite supplies and armory purchases survive saves", () => {
  const s = fresh();
  s.gold = 500;
  const wheat = nearPatrol(s, "wheat-caravan");
  assert.equal(wheat.cargo.grain, 12);
  assert.equal(wheat.cargo.iron, 0);
  assert.ok(tradeCaravanCargo(s, wheat.id, "grain", 2));
  assert.equal(wheat.cargo.grain, 10);
  assert.equal(tradeCaravanCargo(s, wheat.id, "iron"), false);
  const armor = nearPatrol(s, "armor-caravan");
  const gold = s.gold;
  assert.ok(tradeCaravanEquipment(s, armor.id, "armor-2"));
  assert.equal(s.gold, gold - 64);
  assert.equal(tradeCaravanEquipment(s, armor.id, "armor-2"), false);
  const saved = copy(s);
  assert.equal(
    saved.patrols.find((p) => p.id === armor.id).gearStock.includes("armor-2"),
    false,
  );
  assert.equal(saved.gear.at(-1).template, "armor-2");
  assert.equal(saved.patrols.find((p) => p.id === wheat.id).cargo.grain, 10);
});
test("armory raids seize only remaining equipment and mark it as stolen", () => {
  const s = fresh();
  const p = nearPatrol(s, "armor-caravan");
  s.gold = 500;
  tradeCaravanEquipment(s, p.id, "armor-2");
  const count = s.gear.length;
  startBattle(s, p.id);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { hp: 1, x: 2, y: 1 });
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.gear.length, count + 4);
  assert.deepEqual(p.gearStock, []);
  assert.equal(s.crime.stolen, true);
  assert.equal(s.gear.filter((g) => g.template === "armor-2").length, 1);
});
test("bandits intercept with a saved negotiation, accept gold once and respect the passage deadline", () => {
  const s = fresh();
  const p = nearPatrol(s, "knives");
  advancePatrols(s, 0.1);
  assert.equal(s.battle, null);
  assert.equal(s.event.kind, "negotiation");
  const saved = copy(s),
    gold = saved.gold;
  assert.equal(saved.event.patrolId, "knives");
  assert.ok(negotiateBandits(saved, "gold"));
  assert.equal(saved.gold, gold - banditDemand(saved, "knives"));
  assert.equal(negotiateBandits(saved, "gold"), false);
  advancePatrols(saved, 0.1);
  assert.equal(saved.event, null);
  const next = copy(saved);
  next.timeOfDay = 17;
  advancePatrols(next, 0.1);
  assert.equal(next.event.kind, "negotiation");
  assert.ok(negotiateBandits(next, "refuse"));
  assert.equal(next.battle.patrolId, p.id);
});
test("provisions are a real negotiation payment and insufficient offers leave the encounter pending", () => {
  const s = fresh();
  nearPatrol(s, "road-bandits");
  confrontPatrol(s, "road-bandits");
  s.gold = 0;
  s.food = 7;
  assert.equal(negotiateBandits(s, "gold"), false);
  assert.equal(negotiateBandits(s, "food"), false);
  s.food = 8;
  assert.ok(negotiateBandits(s, "food"));
  assert.equal(s.food, 0);
  assert.equal(s.battle, null);
});
test("forest concealment builds faster, sneaking is slower, and moving drains the hidden meter", () => {
  const s = fresh();
  s.position = { x: 340, y: 200 };
  s.location = 1;
  s.patrols.forEach((p) => (p.cleared = true));
  toggleStealth(s);
  advanceStealth(s, 5, false);
  assert.equal(s.stealth.concealment, 80);
  assert.ok(isHidden(s));
  const saved = copy(s);
  assert.equal(saved.stealth.concealment, 80);
  assert.ok(saved.stealth.active);
  moveTo(s, 410, 200);
  advanceMovement(s, 1);
  assert.ok(s.position.x < 380);
  advanceStealth(s, 2, true);
  assert.equal(s.stealth.concealment, 72);
  assert.ok(isHidden(s));
  toggleStealth(s);
  assert.equal(s.stealth.concealment, 0);
  const open = fresh();
  toggleStealth(open);
  advanceStealth(open, 5, false);
  assert.equal(open.stealth.concealment, 30);
});
test("concealed companies evade pursuing authorities without erasing their wanted status", () => {
  const s = fresh();
  s.crime.wanted = 3;
  const saved = copy(s);
  const p = saved.patrols.find((p) => p.id === "warden-pursuit");
  saved.position = { x: p.x + 30, y: p.y };
  saved.stealth = { active: true, concealment: 100 };
  advancePatrols(saved, 0.1);
  assert.equal(saved.battle, null);
  assert.equal(saved.crime.wanted, 3);
  toggleStealth(saved);
  advancePatrols(saved, 0.1);
  assert.equal(saved.battle.patrolId, p.id);
});
test("ambush grants every companion a second action and movement before any enemy response, including after reload", () => {
  const s = fresh();
  s.stealth = { active: true, concealment: 100 };
  const p = nearPatrol(s, "knives");
  startBattle(s, p.id);
  assert.equal(s.battle.openingAmbush, true);
  assert.equal(s.stealth.concealment, 0);
  const units = s.battle.units;
  units.forEach((u) => {
    u.acted = true;
    u.moved = true;
  });
  const saved = copy(s),
    enemies = JSON.stringify(saved.battle.enemies),
    hp = saved.party.map((p) => p.hp);
  endTurn(saved);
  assert.equal(saved.battle.openingAmbush, false);
  assert.equal(saved.battle.turn, 2);
  assert.equal(JSON.stringify(saved.battle.enemies), enemies);
  assert.deepEqual(
    saved.party.map((p) => p.hp),
    hp,
  );
  assert.ok(saved.battle.units.every((u) => !u.acted && !u.moved));
  endTurn(saved);
  assert.equal(saved.battle.turn, 3);
  assert.notEqual(JSON.stringify(saved.battle.enemies), enemies);
});
test("ordinary visible battles do not grant a free ambush turn", () => {
  const s = fresh();
  nearPatrol(s, "knives");
  startBattle(s, "knives");
  assert.ok(!s.battle.openingAmbush);
  const before = JSON.stringify(s.battle.enemies);
  endTurn(s);
  assert.notEqual(JSON.stringify(s.battle.enemies), before);
});
test("stash needs both clues and persists search history and selective contents without paying twice", () => {
  const s = fresh();
  s.position = { ...places[10] };
  s.location = 10;
  enterSite(s);
  siteAction(s, "search", 7);
  assert.equal(s.event.stage, "search");
  siteAction(s, "search", 8);
  siteAction(s, "search", 2);
  siteAction(s, "search", 7);
  assert.equal(s.event.stage, "lock");
  open(s);
  assert.equal(s.gold, 120);
  assert.equal(s.knowledge, 1);
  assert.ok(siteAction(s, "take", "medicine"));
  assert.equal(s.inventory.medicine, 2);
  assert.equal(siteAction(s, "take", "medicine"), false);
  siteAction(s, "leave");
  const saved = copy(s);
  enterSite(saved);
  assert.equal(saved.event.stage, "opened");
  assert.ok(!saved.stash.loot.medicine);
  assert.equal(saved.stash.loot.gold, 30);
  assert.deepEqual(saved.stash.clues, [8, 2]);
  siteAction(saved, "take", "gold");
  assert.equal(saved.gold, 150);
  siteAction(saved, "take-all");
  assert.equal(siteAction(saved, "take-all"), false);
  assert.equal(saved.knowledge, 1);
});
test("stash rumor contents also wait for selection and old already-looted saves stay empty", () => {
  const s = fresh();
  s.location = 0;
  s.renown = 20;
  hearRumor(s, "hidden-compartment");
  stash(s);
  open(s);
  assert.equal(s.stash.loot.gold, 50);
  assert.equal(s.gold, 112);
  siteAction(s, "take", "gold");
  assert.equal(s.gold, 162);
  const old = fresh();
  old.version = 13;
  old.explored = [10];
  delete old.stash;
  const loaded = copy(old);
  loaded.location = 10;
  loaded.position = { ...places[10] };
  enterSite(loaded);
  assert.equal(loaded.event.stage, "opened");
  assert.deepEqual(loaded.stash.loot, {});
});
test("trees and deadfall block routes and sight while bushes give light cover and cost extra movement", () => {
  const s = fresh();
  nearPatrol(s, "knives");
  startBattle(s, "knives");
  s.battle.layoutId = "deadfall";
  const tree = terrainCell(s, 3, 1),
    bush = terrainCell(s, 2, 3),
    log = terrainCell(s, 4, 3);
  assert.ok(tree.blocked && tree.blocksSight && log.blocked);
  assert.equal(bush.cover, 1);
  assert.equal(bush.cost, 2);
  assert.equal(hasLineOfSight(s, { x: 2, y: 1 }, { x: 4, y: 1 }), false);
  const u = s.battle.units[0];
  Object.assign(u, { x: 2, y: 2 });
  assert.equal(battlePath(s, u, 3, 1), null);
  assert.equal(battlePath(s, u, 2, 3, 1), null);
  assert.equal(battlePath(s, u, 2, 3, 2).length, 1);
  assert.ok(battleLayouts.some((l) => l.id === "hedgerow"));
  assert.ok(battleTerrain(s).some((t) => t.kind === "log"));
});
test("malformed new state is sanitized and negotiated passage survives reload", () => {
  const s = fresh();
  s.stealth = { active: "yes", concealment: 500 };
  s.stash = {
    unlocked: false,
    loot: { gold: 90 },
    clues: [8, 8, 1],
    searched: [-1, 2, 2, 99],
  };
  s.event = { kind: "negotiation", patrolId: "caravan" };
  const loaded = copy(s);
  assert.deepEqual(loaded.stealth, { active: false, concealment: 100 });
  assert.deepEqual(loaded.stash.loot, {});
  assert.deepEqual(loaded.stash.clues, [8]);
  assert.deepEqual(loaded.stash.searched, [2]);
  assert.equal(loaded.event, null);
});

test("initiating an ambush from hiding bypasses the road toll while voluntary confrontation reveals the company", () => {
  const s = fresh();
  nearPatrol(s, "knives");
  s.stealth = { active: true, concealment: 100 };
  assert.ok(confrontPatrol(s, "knives"));
  assert.equal(s.event, null);
  assert.equal(s.battle.openingAmbush, true);
  const visible = fresh();
  nearPatrol(visible, "knives");
  visible.stealth = { active: true, concealment: 65 };
  assert.ok(confrontPatrol(visible, "knives"));
  assert.equal(visible.event.kind, "negotiation");
  assert.equal(visible.stealth.concealment, 0);
});

test("reloading an escort within the expanded village radius resolves its arrival", () => {
  const s = fresh();
  s.travelers.merrit = "escorting";
  s.campaign.phase = "inquiry";
  s.position = { x: places[3].x - 60, y: places[3].y };
  s.location = -1;
  const loaded = copy(s);
  assert.equal(loaded.location, 3);
  assert.equal(loaded.travelers.merrit, "arrived");
});
