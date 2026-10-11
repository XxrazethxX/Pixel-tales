import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  openCamp,
  leaveCamp,
  assignProfession,
  startBattle,
  endTurn,
  act,
  castSpell,
  spellLock,
  spellSlots,
  hasLineOfSight,
  fantasyStrongholds,
  realmHold,
  fantasyHoldAction,
  refreshFantasyStrongholds,
  advancePatrols,
  supportTerritory,
  territoryOwner,
  townAccessLock,
  buyTerritoryPass,
  recruitmentOffers,
  recruit,
  purchaseModifier,
  buy,
  lineageStoryAction,
  lineageStoryLock,
  recoverFrontierSlot,
  recoverShardMagic,
  realmJournal,
  trackRealmLead,
  enterDungeon,
  realmDungeonAction,
  dungeonPuzzle,
  beginWagonEvent,
  wagonChoice,
  assignTravelJob,
  checkWagonTravel,
  interruptConcentration,
  hitEnemy,
} from "../src/game.js";
const arrive = (s, i) => {
  s.location = i;
  s.position = { x: places[i].x, y: places[i].y };
};
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
function fight(role = "Wizard") {
  const s = fresh();
  s.party[0].role = role;
  s.party[0].level = 3;
  s.inventory.herbs = 20;
  s.inventory.ore = 20;
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 65 };
  assert.ok(startBattle(s));
  s.battle.layout = "legacy";
  s.battle.units[0].x = 2;
  s.battle.units[0].y = 2;
  s.battle.enemies.forEach((e, i) => {
    e.x = 5 + i;
    e.y = 2;
    e.hp = e.max = 50;
    e.damage = 1;
  });
  return s;
}
test("v16 migrates old companies and sanitizes frontier metadata", () => {
  const s = fresh();
  s.version = 15;
  delete s.realm;
  const r = save(s);
  assert.equal(r.version, 18);
  assert.equal(territoryOwner(r), "wardens");
  assert.deepEqual(r.realm.journal, []);
  s.realm = {
    territories: { 0: "evil" },
    lineage: { 0: { stage: 99 } },
    dungeons: { 2: { dial: 99 } },
    journal: [{ day: 999, text: "bad" }],
    wagonEvent: { kind: "evil" },
  };
  const clean = save(s);
  assert.equal(territoryOwner(clean), "wardens");
  assert.equal(clean.realm.lineage[0], undefined);
  assert.equal(clean.realm.dungeons[2].dial, 4);
  assert.deepEqual(clean.realm.journal, []);
});
test("charters change local rulers with concrete costs, rival consequences and cooldown", () => {
  const s = fresh();
  s.gold = 100;
  s.food = 20;
  assert.ok(supportTerritory(s, "freefolk"));
  assert.equal(territoryOwner(s), "freefolk");
  assert.equal(s.gold, 60);
  assert.equal(s.food, 14);
  assert.equal(s.reputation.freefolk, 6);
  assert.equal(s.reputation.wardens, -6);
  assert.equal(s.realm.charters[0], 1);
  assert.equal(supportTerritory(s, "guild"), false);
  assert.equal(save(s).realm.territories[0], "freefolk");
  assert.ok(s.patrols.some((p) => p.id === "border-0" && !p.hostile));
});
test("hostile villages gate services and hiring until a paid daily pass", () => {
  const s = fresh();
  s.reputation.wardens = -16;
  assert.match(townAccessLock(s), /day pass/);
  assert.deepEqual(recruitmentOffers(s), []);
  assert.equal(buy(s, "food"), false);
  const gold = s.gold;
  assert.ok(buyTerritoryPass(s));
  assert.equal(s.gold, gold - 25);
  assert.equal(townAccessLock(s), "");
  assert.ok(recruitmentOffers(s).length);
  assert.equal(save(s).realm.passage[0], 1);
  s.day++;
  assert.match(townAccessLock(s), /day pass/);
});
test("local faction standing changes prices independently of global guild benefits", () => {
  const s = fresh();
  const before = purchaseModifier(s);
  s.reputation.wardens = 10;
  assert.ok(purchaseModifier(s) < before);
  s.reputation.wardens = -10;
  assert.ok(purchaseModifier(s) > before);
});
test("friendly border guards do not intercept companies or raid caravans", () => {
  const s = fresh();
  s.gold = 100;
  supportTerritory(s, "freefolk");
  s.location = -1;
  const p = s.patrols.find((p) => p.id === "border-0");
  p.x = s.position.x;
  p.y = s.position.y;
  s.patrols.forEach((v) => {
    if (v.id !== p.id) v.cleared = true;
  });
  advancePatrols(s, 0.1);
  assert.equal(s.event, null);
  assert.equal(s.battle, null);
});
for (const h of fantasyStrongholds) {
  test(`${h.name} scouting is class gated and disruption stops new raids`, () => {
    const s = fresh();
    arrive(s, h.site);
    s.party[2].role = "Swordswoman";
    assert.equal(fantasyHoldAction(s, h.id, "scout"), false);
    assignProfession(s, 0, "Thief");
    assert.ok(fantasyHoldAction(s, h.id, "scout"));
    s.inventory[h.cost] = h.amount;
    s.stealth = { active: true, concealment: 100 };
    assert.ok(fantasyHoldAction(s, h.id, "disrupt"));
    assert.equal(s.inventory[h.cost], 0);
    s.day = 10;
    refreshFantasyStrongholds(s);
    assert.equal(s.patrols.filter((p) => p.realmHold === h.id).length, 0);
    const loaded = save(s);
    assert.ok(realmHold(loaded, h.id).disrupted);
    assert.equal(fantasyHoldAction(loaded, h.id, "disrupt"), false);
  });
  test(`${h.name} produces bounded persistent patrols and permanent clearance`, () => {
    const s = fresh();
    arrive(s, h.site);
    s.discovered.push(h.site);
    s.day = 4;
    s.timeOfDay = h.family === "goblin" ? 8 : 20;
    realmHold(s, h.id).lastSpawn = 1;
    refreshFantasyStrongholds(s);
    assert.equal(s.patrols.filter((p) => p.realmHold === h.id).length, 1);
    assert.equal(save(s).patrols.filter((p) => p.realmHold === h.id).length, 1);
    fantasyHoldAction(s, h.id, "scout");
    assert.ok(fantasyHoldAction(s, h.id, "attack"));
    assert.equal(s.battle.realmStronghold, h.id);
    assert.equal(s.battle.enemies[0].name, h.leader);
    s.battle.layout = "legacy";
    const e = s.battle.enemies[0];
    s.battle.enemies.forEach((v) => (v.hp = 0));
    e.hp = 1;
    e.x = 2;
    e.y = 1;
    Object.assign(s.battle.units[0], { x: 1, y: 1, acted: false });
    assert.ok(act(s, 0, 2, 1));
    assert.ok(realmHold(s, h.id).cleared);
    s.day = 30;
    refreshFantasyStrongholds(s);
    assert.ok(
      s.patrols.filter((p) => p.realmHold === h.id).every((p) => p.cleared),
    );
    assert.ok(realmHold(save(s), h.id).cleared);
  });
}
for (const [race, site, perk] of [
  ["elf", 7, "grove"],
  ["dwarf", 4, "ancestor"],
  ["orc", 12, "oath"],
  ["human", 13, "kin"],
])
  test(`${race} heritage story has travel, camp choice, permanent reward and persistence`, () => {
    const s = fresh();
    s.party[0].race = race;
    assert.equal(lineageStoryAction(s, 0, "begin"), false);
    openCamp(s);
    assert.ok(lineageStoryAction(s, 0, "begin"));
    leaveCamp(s);
    assert.equal(lineageStoryAction(s, 0, "investigate"), false);
    arrive(s, site);
    assert.ok(lineageStoryAction(s, 0, "investigate"));
    if (race === "orc") {
      assert.equal(s.battle.enemies[0].name, "Commander Rhusk");
      s.battle.layout = "legacy";
      s.battle.enemies.forEach((e) => (e.hp = 0));
      const e = s.battle.enemies[0];
      e.hp = 1;
      e.x = 2;
      e.y = 1;
      Object.assign(s.battle.units[0], { x: 1, y: 1, acted: false });
      assert.ok(act(s, 0, 2, 1));
    }
    openCamp(s);
    assert.ok(lineageStoryAction(s, 0, "honor"));
    assert.equal(s.party[0].lineagePerk, perk);
    assert.equal(lineageStoryAction(s, 0, "honor"), false);
    assert.equal(save(s).party[0].lineagePerk, perk);
  });
test("selling a companion discovery hurts resolve but reconciliation repairs it once", () => {
  const s = fresh();
  openCamp(s);
  lineageStoryAction(s, 0, "begin");
  leaveCamp(s);
  arrive(s, 13);
  lineageStoryAction(s, 0, "investigate");
  openCamp(s);
  const before = s.party[0].resolve;
  lineageStoryAction(s, 0, "sell");
  assert.equal(s.party[0].resolve, before - 25);
  assert.ok(lineageStoryAction(s, 0, "reconcile"));
  assert.equal(s.party[0].lineagePerk, "kin");
  assert.equal(lineageStoryAction(s, 0, "reconcile"), false);
});
test("companion departure is an explicit permanent story consequence", () => {
  const s = fresh();
  openCamp(s);
  lineageStoryAction(s, 0, "begin");
  leaveCamp(s);
  arrive(s, 13);
  lineageStoryAction(s, 0, "investigate");
  openCamp(s);
  assert.ok(lineageStoryAction(s, 0, "leave"));
  assert.ok(s.party[0].departed);
  assert.equal(lineageStoryAction(s, 0, "honor"), false);
});
test("sanctuary lore restores one frontier slot with herbs once per company day", () => {
  const s = fresh();
  s.party[0].lineagePerk = "grove";
  s.party[1].role = "Wizard";
  s.party[1].spellSpent = { 1: 2, 2: 0 };
  s.inventory.herbs = 2;
  openCamp(s);
  assert.ok(recoverFrontierSlot(s, 1));
  assert.equal(s.inventory.herbs, 1);
  assert.equal(s.party[1].spellSpent[1], 1);
  assert.equal(recoverFrontierSlot(s, 1), false);
});
test("scouted dungeon side room supports persistent lock feedback and rune puzzle", () => {
  const s = fresh();
  arrive(s, 2);
  assignProfession(s, 0, "Thief");
  enterDungeon(s);
  Object.assign(s.event, { x: 3, y: 3 });
  assert.ok(realmDungeonAction(s, "scout-room"));
  for (const dial of [1, 3, 2]) {
    while (dungeonPuzzle(s).dial !== dial) realmDungeonAction(s, "dial");
    assert.ok(realmDungeonAction(s, "pick"));
  }
  assert.ok(dungeonPuzzle(s).unlocked);
  realmDungeonAction(s, "rune", 2);
  assert.equal(dungeonPuzzle(s).rune, 0);
  for (const rune of [0, 1, 2]) assert.ok(realmDungeonAction(s, "rune", rune));
  const gold = s.gold;
  assert.ok(realmDungeonAction(s, "side-cache"));
  assert.equal(s.gold, gold + 35);
  assert.equal(realmDungeonAction(s, "side-cache"), false);
  assert.ok(dungeonPuzzle(save(s)).cache);
});
test("casters can spend a persistent slot opening an alternate dungeon route", () => {
  const s = fresh();
  s.party[0].role = "Wizard";
  arrive(s, 4);
  enterDungeon(s);
  Object.assign(s.event, { x: 3, y: 3 });
  assert.ok(realmDungeonAction(s, "magic-door"));
  assert.equal(spellSlots(s.party[0])[1], 1);
  assert.ok(realmDungeonAction(s, "side-cache"));
  assert.equal(spellSlots(save(s).party[0])[1], 1);
});
for (const [kind, duty, id] of [
  ["wheel", "quartermaster", 0],
  ["crossing", "scout", 2],
  ["overload", "quartermaster", 0],
  ["raid", "rearguard", 1],
])
  test(`${kind} wagon incident rewards its assigned travel specialist`, () => {
    const s = fresh();
    s.wagon.owned = true;
    assignTravelJob(s, duty, id);
    assert.ok(beginWagonEvent(s, kind));
    const r = save(s);
    assert.equal(r.event.kind, "wagon-travel");
    assert.ok(wagonChoice(r, "duty"));
    assert.equal(r.wagon.condition, 100);
    assert.equal(r.food, 24);
    assert.equal(wagonChoice(r, "duty"), false);
    assert.equal(beginWagonEvent(r, kind), false);
  });
test("wagon incident risk loses actual supplies and unowned wagons have no incidents", () => {
  const s = fresh();
  assert.equal(beginWagonEvent(s, "wheel"), false);
  s.wagon.owned = true;
  s.cargo.grain = 5;
  beginWagonEvent(s, "wheel");
  assert.equal(wagonChoice(s, "duty"), false);
  assert.ok(wagonChoice(s, "risk"));
  assert.equal(s.wagon.condition, 85);
  assert.equal(s.food, 21);
  assert.equal(s.cargo.grain, 2);
});
test("long wagon travel triggers an incident outside settlements and pauses travel", () => {
  const s = fresh();
  s.wagon.owned = true;
  s.location = -1;
  s.position = { x: 350, y: 420 };
  s.destination = { x: 900, y: 420 };
  checkWagonTravel(s, 601);
  assert.equal(s.event.kind, "wagon-travel");
  assert.equal(s.destination, null);
});
test("night raid choice enters actual battle and can be reloaded safely", () => {
  const s = fresh();
  s.wagon.owned = true;
  beginWagonEvent(s, "raid");
  assert.ok(wagonChoice(s, "fight"));
  assert.equal(s.battle.patrolId, "wagon-night-raiders");
  assert.ok(save(s).battle);
});
test("counterspells cancel a telegraphed enemy cast and spend persistent slots", () => {
  const s = fight();
  const e = s.battle.enemies[0];
  e.kind = "mage";
  e.casting = { x: 2, y: 2 };
  e.mana = 1;
  assert.ok(castSpell(s, 0, "counterspell", 5, 2));
  assert.equal(e.casting, null);
  assert.equal(e.mana, 1);
  assert.equal(spellSlots(s.party[0])[1], 2);
  assert.equal(save(s).battle.enemies[0].silenced, 1);
});
test("silence ground prevents company casting and interrupts enemy channels", () => {
  const s = fight("Cleric");
  assert.ok(castSpell(s, 0, "silence-field", 5, 2));
  const e = s.battle.enemies[0];
  e.kind = "mage";
  e.mana = 2;
  e.casting = { x: 2, y: 2 };
  endTurn(s);
  assert.equal(e.casting, null);
  assert.equal(e.mana, 2);
  s.party[1].role = "Wizard";
  Object.assign(s.battle.units[1], { x: 5, y: 1, acted: false });
  assert.match(spellLock(s, 1, "aether", 6, 2), /Silence/);
});
test("darkness blocks ranged sight while leaving adjacent melee visible", () => {
  const s = fight();
  assert.ok(castSpell(s, 0, "darkness-field", 5, 2));
  assert.equal(hasLineOfSight(s, { x: 2, y: 2 }, { x: 5, y: 2 }), false);
  assert.equal(hasLineOfSight(s, { x: 4, y: 2 }, { x: 5, y: 2 }), true);
  assert.equal(save(s).battle.realmMagic.surfaces[0].kind, "darkness");
});
test("hazardous magic burns enemies on the affected ground and expires", () => {
  const s = fight();
  assert.ok(castSpell(s, 0, "ember-field", 5, 2));
  const before = s.battle.enemies[0].hp;
  endTurn(s);
  assert.equal(s.battle.enemies[0].hp, before - 3);
  assert.equal(s.battle.realmMagic.surfaces[0].turns, 2);
  endTurn(s);
  endTurn(s);
  assert.equal(s.battle.realmMagic.surfaces.length, 0);
});
test("concentration grants repeated wards and interruption ends the maintained effect", () => {
  const s = fight("Cleric");
  assert.ok(castSpell(s, 0, "concentration-aegis", 2, 2));
  assert.equal(s.battle.units[0].arcaneWard, 4);
  assert.equal(save(s).battle.realmMagic.concentration[0].id, 0);
  assert.ok(interruptConcentration(s, 0));
  assert.equal(s.battle.realmMagic.concentration.length, 0);
  assert.equal(interruptConcentration(s, 0), false);
});
test("journal retains leads and bounded history and tracks known locations", () => {
  const s = fresh();
  arrive(s, 14);
  fantasyHoldAction(s, "goblin", "scout");
  const lead = realmJournal(s).find((v) => v.id === "hold-goblin");
  assert.equal(lead.site, 14);
  assert.ok(trackRealmLead(s, lead.id));
  assert.equal(s.realm.tracked, lead.id);
  assert.ok(s.realm.journal.length);
  assert.equal(save(s).realm.tracked, lead.id);
  assert.equal(trackRealmLead(s, "invented"), false);
});

test("aether shards are finite dungeon loot and restore persistent frontier slots", () => {
  const s = fresh();
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.party[0].spellSpent = { 1: 2, 2: 1 };
  arrive(s, 2);
  enterDungeon(s);
  Object.assign(s.event, { x: 3, y: 3 });
  realmDungeonAction(s, "magic-door");
  realmDungeonAction(s, "side-cache");
  assert.equal(s.realm.shards, 1);
  assert.equal(realmDungeonAction(s, "side-cache"), false);
  s.event = null;
  openCamp(s);
  assert.ok(recoverShardMagic(s, 0));
  assert.equal(s.realm.shards, 0);
  assert.equal(s.party[0].spellSpent[2], 0);
  assert.equal(recoverShardMagic(s, 0), false);
  assert.equal(save(s).party[0].spellSpent[2], 0);
});
test("reload keeps active stronghold patrols after older defeated waves", () => {
  const s = fresh();
  arrive(s, 14);
  s.discovered.push(14);
  realmHold(s, "goblin").lastSpawn = 1;
  s.day = 4;
  refreshFantasyStrongholds(s);
  s.patrols.find((p) => p.realmHold === "goblin").cleared = true;
  s.day = 7;
  refreshFantasyStrongholds(s);
  const id = s.patrols.find((p) => p.realmHold === "goblin" && !p.cleared).id;
  assert.ok(save(s).patrols.some((p) => p.id === id && !p.cleared));
});
test("defeated border patrols stay defeated across reloads and new charters reinforce them", () => {
  const s = fresh();
  s.gold = 300;
  s.food = 50;
  supportTerritory(s, "freefolk");
  s.patrols.find((p) => p.id === "border-0").cleared = true;
  const loaded = save(s);
  assert.ok(loaded.patrols.find((p) => p.id === "border-0").cleared);
  loaded.day = 4;
  assert.ok(supportTerritory(loaded, "guild"));
  assert.equal(loaded.patrols.find((p) => p.id === "border-0").cleared, false);
});
test("taking combat damage interrupts a maintained magical circle", () => {
  const s = fight("Cleric");
  castSpell(s, 0, "concentration-aegis", 2, 2);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  const e = s.battle.enemies[0];
  Object.assign(e, { hp: 50, x: 3, y: 2, damage: 10, kind: "raider" });
  endTurn(s);
  assert.equal(s.battle.realmMagic.concentration.length, 0);
  assert.ok(s.log.some((v) => v.includes("concentration breaks")));
});
test("stronghold routines postpone raids until their daylight or night window", () => {
  const s = fresh();
  s.discovered.push(2);
  s.day = 4;
  s.timeOfDay = 8;
  realmHold(s, "undead").lastSpawn = 1;
  refreshFantasyStrongholds(s);
  assert.equal(s.patrols.filter((p) => p.realmHold === "undead").length, 0);
  s.timeOfDay = 20;
  refreshFantasyStrongholds(s);
  assert.equal(s.patrols.filter((p) => p.realmHold === "undead").length, 1);
});

test("local faction charters unlock distinct recruits and preserve one-time hiring", () => {
  const s = fresh();
  s.gold = 300;
  assert.equal(
    recruitmentOffers(s).some((v) => v.id.includes("faction")),
    false,
  );
  supportTerritory(s, "freefolk");
  const offer = recruitmentOffers(s).find((v) => v.id === "0-faction-freefolk");
  assert.equal(offer.profession, "Thief");
  assert.equal(offer.race, "elf");
  assert.ok(recruit(s, offer.id));
  const r = save(s);
  assert.equal(
    recruitmentOffers(r).some((v) => v.id === offer.id),
    false,
  );
  assert.equal(r.party[4].profession, "Thief");
});
