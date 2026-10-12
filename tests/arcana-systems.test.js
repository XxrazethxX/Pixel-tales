import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  createCompany,
  founderRoles,
  places,
  spellsFor,
  spellCatalogFor,
  spellSlots,
  prepareSpells,
  preparationLock,
  preparationCapacity,
  learnGrimoire,
  learnGrimoireLock,
  recoverGrimoire,
  academyService,
  academyLock,
  castExplorationMagic,
  explorationMagicLock,
  fantasyAction,
  fantasyActionLock,
  startBattle,
  endTurn,
  castSpell,
  spellLock,
  useSkill,
  attackPower,
  movementRange,
  companyScout,
  recruitmentOffers,
  recruit,
  passageAction,
  passageLock,
  grantEquipment,
  equipEquipment,
  recoverMagic,
  inflictWound,
} from "../src/game.js";
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
function caster(role = "Wizard") {
  const s = fresh();
  s.food = 200;
  s.gold = 500;
  s.knowledge = 10;
  s.inventory.herbs = 30;
  s.inventory.ore = 20;
  Object.assign(s.party[0], {
    role,
    level: 4,
    preparedSpells: null,
    knownSpells: [],
    spellSpent: { 1: 0, 2: 0 },
  });
  return s;
}
function battle(family = "necromancer", role = "Wizard") {
  const s = caster(role),
    p = s.patrols.find((p) => p.id === `new-${family}`);
  s.position = { x: p.x, y: p.y };
  assert.ok(startBattle(s, p.id));
  s.battle.openingAmbush = false;
  s.battle.layoutId = "legacy";
  return s;
}
function site(s, id) {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
}
test("founders can choose all fantasy classes with independent professions and prepared magic", () => {
  const founders = ["Rogue", "Druid", "Paladin", "Wizard"].map((role, i) => ({
    role,
    name: `Founder ${i}`,
    profession: "Cook",
    trait: "resolute",
  }));
  const s = createCompany({
    name: "New Dawn",
    banner: "pine",
    origin: "wanderers",
    founders,
  });
  assert.ok(s);
  assert.equal(s.party[0].profession, "Cook");
  assert.ok(companyScout(s));
  assert.equal(s.party[1].max, founderRoles.Druid.max);
  assert.equal(s.party[2].preparedSpells.length, 3);
  assert.ok(save(s).party.some((p) => p.role === "Druid"));
});
test("preparation is restricted to camp and academy, costs an hour and preserves spent slots", () => {
  const s = caster();
  assert.ok(preparationLock(s, 0, ["aether"]));
  s.campOpen = true;
  s.party[0].spellSpent[1] = 1;
  const time = s.timeOfDay;
  assert.ok(prepareSpells(s, 0, ["aether", "reveal"]));
  assert.equal(s.timeOfDay, time + 1);
  assert.equal(s.party[0].spellSpent[1], 1);
  assert.deepEqual(
    spellsFor(s.party[0]).map((v) => v.id),
    ["aether", "reveal"],
  );
  assert.equal(prepareSpells(s, 0, ["reveal", "aether"]), false);
});
test("preparation rejects empty, duplicate, unknown and excessive selections without cost", () => {
  const s = caster();
  s.party[0].level = 1;
  s.campOpen = true;
  for (const ids of [
    [],
    ["aether", "aether"],
    ["bad"],
    ["aether", "veil", "cinder", "reveal"],
  ])
    assert.equal(prepareSpells(s, 0, ids), false);
  assert.equal(s.timeOfDay, 8);
  assert.equal(preparationCapacity(s.party[0]), 3);
});
test("unprepared spells cannot be cast in battle", () => {
  const s = battle();
  s.party[0].preparedSpells = ["reveal"];
  assert.match(spellLock(s, 0, "aether", 7, 1), /unavailable/);
  assert.equal(castSpell(s, 0, "aether", 7, 1), false);
  assert.equal(s.party[0].spellSpent[1], 0);
});
test("grimoires are finite landmark discoveries requiring prior exploration", () => {
  const s = caster();
  site(s, 5);
  assert.equal(recoverGrimoire(s, "prism"), false);
  s.explored.push(5);
  assert.ok(recoverGrimoire(s, "prism"));
  assert.equal(s.arcana.grimoires.prism, 1);
  assert.equal(recoverGrimoire(s, "prism"), false);
  assert.ok(save(s).arcana.recovered.prism);
});
test("learning a grimoire consumes a copy and knowledge and requires preparation", () => {
  const s = caster();
  s.campOpen = true;
  s.arcana.grimoires.prism = 1;
  assert.ok(learnGrimoire(s, 0, "prism"));
  assert.equal(s.knowledge, 8);
  assert.equal(s.arcana.grimoires.prism, 0);
  assert.ok(spellCatalogFor(s.party[0]).some((v) => v.id === "mirror-ward"));
  assert.ok(!spellsFor(s.party[0]).some((v) => v.id === "mirror-ward"));
  assert.equal(learnGrimoire(s, 0, "prism"), false);
  assert.ok(prepareSpells(s, 0, ["mirror-ward", "aether"]));
  assert.ok(save(s).party[0].knownSpells.includes("mirror-ward"));
});
test("grimoires reject other classes and insufficient knowledge", () => {
  const s = caster("Druid");
  s.campOpen = true;
  s.arcana.grimoires.prism = 1;
  assert.ok(learnGrimoireLock(s, 0, "prism"));
  s.arcana.grimoires.elder = 1;
  s.knowledge = 1;
  assert.equal(learnGrimoire(s, 0, "elder"), false);
  assert.equal(s.arcana.grimoires.elder, 1);
});
test("academy sells daily reagent parcels and grimoires only at Emberfall", () => {
  const s = caster();
  assert.ok(academyLock(s, "reagents"));
  site(s, 6);
  const gold = s.gold,
    herbs = s.inventory.herbs;
  assert.ok(academyService(s, "reagents"));
  assert.equal(s.gold, gold - 24);
  assert.equal(s.inventory.herbs, herbs + 4);
  assert.equal(academyService(s, "reagents"), false);
  assert.ok(academyService(s, "tome", "prism"));
  assert.equal(academyService(s, "tome", "prism"), false);
  assert.equal(s.arcana.grimoires.prism, 1);
});
test("academy tuition is costly, timed and bounded per companion each day", () => {
  const s = caster();
  site(s, 6);
  const before = s.knowledge;
  assert.ok(academyService(s, "tuition", 0));
  assert.equal(s.gold, 465);
  assert.equal(s.timeOfDay, 11);
  assert.equal(s.knowledge, before + 1);
  assert.equal(academyService(s, "tuition", 0), false);
  assert.equal(academyService(s, "tuition", 1), false);
});
test("remote camp meditation and city recovery restore the shared slot budget", () => {
  const s = caster();
  s.party[0].spellSpent = { 1: 2, 2: 1 };
  assert.equal(recoverMagic(s), false);
  site(s, 6);
  assert.ok(recoverMagic(s));
  assert.equal(s.gold, 485);
  s.party[0].spellSpent[1] = 1;
  s.campOpen = true;
  const herbs = s.inventory.herbs,
    food = s.food;
  assert.ok(recoverMagic(s));
  assert.equal(s.inventory.herbs, herbs - 2);
  assert.ok(s.food <= food - 2);
  assert.equal(spellSlots(s.party[0])[1], 3);
});
test("Lantern reveals stash clues while leaving digging and lockpicking interactive", () => {
  const s = caster();
  site(s, 10);
  s.event = { kind: "site", site: 10, stage: "search", pin: 0 };
  assert.ok(castExplorationMagic(s, 0, "reveal"));
  assert.deepEqual(s.stash.clues, [8, 2]);
  assert.equal(s.stash.found, false);
  assert.equal(s.stash.unlocked, false);
  assert.equal(s.party[0].spellSpent[1], 1);
  assert.equal(castExplorationMagic(s, 0, "reveal"), false);
});
test("root sensing consumes a slot and yields a finite cache without bypassing preparation", () => {
  const s = caster("Druid");
  site(s, 7);
  const herbs = s.inventory.herbs;
  assert.ok(castExplorationMagic(s, 0, "rootsense"));
  assert.equal(s.inventory.herbs, herbs + 3);
  assert.equal(s.party[0].spellSpent[1], 1);
  assert.equal(castExplorationMagic(s, 0, "rootsense"), false);
  s.party[0].preparedSpells = ["bark"];
  site(s, 2);
  assert.equal(castExplorationMagic(s, 0, "rootsense"), false);
});
for (const [role, spell, region] of [
  ["Wizard", "waystep", "mountains"],
  ["Druid", "wildbridge", "coast"],
  ["Cleric", "haven", "haunted"],
  ["Paladin", "sanctify", "city"],
])
  test(`${spell} resolves ${region} obstacles at its stated shared cost`, () => {
    const s = caster(role);
    s.event = { kind: "region", region };
    const food = s.food,
      fatigue = s.party[0].fatigue,
      herbs = s.inventory.herbs;
    assert.ok(castExplorationMagic(s, 0, spell));
    assert.equal(s.event, null);
    assert.equal(s.food, food);
    assert.equal(s.party[0].fatigue, fatigue + 2);
    assert.equal(
      s.inventory.herbs,
      herbs - (["haven", "sanctify"].includes(spell) ? 1 : 0),
    );
    assert.equal(
      s.party[0].spellSpent[
        spell === "waystep" || spell === "wildbridge" ? 2 : 1
      ],
      1,
    );
  });
test("exploration magic rejects the wrong obstacle, missing slots and concussion", () => {
  const s = caster("Druid");
  s.event = { kind: "region", region: "haunted" };
  assert.equal(castExplorationMagic(s, 0, "wildbridge"), false);
  s.event.region = "coast";
  inflictWound(s, 0, "concussion");
  assert.match(explorationMagicLock(s, 0, "wildbridge"), /Concussion/);
  s.party[0].wound = null;
  s.party[0].spellSpent[2] = 9;
  assert.equal(castExplorationMagic(s, 0, "wildbridge"), false);
});
test("revealed passages have persistent selectable loot and cannot be farmed", () => {
  const s = caster();
  site(s, 2);
  assert.ok(passageLock(s, "enter"));
  assert.ok(castExplorationMagic(s, 0, "reveal"));
  assert.ok(passageAction(s, "enter"));
  assert.ok(passageAction(s, "search"));
  assert.ok(passageAction(s, "take", "gold"));
  const r = save(s);
  assert.equal(r.event.kind, "arcane-passage");
  assert.equal(r.arcana.passages[2].loot.gold, 0);
  assert.equal(passageAction(r, "take", "gold"), false);
  assert.ok(passageAction(r, "take", "herbs"));
  assert.ok(passageAction(r, "leave"));
  assert.ok(passageAction(r, "enter"));
  assert.equal(passageAction(r, "search"), false);
});
test("Rogue reads one lock pin without auto-opening the stash or requiring Thief profession", () => {
  const s = caster("Rogue");
  s.party[0].profession = "Cook";
  s.event = { kind: "site", site: 10, stage: "lock", pin: 1 };
  assert.ok(fantasyAction(s, 0, "read-lock"));
  assert.match(s.event.message, /tension 4/);
  assert.equal(s.stash.unlocked, false);
  assert.equal(s.event.pin, 1);
  assert.equal(s.party[0].profession, "Cook");
});
test("Druid wolf form spends an action and slot, improves melee/movement and prevents casting", () => {
  const s = battle("shaman", "Druid"),
    p = s.party[0],
    u = s.battle.units[0],
    damage = attackPower(s, p),
    move = movementRange(p);
  assert.ok(fantasyAction(s, 0, "wolf-form"));
  assert.ok(u.acted);
  assert.equal(p.spellSpent[1], 1);
  assert.equal(attackPower(s, p), damage + 3);
  assert.equal(movementRange(p), move + 1);
  assert.match(spellLock(s, 0, "bark", u.x, u.y), /animal form/);
  const r = save(s);
  assert.equal(r.battle.units[0].wildshape, 3);
  assert.equal(movementRange(r.party[0]), move + 1);
  endTurn(s);
  endTurn(s);
  endTurn(s);
  assert.equal(u.wildshape, 0);
  assert.equal(p._wildshape, false);
});
test("Paladin aura has a finite slot cost and duration and does not stack repeatedly", () => {
  const s = battle("shaman", "Paladin"),
    u = s.battle.units[0];
  assert.ok(fantasyAction(s, 0, "aura"));
  assert.equal(u.aura, 3);
  assert.equal(s.party[0].spellSpent[1], 1);
  u.acted = false;
  assert.ok(fantasyActionLock(s, 0, "aura"));
  endTurn(s);
  assert.equal(u.aura, 2);
  assert.equal(save(s).battle.units[0].aura, 2);
});
test("nature magic actually roots its target and consumes reagents", () => {
  const s = battle("shaman", "Druid"),
    u = s.battle.units[0],
    e = s.battle.enemies[0];
  u.x = 5;
  u.y = 3;
  e.x = 7;
  e.y = 3;
  const herbs = s.inventory.herbs;
  assert.ok(castSpell(s, 0, "briar", e.x, e.y));
  assert.equal(e.root, 2);
  assert.equal(s.inventory.herbs, herbs - 1);
});
test("new magical enemies deploy distinct companions and finite slots", () => {
  for (const [family, kind] of [
    ["necromancer", "skeleton"],
    ["shaman", "wolf"],
    ["sorcerer", "knight"],
  ]) {
    const s = battle(family);
    assert.ok(s.battle.enemies.some((e) => e.kind === kind));
    assert.equal(s.battle.enemies[0].mana, 3);
    assert.equal(save(s).battle.enemies[0].mana, 3);
  }
});
test("necromancers prepare resurrection and can raise each corpse only once", () => {
  const s = battle(),
    e = s.battle.enemies[0],
    corpse = s.battle.enemies[1];
  e.x = 7;
  e.y = 3;
  corpse.x = 7;
  corpse.y = 2;
  corpse.hp = 0;
  endTurn(s);
  assert.equal(e.mana, 2);
  assert.ok(e.casting);
  endTurn(s);
  assert.equal(corpse.hp, 10);
  assert.ok(corpse.raised);
  corpse.hp = 0;
  endTurn(s);
  assert.equal(e.mana, 2);
  assert.equal(corpse.hp, 0);
});
test("stun interrupts a necromancer without refunding its slot", () => {
  const s = battle(),
    e = s.battle.enemies[0],
    corpse = s.battle.enemies[1];
  e.x = 7;
  e.y = 3;
  corpse.x = 7;
  corpse.y = 2;
  corpse.hp = 0;
  endTurn(s);
  e.stun = 1;
  endTurn(s);
  assert.equal(e.mana, 2);
  assert.equal(e.casting, null);
  assert.equal(corpse.hp, 0);
});
test("shamans telegraph finite beast blessings that increase attack power", () => {
  const s = battle("shaman"),
    e = s.battle.enemies[0],
    wolf = s.battle.enemies[1];
  e.x = 7;
  e.y = 3;
  wolf.x = 7;
  wolf.y = 2;
  wolf.root = 4;
  endTurn(s);
  assert.equal(e.mana, 2);
  assert.ok(e.casting);
  endTurn(s);
  assert.equal(wolf.empowered, 2);
  const r = save(s);
  assert.equal(r.battle.enemies[1].empowered, 2);
});
test("sorcerer area spells are avoidable and damage nearby enemy allies", () => {
  const s = battle("sorcerer"),
    e = s.battle.enemies[0],
    u = s.battle.units[0],
    ally = s.battle.enemies[1];
  e.x = 5;
  e.y = 3;
  u.x = 3;
  u.y = 3;
  for (const v of s.battle.units.filter((v) => v !== u)) {
    v.x = 0;
    v.y = v.id;
  }
  ally.x = 3;
  ally.y = 4;
  endTurn(s);
  assert.ok(e.casting);
  const hp = ally.hp,
    php = s.party[0].hp;
  u.x = 0;
  u.y = 6;
  endTurn(s);
  assert.equal(s.party[0].hp, php);
  assert.ok(ally.hp < hp);
  assert.equal(e.mana, 2);
});
test("city and village recruits expose fantasy classes and preserve their costs and professions", () => {
  const s = fresh();
  s.gold = 500;
  assert.ok(recruitmentOffers(s).some((p) => p.role === "Paladin"));
  assert.ok(recruit(s, "fantasy-0"));
  assert.equal(s.party[4].role, "Paladin");
  assert.ok(s.party[4].preparedSpells.length);
  site(s, 3);
  assert.ok(recruitmentOffers(s).some((p) => p.role === "Rogue"));
  site(s, 6);
  assert.ok(recruitmentOffers(s).some((p) => p.role === "Druid"));
});
test("fantasy classes can equip purposeful class weapons", () => {
  for (const [role, item] of [
    ["Rogue", "night-knives"],
    ["Druid", "grove-staff"],
    ["Paladin", "oathblade"],
  ]) {
    const s = caster(role),
      id = grantEquipment(s, item);
    assert.ok(equipEquipment(s, id, 0));
    assert.equal(save(s).party[0].equipment.weapon, id);
  }
});
test("save migration validates prepared lists, grimoires, services and enemy channels", () => {
  const s = caster();
  s.version = 19;
  delete s.arcana;
  assert.equal(save(s).version, 21);
  const raw = caster();
  raw.party[0].knownSpells = ["mirror-ward", "storm", "bad", "mirror-ward"];
  raw.party[0].preparedSpells = ["aether", "aether", "bad", "mirror-ward"];
  raw.arcana.grimoires.prism = Infinity;
  raw.arcana.services.reagents = 999;
  const r = save(raw);
  assert.deepEqual(r.party[0].knownSpells, ["mirror-ward"]);
  assert.deepEqual(r.party[0].preparedSpells, ["aether", "mirror-ward"]);
  assert.equal(r.arcana.grimoires.prism, 0);
  assert.equal(r.arcana.services.reagents, undefined);
});
for (const family of ["necromancer", "shaman", "sorcerer"])
  test(`Counterspell interrupts ${family} with both sides' slots spent`, () => {
    const s = battle(family),
      e = s.battle.enemies[0],
      u = s.battle.units[0];
    u.x = 5;
    u.y = 3;
    e.x = 7;
    e.y = 3;
    e.mana = 2;
    e.casting = { x: 5, y: 3 };
    assert.ok(castSpell(s, 0, "counterspell", e.x, e.y));
    assert.equal(e.casting, null);
    assert.equal(e.silenced, 1);
    assert.equal(e.mana, 2);
    assert.equal(s.party[0].spellSpent[1], 1);
  });
test("Paladin aura reduces real damage to adjacent allies", () => {
  const original = battle("shaman", "Paladin");
  original.battle.enemies = [
    {
      id: 0,
      kind: "archer",
      hp: 100,
      max: 100,
      x: 5,
      y: 3,
      armor: 0,
      damage: 10,
    },
  ];
  Object.assign(original.battle.units[0], { x: 3, y: 3 });
  for (const u of original.battle.units.filter((v) => v.id !== 0)) {
    u.x = 0;
    u.y = u.id;
  }
  const protectedState = save(original);
  assert.ok(fantasyAction(protectedState, 0, "aura"));
  endTurn(original);
  endTurn(protectedState);
  assert.equal(protectedState.party[0].hp, original.party[0].hp + 2);
});
test("Rogue backstab deals more damage when an ally engages its target", () => {
  const original = battle("shaman", "Rogue");
  const e = original.battle.enemies[0];
  e.hp = e.max = 100;
  e.x = 4;
  e.y = 3;
  Object.assign(original.battle.units[0], { x: 3, y: 3 });
  for (const u of original.battle.units.filter((v) => v.id !== 0)) {
    u.x = 0;
    u.y = u.id;
  }
  const flanked = save(original);
  Object.assign(flanked.battle.units[1], { x: 4, y: 2 });
  assert.ok(useSkill(original, 0, 4, 3));
  assert.ok(useSkill(flanked, 0, 4, 3));
  assert.ok(flanked.battle.enemies[0].hp <= original.battle.enemies[0].hp - 3);
});
test("shaman blessings follow their marked beast as it moves and survive reload", () => {
  const s = battle("shaman"),
    e = s.battle.enemies[0],
    wolf = s.battle.enemies[1];
  e.x = 7;
  e.y = 3;
  wolf.x = 7;
  wolf.y = 2;
  endTurn(s);
  assert.equal(e.casting.targetId, wolf.id);
  assert.equal(e.casting.x, wolf.x);
  const r = save(s);
  assert.equal(r.battle.enemies[0].casting.targetId, wolf.id);
  endTurn(r);
  assert.equal(r.battle.enemies[1].empowered, 2);
});
