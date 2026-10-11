import test from "node:test";
import assert from "node:assert/strict";
import {
  enemyArmor,
  spellLock,
  castSpell,
  spellBook,
  fresh,
  restore,
  places,
  startBattle,
  endTurn,
  newEnemyFamilies,
  scoutEnemy,
  scoutEnemyLock,
  inflictWound,
  progressWounds,
  treatWound,
  woundTreatmentLock,
  movementRange,
  attackPower,
  customizeHeraldry,
  adoptTitle,
  titleUnlocked,
  companyTitlePrice,
  aidVillage,
  townCondition,
  updateLivingWorld,
  markResettlement,
  helpSettlement,
  updateWorldRoutes,
  combatCue,
  battleStatuses,
  spendHours,
} from "../src/game.js";
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
for (const f of newEnemyFamilies)
  test(`${f.id} patrol deploys its own family and saves`, () => {
    const s = fresh();
    s.position = { ...s.patrols.find((p) => p.id === `new-${f.id}`) };
    assert.ok(startBattle(s, `new-${f.id}`));
    assert.ok(s.battle.enemies.some((e) => e.kind === f.id));
    assert.ok(save(s).battle.enemies.some((e) => e.kind === f.id));
    endTurn(s);
  });
test("scouting requires an Archer or Thief and consumes time once", () => {
  const s = fresh(),
    p = s.patrols.find((p) => p.id === "new-troll");
  s.position = { x: p.x - 100, y: p.y };
  assert.equal(scoutEnemyLock(s, p.id), null);
  assert.ok(scoutEnemy(s, p.id));
  assert.equal(s.knowledge, 1);
  assert.equal(scoutEnemy(s, p.id), false);
});
test("scouting rejects distant and unconscious specialists", () => {
  const s = fresh();
  assert.ok(scoutEnemyLock(s, "new-troll"));
  const p = s.patrols.find((p) => p.id === "new-troll");
  s.position = { x: p.x, y: p.y };
  for (const c of s.party)
    if (c.role === "Archer" || c.profession === "Thief") c.hp = 0;
  assert.ok(scoutEnemyLock(s, p.id));
});
test("sprains reduce movement and aim wounds reduce attack beyond generic injury", () => {
  const s = fresh(),
    p = s.party[0],
    before = movementRange(p);
  inflictWound(s, 0, "sprain");
  assert.equal(movementRange(p), Math.max(1, before - 1));
  const a = s.party.find((p) => p.role === "Archer");
  a.injury = true;
  const damage = attackPower(s, a);
  inflictWound(s, a.id, "eye");
  assert.equal(attackPower(s, a), damage - 2);
});
test("treatment spends supplies but requires subsequent recovery", () => {
  const s = fresh();
  s.food = 100;
  s.inventory.medicine = 2;
  inflictWound(s, 0, "sprain", 2);
  assert.ok(treatWound(s, 0, "bandage"));
  assert.equal(s.inventory.medicine, 1);
  assert.ok(s.party[0].wound.treated);
  assert.equal(s.party[0].wound.remaining, 22);
  progressWounds(s, 22);
  assert.equal(s.party[0].wound, null);
});
test("untreated recovery is slower and invalid time cannot increase wounds", () => {
  const s = fresh();
  inflictWound(s, 0, "eye");
  progressWounds(s, 4);
  assert.equal(s.party[0].wound.remaining, 23);
  progressWounds(s, -10);
  progressWounds(s, NaN);
  assert.equal(s.party[0].wound.remaining, 23);
  assert.equal(inflictWound(s, 1, "eye", NaN), false);
});
test("empty supplies cannot heal lasting wounds while resting", () => {
  const s = fresh();
  s.food = 0;
  inflictWound(s, 0, "sprain");
  s.party[0].wound.treated = true;
  spendHours(s, 3, { resting: true });
  assert.equal(s.party[0].wound.remaining, 24);
});
test("village surgery clears a lasting wound and charges its stated cost", () => {
  const s = fresh();
  s.gold = 100;
  s.food = 100;
  s.inventory.medicine = 2;
  inflictWound(s, 0, "concussion", 2);
  assert.equal(woundTreatmentLock(s, 0, "surgery"), null);
  assert.ok(treatWound(s, 0, "surgery"));
  assert.equal(s.gold, 60);
  assert.equal(s.inventory.medicine, 1);
  assert.equal(s.party[0].wound, null);
});
test("heraldry is persisted and titles require deeds without granting reputation", () => {
  const s = fresh();
  assert.ok(customizeHeraldry(s, "wine", "wolf", "silver"));
  assert.equal(adoptTitle(s, "leaguefriends"), false);
  s.reputation.guild = 15;
  assert.ok(adoptTitle(s, "leaguefriends"));
  assert.equal(s.reputation.guild, 15);
  assert.equal(companyTitlePrice(s), 0.95);
  assert.deepEqual(save(s).chronicle.heraldry, s.chronicle.heraldry);
  s.reputation.guild = -10;
  assert.equal(companyTitlePrice(s), 1);
  assert.equal(save(s).chronicle.heraldry.title, null);
});
test("monster title requires two different victories", () => {
  const s = fresh();
  s.chronicle.kills.troll = 4;
  assert.equal(titleUnlocked(s, "monsterhunters"), false);
  s.chronicle.kills.spider = 1;
  assert.ok(titleUnlocked(s, "monsterhunters"));
});
test("village aid consumes resources and is limited to once daily", () => {
  const s = fresh();
  s.inventory.wood = 10;
  const before = townCondition(s);
  assert.ok(aidVillage(s, "repair"));
  assert.equal(townCondition(s), before + 12);
  assert.equal(s.inventory.wood, 7);
  assert.equal(aidVillage(s, "food"), false);
});
test("safe villages improve and threatened villages deteriorate only once daily", () => {
  const s = fresh();
  for (const p of s.patrols) p.cleared = true;
  s.day = 2;
  assert.ok(updateLivingWorld(s));
  assert.equal(townCondition(s, 0), 57);
  assert.equal(updateLivingWorld(s), false);
  const raider = s.patrols.find((p) => p.kind === "bandits");
  raider.cleared = false;
  raider.x = places[0].x;
  raider.y = places[0].y;
  s.day = 3;
  updateLivingWorld(s);
  assert.equal(townCondition(s, 0), 55);
});
test("strongholds resettle after three days with finite aid and daily supplies", () => {
  const s = fresh();
  s.strongholds.briar.cleared = true;
  markResettlement(s, "briar", 12);
  s.day = 3;
  updateLivingWorld(s);
  assert.equal(s.chronicle.settlements.briar.arrived, false);
  s.day = 4;
  updateLivingWorld(s);
  assert.ok(s.chronicle.settlements.briar.arrived);
  s.location = 12;
  s.position = { x: places[12].x, y: places[12].y };
  s.gold = 200;
  s.food = 100;
  s.inventory.wood = 10;
  assert.ok(helpSettlement(s, "briar", "trade"));
  assert.equal(helpSettlement(s, "briar", "trade"), false);
  assert.ok(helpSettlement(s, "briar", "rebuild"));
  assert.equal(helpSettlement(s, "briar", "rebuild"), false);
  assert.ok(save(s).chronicle.settlements.briar.helped);
});
test("caravans detour from raiders and restore routes when safe", () => {
  const s = fresh();
  s.day = 2;
  for (const p of s.patrols) if (p.kind === "bandits") p.cleared = true;
  const merchant = s.patrols.find((p) => p.kind === "merchant"),
    original = structuredClone(merchant.route),
    raider = s.patrols.find((p) => p.kind === "bandits");
  raider.cleared = false;
  Object.assign(raider, original[0]);
  updateWorldRoutes(s);
  assert.ok(merchant.detoured);
  assert.notDeepEqual(merchant.route, original);
  raider.cleared = true;
  updateWorldRoutes(s);
  assert.equal(merchant.detoured, false);
  assert.deepEqual(merchant.route, original);
});
test("combat cue history is bounded and never replays on reload", () => {
  const s = fresh();
  s.position = { ...s.patrols.find((p) => p.id === "new-troll") };
  startBattle(s, "new-troll");
  for (let i = 0; i < 40; i++)
    combatCue(s, "strike", { x: 0, y: 1 }, { x: 1, y: 1 });
  assert.equal(s.battle.feedback.length, 30);
  assert.deepEqual(save(s).battle.feedback, []);
  const e = s.battle.enemies[0];
  e.smash = { x: 1, y: 1 };
  e.burn = 1;
  assert.ok(battleStatuses(s, e).includes("Windup"));
  assert.ok(battleStatuses(s, e).includes("Burning"));
});
test("older saves migrate safely and corrupted chronicle fields are sanitized", () => {
  const s = fresh();
  s.version = 18;
  delete s.chronicle;
  assert.equal(save(s).version, 19);
  assert.ok(save(s).chronicle);
  const raw = fresh();
  raw.chronicle.heraldry = {
    field: "bad",
    charge: "bad",
    trim: "bad",
    title: "monsterhunters",
  };
  raw.party[0].wound = { type: "bad", remaining: Infinity };
  const restored = save(raw);
  assert.equal(restored.party[0].wound, null);
  assert.equal(restored.chronicle.heraldry.title, null);
  assert.equal(restored.chronicle.heraldry.charge, "sun");
});
function enemyBattle(family) {
  const s = fresh(),
    p = s.patrols.find((p) => p.id === `new-${family}`);
  s.position = { x: p.x, y: p.y };
  startBattle(s, p.id);
  s.battle.layoutId = "road";
  return s;
}
test("troll regeneration stops for the final tick of burning", () => {
  const s = enemyBattle("troll"),
    e = s.battle.enemies[0];
  e.hp = 20;
  endTurn(s);
  assert.equal(e.hp, 24);
  e.burn = 1;
  endTurn(s);
  assert.ok(e.hp < 24);
});
test("spiders place visible webs with finite stock", () => {
  const s = enemyBattle("spider");
  endTurn(s);
  assert.ok(s.battle.traps.some((t) => t.kind === "web"));
  assert.ok(s.battle.enemies.some((e) => e.webs < 2));
});
test("cultist prayers spend a slot before resolving and stun interrupts", () => {
  const s = enemyBattle("cultist"),
    e = s.battle.enemies[0],
    ally = s.battle.enemies[1];
  e.x = 7;
  e.y = 3;
  ally.x = 7;
  ally.y = 4;
  ally.hp = 5;
  endTurn(s);
  assert.equal(e.mana, 1);
  assert.ok(e.casting);
  const hp = ally.hp;
  e.stun = 1;
  endTurn(s);
  assert.equal(e.casting, null);
  assert.equal(e.mana, 1);
  assert.equal(ally.hp, hp);
});
test("troll smash is telegraphed and a moved target avoids its area", () => {
  const s = enemyBattle("troll"),
    e = s.battle.enemies[0],
    u = s.battle.units[0];
  s.battle.enemies = s.battle.enemies.filter((v) => v === e);
  e.x = 4;
  e.y = 3;
  u.x = 3;
  u.y = 3;
  for (const v of s.battle.units.filter((v) => v !== u)) {
    v.x = 0;
    v.y = v.id;
  }
  endTurn(s);
  assert.deepEqual(e.smash, { x: 3, y: 3 });
  u.x = 0;
  u.y = 6;
  const hp = s.party[u.id].hp;
  endTurn(s);
  assert.equal(s.party[u.id].hp, hp);
  assert.equal(e.smash, null);
});
test("fire ground prevents troll regeneration even without a burn status", () => {
  const s = enemyBattle("troll"),
    e = s.battle.enemies[0];
  e.hp = 20;
  s.battle.realmMagic = {
    surfaces: [{ kind: "fire", x: e.x, y: e.y, turns: 1 }],
    concentration: [],
  };
  endTurn(s);
  assert.equal(e.hp, 17);
});

test("knight shield collapses when two companions flank it", () => {
  const s = enemyBattle("knight"),
    e = s.battle.enemies[0];
  e.x = 4;
  e.y = 3;
  e.guard = true;
  for (const u of s.battle.units) {
    u.x = 0;
    u.y = u.id;
  }
  assert.equal(enemyArmor(s, e), 5);
  Object.assign(s.battle.units[0], { x: 3, y: 3 });
  Object.assign(s.battle.units[1], { x: 4, y: 2 });
  assert.equal(enemyArmor(s, e), 2);
});
test("concussion blocks second-level spells without spending slots", () => {
  const s = enemyBattle("cultist"),
    p = s.party[0];
  p.role = "Wizard";
  p.level = 4;
  p.spellSpent = { 1: 0, 2: 0 };
  inflictWound(s, p.id, "concussion");
  const spell = spellBook.find((v) => v.role === "Wizard" && v.level === 2);
  assert.match(spellLock(s, p.id, spell.id, 2, 2), /Concussion/);
  assert.equal(p.spellSpent[2], 0);
});
test("healing magic cleanses spider poison even at full health", () => {
  const s = enemyBattle("spider"),
    p = s.party[0],
    u = s.battle.units[0];
  p.role = "Cleric";
  p.level = 4;
  p.spellSpent = { 1: 0, 2: 0 };
  u.poison = 2;
  s.inventory.herbs = 2;
  const spell = spellBook.find((v) => v.role === "Cleric" && v.kind === "heal");
  assert.ok(castSpell(s, p.id, spell.id, u.x, u.y));
  assert.equal(u.poison, 0);
  assert.equal(p.spellSpent[spell.level], 1);
});

test("untreated infection never revives an unconscious companion", () => {
  const s = fresh();
  s.food = 100;
  s.gold = 100;
  inflictWound(s, 0, "infection");
  s.party[0].hp = 0;
  spendHours(s, 24);
  assert.equal(s.party[0].hp, 0);
});
