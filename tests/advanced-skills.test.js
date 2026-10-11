import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  startBattle,
  learnAdvancedSkill,
  skillFor,
  useSkill,
  endTurn,
  restore,
  attackRange,
} from "../src/game.js";
const ready = (id = 0, skill = "sunder") => {
  const s = fresh(),
    p = s.party[id];
  p.level = 4;
  p.points = 2;
  p.talent = ["reaver", "stalwart", "pinning", "bloodletter"][id];
  assert.equal(learnAdvancedSkill(s, id, skill), true);
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.battle.valor = 5;
  s.battle.units.find((u) => u.id === id).x = 3;
  s.battle.units.find((u) => u.id === id).y = 3;
  s.battle.enemies.forEach((e, i) =>
    Object.assign(e, {
      x: 4 + i,
      y: 3,
      hp: 100,
      max: 100,
      armor: 3,
      damage: 0,
    }),
  );
  return s;
};
test("advanced training enforces level, specialization, point cost, role and permanent choice", () => {
  const s = fresh(),
    p = s.party[0];
  p.points = 3;
  assert.equal(learnAdvancedSkill(s, 0, "sunder"), false);
  p.level = 4;
  assert.equal(learnAdvancedSkill(s, 0, "sunder"), false);
  p.talent = "reaver";
  p.points = 1;
  assert.equal(learnAdvancedSkill(s, 0, "sunder"), false);
  p.points = 2;
  assert.equal(learnAdvancedSkill(s, 0, "piercing"), false);
  assert.equal(learnAdvancedSkill(s, 0, "sunder"), true);
  assert.equal(p.points, 0);
  p.points = 9;
  assert.equal(learnAdvancedSkill(s, 0, "reaping"), false);
  assert.equal(p.points, 9);
  assert.equal(learnAdvancedSkill(s, 99, "sunder"), false);
});
test("training is blocked in encounters, combat, or after death", () => {
  for (const mode of ["event", "battle", "dead"]) {
    const s = fresh(),
      p = s.party[0];
    p.level = 4;
    p.points = 2;
    p.talent = "reaver";
    if (mode === "dead") p.dead = true;
    else s[mode] = {};
    assert.equal(learnAdvancedSkill(s, 0, "sunder"), false);
    assert.equal(p.points, 2);
  }
});
test("sundering cleave permanently lowers armor before damage, and keeps bleeding specialization", () => {
  const s = ready();
  const e = s.battle.enemies[0];
  assert.equal(useSkill(s, 0, 4, 3), true);
  assert.equal(e.armor, 1);
  assert.equal(e.hp, 92);
  assert.equal(e.bleed, 2);
  assert.equal(s.battle.enemies[1].armor, 1);
  assert.equal(s.battle.units[0].cooldown, 2);
  assert.equal(useSkill(s, 0, 4, 3), false);
});
test("reaping cleave caps healing, cannot exceed maximum health, and pays the larger cost", () => {
  const s = ready(0, "reaping");
  s.party[0].hp = 5;
  s.battle.enemies[2].x = 4;
  s.battle.enemies[2].y = 2;
  useSkill(s, 0, 4, 3);
  assert.equal(s.party[0].hp, 11);
  assert.equal(s.battle.valor, 2);
  const full = ready(0, "reaping");
  useSkill(full, 0, 4, 3);
  assert.equal(full.party[0].hp, full.party[0].max);
});
test("rallying bash heals conscious adjacent companions but never revives or heals distant ones", () => {
  const s = ready(1, "rally");
  s.party.forEach((p) => (p.hp = 5));
  s.party[3].hp = 0;
  Object.assign(s.battle.units[0], { x: 3, y: 2 });
  Object.assign(s.battle.units[3], { x: 3, y: 4 });
  assert.equal(useSkill(s, 1, 4, 3), true);
  assert.equal(s.party[0].hp, 8);
  assert.equal(s.party[1].hp, 8);
  assert.equal(s.party[2].hp, 5);
  assert.equal(s.party[3].hp, 0);
  assert.equal(s.battle.enemies[0].stun, 2);
});
test("shockwave bash hits and stuns adjacent victims only, retaining stalwart duration", () => {
  const s = ready(1, "shock");
  useSkill(s, 1, 4, 3);
  assert.equal(s.battle.enemies[0].stun, 2);
  assert.equal(s.battle.enemies[1].stun, 2);
  assert.equal(s.battle.enemies[2].hp, 100);
});
test("piercing shot ignores cover and armor without destroying either and keeps trapper root", () => {
  const s = ready(2, "piercing"),
    e = s.battle.enemies[0];
  Object.assign(e, { x: 3, y: 2 });
  s.battle.units[2].y = 4;
  assert.equal(useSkill(s, 2, 3, 2), true);
  assert.equal(e.hp, 90);
  assert.equal(e.armor, 3);
  assert.equal(e.root, 2);
});
test("quick shot costs one valor, uses weaker bonus and becomes available next round", () => {
  const s = ready(2, "quickshot");
  s.party[2].talent = "marksman";
  s.battle.valor = 1;
  assert.equal(attackRange(s.party[2], true, s), 6);
  assert.equal(useSkill(s, 2, 4, 3), true);
  assert.equal(s.battle.enemies[0].hp, 95);
  assert.equal(s.battle.valor, 0);
  assert.equal(s.battle.units[2].cooldown, 1);
  endTurn(s);
  assert.equal(s.battle.units[2].cooldown, 0);
});
test("impaling lunge hits exactly the next aligned enemy and applies bleeding to both", () => {
  const s = ready(3, "impale");
  useSkill(s, 3, 4, 3);
  assert.equal(s.battle.enemies[0].hp, 95);
  assert.equal(s.battle.enemies[1].hp, 95);
  assert.equal(s.battle.enemies[1].bleed, 2);
  assert.equal(s.battle.enemies[2].hp, 100);
  const diagonal = ready(3, "impale");
  Object.assign(diagonal.battle.enemies[0], { x: 4, y: 4 });
  Object.assign(diagonal.battle.enemies[1], { x: 5, y: 5 });
  useSkill(diagonal, 3, 4, 4);
  assert.equal(diagonal.battle.enemies[1].hp, 100);
});
test("hamstring lunge roots while retaining bloodletter bleeding and respects valor gates", () => {
  const s = ready(3, "hamstring");
  s.battle.valor = 1;
  assert.equal(useSkill(s, 3, 4, 3), false);
  assert.equal(s.battle.units[3].acted, false);
  s.battle.valor = 2;
  useSkill(s, 3, 4, 3);
  assert.equal(s.battle.enemies[0].root, 2);
  assert.equal(s.battle.enemies[0].bleed, 2);
});
test("save restoration keeps valid advanced skills and rejects wrong-role or unearned choices", () => {
  const s = ready(2, "piercing");
  assert.equal(restore(s).party[2].advancedSkill, "piercing");
  s.party[0].advancedSkill = "piercing";
  assert.equal(restore(s).party[0].advancedSkill, null);
  s.party[2].level = 3;
  assert.equal(restore(s).party[2].advancedSkill, null);
  const legacy = fresh();
  delete legacy.party[0].advancedSkill;
  assert.equal(restore(legacy).party[0].advancedSkill, null);
  assert.equal(skillFor(legacy.party[0]).name, "Cleave");
});
