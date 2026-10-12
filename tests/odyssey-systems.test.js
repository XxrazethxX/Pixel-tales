import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  regionAt,
  terrainAt,
  checkRegionalTravel,
  regionalChoice,
  regionalChoiceLock,
  regionalService,
  regionalServiceLock,
  forage,
  chooseJourneyPartner,
  upkeepForecast,
  continuationInfo,
  continuationLock,
  continueCompanion,
  continuationTechnique,
  continuationTechniqueLock,
  refreshSurrender,
  answerSurrender,
  surrenderLock,
  prisonerAction,
  prisonerActionLock,
  settlePrisoners,
  startBattle,
  endTurn,
  act,
  spendHours,
  grantEquipment,
  equipEquipment,
  equippedItem,
  gearItem,
  equipmentComparison,
  recoverRelic,
  relicLock,
  attackRange,
  attackPower,
  armorPower,
  terrainCell,
  bondValue,
} from "../src/game.js";
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
function arrive(s, id) {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
  s.destination = null;
}
function battle(role = null) {
  const s = fresh();
  s.gold = 1000;
  s.food = 100;
  arrive(s, 1);
  s.contract = { name: "Test patrol", target: 1, tier: 1, reward: 40 };
  assert.equal(startBattle(s), true);
  s.battle.layoutId = "legacy";
  if (role) s.party[0].role = role;
  return s;
}
function journey(role = "Swordswoman") {
  const s = fresh();
  s.gold = 1000;
  s.food = 100;
  s.inventory.ore = 10;
  s.inventory.herbs = 10;
  s.party[0].role = role;
  s.party[0].personalQuest = { stage: 3, outcome: "shared" };
  s.bonds["0:1"] = 12;
  s.campOpen = true;
  return s;
}
function complete(s) {
  assert.equal(continueCompanion(s, 0, "begin"), true);
  let q = continuationInfo(s, 0);
  s.campOpen = false;
  arrive(s, q.meet);
  assert.equal(continueCompanion(s, 0, "meet"), true);
  arrive(s, q.site);
  assert.equal(continueCompanion(s, 0, "recover"), true);
  s.campOpen = true;
  assert.equal(continueCompanion(s, 0, "swear"), true);
  s.campOpen = false;
  return s;
}
function surrender() {
  const s = battle();
  s.battle.turn = 2;
  s.battle.enemies.forEach((e, i) => {
    e.hp = i === 0 ? 6 : 0;
  });
  assert.equal(refreshSurrender(s), true);
  return s;
}
function prisoner(kind = "raider") {
  const s = fresh();
  s.gold = 200;
  s.food = 50;
  s.odyssey.serial = 1;
  s.odyssey.prisoners = [
    { id: 1, name: "Bram the captive", kind, day: 1, trust: 0, unfed: 0 },
  ];
  return s;
}
function equipped(s, template, p = 0) {
  const id = grantEquipment(s, template);
  assert.equal(equipEquipment(s, id, p), true);
  return id;
}

test("five geographic regions and mountain terrain are distinct", () => {
  assert.equal(regionAt({ x: 120, y: 510 }).id, "farmland");
  assert.equal(regionAt({ x: 590, y: 355 }).id, "coast");
  assert.equal(regionAt({ x: 1250, y: 110 }).id, "mountains");
  assert.equal(regionAt({ x: 965, y: 220 }).id, "haunted");
  assert.equal(regionAt({ x: 1110, y: 600 }).id, "city");
  assert.equal(terrainAt({ x: 1250, y: 110 }), "highlands");
});
test("long travel presents a bounded local hazard and pauses movement", () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 1220, y: 200 };
  s.destination = { x: 1250, y: 110 };
  assert.equal(checkRegionalTravel(s, 650), true);
  assert.equal(s.event.kind, "region");
  assert.equal(s.destination, null);
  assert.equal(checkRegionalTravel(s, 700), false);
  assert.equal(regionalChoice(s, "detour"), true);
  assert.equal(checkRegionalTravel(s, 700), false);
});
test("regional hazard reload reconstructs trusted descriptions and preserves decisions", () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 1100, y: 220 };
  checkRegionalTravel(s, 650);
  s.event.title = "forged";
  const r = save(s);
  assert.equal(r.event.title, "Whispering Wilds");
  assert.equal(regionalChoice(r, "specialist"), true);
  assert.equal(r.knowledge, 1);
  assert.equal(r.event, null);
});
test("specialists must be conscious; unavailable hazard choices do not spend resources", () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 1200, y: 80 };
  checkRegionalTravel(s, 650);
  s.party[1].hp = 0;
  const t = s.timeOfDay;
  assert.match(regionalChoiceLock(s, "specialist"), /Miner/);
  assert.equal(regionalChoice(s, "specialist"), false);
  assert.equal(s.timeOfDay, t);
  assert.equal(regionalChoice(s, "supplies"), false);
  assert.equal(s.food, 24);
  s.inventory.wood = 1;
  assert.equal(regionalChoice(s, "supplies"), true);
  assert.equal(s.food, 22);
  assert.equal(s.inventory.wood, 0);
});
test("regional detours pay elapsed time, fatigue and midnight wages", () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 1200, y: 80 };
  s.timeOfDay = 23;
  checkRegionalTravel(s, 650);
  regionalChoice(s, "detour");
  assert.equal(s.day, 2);
  assert.equal(s.gold, 112);
  assert.equal(s.timeOfDay, 2);
  assert.ok(s.party[0].fatigue >= 14);
});
test("regional forage awards local resources only on the first gathering at a site each day", () => {
  const s = fresh();
  s.gold = 500;
  s.food = 100;
  arrive(s, 9);
  forage(s);
  assert.equal(s.inventory.ore, 2);
  forage(s);
  assert.equal(s.inventory.ore, 2);
  arrive(s, 7);
  const herbs = s.inventory.herbs;
  forage(s);
  assert.ok(s.inventory.herbs >= herbs + 3);
});
test("village harvest and remedy services have daily and location gates", () => {
  const s = fresh();
  assert.equal(regionalService(s, "provisions"), true);
  assert.equal(s.food, 36);
  assert.equal(s.gold, 102);
  assert.equal(regionalService(s, "provisions"), false);
  arrive(s, 3);
  assert.equal(regionalService(s, "provisions"), false);
  assert.equal(regionalService(s, "remedies"), true);
  assert.equal(s.inventory.medicine, 2);
  assert.equal(s.inventory.herbs, 4);
  assert.equal(regionalService(save(s), "remedies"), false);
});
test("academy travel spends a persistent slot, crowns and two hours", () => {
  const s = fresh();
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.party[0].spellSpent = { 1: 0, 2: 0 };
  s.gold = 100;
  arrive(s, 6);
  assert.equal(regionalService(s, "transit", 0), true);
  assert.equal(s.location, 0);
  assert.equal(s.gold, 50);
  assert.equal(s.party[0].spellSpent[2], 1);
  assert.equal(s.timeOfDay, 10);
  assert.deepEqual(s.trail, [s.position]);
  assert.equal(save(s).party[0].spellSpent[2], 1);
});
test("academy travel cannot teleport escorts, wagon or prisoners", () => {
  const s = fresh();
  s.party[0].role = "Wizard";
  s.party[0].level = 3;
  s.gold = 100;
  arrive(s, 6);
  s.wagon.owned = true;
  assert.match(regionalServiceLock(s, "transit", 0), /wagons/);
  assert.equal(regionalService(s, "transit", 0), false);
  s.wagon.owned = false;
  s.odyssey.prisoners = prisoner().odyssey.prisoners;
  assert.equal(regionalService(s, "transit", 0), false);
  assert.equal(s.gold, 100);
});
test("continuations require a completed first story and a camp discussion", () => {
  const s = fresh();
  assert.equal(continueCompanion(s, 0, "begin"), false);
  s.campOpen = true;
  assert.match(continuationLock(s, 0, "begin"), /first personal journey/);
  s.party[0].personalQuest = { stage: 3, outcome: "shared" };
  assert.equal(continueCompanion(s, 0, "begin"), true);
  assert.equal(continueCompanion(s, 0, "begin"), false);
  assert.equal(continuationInfo(save(s), 0).stage, 1);
});
test("follow-up testimony, costly expedition and final oath remain separate stages", () => {
  const s = journey();
  continueCompanion(s, 0, "begin");
  s.campOpen = false;
  arrive(s, 5);
  assert.equal(continueCompanion(s, 0, "recover"), false);
  arrive(s, 0);
  assert.equal(continueCompanion(s, 0, "meet"), true);
  const r = save(s);
  arrive(r, 5);
  r.inventory.ore = 1;
  assert.equal(continueCompanion(r, 0, "recover"), false);
  r.inventory.ore = 2;
  assert.equal(continueCompanion(r, 0, "recover"), true);
  assert.equal(r.inventory.ore, 0);
  assert.equal(continueCompanion(r, 0, "swear"), false);
  r.campOpen = true;
  assert.equal(continueCompanion(r, 0, "swear"), true);
  assert.equal(continuationInfo(r, 0).stage, 4);
  assert.equal(continueCompanion(r, 0, "swear"), false);
});
test("oaths require trust and paid wages; restitution repairs a real rivalry", () => {
  const s = journey();
  continueCompanion(s, 0, "begin");
  s.odyssey.journeys[0].stage = 3;
  s.wageDebt = 8;
  assert.equal(continueCompanion(s, 0, "swear"), false);
  s.wageDebt = 0;
  s.bonds["0:1"] = -15;
  s.expedition.rivalries["0:1"] = true;
  assert.equal(continueCompanion(s, 0, "swear"), false);
  const gold = s.gold;
  assert.equal(continueCompanion(s, 0, "reconcile"), true);
  assert.equal(s.gold, gold - 25);
  assert.ok(bondValue(s, 0, 1) >= 10);
  assert.equal(save(s).odyssey.journeys[0].outcome, "reconcile");
  assert.equal(s.expedition.rivalries["0:1"], undefined);
});
test("peaceful departure returns equipment and actually vacates the roster", () => {
  const s = journey();
  const id = equipped(s, "sword-1");
  continueCompanion(s, 0, "begin");
  s.odyssey.journeys[0].stage = 3;
  assert.equal(continueCompanion(s, 0, "depart"), true);
  assert.equal(s.party[0].dead, true);
  assert.equal(s.party[0].departed, true);
  assert.ok(s.gear.some((g) => g.id === id));
  assert.deepEqual(s.party[0].equipment, {});
});
test("oathstrike is a real once-per-battle attack with a guard stance", () => {
  const s = complete(journey());
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 40 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  const u = s.battle.units[0],
    e = s.battle.enemies[0];
  e.x = u.x + 1;
  e.y = u.y;
  e.hp = e.max = 60;
  assert.equal(continuationTechnique(s, 0, e.id), true);
  assert.ok(e.hp < 60);
  assert.equal(u.guard, true);
  assert.equal(continuationTechnique(s, 0, e.id), false);
  const r = save(s);
  r.battle.units[0].acted = false;
  assert.match(continuationTechniqueLock(r, 0, e.id), /already used/);
});
for (const [role, verify] of [
  [
    "Shieldbearer",
    (s) => assert.ok(s.battle.units.every((u) => u.arcaneWard === 2)),
  ],
  ["Spearman", (s) => assert.equal(s.battle.enemies[0].root, 2)],
  ["Archer", (s) => assert.equal(s.battle.enemies[0].exposed, 2)],
  ["Wizard", (s) => assert.equal(s.party[0].spellSpent[1], 0)],
  ["Cleric", (s) => assert.equal(s.party[1].hp, s.party[1].max - 2)],
])
  test(`${role} follow-up grants its distinct personal technique`, () => {
    const s = complete(journey(role));
    arrive(s, 1);
    s.contract = { target: 1, tier: 1, reward: 40 };
    startBattle(s);
    s.battle.layoutId = "legacy";
    s.battle.enemies[0].x = 3;
    s.battle.enemies[0].y = 1;
    s.party[0].spellSpent = { 1: 1, 2: 0 };
    s.party[1].hp -= 6;
    assert.equal(continuationTechnique(s, 0), true);
    verify(s);
  });
test("personal slot recovery requires an actually spent level-one slot", () => {
  const s = complete(journey("Wizard"));
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 40 };
  startBattle(s);
  s.party[0].spellSpent = { 1: 0, 2: 1 };
  assert.equal(continuationTechnique(s, 0), false);
  assert.equal(s.party[0].spellSpent[2], 1);
});
test("wounded outnumbered enemies offer surrender after the opening round", () => {
  const s = battle();
  s.battle.enemies[0].hp = 6;
  assert.equal(refreshSurrender(s), false);
  s.battle.turn = 2;
  assert.equal(refreshSurrender(s), true);
  assert.equal(s.battle.enemies[0].surrenderOffer, true);
  assert.equal(save(s).battle.enemies[0].surrenderOffer, true);
});
test("wildlife, skeletons and objective defenders cannot be captured", () => {
  const s = surrender(),
    e = s.battle.enemies[0];
  for (const kind of ["wolf", "skeleton"]) {
    e.kind = kind;
    assert.equal(answerSurrender(s, e.id, "capture"), false);
  }
  e.kind = "raider";
  s.battle.mission = "wagon-watch";
  assert.equal(answerSurrender(s, e.id, "capture"), false);
  assert.equal(s.odyssey.prisoners.length, 0);
});
test("accepting surrender completes a battle and creates one persistent prisoner", () => {
  const s = surrender();
  assert.equal(answerSurrender(s, 0, "capture"), true);
  assert.equal(s.battle, null);
  assert.equal(s.odyssey.prisoners.length, 1);
  assert.equal(s.odyssey.prisoners[0].kind, "raider");
  assert.equal(answerSurrender(s, 0, "capture"), false);
  assert.equal(save(s).odyssey.prisoners.length, 1);
});
test("prisoner capacity and supervision gate captures without ending the battle", () => {
  const s = surrender();
  for (let i = 1; i <= 3; i++)
    s.odyssey.prisoners.push({
      id: i,
      kind: "raider",
      name: "Captive",
      day: 1,
      trust: 0,
      unfed: 0,
    });
  assert.match(surrenderLock(s, 0, "capture"), /three/);
  assert.equal(answerSurrender(s, 0, "capture"), false);
  s.odyssey.prisoners = [];
  s.party[1].hp = 0;
  assert.match(surrenderLock(s, 0, "capture"), /Shieldbearer/);
  assert.equal(answerSurrender(s, 0, "capture"), false);
});
test("safe-passage bargain and release grant their different consequences once", () => {
  const s = surrender(),
    gold = s.gold;
  assert.equal(answerSurrender(s, 0, "ransom"), true);
  assert.equal(s.gold, gold + 48);
  assert.equal(s.reputation.wardens, 0);
  assert.equal(s.odyssey.prisoners.length, 0);
  const r = surrender();
  answerSurrender(r, 0, "release");
  assert.equal(r.reputation.freefolk, 1);
  assert.equal(r.odyssey.prisoners.length, 0);
});
test("refused critically wounded enemies flee and lose stolen supplies", () => {
  const s = surrender(),
    e = s.battle.enemies[0];
  e.hp = 2;
  e.stolenFood = 3;
  e.x = 8;
  e.y = 1;
  answerSurrender(s, 0, "refuse");
  assert.equal(e.fleeing, true);
  assert.equal(e.surrenderOffer, false);
  const food = s.food;
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(e.escaped, true);
  assert.equal(s.food, food);
});
test("prisoners consume extra rations at dawn and gain bounded trust", () => {
  const s = prisoner();
  s.timeOfDay = 23;
  spendHours(s, 1);
  assert.equal(s.food, 45);
  assert.equal(s.odyssey.prisoners[0].trust, 1);
  s.event = null;
  spendHours(s, 24);
  assert.equal(s.odyssey.prisoners[0].trust, 2);
  assert.equal(save(s).odyssey.prisoners[0].trust, 2);
});
test("two hungry days or three unguarded days cause prisoner escape", () => {
  const s = prisoner();
  s.food = 0;
  settlePrisoners(s);
  assert.equal(s.odyssey.prisoners.length, 1);
  settlePrisoners(s);
  assert.equal(s.odyssey.prisoners.length, 0);
  const r = prisoner();
  r.party[1].hp = 0;
  r.day = 4;
  settlePrisoners(r);
  assert.equal(r.odyssey.prisoners.length, 0);
});
test("bounty delivery is village-only and cannot be repeated", () => {
  const s = prisoner();
  s.location = -1;
  assert.equal(prisonerAction(s, 1, "ransom"), false);
  arrive(s, 3);
  const gold = s.gold;
  assert.equal(prisonerAction(s, 1, "ransom"), true);
  assert.equal(s.gold, gold + 30);
  assert.equal(s.reputation.wardens, 2);
  assert.equal(prisonerAction(s, 1, "ransom"), false);
});
test("recruitment requires camp, food-earned trust, paid wages and a free roster slot", () => {
  const s = prisoner();
  assert.equal(prisonerAction(s, 1, "recruit"), false);
  s.campOpen = true;
  assert.match(prisonerActionLock(s, 1, "recruit"), /two days/);
  s.odyssey.prisoners[0].trust = 2;
  s.wageDebt = 1;
  assert.equal(prisonerAction(s, 1, "recruit"), false);
  s.wageDebt = 0;
  const gold = s.gold;
  assert.equal(prisonerAction(s, 1, "recruit"), true);
  assert.equal(s.gold, gold - 60);
  const p = s.party.at(-1);
  assert.equal(p.role, "Swordswoman");
  assert.equal(p.profession, "Thief");
  assert.deepEqual(p.traits, ["mercenary"]);
  assert.equal(p.resolve, 50);
  assert.equal(save(s).party.at(-1).profession, "Thief");
});
test("prisoner recruits replace a departed slot and clear previous owner progression", () => {
  const s = prisoner("mage");
  s.party[0].dead = true;
  s.party[0].hp = 0;
  s.odyssey.journeys[0] = { stage: 4, outcome: "swear", partner: 1 };
  s.realm.lineage[0] = { stage: 2 };
  s.expedition.careers[0] = "duelist";
  s.odyssey.prisoners[0].trust = 2;
  s.campOpen = true;
  assert.equal(prisonerAction(s, 1, "recruit"), true);
  assert.equal(s.party[0].role, "Wizard");
  assert.equal(s.party[0].dead, false);
  assert.equal(s.odyssey.journeys[0], undefined);
  assert.equal(s.realm.lineage[0], undefined);
  assert.equal(s.expedition.careers[0], undefined);
});
test("finite relic discoveries require scouting, materials and knowledge", () => {
  const s = fresh();
  arrive(s, 9);
  s.inventory.ore = 4;
  s.knowledge = 2;
  assert.equal(recoverRelic(s, "winter-pike"), true);
  assert.equal(s.inventory.ore, 0);
  assert.equal(s.knowledge, 0);
  assert.equal(s.gear.at(-1).template, "winter-pike");
  assert.equal(recoverRelic(save(s), "winter-pike"), false);
});
test("relic requirements do not spend resources when no scout is conscious", () => {
  const s = fresh();
  arrive(s, 7);
  s.party[2].hp = 0;
  s.inventory.herbs = 4;
  s.knowledge = 2;
  assert.match(relicLock(s, "grove-helmet"), /Archer or Thief/);
  assert.equal(recoverRelic(s, "grove-helmet"), false);
  assert.equal(s.knowledge, 2);
});
test("two-handed comparisons include the shield armor actually lost", () => {
  const s = fresh();
  equipped(s, "shield-1");
  const id = grantEquipment(s, "greatsword-1"),
    item = gearItem(s, id),
    before = armorPower(s, s.party[0]);
  const q = equipmentComparison(s, item, s.party[0]);
  assert.match(q.text, /Shield returns/);
  assert.equal(q.armor, -equippedItem(s, s.party[0], "shield").bonus);
  equipEquipment(s, id, 0);
  assert.equal(armorPower(s, s.party[0]) - before, q.armor);
});
test("comparisons expose gained and lost perks and broken-item effects", () => {
  const s = fresh();
  equipped(s, "spellbreaker");
  const id = grantEquipment(s, "sword-1");
  assert.match(
    equipmentComparison(s, gearItem(s, id), s.party[0]).text,
    /Lose:/,
  );
  s.gear.find((g) => g.id === id).durability = 0;
  assert.match(
    equipmentComparison(s, gearItem(s, id), s.party[0]).text,
    /Broken:/,
  );
});
test("winterglass pike roots on actual basic attacks and stops working when broken", () => {
  const s = battle();
  s.battle = null;
  const id = equipped(s, "winter-pike", 3);
  startBattle(s);
  s.battle.layoutId = "legacy";
  const u = s.battle.units.find((u) => u.id === 3),
    e = s.battle.enemies[0];
  e.x = u.x + 1;
  e.y = u.y;
  e.hp = e.max = 60;
  assert.equal(act(s, 3, e.x, e.y), true);
  assert.equal(e.root, 1);
  u.acted = false;
  e.root = 0;
  s.gear.find((g) => g.id === id).durability = 0;
  act(s, 3, e.x, e.y);
  assert.equal(e.root, 0);
});
test("horizon bow rewards stationary positioning with exactly two range", () => {
  const s = fresh();
  const id = equipped(s, "horizon-bow", 2);
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 40 };
  startBattle(s);
  const u = s.battle.units.find((u) => u.id === 2);
  assert.equal(attackRange(s.party[2], false, s), 6);
  u.moved = true;
  assert.equal(attackRange(s.party[2], false, s), 4);
  u.moved = false;
  s.gear.find((g) => g.id === id).durability = 0;
  assert.equal(attackRange(s.party[2], false, s), 4);
});
test("spellbreaker interrupts a prepared spell without refunding its spent slot", () => {
  const s = fresh();
  equipped(s, "spellbreaker");
  arrive(s, 1);
  s.contract = { target: 1, tier: 1, reward: 40 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  const u = s.battle.units[0],
    e = s.battle.enemies[0];
  Object.assign(e, {
    kind: "mage",
    x: u.x + 1,
    y: u.y,
    hp: 60,
    max: 60,
    mana: 1,
    casting: { x: 1, y: 1 },
  });
  act(s, 0, e.x, e.y);
  assert.equal(e.casting, null);
  assert.equal(e.silenced, 1);
  assert.equal(e.mana, 1);
});
test("grove helm gives an additional real reduction only while in cover", () => {
  const s = battle();
  s.battle = null;
  equipped(s, "grove-helmet");
  startBattle(s);
  s.battle.layoutId = "legacy";
  const u = s.battle.units[0];
  u.x = 3;
  u.y = 2;
  assert.ok(terrainCell(s, u.x, u.y).cover > 0);
  s.battle.units = s.battle.units.filter((u) => u.id === 0);
  s.battle.enemies = [
    {
      id: 0,
      kind: "archer",
      x: 7,
      y: 2,
      hp: 60,
      max: 60,
      damage: 12,
      armor: 0,
    },
  ];
  const hp = s.party[0].hp;
  endTurn(s);
  const actual = hp - s.party[0].hp;
  assert.equal(actual, 12 - 1 - 2 - terrainCell(s, 3, 2).cover);
});
test("save migration validates bounded new ledgers, prisoners, choices and techniques", () => {
  const s = fresh();
  s.version = 17;
  delete s.odyssey;
  const r = save(s);
  assert.equal(r.version, 21);
  assert.deepEqual(r.odyssey.prisoners, []);
  s.odyssey = {
    distance: Infinity,
    serial: -1,
    visited: { fake: true },
    services: { harvest: 9999 },
    journeys: { 0: { stage: 4, outcome: "fake" } },
    relics: { fake: true },
    prisoners: [
      {
        id: 1,
        kind: "raider",
        name: "x".repeat(100),
        day: 9999,
        trust: 999,
        unfed: 0,
      },
      { id: 1, kind: "mage" },
      { id: 2, kind: "dragon" },
    ],
  };
  const clean = save(s);
  assert.equal(clean.odyssey.distance, 0);
  assert.equal(clean.odyssey.prisoners.length, 1);
  assert.equal(clean.odyssey.prisoners[0].trust, 3);
  assert.equal(clean.odyssey.prisoners[0].name.length, 40);
  assert.equal(clean.odyssey.journeys[0], undefined);
  assert.equal(clean.odyssey.relics.fake, undefined);
});

test("a living quest partner can be chosen at camp without bypassing trust", () => {
  const s = journey();
  continueCompanion(s, 0, "begin");
  s.party[1].dead = true;
  s.party[1].hp = 0;
  assert.equal(chooseJourneyPartner(s, 0, 2), true);
  assert.equal(continuationInfo(s, 0).partner, 2);
  s.odyssey.journeys[0].stage = 3;
  assert.equal(continueCompanion(s, 0, "swear"), false);
  assert.equal(chooseJourneyPartner(s, 0, 0), false);
  assert.equal(chooseJourneyPartner(s, 0, 1), false);
  s.campOpen = false;
  assert.equal(chooseJourneyPartner(s, 0, 3), false);
});
test("departure outcomes remain archived across saves", () => {
  const s = journey();
  continueCompanion(s, 0, "begin");
  s.odyssey.journeys[0].stage = 3;
  continueCompanion(s, 0, "depart");
  assert.equal(save(s).odyssey.journeys[0].outcome, "depart");
});
test("the visible upkeep forecast includes each captive's extra ration", () => {
  const s = prisoner();
  assert.equal(upkeepForecast(s).food, 5);
  assert.equal(upkeepForecast(s).foodDays, 10);
});
