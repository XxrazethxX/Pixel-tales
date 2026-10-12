import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  battleTerrain,
  restore,
  retreatBattle,
  companyOrder,
  reorderCompany,
  autoFormation,
  setDeployment,
  setTravelSpeed,
  updateTravelSafety,
  resumeTravel,
  advanceEcology,
  recoverFieldCache,
  rescueCompanion,
  act,
  endTurn,
} from "../src/game.js";
const begin = (s) => {
  s.location = 1;
  s.position = { x: places[1].x, y: places[1].y };
  s.contract = { target: 1, reward: 65 };
  assert.ok(startBattle(s));
};
test("successive encounters change cover without victories and preserve it through saves", () => {
  const s = fresh(),
    seen = new Set();
  for (let i = 0; i < 30; i++) {
    begin(s);
    const tiles = battleTerrain(s);
    seen.add(JSON.stringify(tiles));
    assert.ok(tiles.length >= 9);
    assert.deepEqual(
      battleTerrain(restore(JSON.parse(JSON.stringify(s)))),
      tiles,
    );
    for (const t of tiles.filter((t) => t.blocked))
      assert.ok(
        !s.battle.terrainFormation.some((p) => p.x === t.x && p.y === t.y),
      );
    const blocked = new Set(
        tiles.filter((t) => t.blocked).map((t) => `${t.x}:${t.y}`),
      ),
      queue = [{ x: 0, y: 3 }],
      visited = new Set();
    for (let j = 0; j < queue.length; j++) {
      const p = queue[j],
        key = `${p.x}:${p.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = p.x + dx,
          y = p.y + dy;
        if (
          x >= 0 &&
          x < 9 &&
          y >= 0 &&
          y < 7 &&
          !blocked.has(`${x}:${y}`) &&
          !visited.has(`${x}:${y}`)
        )
          queue.push({ x, y });
      }
    }
    for (const p of s.battle.terrainFormation)
      assert.ok(
        visited.has(`${p.x}:${p.y}`),
        "each deployment connects to the field",
      );
    s.battle = null;
  }
  assert.equal(seen.size, 30);
  assert.equal(s.skirmishes, 0);
});
test("manual and automatic formations deploy real units and persist travel order", () => {
  const s = fresh();
  assert.ok(reorderCompany(s, 2, -1));
  assert.deepEqual(companyOrder(s), [0, 2, 1, 3]);
  assert.ok(autoFormation(s));
  assert.equal(s.fieldLife.deployment[1].x, 2);
  assert.equal(s.fieldLife.deployment[2].x, 0);
  assert.ok(setDeployment(s, 0, 2, 0));
  begin(s);
  assert.deepEqual(
    s.battle.units.find((u) => u.id === 0),
    { ...s.battle.units.find((u) => u.id === 0), x: 2, y: 0 },
  );
  assert.equal(setDeployment(s, 1, 1, 1), false);
  assert.deepEqual(restore(s).fieldLife.deployment, s.fieldLife.deployment);
});
test("speed validation and threat pause require deliberate resumption", () => {
  const s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  const p = s.patrols.find((p) => p.kind === "bandits");
  p.cleared = false;
  p.x = s.position.x + 90;
  p.y = s.position.y;
  assert.ok(setTravelSpeed(s, 3));
  assert.equal(setTravelSpeed(s, 99), false);
  assert.ok(updateTravelSafety(s));
  assert.ok(s.fieldLife.paused);
  resumeTravel(s);
  assert.equal(updateTravelSafety(s), false);
  p.x += 400;
  updateTravelSafety(s);
  p.x = s.position.x;
  assert.ok(updateTravelSafety(s));
});
test("wolves visibly pursue wildlife and consume it, preserving the consequence", () => {
  const s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  const wolf = s.patrols.find((p) => p.kind === "wolves"),
    deer = s.fieldLife.wildlife[0];
  wolf.cleared = false;
  wolf.x = deer.x + 10;
  wolf.y = deer.y;
  for (let i = 0; i < 8; i++) advanceEcology(s, 0.5);
  assert.equal(deer.hp, 0);
  assert.equal(wolf.activity, "Feeding");
  assert.ok(s.fieldLife.ecology.length);
  assert.equal(restore(s).fieldLife.wildlife[0].hp, 0);
});
test("retreat leaves finite supplies that can be recovered only nearby and once", () => {
  const s = fresh();
  s.food = 30;
  s.cargo.grain = 5;
  begin(s);
  retreatBattle(s);
  const c = s.fieldLife.losses[0];
  assert.ok(c.food > 0);
  const food = s.food;
  s.position.x += 100;
  assert.equal(recoverFieldCache(s, c.id), false);
  s.position = { x: c.x, y: c.y };
  assert.ok(recoverFieldCache(s, c.id));
  assert.equal(s.food, food + c.food);
  assert.equal(recoverFieldCache(s, c.id), false);
  assert.equal(restore(s).fieldLife.losses[0].claimed, true);
});
test("emergency medicine revives an incapacitated companion with a lasting wound", () => {
  const s = fresh();
  s.party[1].hp = 0;
  s.inventory.medicine = 1;
  assert.ok(rescueCompanion(s, 1));
  assert.ok(s.party[1].hp > 0);
  assert.ok(s.party[1].wound);
  assert.equal(s.inventory.medicine, 0);
  assert.equal(rescueCompanion(s, 1), false);
});
test("invalid field-life save data cannot inject invalid controls or cargo", () => {
  const raw = fresh();
  raw.fieldLife.speed = 500;
  raw.fieldLife.deployment = { 0: { x: 99, y: -1 } };
  raw.fieldLife.losses = [
    { id: "a", x: 30, y: 30, food: 1e8, cargo: { grain: 1e8, unknown: 1e8 } },
  ];
  const s = restore(raw);
  assert.equal(s.fieldLife.speed, 1);
  assert.deepEqual(s.fieldLife.deployment, {});
  assert.equal(s.fieldLife.losses[0].food, 12);
  assert.equal(s.fieldLife.losses[0].cargo.unknown, undefined);
});
test("combat attacks turn the attacker toward their target", () => {
  const s = fresh();
  begin(s);
  delete s.battle.fieldSeed;
  s.battle.layoutId = "legacy";
  const u = s.battle.units[0],
    e = s.battle.enemies[0];
  u.x = 1;
  u.y = 1;
  e.x = 1;
  e.y = 2;
  assert.ok(act(s, u.id, 1, 2));
  assert.equal(u.facing, Math.PI / 2);
});
test("defeat preserves the company, wounds survivors and leaves a recovery cache", () => {
  const s = fresh();
  s.food = 30;
  begin(s);
  s.party.forEach((p) => (p.hp = 0));
  endTurn(s);
  assert.equal(s.battle, null);
  assert.ok(s.party.some((p) => p.hp > 0));
  assert.equal(s.location, 0);
  assert.ok(s.fieldLife.losses.length);
  assert.ok(s.party.some((p) => p.injury));
});
test("badly wounded wolves escape rather than attacking and yield no pelts", () => {
  const s = fresh(),
    p = s.patrols.find((p) => p.kind === "wolves");
  s.location = -1;
  s.position = { x: p.x, y: p.y };
  p.cleared = false;
  startBattle(s, p.id);
  s.battle.enemies.forEach((e) => {
    e.hp = 1;
    e.x = 8;
  });
  const food = s.food;
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.food, food);
  assert.equal(s.inventory.pelts, 0);
});
test("facing survives saves and recorded movement follows every actual tile", () => {
  const s = fresh();
  begin(s);
  s.battle.layoutId = "legacy";
  delete s.battle.fieldSeed;
  const u = s.battle.units[0];
  u.x = 1;
  u.y = 1;
  assert.ok(act(s, u.id, 3, 1));
  assert.deepEqual(u.walkRoute, [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ]);
  assert.equal(restore(s).battle.units[0].facing, u.facing);
});
