import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  beginCampaign,
  campaignTasks,
  campaignAction,
  chooseGrain,
  updateCampaign,
  clearStronghold,
  refreshStrongholds,
  enterFarm,
  farmAction,
  enterDungeon,
  dungeonAction,
  travelerAction,
  companionStory,
  advancePersonalQuest,
  advancePatrols,
  bondValue,
  grantEquipment,
  equipEquipment as equip,
  braceSpear,
  shieldLaneBlocked,
  weaponPositionBonus,
  startBattle,
  endTurn,
  act,
  attackPower,
  armorPower,
  createCompany,
  spellSlots,
  spellLock,
  castSpell,
  recoverMagic,
  fieldHealing,
  spellBook,
  recruitmentOffers,
  recruit,
  buyEquipment,
  supplyOffer,
  retreatBattle,
  openCamp,
  leaveCamp,
  customizeAvatar,
} from "../src/game.js";
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
const arrive = (s, id) => {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
};
function fight(s = fresh()) {
  arrive(s, 1);
  s.contract = { target: 1, reward: 65 };
  assert.ok(startBattle(s));
  return s;
}
function magical() {
  const base = fresh();
  const s = createCompany({
    name: "Beaconbound",
    banner: "ashen",
    origin: "wanderers",
    founders: base.party.map((p, i) => ({
      name: p.name,
      role: i === 0 ? "Wizard" : i === 1 ? "Cleric" : p.role,
      profession: p.profession,
      trait: "tireless",
      race: ["elf", "dwarf", "human", "orc"][i],
    })),
  });
  s.inventory.herbs = 20;
  s.inventory.ore = 10;
  return s;
}
function chapter(branch) {
  const s = fresh();
  assert.ok(beginCampaign(s));
  arrive(s, 13);
  enterFarm(s);
  farmAction(s, "clue");
  farmAction(s, "leave");
  arrive(s, 0);
  assert.ok(campaignAction(s, "escort"));
  arrive(s, 3);
  updateCampaign(s);
  assert.ok(travelerAction(s, "merrit"));
  clearStronghold(s);
  assert.equal(s.campaign.phase, "grain");
  arrive(s, 12);
  assert.ok(campaignAction(s, "grain"));
  assert.ok(chooseGrain(s, branch));
  arrive(s, 0);
  assert.ok(campaignAction(s, "report"));
  return s;
}
test("chapter starts only at Greyhaven, supports existing side contracts, and raises shortage prices", () => {
  const s = fresh(),
    price = supplyOffer(s, "food").price;
  arrive(s, 3);
  assert.equal(beginCampaign(s), false);
  arrive(s, 0);
  s.contract = { target: 1, reward: 65 };
  assert.ok(beginCampaign(s));
  assert.equal(s.contract.reward, 65);
  assert.equal(beginCampaign(s), false);
  assert.ok(supplyOffer(s, "food").price > price);
  assert.equal(campaignTasks(s).length, 3);
});
test("three connected jobs unlock a persisted grain decision and one-time completion reward", () => {
  const s = chapter("league");
  assert.equal(s.campaign.phase, "completed");
  assert.ok(campaignTasks(s).every((t) => t.done));
  assert.ok(supplyOffer(s, "food").price < 15);
  const gold = s.gold;
  assert.equal(campaignAction(s, "report"), false);
  assert.equal(save(s).campaign.branch, "league");
  assert.equal(s.gold, gold);
  assert.ok(s.gear.some((g) => g.template === "roadwarden-spear"));
});
test("all grain branches have different persistent regional consequences", () => {
  const guild = chapter("league"),
    folk = chapter("villagers"),
    seize = chapter("company");
  assert.ok(guild.reputation.guild > folk.reputation.guild);
  assert.ok(folk.reputation.freefolk > guild.reputation.freefolk);
  assert.ok(folk.travelers.farmRebuilt);
  assert.equal(seize.crime.wanted, 3);
  assert.ok(seize.food > guild.food);
  assert.ok(
    supplyOffer(seize, "food").price > supplyOffer(guild, "food").price,
  );
});
test("raider waves are bounded, replenish on later days, and clearing the stronghold permanently stops them", () => {
  const s = fresh(),
    wave = s.patrols.find((p) => p.id === "briar-raiders");
  s.day = 3;
  refreshStrongholds(s);
  assert.equal(wave.cleared, false);
  assert.equal(s.strongholds.briar.waves, 1);
  s.day = 8;
  refreshStrongholds(s);
  assert.equal(s.strongholds.briar.waves, 1);
  wave.cleared = true;
  refreshStrongholds(s);
  assert.equal(s.strongholds.briar.waves, 2);
  clearStronghold(s);
  s.day = 20;
  refreshStrongholds(s);
  assert.ok(wave.cleared);
  assert.ok(s.patrols.find((p) => p.id === "road-bandits").cleared);
  const loaded = save(s);
  assert.ok(loaded.strongholds.briar.cleared);
  assert.equal(loaded.strongholds.briar.waves, 2);
});
test("Briarhide dungeon victory defeats its named captain, clears roads, and returns to the interior", () => {
  const s = fresh();
  arrive(s, 12);
  enterDungeon(s);
  s.event.x = 6;
  s.event.y = 5;
  dungeonAction(s, "move", 7, 5);
  assert.equal(s.battle.enemies[0].name, "Captain Venn");
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { x: 2, y: 1, hp: 1, armor: 0 });
  assert.ok(act(s, 0, 2, 1));
  assert.ok(s.strongholds.briar.cleared);
  assert.equal(s.event.kind, "dungeon");
  assert.ok(save(s).strongholds.briar.cleared);
});
test("escorts require arrival, pay once, persist, and retreat permits retry", () => {
  const s = fresh();
  beginCampaign(s);
  campaignAction(s, "escort");
  assert.equal(save(s).travelers.merrit, "escorting");
  fight(s);
  retreatBattle(s);
  assert.equal(s.travelers.merrit, "waiting");
  arrive(s, 0);
  assert.ok(campaignAction(s, "escort"));
  arrive(s, 3);
  updateCampaign(s);
  const gold = s.gold;
  assert.ok(travelerAction(s, "merrit"));
  assert.equal(s.gold, gold + 50);
  assert.equal(travelerAction(s, "merrit"), false);
});
test("rescued travelers return, rebuilding visibly improves the economy, and harvests have a saved cooldown", () => {
  const s = fresh();
  arrive(s, 13);
  enterFarm(s);
  assert.ok(travelerAction(s, "rescue"));
  assert.equal(s.inventory.medicine, 0);
  assert.equal(travelerAction(s, "rescue"), false);
  farmAction(s, "leave");
  arrive(s, 0);
  assert.ok(travelerAction(s, "meet"));
  const price = supplyOffer(s, "food").price;
  s.inventory.wood = 6;
  arrive(s, 13);
  assert.ok(travelerAction(s, "rebuild"));
  assert.ok(travelerAction(s, "harvest"));
  assert.equal(travelerAction(save(s), "harvest"), false);
  arrive(s, 0);
  assert.ok(supplyOffer(s, "food").price < price);
  s.day += 3;
  arrive(s, 13);
  assert.ok(travelerAction(s, "harvest"));
});
test("personal stories require real exploration, award abilities once, and retain bonds after saving", () => {
  const s = fresh();
  s.gold = 100;
  s.inventory.ore = 6;
  openCamp(s);
  companionStory(s, 0, "support");
  leaveCamp(s);
  arrive(s, 4);
  assert.equal(advancePersonalQuest(s, 0, "investigate"), false);
  s.siteProgress["cart-4"] = true;
  assert.ok(advancePersonalQuest(s, 0, "investigate"));
  openCamp(s);
  const before = bondValue(s, 0, 1);
  assert.ok(advancePersonalQuest(s, 0, "share"));
  assert.equal(s.party[0].personalPerk, "linebreaker");
  assert.equal(bondValue(s, 0, 1), before + 5);
  assert.equal(advancePersonalQuest(s, 0, "share"), false);
  assert.equal(save(s).party[0].personalPerk, "linebreaker");
});
test("refusal can be reconciled and a sold discovery creates a rivalry that can be repaired once", () => {
  const s = fresh();
  s.inventory.ore = 6;
  openCamp(s);
  companionStory(s, 0, "refuse");
  assert.ok(advancePersonalQuest(s, 0, "reconcile"));
  leaveCamp(s);
  arrive(s, 4);
  s.siteProgress["cart-4"] = true;
  advancePersonalQuest(s, 0, "investigate");
  openCamp(s);
  const gold = s.gold;
  assert.ok(advancePersonalQuest(s, 0, "claim"));
  assert.equal(s.gold, gold + 35);
  assert.equal(s.party[0].personalQuest.outcome, "claimed");
  assert.ok(advancePersonalQuest(s, 0, "reconcile"));
  assert.equal(advancePersonalQuest(s, 0, "reconcile"), false);
  assert.equal(save(s).party[0].personalQuest.outcome, "reconciled");
});
test("equipped spear reactions and shields control approaches, while bows reward staying still", () => {
  const s = fight(),
    spear = grantEquipment(s, "pike-2"),
    shield = grantEquipment(s, "shield-1"),
    bow = grantEquipment(s, "bow-1");
  s.battle = null;
  equip(s, spear, 3);
  equip(s, shield, 1);
  equip(s, bow, 2);
  startBattle(s);
  assert.ok(braceSpear(s, 3));
  s.battle.units[1].guard = true;
  const u = s.battle.units[1];
  assert.ok(
    shieldLaneBlocked(s, { x: u.x + 1, y: u.y }, { x: u.x + 2, y: u.y }),
  );
  assert.equal(weaponPositionBonus(s, s.party[2]), 2);
  s.battle.units[2].moved = true;
  assert.equal(weaponPositionBonus(s, s.party[2]), 0);
  s.gear.find((g) => g.id === spear).durability = 0;
  s.battle.units[3].acted = false;
  assert.equal(braceSpear(s, 3), false);
});
test("spear brace fires once when a rushing enemy enters reach and stops its approach", () => {
  const s = fresh(),
    id = grantEquipment(s, "pike-2");
  equip(s, id, 3);
  fight(s);
  const u = s.battle.units[3];
  u.x = 1;
  u.y = 4;
  const e = s.battle.enemies[0];
  Object.assign(e, { kind: "wolf", x: 4, y: 4, hp: 100, max: 100, damage: 1 });
  s.battle.enemies.slice(1).forEach((e) => (e.stun = 5));
  s.battle.units.slice(0, 3).forEach((u) => {
    u.x = 0;
    u.y = 0;
  });
  assert.ok(braceSpear(s, 3));
  endTurn(s);
  assert.ok(e.hp < 100);
  assert.equal(e.x, 3);
  assert.equal(e.y, 4);
  assert.match(s.log.join("\n"), /spear intercepts/);
});
test("fantasy founders have persistent races, caster stats and role-limited slots", () => {
  const s = magical();
  assert.deepEqual(
    s.party.map((p) => p.race),
    ["elf", "dwarf", "human", "orc"],
  );
  assert.equal(s.party[0].damage, 4);
  assert.equal(armorPower(s, s.party[1]), 1);
  assert.equal(spellSlots(s.party[0])[1], 2);
  assert.equal(spellSlots(s.party[0])[2], 0);
  s.party[0].level = 3;
  assert.equal(spellSlots(s.party[0])[2], 1);
  assert.equal(save(s).party[0].race, "elf");
  customizeAvatar(s, 0, { sex: "male" });
  assert.equal(s.party[0].race, "elf");
});
test("casting spends persistent slots, never replenishes at battle start, and validates range and action before costs", () => {
  const s = fight(magical()),
    e = s.battle.enemies[0];
  e.x = 3;
  e.y = 1;
  const hp = e.hp;
  assert.ok(castSpell(s, 0, "aether", 3, 1));
  assert.equal(e.hp, hp - 7);
  assert.equal(spellSlots(s.party[0])[1], 1);
  assert.equal(castSpell(s, 0, "aether", 3, 1), false);
  assert.equal(spellSlots(save(s).party[0])[1], 1);
  s.battle = null;
  startBattle(s);
  assert.equal(spellSlots(s.party[0])[1], 1);
  const herbs = s.inventory.herbs;
  assert.equal(castSpell(s, 0, "cinder", 3, 1), false);
  assert.equal(s.inventory.herbs, herbs);
});
test("higher spells consume reagents, respect elf range, and affect multiple visible targets", () => {
  const s = magical();
  s.party[0].level = 3;
  fight(s);
  const u = s.battle.units[0];
  u.x = 1;
  u.y = 1;
  Object.assign(s.battle.enemies[0], { x: 5, y: 1, hp: 100, max: 100 });
  Object.assign(s.battle.enemies[1], { x: 5, y: 2, hp: 100, max: 100 });
  const ore = s.inventory.ore;
  assert.equal(spellLock(s, 0, "cinder", 5, 1), "");
  assert.ok(castSpell(s, 0, "cinder", 5, 1));
  assert.equal(s.inventory.ore, ore - 1);
  assert.equal(spellSlots(s.party[0])[2], 0);
  assert.ok(s.battle.enemies[0].hp < 100 && s.battle.enemies[1].hp < 100);
});
test("cleric healing and wards consume slots without reviving dead or unconscious companions", () => {
  const s = fight(magical());
  s.party[2].hp = 5;
  const herbs = s.inventory.herbs;
  s.battle.units[1].x = 1;
  s.battle.units[1].y = 2;
  assert.ok(castSpell(s, 1, "mend", 1, 3));
  assert.equal(s.inventory.herbs, herbs - 1);
  assert.equal(s.party[2].hp, 14);
  s.battle.units[1].acted = false;
  s.party[2].hp = 0;
  assert.equal(castSpell(s, 1, "mend", 1, 3), false);
  s.battle.units[0].x = 1;
  s.battle.units[0].y = 1;
  assert.ok(castSpell(s, 0, "veil", 1, 2));
  assert.equal(s.battle.units[1].arcaneWard, 4);
});
test("magic recovery is paid, timed, and limited to camp or Emberfall; field healing uses the same slots", () => {
  const s = magical();
  s.party[0].spellSpent = { 1: 2, 2: 0 };
  assert.equal(recoverMagic(s), false);
  openCamp(s);
  const food = s.food,
    herbs = s.inventory.herbs,
    time = s.timeOfDay;
  assert.ok(recoverMagic(s));
  assert.equal(s.food, food - 2);
  assert.equal(s.inventory.herbs, herbs - 2);
  assert.equal(s.timeOfDay, time + 6);
  leaveCamp(s);
  s.party[0].spellSpent = { 1: 1, 2: 0 };
  arrive(s, 6);
  const gold = s.gold;
  assert.ok(recoverMagic(s));
  assert.equal(s.gold, gold - 15);
  s.party[2].hp = 10;
  assert.ok(fieldHealing(s, 1, 2));
  assert.equal(spellSlots(s.party[1])[1], 1);
});
test("magical recruitment and focus gear are available in the flourishing city, not frontier villages", () => {
  const s = magical();
  s.gold = 500;
  s.renown = 5;
  assert.ok(!recruitmentOffers(s).some((p) => p.role === "Wizard"));
  assert.equal(buyEquipment(s, "beacon-staff"), false);
  arrive(s, 6);
  assert.ok(recruitmentOffers(s).some((p) => p.role === "Wizard"));
  assert.ok(buyEquipment(s, "beacon-staff"));
  assert.ok(recruit(s, "ember-wizard"));
  assert.equal(s.party[4].role, "Wizard");
  assert.equal(s.party[4].damage, 4);
  assert.equal(s.party[4].race, "elf");
  assert.ok(!recruitmentOffers(save(s)).some((p) => p.id === "ember-wizard"));
});
test("old saves migrate safely and malformed campaign, quest, race and slot data is sanitized", () => {
  const s = fresh();
  s.version = 12;
  delete s.campaign;
  delete s.strongholds;
  delete s.travelers;
  s.party[0].race = "dragon";
  s.party[0].spellSpent = { 1: -9, 2: 999 };
  s.party[0].personalQuest = { stage: 999, outcome: "evil" };
  const loaded = save(s);
  assert.equal(loaded.version, 16);
  assert.equal(loaded.campaign.phase, "unstarted");
  assert.equal(loaded.party[0].race, "human");
  assert.equal(loaded.party[0].spellSpent[1], 0);
  assert.equal(loaded.party[0].spellSpent[2], 9);
  assert.equal(loaded.party[0].personalQuest.stage, 3);
  assert.equal(loaded.party[0].personalQuest.outcome, null);
});

test("stronghold raiders intercept nearby companies and clearing the camp prevents future attacks", () => {
  const s = fresh();
  s.day = 3;
  s.position = { x: 470, y: 490 };
  s.location = 12;
  advancePatrols(s, 0.1);
  assert.equal(s.event.patrolId, "briar-raiders");
  assert.equal(s.event.kind, "negotiation");
  s.event = null;
  clearStronghold(s);
  advancePatrols(s, 0.1);
  assert.equal(s.battle, null);
});

test("wards absorb one hit and earned magical abilities and focus gear survive saves", () => {
  const s = magical();
  s.party[0].personalPerk = "arcanefocus";
  const staff = grantEquipment(s, "beacon-staff");
  equip(s, staff, 0);
  fight(s);
  const e = s.battle.enemies[0];
  e.x = 3;
  e.y = 1;
  e.hp = e.max = 100;
  assert.ok(castSpell(s, 0, "aether", 3, 1));
  assert.equal(e.hp, 89);
  assert.equal(save(s).party[0].personalPerk, "arcanefocus");
  const ward = fight(magical());
  ward.battle.enemies.slice(1).forEach((e) => (e.stun = 5));
  Object.assign(ward.battle.enemies[0], { x: 2, y: 2, damage: 8 });
  assert.ok(castSpell(ward, 0, "veil", 1, 2));
  const hp = ward.party[1].hp;
  endTurn(ward);
  assert.equal(ward.party[1].hp, hp - 3);
  assert.equal(ward.battle.units[1].arcaneWard, 0);
});
