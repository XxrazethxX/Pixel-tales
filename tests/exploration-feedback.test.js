import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  dungeonLayout,
  dungeonWalls,
  enterDungeon,
  dungeonAction,
  enterFarm,
  farmAction,
  forage,
  forageAmount,
  supplyForecast,
  dailyWages,
  campCost,
  startBattle,
  combatPreview,
  act,
  useSkill,
  disengage,
  terrainCell,
  hasLineOfSight,
  createCompany,
} from "../src/game.js";
const saved = (s) => restore(JSON.parse(JSON.stringify(s)));
function arrive(s, site) {
  s.location = site;
  s.position = { x: places[site].x, y: places[site].y };
}
function fight() {
  const s = fresh();
  arrive(s, 1);
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  return s;
}
test("each dungeon has a distinct connected layout and reachable treasure", () => {
  const layouts = new Set();
  for (const site of [2, 4, 5, 8, 9, 11, 12, 14]) {
    const s = fresh();
    arrive(s, site);
    assert.equal(enterDungeon(s), true);
    const layout = dungeonLayout(site);
    layouts.add(JSON.stringify(layout.walls));
    const walls = new Set(dungeonWalls(s).map(([x, y]) => `${x},${y}`)),
      seen = new Set(),
      queue = [[0, 5]];
    while (queue.length) {
      const [x, y] = queue.shift(),
        key = `${x},${y}`;
      if (x < 0 || x > 8 || y < 0 || y > 6 || walls.has(key) || seen.has(key))
        continue;
      seen.add(key);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    assert.equal(seen.size, 63 - walls.size, layout.name);
    assert.ok(seen.has(layout.vault.join(",")));
  }
  assert.equal(layouts.size, 8);
});
test("unique secret positions, hazards, and reward values persist", () => {
  const s = fresh();
  arrive(s, 5);
  enterDungeon(s);
  s.event.x = 6;
  s.event.y = 0;
  dungeonAction(s, "inspect");
  assert.equal(s.siteProgress["secret-5"], true);
  const copy = saved(s);
  assert.ok(!dungeonWalls(copy).some(([x, y]) => x === 6 && y === 1));
  copy.event.x = 3;
  copy.event.y = 0;
  assert.ok(dungeonAction(copy, "move", 3, 1));
  assert.equal(copy.party[0].hp, copy.party[0].max - 3);
  copy.siteProgress["guard-5"] = true;
  copy.event.x = 8;
  copy.event.y = 5;
  const gold = copy.gold;
  assert.ok(dungeonAction(copy, "vault"));
  assert.equal(copy.gold - gold, dungeonLayout(5).reward);
  assert.equal(dungeonAction(copy, "vault"), false);
});
test("farm clue gates supplies, marks destinations, and prevents repeat rewards across reload", () => {
  const s = fresh();
  assert.equal(enterFarm(s), false);
  arrive(s, 13);
  assert.ok(enterFarm(s));
  const food = s.food,
    knowledge = s.knowledge;
  assert.equal(farmAction(s, "cellar"), false);
  assert.equal(s.food, food);
  assert.ok(farmAction(s, "clue"));
  assert.equal(s.knowledge, knowledge + 1);
  assert.ok(s.discovered.includes(12) && s.discovered.includes(14));
  const copy = saved(s);
  assert.equal(copy.event.kind, "farm");
  assert.equal(farmAction(copy, "clue"), false);
  assert.ok(farmAction(copy, "cellar"));
  assert.equal(copy.food, food + 12);
  assert.ok(farmAction(copy, "well"));
  const herbs = copy.inventory.herbs;
  assert.equal(farmAction(saved(copy), "well"), false);
  assert.equal(copy.inventory.herbs, herbs);
});
test("foraging rewards terrain and diminishes locally until the following day", () => {
  const s = fresh();
  assert.equal(forageAmount(s), 6);
  arrive(s, 1);
  assert.equal(forageAmount(s), 8);
  assert.ok(forage(s));
  assert.equal(forageAmount(s), 6);
  assert.equal(forageAmount(saved(s)), 6);
  arrive(s, 14);
  assert.equal(forageAmount(s), 3);
  arrive(s, 13);
  assert.equal(forageAmount(s), 10);
  s.day++;
  arrive(s, 1);
  assert.equal(forageAmount(s), 8);
});
test("forage at midnight grants the advertised yield before daily upkeep", () => {
  const s = fresh();
  arrive(s, 1);
  s.timeOfDay = 23;
  const food = s.food,
    yieldFood = forageAmount(s),
    cost = campCost(s);
  assert.ok(forage(s));
  assert.equal(s.food, food + yieldFood - cost);
  assert.match(s.log[0], new RegExp(`Gathered ${yieldFood} rations`));
  assert.equal(forageAmount(s), 8);
});
test("supply forecast accounts for debt, seasonal food, and companion wages", () => {
  const s = fresh();
  s.wageDebt = 40;
  s.gold = 50;
  s.food = 9;
  s.day = 4;
  s.timeOfDay = 21;
  const f = supplyForecast(s);
  assert.equal(f.food, campCost(s));
  assert.equal(f.wages, dailyWages(s));
  assert.equal(f.foodDays, Math.floor(9 / f.food));
  assert.equal(f.wageDays, Math.floor(10 / f.wages));
  assert.equal(f.nextMeal, 3);
});
test("attack previews match real armor, cover and flanking damage without mutating state", () => {
  const s = fight(),
    u = s.battle.units[2],
    e = s.battle.enemies[0];
  u.x = 1;
  u.y = 1;
  e.x = 3;
  e.y = 1;
  e.armor = 2;
  const before = JSON.stringify(s),
    preview = combatPreview(s, 2, e.x, e.y);
  assert.ok(preview.allowed);
  assert.equal(JSON.stringify(s), before);
  const hp = e.hp;
  assert.ok(act(s, 2, e.x, e.y));
  assert.equal(hp - e.hp, Math.min(hp, preview.damage));
  assert.equal(combatPreview(s, 2, e.x, e.y).allowed, false);
  const melee = fight();
  melee.battle.units[0].x = 2;
  melee.battle.units[0].y = 1;
  melee.battle.units[1].x = 4;
  melee.battle.units[1].y = 1;
  melee.battle.enemies[0].x = 3;
  melee.battle.enemies[0].y = 1;
  assert.equal(combatPreview(melee, 0, 3, 1).flank, 2);
});
test("piercing and sundering previews match ability damage and enforce valor gates", () => {
  for (const [id, skill] of [
    [2, "piercing"],
    [0, "sunder"],
  ]) {
    const s = fight(),
      p = s.party[id],
      u = s.battle.units[id],
      e = s.battle.enemies[0];
    p.advancedSkill = skill;
    p.level = 5;
    u.x = 2;
    u.y = 1;
    e.x = 3;
    e.y = 1;
    e.armor = 4;
    e.hp = e.max = 100;
    s.battle.valor = 5;
    const preview = combatPreview(s, id, e.x, e.y, true);
    assert.ok(preview.allowed);
    const hp = e.hp;
    assert.ok(useSkill(s, id, e.x, e.y));
    assert.equal(hp - e.hp, preview.damage);
    assert.equal(combatPreview(s, id, e.x, e.y, true).allowed, false);
  }
});
test("movement previews identify reaction attacks, safe disengagement, blocked routes and fire", () => {
  const s = fight(),
    u = s.battle.units[0],
    e = s.battle.enemies[0];
  u.x = 1;
  u.y = 1;
  e.x = 2;
  e.y = 1;
  const risk = combatPreview(s, 0, 0, 1);
  assert.ok(risk.allowed);
  assert.equal(risk.reactions, 1);
  assert.ok(disengage(s, 0));
  assert.equal(combatPreview(s, 0, 0, 1).reactions, 0);
  s.battle.threat = { tiles: [{ x: 0, y: 1 }] };
  assert.match(combatPreview(s, 0, 0, 1).text, /marked hazard/);
  assert.equal(combatPreview(s, 0, -1, 1).allowed, false);
});
test("difficulty changes upkeep and opponents, persists, and old saves retain standard rules", () => {
  const standard = fight(),
    easy = fresh(),
    hard = fresh();
  easy.difficulty = "forgiving";
  hard.difficulty = "veteran";
  assert.ok(dailyWages(easy) < dailyWages(standard));
  assert.ok(campCost(hard) > campCost(standard));
  assert.ok(dailyWages(hard) > dailyWages(standard));
  for (const s of [easy, hard]) {
    arrive(s, 1);
    s.contract = { target: 1, reward: 65 };
    startBattle(s);
  }
  assert.ok(easy.battle.enemies[0].hp < standard.battle.enemies[0].hp);
  assert.ok(hard.battle.enemies[0].hp > standard.battle.enemies[0].hp);
  assert.equal(saved(hard).difficulty, "veteran");
  const old = fresh();
  old.version = 11;
  delete old.difficulty;
  delete old.forageLedger;
  assert.equal(saved(old).difficulty, "standard");
  assert.deepEqual(saved(old).forageLedger, {});
});
test("malformed help, forage, difficulty and farm saves are sanitized", () => {
  const s = fresh();
  s.helpSeen = { battle: true, evil: true };
  s.forageLedger = { "1-1": 2, junk: 4, "1-2": -1 };
  s.difficulty = "impossible";
  s.event = { kind: "farm", site: 13 };
  const copy = saved(s);
  assert.equal(copy.event, null);
  assert.deepEqual(copy.helpSeen, { battle: true });
  assert.deepEqual(copy.forageLedger, { "1-1": 2 });
  assert.equal(copy.difficulty, "standard");
});

test("company creation retains selected difficulty and veteran victories pay their stated bonus", () => {
  const source = fresh();
  const options = {
    name: "Trailbound",
    banner: "ashen",
    origin: "wanderers",
    difficulty: "veteran",
    founders: source.party.map((p) => ({
      name: p.name,
      role: p.role,
      profession: "Cook",
      trait: "tireless",
    })),
  };
  const company = createCompany(options);
  assert.ok(company);
  assert.equal(company.difficulty, "veteran");
  assert.equal(saved(company).difficulty, "veteran");
  const s = fight();
  s.difficulty = "veteran";
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { x: 2, y: 1, hp: 1, armor: 0 });
  const gold = s.gold;
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.gold - gold, Math.ceil(65 * 1.15));
  assert.equal(s.battle, null);
});
