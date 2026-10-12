import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  namedAdversaries,
  bountyOffers,
  acceptBounty,
  abandonBounty,
  startBattle,
  act,
  endTurn,
  bossThreat,
  restore,
  grantEquipment,
  equipEquipment,
  gearPerk,
  attackRange,
} from "../src/game.js";
const bounty = (id = "rook") => {
  const s = fresh(),
    boss = namedAdversaries.find((b) => b.id === id);
  s.renown = boss.minRenown;
  s.location = boss.issuer;
  s.position = { x: places[boss.issuer].x, y: places[boss.issuer].y };
  assert.equal(acceptBounty(s, id), true);
  s.location = boss.target;
  s.position = { x: places[boss.target].x, y: places[boss.target].y };
  assert.equal(startBattle(s), true);
  // Fixed terrain fixture for coordinate-specific tactical assertions.
  delete s.battle.fieldSeed;
  return s;
};
const win = (s) => {
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { hp: 1, x: 2, y: 1, armor: 0 });
  assert.equal(act(s, 0, 2, 1), true);
};
test("bounties appear only at their issuing village boards and enforce renown and active-contract limits", () => {
  const s = fresh();
  assert.equal(bountyOffers(s)[0].id, "rook");
  assert.equal(acceptBounty(s, "rook"), false);
  s.renown = 5;
  assert.equal(acceptBounty(s, "ashfang"), false);
  assert.equal(acceptBounty(s, "rook"), true);
  assert.equal(acceptBounty(s, "rook"), false);
  s.location = -1;
  assert.deepEqual(bountyOffers(s), []);
  s.location = 0;
  s.campOpen = true;
  assert.deepEqual(bountyOffers(s), []);
  s.campOpen = false;
  s.event = {};
  assert.deepEqual(bountyOffers(s), []);
});
for (const boss of namedAdversaries)
  test(`${boss.name} has its own stats, encounter, unique reward, and a permanent completion ledger`, () => {
    const s = bounty(boss.id),
      leader = s.battle.enemies[0],
      gold = s.gold;
    assert.equal(leader.bossId, boss.id);
    assert.equal(leader.name, boss.name);
    assert.equal(leader.max, boss.hp);
    assert.equal(s.battle.enemies.length, boss.tier + 2);
    win(s);
    assert.equal(s.gold, gold + boss.reward);
    assert.equal(s.completed, 1);
    assert.equal(s.contract, null);
    assert.deepEqual(s.bounties[boss.id], { day: 1 });
    assert.equal(s.gear.filter((g) => g.template === boss.gear).length, 1);
    for (const [faction, n] of Object.entries(boss.reputation))
      assert.ok(s.reputation[faction] >= n);
    s.location = boss.issuer;
    s.position = { x: places[boss.issuer].x, y: places[boss.issuer].y };
    assert.equal(acceptBounty(s, boss.id), false);
    assert.equal(acceptBounty(restore(s), boss.id), false);
  });
test("stunning Rook interrupts his escort damage bonus for that entire enemy round", () => {
  const run = (stun) => {
    const s = bounty();
    s.party.forEach((p, i) => {
      if (i) p.hp = 0;
    });
    Object.assign(s.battle.units[0], { x: 3, y: 2 });
    s.battle.enemies.forEach((e, i) => {
      if (i > 1) e.hp = 0;
    });
    Object.assign(s.battle.enemies[0], { x: 8, y: 6, stun: stun ? 1 : 0 });
    Object.assign(s.battle.enemies[1], { x: 4, y: 2, damage: 4 });
    const hp = s.party[0].hp;
    endTurn(s);
    return hp - s.party[0].hp;
  };
  assert.equal(run(false) - run(true), 1);
});
test("Rook gains two attack damage below half health, with no bonus at full health", () => {
  const run = (low) => {
    const s = bounty();
    s.party.forEach((p, i) => {
      if (i) p.hp = 0;
    });
    Object.assign(s.battle.units[0], { x: 3, y: 2 });
    s.battle.enemies.forEach((e, i) => {
      if (i) e.hp = 0;
    });
    Object.assign(s.battle.enemies[0], { x: 4, y: 2, hp: low ? 20 : 40 });
    const hp = s.party[0].hp;
    endTurn(s);
    return hp - s.party[0].hp;
  };
  assert.equal(run(true) - run(false), 2);
});
test("Ashfang heals only living pack members on even rounds, and a stun cancels the howl", () => {
  for (const stun of [false, true]) {
    const s = bounty("ashfang");
    s.battle.turn = 2;
    s.battle.enemies[0].stun = stun ? 1 : 0;
    s.battle.enemies[1].hp = 10;
    s.battle.enemies[2].hp = 0;
    s.battle.enemies[3].hp = 17;
    endTurn(s);
    assert.equal(s.battle.enemies[1].hp, stun ? 10 : 13);
    assert.equal(s.battle.enemies[2].hp, 0);
    assert.equal(s.battle.enemies[3].hp, stun ? 17 : 18);
  }
});
test("Ashfang rushes three affordable tiles, while ordinary wolves still rush two", () => {
  const s = bounty("ashfang");
  s.battle.layoutId = "forest-edge";
  s.battle.enemies.forEach((e, i) => {
    if (i) e.hp = 0;
  });
  Object.assign(s.battle.enemies[0], { x: 7, y: 1 });
  s.party.forEach((p, i) => {
    if (i) p.hp = 0;
  });
  endTurn(s);
  assert.equal(s.battle.enemies[0].x, 4);
});
const fire = () => {
  const s = bounty("maela");
  s.battle.layoutId = "forest-edge";
  s.party.forEach((p, i) => {
    if (i) p.hp = 0;
  });
  s.party[0].armor = 100;
  Object.assign(s.battle.units[0], { x: 3, y: 3 });
  s.battle.enemies.forEach((e, i) => {
    if (i) e.hp = 0;
  });
  Object.assign(s.battle.enemies[0], { x: 6, y: 3, damage: 1 });
  endTurn(s);
  assert.equal(bossThreat(s).firesAt, 2);
  return s;
};
test("Maela telegraphs fire one turn ahead, hits marked tiles through armor, and permits moving out", () => {
  const s = fire(),
    hp = s.party[0].hp;
  endTurn(s);
  assert.equal(s.party[0].hp, hp - 5); // Four fire damage and the minimum one damage from her ordinary shot.
  const moved = fire();
  const before = moved.party[0].hp;
  Object.assign(moved.battle.units[0], { x: 1, y: 3 });
  endTurn(moved);
  assert.ok(moved.party[0].hp >= before - 1);
  assert.ok(!moved.log.some((line) => line.includes("takes 4 fire damage")));
});
test("stunning or killing Maela cancels a queued fire volley", () => {
  for (const mode of ["stun", "dead"]) {
    const s = fire(),
      hp = s.party[0].hp;
    const e = s.battle.enemies[0];
    if (mode === "stun") e.stun = 1;
    else {
      e.hp = 0;
      s.battle.enemies[1].hp = 100;
      s.battle.enemies[1].stun = 2;
    }
    assert.equal(bossThreat(s), null);
    endTurn(s);
    assert.equal(s.party[0].hp, hp);
  }
});
test("fire warnings and active bounties persist in saves, while invalid threats and completed contracts are sanitized", () => {
  const s = fire(),
    loaded = restore(s);
  assert.equal(loaded.contract.bossId, "maela");
  assert.equal(loaded.battle.bossId, "maela");
  assert.deepEqual(bossThreat(loaded), bossThreat(s));
  s.battle.danger.tiles.push({ x: -1, y: 999 });
  assert.ok(restore(s).battle.danger.tiles.every((p) => p.x >= 0 && p.x <= 8));
  s.battle.danger.firesAt = -1;
  assert.equal(restore(s).battle.danger, null);
  s.bounties.maela = { day: 1 };
  assert.equal(restore(s).contract, null);
  assert.equal(restore(s).battle, null);
});
test("defeat keeps the bounty retryable; abandoning it frees the active contract slot", () => {
  const s = bounty();
  s.battle.layoutId = "forest-edge";
  s.party.forEach((p) => (p.hp = 0));
  s.party[0].hp = 1;
  Object.assign(s.battle.enemies[0], { x: 2, y: 1, damage: 1000 });
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.contract.kind, "boss");
  assert.deepEqual(s.bounties, {});
  assert.equal(abandonBounty(s), true);
  assert.equal(s.contract, null);
  assert.equal(abandonBounty(s), false);
  assert.equal(acceptBounty(s, "rook"), true);
});
test("unique bounty gear has real perks and follows normal equipment assignment rules", () => {
  const s = fresh(),
    shield = grantEquipment(s, "rook-shield");
  assert.equal(equipEquipment(s, shield, 1), true);
  assert.equal(gearPerk(s, s.party[1], "bastion"), true);
  const bow = grantEquipment(s, "cinder-bow");
  assert.equal(equipEquipment(s, bow, 2), true);
  assert.equal(attackRange(s.party[2], false, s), 5);
  assert.equal(equipEquipment(s, bow, 0), false);
});
test("completed bounties cannot be replayed by a restored stale contract, and older saves gain an empty ledger", () => {
  const s = fresh();
  delete s.bounties;
  assert.deepEqual(restore(s).bounties, {});
  s.bounties = { rook: { day: 99 }, unknown: { day: 1 } };
  assert.deepEqual(restore(s).bounties, {});
  const active = bounty();
  active.contract.bossId = "unknown";
  assert.equal(restore(active).contract, null);
  assert.equal(restore(active).battle, null);
});
