import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  restore,
  places,
  DAY_SECONDS,
  startBattle,
  endTurn,
  act,
  hitEnemy,
  enemyArmor,
  recoverMagicAtHome,
  assignProfession,
  learnCareer,
  careerAction,
  careerActionLock,
  activeCareer,
  attackRange,
  movementRange,
  acceptMission,
  startMission,
  missionAction,
  missionLock,
  tacticalMissions,
  missionObjective,
  observationTrails,
  visibleClues,
  interpretClue,
  observeClues,
  beginTravelConversation,
  respondConversation,
  bondValue,
  spendHours,
  purchaseHome,
  enterHome,
  upgradeHome,
  assignHomeJob,
  restAtHome,
  transferHome,
  harvestHome,
  reserveLoad,
  reserveCapacity,
  homeRepair,
  homeCraft,
  grantEquipment,
  upkeepForecast,
  leaveCamp,
  advancePatrols,
} from "../src/game.js";
const arrive = (s, id) => {
  s.location = id;
  s.position = { x: places[id].x, y: places[id].y };
};
const save = (s) => restore(JSON.parse(JSON.stringify(s)));
const fight = (role = "Swordswoman") => {
  const s = fresh();
  s.party[0].role = role;
  s.party[0].level = 3;
  s.party[0].points = 3;
  arrive(s, 1);
  s.contract = { target: 1, reward: 65, tier: 1 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  s.battle.units[0].x = 2;
  s.battle.units[0].y = 2;
  s.battle.enemies.forEach((e, i) => {
    e.x = 3 + i;
    e.y = 2;
    e.hp = e.max = 40;
  });
  return s;
};
const trained = (role, path) => {
  const s = fresh();
  s.party[0].role = role;
  s.party[0].level = 3;
  s.party[0].points = 2;
  if (["shadow", "saboteur"].includes(path)) assignProfession(s, 0, "Thief");
  assert.ok(learnCareer(s, 0, path));
  arrive(s, 1);
  s.contract = { target: 1, reward: 65, tier: 1 };
  startBattle(s);
  s.battle.layoutId = "legacy";
  s.battle.units[0].x = 2;
  s.battle.units[0].y = 2;
  s.battle.enemies.forEach((e, i) => {
    e.x = 3 + i;
    e.y = 2;
    e.hp = e.max = 40;
  });
  return s;
};
const mission = (id) => {
  const s = fresh(),
    m = tacticalMissions.find((v) => v.id === id);
  arrive(s, m.issuer);
  assert.ok(acceptMission(s, id));
  arrive(s, m.site);
  assert.ok(startMission(s));
  s.battle.layoutId = "legacy";
  s.battle.enemies.forEach((e) => (e.damage = 1));
  return s;
};
const home = () => {
  const s = fresh();
  s.gold = 1000;
  s.inventory.wood = 100;
  s.inventory.ore = 100;
  arrive(s, 15);
  assert.ok(purchaseHome(s, "farm"));
  assert.ok(enterHome(s));
  return s;
};
test("v17 migration preserves previous state and rejects malformed expedition metadata", () => {
  const s = fresh();
  s.version = 16;
  delete s.expedition;
  const r = save(s);
  assert.equal(r.version, 17);
  assert.equal(r.expedition.home.owned, false);
  assert.equal(r.expedition.mission, null);
  s.expedition = {
    mission: "unknown",
    clues: { tracks: { stage: 99 } },
    home: { owned: false, stores: { food: 999 } },
  };
  const clean = save(s);
  assert.equal(clean.expedition.clues.tracks.stage, 3);
  assert.equal(clean.expedition.home.stores.food, 0);
});
test("mission pickup is village-only and independent of regular contracts", () => {
  const s = fresh();
  s.contract = { name: "Other job", target: 4 };
  arrive(s, 1);
  assert.equal(acceptMission(s, "wagon-watch"), false);
  arrive(s, 0);
  assert.ok(acceptMission(s, "wagon-watch"));
  assert.equal(s.contract.name, "Other job");
  assert.equal(acceptMission(s, "withdrawal"), false);
  assert.match(missionLock(s, "wagon-watch", "start"), /Reach/);
});
test("wagon defense pays for survival with enemies alive and never duplicates rewards", () => {
  const s = mission("wagon-watch");
  s.battle.enemies.forEach((e) => {
    e.x = 8;
    e.damage = 0;
    e.root = 10;
  });
  s.battle.objective.rounds = 3;
  const gold = s.gold;
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.gold, gold + 90);
  assert.ok(save(s).expedition.missionLedger["wagon-watch"]);
  arrive(s, 0);
  assert.equal(acceptMission(s, "wagon-watch"), false);
});
test("destroyed defense wagon ends the mission without rewards but permits retry", () => {
  const s = mission("wagon-watch");
  s.battle.objective.wagon = 1;
  Object.assign(s.battle.enemies[0], { x: 2, y: 3, root: 5 });
  const gold = s.gold;
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.expedition.mission, "wagon-watch");
  assert.equal(s.gold, gold - 15);
  assert.ok(startMission(s));
});
test("rescue requires freeing and extracting the captive even after guards die", () => {
  const s = mission("captive");
  s.battle.enemies.forEach((e) => (e.hp = 0));
  endTurn(s);
  assert.ok(s.battle);
  Object.assign(s.battle.units[0], { x: 6, y: 3, acted: false });
  assert.ok(missionAction(s, 0, "free"));
  assert.ok(s.battle);
  const r = save(s);
  assert.equal(r.battle.objective.rescuer, 0);
  Object.assign(r.battle.units[0], { x: 1, y: 3 });
  assert.ok(missionAction(r, 0, "extract"));
  assert.equal(r.battle, null);
  assert.ok(r.expedition.missionLedger.captive);
});
test("escape completes through the marked exit without killing the force", () => {
  const s = mission("withdrawal");
  assert.equal(missionAction(s, 0, "escape"), false);
  for (const u of s.battle.units) u.x = 7;
  assert.ok(missionAction(s, 0, "escape"));
  assert.equal(s.battle, null);
  assert.ok(s.expedition.missionLedger.withdrawal);
});
test("ritual seals spend three separate actions and win before the timer expires", () => {
  const s = mission("ritual");
  for (const [i, [x, y]] of [
    [4, 1],
    [6, 3],
    [4, 5],
  ].entries()) {
    Object.assign(s.battle.units[i], { x: x - 1, y, acted: false });
    assert.ok(missionAction(s, i, "sigil", i));
  }
  assert.equal(s.battle, null);
  assert.ok(s.expedition.missionLedger.ritual);
});
test("ritual deadline fails instead of awarding a kill-only victory", () => {
  const s = mission("ritual");
  s.battle.objective.rounds = 5;
  s.battle.enemies.forEach((e) => (e.hp = 0));
  endTurn(s);
  assert.equal(s.battle, null);
  assert.equal(s.expedition.mission, "ritual");
  assert.equal(s.expedition.missionLedger.ritual, undefined);
});
test("career choices cost a point, enforce class/level, and remain permanent", () => {
  const s = fresh();
  assert.equal(learnCareer(s, 0, "duelist"), false);
  s.party[0].level = 2;
  s.party[0].points = 1;
  assert.equal(learnCareer(s, 0, "tracker"), false);
  assert.ok(learnCareer(s, 0, "duelist"));
  assert.equal(s.party[0].points, 0);
  assert.equal(learnCareer(s, 0, "vanguard"), false);
  assert.equal(activeCareer(save(s).party[0]).id, "duelist");
});
test("Thief backstabs require an engaged enemy and become dormant after profession changes", () => {
  const s = trained("Swordswoman", "shadow");
  assert.equal(careerAction(s, 0, 0), false);
  Object.assign(s.battle.units[1], { x: 3, y: 1 });
  const hp = s.battle.enemies[0].hp;
  assert.ok(careerAction(s, 0, 0));
  assert.ok(s.battle.enemies[0].hp < hp - 4);
  s.battle = null;
  assignProfession(s, 0, "Smith");
  assert.equal(activeCareer(save(s).party[0]), null);
});
test("saboteurs reduce attacks and root an adjacent enemy", () => {
  const s = trained("Swordswoman", "saboteur");
  assert.ok(careerAction(s, 0, 0));
  assert.equal(s.battle.enemies[0].weakened, 2);
  assert.equal(save(s).battle.enemies[0].root, 1);
});
test("tracker range and mark improve actual company damage", () => {
  const s = trained("Archer", "tracker");
  assert.equal(attackRange(s.party[0], false, s), 5);
  careerAction(s, 0, 0);
  const e = s.battle.enemies[0],
    hp = e.hp;
  assert.equal(hitEnemy(s, e, 4), 6);
  assert.equal(e.hp, hp - 6);
});
test("sentinel overwatch roots an enemy that enters bow range", () => {
  const s = trained("Archer", "sentinel");
  s.battle.enemies.forEach((e, i) => {
    e.x = 6 + i;
    e.y = 2;
  });
  assert.ok(careerAction(s, 0));
  endTurn(s);
  assert.ok(s.battle.enemies.some((e) => e.root > 0));
});
test("vanguard sweeps adjacent enemies with exact valor and action costs", () => {
  const s = trained("Swordswoman", "vanguard");
  s.battle.enemies[1].x = 2;
  s.battle.enemies[1].y = 3;
  const before = s.battle.valor;
  assert.ok(careerAction(s, 0));
  assert.equal(s.battle.valor, before - 2);
  assert.ok(s.battle.enemies[0].hp < 40 && s.battle.enemies[1].hp < 40);
  assert.equal(careerAction(s, 0), false);
});
test("outriders have extra movement and cannot refresh their technique indefinitely", () => {
  const s = trained("Spearman", "outrider");
  assert.equal(movementRange(s.party[0]), 3);
  assert.ok(careerAction(s, 0));
  assert.equal(careerAction(s, 0), false);
  assert.ok(s.battle.units[0].safeMove);
});
test("controller spear technique roots targets within reach", () => {
  const s = trained("Spearman", "controller");
  assert.ok(careerAction(s, 0, 0));
  assert.equal(s.battle.enemies[0].root, 2);
});
test("channeler slot recovery is once per battle and survives reload", () => {
  const s = trained("Wizard", "channeler");
  s.party[0].spellSpent = { 1: 2, 2: 0 };
  assert.ok(careerAction(s, 0));
  assert.equal(s.party[0].spellSpent[1], 1);
  const r = save(s);
  r.battle.units[0].acted = false;
  r.battle.valor = 5;
  assert.equal(careerAction(r, 0), false);
});
test("hexers stun and distract enemies without consuming spell slots", () => {
  const s = trained("Wizard", "hexer");
  assert.ok(careerAction(s, 0, 0));
  assert.equal(s.battle.enemies[0].stun, 1);
  assert.equal(s.battle.enemies[0].distracted, 2);
});
test("mentors spend herbs treating friends and refuse rivals", () => {
  const s = trained("Cleric", "mentor");
  Object.assign(s.battle.units[1], { x: 1, y: 2 });
  s.party[1].hp -= 10;
  s.inventory.herbs = 2;
  s.bonds["0:1"] = -5;
  assert.match(careerActionLock(s, 0, 1), /rival/);
  s.bonds["0:1"] = 0;
  assert.ok(careerAction(s, 0, 1));
  assert.equal(s.inventory.herbs, 1);
});
test("visible clues require three observations and a scout before revealing their endpoint", () => {
  const s = fresh(),
    t = observationTrails[0];
  s.party[2].role = "Swordswoman";
  s.position = { ...t.points[0] };
  observeClues(s);
  assert.equal(visibleClues(s)[0].id, t.id);
  assert.equal(interpretClue(s, t.id), false);
  assignProfession(s, 0, "Thief");
  for (const p of t.points) {
    s.position = { ...p };
    assert.ok(interpretClue(s, t.id));
  }
  assert.ok(s.discovered.includes(t.target));
  assert.equal(s.knowledge, 2);
  assert.equal(interpretClue(s, t.id), false);
  assert.equal(save(s).expedition.clues[t.id].stage, 3);
});
test("dismissed travel arguments create persistent rivalries and meals repair them", () => {
  const s = fresh();
  beginTravelConversation(s);
  respondConversation(s, "dismiss");
  assert.equal(bondValue(s, 0, 1), -6);
  const r = save(s);
  assert.equal(bondValue(r, 0, 1), -6);
  r.day++;
  beginTravelConversation(r);
  respondConversation(r, "meal");
  assert.equal(bondValue(r, 0, 1), 2);
  assert.equal(r.food, 22);
});
test("pending travel conversations pause and survive reload without duplicate responses", () => {
  const s = fresh();
  beginTravelConversation(s);
  const r = save(s);
  assert.equal(r.event.kind, "travel-conversation");
  assert.ok(respondConversation(r, "listen"));
  assert.equal(respondConversation(r, "listen"), false);
  assert.equal(beginTravelConversation(r), false);
});
test("breaking a wage promise harms trust at dawn, while paying it earns trust", () => {
  for (const kept of [false, true]) {
    const s = fresh();
    s.wageDebt = 10;
    s.gold = kept ? 100 : 0;
    beginTravelConversation(s);
    respondConversation(s, "promise");
    if (kept) s.wageDebt = 0;
    const resolve = s.party[0].resolve;
    spendHours(s, 16);
    assert.equal(s.expedition.promise, null);
    assert.ok(
      s.log.some((v) =>
        v.includes(
          kept ? "Kept the promised" : "promised wage payment was missed",
        ),
      ),
    );
    assert.ok(
      kept ? s.party[0].resolve > resolve : s.party[0].resolve < resolve,
    );
  }
});
test("home purchase is an actual expensive permanent choice and cannot be repeated", () => {
  const s = home();
  assert.equal(s.gold, 680);
  assert.equal(s.inventory.wood, 90);
  s.event = null;
  assert.equal(purchaseHome(s), false);
  assert.equal(save(s).expedition.home.style, "farm");
});
test("home reserves enforce capacity and wagon capacity on withdrawal", () => {
  const s = home();
  s.food = 40;
  assert.ok(transferHome(s, "food", 30));
  assert.equal(reserveLoad(s), 30);
  assert.equal(transferHome(s, "wood", 1), false);
  assert.ok(upgradeHome(s, "storage"));
  assert.equal(reserveCapacity(s), 60);
  assert.ok(transferHome(s, "wood", 5));
  s.cargo.grain = 20;
  assert.ok(transferHome(s, "grain", 5));
  s.cargo.grain = 20;
  assert.equal(transferHome(s, "grain", 1, "withdraw"), false);
  assert.equal(save(s).expedition.home.stores.grain, 5);
});
test("home garden yields finite reserves every three days without catch-up exploits", () => {
  const s = home();
  upgradeHome(s, "garden");
  assert.equal(harvestHome(s), false);
  s.day = 4;
  assert.ok(harvestHome(s));
  assert.equal(s.expedition.home.stores.food, 8);
  assert.equal(harvestHome(s), false);
  assert.equal(save(s).expedition.home.harvestDay, 4);
});
test("home rest uses food, beds, conscious medic and medicine while wages still accrue", () => {
  const s = home();
  upgradeHome(s, "beds");
  upgradeHome(s, "infirmary");
  assert.ok(assignHomeJob(s, "medic", 2));
  s.timeOfDay = 20;
  for (const p of s.party) {
    p.hp -= 10;
    p.injury = true;
    p.fatigue = 80;
  }
  const gold = s.gold,
    food = s.food;
  assert.ok(restAtHome(s));
  assert.ok(s.gold < gold);
  assert.ok(s.food < food);
  assert.equal(s.inventory.medicine, 0);
  assert.ok(s.party.every((p) => !p.injury && p.fatigue <= 20));
});
test("home forge requires a real operator and materials for repairs and crafting", () => {
  const s = home(),
    gearId = grantEquipment(s, "sword-1"),
    gear = s.gear.find((g) => g.id === gearId);
  gear.durability = 40;
  assert.equal(homeRepair(s, gear.id), false);
  upgradeHome(s, "forge");
  assignHomeJob(s, "smith", 0);
  assert.ok(homeRepair(s, gear.id));
  assert.equal(gear.durability, 100);
  assert.equal(homeCraft(s, "sword-2"), false);
  s.research.push("armorer");
  assert.ok(homeCraft(s, "sword-2"));
  assert.ok(s.gear.some((g) => g.template === "sword-2"));
});
test("upkeep forecast and longer days report actual spending rather than estimated upkeep", () => {
  const s = fresh();
  assert.equal(DAY_SECONDS, 300);
  const f = upkeepForecast(s);
  assert.equal(f.food, 4);
  assert.equal(f.wages, 8);
  assert.equal(f.foodDays, 6);
  assert.equal(f.paidDays, 15);
  s.wageDebt = 40;
  assert.equal(upkeepForecast(s).paidDays, 10);
});

test("another companion can take over escorting a captive when the rescuer falls", () => {
  const s = mission("captive");
  Object.assign(s.battle.units[0], { x: 6, y: 3, acted: false });
  missionAction(s, 0, "free");
  s.party[0].hp = 0;
  Object.assign(s.battle.units[1], { x: 6, y: 2, acted: false });
  assert.ok(missionAction(s, 1, "carry"));
  assert.equal(s.battle.objective.rescuer, 1);
});
test("duelists answer a melee blow with one riposte", () => {
  const s = trained("Swordswoman", "duelist");
  s.battle.enemies.slice(1).forEach((e) => (e.hp = 0));
  s.battle.units.slice(1).forEach((u, i) => {
    u.x = 0;
    u.y = 4 + i;
  });
  s.battle.enemies[0].root = 5;
  careerAction(s, 0);
  endTurn(s);
  assert.equal(s.battle.enemies[0].hp, 36);
  assert.ok(s.log.some((v) => v.includes("duelist riposte")));
});
test("protector techniques share actual damage with an adjacent ally", () => {
  const s = trained("Shieldbearer", "protector");
  s.party[1].role = "Swordswoman";
  Object.assign(s.battle.units[1], { x: 2, y: 3 });
  s.battle.units.slice(2).forEach((u, i) => {
    u.x = 0;
    u.y = 5 + i;
  });
  s.battle.enemies.slice(1).forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], { x: 1, y: 3, root: 5, damage: 5 });
  const own = s.party[0].hp,
    ally = s.party[1].hp;
  assert.ok(careerAction(s, 0, 1));
  endTurn(s);
  assert.equal(s.party[0].hp, own - 2);
  assert.equal(s.party[1].hp, ally - 3);
});
test("bandit shield guards hold a formation and protect a ranged ally", () => {
  const s = fight();
  s.battle.layoutId = "forest-edge";
  s.battle.units.forEach((u, i) => {
    u.x = 1;
    u.y = i + 1;
  });
  s.battle.enemies[0].hp = 0;
  Object.assign(s.battle.enemies[1], { kind: "brute", x: 6, y: 2 });
  Object.assign(s.battle.enemies[2], {
    kind: "mage",
    x: 6,
    y: 3,
    root: 5,
    mana: 0,
  });
  endTurn(s);
  assert.ok(s.battle.enemies[1].guard);
  assert.equal(s.battle.enemies[1].x, 6);
  assert.equal(enemyArmor(s, s.battle.enemies[2]), 1);
});
test("goblins can wait behind a trap instead of charging a nearby company", () => {
  const s = fight();
  s.battle.layoutId = "forest-edge";
  s.battle.enemies.slice(1).forEach((e) => (e.hp = 0));
  Object.assign(s.battle.enemies[0], {
    kind: "goblin",
    trapper: false,
    x: 6,
    y: 2,
  });
  s.battle.units[0].x = 4;
  s.battle.traps = [{ x: 5, y: 2, used: false }];
  endTurn(s);
  assert.equal(s.battle.enemies[0].x, 6);
  assert.ok(s.log.some((v) => v.includes("trying to lure")));
});
test("a company home restores magic using finite shards rather than free rest", () => {
  const s = home();
  s.party[0].role = "Wizard";
  s.party[0].spellSpent = { 1: 2, 2: 0 };
  assert.equal(recoverMagicAtHome(s, 0), false);
  s.realm.shards = 1;
  assert.ok(recoverMagicAtHome(s, 0));
  assert.equal(s.realm.shards, 0);
  assert.equal(s.party[0].spellSpent[1], 0);
});
