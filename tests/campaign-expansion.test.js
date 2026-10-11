import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  weatherInfo,
  campCost,
  spendHours,
  prepareAmbush,
  startBattle,
  tacticalAction,
  endTurn,
  act,
  openCamp,
  placeFurniture,
  companionStory,
  registerCrime,
  payCrimeFine,
  restore,
  enterDungeon,
  dungeonAction,
  discoverNearby,
  advancePatrols,
} from "../src/game.js";
const arrive = (s, i) => {
  s.location = i;
  s.position = { x: places[i].x, y: places[i].y };
};
const battle = () => {
  const s = fresh();
  arrive(s, 1);
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  return s;
};
test("weather changes supplies, fatigue and visibility while seasons cycle", () => {
  const s = fresh(),
    normal = campCost(s);
  s.day = 4;
  assert.equal(weatherInfo(s).kind, "cold");
  assert.equal(campCost(s), normal + 1);
  s.day = 22;
  assert.equal(weatherInfo(s).season, "Winter");
  s.day = 3;
  spendHours(s, 2);
  assert.equal(s.party[0].fatigue, 5);
  const protectedCompany = fresh();
  protectedCompany.day = 3;
  openCamp(protectedCompany);
  protectedCompany.campFurniture.brazier = 0;
  spendHours(protectedCompany, 2);
  assert.equal(protectedCompany.party[0].fatigue, 4);
  const clear = fresh();
  clear.position = { x: 800, y: 400 };
  clear.charted = [];
  discoverNearby(clear, false);
  const rain = fresh();
  rain.day = 3;
  rain.position = { x: 800, y: 400 };
  rain.charted = [];
  discoverNearby(rain, false);
  assert.ok(rain.charted.length < clear.charted.length);
});
test("ambush preparation costs time and food and is consumed by battle", () => {
  const s = fresh();
  assert.equal(prepareAmbush(s), true);
  assert.equal(s.food, 23);
  assert.equal(s.timeOfDay, 10);
  assert.equal(prepareAmbush(s), false);
  arrive(s, 1);
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  assert.equal(s.battle.valor, 4);
  assert.equal(s.battle.enemies[0].stun, 1);
  assert.equal(s.ambushReady, false);
});
test("shield walls protect adjacent companions and overwatch consumes one attack", () => {
  const s = battle();
  Object.assign(s.battle.units[0], { x: 1, y: 1 });
  Object.assign(s.battle.units[1], { x: 1, y: 2 });
  assert.equal(tacticalAction(s, 1, "wall"), true);
  assert.equal(s.battle.units[0].guard, true);
  assert.equal(tacticalAction(s, 1, "wall"), false);
  assert.equal(tacticalAction(s, 2, "overwatch"), true);
  Object.assign(s.battle.units[2], { x: 1, y: 3 });
  Object.assign(s.battle.enemies[0], { x: 4, y: 3, hp: 30, max: 30 });
  s.battle.enemies.slice(1).forEach((e) => (e.hp = 0));
  endTurn(s);
  assert.ok(s.log.some((t) => t.includes("overwatch shot")));
});
test("pushing spends valor and drives enemies into muddy hazards", () => {
  const s = battle();
  s.battle.layoutId = "forest-edge";
  Object.assign(s.battle.units[0], { x: 1, y: 3 });
  Object.assign(s.battle.enemies[0], { x: 2, y: 3, hp: 30, armor: 0 });
  const before = s.battle.valor;
  assert.equal(tacticalAction(s, 0, "push"), true);
  assert.equal(s.battle.enemies[0].x, 3);
  assert.ok(s.battle.enemies[0].hp < 30);
  assert.equal(s.battle.valor, before - 1);
});
test("personal support costs resources, strengthens existing bonds and cannot repeat", () => {
  const s = fresh();
  s.gold = 100;
  s.inventory.ore = 3;
  s.bonds["0:1"] = 50;
  openCamp(s);
  assert.equal(companionStory(s, 0, "support"), true);
  assert.equal(s.gold, 80);
  assert.equal(s.party[0].weapon, 1);
  assert.equal(s.bonds["0:1"], 51);
  assert.equal(companionStory(s, 0, "support"), false);
});
test("refusal creates rivalries and disheartened companions can leave alive", () => {
  const s = fresh();
  openCamp(s);
  s.bonds["0:1"] = 10;
  assert.equal(companionStory(s, 0, "refuse"), true);
  assert.equal(s.bonds["0:1"], 7);
  s.party[1].resolve = 20;
  assert.equal(companionStory(s, 1, "release"), true);
  assert.equal(s.party[1].departed, true);
  assert.equal(s.party[1].dead, true);
  assert.equal(restore(s).party[1].departed, true);
});
test("furnishings have paid placement, occupancy gates and free relocation", () => {
  const s = fresh();
  s.gold = 100;
  s.inventory.wood = 20;
  openCamp(s);
  assert.equal(placeFurniture(s, "table", 0), true);
  assert.equal(s.gold, 85);
  assert.equal(placeFurniture(s, "rack", 0), false);
  assert.equal(placeFurniture(s, "table", 2), true);
  assert.equal(s.gold, 85);
  assert.equal(restore(s).campFurniture.table, 2);
});
test("crime creates saved pursuing guards and fines remove cargo and warrants", () => {
  const s = fresh();
  s.gold = 100;
  s.cargo.grain = 3;
  registerCrime(s);
  assert.equal(s.crime.wanted, 3);
  assert.ok(s.patrols.some((p) => p.id === "warden-pursuit"));
  const saved = restore(s);
  assert.ok(saved.patrols.some((p) => p.id === "warden-pursuit"));
  arrive(saved, 0);
  assert.equal(payCrimeFine(saved), true);
  assert.equal(saved.gold, 40);
  assert.equal(saved.cargo.grain, 0);
  assert.equal(saved.crime.wanted, 0);
  assert.equal(
    saved.patrols.some((p) => p.id === "warden-pursuit"),
    false,
  );
});
test("guards pursue and engage when they catch the company", () => {
  const s = fresh();
  registerCrime(s);
  const guard = s.patrols.find((p) => p.id === "warden-pursuit");
  guard.x = s.position.x + 10;
  guard.y = s.position.y;
  advancePatrols(s, 1);
  assert.equal(s.battle.patrolId, "warden-pursuit");
});
test("dungeons support secrets, reinforcement, saved position and traps", () => {
  const s = fresh();
  arrive(s, 4);
  s.inventory.wood = 2;
  enterDungeon(s);
  assert.equal(dungeonAction(s, "shore"), true);
  assert.equal(s.inventory.wood, 0);
  Object.assign(s.event, { x: 4, y: 2 });
  dungeonAction(s, "inspect");
  assert.equal(s.inventory.herbs, 4);
  assert.equal(s.siteProgress["secret-4"], true);
  const copy = restore(s);
  assert.equal(copy.event.x, 4);
  Object.assign(copy.event, { x: 3, y: 2 });
  const hp = copy.party[0].hp;
  dungeonAction(copy, "move", 3, 3);
  assert.equal(copy.party[0].hp, hp - 3);
  dungeonAction(copy, "move", 3, 4);
  dungeonAction(copy, "move", 3, 3);
  assert.equal(copy.party[0].hp, hp - 3);
});
test("guarded dungeon battle returns to the interior and preserves the accepted contract", () => {
  const s = fresh();
  arrive(s, 4);
  s.contract = { name: "Independent work", target: 1, reward: 65 };
  enterDungeon(s);
  Object.assign(s.event, { x: 6, y: 5 });
  assert.equal(dungeonAction(s, "move", 7, 5), true);
  assert.ok(s.battle);
  assert.equal(s.contract.name, "Independent work");
  const copy = restore(s);
  assert.ok(copy.battle.dungeonReturn);
  copy.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(copy.battle.enemies[0], { hp: 1, armor: 0, x: 2, y: 1 });
  act(copy, 0, 2, 1);
  assert.equal(copy.event.kind, "dungeon");
  assert.equal(copy.siteProgress["guard-4"], true);
  assert.equal(copy.contract.name, "Independent work");
  dungeonAction(copy, "move", 8, 5);
  const gold = copy.gold;
  assert.equal(dungeonAction(copy, "vault"), true);
  assert.equal(copy.gold, gold + 50);
  assert.equal(dungeonAction(copy, "vault"), false);
});
test("ore deposits require a Miner, consume time and never refill after reload", () => {
  const s = fresh();
  arrive(s, 4);
  enterDungeon(s);
  Object.assign(s.event, { x: 1, y: 1 });
  const time = s.timeOfDay;
  assert.equal(dungeonAction(s, "mine"), true);
  assert.equal(s.inventory.ore, 3);
  assert.equal(s.timeOfDay, time + 1);
  const copy = restore(s);
  assert.equal(dungeonAction(copy, "mine"), false);
  Object.assign(copy.event, { x: 3, y: 2 });
  copy.inventory.wood = 1;
  assert.equal(dungeonAction(copy, "disarm"), true);
  const hp = copy.party[0].hp;
  dungeonAction(copy, "move", 3, 3);
  assert.equal(copy.party[0].hp, hp);
});
test("refused companions can be released, and unpaid low-loyalty companions leave on the next day", () => {
  const s = fresh();
  openCamp(s);
  s.party[0].resolve = 20;
  companionStory(s, 0, "refuse");
  assert.equal(companionStory(s, 0, "release"), true);
  const low = fresh();
  low.party[1].storyComplete = "refused";
  low.party[1].resolve = 0;
  low.gold = 0;
  low.timeOfDay = 23;
  spendHours(low, 1);
  assert.equal(low.party[1].departed, true);
});
