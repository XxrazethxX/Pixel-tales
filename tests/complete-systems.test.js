import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  startBattle,
  act,
  endTurn,
  guard,
  disengage,
  disengageCost,
  battlePath,
  terrainCell,
  attackRange,
  attackPower,
  armorPower,
  grantEquipment,
  equipEquipment,
  unequipEquipment,
  equippedItem,
  gearOwner,
  useSkill,
  equipmentRecipe,
  craftEquipment,
  buyEquipment,
  restore,
  tradeGoodsAtVillage,
  tradeQuote,
  tradePrice,
  marketState,
  cargoLoad,
  cargoCapacity,
  supplyOffer,
  buy,
  regionalSalePrice,
  tradeCaravanCargo,
  tradeCaravan,
  initialPatrols,
  forage,
  changeReputation,
  acceptStory,
  storyOffers,
  storyLock,
  regionalStories,
  interactStory,
  chooseStory,
  storyChoiceLock,
} from "../src/game.js";
const battle = () => {
  const s = fresh();
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  return s;
};
const equip = (s, id, p = 0) => {
  const item = grantEquipment(s, id);
  assert.ok(equipEquipment(s, item, p));
  return item;
};
const winFixture = (s) => {
  s.battle.enemies.forEach((e) => (e.hp = 0));
  s.battle.enemies[0] = { ...s.battle.enemies[0], hp: 1, x: 2, y: 1 };
  assert.ok(act(s, 0, 2, 1));
};
const at = (s, id) => {
  s.location = id;
};

test("cover mitigates real ranged attacks for both sides and mud consumes movement budget", () => {
  const s = battle(),
    b = s.battle;
  b.enemies[0].x = 3;
  b.enemies[0].y = 2;
  b.units[2].x = 1;
  b.units[2].y = 2;
  const hp = b.enemies[0].hp;
  assert.ok(act(s, 2, 3, 2));
  assert.equal(b.enemies[0].hp, hp - 5);
  b.units = [b.units[0]];
  b.units[0].x = 5;
  b.units[0].y = 4;
  b.enemies = [
    { id: 0, x: 7, y: 4, kind: "archer", damage: 4, hp: 16, max: 16 },
  ];
  endTurn(s);
  assert.equal(s.party[0].hp, 25);
  b.units[0].x = 4;
  b.units[0].y = 6;
  assert.equal(terrainCell(s, 4, 5).cost, 2);
  assert.equal(battlePath(s, b.units[0], 4, 5).length, 1);
  assert.equal(battlePath(s, b.units[0], 4, 4), null);
});

test("movement cannot jump through occupied tiles and disengagement damage applies once per reacting enemy", () => {
  const s = battle(),
    b = s.battle,
    u = b.units[0];
  u.x = 3;
  u.y = 1;
  b.enemies = [
    { id: 0, x: 4, y: 1, kind: "raider", damage: 5, hp: 16, max: 16 },
  ];
  assert.equal(battlePath(s, u, 5, 1), null);
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.party[0].hp, 23);
  assert.equal(b.enemies[0].reacted, true);
  u.moved = false;
  assert.ok(act(s, 0, 3, 1));
  u.moved = false;
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.party[0].hp, 23);
});

test("safe disengagement spends action and valor, permits movement, and blocks a subsequent attack", () => {
  const s = battle(),
    b = s.battle;
  b.units[0].x = 3;
  b.enemies[0].x = 4;
  b.enemies[0].y = 1;
  const hp = s.party[0].hp;
  assert.ok(disengage(s, 0));
  assert.equal(b.valor, 2);
  assert.ok(act(s, 0, 2, 1));
  assert.equal(s.party[0].hp, hp);
  assert.equal(act(s, 0, 4, 1), false);
  assert.equal(disengage(s, 0), false);
});

test("stunned enemies cannot counter disengagement and retreating bandit archers can be struck", () => {
  const s = battle(),
    b = s.battle;
  b.units = [b.units[0]];
  b.units[0].x = 3;
  b.units[0].y = 1;
  b.enemies = [
    { id: 0, x: 4, y: 1, kind: "raider", damage: 5, hp: 16, max: 16, stun: 1 },
  ];
  act(s, 0, 2, 1);
  assert.equal(s.party[0].hp, 28);
  b.units[0].x = 3;
  b.enemies[0] = {
    id: 0,
    x: 4,
    y: 1,
    kind: "archer",
    damage: 4,
    hp: 16,
    max: 16,
  };
  endTurn(s);
  assert.equal(b.enemies[0].hp, 9);
});

test("shields and helmets add armor, transfer unique ownership, and two-handed weapons return shields", () => {
  const s = fresh(),
    shield = equip(s, "shield-1"),
    helmet = equip(s, "helmet-1");
  assert.equal(armorPower(s, s.party[0]), 2);
  equip(s, "greatsword-1");
  assert.equal(s.party[0].equipment.shield, null);
  assert.equal(gearOwner(s, shield), null);
  assert.equal(equipEquipment(s, shield, 0), false);
  assert.ok(equipEquipment(s, shield, 1));
  assert.equal(equipEquipment(s, shield, 2), false);
  assert.ok(equipEquipment(s, helmet, 1));
  assert.equal(s.party[0].equipment.helmet, null);
  assert.ok(unequipEquipment(s, 1, "helmet"));
  assert.equal(gearOwner(s, helmet), null);
  assert.equal(attackPower(s, s.party[0]), 11);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(equippedItem(loaded, loaded.party[0], "weapon").twoHanded, true);
  loaded.party[0].equipment.shield = shield;
  const cleaned = restore(loaded);
  assert.equal(cleaned.party[0].equipment.shield, null);
});

test("sweep, reach and bleeding perks change real attacks and abilities", () => {
  const s = fresh();
  equip(s, "greatsword-2");
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.battle.units[0].x = 3;
  s.battle.enemies[0].x = 4;
  s.battle.enemies[0].y = 1;
  s.battle.enemies[1].x = 4;
  s.battle.enemies[1].y = 2;
  const hp = s.battle.enemies[1].hp;
  act(s, 0, 4, 1);
  assert.equal(s.battle.enemies[1].hp, hp - 5); // half of 12, minus brute armor
  const r = fresh();
  equip(r, "pike-2", 3);
  assert.equal(attackRange(r.party[3], false, r), 3);
  assert.equal(attackRange(r.party[3], true, r), 4);
  const p = fresh();
  equip(p, "barbed-spear-2", 3);
  p.location = 1;
  p.contract = { target: 1, reward: 65 };
  startBattle(p);
  p.battle.enemies[0].x = 3;
  p.battle.enemies[0].y = 4;
  assert.ok(act(p, 3, 3, 4));
  assert.equal(p.battle.enemies[0].bleed, 2);
  endTurn(p);
  assert.equal(p.battle.enemies[0].bleed, 1);
});

test("shield and helmet perks change bracing, valor and the first safe disengagement", () => {
  const s = fresh();
  equip(s, "shield-2");
  equip(s, "helm-2");
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.battle.valor = 1;
  guard(s, 0);
  assert.equal(s.battle.valor, 3);
  s.battle.units = [s.battle.units[0]];
  s.battle.enemies = [
    { id: 0, x: 2, y: 1, kind: "raider", hp: 16, max: 16, damage: 10 },
  ];
  endTurn(s);
  assert.equal(s.party[0].hp, 25);
  const r = fresh();
  equip(r, "hood-2");
  r.location = 1;
  r.contract = { target: 1, reward: 65 };
  startBattle(r);
  r.battle.valor = 0;
  assert.equal(disengageCost(r, 0), 0);
  assert.ok(disengage(r, 0));
  endTurn(r);
  assert.equal(disengageCost(r, 0), 1);
  const loaded = restore(JSON.parse(JSON.stringify(r)));
  assert.equal(disengageCost(loaded, 0), 1);
});

test("riposte counterattacks only when braced and struck by a melee enemy", () => {
  const s = fresh();
  equip(s, "duelist-sword-2");
  s.location = 1;
  s.contract = { target: 1, reward: 65 };
  startBattle(s);
  s.battle.units = [s.battle.units[0]];
  s.battle.enemies = [
    { id: 0, x: 2, y: 1, kind: "raider", hp: 16, max: 16, damage: 5 },
  ];
  guard(s, 0);
  endTurn(s);
  assert.equal(s.battle.enemies[0].hp, 14);
});

test("new fine items are researched craft recipes, and Warden standing unlocks shop access", () => {
  const s = fresh();
  s.gold = 500;
  assert.equal(buyEquipment(s, "pike-2"), false);
  changeReputation(s, "wardens", 10);
  assert.ok(buyEquipment(s, "pike-2"));
  s.research = ["steel", "armorer"];
  s.inventory.ore = 20;
  s.inventory.wood = 20;
  assert.ok(equipmentRecipe(s, "helmet-1") === null);
  assert.ok(craftEquipment(s, "hood-2"));
  assert.equal(s.gear.length, 2);
});

test("supplies and commodities have village prices and local resale never beats the discounted buy price", () => {
  const s = fresh();
  assert.equal(supplyOffer(s, "food").price, 15);
  at(s, 3);
  assert.equal(supplyOffer(s, "food").price, 18);
  at(s, 6);
  assert.equal(supplyOffer(s, "food").price, 24);
  assert.equal(supplyOffer(s, "ore").price, 7);
  s.research = ["barter"];
  s.reputation.guild = 10;
  for (const location of [0, 3, 6]) {
    at(s, location);
    for (const good of ["grain", "cloth", "salt", "iron"])
      assert.ok(tradePrice(s, good, "sell") < tradePrice(s, good));
  }
});

test("trade respects funds, finite stock, cargo capacity, quantity validation and village-only access", () => {
  const s = fresh();
  s.gold = 500;
  assert.ok(tradeGoodsAtVillage(s, "grain", 5));
  assert.equal(s.cargo.grain, 5);
  assert.equal(marketState(s).stock.grain, 7);
  assert.equal(tradeGoodsAtVillage(s, "grain", 8), false);
  assert.equal(tradeGoodsAtVillage(s, "grain", -1), false);
  assert.equal(tradeGoodsAtVillage(s, "grain", 1, "fake"), false);
  assert.equal(tradeGoodsAtVillage(s, "fake"), false);
  s.cargo.iron = 15;
  assert.equal(cargoLoad(s), 20);
  assert.equal(tradeGoodsAtVillage(s, "grain"), false);
  s.location = -1;
  assert.equal(tradeGoodsAtVillage(s, "grain", 1, "sell"), false);
});

test("selling a shortage fills demand with per-unit quotes, earns reputation once, and stocks refresh every three days", () => {
  const s = fresh();
  s.location = 6;
  s.cargo.grain = 10;
  const market = marketState(s);
  assert.equal(market.demand, 8);
  const quote = tradeQuote(s, "grain", 10, "sell");
  assert.equal(quote, 8 * 17 + 2 * 11);
  const gold = s.gold;
  assert.ok(tradeGoodsAtVillage(s, "grain", 10, "sell"));
  assert.equal(s.gold, gold + quote);
  assert.equal(market.demand, 0);
  assert.equal(s.reputation.guild, 2);
  s.cargo.grain = 1;
  tradeGoodsAtVillage(s, "grain", 1, "sell");
  assert.equal(s.reputation.guild, 2);
  s.day = 4;
  assert.equal(marketState(s).shortage, "cloth");
  assert.equal(marketState(s).stock.grain, 12);
});

test("buying cheap goods in one region and selling in another is profitable, but local flipping loses money", () => {
  const s = fresh();
  const gold = s.gold;
  tradeGoodsAtVillage(s, "grain", 5);
  tradeGoodsAtVillage(s, "grain", 5, "sell");
  assert.ok(s.gold < gold);
  const r = fresh();
  tradeGoodsAtVillage(r, "grain", 5);
  r.location = 6;
  tradeGoodsAtVillage(r, "grain", 5, "sell");
  assert.equal(r.gold, 120 - 30 + 85);
});

test("caravan cargo and rations deplete, raid rewards take actual remaining stock, and attacks cause lasting price consequences", () => {
  const s = fresh(),
    caravan = s.patrols.find((p) => p.kind === "merchant");
  s.position = { x: caravan.x, y: caravan.y };
  s.location = -1;
  s.gold = 500;
  assert.ok(tradeCaravanCargo(s, caravan.id, "grain", 2));
  assert.equal(caravan.cargo.grain, 2);
  assert.equal(s.cargo.grain, 2);
  for (let i = 0; i < 3; i++) assert.ok(tradeCaravan(s, caravan.id));
  assert.equal(tradeCaravan(s, caravan.id), false);
  assert.ok(startBattle(s, caravan.id));
  assert.equal(s.reputation.guild, -12);
  assert.equal(s.reputation.wardens, -6);
  const food = s.food;
  winFixture(s);
  assert.equal(s.food, food);
  assert.equal(s.cargo.grain, 4);
  assert.equal(s.cargo.salt, 3);
  s.location = 0;
  assert.equal(supplyOffer(s, "food").price, 19);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.reputation.guild, -12);
  assert.equal(loaded.patrols[0].foodStock, 0);
  assert.equal(loaded.patrols[0].cargo.grain, 0);
});

test("faction benefits grant trade discounts, fine gear access and better foraging", () => {
  const s = fresh();
  changeReputation(s, "guild", 10);
  assert.equal(supplyOffer(s, "food").price, 14);
  changeReputation(s, "freefolk", 10);
  const food = s.food;
  assert.ok(forage(s));
  assert.equal(s.food, food + 8);
});

test("story contracts are exclusive to village boards, honor prerequisites and occupy the normal contract slot", () => {
  const s = fresh();
  assert.equal(storyOffers(s).length, 1);
  s.location = -1;
  assert.equal(acceptStory(s, "road"), false);
  s.location = 3;
  assert.ok(storyLock(s, regionalStories[1]).includes("Salt on the road"));
  assert.equal(acceptStory(s, "grove"), false);
  s.location = 0;
  assert.ok(acceptStory(s, "road"));
  assert.equal(acceptStory(s, "road"), false);
  assert.equal(startBattle(s), false);
  assert.equal(interactStory(s), false);
});

test("the relief branch spends food, remembers the choice, awards once on return and unlocks the next chapter", () => {
  const s = fresh();
  acceptStory(s, "road");
  s.location = 2;
  assert.ok(interactStory(s));
  assert.equal(chooseStory(s, "fake"), false);
  assert.ok(chooseStory(s, "relief"));
  assert.equal(s.food, 18);
  assert.equal(s.contract.phase, "return");
  assert.equal(s.gold, 120);
  assert.equal(chooseStory(s, "relief"), false);
  s.location = 0;
  assert.ok(interactStory(s));
  assert.equal(s.gold, 175);
  assert.equal(s.reputation.freefolk, 8);
  assert.equal(s.stories.road.status, "completed");
  assert.equal(interactStory(s), false);
  assert.equal(acceptStory(s, "road"), false);
  s.renown = 5;
  s.location = 3;
  assert.ok(acceptStory(s, "grove"));
});

test("faction combat leads to a return stage without clearing the story, then pays its branch gear reward", () => {
  const s = fresh();
  acceptStory(s, "road");
  s.location = 2;
  interactStory(s);
  chooseStory(s, "guild");
  assert.ok(startBattle(s));
  winFixture(s);
  assert.equal(s.gold, 160);
  assert.equal(s.completed, 0);
  assert.equal(s.contract.phase, "return");
  assert.equal(s.contract.target, 0);
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.contract.reward, 110);
  loaded.location = 0;
  assert.ok(interactStory(loaded));
  assert.equal(loaded.gold, 270);
  assert.equal(loaded.completed, 1);
  assert.ok(loaded.gear.some((g) => g.template === "shield-2"));
  assert.equal(loaded.reputation.guild, 8);
});

test("story choice resource gates and cargo capacity cannot be bypassed", () => {
  const s = fresh();
  acceptStory(s, "road");
  s.location = 2;
  interactStory(s);
  s.food = 5;
  assert.equal(chooseStory(s, "relief"), false);
  s.cargo.grain = 20;
  assert.equal(chooseStory(s, "seize"), false);
  assert.equal(s.event.kind, "story");
});

test("the grove and crown chapters offer distinct outcomes, prerequisites, faction gear and a reputation-gated peace route", () => {
  const s = fresh();
  s.stories.road = { status: "completed", branch: "relief" };
  s.renown = 5;
  s.location = 3;
  assert.ok(acceptStory(s, "grove"));
  s.location = 7;
  interactStory(s);
  chooseStory(s, "defend");
  startBattle(s);
  assert.equal(s.battle.enemies.length, 4);
  winFixture(s);
  s.location = 3;
  interactStory(s);
  assert.equal(s.reputation.freefolk, 10);
  assert.ok(s.gear.some((g) => g.template === "pike-2"));
  s.renown = 15;
  s.location = 6;
  assert.ok(acceptStory(s, "crown"));
  s.location = 11;
  interactStory(s);
  assert.equal(chooseStory(s, "peace"), false);
  s.reputation.wardens = 5;
  s.reputation.freefolk = 5;
  const gold = s.gold;
  assert.ok(chooseStory(s, "peace"));
  assert.equal(s.gold, gold - 30);
  s.location = 6;
  interactStory(s);
  assert.equal(s.gold, gold + 70);
  assert.equal(s.reputation.wardens, 11);
  assert.equal(s.stories.crown.branch, "peace");
});

test("story defeats keep the accepted branch retryable and saves retain active choice dialogs", () => {
  const s = fresh();
  acceptStory(s, "road");
  s.location = 2;
  interactStory(s);
  const prompt = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(prompt.event.kind, "story");
  chooseStory(s, "guild");
  startBattle(s);
  s.party.forEach((p) => (p.hp = 0));
  endTurn(s);
  assert.equal(s.contract.phase, "battle");
  assert.equal(s.location, 0);
  assert.ok(s.party.every((p) => p.hp === 1));
  const loaded = restore(JSON.parse(JSON.stringify(s)));
  loaded.location = 2;
  assert.ok(startBattle(loaded));
});

test("old saves migrate without losing gear, and malformed economy or story data is sanitized", () => {
  const s = fresh();
  s.version = 10;
  delete s.cargo;
  delete s.markets;
  delete s.reputation;
  delete s.stories;
  s.gold = 99;
  const migrated = restore(s);
  assert.equal(migrated.version, 18);
  assert.equal(migrated.gold, 99);
  assert.equal(cargoLoad(migrated), 0);
  s.cargo = { grain: 999, cloth: 999, salt: -1, iron: NaN };
  s.reputation = { guild: 999, wardens: -999, freefolk: NaN };
  s.contract = { kind: "story", storyId: "fake", phase: "return", target: 0 };
  s.event = { kind: "story", storyId: "fake" };
  const loaded = restore(s);
  assert.equal(cargoLoad(loaded), cargoCapacity);
  assert.equal(loaded.reputation.guild, 30);
  assert.equal(loaded.reputation.wardens, -30);
  assert.equal(loaded.reputation.freefolk, 0);
  assert.equal(loaded.contract, null);
  assert.equal(loaded.event, null);
});
