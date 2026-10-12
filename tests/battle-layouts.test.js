import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  grantEquipment,
  places,
  startBattle,
  battleLayouts,
  battlefield,
  battleTerrain,
  terrainCell,
  battlePath,
  hasLineOfSight,
  act,
  useSkill,
  endTurn,
  restore,
  recruit,
} from "../src/game.js";
const fight = (location = 2, tier = 1, day = 1) => {
  const s = fresh();
  s.location = location;
  s.position = { x: places[location].x, y: places[location].y };
  s.day = day;
  s.contract = { target: location, reward: 65, tier };
  assert.equal(startBattle(s), true);
  // Keep the catalog-layout tests independent of encounter generation.
  delete s.battle.fieldSeed;
  return s;
};
test("battle context chooses forest, ruin, mine, road and river fields, while starter deployments stay familiar", () => {
  for (const [location, id] of [
    [1, "forest-edge"],
    [7, "forest-grove"],
    [2, "ruin-court"],
    [4, "quarry"],
    [9, "quarry"],
    [8, "river"],
  ])
    assert.equal(fight(location).battle.layoutId, id);
  assert.equal(fight(2, 1, 2).battle.layoutId, "ruin-aisle");
  assert.equal(fight(11).battle.layoutId, "ruin-court");
  const s = fresh(),
    p = s.patrols.find((p) => p.id === "caravan");
  s.location = -1;
  s.position = { x: p.x, y: p.y };
  startBattle(s, p.id);
  assert.equal(s.battle.layoutId, "road");
  const classic = fight(1);
  assert.deepEqual(
    classic.battle.units.map((u) => [u.x, u.y]),
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  );
  assert.deepEqual(
    fight(7).battle.units.map((u) => [u.x, u.y]),
    [
      [1, 1],
      [1, 5],
      [0, 2],
      [0, 4],
    ],
  );
});
test("all battle layouts have unique tiles and a fully connected walkable area", () => {
  for (const layout of battleLayouts) {
    const s = fight();
    s.battle.layoutId = layout.id;
    const tiles = battleTerrain(s);
    assert.equal(new Set(tiles.map((t) => `${t.x}:${t.y}`)).size, tiles.length);
    for (const tile of tiles) {
      assert.ok(tile.x >= 0 && tile.x < 9 && tile.y >= 0 && tile.y < 7);
      assert.ok(tile.blocked ? tile.cost === Infinity : tile.cost >= 1);
    }
    const seen = new Set(),
      queue = [[0, 0]];
    while (queue.length) {
      const [x, y] = queue.shift(),
        key = `${x}:${y}`;
      if (
        x < 0 ||
        x > 8 ||
        y < 0 ||
        y > 6 ||
        seen.has(key) ||
        terrainCell(s, x, y).blocked
      )
        continue;
      seen.add(key);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    assert.equal(
      seen.size,
      63 - tiles.filter((t) => t.blocked).length,
      layout.id,
    );
  }
});
test("six-companion companies and elite enemies deploy without overlaps or blocked cells on every field", () => {
  for (const [location, day] of [
    [1, 1],
    [7, 1],
    [2, 1],
    [2, 2],
    [4, 1],
    [8, 1],
  ]) {
    const s = fresh();
    s.gold = 500;
    recruit(s);
    recruit(s);
    s.location = location;
    s.position = { x: places[location].x, y: places[location].y };
    s.day = day;
    s.contract = { target: location, reward: 65, tier: 3 };
    startBattle(s);
    const actors = [...s.battle.units, ...s.battle.enemies];
    assert.equal(s.battle.units.length, 6);
    assert.equal(s.battle.enemies.length, 5);
    assert.equal(new Set(actors.map((u) => `${u.x}:${u.y}`)).size, 11);
    for (const u of actors)
      assert.equal(!!terrainCell(s, u.x, u.y).blocked, false);
  }
});
test("blocked terrain rejects movement, and pathfinding finds an affordable route around walls", () => {
  const s = fight(),
    u = s.battle.units[0];
  Object.assign(u, { x: 3, y: 3 });
  assert.equal(battlePath(s, u, 4, 3), null);
  assert.equal(act(s, 0, 4, 3), false);
  assert.equal(u.moved, false);
  assert.equal(battlePath(s, u, 5, 3, 2), null);
  const path = battlePath(s, u, 5, 3, 10);
  assert.ok(path.length >= 4);
  assert.ok(path.every((p) => !terrainCell(s, p.x, p.y).blocked));
});
test("solid obstacles block basic and advanced attacks without consuming actions or valor", () => {
  const s = fight(),
    u = s.battle.units[2],
    e = s.battle.enemies[0];
  Object.assign(u, { x: 3, y: 3 });
  Object.assign(e, { x: 5, y: 3, hp: 30, max: 30 });
  s.party[2].level = 4;
  s.party[2].talent = "pinning";
  s.party[2].advancedSkill = "piercing";
  assert.equal(hasLineOfSight(s, u, e), false);
  assert.equal(act(s, 2, 5, 3), false);
  assert.equal(useSkill(s, 2, 5, 3), false);
  assert.equal(u.acted, false);
  assert.equal(s.battle.valor, 3);
  assert.equal(e.hp, 30);
  Object.assign(u, { x: 3, y: 2 });
  Object.assign(e, { x: 5, y: 2 });
  assert.equal(hasLineOfSight(s, u, e), true);
  assert.equal(useSkill(s, 2, 5, 2), true);
  assert.equal(e.hp, 20);
});
test("sight checks are symmetric and cannot shoot diagonally through a solid corner", () => {
  const s = fight();
  for (let x = 0; x < 9; x++)
    for (let y = 0; y < 7; y++)
      for (const to of [
        { x: 1, y: 1 },
        { x: 7, y: 5 },
        { x: 3, y: 3 },
      ]) {
        const from = { x, y };
        if (terrainCell(s, x, y).blocked || terrainCell(s, to.x, to.y).blocked)
          continue;
        assert.equal(hasLineOfSight(s, from, to), hasLineOfSight(s, to, from));
      }
  assert.equal(hasLineOfSight(s, { x: 3, y: 3 }, { x: 4, y: 2 }), false);
});
test("deep water blocks walking without blocking shots; crossing mud still costs two movement", () => {
  const s = fight(8),
    u = s.battle.units[0];
  Object.assign(u, { x: 3, y: 2 });
  assert.equal(terrainCell(s, 4, 0).blocked, true);
  assert.equal(terrainCell(s, 4, 0).blocksSight, false);
  assert.equal(hasLineOfSight(s, { x: 3, y: 0 }, { x: 5, y: 0 }), true);
  assert.equal(battlePath(s, u, 5, 2, 2), null);
  assert.equal(battlePath(s, u, 4, 2, 2).length, 1);
});
test("rooted enemy archers cannot shoot through a wall, and unrooted enemies route toward a real firing line", () => {
  const s = fight();
  s.party.forEach((p, i) => {
    if (i) p.hp = 0;
  });
  Object.assign(s.battle.units[0], { x: 3, y: 3 });
  s.battle.enemies.forEach((e) => (e.hp = 0));
  const e = s.battle.enemies[0];
  Object.assign(e, {
    x: 5,
    y: 3,
    hp: 100,
    max: 100,
    kind: "archer",
    damage: 1,
    root: 1,
  });
  const hp = s.party[0].hp;
  endTurn(s);
  assert.equal(s.party[0].hp, hp);
  assert.equal(e.x, 5);
  assert.equal(e.y, 3);
  for (let i = 0; i < 10 && s.party[0].hp === hp; i++) {
    endTurn(s);
    assert.equal(!!terrainCell(s, e.x, e.y).blocked, false);
    assert.notDeepEqual([e.x, e.y], [3, 3]);
  }
  assert.ok(s.party[0].hp < hp);
});
test("melee enemies take a reachable detour instead of repeatedly walking into walls", () => {
  const s = fight();
  s.party.forEach((p, i) => {
    if (i) p.hp = 0;
  });
  Object.assign(s.battle.units[0], { x: 3, y: 3 });
  s.battle.enemies.forEach((e) => (e.hp = 0));
  const e = s.battle.enemies[0];
  Object.assign(e, { x: 5, y: 3, hp: 100, max: 100, damage: 1 });
  const hp = s.party[0].hp;
  for (let i = 0; i < 6 && s.party[0].hp === hp; i++) endTurn(s);
  assert.ok(s.party[0].hp < hp);
  assert.equal(!!terrainCell(s, e.x, e.y).blocked, false);
});
test("battle saves retain their layout and actor positions; old and unknown layouts keep legacy terrain", () => {
  const s = fight(7);
  s.battle.units[0].x = 2;
  const loaded = restore(s);
  assert.equal(loaded.battle.layoutId, "forest-grove");
  assert.equal(loaded.battle.units[0].x, 2);
  assert.equal(battlefield(loaded).name, "Fallen grove");
  delete s.battle.layoutId;
  const old = restore(s);
  assert.equal(old.battle.layoutId, "legacy");
  assert.equal(old.battle.units[0].x, 2);
  assert.equal(battleTerrain(old).filter((t) => t.blocked).length, 0);
  s.battle.layoutId = "invented";
  assert.equal(restore(s).battle.layoutId, "legacy");
});

test("one-step enemies choose an affordable ford detour instead of stopping at two-cost shallows", () => {
  const s = fight(8);
  s.party.forEach((p, i) => {
    if (i) p.hp = 0;
  });
  Object.assign(s.battle.units[0], { x: 3, y: 2 });
  s.battle.enemies.forEach((e) => (e.hp = 0));
  const e = s.battle.enemies[0];
  Object.assign(e, { x: 5, y: 2, hp: 100, max: 100, damage: 1 });
  const hp = s.party[0].hp;
  endTurn(s);
  assert.notDeepEqual([e.x, e.y], [5, 2]);
  assert.equal(terrainCell(s, e.x, e.y).cost, 1);
  for (let i = 0; i < 5 && s.party[0].hp === hp; i++) endTurn(s);
  assert.ok(s.party[0].hp < hp);
});

test("cleave healing and sweep damage count only enemies visible around an obstacle", () => {
  for (const mode of ["cleave", "sweep"]) {
    const s = fight();
    Object.assign(s.battle.units[0], { x: 3, y: 3 });
    Object.assign(s.battle.enemies[0], { x: 3, y: 2, hp: 100, max: 100 });
    Object.assign(s.battle.enemies[1], { x: 4, y: 2, hp: 100, max: 100 });
    if (mode === "cleave") {
      s.party[0].hp = 10;
      s.party[0].level = 4;
      s.party[0].talent = "reaver";
      s.party[0].advancedSkill = "reaping";
      assert.equal(useSkill(s, 0, 3, 2), true);
      assert.equal(s.party[0].hp, 12);
    } else {
      const id = grantEquipment(s, "greatsword-2"); // Gear is locked during battle; this fixture starts with an owned weapon.
      s.party[0].equipment.weapon = id;
      assert.equal(act(s, 0, 3, 2), true);
    }
    assert.equal(s.battle.enemies[1].hp, 100);
  }
});
