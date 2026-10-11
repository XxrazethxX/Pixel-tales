import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  restore,
  assignProfession,
  companyScout,
  scoutLock,
  scoutSurroundings,
  beginTrailEncounter,
  scoutStronghold,
  infiltrationLock,
  infiltrateStronghold,
  enterDungeon,
  dungeonAction,
  startBattle,
  endTurn,
  act,
  hitEnemy,
  battlePath,
  combatPreview,
  useSkill,
  disarmBattleSnare,
  enemyArmor,
  spellSchools,
  spellsFor,
  learnSpellSchool,
  castSpell,
  spellLock,
  spellSlots,
  grantEquipment,
  repairQuote,
  equipmentRecipe,
  buyCompanyWagon,
  companyCargoCapacity,
  upgradeWagon,
  repairWagon,
  openCamp,
  leaveCamp,
  assignTravelJob,
  travelWorker,
  campCost,
  retreatBattle,
  caravanEscortOffers,
  acceptCaravanEscort,
  claimCaravanEscort,
  tradeCaravanCargo,
  beginCaravanRaid,
  updateRoadConflicts,
  interveneCaravan,
  respondCaravanRaid,
  lootCaravanWreck,
  advancePatrols,
  advanceMovement,
  moveTo,
  spendHours,
  advanceStealth,
} from "../src/game.js";
const copy = (s) => restore(JSON.parse(JSON.stringify(s)));
const arrive = (s, id) => {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
};
const near = (s, id) => {
  const p = s.patrols.find((p) => p.id === id);
  s.position = { x: p.x, y: p.y };
  s.location = -1;
  return p;
};
function fight(s = fresh(), family = "mage") {
  const p = s.patrols.find((p) => p.enemyFamily === family);
  near(s, p.id);
  assert.ok(startBattle(s, p.id));
  s.battle.layoutId = "legacy";
  return s;
}
function caster(role = "Wizard") {
  const s = fresh();
  s.party[0].role = role;
  s.party[0].level = 3;
  s.party[0].points = 3;
  s.inventory.herbs = 10;
  s.inventory.ore = 10;
  return s;
}
function stronghold() {
  const s = fresh();
  arrive(s, 12);
  s.patrols.forEach((p) => (p.cleared = true));
  assert.ok(scoutStronghold(s));
  s.stealth = { active: true, concealment: 100 };
  return s;
}
function raid() {
  const s = fresh(),
    p = s.patrols.find((p) => p.id === "wheat-caravan"),
    b = s.patrols.find((p) => p.id === "knives");
  b.x = p.x + 30;
  b.y = p.y;
  assert.ok(beginCaravanRaid(s, p.id, b.id));
  s.position = { x: p.x + 50, y: p.y };
  s.location = -1;
  return { s, p, b };
}
function victory(s) {
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0].hp = 1;
  s.battle.enemies[0].x = 2;
  s.battle.enemies[0].y = 1;
  s.battle.units[0].x = 1;
  s.battle.units[0].y = 1;
  assert.ok(act(s, 0, 2, 1));
}

test("intentional scouting requires a conscious Archer or Thief, while natural encounters remain available", () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 400, y: 350 };
  s.party[2].role = "Swordswoman";
  assert.equal(companyScout(s), null);
  assert.match(scoutLock(s), /Archer.*Thief/);
  assert.equal(scoutSurroundings(s), false);
  assert.ok(beginTrailEncounter(s));
  s.event = null;
  s.trailLedger = {};
  assignProfession(s, 0, "Thief");
  assert.equal(scoutLock(s), null);
  assert.ok(scoutSurroundings(s));
  assert.equal(s.party[0].professionXP, 1);
  s.event = null;
  s.trailLedger = {};
  s.party[0].hp = 0;
  assert.equal(companyScout(s), null);
});
test("stronghold scouting reveals once, preserves intel and gates infiltration behind actual concealment", () => {
  const s = stronghold();
  assert.equal(s.strongholdIntel.scouted, true);
  assert.equal(scoutStronghold(s), false);
  s.stealth.concealment = 59;
  assert.match(infiltrationLock(s, "supplies"), /sixty/);
  assert.equal(infiltrateStronghold(s, "supplies"), false);
  s.stealth.concealment = 100;
  const food = s.food;
  assert.ok(infiltrateStronghold(s, "supplies"));
  assert.equal(s.food, food + 6);
  assert.equal(s.stealth.concealment, 75);
  assert.equal(infiltrateStronghold(s, "supplies"), false);
  assert.ok(copy(s).strongholdIntel.supplies);
});
test("rescuing a captive adds a real Thief and reuses a dead roster slot without corrupting saves", () => {
  const s = stronghold();
  assert.ok(infiltrateStronghold(s, "prisoner"));
  assert.equal(s.party[4].name, "Edda");
  assert.equal(s.party[4].profession, "Thief");
  assert.equal(s.party[4].race, "orc");
  assert.equal(copy(s).party.length, 5);
  const full = stronghold();
  full.party.push(
    { ...full.party[0], id: 4 },
    { ...full.party[1], id: 5, dead: true, hp: 0 },
  );
  assert.ok(infiltrateStronghold(full, "prisoner"));
  assert.equal(full.party.length, 6);
  assert.equal(full.party[5].name, "Edda");
  assert.equal(copy(full).party.length, 6);
});
test("covert entrance changes deployment and sabotage weakens the actual stronghold battle", () => {
  const s = stronghold();
  s.inventory.ore = 2;
  assert.ok(infiltrateStronghold(s, "sabotaged"));
  s.stealth.concealment = 100;
  assert.ok(infiltrateStronghold(s, "entry"));
  s.stealth.active = false;
  s.stealth.concealment = 0;
  assert.ok(enterDungeon(s));
  assert.equal(s.event.x, 6);
  assert.equal(s.event.y, 4);
  assert.ok(dungeonAction(s, "move", 7, 4));
  assert.ok(dungeonAction(s, "move", 7, 5));
  assert.equal(s.battle.enemies[0].max, 28);
  assert.equal(s.battle.enemies[0].damage, 5);
  assert.ok(copy(s).battle.stronghold === "briar");
});
test("company wagon is purchased or earned explicitly, never free for a new company", () => {
  const s = fresh();
  assert.equal(s.wagon.owned, false);
  assert.equal(buyCompanyWagon(s), false);
  assert.equal(buyCompanyWagon(s, true), false);
  s.gold = 250;
  assert.ok(buyCompanyWagon(s));
  assert.equal(s.gold, 0);
  assert.equal(companyCargoCapacity(s), 30);
  assert.equal(buyCompanyWagon(s), false);
  const earned = fresh();
  earned.campaign.phase = "completed";
  assert.ok(buyCompanyWagon(earned, true));
  assert.equal(earned.gold, 120);
});
test("wagon racks expand real cargo capacity and migrate larger loads without truncation", () => {
  const s = fresh();
  s.gold = 500;
  buyCompanyWagon(s);
  s.inventory.wood = 20;
  s.inventory.ore = 10;
  openCamp(s);
  assert.ok(upgradeWagon(s, "storage"));
  assert.ok(upgradeWagon(s, "storage"));
  assert.equal(upgradeWagon(s, "storage"), false);
  assert.equal(companyCargoCapacity(s), 50);
  s.cargo.grain = 35;
  s.cargo.iron = 15;
  assert.deepEqual(copy(s).cargo, s.cargo);
});
test("travel duties enforce eligibility, retain one duty per person and provide real ration savings", () => {
  const s = fresh();
  assert.equal(assignTravelJob(s, "quartermaster", 0), false);
  assert.equal(assignTravelJob(s, "scout", 0), false);
  assert.ok(assignTravelJob(s, "scout", 2));
  assert.equal(travelWorker(s, "scout").id, 2);
  s.gold = 250;
  buyCompanyWagon(s);
  const food = campCost(s);
  assert.ok(assignTravelJob(s, "quartermaster", 0));
  assert.equal(campCost(s), food - 1);
  assignTravelJob(s, "rearguard", 0);
  assert.equal(travelWorker(s, "quartermaster"), null);
  assignProfession(s, 1, "Thief");
  assignTravelJob(s, "scout", 1);
  assert.equal(companyScout(s).id, 1);
  assert.equal(copy(s).travelJobs.scout, 1);
});
test("portable workbench enables staffed camp repairs and improves fine crafting costs", () => {
  const s = fresh();
  s.gold = 500;
  buyCompanyWagon(s);
  s.inventory.wood = 10;
  s.inventory.ore = 10;
  openCamp(s);
  s.campJobs.smith = 0;
  const gear = grantEquipment(s, "sword-1");
  s.gear[0].durability = 50;
  assert.ok(repairQuote(s, gear).locked);
  const before = equipmentRecipe(s, "sword-2").ore;
  assert.ok(upgradeWagon(s, "workbench"));
  assert.equal(repairQuote(s, gear).locked, null);
  assert.equal(equipmentRecipe(s, "sword-2").ore, before - 2);
});
test("rails and a rear guard reduce actual wagon losses, and damaged wagons can be repaired", () => {
  const run = (protectedWagon) => {
    const s = fresh();
    s.gold = 500;
    buyCompanyWagon(s);
    s.food = 30;
    s.cargo.grain = 10;
    if (protectedWagon) {
      s.wagon.rails = 1;
      assignTravelJob(s, "rearguard", 1);
    }
    fight(s);
    assert.equal(s.battle.units[1].guard, protectedWagon);
    retreatBattle(s);
    return s;
  };
  const plain = run(false),
    protectedWagon = run(true);
  assert.ok(protectedWagon.food > plain.food);
  assert.ok(protectedWagon.wagon.condition > plain.wagon.condition);
  assert.ok(protectedWagon.cargo.grain > plain.cargo.grain);
  openCamp(plain);
  plain.inventory.ore = 2;
  assert.ok(repairWagon(plain));
  assert.equal(plain.wagon.condition, 100);
});
test("caravan contracts only appear at their issuer and protect entrusted stock from trading or attack", () => {
  const s = fresh();
  assert.ok(caravanEscortOffers(s).some((r) => r.patrolId === "wheat-caravan"));
  assert.ok(acceptCaravanEscort(s, "wheat-caravan"));
  assert.deepEqual(caravanEscortOffers(s), []);
  const p = s.patrols.find((p) => p.id === "wheat-caravan");
  s.position = { x: p.x, y: p.y };
  s.location = -1;
  assert.equal(tradeCaravanCargo(s, p.id, "grain"), false);
  assert.equal(startBattle(s, p.id), false);
  assert.equal(acceptCaravanEscort(s, "armor-caravan"), false);
});
test("escort wagon follows free movement, pays once on arrival and respects the repeat-job cooldown", () => {
  const s = fresh();
  acceptCaravanEscort(s, "wheat-caravan");
  s.position = { x: places[3].x - 80, y: places[3].y };
  s.location = -1;
  moveTo(s, places[3].x, places[3].y);
  advanceMovement(s, 2);
  assert.equal(s.caravanEscort.status, "arrived");
  assert.equal(copy(s).caravanEscort.status, "arrived");
  const gold = s.gold;
  assert.ok(claimCaravanEscort(s));
  assert.equal(s.gold, gold + 80);
  assert.equal(claimCaravanEscort(s), false);
  arrive(s, 0);
  assert.ok(
    !caravanEscortOffers(s).some((r) => r.patrolId === "wheat-caravan"),
  );
  s.day = 4;
  assert.ok(caravanEscortOffers(s).some((r) => r.patrolId === "wheat-caravan"));
});
test("bandits independently pursue and attack a merchant even while the player is hidden elsewhere", () => {
  const s = fresh(),
    p = s.patrols.find((p) => p.id === "wheat-caravan"),
    b = s.patrols.find((p) => p.id === "knives");
  b.x = p.x + 31;
  b.y = p.y;
  s.position = { x: 120, y: 800 };
  s.location = -1;
  s.stealth = { active: true, concealment: 100 };
  advancePatrols(s, 0.1);
  assert.equal(p.raid.attackerId, b.id);
  assert.equal(s.event, null);
});
test("intervention defends real cargo without committing a caravan crime and clears the attack", () => {
  const { s, p } = raid();
  assert.ok(interveneCaravan(s, p.id));
  assert.equal(copy(s).event.kind, "caravan-raid");
  assert.ok(respondCaravanRaid(s, "help"));
  assert.equal(s.battle.caravanDefense, p.id);
  assert.equal(s.crime.wanted, 0);
  victory(s);
  assert.equal(p.raid, null);
  assert.equal(p.cargo.grain, 12);
  assert.equal(s.crime.wanted, 0);
});
test("demanding payment is explicit and retreat fails an active caravan escort", () => {
  const s = fresh();
  acceptCaravanEscort(s, "wheat-caravan");
  const p = s.patrols.find((p) => p.id === "wheat-caravan"),
    b = s.patrols.find((p) => p.id === "knives");
  b.x = p.x + 30;
  b.y = p.y;
  beginCaravanRaid(s, p.id, b.id);
  interveneCaravan(s, p.id);
  const gold = s.gold;
  assert.ok(respondCaravanRaid(s, "payment"));
  assert.equal(s.gold, gold + 15);
  retreatBattle(s);
  assert.equal(s.caravanEscort, null);
  assert.ok(s.reputation.guild < 0);
});
test("ignored attacks leave persistent wrecks with selective remaining cargo and no duplicated gear", () => {
  const { s, p } = raid();
  spendHours(s, 3);
  updateRoadConflicts(s);
  assert.ok(p.cleared);
  assert.equal(p.wreck.cargo.grain, 6);
  const saved = copy(s);
  saved.position = { x: p.x, y: p.y };
  assert.ok(lootCaravanWreck(saved, p.id));
  assert.equal(saved.cargo.grain, 6);
  assert.equal(lootCaravanWreck(saved, p.id), false);
  assert.ok(saved.crime.stolen);
  const armory = fresh(),
    a = armory.patrols.find((p) => p.id === "armor-caravan"),
    b = armory.patrols.find((p) => p.id === "knives");
  b.x = a.x + 30;
  b.y = a.y;
  beginCaravanRaid(armory, a.id, b.id);
  spendHours(armory, 3);
  updateRoadConflicts(armory);
  assert.equal(
    copy(armory).patrols.find((p) => p.id === a.id).wreck.gear.length,
    1,
  );
});
test("skeleton formation adds armor to real damage and disappears when the neighbor falls", () => {
  const s = fight(fresh(), "skeleton"),
    a = s.battle.enemies[0],
    b = s.battle.enemies[1];
  assert.equal(enemyArmor(s, a), 3);
  const hp = a.hp;
  assert.equal(hitEnemy(s, a, 7), 4);
  assert.equal(a.hp, hp - 4);
  b.hp = 0;
  s.battle.enemies[2].hp = 0;
  assert.equal(enemyArmor(s, a), 1);
  assert.equal(hitEnemy(s, a, 7), 6);
});
test("goblins place real snares which stop movement, cost health and can be disarmed only by specialists", () => {
  const s = fight(fresh(), "goblin");
  endTurn(s);
  const trap = s.battle.traps[0];
  assert.ok(trap);
  const u = s.battle.units[0];
  Object.assign(u, { x: trap.x - 1, y: trap.y });
  const hp = s.party[0].hp;
  assert.match(combatPreview(s, 0, trap.x, trap.y).text, /snare/);
  assert.ok(act(s, 0, trap.x, trap.y));
  assert.equal(s.party[0].hp, hp - 4);
  assert.equal(u.snared, 2);
  u.moved = false;
  assert.equal(battlePath(s, u, trap.x - 1, trap.y), null);
  const another = { x: 1, y: 2, used: false };
  s.battle.traps.push(another);
  Object.assign(s.battle.units[2], { x: 1, y: 3, acted: false });
  assert.equal(disarmBattleSnare(s, 0, 1, 2), false);
  assert.ok(disarmBattleSnare(s, 2, 1, 2));
  assert.ok(another.used);
});
test("goblins steal supplies and escape, while killing a carrying goblin recovers those supplies", () => {
  const s = fight(fresh(), "goblin");
  const g = s.battle.enemies[1];
  s.battle.enemies[0].hp = 0;
  s.battle.enemies[2].hp = 0;
  g.x = 2;
  g.y = 1;
  s.battle.units = [s.battle.units[0]];
  const food = s.food;
  endTurn(s);
  assert.equal(g.stolenFood, 2);
  assert.equal(s.food, food - 2);
  g.x = 8;
  endTurn(s);
  assert.equal(s.food, food - 2);
  assert.equal(s.battle, null);
  const recovered = fight(fresh(), "goblin");
  recovered.battle.enemies[0].stolenFood = 2;
  recovered.food -= 2;
  victory(recovered);
  assert.equal(recovered.food, 24);
});
test("enemy mages spend visible slots while channeling; moving off the marked tile dodges the spell", () => {
  const s = fight(),
    mage = s.battle.enemies[0];
  s.battle.units = [s.battle.units[0]];
  Object.assign(s.battle.units[0], { x: 4, y: 2 });
  Object.assign(mage, { x: 7, y: 2 });
  s.battle.enemies[1].hp = 0;
  s.battle.enemies[2].hp = 0;
  const hp = s.party[0].hp;
  endTurn(s);
  assert.equal(mage.mana, 1);
  assert.deepEqual(mage.casting, { x: 4, y: 2 });
  assert.equal(copy(s).battle.enemies[0].mana, 1);
  s.battle.units[0].y = 3;
  endTurn(s);
  assert.equal(s.party[0].hp, hp);
  assert.equal(mage.casting, null);
});
test("stun interrupts a channeled enemy spell without refunding its slot", () => {
  const s = fight(),
    mage = s.battle.enemies[0];
  s.battle.units = [s.battle.units[0]];
  Object.assign(s.battle.units[0], { x: 4, y: 2 });
  Object.assign(mage, { x: 7, y: 2 });
  s.battle.enemies[1].hp = 0;
  s.battle.enemies[2].hp = 0;
  endTurn(s);
  mage.stun = 1;
  endTurn(s);
  assert.equal(mage.casting, null);
  assert.equal(mage.mana, 1);
});
test("each caster chooses one permanent school with class, level and point gates", () => {
  const s = caster();
  assert.equal(learnSpellSchool(s, 0, "guardian"), false);
  s.party[0].level = 1;
  assert.equal(learnSpellSchool(s, 0, "barrier"), false);
  s.party[0].level = 3;
  assert.ok(learnSpellSchool(s, 0, "barrier"));
  assert.equal(s.party[0].points, 2);
  assert.equal(learnSpellSchool(s, 0, "elemental"), false);
  assert.ok(spellsFor(s.party[0]).some((v) => v.id === "bastion"));
  assert.ok(!spellsFor(s.party[0]).some((v) => v.id === "phantom"));
  assert.equal(copy(s).party[0].spellSchool, "barrier");
});
test("barrier and guardian schools strengthen actual wards and unlock their group spells", () => {
  for (const [role, school, spell, power] of [
    ["Wizard", "barrier", "bastion", 8],
    ["Cleric", "guardian", "sanctuary", 10],
  ]) {
    const s = caster(role);
    learnSpellSchool(s, 0, school);
    fight(s);
    const u = s.battle.units[0];
    assert.ok(castSpell(s, 0, spell, u.x, u.y));
    assert.equal(u.arcaneWard, power);
    assert.equal(spellSlots(s.party[0])[2], 0);
  }
});
test("elemental spells gain power and their burning effect deals real damage without consuming more slots", () => {
  const s = caster();
  learnSpellSchool(s, 0, "elemental");
  fight(s);
  const e = s.battle.enemies[0];
  Object.assign(e, { x: 3, y: 1, hp: 100, max: 100 });
  Object.assign(s.battle.units[0], { x: 1, y: 1 });
  assert.ok(castSpell(s, 0, "firestorm", 3, 1));
  assert.equal(e.burn, 2);
  assert.equal(s.inventory.ore, 9);
  const hp = e.hp;
  endTurn(s);
  assert.equal(e.hp, hp - 3);
  assert.equal(spellSlots(s.party[0])[2], 0);
});
test("illusions target enemies, consume slots and prevent real disengagement attacks", () => {
  const s = caster();
  learnSpellSchool(s, 0, "illusion");
  fight(s);
  const e = s.battle.enemies[1];
  Object.assign(e, { x: 2, y: 1, hp: 100, max: 100 });
  const u = s.battle.units[0];
  Object.assign(u, { x: 1, y: 1 });
  assert.ok(castSpell(s, 0, "phantom", 2, 1));
  assert.equal(e.distracted, 2);
  u.acted = false;
  const hp = s.party[0].hp;
  assert.ok(act(s, 0, 1, 0));
  assert.equal(s.party[0].hp, hp);
  assert.ok(!e.reacted);
});
test("restoration heals groups and cures full-health injuries while zeal interrupts pending casting", () => {
  const heal = caster("Cleric");
  learnSpellSchool(heal, 0, "restoration");
  fight(heal);
  const u = heal.battle.units[0];
  heal.party[0].hp = 1;
  heal.party[0].injury = true;
  heal.party[0].max = 10;
  assert.ok(castSpell(heal, 0, "renewal", u.x, u.y));
  assert.equal(heal.party[0].hp, 10);
  assert.equal(heal.party[0].injury, false);
  const zeal = caster("Cleric");
  learnSpellSchool(zeal, 0, "zeal");
  fight(zeal);
  const e = zeal.battle.enemies[0];
  Object.assign(e, { x: 3, y: 1, casting: { x: 1, y: 1 }, mana: 1, hp: 100 });
  assert.ok(castSpell(zeal, 0, "rebuke", 3, 1));
  assert.equal(e.casting, null);
  assert.equal(e.mana, 1);
});
