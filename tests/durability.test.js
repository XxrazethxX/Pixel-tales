import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  grantEquipment,
  equipEquipment,
  gearItem,
  gearPerk,
  attackPower,
  armorPower,
  startBattle,
  act,
  endTurn,
  retreatBattle,
  wearBattleEquipment,
  repairQuote,
  repairEquipment,
  equipmentSalePrice,
  sellEquipment,
  restore,
  openCamp,
  assignCampJob,
} from "../src/game.js";
const equipped = () => {
  const s = fresh();
  for (const [template, p] of [
    ["greatsword-2", 0],
    ["shield-2", 1],
    ["helmet-1", 0],
    ["armor-1", 0],
  ]) {
    const id = grantEquipment(s, template);
    assert.ok(id, template);
    assert.equal(equipEquipment(s, id, p), true, template);
  }
  return s;
};
const battle = (s) => {
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  assert.equal(startBattle(s), true);
};
const damaged = (condition = 20) => {
  const s = fresh(),
    id = grantEquipment(s, "greatsword-2");
  equipEquipment(s, id, 0);
  s.gear[0].durability = condition;
  return { s, id };
};
test("battle victory wears participating equipped gear once, spare gear and new loot retain full condition", () => {
  const s = equipped(),
    spare = grantEquipment(s, "sword-1");
  battle(s);
  s.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { hp: 1, x: 2, y: 1 });
  act(s, 0, 2, 1);
  assert.equal(s.battle, null);
  assert.equal(gearItem(s, 1).durability, 85);
  assert.equal(gearItem(s, 2).durability, 90);
  assert.equal(gearItem(s, 3).durability, 90);
  assert.equal(gearItem(s, spare).durability, 100);
  assert.equal(s.gear.at(-1).durability, 100);
  assert.equal(wearBattleEquipment(s), false);
});
test("retreat costs crowns and morale, wears gear once, and preserves accepted work", () => {
  const s = equipped();
  battle(s);
  assert.equal(retreatBattle(s), true);
  assert.equal(s.gold, 105);
  assert.equal(s.morale, 65);
  assert.equal(s.contract.target, 1);
  assert.equal(gearItem(s, 1).durability, 90);
  assert.equal(retreatBattle(s), false);
  assert.equal(s.gold, 105);
});
test("defeat wears gear more heavily and only companions who entered the battle participate", () => {
  const s = equipped();
  s.party[1].hp = 0;
  battle(s);
  s.battle.enemies.forEach((e) => {
    e.damage = 1000;
    e.x = 2;
    e.y = 1;
  });
  s.party.forEach((p) => (p.hp = 0));
  s.party[0].hp = 1;
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(gearItem(s, 1).durability, 80);
  assert.equal(gearItem(s, 2).durability, 100);
});
test("worn and broken equipment affects actual attack, armor, and perks without losing the item", () => {
  const { s, id } = damaged(100);
  assert.equal(attackPower(s, s.party[0]), 12);
  assert.equal(gearPerk(s, s.party[0], "sweep"), true);
  s.gear[0].durability = 25;
  assert.equal(attackPower(s, s.party[0]), 9);
  assert.equal(gearPerk(s, s.party[0], "sweep"), true);
  s.gear[0].durability = 0;
  assert.equal(attackPower(s, s.party[0]), 7);
  assert.equal(gearPerk(s, s.party[0], "sweep"), false);
  assert.equal(s.party[0].equipment.weapon, id);
  const shield = grantEquipment(s, "shield-2");
  equipEquipment(s, shield, 1);
  s.gear.at(-1).durability = 25;
  assert.equal(armorPower(s, s.party[1]), 1);
  s.gear.at(-1).durability = 0;
  assert.equal(armorPower(s, s.party[1]), 0);
});
test("wear is clamped at zero and cannot repeat for the same combat", () => {
  const { s, id } = damaged(5);
  battle(s);
  assert.equal(wearBattleEquipment(s), true);
  assert.equal(gearItem(s, id).durability, 0);
  s.gear[0].durability = 100;
  assert.equal(wearBattleEquipment(s), false);
  assert.equal(gearItem(s, id).durability, 100);
});
test("village repairs charge the quoted price, restore bonuses and perks, and cannot farm repairs", () => {
  const { s, id } = damaged(0),
    quote = repairQuote(s, id),
    gold = s.gold;
  assert.equal(quote.locked, null);
  assert.equal(quote.gold, 42);
  assert.equal(repairEquipment(s, id), true);
  assert.equal(s.gold, gold - 42);
  assert.equal(gearItem(s, id).durability, 100);
  assert.equal(gearPerk(s, s.party[0], "sweep"), true);
  assert.equal(repairEquipment(s, id), false);
  assert.equal(s.gold, gold - 42);
});
test("repairs reject missing items, insufficient payment, wilderness, encounters, and combat atomically", () => {
  for (const mode of ["gold", "wild", "event", "battle"]) {
    const { s, id } = damaged();
    if (mode === "gold") s.gold = 0;
    if (mode === "wild") s.location = -1;
    if (mode === "event") s.event = {};
    if (mode === "battle") battle(s);
    const before = JSON.stringify({
      gear: s.gear,
      gold: s.gold,
      ore: s.inventory.ore,
    });
    assert.equal(repairEquipment(s, id), false);
    assert.equal(
      JSON.stringify({ gear: s.gear, gold: s.gold, ore: s.inventory.ore }),
      before,
    );
  }
  assert.equal(repairEquipment(fresh(), 123), false);
});
test("camp repairs require the forge and a conscious assigned Smith, consume quoted materials and time, and add practice", () => {
  const { s, id } = damaged(0);
  s.location = -1;
  openCamp(s);
  assert.equal(repairEquipment(s, id), false);
  s.campUpgrades.forge = 1;
  assert.equal(repairEquipment(s, id), false);
  assert.equal(assignCampJob(s, "smith", 0), true);
  s.inventory.ore = 10;
  s.inventory.wood = 10;
  const quote = repairQuote(s, id),
    hour = s.timeOfDay,
    gold = s.gold;
  assert.equal(quote.ore, 4);
  assert.equal(quote.wood, 1);
  assert.equal(repairEquipment(s, id), true);
  assert.equal(s.inventory.ore, 6);
  assert.equal(s.inventory.wood, 9);
  assert.equal(s.timeOfDay, hour + 2);
  assert.equal(s.gold, gold);
  assert.equal(s.party[0].professionXP, 1);
  s.gear[0].durability = 50;
  s.party[0].hp = 0;
  assert.equal(repairEquipment(s, id), false);
});
test("higher Smith ranks reduce repair ore; missing materials never partially charge a repair", () => {
  const { s, id } = damaged(0);
  s.location = -1;
  openCamp(s);
  s.campUpgrades.forge = 1;
  assignCampJob(s, "smith", 0);
  s.party[0].professionXP = 15;
  assert.equal(repairQuote(s, id).ore, 1);
  s.inventory.ore = 10;
  s.inventory.wood = 0;
  assert.equal(repairEquipment(s, id), false);
  assert.equal(s.inventory.ore, 10);
  assert.equal(s.party[0].professionXP, 15);
});
test("sale prices reflect actual condition and repair/resale never creates an arbitrage profit", () => {
  const { s, id } = damaged(0);
  assert.equal(equipmentSalePrice(gearItem(s, id)), 10);
  s.party[0].equipment.weapon = null;
  const gold = s.gold;
  assert.equal(sellEquipment(s, id), true);
  assert.equal(s.gold, gold + 10);
  const full = damaged(100);
  assert.equal(equipmentSalePrice(gearItem(full.s, full.id)), 42);
  for (const condition of [0, 10, 25, 50, 75, 99]) {
    full.s.gear[0].durability = condition;
    const damagedPrice = equipmentSalePrice(gearItem(full.s, full.id));
    const repairCost = repairQuote(full.s, full.id).gold;
    assert.ok(42 - damagedPrice <= repairCost);
  }
});
test("legacy equipment gains full condition and restore preserves or sanitizes saved damage without losing assignments", () => {
  const { s, id } = damaged(13);
  assert.equal(gearItem(restore(s), id).durability, 13);
  delete s.gear[0].durability;
  assert.equal(gearItem(restore(s), id).durability, 100);
  for (const [raw, expected] of [
    [-1, 0],
    [999, 100],
    [4.8, 4],
    ["bad", 100],
  ]) {
    s.gear[0].durability = raw;
    const loaded = restore(s);
    assert.equal(gearItem(loaded, id).durability, expected);
    assert.equal(loaded.party[0].equipment.weapon, id);
  }
});
