export const WORLD = { width: 1536, height: 864, cell: 64 };
export const places = [
  { name: "Greyhaven", x: 170, y: 280, type: "town" },
  { name: "Pinewatch", x: 350, y: 145, type: "forest" },
  { name: "Old Barrow", x: 575, y: 235, type: "ruin" },
  { name: "Saltbridge", x: 590, y: 355, type: "town" },
  { name: "Iron Hollow", x: 220, y: 95, type: "mine" },
  { name: "Watchtower", x: 685, y: 95, type: "ruin" },
  { name: "Emberfall", x: 1110, y: 600, type: "town" },
  { name: "Whispering Grove", x: 965, y: 220, type: "forest" },
  { name: "Sunken Chapel", x: 730, y: 720, type: "ruin" },
  { name: "Redstone Quarry", x: 1250, y: 110, type: "mine" },
  { name: "Forgotten Stash", x: 350, y: 620, type: "cache" },
  { name: "Broken Crown", x: 1385, y: 755, type: "ruin" },
  { name: "Briarhide Camp", x: 470, y: 490, type: "ruin", scene: "camp" },
  { name: "Ashbrook Farm", x: 120, y: 510, type: "farm" },
  { name: "Echo Cavern", x: 870, y: 440, type: "mine", scene: "cave" },
  { name: "Wayfarer Lodge", x: 1010, y: 470, type: "home", scene: "home" },
];
export const studies = [
  {
    id: "rations",
    name: "Trailcraft",
    cost: 2,
    desc: "Reduce daily ration use by one, down to a minimum of one.",
  },
  {
    id: "medicine",
    name: "Field medicine",
    cost: 3,
    desc: "Camp heals 8 additional health.",
  },
  {
    id: "steel",
    name: "Tempered steel",
    cost: 4,
    desc: "All company attacks deal +2 damage.",
  },
];
studies.push(
  {
    id: "scouting",
    name: "Watchful eyes",
    cost: 3,
    desc: "Increase discovery and map visibility from 140 to 210 pixels.",
  },
  {
    id: "barter",
    name: "A fair bargain",
    cost: 3,
    desc: "Market and caravan purchases cost 20% less.",
  },
  {
    id: "cartography",
    name: "Borderlands charts",
    cost: 4,
    requires: "scouting",
    desc: "Requires Watchful eyes. Reveal all landmark locations; terrain must still be explored.",
  },
);
studies.push(
  {
    id: "preservation",
    name: "Food preservation",
    cost: 6,
    requires: "rations",
    minRenown: 10,
    desc: "Requires Trailcraft and 10 renown. Reduce daily ration use by one more, to a minimum of one.",
  },
  {
    id: "endurance",
    name: "Marching discipline",
    cost: 7,
    requires: "medicine",
    minRenown: 10,
    desc: "Requires Field medicine and 10 renown. Awake fatigue builds 25% more slowly, including tireless companions.",
  },
  {
    id: "paymaster",
    name: "Company charter",
    cost: 6,
    requires: "barter",
    minRenown: 10,
    desc: "Requires A fair bargain and 10 renown. Reduce the total daily wage bill by 20%, rounded up. Existing debts remain owed.",
  },
  {
    id: "maintenance",
    name: "Campaign maintenance",
    cost: 8,
    requires: "armorer",
    minRenown: 20,
    desc: "Requires Armorer’s craft and 20 renown. All equipped gear loses five fewer durability points after victory, retreat, or defeat.",
  },
  {
    id: "drills",
    name: "Tactical drills",
    cost: 8,
    requires: "steel",
    minRenown: 20,
    desc: "Requires Tempered steel and 20 renown. Start every battle with one additional valor, up to the usual maximum of five.",
  },
);
export function researchLock(s, id) {
  const r = studies.find((r) => r.id === id);
  if (!r) return "Unknown discovery.";
  if (s.research.includes(id)) return "Already discovered.";
  if (s.battle || s.event || companyLost(s))
    return "Finish the current encounter before researching.";
  if (r.requires && !s.research.includes(r.requires))
    return `Requires ${studies.find((study) => study.id === r.requires)?.name || r.requires}.`;
  if (s.renown < (r.minRenown || 0))
    return `Requires ${r.minRenown} renown; company has ${s.renown}.`;
  if (s.knowledge < r.cost)
    return `Requires ${r.cost} knowledge; company has ${s.knowledge}.`;
  return null;
}
export function fresh() {
  return {
    version: 21,
    companyName: "The Ashen Company",
    difficulty: "standard",
    banner: "ashen",
    origin: "wanderers",
    inventory: { ore: 0, wood: 0, herbs: 0, medicine: 1, pelts: 0 },
    gear: [],
    nextGearId: 1,
    explored: [],
    event: null,
    encounterSerial: 0,
    trailLedger: {},
    encounterJournal: [],
    lastTrailEncounter: null,
    renown: 0,
    skirmishes: 0,
    fieldLife: fieldLifeState(),
    discovered: [0, 3],
    charted: initialChart(),
    patrols: initialPatrols(),
    day: 1,
    timeOfDay: 8,
    hungerDays: 0,
    wageDebt: 0,
    campOpen: false,
    campUpgrades: {},
    campJobs: {},
    lastCampWorkDay: -1,
    preparedValor: 0,
    bonds: {},
    lastBondRestDay: -1,
    lastConversationDay: -1,
    recruitSerial: 0,
    hiredRecruits: [],
    lessonLedger: {},
    rumors: {},
    siteProgress: {},
    forageLedger: {},
    helpSeen: {},
    campaign: { phase: "unstarted", branch: null },
    strongholds: { briar: { cleared: false, lastSpawn: 1, waves: 0 } },
    travelers: {
      tamsin: "unknown",
      merrit: "waiting",
      farmRebuilt: false,
      harvestDay: -1,
    },
    crime: { wanted: 0, stolen: false },
    campFurniture: {},
    ambushReady: false,
    stealth: { active: false, concealment: 0 },
    strongholdIntel: {
      scouted: false,
      supplies: false,
      prisoner: false,
      sabotaged: false,
      entry: false,
    },
    wagon: { owned: false, storage: 0, workbench: 0, rails: 0, condition: 100 },
    travelJobs: {},
    caravanEscort: null,
    escortLedger: {},
    realm: freshRealm(),
    expedition: freshExpedition(),
    odyssey: freshOdyssey(),
    chronicle: freshChronicle(),
    arcana: freshArcana(),
    fieldwork: freshFieldwork(),
    stash: { found: false, unlocked: false, searched: [], clues: [], loot: {} },
    cargo: { grain: 0, cloth: 0, salt: 0, iron: 0 },
    markets: {},
    reputation: { guild: 0, wardens: 0, freefolk: 0 },
    stories: {},
    bounties: {},
    gold: 120,
    food: 24,
    morale: 75,
    knowledge: 0,
    location: 0,
    position: { x: 170, y: 280 },
    destination: null,
    walked: 0,
    trail: [{ x: 170, y: 280 }],
    research: [],
    contract: null,
    completed: 0,
    battle: null,
    log: [
      "The Ashen Company arrives at Greyhaven. Find work at the contract board.",
    ],
    party: [
      ["Mara", "Swordswoman", 28, 7],
      ["Osric", "Shieldbearer", 34, 5],
      ["Nell", "Archer", 22, 6],
      ["Finn", "Spearman", 26, 6],
    ].map(([name, role, max, hurt], id) => ({
      id,
      name,
      role,
      max,
      hp: max,
      damage: hurt,
      level: 1,
      xp: 0,
      points: 0,
      injury: false,
      dead: false,
      fatigue: 0,
      resolve: 65,
      traits: [["resolute"], ["steadfast"], ["compassionate"], ["convivial"]][
        id
      ],
      armor: 0,
      weapon: 0,
      profession:
        id === 0
          ? "Smith"
          : id === 1
            ? "Miner"
            : id === 2
              ? "Herbalist"
              : "Cook",
      professionXP: 0,
      professionXPBy: {},
      talent: null,
      advancedSkill: null,
      equipment: { weapon: null, armor: null, shield: null, helmet: null },
      wound: null,
    })),
  };
}
export function note(s, t) {
  s.log.unshift(`Day ${s.day} · ${t}`);
  recordRealmEncounter(s, t);
  s.log = s.log.slice(0, 30);
}
export function travel(s, to) {
  if (s.battle || s.event || to === s.location || !places[to]) return false;
  if (companyLost(s) || s.campOpen) return false;
  spendHours(s, 24);
  if (companyLost(s)) return false;
  s.location = to;
  s.position = { x: places[to].x, y: places[to].y };
  s.trail = [{ ...s.position }];
  s.destination = null;
  s.morale = Math.max(0, s.morale - 2);
  note(s, `Reached ${places[to].name}. Daily upkeep settled.`);
  if (s.day % 6 === 0) s.event = roadEvent(s);
  return true;
}
export function camp(s) {
  if (s.battle || s.event || companyLost(s)) return false;
  s.destination = null;
  const cook = professional(s, "Cook");
  const recovery =
    (s.research.includes("medicine") ? 18 : 10) +
    (s.campFurniture?.table !== undefined ? 2 : 0) +
    professionBonus(s, "Herbalist") * 2 +
    (s.campUpgrades.tents || 0) * 5 +
    (s.campUpgrades.infirmary || 0) * 6;
  const crowded = s.campOpen ? campCrowding(s) : 0;
  const restHours = (8 - s.timeOfDay + 24) % 24 || 24;
  spendHours(s, restHours, { resting: true });
  for (const p of livingParty(s)) {
    const working =
      s.campOpen &&
      campRoles.some((role) => campWorker(s, role.id)?.id === p.id);
    p.fatigue = Math.max(
      0,
      (p.fatigue || 0) - restHours * (s.hungerDays ? 1 : working ? 3 : 5),
    );
  }
  if (s.hungerDays === 0 && !companyLost(s)) {
    s.morale = Math.min(100, s.morale + 12 + professionBonus(s, "Cook"));
    for (const p of livingParty(s)) {
      p.hp = Math.min(
        p.max,
        p.hp + Math.max(1, Math.floor(recovery / (1 + crowded))),
      );
      if (p.hp === p.max || (s.campUpgrades.infirmary && p.hp >= p.max / 2))
        p.injury = false;
    }
    if (cook && !cook.dead && campWorker(s, "cook")?.id !== cook.id)
      practice(s, cook, 1);
    if (crowded) {
      s.morale = Math.max(0, s.morale - crowded * 3);
      for (const p of livingParty(s)) changeResolve(p, -crowded * 2);
      note(
        s,
        `Crowded camp: ${crowded} companions lack space. Rest healing is reduced, morale falls and resolve suffers.`,
      );
    }
    finishCampJobs(s, restHours);
    if (restHours >= 6) restRelationships(s);
    note(
      s,
      "Rested until dawn. Fed companions recover; camp improvements help tend their wounds.",
    );
  } else
    note(
      s,
      "An empty cookpot. Hunger prevents recovery; find food before the next daily meal.",
    );
  if (s.campOpen) rollCampOpportunity(s);
  return true;
}
export function research(s, id) {
  const r = studies.find((r) => r.id === id);
  if (researchLock(s, id)) return false;
  s.knowledge -= r.cost;
  s.research.push(id);
  if (id === "cartography") s.discovered = places.map((p, i) => i);
  if (id === "scouting") discoverNearby(s);
  note(s, `Learned ${r.name}.`);
  return true;
}
export function startBattle(s, patrolId = null, options = {}) {
  const patrol = patrolId
    ? s.patrols.find((p) => p.id === patrolId && !p.cleared)
    : null;
  const defended =
    options.caravanDefense &&
    s.patrols.find(
      (p) =>
        p.id === options.caravanDefense &&
        p.raid?.attackerId === patrolId &&
        Math.hypot(p.x - s.position.x, p.y - s.position.y) <= 90,
    );
  if (s.caravanEscort?.patrolId === patrolId && patrolId) return false;
  if (
    patrolId &&
    (!patrol ||
      Math.hypot(patrol.x - s.position.x, patrol.y - s.position.y) >
        (defended ? 128 : 48))
  )
    return false;
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    (!patrol &&
      (!s.contract ||
        s.contract.kind === "delivery" ||
        (s.contract.kind === "story" && s.contract.phase !== "battle") ||
        s.location !== s.contract.target ||
        (s.contract.kind === "boss" &&
          (s.bounties[s.contract.bossId] ||
            !namedAdversaries.some(
              (boss) => boss.id === s.contract.bossId,
            ))))) ||
    !s.party.some((p) => p.hp > 0)
  )
    return false;
  beginAfterAction(s, "battle", patrol?.name || s.contract?.title || "Combat");
  s.destination = null;
  if (patrol?.faction) {
    changeReputation(s, patrol.faction, patrol.hostile ? -4 : -8);
    if (!patrol.hostile) registerCrime(s, false);
  }
  if (patrol?.kind === "merchant" && !patrol.hostile) {
    patrol.hostile = true;
    registerCrime(s, false);
    s.morale = Math.max(0, s.morale - 10);
    s.renown = Math.max(0, s.renown - 5);
    changeReputation(s, "guild", -12);
    changeReputation(s, "wardens", -6);
    for (const p of livingParty(s))
      if (hasTrait(p, "compassionate")) changeResolve(p, -8);
    note(
      s,
      "You attack peaceful traders. −10 morale, −5 renown; this caravan will no longer trade.",
    );
  }
  s.battle = {
    kind: patrol ? "patrol" : "contract",
    patrolId: patrol?.id || null,
    caravanRaid: patrol?.kind === "merchant",
    caravanDefense: defended?.id || null,
    wildlife: patrol?.kind === "wolves",
    turn: 1,
    valor: Math.min(
      5,
      3 +
        (s.campUpgrades.watchpost || 0) +
        s.preparedValor +
        (s.research.includes("drills") ? 1 : 0),
    ),
    units: s.party
      .filter((p) => p.hp > 0)
      .map((p, i) => ({
        id: p.id,
        x: 1,
        y: i + 1,
        acted: false,
        moved: false,
        guard: false,
        cooldown: 0,
      })),
    enemies: [
      {
        id: 0,
        x: 7,
        y: 1,
        hp: 16,
        max: 16,
        kind: "raider",
        damage: 5,
        armor: 0,
      },
      {
        id: 1,
        x: 6,
        y: 3,
        hp: 20,
        max: 20,
        kind: "brute",
        damage: 6,
        armor: 1,
      },
      {
        id: 2,
        x: 7,
        y: 5,
        hp: 16,
        max: 16,
        kind: "archer",
        damage: 4,
        armor: 0,
      },
    ],
  };
  if (patrol?.kind === "wolves")
    s.battle.enemies = [1, 3, 5].map((y, id) => ({
      id,
      x: 7,
      y,
      hp: 14,
      max: 14,
      kind: "wolf",
      damage: 4,
      armor: 0,
    }));
  s.preparedValor = 0;
  const difficulty = contractDifficulty(patrol ? null : s.contract);
  for (let i = 0; i < difficulty.tier - 1; i++) {
    s.battle.enemies.push({
      id: 3 + i,
      x: i === 0 ? 7 : 6,
      y: i === 0 ? 2 : 4,
      hp: 16,
      max: 16,
      kind: i === 0 ? "raider" : "archer",
      damage: i === 0 ? 5 : 4,
      armor: 0,
    });
  }
  for (const e of s.battle.enemies) {
    e.hp += (difficulty.tier - 1) * 4;
    e.max = e.hp;
    e.damage += difficulty.tier - 1;
  }
  deployFantasyEnemies(s, patrol);
  deployBattle(s, patrol);
  if (s.battle.enemyFamily === "skeleton")
    s.battle.enemies.forEach((e, i) => {
      [e.x, e.y] = [
        [7, 2],
        [7, 3],
        [7, 4],
        [6, 2],
        [6, 4],
      ][i];
    });
  if (!patrol) deployAdversary(s);
  const rear = travelWorker(s, "rearguard");
  if (rear) {
    const unit = s.battle.units.find((u) => u.id === rear.id);
    if (unit) unit.guard = true;
  }
  if (s.difficulty !== "standard")
    for (const e of s.battle.enemies) {
      e.hp = e.max = Math.max(
        1,
        Math.round(
          e.hp *
            (s.difficulty === "forgiving"
              ? 0.8
              : s.difficulty === "veteran"
                ? 1.2
                : 1),
        ),
      );
      e.damage = Math.max(
        1,
        e.damage +
          (s.difficulty === "forgiving"
            ? -1
            : s.difficulty === "veteran"
              ? 1
              : 0),
      );
    }
  if (standardBearer(s)) s.battle.valor = Math.min(5, s.battle.valor + 1);
  deployCompanyFormation(s);
  s.fieldLife.encounter++;
  s.battle.fieldSeed =
    (Math.imul(s.fieldLife.encounter, 2654435761) +
      Math.round(s.position.x * 17 + s.position.y * 31)) >>>
    0;
  s.battle.terrainVariation = s.skirmishes % 3;
  s.battle.terrainBaseLayout = s.battle.layoutId;
  s.battle.terrainFormation = [...s.battle.units, ...s.battle.enemies].map(
    (v) => ({ x: v.x, y: v.y }),
  );
  if (s.ambushReady || canAutoAmbush(s, patrol)) {
    s.battle.valor = Math.min(5, s.battle.valor + 1);
    s.battle.openingAmbush = true;
    s.ambushReady = false;
    note(
      s,
      "Ambush! Take a full opening turn; enemies cannot respond until your second turn ends.",
    );
  }
  s.stealth = { active: false, concealment: 0 };
  note(
    s,
    "Steel drawn. Select a companion, then a neighboring tile to move or an enemy to attack.",
  );
  return true;
}
export function act(s, id, x, y) {
  const b = s.battle;
  if (!b) return false;
  const u = b.units.find((u) => u.id === id),
    p = s.party.find((p) => p.id === id);
  if (
    !u ||
    (u.acted && !u.safeMove) ||
    p.hp <= 0 ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x > 8 ||
    y > 6
  )
    return false;
  const d = Math.abs(x - u.x) + Math.abs(y - u.y);
  const e = b.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (e) {
    if (
      u.acted ||
      d > attackRange(p, false, s) ||
      !hasLineOfSight(s, u, { x, y })
    )
      return false;
    const flank = p.role === "Archer" ? 0 : flankingBonus(s, u, e);
    combatCue(s, p.role === "Archer" ? "arrow" : "strike", u, e);
    const damage = hitEnemy(
      s,
      e,
      attackPower(s, p) + flank - (d > 1 ? terrainCell(s, e.x, e.y).cover : 0),
    );
    equipmentOnHit(s, p, e, true);
    note(
      s,
      `${p.name} strikes for ${damage} damage${flank ? " · flanking +2" : ""}.`,
    );
    u.acted = true;
  } else {
    if (
      u.moved ||
      d > movementRange(p) ||
      d === 0 ||
      b.units.some((v) => v.x === x && v.y === y && s.party[v.id].hp > 0)
    )
      return false;
    const path = battlePath(s, u, x, y);
    if (!path) return false;
    moveCombatUnit(s, u, path);
  }
  if (b.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}
function win(s) {
  if (!battleVictoryAllowed(s)) return false;
  recordNewEnemyVictory(s);
  if (s.battle.mission) {
    finishMission(s);
    return true;
  }
  if (s.battle.realmStronghold)
    defeatFantasyStronghold(s, s.battle.realmStronghold);
  if (Number.isInteger(s.battle.realmLineage)) {
    const id = s.battle.realmLineage;
    s.realm.lineage[id] = { stage: 2, outcome: null };
    s.knowledge++;
    note(
      s,
      `${s.party[id].name} defeats their former commander. Decide the fate of the recovered oath at camp.`,
    );
  }
  if (s.battle.caravanDefense) finishCaravanDefense(s);
  for (const enemy of s.battle.enemies)
    if (!enemy.escaped && enemy.stolenFood) s.food += enemy.stolenFood;
  const dungeonReturn = s.battle.dungeonReturn;
  wearBattleEquipment(s);
  const patrolFight = s.battle.kind === "patrol";
  const bossFight = !patrolFight && s.contract?.kind === "boss";
  const raid = patrolFight && s.battle.caravanRaid;
  if (raid) changeTownCondition(s, nearestVillage(s.position), -8);
  const wildlife = patrolFight && s.battle.wildlife;
  const difficulty = wildlife
    ? { tier: 1, knowledge: 1, xp: 20, salvage: 0, renown: 2 }
    : contractDifficulty(patrolFight ? null : s.contract);
  const baseReward = patrolFight
    ? wildlife
      ? 0
      : raid
        ? 60
        : 40
    : s.contract.reward;
  const reward = Math.ceil(
    baseReward *
      (s.difficulty === "veteran" ? 1.15 : 1) *
      (s.battle.enemies.every((e) => e.escaped) ? 0.5 : 1),
  );
  const hunted = wildlife
    ? s.battle.enemies.filter((e) => !e.escaped).length
    : 0;
  if (wildlife) {
    s.food += hunted * 2;
    s.inventory.pelts += Math.ceil((hunted * 2) / 3);
  }
  if (raid) {
    if (!s.crime.wanted) registerCrime(s);
    s.crime.stolen = true;
  }
  if (raid)
    lootCaravanCargo(
      s,
      s.patrols.find((p) => p.id === s.battle.patrolId),
    );
  s.gold += reward;
  s.knowledge += difficulty.knowledge;
  if (patrolFight) {
    s.skirmishes++;
    const patrol = s.patrols.find((p) => p.id === s.battle.patrolId);
    if (patrol) patrol.cleared = true;
  } else if (s.contract.kind !== "story") s.completed++;
  if (!raid) {
    s.renown += difficulty.renown;
    const resisting = s.battle.patrolId === "warden-pursuit";
    changeReputation(s, wildlife ? "freefolk" : "wardens", resisting ? -3 : 1);
    if (resisting) s.crime.wanted = Math.min(10, s.crime.wanted + 1);
  }
  s.inventory.ore += difficulty.salvage;
  s.inventory.wood += difficulty.salvage;
  growPartyBonds(s, 3, true);
  for (const p of s.party.filter((p) => p.hp > 0)) {
    changeResolve(p, 5);
    p.xp += difficulty.xp;
    while (p.xp >= p.level * 30) {
      p.xp -= p.level * 30;
      p.level++;
      p.points++;
    }
  }
  note(
    s,
    `${wildlife ? `Wolf pack scattered · ${hunted * 2} rations and ${Math.ceil((hunted * 2) / 3)} pelts recovered` : raid ? "Caravan plundered · remaining provisions and cargo seized" : patrolFight ? "Patrol defeated" : s.contract?.kind === "story" ? "Faction battle won" : "Contract fulfilled"}. Earned ${reward} crowns, ${difficulty.knowledge} knowledge, and ${difficulty.xp} XP per survivor.`,
  );
  if (bossFight) finishBounty(s);
  if (!wildlife && !bossFight) {
    const lootPool = equipmentCatalog.filter(
      (item) => item.tier === difficulty.tier && !item.uniqueBoss,
    );
    const loot =
      lootPool[
        Math.max(
          0,
          s.completed +
            s.skirmishes +
            (s.contract?.kind === "story" ? 1 : 0) -
            1,
        ) % lootPool.length
      ];
    grantEquipment(s, loot.id);
    note(
      s,
      `Recovered ${loot.rarity.toLowerCase()} ${loot.name}. Open Equipment to assign the loot.`,
    );
  }
  if (!patrolFight && !storyBattleWon(s)) s.contract = null;
  s.party.forEach((p) => (p._wildshape = false));
  s.battle = null;
  if (s.fieldwork.reportCheckpoint)
    s.fieldwork.reportCheckpoint.outcome = "Victory";
  updateAfterActionReport(s);
  if (dungeonReturn?.site === 12) clearStronghold(s);
  if (dungeonReturn) {
    s.siteProgress[`guard-${dungeonReturn.site}`] = true;
    s.event = dungeonReturn;
  }
}
export function endTurn(s) {
  const b = s.battle;
  if (!b) return false;
  if (b.openingAmbush) {
    b.openingAmbush = false;
    b.turn++;
    for (const u of b.units) {
      u.acted = false;
      u.moved = false;
      u.reacted = false;
      u.safeMove = false;
      u.outriderUsed = false;
      u.protectedBy = null;
      u.riposte = false;
    }
    note(
      s,
      "Ambush opening complete. Your company takes its additional turn before the enemies respond.",
    );
    return true;
  }
  resolveCompanyPoison(s);
  b.enemies.forEach((e) => {
    e.burningThisRound = false;
    e.charging = false;
    if (e.empowered > 0) e.empowered--;
  });
  resolveRealmMagic(s);
  b.enemies.forEach((e) => (e.stunnedThisRound = false));
  resolveBossThreat(s);
  for (const e of b.enemies.filter((e) => e.hp > 0)) {
    if (e.bleed > 0) {
      hitEnemy(s, e, 2 + enemyArmor(s, e));
      e.bleed--;
      note(s, "An enemy suffers 2 bleeding damage.");
      if (e.hp === 0) continue;
    }
    if (e.burn > 0) {
      e.burningThisRound = true;
      hitEnemy(s, e, 3 + enemyArmor(s, e));
      e.burn--;
      if (e.hp <= 0) continue;
    }
    if (e.stun > 0) {
      if (e.casting) {
        e.casting = null;
        note(
          s,
          "A stunned spellcaster loses its prepared spell; the slot remains spent.",
        );
      }
      e.stunnedThisRound = true;
      e.stun--;
      e.root = Math.max(0, (e.root || 0) - 1);
      note(s, "A stunned enemy loses its turn.");
      continue;
    }
    if (
      !e.bossId &&
      ["wolf", "goblin", "bandit", "raider", "brute", "archer"].includes(
        e.kind,
      ) &&
      e.hp / e.max <= 0.2
    )
      e.fleeing = true;
    if (routeEnemy(s, e)) continue;
    if (enemySpecialTurn(s, e)) continue;
    adversaryTurn(s, e);
    const targets = b.units
      .filter((u) => s.party[u.id].hp > 0)
      .sort(
        (a, c) =>
          Math.abs(a.x - e.x) +
          Math.abs(a.y - e.y) -
          (Math.abs(c.x - e.x) + Math.abs(c.y - e.y)),
      );
    if (e.kind === "wolf") {
      const nearby = targets.filter(
        (u) => Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 3,
      );
      nearby.sort(
        (a, c) =>
          s.party[a.id].hp / s.party[a.id].max -
          s.party[c.id].hp / s.party[c.id].max,
      );
      if (nearby.length) targets.unshift(nearby[0]);
    }
    coordinateTargets(s, e, targets);
    const t = targets[0];
    if (!t) break;
    const range = [
        "archer",
        "mage",
        "cultist",
        "necromancer",
        "shaman",
        "sorcerer",
      ].includes(e.kind)
        ? 4
        : 1,
      dist = () => Math.abs(t.x - e.x) + Math.abs(t.y - e.y);
    const rooted = (e.root || 0) > 0;
    e.root = Math.max(0, (e.root || 0) - 1);
    const rush =
      e.bossId === "ashfang"
        ? 3
        : ["wolf", "goblin", "spider"].includes(e.kind) || e.charging
          ? 2
          : 1;
    let movement = rush;
    e.walkRoute = [{ x: e.x, y: e.y }];
    for (
      let step = 0;
      !rooted &&
      movement > 0 &&
      step < rush &&
      (dist() > range ||
        !hasLineOfSight(s, e, t) ||
        ([
          "archer",
          "mage",
          "cultist",
          "necromancer",
          "shaman",
          "sorcerer",
        ].includes(e.kind) &&
          dist() <= 1));
      step++
    ) {
      let options = [
        [e.x + 1, e.y],
        [e.x - 1, e.y],
        [e.x, e.y + 1],
        [e.x, e.y - 1],
      ].filter(
        ([x, y]) =>
          terrainCell(s, x, y).cost <= movement &&
          x >= 0 &&
          x <= 8 &&
          y >= 0 &&
          y <= 6 &&
          !b.units.some(
            (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
          ) &&
          !b.enemies.some((v) => v !== e && v.hp > 0 && v.x === x && v.y === y),
      );
      const retreat =
        [
          "archer",
          "mage",
          "cultist",
          "necromancer",
          "shaman",
          "sorcerer",
        ].includes(e.kind) && dist() <= 1;
      options.sort(
        (a, c) =>
          (Math.abs(a[0] - t.x) +
            Math.abs(a[1] - t.y) -
            (Math.abs(c[0] - t.x) + Math.abs(c[1] - t.y))) *
          (retreat ? -1 : 1),
      );
      coordinateSteps(s, e, t, options, retreat);
      if (!retreat && battleTerrain(s).some((tile) => tile.blocked)) {
        const route = enemyApproach(s, e, t, range, movement);
        options =
          route && terrainCell(s, route[0], route[1]).cost <= movement
            ? [route]
            : [];
      }
      if (options.length) {
        if (shieldLaneBlocked(s, e, { x: options[0][0], y: options[0][1] })) {
          note(s, "A braced shield stops an enemy from crossing the line.");
          break;
        }
        spearApproach(s, e, { x: options[0][0], y: options[0][1] });
        if (e.hp <= 0) break;
        enemyDisengagement(s, e, options[0]);
        if (e.hp <= 0) break;
        movement -= terrainCell(s, options[0][0], options[0][1]).cost;
        e.facing = Math.atan2(options[0][1] - e.y, options[0][0] - e.x);
        [e.x, e.y] = options[0];
        e.walkRoute.push({ x: e.x, y: e.y });
        if (e.root) break;
      }
    }
    triggerOverwatch(s, e);
    if (e.hp > 0 && dist() <= range && hasLineOfSight(s, e, t)) {
      const p = s.party[t.id];
      const power =
        Math.max(
          1,
          (e.damage || 5) -
            (e.distracted > 0 ? 2 : 0) -
            (e.weakened > 0 ? 2 : 0),
        ) +
        adversaryPower(s, e) +
        (e.charging ? 2 : 0) +
        (e.empowered > 0 ? 3 : 0) +
        (e.kind === "archer" ? 0 : flankingBonus(s, e, t, "enemies")) +
        (e.kind === "wolf" &&
        b.enemies.some(
          (ally) =>
            ally !== e &&
            ally.kind === "wolf" &&
            ally.hp > 0 &&
            Math.abs(ally.x - t.x) + Math.abs(ally.y - t.y) === 1,
        )
          ? 1
          : 0);
      combatCue(
        s,
        e.kind === "archer"
          ? "arrow"
          : ["cultist", "mage", "necromancer", "shaman", "sorcerer"].includes(
                e.kind,
              )
            ? "spell"
            : "strike",
        e,
        t,
      );
      const damage = damageCompanion(
        s,
        t,
        power,
        [
          "archer",
          "mage",
          "cultist",
          "necromancer",
          "shaman",
          "sorcerer",
        ].includes(e.kind),
      );
      if (e.kind === "spider" && p.hp > 0) t.poison = 2;
      if (
        p.hp > 0 &&
        t.guard &&
        e.kind !== "archer" &&
        gearPerk(s, p, "riposte")
      ) {
        hitEnemy(s, e, 2);
        note(s, `${p.name} ripostes.`);
      }
      note(
        s,
        `${p.name} takes ${damage} damage${p.hp === 0 ? " and falls unconscious" : ""}.`,
      );
    }
    if (
      e.kind === "goblin" &&
      e.hp > 0 &&
      dist() === 1 &&
      s.food > 0 &&
      !e.stolenFood
    ) {
      e.stolenFood = Math.min(2, s.food);
      s.food -= e.stolenFood;
      note(
        s,
        "A goblin snatches company rations and tries to flee. Defeat it before it escapes to recover them.",
      );
    }
    e.distracted = Math.max(0, (e.distracted || 0) - 1);
    e.weakened = Math.max(0, (e.weakened || 0) - 1);
    e.exposed = Math.max(0, (e.exposed || 0) - 1);
    if (e.hp > 0) markAdversaryThreat(s, e, t);
  }
  for (const e of b.enemies.filter((e) => e.kind === "shaman" && e.casting)) {
    const target = b.enemies.find(
      (v) => v.id === e.casting.targetId && v.hp > 0,
    );
    if (target) {
      e.casting.x = target.x;
      e.casting.y = target.y;
    }
  }
  settleFantasyPowers(s);
  if (tickMission(s)) return true;
  if (b.enemies.every((e) => e.hp === 0) && battleVictoryAllowed(s)) {
    win(s);
    return true;
  }
  if (s.battle.units.every((u) => s.party[u.id].hp <= 0)) {
    leaveRecoveryCache(s, "defeat");
    loseEscort(s);
    damageCompanyWagon(s);
    wearBattleEquipment(s, "defeat");
    if (s.fieldwork.reportCheckpoint)
      s.fieldwork.reportCheckpoint.outcome = "Defeat";
    s.party.forEach((p) => (p._wildshape = false));
    s.battle = null;
    if (b.kind !== "patrol" && !["story", "boss"].includes(s.contract?.kind))
      s.contract = null;
    s.gold = Math.max(0, s.gold - 20);
    s.location = 0;
    s.position = { x: places[0].x, y: places[0].y };
    s.trail = [{ ...s.position }];
    for (const p of livingParty(s)) {
      p.hp = 1;
      p.injury = true;
      changeResolve(p, -10);
    }
    s.morale = Math.max(0, s.morale - 20);
    note(
      s,
      "Company defeated. Rescuers bring you to Greyhaven; lost 20 crowns.",
    );
  } else {
    b.enemies.forEach((e) => (e.reacted = false));
    b.turn++;
    b.valor = Math.min(5, (b.valor ?? 3) + 1);
    b.units.forEach((u) => {
      u.acted = false;
      u.moved = false;
      u.guard = false;
      u.cooldown = Math.max(0, (u.cooldown || 0) - 1);
      u.reacted = false;
      u.safeMove = false;
      u.overwatch = false;
      u.outriderUsed = false;
      u.protectedBy = null;
      u.riposte = false;
      u.pinningWatch = false;
      u.spearBrace = false;
      u.snared = Math.max(0, (u.snared || 0) - 1);
    });
  }
  if (s.battle && s.battle.enemies.every((e) => e.hp <= 0)) win(s);
  if (s.battle) refreshSurrender(s);
  return true;
}

export function restore(raw) {
  const base = fresh();
  if (
    !raw ||
    ![
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    ].includes(raw.version) ||
    !Array.isArray(raw.party) ||
    raw.party.length < 1 ||
    raw.party.length > 6 ||
    !Array.isArray(raw.log) ||
    !Array.isArray(raw.research) ||
    !Number.isInteger(raw.location) ||
    !(raw.location === -1 || places[raw.location])
  )
    return base;
  for (const key of ["day", "gold", "food", "morale", "knowledge", "completed"])
    if (!Number.isFinite(raw[key]) || raw[key] < 0) return base;
  for (const p of raw.party)
    if (
      !p ||
      !Number.isFinite(p.hp) ||
      !Number.isFinite(p.max) ||
      p.max <= 0 ||
      p.hp < 0 ||
      p.hp > p.max ||
      typeof p.name !== "string"
    )
      return base;
  const result = {
    ...base,
    ...raw,
    version: 21,
    inventory: { ...base.inventory, ...raw.inventory },
    explored: raw.explored || [],
    event: raw.event || null,
  };
  result.lessonLedger = {};
  for (let id = 0; id < result.party.length; id++) {
    const day = raw.lessonLedger?.[id];
    if (Number.isInteger(day) && day >= 1 && day <= result.day)
      result.lessonLedger[id] = day;
  }
  result.siteProgress = Object.fromEntries(
    Object.entries(raw.siteProgress || {}).filter(
      ([k, v]) =>
        v === true &&
        /^(cart|secret|shore|guard|vault|farm-clue|farm-cellar|farm-well)-\d+$|^(hazard|deposit)-\d+-[135]$/.test(
          k,
        ),
    ),
  );
  result.forageLedger = Object.fromEntries(
    Object.entries(raw.forageLedger || {}).filter(
      ([key, count]) =>
        /^\d+-\d+$/.test(key) &&
        Number.isInteger(count) &&
        count > 0 &&
        count <= 24,
    ),
  );
  result.helpSeen = Object.fromEntries(
    Object.entries(raw.helpSeen || {}).filter(
      ([key, value]) =>
        ["travel", "battle", "camp", "dungeon", "farm"].includes(key) &&
        value === true,
    ),
  );
  if (result.event?.kind === "farm")
    result.event =
      result.event.site === 13 && raw.location === 13
        ? {
            kind: "farm",
            site: 13,
            message: safeCompanyName(result.event.message, "", 180),
          }
        : null;
  result.campaign = {
    phase: ["unstarted", "inquiry", "grain", "return", "completed"].includes(
      raw.campaign?.phase,
    )
      ? raw.campaign.phase
      : "unstarted",
    branch: ["league", "villagers", "company"].includes(raw.campaign?.branch)
      ? raw.campaign.branch
      : null,
  };
  if (
    ["return", "completed"].includes(result.campaign.phase) &&
    !result.campaign.branch
  )
    result.campaign.phase = "inquiry";
  result.strongholds = {
    briar: {
      cleared:
        raw.strongholds?.briar?.cleared === true ||
        result.siteProgress["guard-12"] === true,
      lastSpawn: Number.isInteger(raw.strongholds?.briar?.lastSpawn)
        ? Math.max(1, Math.min(result.day, raw.strongholds.briar.lastSpawn))
        : 1,
      waves: Number.isInteger(raw.strongholds?.briar?.waves)
        ? Math.max(0, Math.min(999, raw.strongholds.briar.waves))
        : 0,
    },
  };
  result.travelers = {
    tamsin: ["unknown", "rescued", "settled"].includes(raw.travelers?.tamsin)
      ? raw.travelers.tamsin
      : "unknown",
    merrit: ["waiting", "escorting", "arrived", "settled"].includes(
      raw.travelers?.merrit,
    )
      ? raw.travelers.merrit
      : "waiting",
    farmRebuilt: raw.travelers?.farmRebuilt === true,
    harvestDay: Number.isInteger(raw.travelers?.harvestDay)
      ? Math.max(-1, Math.min(result.day, raw.travelers.harvestDay))
      : -1,
  };
  if (result.event?.kind === "campaign")
    result.event =
      result.campaign.phase === "grain" && raw.location === 12
        ? {
            kind: "campaign",
            title: "The missing grain",
            text: "Captured grain bears the League's seal. Hungry families claim it was taken from their harvest. League: 90 crowns and cheaper food. Villagers: 55 crowns, a restored farm and cheaper food. Company: 16 rations and 25 crowns, but wanted status and lasting shortages.",
          }
        : null;
  result.crime = {
    wanted: Number.isInteger(raw.crime?.wanted)
      ? Math.max(0, Math.min(10, raw.crime.wanted))
      : 0,
    stolen: raw.crime?.stolen === true,
  };
  result.campFurniture = Object.fromEntries(
    campFurniture
      .filter(
        (f) =>
          Number.isInteger(raw.campFurniture?.[f.id]) &&
          raw.campFurniture[f.id] >= 0 &&
          raw.campFurniture[f.id] < 6,
      )
      .map((f) => [f.id, raw.campFurniture[f.id]]),
  );
  result.ambushReady = raw.ambushReady === true;
  result.stealth = {
    active: raw.stealth?.active === true,
    concealment: Number.isFinite(raw.stealth?.concealment)
      ? Math.max(0, Math.min(100, raw.stealth.concealment))
      : 0,
  };
  result.stash = {
    found: raw.stash?.found === true || result.explored.includes(10),
    unlocked: raw.stash?.unlocked === true || result.explored.includes(10),
    searched: [
      ...new Set(
        (Array.isArray(raw.stash?.searched) ? raw.stash.searched : []).filter(
          (v) => Number.isInteger(v) && v >= 0 && v < 16,
        ),
      ),
    ],
    clues: [
      ...new Set(
        (Array.isArray(raw.stash?.clues) ? raw.stash.clues : []).filter((v) =>
          [8, 2].includes(v),
        ),
      ),
    ],
    loot: Object.fromEntries(
      Object.entries(raw.stash?.loot || {}).filter(
        ([key, value]) =>
          ["gold", "medicine", "ore", "wood", "herbs"].includes(key) &&
          Number.isInteger(value) &&
          value > 0 &&
          value <= 100,
      ),
    ),
  };
  if (!result.stash.unlocked) result.stash.loot = {};

  result.difficulty = ["forgiving", "standard", "veteran"].includes(
    raw.difficulty,
  )
    ? raw.difficulty
    : "standard";
  if (result.event?.kind === "dungeon") {
    const e = result.event;
    result.event =
      ["mine", "ruin"].includes(places[e.site]?.type) &&
      e.site === raw.location &&
      Number.isInteger(e.x) &&
      e.x >= 0 &&
      e.x <= 8 &&
      Number.isInteger(e.y) &&
      e.y >= 0 &&
      e.y <= 6
        ? {
            kind: "dungeon",
            site: e.site,
            x: e.x,
            y: e.y,
            message: safeCompanyName(e.message, "", 180),
          }
        : null;
  }
  if (result.event?.kind === "site") {
    const e = result.event;
    result.event =
      [4, 9, 10].includes(e.site) && e.site === raw.location
        ? {
            kind: "site",
            site: e.site,
            stage: (e.site === 10
              ? ["search", "lock", "opened"]
              : ["entrance", "gallery", "vein"]
            ).includes(e.stage)
              ? e.stage
              : e.site === 10
                ? "search"
                : "entrance",
            pin: Number.isInteger(e.pin) ? Math.max(0, Math.min(2, e.pin)) : 0,
            strain: Number.isInteger(e.strain)
              ? Math.max(0, Math.min(2, e.strain))
              : 0,
            message:
              typeof e.message === "string"
                ? safeCompanyName(e.message, "", 180)
                : "",
          }
        : null;
    if (result.event?.site === 10) {
      if (result.stash.unlocked) result.event.stage = "opened";
      else if (result.event.stage === "lock") result.stash.found = true;
      else result.event.stage = result.stash.found ? "lock" : "search";
    }
  }
  if (result.battle?.dungeonReturn) {
    const e = result.battle.dungeonReturn;
    if (
      e.kind !== "dungeon" ||
      !["mine", "ruin"].includes(places[e.site]?.type) ||
      !Number.isInteger(e.x) ||
      e.x < 0 ||
      e.x > 8 ||
      !Number.isInteger(e.y) ||
      e.y < 0 ||
      e.y > 6
    )
      delete result.battle.dungeonReturn;
  }
  if (result.event?.kind === "negotiation") {
    // Validate against the catalog before patrols are restored below.
    result.event = initialPatrols().some(
      (p) => p.id === raw.event.patrolId && p.kind === "bandits",
    )
      ? { kind: "negotiation", patrolId: raw.event.patrolId }
      : null;
  }
  result.companyName = safeCompanyName(raw.companyName);
  result.banner = companyBanners.some((b) => b.id === raw.banner)
    ? raw.banner
    : "ashen";
  result.origin = companyOrigins.some((o) => o.id === raw.origin)
    ? raw.origin
    : "wanderers";
  const validPosition =
    raw.position &&
    Number.isFinite(raw.position.x) &&
    Number.isFinite(raw.position.y) &&
    raw.position.x >= 12 &&
    raw.position.x <= WORLD.width - 12 &&
    raw.position.y >= 18 &&
    raw.position.y <= WORLD.height - 18;
  result.position = validPosition
    ? { ...raw.position }
    : {
        x: (places[raw.location] || places[0]).x,
        y: (places[raw.location] || places[0]).y,
      };
  result.walked =
    Number.isFinite(raw.walked) && raw.walked >= 0 ? raw.walked % 160 : 0;
  result.destination = null; // Reloads resume at the saved position, safely stopped.
  result.trail = Array.isArray(raw.trail)
    ? raw.trail
        .filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y))
        .slice(-128)
    : [];
  if (!result.trail.length) result.trail = [{ ...result.position }];
  result.location = nearbyPlace(result.position);
  result.discovered = [
    ...new Set([
      0,
      3,
      ...(Array.isArray(raw.discovered) ? raw.discovered : []),
      ...result.explored,
      ...(result.location >= 0 ? [result.location] : []),
    ]),
  ].filter((i) => Number.isInteger(i) && places[i]);
  result.rumors = {};
  for (const rumor of tavernRumors) {
    const saved = raw.rumors?.[rumor.id];
    if (
      !saved ||
      !Number.isInteger(saved.heardDay) ||
      saved.heardDay < 1 ||
      saved.heardDay > result.day
    )
      continue;
    result.rumors[rumor.id] = { heardDay: saved.heardDay };
    if (
      Number.isInteger(saved.resolvedDay) &&
      saved.resolvedDay >= saved.heardDay &&
      saved.resolvedDay <= result.day &&
      result.explored.includes(rumor.target)
    )
      result.rumors[rumor.id].resolvedDay = saved.resolvedDay;
    if (!result.discovered.includes(rumor.target))
      result.discovered.push(rumor.target);
  }
  result.charted = Array.isArray(raw.charted)
    ? raw.charted.filter(
        (i) =>
          Number.isInteger(i) &&
          i >= 0 &&
          i < Math.ceil(WORLD.width / 64) * Math.ceil(WORLD.height / 64),
      )
    : initialChart();
  result.patrols = initialPatrols().map((p) => {
    const saved = Array.isArray(raw.patrols)
      ? raw.patrols.find((v) => v?.id === p.id)
      : null;
    return saved &&
      Number.isFinite(saved.x) &&
      Number.isFinite(saved.y) &&
      saved.x >= 0 &&
      saved.x <= WORLD.width &&
      saved.y >= 0 &&
      saved.y <= WORLD.height
      ? {
          ...p,
          x: saved.x,
          y: saved.y,
          waypoint: Number.isInteger(saved.waypoint)
            ? Math.abs(saved.waypoint) % p.route.length
            : 0,
          cleared: !!saved.cleared,
          hostile: !!saved.hostile,
          passageUntil: Number.isFinite(saved.passageUntil)
            ? Math.max(0, Math.min(result.day * 24 + 48, saved.passageUntil))
            : 0,

          ...(p.kind === "merchant"
            ? {
                foodStock: Number.isInteger(saved.foodStock)
                  ? Math.max(0, Math.min(30, saved.foodStock))
                  : 30,
                gearStock: (p.gearStock || []).filter(
                  (id) =>
                    !Array.isArray(saved.gearStock) ||
                    saved.gearStock.includes(id),
                ),
                cargo: Object.fromEntries(
                  tradeGoods.map((g) => [
                    g.id,
                    Number.isInteger(saved.cargo?.[g.id])
                      ? Math.max(0, Math.min(20, saved.cargo[g.id]))
                      : p.cargo[g.id] || 0,
                  ]),
                ),
              }
            : {}),
        }
      : p;
  });
  if (result.crime.wanted >= 3) {
    const saved = raw.patrols?.find((p) => p.id === "warden-pursuit");
    const base = initialPatrols().find((p) => p.kind === "bandits");
    result.patrols.push({
      ...base,
      id: "warden-pursuit",
      name: "Warden pursuit",
      x: Number.isFinite(saved?.x)
        ? Math.max(12, Math.min(WORLD.width - 12, saved.x))
        : Math.max(12, result.position.x - 100),
      y: Number.isFinite(saved?.y)
        ? Math.max(18, Math.min(WORLD.height - 18, saved.y))
        : result.position.y,
      cleared: saved?.cleared === true,
    });
  }
  refreshStrongholds(result);
  discoverNearby(result, false);
  result.party = result.party.map((p, id) => ({
    ...base.party[0],
    ...p,
    id,
    armor: p.armor || 0,
    weapon: p.weapon || 0,
    fatigue: Number.isFinite(p.fatigue)
      ? Math.max(0, Math.min(100, p.fatigue))
      : 0,
    ...avatarAppearance(p),
    personalQuest: {
      stage: Number.isInteger(p.personalQuest?.stage)
        ? Math.max(0, Math.min(3, p.personalQuest.stage))
        : p.storyComplete === "supported"
          ? 1
          : 0,
      outcome: ["shared", "claimed", "reconciled"].includes(
        p.personalQuest?.outcome,
      )
        ? p.personalQuest.outcome
        : null,
    },
    personalPerk: [
      "linebreaker",
      "guardian",
      "keeneye",
      "watchful",
      "arcanefocus",
      "restorer",
    ].includes(p.personalPerk)
      ? p.personalPerk
      : null,
    spellSchool:
      spellSchools.some((v) => v.id === p.spellSchool && v.role === p.role) &&
      p.level >= 2
        ? p.spellSchool
        : null,
    spellSpent: Object.fromEntries(
      [1, 2].map((level) => [
        level,
        Number.isInteger(p.spellSpent?.[level])
          ? Math.max(0, Math.min(9, p.spellSpent[level]))
          : 0,
      ]),
    ),
    name: safeCompanyName(p.name, `Companion ${id + 1}`, 18),
    coat: /^#[0-9a-f]{6}$/i.test(p.coat || "") ? p.coat : undefined,
    profession: p.profession || "Cook",
    professionXP: p.professionXP || 0,
    professionXPBy: Object.fromEntries(
      Object.entries(p.professionXPBy || {}).filter(
        ([k, v]) => professions.includes(k) && Number.isFinite(v) && v >= 0,
      ),
    ),
    resolve: Number.isFinite(p.resolve)
      ? Math.max(0, Math.min(100, p.resolve))
      : 65,
    traits: Array.isArray(p.traits)
      ? [
          ...new Set(
            p.traits.filter((id) => companionTraits.some((t) => t.id === id)),
          ),
        ].slice(0, 2)
      : p.traits === undefined && base.party[id]?.name === p.name
        ? [...base.party[id].traits]
        : [],
    talent: talentsFor(p).some((t) => t.id === p.talent) ? p.talent : null,
    advancedSkill:
      p.level >= 4 &&
      talentsFor(p).some((t) => t.id === p.talent) &&
      advancedSkillsFor(p).some((skill) => skill.id === p.advancedSkill)
        ? p.advancedSkill
        : null,
  }));
  const ids = new Set();
  result.gear = (Array.isArray(raw.gear) ? raw.gear : [])
    .filter((item) => {
      if (
        !item ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        item.id > 1e9 ||
        ids.has(item.id) ||
        !equipmentCatalog.some((template) => template.id === item.template)
      )
        return false;
      ids.add(item.id);
      return true;
    })
    .map((item) => ({
      id: item.id,
      template: item.template,
      durability: Number.isFinite(item.durability)
        ? Math.max(0, Math.min(100, Math.floor(item.durability)))
        : 100,
    }));
  result.nextGearId = result.gear.reduce(
    (max, item) => Math.max(max, item.id + 1),
    1,
  );
  const assigned = new Set();
  for (const p of result.party) {
    const saved = p.equipment;
    p.equipment = { weapon: null, armor: null, shield: null, helmet: null };
    for (const slot of equipmentSlots) {
      const item = result.gear.find((item) => item.id === saved?.[slot]);
      const template =
        item &&
        equipmentCatalog.find((template) => template.id === item.template);
      if (
        template &&
        template.slot === slot &&
        canEquipEquipment(result, template, p) &&
        !assigned.has(item.id)
      ) {
        p.equipment[slot] = item.id;
        assigned.add(item.id);
      }
    }
  }
  // Old saves retain company progression but return to the map for the new combat rules.
  result.timeOfDay =
    Number.isFinite(raw.timeOfDay) && raw.timeOfDay >= 0 && raw.timeOfDay < 24
      ? raw.timeOfDay
      : 8;
  result.hungerDays =
    Number.isInteger(raw.hungerDays) && raw.hungerDays >= 0
      ? Math.min(1000, raw.hungerDays)
      : 0;
  result.wageDebt =
    Number.isInteger(raw.wageDebt) && raw.wageDebt >= 0
      ? Math.min(1e9, raw.wageDebt)
      : 0;
  result.campOpen = false;
  result.campUpgrades = Object.fromEntries(
    campStructures.map((building) => [
      building.id,
      Number.isInteger(raw.campUpgrades?.[building.id])
        ? Math.max(0, Math.min(building.max, raw.campUpgrades[building.id]))
        : 0,
    ]),
  );
  for (const p of result.party) {
    p.dead = !!p.dead;
    if (p.dead) {
      p.hp = 0;
      p.equipment = { weapon: null, armor: null, shield: null, helmet: null };
    }
  }
  result.bonds = {};
  for (let a = 0; a < result.party.length; a++)
    for (let b = a + 1; b < result.party.length; b++) {
      const key = bondKey(a, b),
        value = raw.bonds?.[key];
      if (
        !result.party[a].dead &&
        !result.party[b].dead &&
        Number.isFinite(value)
      )
        result.bonds[key] = Math.max(0, Math.min(100, Math.floor(value)));
    }
  result.lastBondRestDay = Number.isInteger(raw.lastBondRestDay)
    ? Math.max(-1, Math.min(result.day, raw.lastBondRestDay))
    : -1;
  result.lastConversationDay = Number.isInteger(raw.lastConversationDay)
    ? Math.max(-1, Math.min(result.day, raw.lastConversationDay))
    : -1;
  result.recruitSerial = Number.isInteger(raw.recruitSerial)
    ? Math.max(0, Math.min(10000, raw.recruitSerial))
    : Math.max(0, result.party.length - 4);
  result.hiredRecruits = Array.isArray(raw.hiredRecruits)
    ? [
        ...new Set(
          raw.hiredRecruits.filter(
            (id) =>
              typeof id === "string" &&
              (/^(0|3|6)-(veteran|ranger)$/.test(id) ||
                /^(0|3|6)-faction-(guild|wardens|freefolk)$/.test(id) ||
                ["ember-wizard", "ember-cleric"].includes(id)),
          ),
        ),
      ]
    : [];
  result.wagon = {
    owned: raw.wagon?.owned === true,
    storage: Number.isInteger(raw.wagon?.storage)
      ? Math.max(0, Math.min(2, raw.wagon.storage))
      : 0,
    workbench: raw.wagon?.workbench === 1 ? 1 : 0,
    rails: raw.wagon?.rails === 1 ? 1 : 0,
    condition: Number.isFinite(raw.wagon?.condition)
      ? Math.max(0, Math.min(100, raw.wagon.condition))
      : 100,
  };
  if (!result.wagon.owned)
    result.wagon = {
      owned: false,
      storage: 0,
      workbench: 0,
      rails: 0,
      condition: 100,
    };
  result.cargo = Object.fromEntries(
    tradeGoods.map((g) => [
      g.id,
      Number.isInteger(raw.cargo?.[g.id])
        ? Math.max(0, Math.min(companyCargoCapacity(result), raw.cargo[g.id]))
        : 0,
    ]),
  );
  let cargoRoom = companyCargoCapacity(result);
  for (const good of tradeGoods) {
    result.cargo[good.id] = Math.min(result.cargo[good.id], cargoRoom);
    cargoRoom -= result.cargo[good.id];
  }
  result.reputation = Object.fromEntries(
    factions.map((f) => [
      f.id,
      Number.isFinite(raw.reputation?.[f.id])
        ? Math.max(-30, Math.min(30, Math.floor(raw.reputation[f.id])))
        : 0,
    ]),
  );
  result.markets = {};
  for (const id of Object.keys(regionalMarkets)) {
    const market = raw.markets?.[id];
    if (
      market &&
      Number.isInteger(market.epoch) &&
      market.epoch >= 0 &&
      regionalMarkets[id].shortages.includes(market.shortage)
    )
      result.markets[id] = {
        epoch: market.epoch,
        shortage: market.shortage,
        demand: Number.isInteger(market.demand)
          ? Math.max(0, Math.min(8, market.demand))
          : 8,
        stock: Object.fromEntries(
          tradeGoods.map((g) => [
            g.id,
            Number.isInteger(market.stock?.[g.id])
              ? Math.max(0, Math.min(100, market.stock[g.id]))
              : 0,
          ]),
        ),
      };
  }
  result.stories = {};
  for (const story of regionalStories) {
    const saved = raw.stories?.[story.id];
    if (saved && ["active", "completed"].includes(saved.status))
      result.stories[story.id] = {
        status: saved.status,
        branch: story.choices.some((c) => c.id === saved.branch)
          ? saved.branch
          : null,
      };
  }
  if (result.contract?.kind === "story") {
    const c = result.contract,
      story = regionalStories.find((q) => q.id === c.storyId),
      progress = story && result.stories[story.id],
      choice = story?.choices.find((q) => q.id === progress?.branch);
    if (
      !story ||
      progress?.status !== "active" ||
      !["investigate", "battle", "return"].includes(c.phase) ||
      (c.phase !== "investigate" && !choice) ||
      (c.phase === "battle" && !choice?.battle)
    ) {
      result.contract = null;
      result.battle = null;
      if (progress?.status === "active") delete result.stories[story.id];
    } else
      result.contract = {
        kind: "story",
        storyId: story.id,
        name: story.name,
        issuer: story.issuer,
        phase: c.phase,
        target: c.phase === "return" ? story.issuer : story.target,
        tier: choice?.tier || 1,
        reward:
          c.phase === "battle" ? 40 : c.phase === "return" ? choice.reward : 0,
      };
  }
  for (const story of regionalStories)
    if (
      result.stories[story.id]?.status === "active" &&
      result.contract?.storyId !== story.id
    )
      delete result.stories[story.id];
  if (
    result.event?.kind === "story" &&
    (result.contract?.storyId !== result.event.storyId ||
      result.contract.phase !== "investigate")
  )
    result.event = null;
  result.bounties = {};
  for (const boss of namedAdversaries) {
    const day = raw.bounties?.[boss.id]?.day;
    if (Number.isInteger(day) && day > 0 && day <= result.day)
      result.bounties[boss.id] = { day };
  }
  if (result.contract?.kind === "boss") {
    const boss = namedAdversaries.find(
      (boss) => boss.id === result.contract.bossId,
    );
    if (!boss || result.bounties[boss.id]) {
      result.contract = null;
      result.battle = null;
    } else
      result.contract = {
        kind: "boss",
        bossId: boss.id,
        name: `Bounty: ${boss.name}`,
        issuer: boss.issuer,
        target: boss.target,
        reward: boss.reward,
        tier: boss.tier,
      };
  }
  if (
    result.battle?.bossId &&
    (result.contract?.kind !== "boss" ||
      result.contract.bossId !== result.battle.bossId ||
      !namedAdversaries.some((boss) => boss.id === result.battle.bossId))
  )
    result.battle = null;
  if (result.battle?.danger) {
    const threat = result.battle.danger;
    if (
      result.battle.bossId !== "maela" ||
      threat.source !== "maela" ||
      !Number.isInteger(threat.firesAt) ||
      threat.firesAt < result.battle.turn ||
      !Array.isArray(threat.tiles)
    )
      result.battle.danger = null;
    else
      result.battle.danger = {
        source: "maela",
        firesAt: Math.min(result.battle.turn + 1, threat.firesAt),
        tiles: threat.tiles
          .filter(
            (tile) =>
              tile &&
              Number.isInteger(tile.x) &&
              Number.isInteger(tile.y) &&
              tile.x >= 0 &&
              tile.x < 9 &&
              tile.y >= 0 &&
              tile.y < 7,
          )
          .slice(0, 5)
          .map((tile) => ({ x: tile.x, y: tile.y })),
      };
  }
  result.encounterSerial =
    Number.isSafeInteger(raw.encounterSerial) && raw.encounterSerial >= 0
      ? Math.min(1e9, raw.encounterSerial)
      : 0;
  result.lastTrailEncounter = trailEncounters.some(
    (e) => e.id === raw.lastTrailEncounter,
  )
    ? raw.lastTrailEncounter
    : null;
  result.trailLedger = {};
  for (const region of ["Greyhaven marches", "Salt coast", "Ember frontier"]) {
    const day = raw.trailLedger?.[region];
    if (Number.isInteger(day) && day > 0 && day <= result.day)
      result.trailLedger[region] = day;
  }
  result.encounterJournal = (
    Array.isArray(raw.encounterJournal) ? raw.encounterJournal : []
  )
    .filter(
      (entry) =>
        entry &&
        typeof entry.id === "string" &&
        entry.id.length <= 100 &&
        Number.isInteger(entry.day) &&
        entry.day > 0 &&
        entry.day <= result.day &&
        ["Greyhaven marches", "Salt coast", "Ember frontier"].includes(
          entry.region,
        ) &&
        trailEncounters.some(
          (e) =>
            e.id === entry.templateId &&
            (entry.choiceId === "leave" ||
              e.choices.some((c) => c.id === entry.choiceId)),
        ),
    )
    .slice(0, 12)
    .map((entry) => ({
      id: entry.id,
      templateId: entry.templateId,
      choiceId: entry.choiceId,
      day: entry.day,
      region: entry.region,
    }));
  if (result.event?.kind === "trail") {
    const template = trailEncounters.find(
        (e) => e.id === result.event.templateId,
      ),
      event = result.event;
    if (
      !template ||
      typeof event.id !== "string" ||
      event.id.length > 100 ||
      !["Greyhaven marches", "Salt coast", "Ember frontier"].includes(
        event.region,
      ) ||
      result.encounterJournal.some((entry) => entry.id === event.id)
    )
      result.event = null;
    else
      result.event = {
        kind: "trail",
        id: event.id,
        templateId: template.id,
        region: event.region,
        title: template.title,
        text: template.text,
      };
  }
  result.campJobs = {};
  for (const role of campRoles) {
    const id = raw.campJobs?.[role.id];
    if (Number.isInteger(id) && canAssignCampJob(result, role.id, id))
      result.campJobs[role.id] = id;
  }
  result.lastCampWorkDay = Number.isInteger(raw.lastCampWorkDay)
    ? Math.max(-1, Math.min(result.day, raw.lastCampWorkDay))
    : -1;
  result.preparedValor = raw.preparedValor === 1 ? 1 : 0;
  if (raw.version === 1) result.battle = null;
  if (result.battle) {
    result.battle.openingAmbush = raw.battle.openingAmbush === true;
    result.battle.layoutId = battleLayouts.some(
      (layout) => layout.id === result.battle.layoutId,
    )
      ? result.battle.layoutId
      : "legacy";
    result.battle.valor = Number.isFinite(result.battle.valor)
      ? Math.max(0, Math.min(5, result.battle.valor))
      : 3;
    result.battle.units.forEach(
      (u) =>
        (u.cooldown = Number.isFinite(u.cooldown)
          ? Math.max(0, u.cooldown)
          : 0),
    );
  }
  restoreExpansionState(result, raw);
  restoreRealm(result, raw);
  restoreExpedition(result, raw);
  restoreOdyssey(result, raw);
  restoreChronicle(result, raw);
  restoreArcana(result, raw);
  restoreFieldwork(result, raw);
  restoreFieldLife(result, raw);
  updateCampaign(result);
  return result;
}
export function attackPower(s, p) {
  return (
    p.damage +
    (p.weapon || 0) +
    fantasyAttackBonus(s, p) +
    (equippedItem(s, p, "weapon")?.bonus || 0) +
    (p.talent === "duelist" ? 2 : 0) +
    (s.research.includes("steel") ? 2 : 0) +
    (s.morale >= 85 ? 1 : 0) -
    (p.injury ? 1 : 0) -
    (p.wound?.type === "eye" ? 2 : 0) -
    fatiguePenalty(p) -
    ((p.resolve ?? 65) < 25 ? 1 : 0) +
    (hasTrait(p, "mercenary") ? 1 : 0) +
    bondSupport(s, p) +
    weaponPositionBonus(s, p) +
    (p.personalPerk === "linebreaker" ? 1 : 0) +
    (p.race === "orc" && p.role !== "Archer" && !isCaster(p) ? 1 : 0)
  );
}
export function guard(s, id) {
  const u = s.battle?.units.find((u) => u.id === id);
  if (!u || u.acted || s.party[id].hp <= 0) return false;
  u.guard = true;
  u.acted = true;
  s.battle.valor = Math.min(
    5,
    (s.battle.valor ?? 3) + (gearPerk(s, s.party[id], "inspiring") ? 2 : 1),
  );
  note(s, `${s.party[id].name} braces: incoming damage reduced this round.`);
  return true;
}
export function train(s, id, kind) {
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    s.battle ||
    s.event ||
    p.points < 1 ||
    !["strength", "vitality"].includes(kind)
  )
    return false;
  p.points--;
  if (kind === "strength") p.damage++;
  else {
    p.max += 5;
    p.hp += 5;
  }
  note(s, `${p.name} trained ${kind}.`);
  return true;
}
export function recruit(s, offerId = null) {
  const offer = recruitmentOffers(s).find((offer) =>
    offerId === null ? offer.standard : offer.id === offerId,
  );
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    !offer ||
    s.gold < offer.cost ||
    livingParty(s).length >= 6
  )
    return false;
  const vacancy = s.party.findIndex((p) => p.dead),
    id = vacancy >= 0 ? vacancy : s.party.length;
  if (s.fieldwork?.bannerBearer === id) s.fieldwork.bannerBearer = null;
  s.gold -= offer.cost;
  const companion = {
    id,
    name: offer.name,
    role: offer.role,
    max: offer.max,
    hp: offer.max,
    damage: isCaster(offer) ? founderRoles[offer.role].damage : 6,
    level: 1,
    xp: 0,
    points: 0,
    injury: false,
    dead: false,
    fatigue: 0,
    resolve: 65,
    traits: [...offer.traits],
    race: offer.race || "human",
    personalQuest: { stage: 0, outcome: null },
    spellSpent: { 1: 0, 2: 0 },
    knownSpells: [],
    preparedSpells: isCaster(offer)
      ? spellCatalogFor(offer)
          .slice(0, 3)
          .map((v) => v.id)
      : null,
    armor: 0,
    weapon: 0,
    profession: offer.profession,
    professionXP: 0,
    professionXPBy: {},
    talent: null,
    advancedSkill: null,
    equipment: { weapon: null, armor: null, shield: null, helmet: null },
  };
  for (const other of s.party) delete s.bonds[bondKey(id, other.id)];
  delete s.realm.lineage[id];
  delete s.expedition.careers[id];
  delete s.odyssey.journeys[id];
  if (s.party[id]) s.party[id].wound = null;
  if (vacancy >= 0) s.party[id] = companion;
  else s.party.push(companion);
  s.recruitSerial++;
  if (!offer.standard) s.hiredRecruits.push(offer.id);
  note(
    s,
    `${companion.name} joins the company. ${companionWages(companion)} daily crowns; ${traitSummary(companion)}.`,
  );
  return true;
}
export const recipes = [
  {
    id: "blade",
    name: "Honed weapon",
    ore: 3,
    wood: 1,
    desc: "+2 attack for one companion",
  },
  {
    id: "armor",
    name: "Reinforced armor",
    ore: 4,
    wood: 0,
    desc: "Absorb 1 damage per hit",
  },
  {
    id: "medicine",
    name: "Healing poultice",
    ore: 0,
    wood: 0,
    herbs: 3,
    desc: "Heal 15 health and cure injury",
  },
  {
    id: "meal",
    name: "Hearty provisions",
    ore: 0,
    wood: 2,
    herbs: 1,
    desc: "Gain 8 rations",
  },
];
export function craft(s, id, target = 0) {
  const r = recipes.find((r) => r.id === id),
    p = s.party[target],
    plan = craftPlan(s, id);
  if (
    !r ||
    !p ||
    p.dead ||
    !plan.maker ||
    s.battle ||
    s.event ||
    Object.entries(plan.cost).some(([k, v]) => s.inventory[k] < v) ||
    (id === "blade" && p.weapon >= 4) ||
    (id === "armor" && p.armor >= 3)
  )
    return false;
  for (const [key, cost] of Object.entries(plan.cost)) s.inventory[key] -= cost;
  if (id === "blade") p.weapon = Math.min(4, p.weapon + 2);
  if (id === "armor") p.armor++;
  if (id === "medicine")
    s.inventory.medicine += 1 + Math.floor(professionRank(plan.maker) / 2);
  if (id === "meal") s.food += 8 + professionRank(plan.maker) * 2;
  practice(s, plan.maker, 1);
  note(
    s,
    `Crafted ${r.name}${["blade", "armor"].includes(id) ? ` for ${p.name}` : ""}.`,
  );
  return true;
}
export function heal(s, id) {
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    s.battle ||
    s.event ||
    s.inventory.medicine < 1 ||
    (p.hp === p.max && !p.injury && !p.wound)
  )
    return false;
  s.inventory.medicine--;
  if (p.wound) {
    p.wound.treated = true;
    p.wound.remaining = Math.min(p.wound.remaining, 24);
  }
  p.hp = Math.min(p.max, p.hp + healAmount(s));
  const herbalist = professional(s, "Herbalist");
  if (herbalist) {
    practice(s, herbalist, 1);
    if (herbalist.id !== p.id)
      changeBond(
        s,
        herbalist.id,
        p.id,
        hasTrait(herbalist, "compassionate") ? 3 : 2,
      );
  }
  changeResolve(p, 3);
  p.injury = false;
  note(s, `Treated ${p.name} with a poultice.`);
  return true;
}
export function explore(s) {
  if ([4, 9, 10].includes(s.location)) return false;
  return awardExploration(s);
}
function awardExploration(s) {
  if (
    s.location < 0 ||
    s.battle ||
    s.event ||
    places[s.location]?.type === "town" ||
    s.explored.includes(s.location)
  )
    return false;
  const type = places[s.location]?.type;
  s.explored.push(s.location);
  s.knowledge++;
  s.inventory.ore += type === "mine" ? 6 + professionBonus(s, "Miner") * 2 : 2;
  s.inventory.wood += type === "forest" ? 5 : 1;
  s.inventory.herbs +=
    type === "forest" ? 4 + professionBonus(s, "Herbalist") * 2 : 1;
  if (type === "cache") {
    s.gold += 30;
    s.inventory.medicine++;
    note(s, "Recovered a hidden stash: 30 crowns and medicine.");
  }
  for (const p of s.party)
    if (p.profession === (type === "mine" ? "Miner" : "Herbalist"))
      if (p.hp > 0) practice(s, p, 1);
  note(
    s,
    `Explored ${places[s.location].name}. Discovered knowledge and gathered crafting materials.`,
  );
  resolveRumors(s);
  return true;
}
export function forage(s) {
  if (s.battle || s.event || companyLost(s)) return false;
  const amount = forageAmount(s),
    key = `${s.day}-${s.location}`;
  s.food += amount;
  s.forageLedger ||= {};
  s.forageLedger[key] = Math.min(24, (s.forageLedger[key] || 0) + 1);
  for (const old of Object.keys(s.forageLedger))
    if (Number(old.split("-")[0]) < s.day - 1) delete s.forageLedger[old];
  const herbalist = professional(s, "Herbalist");
  if (herbalist) {
    s.inventory.herbs += 1 + professionRank(herbalist);
    practice(s, herbalist, 1);
  }
  const regional = regionalForage(s);
  if (regional && s.forageLedger[key] === 1)
    s.inventory[regional.resource] += regional.amount;
  spendHours(s, 6);
  s.morale = Math.max(0, s.morale - 3);
  note(
    s,
    `Gathered ${amount} rations in six hours. Repeated gathering here today yields less.`,
  );
  return true;
}
export function resolveEvent(s, choice) {
  if (s.event?.kind === "trail") return resolveTrailEncounter(s, choice);
  if (s.event?.kind === "story") return chooseStory(s, choice);
  if (s.event?.kind === "camp") {
    if (
      !["search", "leave"].includes(choice) ||
      (choice === "search" && s.food < 2)
    )
      return false;
    if (choice === "search") {
      s.food -= 2;
      s.inventory.wood += 3;
      s.inventory.herbs += 2;
      s.knowledge++;
      note(
        s,
        "Searched the abandoned camp: recovered herbs, wood, and knowledge.",
      );
    } else note(s, "Passed the abandoned camp.");
    s.event = null;
    return true;
  }
  if (s.event?.kind === "storm") {
    if (!["shelter", "push", "leave"].includes(choice)) return false;
    if (choice === "shelter") {
      spendHours(s, 24);
      note(s, "Waited a day for the storm to pass; daily upkeep settled.");
    } else {
      s.morale = Math.max(0, s.morale - 10);
      for (const p of s.party) if (p.hp > 0) p.hp = Math.max(1, p.hp - 3);
      note(s, "Pressed through the storm: lost morale and health.");
    }
    s.event = null;
    return true;
  }

  if (!s.event || !["help", "trade", "leave"].includes(choice)) return false;
  if (choice === "help") {
    if (s.inventory.medicine < 1) return false;
    s.inventory.medicine--;
    s.knowledge++;
    s.renown += 3;
    s.morale = Math.min(100, s.morale + 5);
    note(s, "The courier survives. His route notes teach you something new.");
  }
  if (choice === "trade") {
    s.gold += 12;
    s.morale = Math.max(0, s.morale - 8);
    note(s, "Took 12 crowns to leave the courier. The company disapproves.");
  }
  if (choice === "leave") note(s, "Left the strangers behind.");
  s.event = null;
  return true;
}
export const companyRanks = [
  { name: "Greenhands", renown: 0 },
  { name: "Proven company", renown: 5 },
  { name: "Veterans", renown: 15 },
  { name: "Famed company", renown: 30 },
];
export function companyStanding(s) {
  const rank =
    companyRanks.findLast((r) => s.renown >= r.renown) || companyRanks[0];
  return {
    ...rank,
    next: companyRanks[companyRanks.indexOf(rank) + 1] || null,
  };
}
export function contractDifficulty(c) {
  const tier = [1, 2, 3].includes(c?.tier) ? c.tier : 1;
  return {
    tier,
    label: ["Standard", "Dangerous", "Elite"][tier - 1],
    enemies: tier + 2,
    xp: 35 + (tier - 1) * 10,
    knowledge: tier + 1,
    salvage: tier + 1,
    renown: tier * 5,
  };
}
const villageJobs = {
  0: [
    {
      name: "Wolves in human clothing",
      target: 1,
      reward: 65,
      kind: "battle",
      tier: 1,
      minRenown: 0,
    },
    {
      name: "The barrow road",
      target: 2,
      reward: 85,
      kind: "battle",
      tier: 1,
      minRenown: 0,
    },
    {
      name: "Supplies for Saltbridge",
      target: 3,
      reward: 45,
      kind: "delivery",
      minRenown: 0,
    },
    {
      name: "Silence the watchtower",
      target: 5,
      reward: 130,
      kind: "battle",
      tier: 2,
      minRenown: 5,
    },
  ],
  3: [
    {
      name: "Provisions for Greyhaven",
      target: 0,
      reward: 45,
      kind: "delivery",
      minRenown: 0,
    },
    {
      name: "The chapel smugglers",
      target: 8,
      reward: 90,
      kind: "battle",
      tier: 1,
      minRenown: 0,
    },
    {
      name: "Emberfall relief",
      target: 6,
      reward: 150,
      kind: "delivery",
      minRenown: 5,
    },
    {
      name: "Ambush in Whispering Grove",
      target: 7,
      reward: 145,
      kind: "battle",
      tier: 2,
      minRenown: 5,
    },
  ],
  6: [
    {
      name: "Supplies for Saltbridge",
      target: 3,
      reward: 150,
      kind: "delivery",
      minRenown: 0,
    },
    {
      name: "Reclaim Redstone Quarry",
      target: 9,
      reward: 155,
      kind: "battle",
      tier: 2,
      minRenown: 5,
    },
    {
      name: "A crown in the dirt",
      target: 11,
      reward: 230,
      kind: "battle",
      tier: 3,
      minRenown: 15,
    },
    {
      name: "The Cinder warband",
      target: 7,
      reward: 290,
      kind: "battle",
      tier: 3,
      minRenown: 30,
    },
  ],
};
export function contracts(s) {
  if (
    places[s.location]?.type !== "town" ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return [];
  return (villageJobs[s.location] || []).map((c) => ({
    ...c,
    issuer: s.location,
  }));
}
export function accept(s, index) {
  if (townAccessLock(s)) return false;
  const c = contracts(s)[index];
  if (
    !c ||
    s.renown < c.minRenown ||
    s.contract ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town"
  )
    return false;
  s.contract = { ...c };
  note(s, `Accepted: ${c.name}.`);
  return true;
}
export function deliver(s) {
  if (
    s.battle ||
    s.event ||
    s.contract?.kind !== "delivery" ||
    s.location !== s.contract.target ||
    s.food < 5
  )
    return false;
  s.food -= 5;
  changeReputation(s, "guild", 2);
  s.gold += s.contract.reward;
  s.knowledge++;
  s.renown += 2;
  s.completed++;
  note(
    s,
    `Supplies delivered. Earned ${s.contract.reward} crowns and 1 knowledge.`,
  );
  s.contract = null;
  return true;
}
export function buy(s, item) {
  if (townAccessLock(s)) return false;
  const offer = supplyOffer(s, item);
  if (
    !offer ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    s.gold < offer.price
  )
    return false;
  s.gold -= offer.price;
  if (item === "food") s.food += offer.quantity;
  else s.inventory[item] += offer.quantity;
  note(s, `Bought ${offer.quantity} ${item} for ${offer.price} crowns.`);
  return true;
}

// Continuous overworld navigation. Landmarks grant services within their entry radius;
// they do not constrain the player's route or destination.
export function entryRadius(place) {
  return place?.type === "town" ? 64 : 54;
}
export function nearbyPlace(position) {
  let index = -1,
    nearest = Infinity;
  places.forEach((place, i) => {
    const distance = Math.hypot(place.x - position.x, place.y - position.y);
    if (distance <= entryRadius(place) && distance < nearest) {
      index = i;
      nearest = distance;
    }
  });
  return index;
}
export function moveTo(s, x, y) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  )
    return false;
  const point = {
    x: Math.max(12, Math.min(WORLD.width - 12, x)),
    y: Math.max(18, Math.min(WORLD.height - 18, y)),
  };
  if (Math.hypot(point.x - s.position.x, point.y - s.position.y) < 1)
    return false;
  s.destination = point;
  return true;
}
export function stopMovement(s) {
  s.destination = null;
}
export function terrainAt(p) {
  const riverX = 475 + Math.sin(p.y / 65) * 38;
  if (Math.abs(p.x - riverX) < 14) return "shallows";
  if (p.y < 150 && (p.x < 275 || p.x > 450)) return "highlands";
  if (
    (p.x > 275 && p.x < 395 && p.y < 230) ||
    (p.x > 870 && p.x < 1150 && p.y < 400)
  )
    return "forest";
  return "grassland";
}
export function advanceMovement(s, seconds) {
  if (s.fieldwork?.report) return { changed: false, arrived: false };
  if (
    !s.destination ||
    s.campOpen ||
    companyLost(s) ||
    s.battle ||
    s.event ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    return { changed: false, arrived: false };
  let budget =
      seconds *
      (terrainAt(s.position) === "shallows" ? 36 : 70) *
      (s.stealth.active ? 0.55 : 1),
    changed = false,
    distanceTravelled = 0,
    arrived = false;
  while (budget > 0 && s.destination) {
    const dx = s.destination.x - s.position.x,
      dy = s.destination.y - s.position.y,
      length = Math.hypot(dx, dy);
    if (length < 0.01) {
      s.destination = null;
      arrived = true;
      break;
    }
    const amount = Math.min(budget, length, 12);
    s.fieldLife.heading = Math.atan2(dy, dx);
    s.position.x += (dx / length) * amount;
    s.position.y += (dy / length) * amount;
    s.walked = (s.walked + amount) % 160;
    discoverNearby(s);
    budget -= amount;
    changed = true;
    distanceTravelled += amount;
    // Keep sufficient history for followers to trace turns rather than teleport.
    const previous = s.trail.at(-1);
    if (
      !previous ||
      Math.hypot(previous.x - s.position.x, previous.y - s.position.y) >= 3
    )
      s.trail.push({ ...s.position });
    s.trail = s.trail.slice(-128);
    const old = s.location;
    s.location = nearbyPlace(s.position);
    if (old !== s.location && s.location >= 0)
      note(s, `Reached ${places[s.location].name}.`);
    if (amount >= length - 0.001) {
      s.destination = null;
      arrived = true;
    }
  }
  updateCampaign(s);
  updateCaravanEscort(s);
  if (changed) {
    checkWagonTravel(s, distanceTravelled * 0.6);
    observeClues(s);
    checkTravelConversation(s, distanceTravelled * 0.6);
    checkRegionalTravel(s, distanceTravelled * 0.6);
  }
  return { changed, arrived };
}
export function partyPositions(s) {
  return s.party.map((p, index) => {
    const rank = companyOrder(s).indexOf(p.id);
    if (rank <= 0) return { ...s.position };
    let remaining = rank * 17,
      current = s.position;
    for (let i = s.trail.length - 1; i >= 0; i--) {
      const next = s.trail[i],
        distance = Math.hypot(current.x - next.x, current.y - next.y);
      if (distance >= remaining && distance > 0)
        return {
          x: current.x + ((next.x - current.x) * remaining) / distance,
          y: current.y + ((next.y - current.y) * remaining) / distance,
        };
      remaining -= distance;
      current = next;
    }
    return { x: Math.max(12, current.x - remaining), y: current.y };
  });
}

export function initialChart() {
  const cells = [];
  const cols = Math.ceil(WORLD.width / WORLD.cell);
  for (let y = 0; y < Math.ceil(WORLD.height / WORLD.cell); y++)
    for (let x = 0; x < cols; x++)
      if (Math.hypot(x * 64 + 32 - 170, y * 64 + 32 - 280) <= 140)
        cells.push(y * cols + x);
  return cells;
}
export function discoverNearby(s, reward = true) {
  const radius =
      (s.research.includes("scouting") ? 210 : 140) +
      (s.campUpgrades.watchpost ? 40 : 0) +
      (travelWorker(s, "scout") ? 30 : 0) -
      weatherInfo(s).visibility,
    known = new Set(s.charted),
    cols = Math.ceil(WORLD.width / 64);
  const cx = Math.floor(s.position.x / 64),
    cy = Math.floor(s.position.y / 64),
    reach = Math.ceil(radius / 64);
  for (
    let y = Math.max(0, cy - reach);
    y <= Math.min(Math.ceil(WORLD.height / 64) - 1, cy + reach);
    y++
  )
    for (
      let x = Math.max(0, cx - reach);
      x <= Math.min(cols - 1, cx + reach);
      x++
    )
      if (
        Math.hypot(x * 64 + 32 - s.position.x, y * 64 + 32 - s.position.y) <=
        radius
      )
        known.add(y * cols + x);
  s.charted = [...known];
  places.forEach((p, i) => {
    if (
      !s.discovered.includes(i) &&
      Math.hypot(p.x - s.position.x, p.y - s.position.y) <= radius
    ) {
      s.discovered.push(i);
      if (reward) {
        s.knowledge++;
        note(s, `Discovered ${p.name}. Gained 1 knowledge.`);
      }
    }
  });
}
export function initialPatrols() {
  return [
    {
      id: "caravan",
      name: "Copper Road caravan",
      kind: "merchant",
      caravanType: "mixed",
      cargo: { grain: 4, cloth: 2, salt: 3, iron: 1 },
      gearStock: [],
      foodStock: 30,
      x: 285,
      y: 355,
      waypoint: 0,
      route: [
        { x: 420, y: 380 },
        { x: 280, y: 470 },
        { x: 240, y: 340 },
      ],
      cleared: false,
    },
    ...[
      {
        id: "wheat-caravan",
        name: "Golden Sheaf wagon",
        caravanType: "wheat",
        x: 640,
        y: 470,
        cargo: { grain: 12, cloth: 0, salt: 0, iron: 0 },
        gearStock: [],
        foodStock: 30,
      },
      {
        id: "armor-caravan",
        name: "Ironbound armory wagon",
        caravanType: "armor",
        x: 1110,
        y: 535,
        cargo: { grain: 0, cloth: 0, salt: 0, iron: 6 },
        gearStock: ["armor-1", "armor-2", "shield-1", "helmet-1"],
        foodStock: 10,
      },
      {
        id: "cloth-caravan",
        name: "Silk Road wagon",
        caravanType: "cloth",
        x: 720,
        y: 740,
        cargo: { grain: 0, cloth: 10, salt: 3, iron: 0 },
        gearStock: [],
        foodStock: 10,
      },
    ].map((p) => ({
      ...p,
      kind: "merchant",
      waypoint: 0,
      cleared: false,
      route: [
        { x: p.x + 85, y: p.y - 45 },
        { x: p.x - 80, y: p.y + 40 },
        { x: p.x, y: p.y },
      ],
    })),
    ...[
      {
        id: "goblin-patrol",
        name: "Bramble goblins",
        enemyFamily: "goblin",
        x: 660,
        y: 205,
      },
      {
        id: "bone-patrol",
        name: "Barrow bone sentries",
        enemyFamily: "skeleton",
        x: 790,
        y: 160,
      },
      {
        id: "mage-patrol",
        name: "Outcast spellbinders",
        enemyFamily: "mage",
        x: 1280,
        y: 630,
      },
    ].map((p) => ({
      ...p,
      kind: "fantasy",
      waypoint: 0,
      cleared: false,
      route: [
        { x: p.x + 60, y: p.y + 40 },
        { x: p.x - 60, y: p.y + 60 },
        { x: p.x, y: p.y },
      ],
    })),
    {
      id: "knives",
      name: "Red Knives",
      kind: "bandits",
      x: 860,
      y: 500,
      waypoint: 0,
      route: [
        { x: 1020, y: 460 },
        { x: 910, y: 680 },
        { x: 760, y: 550 },
      ],
      cleared: false,
    },
    {
      id: "wolves",
      name: "Cinder Wolves",
      kind: "bandits",
      x: 1230,
      y: 280,
      waypoint: 0,
      route: [
        { x: 1350, y: 380 },
        { x: 1230, y: 500 },
        { x: 1130, y: 330 },
      ],
      cleared: false,
    },
    {
      id: "pine-wolves",
      name: "Pinewatch wolf pack",
      kind: "wolves",
      x: 365,
      y: 205,
      waypoint: 0,
      route: [
        { x: 310, y: 210 },
        { x: 375, y: 175 },
        { x: 385, y: 220 },
      ],
      cleared: false,
    },
    {
      id: "grove-wolves",
      name: "Grove wolf pack",
      kind: "wolves",
      x: 980,
      y: 275,
      waypoint: 0,
      route: [
        { x: 910, y: 340 },
        { x: 1080, y: 310 },
        { x: 1000, y: 190 },
      ],
      cleared: false,
    },
    {
      id: "road-bandits",
      name: "Roadside cutthroats",
      kind: "bandits",
      x: 410,
      y: 440,
      waypoint: 0,
      route: [
        { x: 500, y: 475 },
        { x: 445, y: 540 },
        { x: 345, y: 455 },
      ],
      cleared: false,
    },
    {
      id: "briar-raiders",
      name: "Briarhide raiding party",
      kind: "bandits",
      x: 470,
      y: 490,
      waypoint: 0,
      route: [
        { x: 330, y: 420 },
        { x: 185, y: 480 },
        { x: 470, y: 490 },
      ],
      cleared: true,
    },
    ...newEnemyPatrols(),
  ];
}
export function advancePatrols(s, seconds) {
  if (s.fieldwork?.report) return false;
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    return false;
  refreshStrongholds(s);
  refreshFantasyStrongholds(s);
  updateWorldRoutes(s);
  refreshBorderPatrols(s);
  updateCampaign(s);
  updateRoadConflicts(s);
  updateCaravanEscort(s);
  for (const p of s.patrols.filter((p) => !p.cleared)) {
    if (
      p.raid ||
      s.patrols.some((m) => m.raid?.attackerId === p.id) ||
      s.caravanEscort?.patrolId === p.id
    )
      continue;
    if (
      p.kind === "wolves" &&
      ((p.fedUntil || 0) > s.day * 24 + s.timeOfDay ||
        s.fieldLife.wildlife.some((d) => d.id === p.ecologyTarget && d.hp > 0))
    )
      continue;
    p.activity =
      p.kind === "merchant"
        ? "Trading"
        : p.faction
          ? "Patrolling roads"
          : p.kind === "wolves"
            ? "Prowling"
            : "Searching for caravans";
    if (p.id === "warden-pursuit") {
      p.route = [{ ...s.position }];
      p.waypoint = 0;
    }
    let budget =
      Math.min(seconds, 5) *
      (p.kind === "merchant" ? 14 : p.kind === "wolves" ? 24 : 20);
    const playerDistance = Math.hypot(s.position.x - p.x, s.position.y - p.y);
    if (p.id === "warden-pursuit" && isHidden(s)) continue;
    const merchant =
      p.kind === "bandits" &&
      p.id !== "warden-pursuit" &&
      !p.faction &&
      !passageSafe(s, p) &&
      s.patrols.find(
        (m) =>
          m.kind === "merchant" &&
          !m.cleared &&
          !m.hostile &&
          !m.raid &&
          (m.raidCooldown || 0) <= s.day * 24 + s.timeOfDay &&
          Math.hypot(m.x - p.x, m.y - p.y) <= 100,
      );
    if (merchant) {
      p.activity = "Raiding caravan";
      const d = Math.hypot(merchant.x - p.x, merchant.y - p.y),
        step = Math.min(budget, Math.max(0, d - 30));
      if (d) {
        p.x += ((merchant.x - p.x) / d) * step;
        p.y += ((merchant.y - p.y) / d) * step;
      }
      beginCaravanRaid(s, merchant.id, p.id);
      continue;
    }

    if (
      p.kind !== "merchant" &&
      (!p.faction || p.hostile) &&
      !isHidden(s) &&
      !passageSafe(s, p) &&
      playerDistance < 90 &&
      (p.kind !== "wolves" || terrainAt(s.position) === "forest")
    ) {
      const chase = Math.min(budget, Math.max(0, playerDistance - 30));
      if (playerDistance > 0) {
        p.x += ((s.position.x - p.x) / playerDistance) * chase;
        p.y += ((s.position.y - p.y) / playerDistance) * chase;
      }
      continue;
    }
    while (budget > 0) {
      const t = p.route[p.waypoint],
        dx = t.x - p.x,
        dy = t.y - p.y,
        length = Math.hypot(dx, dy);
      if (length < 0.01) {
        p.waypoint = (p.waypoint + 1) % p.route.length;
        continue;
      }
      const step = Math.min(budget, length);
      p.x += (dx / length) * step;
      p.y += (dy / length) * step;
      budget -= step;
      if (step === length) p.waypoint = (p.waypoint + 1) % p.route.length;
    }
  }
  if (promptCaravanRaid(s)) return true;
  if (!isHidden(s)) {
    const hostile = s.patrols.find(
      (p) =>
        !p.cleared &&
        (!p.faction || p.hostile) &&
        ["bandits", "fantasy"].includes(p.kind) &&
        !passageSafe(s, p) &&
        Math.hypot(p.x - s.position.x, p.y - s.position.y) <= 36,
    );
    if (hostile) confrontPatrol(s, hostile.id);
  }
  return true;
}
export function nearbyPatrols(s) {
  return s.patrols.filter(
    (p) =>
      (!p.cleared || (p.wreck && !p.wreck.looted)) &&
      Math.hypot(p.x - s.position.x, p.y - s.position.y) <=
        (p.wreck ? 54 : p.raid ? 90 : 48),
  );
}
export function tradeCaravan(s, id) {
  const p = nearbyPatrols(s).find(
      (p) => p.id === id && p.kind === "merchant" && !p.hostile,
    ),
    price = Math.ceil(
      (s.research.includes("barter") ? 10 : 12) *
        (s.reputation.guild >= 10 ? 0.9 : s.reputation.guild <= -10 ? 1.25 : 1),
    );
  if (
    !p ||
    p.raid ||
    s.caravanEscort?.patrolId === id ||
    s.battle ||
    s.event ||
    s.campOpen ||
    p.foodStock < 10 ||
    s.gold < price
  )
    return false;
  s.gold -= price;
  s.food += 10;
  p.foodStock -= 10;
  note(s, `Bought 10 rations from ${p.name} for ${price} crowns.`);
  return true;
}
export function roadEvent(s) {
  if (s.day % 9 === 6)
    return {
      kind: "camp",
      title: "An abandoned camp",
      text: "Cold ashes, scattered packs, and no sign of their owners. Search for supplies, or keep moving.",
    };
  if (s.day % 9 === 0)
    return {
      kind: "storm",
      title: "Storm over the borderlands",
      text: "Rain lashes the company. Wait under cover, or press onward and risk exhausted companions.",
    };
  return {
    title: "Strangers in the wilderness",
    text: "A wounded courier asks for medicine. A merchant offers to buy your silence and leave him behind.",
  };
}

export const professions = ["Smith", "Miner", "Herbalist", "Cook", "Thief"];
export const rankNames = ["Novice", "Apprentice", "Journeyman", "Master"];
export function professionRank(p) {
  return p.professionXP >= 15
    ? 3
    : p.professionXP >= 8
      ? 2
      : p.professionXP >= 3
        ? 1
        : 0;
}
export function professional(s, name) {
  return (
    s.party
      .filter((p) => p.profession === name && !p.dead && p.hp > 0)
      .sort((a, b) => b.professionXP - a.professionXP)[0] || null
  );
}
export function professionBonus(s, name) {
  const p = professional(s, name);
  return p ? professionRank(p) : 0;
}
export function practice(s, p, amount) {
  const before = professionRank(p);
  p.professionXP += amount;
  p.professionXPBy ||= {};
  p.professionXPBy[p.profession] = p.professionXP;
  if (professionRank(p) > before)
    note(
      s,
      `${p.name} became a ${rankNames[professionRank(p)]} ${p.profession}.`,
    );
}
export function assignProfession(s, id, name) {
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    s.battle ||
    s.event ||
    !professions.includes(name) ||
    name === p.profession
  )
    return false;
  p.professionXPBy ||= {};
  p.professionXPBy[p.profession] = p.professionXP;
  p.profession = name;
  p.professionXP = p.professionXPBy[name] || 0;
  for (const role of campRoles) {
    if (
      s.campJobs[role.id] === p.id &&
      role.profession &&
      role.profession !== name
    )
      delete s.campJobs[role.id];
  }
  note(
    s,
    `${p.name} takes up ${name}. Previous profession experience is retained.`,
  );
  return true;
}
export function campCost(s) {
  const count = livingParty(s).length;
  const base = count
    ? Math.max(
        1,
        count +
          livingParty(s).filter((p) => hasTrait(p, "hearty")).length +
          livingParty(s).filter((p) => p.race === "orc").length -
          Math.min(2, professionBonus(s, "Cook")) -
          (s.research.includes("rations") ? 1 : 0) -
          (s.research.includes("preservation") ? 1 : 0) -
          (s.campUpgrades.cookpot || 0) -
          (s.campOpen && campWorker(s, "cook") ? 1 : 0) -
          (s.wagon.owned &&
          s.wagon.condition > 0 &&
          travelWorker(s, "quartermaster")
            ? 1
            : 0),
      ) + weatherInfo(s).food
    : 0;
  return count
    ? Math.max(
        1,
        Math.ceil(
          base *
            (s.difficulty === "forgiving"
              ? 0.8
              : s.difficulty === "veteran"
                ? 1.25
                : 1),
        ),
      )
    : 0;
}
export function healAmount(s) {
  return 15 + professionBonus(s, "Herbalist") * 3;
}
export function craftPlan(s, id) {
  const r = recipes.find((r) => r.id === id);
  if (!r) return { maker: null, cost: {} };
  const name =
      id === "medicine" ? "Herbalist" : id === "meal" ? "Cook" : "Smith",
    maker = professional(s, name),
    discount = maker && name === "Smith" ? professionRank(maker) : 0;
  return {
    maker,
    profession: name,
    cost: {
      ore: r.ore ? Math.max(1, r.ore - discount) : 0,
      wood: r.wood || 0,
      herbs: r.herbs || 0,
    },
  };
}
export function workSite(s) {
  const type = places[s.location]?.type,
    name = type === "mine" ? "Miner" : type === "forest" ? "Herbalist" : null,
    maker = professional(s, name);
  if (!maker || s.battle || s.event || s.food < 2) return false;
  s.destination = null;
  s.food -= 2;
  spendHours(s, 6);
  const yieldAmount = 3 + professionRank(maker) * 2;
  if (type === "mine") s.inventory.ore += yieldAmount;
  else {
    s.inventory.herbs += yieldAmount;
    s.inventory.wood += 2;
  }
  practice(s, maker, 2);
  note(
    s,
    `${maker.name} worked at ${places[s.location].name}: gained ${yieldAmount} ${type === "mine" ? "ore" : "herbs"} for 2 rations and six hours.`,
  );
  return true;
}
export const classSkills = {
  Swordswoman: {
    name: "Cleave",
    cost: 2,
    cooldown: 2,
    range: 1,
    bonus: 2,
    desc: "Strike your target and enemies next to it.",
  },
  Shieldbearer: {
    name: "Shield bash",
    cost: 1,
    cooldown: 2,
    range: 1,
    bonus: 1,
    desc: "Strike and stun an enemy for its next turn.",
  },
  Archer: {
    name: "Aimed shot",
    cost: 2,
    cooldown: 2,
    range: 5,
    bonus: 4,
    desc: "Deal heavy damage at long range.",
  },
  Spearman: {
    name: "Lunge",
    cost: 1,
    cooldown: 2,
    range: 3,
    bonus: 2,
    desc: "Thrust from three tiles away.",
  },
};
export const specializations = {
  Swordswoman: [
    { id: "duelist", name: "Duelist", desc: "+2 attack on all strikes." },
    {
      id: "reaver",
      name: "Reaver",
      desc: "Cleave inflicts bleeding: 2 damage for two turns.",
    },
  ],
  Shieldbearer: [
    {
      id: "bulwark",
      name: "Bulwark",
      desc: "Bracing protects adjacent allies: absorb 2 extra damage.",
    },
    {
      id: "stalwart",
      name: "Stalwart",
      desc: "Shield bash stuns for two enemy turns.",
    },
  ],
  Archer: [
    {
      id: "marksman",
      name: "Marksman",
      desc: "Basic and aimed shots gain +1 range.",
    },
    {
      id: "pinning",
      name: "Trapper",
      desc: "Aimed shot roots its target for two enemy turns.",
    },
  ],
  Spearman: [
    {
      id: "skirmisher",
      name: "Skirmisher",
      desc: "Move up to three tiles per round.",
    },
    {
      id: "bloodletter",
      name: "Bloodletter",
      desc: "Lunge inflicts bleeding: 2 damage for two turns.",
    },
  ],
};
// Advanced skills upgrade the existing class action; companions choose one permanent path.
export const advancedSkills = {
  Swordswoman: [
    {
      id: "sunder",
      name: "Sundering cleave",
      cost: 2,
      cooldown: 2,
      bonus: 2,
      desc: "Cleave lowers each victim's armor by 2 before damage, for the rest of the battle.",
      sunder: true,
    },
    {
      id: "reaping",
      name: "Reaping cleave",
      cost: 3,
      cooldown: 3,
      bonus: 3,
      desc: "Cleave restores 2 health per living enemy struck, up to 6 health.",
      leech: true,
    },
  ],
  Shieldbearer: [
    {
      id: "rally",
      name: "Rallying bash",
      cost: 2,
      cooldown: 3,
      bonus: 1,
      desc: "Bash and stun; restore 3 health to yourself and conscious adjacent companions.",
      rally: true,
    },
    {
      id: "shock",
      name: "Shockwave bash",
      cost: 3,
      cooldown: 3,
      bonus: 1,
      desc: "Bash hits and stuns the target and enemies next to it.",
      area: true,
    },
  ],
  Archer: [
    {
      id: "piercing",
      name: "Piercing shot",
      cost: 3,
      cooldown: 3,
      bonus: 4,
      desc: "Aimed shot ignores enemy armor and terrain cover.",
      piercing: true,
    },
    {
      id: "quickshot",
      name: "Quick shot",
      cost: 1,
      cooldown: 1,
      bonus: 2,
      desc: "A cheaper shot with a one-round cooldown, but a smaller damage bonus.",
    },
  ],
  Spearman: [
    {
      id: "impale",
      name: "Impaling lunge",
      cost: 2,
      cooldown: 2,
      bonus: 2,
      desc: "Lunge also hits the enemy directly behind an aligned target.",
      impale: true,
    },
    {
      id: "hamstring",
      name: "Hamstring lunge",
      cost: 2,
      cooldown: 3,
      bonus: 3,
      desc: "Lunge roots its target for two enemy turns.",
      root: true,
    },
  ],
};
export function advancedSkillsFor(p) {
  return advancedSkills[p?.role] || [];
}
export function skillFor(p) {
  const base = classSkills[p?.role];
  if (!base) return null;
  const advanced = advancedSkillsFor(p).find(
    (skill) => skill.id === p.advancedSkill,
  );
  return advanced ? { ...base, ...advanced } : base;
}
export function learnAdvancedSkill(s, id, skillId) {
  const p = s.party[id],
    choice = advancedSkillsFor(p).find((skill) => skill.id === skillId);
  if (
    !p ||
    p.dead ||
    !choice ||
    p.advancedSkill ||
    !p.talent ||
    p.level < 4 ||
    p.points < 2 ||
    s.battle ||
    s.event ||
    companyLost(s)
  )
    return false;
  p.points -= 2;
  p.advancedSkill = skillId;
  note(
    s,
    `${p.name} mastered ${choice.name}. This permanently upgrades their class action.`,
  );
  return true;
}
export function talentsFor(p) {
  return specializations[p.role] || [];
}
export function learnTalent(s, id, talent) {
  const p = s.party[id],
    t = p && talentsFor(p).find((t) => t.id === talent);
  if (
    !t ||
    p.dead ||
    s.battle ||
    s.event ||
    p.talent ||
    p.level < 2 ||
    p.points < 1
  )
    return false;
  p.points--;
  p.talent = talent;
  note(s, `${p.name} specializes as ${t.name}.`);
  return true;
}
export function attackRange(p, skill = false, s = null) {
  return (
    (skill
      ? skillFor(p)?.range || 1
      : p.role === "Archer"
        ? 4
        : p.role === "Spearman"
          ? 2
          : 1) +
    (p.talent === "marksman" ? 1 : 0) +
    (activeCareer(p)?.id === "tracker" ? 1 : 0) +
    (s && gearPerk(s, p, "reach") ? 1 : 0) +
    (s &&
    gearPerk(s, p, "farshot") &&
    s.battle?.units.find((u) => u.id === p.id)?.moved === false
      ? 2
      : 0)
  );
}
export function movementRange(p) {
  const career = activeCareer(p);
  const limp = p.wound?.type === "sprain" ? 1 : 0;
  return (
    (p.role === "Rogue" || (p.role === "Druid" && p._wildshape) ? 1 : 0) +
    (career?.id === "outrider" ? 1 : 0) +
    Math.max(
      1,
      (p.talent === "skirmisher" ? 3 : 2) -
        (fatiguePenalty(p) === 2 ? 1 : 0) -
        limp,
    )
  );
}
export function hitEnemy(s, e, power) {
  const damage = Math.max(
      1,
      power +
        (e.exposed > 0 ? 2 : 0) +
        (e.kind === "skeleton" &&
        s.party.some((p) => p.hp > 0 && !p.dead && p.lineagePerk === "ancestor")
          ? 2
          : 0) -
        enemyArmor(s, e),
    ),
    wasAlive = e.hp > 0;
  e.hp = Math.max(0, e.hp - damage);
  if (wasAlive && e.hp === 0)
    s.battle.valor = Math.min(5, (s.battle.valor ?? 3) + 1);
  return damage;
}
export function useSkill(s, id, x, y) {
  const b = s.battle,
    u = b?.units.find((u) => u.id === id),
    p = s.party[id],
    skill = p && skillFor(p),
    enemy = b?.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (
    !b ||
    !u ||
    !p ||
    p.dead ||
    !skill ||
    p.hp <= 0 ||
    u.acted ||
    u.cooldown > 0 ||
    b.valor < skill.cost ||
    !enemy ||
    Math.abs(x - u.x) + Math.abs(y - u.y) > attackRange(p, true, s) ||
    !hasLineOfSight(s, u, { x, y })
  )
    return false;
  combatCue(s, p.role === "Archer" ? "arrow" : "strike", u, enemy);
  b.valor -= skill.cost;
  u.acted = true;
  u.cooldown = skill.cooldown;
  const victims =
    p.role === "Swordswoman" || skill.area
      ? b.enemies.filter(
          (e) => e.hp > 0 && Math.abs(e.x - x) + Math.abs(e.y - y) <= 1,
        )
      : skill.impale && (u.x === x || u.y === y)
        ? b.enemies.filter(
            (e) =>
              e.hp > 0 &&
              ((e.x === x && e.y === y) ||
                (e.x === x + Math.sign(x - u.x) &&
                  e.y === y + Math.sign(y - u.y))),
          )
        : [enemy];
  const reachableVictims = victims.filter((e) => hasLineOfSight(s, u, e));
  reachableVictims.forEach((e) => {
    if (skill.sunder) e.armor = Math.max(0, (e.armor || 0) - 2);
    const flank = p.role === "Archer" ? 0 : flankingBonus(s, u, e);
    const damage = hitEnemy(
      s,
      e,
      attackPower(s, p) +
        skill.bonus +
        (p.role === "Rogue" &&
        b.units.some(
          (v) =>
            v !== u &&
            s.party[v.id].hp > 0 &&
            Math.abs(v.x - e.x) + Math.abs(v.y - e.y) === 1,
        )
          ? 3
          : 0) +
        (skill.piercing ? enemyArmor(s, e) : 0) +
        flank -
        (!skill.piercing && Math.abs(e.x - u.x) + Math.abs(e.y - u.y) > 1
          ? terrainCell(s, e.x, e.y).cover
          : 0),
    );
    if (p.role === "Shieldbearer") e.stun = p.talent === "stalwart" ? 2 : 1;
    if (p.talent === "pinning" || skill.root) e.root = 2;
    if (p.talent === "reaver" || p.talent === "bloodletter") e.bleed = 2;
    note(s, `${p.name} uses ${skill.name} for ${damage} damage.`);
  });
  if (skill.leech) {
    const healing = Math.min(
      p.max - p.hp,
      Math.min(6, reachableVictims.length * 2),
    );
    p.hp += healing;
    note(s, `${p.name} reaps ${healing} health.`);
  }
  if (skill.rally) {
    let healing = 0;
    for (const ally of b.units.filter(
      (ally) => Math.abs(ally.x - u.x) + Math.abs(ally.y - u.y) <= 1,
    )) {
      const companion = s.party[ally.id];
      if (companion.dead || companion.hp <= 0) continue;
      const recovered = Math.min(3, companion.max - companion.hp);
      companion.hp += recovered;
      healing += recovered;
    }
    note(s, `${p.name} rallies the line, restoring ${healing} health.`);
  }
  if (b.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}

export function buyGear(s, item, target = 0) {
  if (townAccessLock(s)) return false;
  const p = s.party[target];
  const offer = { weapon: [35, 2, 4], armor: [30, 1, 3] }[item];
  if (
    !p ||
    p.dead ||
    !offer ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town"
  )
    return false;
  const price = s.research.includes("barter")
    ? Math.ceil(offer[0] * 0.8)
    : offer[0];
  if (s.gold < price || p[item] >= offer[2]) return false;
  s.gold -= price;
  p[item] = Math.min(offer[2], p[item] + offer[1]);
  note(
    s,
    `Bought ${item} for ${p.name}: +${item === "weapon" ? "attack" : "armor"}, ${price} crowns.`,
  );
  return true;
}

export const salePrices = { ore: 2, wood: 1, herbs: 1, medicine: 4, pelts: 3 };
export function sell(s, item, quantity = 1) {
  if (townAccessLock(s)) return false;
  const price = salePrices[item] ? regionalSalePrice(s, item) : null;
  if (
    !price ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    !Number.isFinite(s.inventory[item]) ||
    s.inventory[item] < quantity
  )
    return false;
  const proceeds = quantity * price;
  if (!Number.isSafeInteger(proceeds)) return false;
  s.inventory[item] -= quantity;
  s.gold += proceeds;
  note(s, `Sold ${quantity} ${item} for ${proceeds} crowns.`);
  return true;
}
export function innCost(s) {
  return livingParty(s).length * 4 + dailyWages(s) + s.wageDebt;
}
export function restAtInn(s) {
  if (townAccessLock(s)) return false;
  const price = innCost(s);
  if (
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    companyLost(s) ||
    s.gold < price
  )
    return false;
  s.destination = null;
  s.gold -= livingParty(s).length * 4;
  spendHours(s, 24, { mealsProvided: true, resting: true });
  s.morale = Math.min(100, s.morale + 17);
  for (const p of livingParty(s)) {
    p.hp = p.max;
    p.injury = false;
    p.fatigue = 0;
  }
  restRelationships(s);
  note(
    s,
    `Rested at the inn. ${price} crowns paid for beds, meals, and wages; all companions recovered.`,
  );
  return true;
}

export const equipmentCatalog = [
  ["sword", "Swordswoman", ["Road sword", "Tempered sword", "Relic blade"]],
  ["mace", "Shieldbearer", ["Iron mace", "Flanged mace", "Oathkeeper mace"]],
  ["bow", "Archer", ["Short bow", "Yew longbow", "Horn warbow"]],
  ["spear", "Spearman", ["Ash spear", "Steel pike", "Sentinel spear"]],
]
  .flatMap(([key, role, names]) =>
    names.map((name, i) => ({
      id: `${key}-${i + 1}`,
      name,
      role,
      slot: "weapon",
      tier: i + 1,
      rarity: ["Common", "Fine", "Rare"][i],
      bonus: i + 2,
      price: [32, 70, 120][i],
    })),
  )
  .concat(
    ["Padded vest", "Mail shirt", "Brigandine"].map((name, i) => ({
      id: `armor-${i + 1}`,
      name,
      role: null,
      slot: "armor",
      tier: i + 1,
      rarity: ["Common", "Fine", "Rare"][i],
      bonus: i + 1,
      price: [28, 64, 110][i],
    })),
  );
studies.push({
  id: "armorer",
  name: "Armorer's craft",
  cost: 5,
  requires: "steel",
  desc: "Requires Tempered steel. Unlock fine weapon and armor recipes for your Smith. Crafted gear goes into Equipment for assignment.",
});
export function gearItem(s, id) {
  const item = s.gear.find((item) => item.id === id);
  const template =
    item && equipmentCatalog.find((template) => template.id === item.template);
  if (!template) return null;
  const durability = Number.isFinite(item.durability)
    ? Math.max(0, Math.min(100, Math.floor(item.durability)))
    : 100;
  return {
    ...template,
    instanceId: item.id,
    durability,
    baseBonus: template.bonus,
    bonus:
      durability === 0
        ? 0
        : durability <= 25
          ? Math.max(1, Math.floor(template.bonus / 2))
          : template.bonus,
  };
}
export function equippedItem(s, p, slot) {
  return gearItem(s, p.equipment?.[slot]);
}
export function gearOwner(s, id) {
  return (
    s.party.find((p) =>
      equipmentSlots.some((slot) => p.equipment?.[slot] === id),
    ) || null
  );
}
export function armorPower(s, p) {
  return (
    (p.armor || 0) +
    (p.race === "dwarf" ? 1 : 0) +
    (p.personalPerk === "guardian" ? 1 : 0) +
    ["armor", "helmet", "shield"].reduce(
      (total, slot) => total + (equippedItem(s, p, slot)?.bonus || 0),
      0,
    )
  );
}
export function grantEquipment(s, templateId) {
  if (!equipmentCatalog.some((item) => item.id === templateId)) return false;
  const item = { id: s.nextGearId++, template: templateId, durability: 100 };
  s.gear.push(item);
  return item.id;
}
export function equipmentCondition(item) {
  return item.durability === 0
    ? "Broken"
    : item.durability <= 25
      ? "Worn"
      : "Serviceable";
}
export function equipmentSalePrice(item) {
  return Math.floor(
    item.price * 0.4 * (0.25 + (0.75 * (item.durability ?? 100)) / 100),
  );
}
export function wearBattleEquipment(s, outcome = "victory") {
  if (!s.battle || s.battle.equipmentWearApplied) return false;
  s.battle.equipmentWearApplied = true;
  const participants = new Set(s.battle.units.map((u) => u.id)),
    worn = new Set();
  for (const p of s.party.filter((p) => participants.has(p.id))) {
    for (const slot of equipmentSlots) {
      const item = s.gear.find((item) => item.id === p.equipment?.[slot]);
      if (!item || worn.has(item.id)) continue;
      worn.add(item.id);
      const before = gearItem(s, item.id);
      const loss =
        outcome === "defeat"
          ? 20
          : outcome === "retreat"
            ? 10
            : slot === "weapon"
              ? 15
              : 10;
      item.durability = Math.max(
        0,
        before.durability -
          Math.max(0, loss - (s.research.includes("maintenance") ? 5 : 0)),
      );
      const after = gearItem(s, item.id);
      if (equipmentCondition(before) !== equipmentCondition(after))
        note(
          s,
          `${p.name}'s ${after.name} is ${equipmentCondition(after).toLowerCase()} (${after.durability}/100). Repair it at a village blacksmith or staffed camp forge.`,
        );
    }
  }
  return true;
}
export function retreatBattle(s) {
  if (!s.battle) return false;
  if (s.battle.mission)
    note(s, "Mission abandoned in battle; return to its site to retry.");
  leaveRecoveryCache(s, "retreat");
  loseEscort(s);
  damageCompanyWagon(s);
  wearBattleEquipment(s, "retreat");
  if (s.fieldwork.reportCheckpoint)
    s.fieldwork.reportCheckpoint.outcome = "Retreated";
  s.gold = Math.max(0, s.gold - 15);
  s.morale = Math.max(0, s.morale - 10);
  s.party.forEach((p) => (p._wildshape = false));
  s.battle = null;
  note(
    s,
    "Retreated. The company lives to fight another day; equipped gear loses 10 condition.",
  );
  return true;
}
export function repairQuote(s, id) {
  const item = gearItem(s, id);
  if (!item) return null;
  const missing = 100 - item.durability,
    smith = s.campOpen && campWorker(s, "smith");
  const mode = s.campOpen ? "camp" : "village";
  const locked =
    s.battle || s.event
      ? "Finish the battle or encounter first."
      : companyLost(s)
        ? "The company has perished."
        : mode === "camp"
          ? (!s.campUpgrades.forge &&
              !(s.wagon.workbench && s.wagon.condition > 0)) ||
            !smith
            ? "Build a camp forge or wagon workbench and assign a conscious Smith."
            : null
          : places[s.location]?.type !== "town"
            ? "Visit a village blacksmith or pitch a staffed forge."
            : null;
  return {
    item,
    mode,
    locked,
    missing,
    gold: missing ? Math.max(1, Math.ceil((missing * item.price) / 250)) : 0,
    ore: missing
      ? Math.max(
          1,
          Math.ceil(missing / 25) - (smith ? professionRank(smith) : 0),
        )
      : 0,
    wood: missing && ["weapon", "shield"].includes(item.slot) ? 1 : 0,
    hours: missing && mode === "camp" ? 2 : 0,
    smith,
  };
}
export function repairEquipment(s, id) {
  const quote = repairQuote(s, id);
  if (
    !quote ||
    quote.locked ||
    !quote.missing ||
    (quote.mode === "camp"
      ? s.inventory.ore < quote.ore || s.inventory.wood < quote.wood
      : s.gold < quote.gold)
  )
    return false;
  s.destination = null;
  if (quote.mode === "camp") {
    s.inventory.ore -= quote.ore;
    s.inventory.wood -= quote.wood;
    practice(s, quote.smith, 1);
  } else s.gold -= quote.gold;
  s.gear.find((item) => item.id === id).durability = 100;
  if (quote.hours) spendHours(s, quote.hours);
  note(
    s,
    `${quote.item.name} repaired to 100/100${quote.mode === "camp" ? ` by ${quote.smith.name} for ${quote.ore} ore, ${quote.wood} wood and two hours` : ` for ${quote.gold} crowns`}.`,
  );
  return true;
}
export function equipEquipment(s, id, target) {
  const item = gearItem(s, id),
    p = s.party[target];
  if (
    !item ||
    !p ||
    p.dead ||
    s.battle ||
    s.event ||
    !canEquipEquipment(s, item, p) ||
    p.equipment?.[item.slot] === id
  )
    return false;
  const previous = gearOwner(s, id);
  if (previous) previous.equipment[item.slot] = null;
  p.equipment ||= { weapon: null, armor: null, shield: null, helmet: null };
  if (item.twoHanded) p.equipment.shield = null;
  p.equipment[item.slot] = id;
  note(
    s,
    `${p.name} equipped ${item.name}${previous ? `, transferred from ${previous.name}` : ""}.`,
  );
  return true;
}
export function unequipEquipment(s, target, slot) {
  const p = s.party[target];
  if (
    !p ||
    p.dead ||
    !equipmentSlots.includes(slot) ||
    !p.equipment?.[slot] ||
    s.battle ||
    s.event
  )
    return false;
  const item = equippedItem(s, p, slot);
  p.equipment[slot] = null;
  note(s, `${p.name} returned ${item.name} to company stores.`);
  return true;
}
export function equipmentPrice(s, item) {
  return Math.ceil(item.price * purchaseModifier(s));
}
export function buyEquipment(s, templateId) {
  if (townAccessLock(s)) return false;
  const item = equipmentCatalog.find((item) => item.id === templateId);
  if (templateId === "beacon-staff" && s.location !== 6) return false;
  if (
    !item ||
    item.tier > 2 ||
    (item.tier === 2 && s.renown < 5 && s.reputation.wardens < 10) ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    s.gold < equipmentPrice(s, item)
  )
    return false;
  s.gold -= equipmentPrice(s, item);
  grantEquipment(s, templateId);
  note(s, `Bought ${item.name}. Open Equipment to equip it.`);
  return true;
}
export function sellEquipment(s, id) {
  if (townAccessLock(s)) return false;
  const item = gearItem(s, id);
  if (
    !item ||
    gearOwner(s, id) ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town"
  )
    return false;
  const price = equipmentSalePrice(item);
  s.gold += price;
  s.gear = s.gear.filter((item) => item.id !== id);
  note(s, `Sold ${item.name} for ${price} crowns.`);
  return true;
}
export function equipmentRecipe(s, templateId) {
  const item = equipmentCatalog.find((item) => item.id === templateId),
    smith = professional(s, "Smith");
  if (!item || item.tier !== 2) return null;
  return {
    item,
    smith,
    ore: Math.max(
      1,
      (item.slot === "armor" ? 6 : 5) -
        (smith ? professionRank(smith) : 0) -
        (s.campOpen && s.campUpgrades.forge ? 1 : 0) -
        (s.campOpen && campWorker(s, "smith")
          ? 1 + (s.wagon.condition > 0 ? s.wagon.workbench || 0 : 0)
          : 0),
    ),
    wood: item.slot === "armor" ? 1 : 2,
  };
}
export function craftEquipment(s, templateId) {
  const plan = equipmentRecipe(s, templateId);
  if (
    !plan ||
    !plan.smith ||
    !s.research.includes("armorer") ||
    s.battle ||
    s.event ||
    s.inventory.ore < plan.ore ||
    s.inventory.wood < plan.wood
  )
    return false;
  s.inventory.ore -= plan.ore;
  s.inventory.wood -= plan.wood;
  grantEquipment(s, templateId);
  practice(s, plan.smith, 2);
  note(
    s,
    `${plan.smith.name} crafted ${plan.item.name}. Assign it in Equipment.`,
  );
  return true;
}

// One authoritative calendar settles costs for travel, work, rest, and idle exploration.
export const DAY_SECONDS = 300;
export function livingParty(s) {
  return s.party.filter((p) => !p.dead);
}
export function companyLost(s) {
  return livingParty(s).length === 0;
}
export function dailyWages(s) {
  return Math.ceil(
    livingParty(s).reduce((total, p) => total + companionWages(p), 0) *
      (s.research.includes("paymaster") ? 0.8 : 1) *
      (s.difficulty === "forgiving"
        ? 0.75
        : s.difficulty === "veteran"
          ? 1.25
          : 1),
  );
}
export function starvationDamage(s) {
  return Math.min(8, 2 + s.hungerDays);
}
function settleDay(s, mealsProvided = false) {
  const wages = dailyWages(s);
  const cost = campCost(s),
    supplied = mealsProvided ? cost : Math.min(s.food, cost);
  if (!mealsProvided) s.food -= supplied;
  if (supplied < cost) {
    s.hungerDays++;
    for (const p of livingParty(s)) changeResolve(p, -8);
    const damage = Math.max(
      1,
      Math.ceil((starvationDamage(s) * (cost - supplied)) / cost),
    );
    for (const p of livingParty(s)) {
      p.hp = Math.max(0, p.hp - damage);
      p.injury = true;
      if (p.hp === 0) {
        p.dead = true;
        for (const other of livingParty(s))
          changeResolve(other, bondValue(s, p.id, other.id) >= 25 ? -12 : -6);
        p.equipment = { weapon: null, armor: null, shield: null, helmet: null };
        for (const role of campRoles)
          if (s.campJobs[role.id] === p.id) delete s.campJobs[role.id];
        note(
          s,
          `${p.name} died of starvation. Their equipment returns to company stores.`,
        );
      }
    }
    s.morale = Math.max(0, s.morale - 10);
    note(
      s,
      `Not enough rations: ${supplied}/${cost} supplied. Hunger day ${s.hungerDays}; living companions lost ${damage} health. Starvation deaths are permanent.`,
    );
  } else {
    s.hungerDays = 0;
    growPartyBonds(s, 1);
    for (const p of livingParty(s)) changeResolve(p, 1);
    s.morale = Math.max(0, s.morale - 2);
  }
  for (const p of livingParty(s))
    if (p.wound?.type === "infection" && !p.wound.treated) {
      if (p.hp > 0) p.hp = Math.max(1, p.hp - 2);
      p.fatigue = Math.min(100, (p.fatigue || 0) + 5);
      note(s, `${p.name} suffers from an untreated infected wound.`);
    }
  if (
    s.fieldwork?.bannerBearer !== null &&
    s.party[s.fieldwork?.bannerBearer]?.dead
  )
    s.fieldwork.bannerBearer = null;
  const owed = wages + s.wageDebt;
  const paid = Math.min(s.gold, owed);
  s.gold -= paid;
  s.wageDebt = owed - paid;
  if (s.wageDebt) {
    s.morale = Math.max(0, s.morale - 8);
    for (const p of livingParty(s))
      changeResolve(p, hasTrait(p, "mercenary") ? -10 : -6);
    note(s, `Unpaid wages: ${s.wageDebt} crowns owed. Company morale falls.`);
  }
  for (const p of livingParty(s))
    if ((p.fatigue || 0) >= 80) changeResolve(p, -2);
  note(
    s,
    `Daily upkeep: ${mealsProvided ? "inn meals" : `${supplied} rations`} and ${paid} crowns paid. ${s.wageDebt ? `${s.wageDebt} crowns still owed.` : "Wages settled."}`,
  );
  settleTravelPromises(s);
  settlePrisoners(s);
  updateLivingWorld(s);
  for (const p of livingParty(s))
    if (
      s.wageDebt > 0 &&
      (p.resolve ?? 65) <= 10 &&
      (p.storyComplete === "refused" || p.personalQuest?.outcome === "claimed")
    )
      departCompanion(s, p);
  if (companyLost(s)) {
    s.destination = null;
    s.campOpen = false;
    s.event = null;
    s.party.forEach((p) => (p._wildshape = false));
    s.battle = null;
    note(s, "The company has perished. Start a new company to continue.");
  }
}
export function spendHours(s, hours, options = {}) {
  if (!Number.isFinite(hours) || hours <= 0 || companyLost(s)) return false;
  let remaining = Math.min(hours, 24 * 30);
  let restSupplied = !!options.mealsProvided || s.food >= campCost(s);
  while (remaining > 0.000001 && !companyLost(s)) {
    const untilMidnight = 24 - s.timeOfDay;
    const amount = Math.min(remaining, untilMidnight);
    if (!options.resting)
      for (const p of livingParty(s))
        p.fatigue = Math.min(
          100,
          (p.fatigue || 0) +
            amount *
              (hasTrait(p, "tireless") ? 1.5 : 2) *
              (s.research.includes("endurance") ? 0.75 : 1) +
            amount *
              (s.campOpen &&
              (s.campUpgrades.tent || s.campFurniture?.brazier !== undefined)
                ? 0
                : weatherInfo(s).fatigue),
        );
    if (options.resting && restSupplied && !s.hungerDays)
      progressWounds(s, amount);
    s.timeOfDay += amount;
    remaining -= amount;
    if (s.timeOfDay >= 24 - 0.000001) {
      s.timeOfDay = 0;
      s.day++;
      settleDay(s, !!options.mealsProvided);
      restSupplied = !s.hungerDays;
    }
  }
  return true;
}
export function advanceClock(s, seconds) {
  if (s.fieldwork?.report) return false;
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0 ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return false;
  const before = s.day;
  spendHours(s, (seconds / DAY_SECONDS) * 24);
  if (s.day !== before && !companyLost(s) && s.day % 6 === 0) {
    if (s.day % 12 === 0) beginTrailEncounter(s);
    else {
      s.event = roadEvent(s);
      s.destination = null;
    }
  }
  return true;
}
export function payWages(s) {
  if (s.battle || s.event || companyLost(s) || !s.wageDebt || !s.gold)
    return false;
  const paid = Math.min(s.gold, s.wageDebt);
  s.gold -= paid;
  s.wageDebt -= paid;
  note(s, `Paid ${paid} crowns in overdue wages. ${s.wageDebt} remain owed.`);
  return true;
}
export function clockInfo(s) {
  const hours = Math.floor(s.timeOfDay),
    minutes = Math.floor((s.timeOfDay - hours) * 60);
  const period =
    s.timeOfDay < 5 || s.timeOfDay >= 20
      ? "Night"
      : s.timeOfDay < 8
        ? "Dawn"
        : s.timeOfDay < 17
          ? "Daylight"
          : "Dusk";
  return {
    period,
    time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    percent: (s.timeOfDay / 24) * 100,
  };
}
export const campStructures = [
  {
    id: "tents",
    name: "Sleeping tents",
    max: 2,
    gold: 20,
    wood: 6,
    ore: 0,
    herbs: 0,
    desc: "Each level restores 5 more health when resting with food.",
  },
  {
    id: "cookpot",
    name: "Cookpot",
    max: 1,
    gold: 15,
    wood: 3,
    ore: 2,
    herbs: 0,
    desc: "Reduce the daily ration requirement by 1, down to a minimum of 1.",
  },
  {
    id: "forge",
    name: "Portable forge",
    max: 1,
    gold: 30,
    wood: 4,
    ore: 6,
    herbs: 0,
    desc: "Fine equipment recipes use 1 less ore while the camp is pitched.",
  },
  {
    id: "watchpost",
    name: "Watch post",
    max: 1,
    gold: 20,
    wood: 5,
    ore: 2,
    herbs: 0,
    desc: "Increase discovery radius by 40 and begin battles with 1 extra valor.",
  },
  {
    id: "infirmary",
    name: "Medicine tent",
    max: 1,
    gold: 25,
    wood: 4,
    ore: 0,
    herbs: 8,
    desc: "Rest heals 6 more health and cures injuries above half health.",
  },
];
export function openCamp(s) {
  if (s.battle || s.event || companyLost(s)) return false;
  s.destination = null;
  s.campOpen = true;
  rollCampOpportunity(s);
  note(
    s,
    "Camp pitched. Build improvements, tend your company, or rest until dawn.",
  );
  return true;
}
export function leaveCamp(s) {
  s.campOpen = false;
}
export function campBuildPlan(s, id) {
  const building = campStructures.find((b) => b.id === id);
  if (!building) return null;
  const level = s.campUpgrades[id] || 0,
    multiplier = level + 1;
  return {
    ...building,
    level,
    gold: building.gold * multiplier,
    wood: building.wood * multiplier,
    ore: building.ore * multiplier,
    herbs: building.herbs * multiplier,
  };
}
export function buildCamp(s, id) {
  const plan = campBuildPlan(s, id);
  if (
    !plan ||
    !s.campOpen ||
    s.battle ||
    s.event ||
    companyLost(s) ||
    plan.level >= plan.max ||
    s.gold < plan.gold ||
    s.inventory.wood < plan.wood ||
    s.inventory.ore < plan.ore ||
    s.inventory.herbs < plan.herbs
  )
    return false;
  s.gold -= plan.gold;
  s.inventory.wood -= plan.wood;
  s.inventory.ore -= plan.ore;
  s.inventory.herbs -= plan.herbs;
  s.campUpgrades[id] = plan.level + 1;
  spendHours(s, 2);
  discoverNearby(s);
  note(
    s,
    `${plan.name} built at level ${plan.level + 1}. Camp improvements travel with the company.`,
  );
  return true;
}

export const campRoles = [
  {
    id: "cook",
    name: "Camp cook",
    building: "cookpot",
    profession: "Cook",
    desc: "One fewer ration per daily meal while camping. Fed rests grant Cook practice.",
  },
  {
    id: "smith",
    name: "Camp smith",
    building: "forge",
    profession: "Smith",
    desc: "Fine recipes use one extra ore less while camping. A fed rest converts 1 wood into 2 ore, plus Smith rank, and grants 2 practice.",
  },
  {
    id: "medic",
    name: "Camp medic",
    building: "infirmary",
    profession: "Herbalist",
    desc: "A fed rest uses 2 herbs to heal everyone by 4 extra health, plus 2 per Herbalist rank, and grants practice.",
  },
  {
    id: "guard",
    name: "Night guard",
    building: "watchpost",
    profession: null,
    desc: "A fed rest prepares +1 valor for the next battle. Any conscious companion can guard.",
  },
];
export function fatiguePenalty(p) {
  return (p.fatigue || 0) >= 80 ? 2 : (p.fatigue || 0) >= 50 ? 1 : 0;
}
export function fatigueLabel(p) {
  return fatiguePenalty(p) === 2
    ? "Exhausted"
    : fatiguePenalty(p)
      ? "Tired"
      : "Rested";
}
export function campJobReady(s, roleId) {
  const role = campRoles.find((v) => v.id === roleId);
  return (
    !!role &&
    !!(
      s.campUpgrades[role.building] ||
      (roleId === "smith" &&
        s.wagon.owned &&
        s.wagon.workbench &&
        s.wagon.condition > 0)
    )
  );
}
export function canAssignCampJob(s, roleId, companionId) {
  const role = campRoles.find((role) => role.id === roleId),
    p = s.party[companionId];
  return !!(
    role &&
    p &&
    !p.dead &&
    p.hp > 0 &&
    campJobReady(s, roleId) &&
    (!role.profession || p.profession === role.profession) &&
    !campRoles.some(
      (other) => other.id !== roleId && s.campJobs[other.id] === companionId,
    )
  );
}
export function campWorker(s, roleId) {
  const id = s.campJobs[roleId];
  return Number.isInteger(id) && canAssignCampJob(s, roleId, id)
    ? s.party[id]
    : null;
}
export function assignCampJob(s, roleId, companionId) {
  const role = campRoles.find((role) => role.id === roleId);
  if (!s.campOpen || s.battle || s.event || companyLost(s) || !role)
    return false;
  if (companionId === null) {
    delete s.campJobs[roleId];
    note(s, `${role.name} duty left vacant.`);
    return true;
  }
  if (
    !Number.isInteger(companionId) ||
    !canAssignCampJob(s, roleId, companionId)
  )
    return false;
  s.campJobs[roleId] = companionId;
  note(
    s,
    `${s.party[companionId].name} assigned as ${role.name.toLowerCase()}.`,
  );
  return true;
}
function finishCampJobs(s, restHours) {
  if (!s.campOpen || restHours < 6 || s.lastCampWorkDay === s.day) return;
  s.lastCampWorkDay = s.day;
  const cook = campWorker(s, "cook"),
    smith = campWorker(s, "smith"),
    medic = campWorker(s, "medic"),
    guard = campWorker(s, "guard");
  if (cook) {
    practice(s, cook, 1);
    note(s, `${cook.name} tended the cookpot and practiced cooking.`);
  }
  if (smith) {
    if (s.inventory.wood >= 1) {
      const ore =
        2 +
        professionRank(smith) +
        (s.campFurniture?.rack !== undefined ? 1 : 0);
      s.inventory.wood--;
      s.inventory.ore += ore;
      practice(s, smith, 2);
      note(s, `${smith.name} salvaged ${ore} ore using 1 wood at the forge.`);
    } else note(s, `${smith.name} needs 1 wood to work the camp forge.`);
  }
  if (medic) {
    if (s.inventory.herbs >= 2) {
      for (const p of livingParty(s)) if (p.wound) p.wound.treated = true;
      s.inventory.herbs -= 2;
      const recovery = 4 + professionRank(medic) * 2;
      for (const p of livingParty(s)) {
        p.hp = Math.min(p.max, p.hp + recovery);
        if (p.hp >= p.max / 2) p.injury = false;
      }
      practice(s, medic, 1);
      note(
        s,
        `${medic.name} used 2 herbs to tend the company: +${recovery} health.`,
      );
    } else note(s, `${medic.name} needs 2 herbs to tend the company.`);
  }
  if (guard) {
    s.preparedValor = 1;
    note(s, `${guard.name} kept watch. The next battle starts with +1 valor.`);
  }
}
export function flankingBonus(s, attacker, target, side = "party") {
  if (
    !s.battle ||
    Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y) !== 1
  )
    return 0;
  const allies =
    side === "party"
      ? s.battle.units.filter((u) => s.party[u.id].hp > 0)
      : s.battle.enemies.filter((e) => e.hp > 0);
  return allies.some(
    (ally) =>
      ally !== attacker &&
      ally.x === 2 * target.x - attacker.x &&
      ally.y === 2 * target.y - attacker.y,
  )
    ? 2
    : 0;
}

export const companionTraits = [
  {
    id: "resolute",
    name: "Resolute",
    desc: "Loses half as much personal resolve from hardship.",
  },
  {
    id: "steadfast",
    name: "Steadfast",
    desc: "When bracing beside a trusted companion, protects them from 2 damage instead of 1.",
  },
  {
    id: "compassionate",
    name: "Compassionate",
    desc: "Medicine builds stronger bonds; attacking peaceful caravans costs 8 personal resolve.",
  },
  {
    id: "convivial",
    name: "Convivial",
    desc: "Camp conversations strengthen their bond by one extra point.",
  },
  {
    id: "tireless",
    name: "Tireless",
    desc: "Gains 1.5 fatigue per awake hour instead of 2.",
  },
  {
    id: "mercenary",
    name: "Mercenary",
    desc: "+1 attack, but demands 3 daily crowns and reacts more strongly to unpaid wages.",
  },
  {
    id: "hearty",
    name: "Hearty appetite",
    desc: "This recruit starts with 32 health, but needs one extra daily ration.",
  },
];
export function hasTrait(p, id) {
  return p.traits?.includes(id) || false;
}
export function traitSummary(p) {
  return (
    (p.traits || [])
      .map((id) => companionTraits.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(" · ") || "No special traits"
  );
}
export function companionWages(p) {
  return (
    (hasTrait(p, "mercenary") ? 3 : 2) +
    (["elf", "dwarf"].includes(p.race) ? 1 : 0) +
    (isCaster(p) ? 1 : 0)
  );
}
export function changeResolve(p, amount) {
  if (p.dead) return;
  const change =
    amount < 0 && hasTrait(p, "resolute") ? Math.ceil(amount / 2) : amount;
  p.resolve = Math.max(0, Math.min(100, (p.resolve ?? 65) + change));
}
export function resolveLabel(p) {
  return (p.resolve ?? 65) < 25
    ? "Disheartened"
    : (p.resolve ?? 65) >= 75
      ? "Confident"
      : "Steady";
}
function bondKey(a, b) {
  return `${Math.min(a, b)}:${Math.max(a, b)}`;
}
export function bondValue(s, a, b) {
  return a === b ? 0 : s.bonds[bondKey(a, b)] || 0;
}
export function bondLabel(value) {
  if (value < 0) return "Rivals";
  return value >= 50
    ? "Sworn companions"
    : value >= 25
      ? "Trusted"
      : value >= 10
        ? "Familiar"
        : "Acquaintances";
}
export function changeBond(s, a, b, amount) {
  const first = s.party[a],
    second = s.party[b];
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    !first ||
    !second ||
    first.dead ||
    second.dead ||
    a === b ||
    !Number.isFinite(amount)
  )
    return;
  const old = bondValue(s, a, b),
    value = Math.max(0, Math.min(100, old + amount));
  s.bonds[bondKey(a, b)] = value;
  if (bondLabel(value) !== bondLabel(old))
    note(
      s,
      `${first.name} and ${second.name}: ${bondLabel(value).toLowerCase()}.`,
    );
}
function growPartyBonds(s, amount, consciousOnly = false) {
  const companions = livingParty(s).filter((p) => !consciousOnly || p.hp > 0);
  for (let a = 0; a < companions.length; a++)
    for (let b = a + 1; b < companions.length; b++)
      changeBond(s, companions[a].id, companions[b].id, amount);
}
function restRelationships(s) {
  if (s.lastBondRestDay === s.day || s.hungerDays) return;
  s.lastBondRestDay = s.day;
  growPartyBonds(s, 2);
  for (const p of livingParty(s)) changeResolve(p, 6);
}
export function bondSupport(s, p) {
  const unit = s.battle?.units.find((u) => u.id === p.id);
  if (!unit || (p.resolve ?? 65) < 25) return 0;
  return s.battle.units.some(
    (ally) =>
      ally.id !== p.id &&
      s.party[ally.id].hp > 0 &&
      Math.abs(ally.x - unit.x) + Math.abs(ally.y - unit.y) === 1 &&
      bondValue(s, p.id, ally.id) >= 25,
  )
    ? 1
    : 0;
}
export function bondProtection(s, target) {
  const helpers = s.battle?.units.filter(
    (u) =>
      u.id !== target.id &&
      u.guard &&
      s.party[u.id].hp > 0 &&
      Math.abs(u.x - target.x) + Math.abs(u.y - target.y) === 1 &&
      bondValue(s, u.id, target.id) >= 25,
  );
  return helpers?.some((helper) => hasTrait(s.party[helper.id], "steadfast"))
    ? 2
    : helpers?.length
      ? 1
      : 0;
}
export function shareStories(s, a, b) {
  const first = s.party[a],
    second = s.party[b];
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    !s.campOpen ||
    s.battle ||
    s.event ||
    !first ||
    !second ||
    first.dead ||
    second.dead ||
    first.hp <= 0 ||
    second.hp <= 0 ||
    a === b ||
    s.food < 2 ||
    s.lastConversationDay === s.day
  )
    return false;
  s.food -= 2;
  spendHours(s, 2);
  s.lastConversationDay = s.day;
  if (!first.dead && !second.dead) {
    changeBond(
      s,
      a,
      b,
      4 +
        (hasTrait(first, "convivial") || hasTrait(second, "convivial") ? 1 : 0),
    );
    changeResolve(first, 8);
    changeResolve(second, 8);
    note(
      s,
      `${first.name} and ${second.name} shared supper and stories. Their bond and resolve improved.`,
    );
  }
  return true;
}
export function recruitmentOffers(s) {
  if (townAccessLock(s)) return [];
  if (places[s.location]?.type !== "town" || companyLost(s)) return [];
  const serial = s.recruitSerial || 0,
    slot = s.party.findIndex((p) => p.dead),
    id = slot >= 0 ? slot : s.party.length;
  const names = ["Tamsin", "Bram", "Rhea", "Dain", "Iris", "Edric"];
  const local =
    s.location === 0
      ? ["Veyra", "Corin"]
      : s.location === 3
        ? ["Sabine", "Hale"]
        : ["Ysra", "Torren"];
  const offers = [
    {
      id: "standard",
      standard: true,
      name: names[serial % names.length],
      role: id % 2 === 0 ? "Archer" : "Shieldbearer",
      profession: id % 2 === 0 ? "Herbalist" : "Miner",
      max: 26,
      cost: 60,
      traits: [id % 2 === 0 ? "tireless" : "resolute"],
    },
    {
      id: `${s.location}-veteran`,
      name: local[0],
      role: "Swordswoman",
      profession: "Smith",
      max: 26,
      cost: 80,
      traits: ["mercenary"],
    },
    {
      id: `${s.location}-ranger`,
      name: local[1],
      role: "Spearman",
      profession: "Cook",
      max: 32,
      cost: 50,
      traits: ["hearty"],
    },
  ];
  if (s.location === 6)
    offers.push(
      {
        id: "ember-wizard",
        name: "Ilyra",
        role: "Wizard",
        race: "elf",
        profession: "Herbalist",
        max: 20,
        cost: 100,
        traits: ["resolute"],
      },
      {
        id: "ember-cleric",
        name: "Dorren",
        role: "Cleric",
        race: "dwarf",
        profession: "Cook",
        max: 26,
        cost: 95,
        traits: ["compassionate"],
      },
    );
  const ruler = territoryOwner(s);
  if (s.realm.charters[s.location] && s.reputation[ruler] >= 6) {
    const candidate = {
      guild: {
        name: "Brunna",
        role: "Spearman",
        race: "dwarf",
        profession: "Smith",
        max: 28,
        cost: 85,
        traits: ["mercenary"],
      },
      wardens: {
        name: "Alden",
        role: "Shieldbearer",
        race: "human",
        profession: "Miner",
        max: 30,
        cost: 90,
        traits: ["resolute"],
      },
      freefolk: {
        name: "Sylva",
        role: "Archer",
        race: "elf",
        profession: "Thief",
        max: 22,
        cost: 75,
        traits: ["tireless"],
      },
    }[ruler];
    offers.push({ ...candidate, id: `${s.location}-faction-${ruler}` });
  }
  offers.push(...fantasyRecruitment(s));
  return offers.filter(
    (offer) => offer.standard || !s.hiredRecruits.includes(offer.id),
  );
}

// Terrain, movement, and disengagement share the same rules with the canvas UI.
const coverTile = (x, y, kind = "rubble") => ({
  x,
  y,
  kind,
  cover: kind === "brush" ? 1 : 2,
  cost: kind === "brush" ? 2 : 1,
});
const mudTile = (x, y) => ({ x, y, kind: "mud", cover: 0, cost: 2 });
const obstacleTile = (x, y, kind = "wall") => ({
  x,
  y,
  kind,
  cover: 0,
  cost: Infinity,
  blocked: true,
  blocksSight: kind !== "water",
});
const classicTerrain = (forest) => [
  coverTile(3, 2, forest ? "brush" : "rubble"),
  coverTile(5, 4, forest ? "brush" : "rubble"),
  coverTile(4, 0),
  mudTile(4, 5),
  mudTile(2, 6),
];
export const battleLayouts = [
  {
    id: "legacy",
    name: "Open ground",
    text: "Cover and soft ground shape the approach.",
    style: "meadow",
    tiles: null,
  },
  {
    id: "forest-edge",
    name: "Forest edge",
    text: "Brush shelters ranged fighters; muddy low ground slows the flank.",
    style: "forest",
    tiles: classicTerrain(true),
  },
  {
    id: "forest-grove",
    name: "Fallen grove",
    text: "Fallen trunks split the center. Brush and side trails offer alternate approaches.",
    style: "forest",
    tiles: [
      coverTile(3, 2, "brush"),
      coverTile(5, 4, "brush"),
      coverTile(4, 0, "brush"),
      coverTile(6, 5, "brush"),
      mudTile(2, 6),
      mudTile(5, 1),
      obstacleTile(3, 1, "tree"),
      obstacleTile(5, 5, "tree"),
      obstacleTile(4, 3, "log"),
      obstacleTile(4, 4, "log"),
    ],
  },
  {
    id: "ruin-court",
    name: "Ruined courtyard",
    text: "Broken pillars obstruct the center; use the gaps to flank.",
    style: "ruin",
    tiles: [
      coverTile(3, 2),
      coverTile(5, 4),
      coverTile(4, 0),
      mudTile(2, 6),
      obstacleTile(4, 1),
      obstacleTile(4, 3),
    ],
  },
  {
    id: "ruin-aisle",
    name: "Collapsed halls",
    text: "Surviving walls protect the flanks. The central aisle offers a clear route.",
    style: "ruin",
    tiles: [
      coverTile(3, 2),
      coverTile(5, 4),
      coverTile(4, 0),
      mudTile(4, 5),
      obstacleTile(3, 0),
      obstacleTile(3, 1),
      obstacleTile(5, 5),
      obstacleTile(5, 6),
    ],
  },
  {
    id: "quarry",
    name: "Quarry shelves",
    text: "Large boulders break sight lines; rubble offers cover and loose earth slows movement.",
    style: "quarry",
    tiles: [
      coverTile(3, 2),
      coverTile(5, 4),
      coverTile(4, 0),
      mudTile(3, 4),
      mudTile(4, 5),
      obstacleTile(3, 1, "boulder"),
      obstacleTile(5, 5, "boulder"),
      obstacleTile(4, 4, "boulder"),
    ],
  },
  {
    id: "road",
    name: "Caravan road",
    text: "The wagon blocks one approach. Advance along the open road or take cover behind cargo.",
    style: "road",
    tiles: [
      coverTile(3, 2),
      coverTile(5, 4),
      coverTile(4, 0),
      mudTile(2, 6),
      obstacleTile(4, 1, "wagon"),
      obstacleTile(4, 2, "wagon"),
    ],
  },
  {
    id: "deadfall",
    name: "Deadfall trail",
    text: "Standing trees block sight and movement. Deadfall divides the trail; bushes provide light cover but cost two movement points.",
    style: "forest",
    tiles: [
      obstacleTile(3, 1, "tree"),
      obstacleTile(5, 5, "tree"),
      obstacleTile(4, 3, "log"),
      obstacleTile(4, 4, "log"),
      coverTile(2, 3, "brush"),
      coverTile(6, 2, "brush"),
      coverTile(5, 0, "brush"),
      mudTile(3, 5),
    ],
  },
  {
    id: "hedgerow",
    name: "Hedgerow road",
    text: "A fallen tree blocks the roadside. Bushes offer light cover and slow flanking movement.",
    style: "road",
    tiles: [
      obstacleTile(4, 1, "tree"),
      obstacleTile(4, 4, "log"),
      coverTile(3, 2, "brush"),
      coverTile(5, 3, "brush"),
      coverTile(4, 6, "brush"),
      mudTile(2, 5),
    ],
  },
  {
    id: "river",
    name: "Flooded ford",
    text: "Deep water blocks the banks. Cross through the central shallows and protect the approach.",
    style: "river",
    tiles: [
      coverTile(3, 2, "brush"),
      coverTile(5, 4, "brush"),
      mudTile(4, 2),
      mudTile(4, 4),
      { x: 4, y: 3, kind: "bridge", cover: 0, cost: 1 },
      obstacleTile(4, 0, "water"),
      obstacleTile(4, 1, "water"),
      obstacleTile(4, 5, "water"),
      obstacleTile(4, 6, "water"),
    ],
  },
];
export function battlefield(s) {
  return (
    battleLayouts.find((layout) => layout.id === s.battle?.layoutId) ||
    battleLayouts[0]
  );
}
function chooseBattleLayout(s, patrol) {
  const place = places[s.location],
    biome = terrainAt(s.position);
  if (!patrol && place?.scene === "camp") return "forest-grove";
  if (patrol?.kind === "merchant") return "road";
  if (patrol?.kind === "wolves")
    return (s.day + s.skirmishes) % 2 ? "forest-edge" : "deadfall";
  if (!patrol && place?.type === "ruin")
    return s.location === 8
      ? "river"
      : (s.day + s.completed + s.skirmishes) % 2
        ? "ruin-court"
        : "ruin-aisle";
  if (place?.type === "forest")
    return s.location === 7 ? "forest-grove" : "forest-edge";
  if ((!patrol && place?.type === "mine") || biome === "highlands")
    return "quarry";
  if (biome === "shallows") return "river";
  if (place?.type === "forest" || biome === "forest")
    return s.location === 7 || (s.day + s.completed + s.skirmishes) % 2 === 0
      ? "forest-grove"
      : "forest-edge";
  return (s.day + s.skirmishes + s.completed) % 2 ? "road" : "hedgerow";
}
function deployBattle(s, patrol) {
  s.battle.layoutId = chooseBattleLayout(s, patrol);
  if (s.battle.layoutId === "forest-edge") return;
  const allies = [
      [1, 1],
      [1, 5],
      [0, 2],
      [0, 4],
      [1, 0],
      [1, 6],
    ],
    foes =
      s.battle.layoutId === "road"
        ? [
            [7, 2],
            [6, 4],
            [7, 6],
            [6, 0],
            [7, 3],
          ]
        : [
            [7, 1],
            [6, 3],
            [7, 5],
            [6, 0],
            [6, 6],
          ];
  s.battle.units.forEach((u, i) => ([u.x, u.y] = allies[i]));
  s.battle.enemies.forEach((e, i) => ([e.x, e.y] = foes[i]));
}
export function hasLineOfSight(s, from, to) {
  if (
    s.battle?.realmMagic?.surfaces.some(
      (v) =>
        v.kind === "darkness" &&
        v.turns > 0 &&
        (Math.abs(v.x - from.x) + Math.abs(v.y - from.y) <= 1 ||
          Math.abs(v.x - to.x) + Math.abs(v.y - to.y) <= 1),
    ) &&
    Math.abs(from.x - to.x) + Math.abs(from.y - to.y) > 1
  )
    return false;
  let x = from.x,
    y = from.y,
    ix = 0,
    iy = 0;
  const nx = Math.abs(to.x - x),
    ny = Math.abs(to.y - y),
    sx = Math.sign(to.x - x),
    sy = Math.sign(to.y - y);
  const opaque = (x, y) => terrainCell(s, x, y).blocksSight;
  while (ix < nx || iy < ny) {
    const horizontal = (1 + 2 * ix) * ny,
      vertical = (1 + 2 * iy) * nx;
    if (horizontal === vertical) {
      if (opaque(x + sx, y) || opaque(x, y + sy)) return false;
      x += sx;
      y += sy;
      ix++;
      iy++;
    } else if (horizontal < vertical) {
      x += sx;
      ix++;
    } else {
      y += sy;
      iy++;
    }
    if (opaque(x, y)) return false;
  }
  return true;
}
function enemyApproach(s, enemy, target, range, movement) {
  let best = null,
    bestCost = Infinity;
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 9; x++) {
      const distance = Math.abs(x - target.x) + Math.abs(y - target.y);
      if (
        distance > range ||
        distance < (enemy.kind === "archer" ? 2 : 1) ||
        !hasLineOfSight(s, { x, y }, target)
      )
        continue;
      const path = battlePath(
        s,
        { ...enemy, side: "enemy", firstStepBudget: movement },
        x,
        y,
        200,
      );
      if (!path || !path.length) continue;
      const cost = path.reduce(
        (sum, p) => sum + terrainCell(s, p.x, p.y).cost,
        0,
      );
      if (cost < bestCost) {
        bestCost = cost;
        best = path[0];
      }
    }
  return best ? [best.x, best.y] : null;
}

export function battleTerrain(s) {
  if (
    s.battle?.fieldSeed !== undefined &&
    s.battle.terrainBaseLayout === s.battle.layoutId
  )
    return encounterTerrain(s);
  const varied = variedBattleTerrain(s);
  if (varied) return varied;
  return (
    battlefield(s).tiles ||
    classicTerrain(s.battle?.wildlife || places[s.location]?.type === "forest")
  );
}
export function terrainCell(s, x, y) {
  return (
    battleTerrain(s).find((t) => t.x === x && t.y === y) || {
      kind: "open",
      cover: 0,
      cost: 1,
    }
  );
}
export function battlePath(
  s,
  unit,
  x,
  y,
  budget = movementRange(s.party[unit.id]),
) {
  if (
    !s.battle ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x > 8 ||
    y < 0 ||
    y > 6
  )
    return null;
  if (unit.snared > 0 && (x !== unit.x || y !== unit.y)) return null;
  const queue = [{ x: unit.x, y: unit.y, cost: 0, path: [] }],
    seen = new Map();
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const step = queue.shift(),
      key = `${step.x}:${step.y}`;
    if (seen.has(key)) continue;
    seen.set(key, step.cost);
    if (step.x === x && step.y === y) return step.path;
    for (const [nx, ny] of [
      [step.x + 1, step.y],
      [step.x - 1, step.y],
      [step.x, step.y + 1],
      [step.x, step.y - 1],
    ]) {
      const cost = step.cost + terrainCell(s, nx, ny).cost;
      if (
        nx < 0 ||
        nx > 8 ||
        ny < 0 ||
        ny > 6 ||
        cost > budget ||
        (step.path.length === 0 &&
          unit.firstStepBudget !== undefined &&
          terrainCell(s, nx, ny).cost > unit.firstStepBudget) ||
        terrainCell(s, nx, ny).blocked ||
        s.battle.enemies.some(
          (e) =>
            (unit.side !== "enemy" || e.id !== unit.id) &&
            e.hp > 0 &&
            e.x === nx &&
            e.y === ny,
        ) ||
        s.battle.units.some(
          (u) =>
            (unit.side === "enemy" || u.id !== unit.id) &&
            s.party[u.id].hp > 0 &&
            u.x === nx &&
            u.y === ny,
        )
      )
        continue;
      queue.push({
        x: nx,
        y: ny,
        cost,
        path: [...step.path, { x: nx, y: ny }],
      });
    }
  }
  return null;
}
export function disengageCost(s, id) {
  const u = s.battle?.units.find((u) => u.id === id);
  return u && gearPerk(s, s.party[id], "nimble") && !u.freeDisengageUsed
    ? 0
    : 1;
}
export function disengage(s, id) {
  const u = s.battle?.units.find((u) => u.id === id),
    cost = disengageCost(s, id);
  if (!u || u.acted || u.moved || s.party[id].hp <= 0 || s.battle.valor < cost)
    return false;
  s.battle.valor -= cost;
  u.acted = true;
  u.safeMove = true;
  if (cost === 0) u.freeDisengageUsed = true;
  note(
    s,
    `${s.party[id].name} disengages safely. Movement remains available; their attack is spent.`,
  );
  return true;
}
function moveCombatUnit(s, u, path) {
  u.walkRoute = [{ x: u.x, y: u.y }];
  const p = s.party[u.id];
  for (const point of path) {
    if (!u.safeMove)
      for (const enemy of s.battle.enemies) {
        if (
          enemy.hp <= 0 ||
          ["archer", "mage"].includes(enemy.kind) ||
          enemy.stun ||
          enemy.distracted ||
          enemy.reacted ||
          Math.abs(enemy.x - u.x) + Math.abs(enemy.y - u.y) !== 1 ||
          Math.abs(enemy.x - point.x) + Math.abs(enemy.y - point.y) <= 1
        )
          continue;
        enemy.reacted = true;
        damageCompanion(s, u, enemy.damage || 5, false);
        note(s, `${p.name} suffers a disengagement attack.`);
        if (p.hp === 0) break;
      }
    if (p.hp === 0) break;
    u.facing = Math.atan2(point.y - u.y, point.x - u.x);
    u.x = point.x;
    u.y = point.y;
    u.walkRoute.push({ x: u.x, y: u.y });
    const trap = s.battle.traps?.find(
      (t) => !t.used && t.x === u.x && t.y === u.y,
    );
    if (trap) {
      trap.used = true;
      damageCompanion(s, u, 4 + armorPower(s, p));
      u.snared = 2;
      note(
        s,
        `${p.name} triggers a goblin snare: four damage and the next turn's movement is blocked.`,
      );
      break;
    }
  }
  u.moved = true;
  u.safeMove = false;
}
function enemyDisengagement(s, enemy, point) {
  if (enemy.kind === "wolf" && enemy.root) return;
  for (const u of s.battle.units) {
    const p = s.party[u.id];
    if (
      p.hp <= 0 ||
      p.role === "Archer" ||
      u.reacted ||
      Math.abs(u.x - enemy.x) + Math.abs(u.y - enemy.y) !== 1 ||
      Math.abs(u.x - point[0]) + Math.abs(u.y - point[1]) <= 1
    )
      continue;
    u.reacted = true;
    hitEnemy(s, enemy, attackPower(s, p));
    note(s, `${p.name} strikes a retreating ${enemy.kind}.`);
    if (enemy.hp <= 0) break;
  }
}
function damageCompanion(s, target, power, ranged = false) {
  shareGuardDamage(s, target);
  const p = s.party[target.id],
    aura = s.battle.units.some(
      (u) =>
        u.id !== target.id &&
        u.guard &&
        s.party[u.id].hp > 0 &&
        s.party[u.id].talent === "bulwark" &&
        Math.abs(u.x - target.x) + Math.abs(u.y - target.y) <= 1,
    )
      ? 2
      : 0;
  const damage = Math.max(
    1,
    power -
      (target.protectedThisHit ? 2 : 0) -
      (target.arcaneWard || 0) -
      (gearPerk(s, p, "coverward") &&
      terrainCell(s, target.x, target.y).cover > 0
        ? 2
        : 0) -
      (p.role === "Shieldbearer" ? 2 : 0) -
      armorPower(s, p) -
      (target.guard ? 2 + (gearPerk(s, p, "bastion") ? 2 : 0) : 0) -
      bondProtection(s, target) -
      aura -
      paladinProtection(s, target) -
      (ranged ? terrainCell(s, target.x, target.y).cover : 0),
  );
  const before = p.hp;
  target.arcaneWard = 0;
  interruptConcentration(s, target.id);
  p.hp = Math.max(0, p.hp - damage);
  p.injury = p.hp < p.max / 2;
  recordBattleWound(s, p, before, damage, ranged);
  if (target.riposte && p.hp > 0) {
    const enemy = s.battle.enemies.find(
      (e) =>
        e.hp > 0 && Math.abs(e.x - target.x) + Math.abs(e.y - target.y) === 1,
    );
    if (enemy) {
      hitEnemy(s, enemy, 4);
      target.riposte = false;
      note(s, `${p.name} answers with a duelist riposte.`);
    }
  }
  return damage;
}
export function gearPerk(s, p, id) {
  return equipmentSlots.some((slot) => {
    const item = equippedItem(s, p, slot);
    return item?.perk === id && item.durability > 0;
  });
}
export const equipmentSlots = ["weapon", "armor", "shield", "helmet"];
export const equipmentPerks = {
  sweep:
    "Basic melee attacks also hit one enemy next to the target for half damage.",
  reach: "Basic attacks and class abilities reach one extra tile.",
  bleeding: "Basic attacks inflict two turns of bleeding.",
  bastion: "Bracing reduces incoming damage by two extra points.",
  nimble:
    "Your first Disengage in each battle costs no valor; it still spends your action.",
  inspiring: "Bracing restores two valor instead of one.",
  riposte:
    "When braced and hit in melee, counterattack for two damage before enemy armor.",
};
equipmentCatalog.push(
  {
    id: "greatsword-1",
    name: "Iron greatsword",
    role: "Swordswoman",
    slot: "weapon",
    tier: 1,
    rarity: "Common",
    bonus: 4,
    price: 58,
    twoHanded: true,
  },
  {
    id: "greatsword-2",
    name: "Executioner's blade",
    role: "Swordswoman",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 5,
    price: 105,
    twoHanded: true,
    perk: "sweep",
  },
  {
    id: "pike-2",
    name: "Long pike",
    role: "Spearman",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 3,
    price: 85,
    twoHanded: true,
    perk: "reach",
  },
  {
    id: "barbed-spear-2",
    name: "Barbed spear",
    role: "Spearman",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 3,
    price: 80,
    perk: "bleeding",
  },
  {
    id: "duelist-sword-2",
    name: "Duelist sabre",
    role: "Swordswoman",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 3,
    price: 85,
    perk: "riposte",
  },
  {
    id: "shield-1",
    name: "Round shield",
    slot: "shield",
    tier: 1,
    rarity: "Common",
    bonus: 1,
    price: 24,
  },
  {
    id: "shield-2",
    name: "Sentinel shield",
    slot: "shield",
    tier: 2,
    rarity: "Fine",
    bonus: 2,
    price: 65,
    perk: "bastion",
  },
  {
    id: "helmet-1",
    name: "Iron cap",
    slot: "helmet",
    tier: 1,
    rarity: "Common",
    bonus: 1,
    price: 22,
  },
  {
    id: "hood-2",
    name: "Scout hood",
    slot: "helmet",
    tier: 2,
    rarity: "Fine",
    bonus: 1,
    price: 60,
    perk: "nimble",
  },
  {
    id: "helm-2",
    name: "Captain's helm",
    slot: "helmet",
    tier: 2,
    rarity: "Fine",
    bonus: 1,
    price: 72,
    perk: "inspiring",
  },
);
export function canEquipEquipment(s, item, p) {
  return !!(
    item &&
    p &&
    !p.dead &&
    (!item.role || item.role === p.role) &&
    (item.slot !== "shield" ||
      (p.role !== "Archer" && !equippedItem(s, p, "weapon")?.twoHanded))
  );
}
function equipmentOnHit(s, p, target, basic = false) {
  if (basic && target.hp > 0 && gearPerk(s, p, "frostbind"))
    target.root = Math.max(target.root || 0, 1);
  if (basic && target.hp > 0 && gearPerk(s, p, "spellbreak")) {
    target.casting = null;
    target.silenced = 1;
    note(
      s,
      "The spellbreaker blade severs the prepared spell without refunding its slot.",
    );
  }
  if (target.hp > 0 && basic && gearPerk(s, p, "bleeding")) target.bleed = 2;
  if (basic && gearPerk(s, p, "sweep")) {
    const extra = s.battle.enemies.find(
      (e) =>
        e !== target &&
        e.hp > 0 &&
        Math.abs(e.x - target.x) + Math.abs(e.y - target.y) === 1 &&
        hasLineOfSight(
          s,
          s.battle.units.find((u) => u.id === p.id),
          e,
        ),
    );
    if (extra) {
      const damage = hitEnemy(
        s,
        extra,
        Math.max(1, Math.floor(attackPower(s, p) / 2)),
      );
      note(s, `${p.name}'s sweeping blade hits another enemy for ${damage}.`);
    }
  }
}

// Finite regional stocks make trade routes and shortage relief useful.
export const tradeGoods = [
  { id: "grain", name: "Grain sacks" },
  { id: "cloth", name: "Cloth bolts" },
  { id: "salt", name: "Salt crates" },
  { id: "iron", name: "Iron ingots" },
];
export const cargoCapacity = 20;
export const regionalMarkets = {
  0: {
    prices: { grain: 6, cloth: 11, salt: 16, iron: 14 },
    shortages: ["cloth", "salt"],
    supply: { food: 1, ore: 1, wood: 1, herbs: 1, medicine: 1 },
  },
  3: {
    prices: { grain: 12, cloth: 14, salt: 6, iron: 12 },
    shortages: ["iron", "grain"],
    supply: { food: 1.2, ore: 1.2, wood: 1.4, herbs: 0.8, medicine: 1 },
  },
  6: {
    prices: { grain: 18, cloth: 8, salt: 13, iron: 5 },
    shortages: ["grain", "cloth"],
    supply: { food: 1.6, ore: 0.7, wood: 1.3, herbs: 1.3, medicine: 1.2 },
  },
};
export const factions = [
  {
    id: "guild",
    name: "Caravan League",
    desc: "At 10 reputation, purchases cost 10% less. Below −10, merchants charge 25% more.",
  },
  {
    id: "wardens",
    name: "Border Wardens",
    desc: "At 10 reputation, fine blacksmith equipment is available without a renown requirement.",
  },
  {
    id: "freefolk",
    name: "Grove Freefolk",
    desc: "At 10 reputation, foraging yields two extra rations.",
  },
];
export function factionStanding(value) {
  return value >= 10
    ? "Allied"
    : value >= 5
      ? "Recognized"
      : value <= -10
        ? "Distrusted"
        : value < 0
          ? "Wary"
          : "Unknown";
}
export function changeReputation(s, id, amount) {
  const faction = factions.find((f) => f.id === id);
  if (!faction) return;
  s.reputation[id] = Math.max(
    -30,
    Math.min(30, (s.reputation[id] || 0) + amount),
  );
  note(
    s,
    `${faction.name}: ${s.reputation[id]} reputation (${factionStanding(s.reputation[id])}).`,
  );
}
export function purchaseModifier(s) {
  return (
    livingPriceModifier(s) *
    companyTitlePrice(s) *
    territoryPrice(s) *
    ((s.research.includes("barter") ? 0.8 : 1) *
      (s.reputation.guild >= 10 ? 0.9 : s.reputation.guild <= -10 ? 1.25 : 1))
  );
}
export function supplyOffer(s, item) {
  const basics = {
      food: [15, 10],
      ore: [10, 3],
      wood: [6, 3],
      herbs: [8, 3],
      medicine: [12, 1],
    },
    offer = basics[item],
    region = regionalMarkets[s.location];
  return offer && region
    ? {
        quantity: offer[1],
        price: Math.ceil(
          offer[0] *
            region.supply[item] *
            purchaseModifier(s) *
            (item === "food" ? roadFoodModifier(s) : 1),
        ),
      }
    : null;
}
export function regionalSalePrice(s, item) {
  return Math.max(
    1,
    Math.floor(
      (salePrices[item] || 0) *
        (regionalMarkets[s.location]?.supply[item] || 1),
    ),
  );
}
export function marketState(s, location = s.location) {
  const region = regionalMarkets[location];
  if (!region) return null;
  const epoch = Math.floor((s.day - 1) / 3);
  let market = s.markets[location];
  if (!market || market.epoch !== epoch) {
    const shortage = region.shortages[epoch % region.shortages.length];
    market = {
      epoch,
      shortage,
      demand: 8,
      stock: Object.fromEntries(
        tradeGoods.map((g) => [g.id, g.id === shortage ? 2 : 12]),
      ),
    };
    s.markets[location] = market;
  }
  return market;
}
export function cargoLoad(s) {
  return tradeGoods.reduce((load, g) => load + (s.cargo[g.id] || 0), 0);
}
export function tradePrice(
  s,
  good,
  side = "buy",
  location = s.location,
  demand = null,
) {
  const base = regionalMarkets[location]?.prices[good],
    market = marketState(s, location);
  if (!base || !market) return null;
  const shortage =
    market.shortage === good && (demand === null ? market.demand : demand) > 0;
  return side === "sell"
    ? Math.max(1, Math.floor(base * (shortage ? 1.5 : 1) * 0.65))
    : Math.ceil(base * (shortage ? 1.5 : 1) * purchaseModifier(s));
}
export function tradeQuote(s, good, quantity, side = "buy") {
  if (
    !tradeGoods.some((g) => g.id === good) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > companyCargoCapacity(s) ||
    !["buy", "sell"].includes(side) ||
    !regionalMarkets[s.location]
  )
    return null;
  const market = marketState(s);
  if (side === "buy") return tradePrice(s, good) * quantity;
  return Array.from({ length: quantity }, (_, i) =>
    tradePrice(s, good, "sell", s.location, Math.max(0, market.demand - i)),
  ).reduce((sum, p) => sum + p, 0);
}
export function tradeGoodsAtVillage(s, good, quantity = 1, side = "buy") {
  if (townAccessLock(s)) return false;
  const quote = tradeQuote(s, good, quantity, side),
    market = marketState(s);
  if (
    quote === null ||
    !market ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return false;
  if (side === "buy") {
    if (
      s.gold < quote ||
      market.stock[good] < quantity ||
      cargoLoad(s) + quantity > companyCargoCapacity(s)
    )
      return false;
    s.gold -= quote;
    s.cargo[good] += quantity;
    market.stock[good] -= quantity;
  } else {
    if (s.cargo[good] < quantity) return false;
    s.cargo[good] -= quantity;
    s.gold += quote;
    market.stock[good] = Math.min(100, market.stock[good] + quantity);
    if (market.shortage === good && market.demand > 0) {
      const previous = market.demand;
      market.demand = Math.max(0, previous - quantity);
      if (market.demand === 0) {
        changeReputation(s, "guild", 2);
        note(s, `${places[s.location].name}'s ${good} shortage was relieved.`);
      }
    }
  }
  note(
    s,
    `${side === "buy" ? "Bought" : "Sold"} ${quantity} ${good} for ${quote} crowns in ${places[s.location].name}.`,
  );
  if (side === "sell" && s.crime?.stolen) {
    s.crime.wanted = Math.min(10, s.crime.wanted + 1);
    if (!cargoLoad(s)) s.crime.stolen = false;
    note(s, "A buyer recognizes stolen cargo. Wanted level rises.");
  }
  return true;
}
export function caravanCargoPrice(s, good) {
  const base = { grain: 9, cloth: 12, salt: 10, iron: 11 }[good];
  return base ? Math.ceil(base * purchaseModifier(s)) : null;
}
export function tradeCaravanCargo(s, id, good, quantity = 1) {
  const p = nearbyPatrols(s).find(
      (p) => p.id === id && p.kind === "merchant" && !p.hostile,
    ),
    unit = caravanCargoPrice(s, good);
  if (
    !p ||
    !unit ||
    p.raid ||
    s.caravanEscort?.patrolId === id ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > companyCargoCapacity(s) ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    (p.cargo[good] || 0) < quantity ||
    cargoLoad(s) + quantity > companyCargoCapacity(s) ||
    s.gold < unit * quantity
  )
    return false;
  s.gold -= unit * quantity;
  p.cargo[good] -= quantity;
  s.cargo[good] += quantity;
  note(s, `Bought ${quantity} ${good} from ${p.name}.`);
  return true;
}
export function tradeCaravanEquipment(s, id, templateId) {
  const p = nearbyPatrols(s).find(
    (p) => p.id === id && p.kind === "merchant" && !p.hostile,
  );
  const item = equipmentCatalog.find((v) => v.id === templateId);
  const price = item && Math.ceil(item.price * purchaseModifier(s));
  if (
    !p ||
    !item ||
    p.raid ||
    s.caravanEscort?.patrolId === id ||
    !p.gearStock?.includes(templateId) ||
    s.gold < price ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return false;
  s.gold -= price;
  p.gearStock.splice(p.gearStock.indexOf(templateId), 1);
  grantEquipment(s, templateId);
  note(s, `Bought ${item.name} from ${p.name} for ${price} crowns.`);
  return true;
}
function lootCaravanCargo(s, p) {
  if (!p) return;
  for (const id of p.gearStock || []) grantEquipment(s, id);
  p.gearStock = [];
  const rations = Math.min(10, p.foodStock);
  s.food += rations;
  p.foodStock -= rations;
  for (const good of tradeGoods) {
    const recovered = Math.min(
      p.cargo[good.id] || 0,
      companyCargoCapacity(s) - cargoLoad(s),
    );
    if (recovered > 0) {
      s.cargo[good.id] += recovered;
      p.cargo[good.id] -= recovered;
      note(s, `Seized ${recovered} ${good.id} from caravan cargo.`);
    }
  }
}
export function forageAmount(s) {
  const type = places[s.location]?.type || terrainAt(s.position);
  const base =
    type === "forest"
      ? 8
      : type === "farm"
        ? 10
        : type === "mine" || type === "highlands"
          ? 3
          : type === "ruin"
            ? 4
            : 6;
  const gathered = s.forageLedger?.[`${s.day}-${s.location}`] || 0;
  return (
    Math.max(2, base - Math.min(4, gathered * 2)) +
    (s.reputation.freefolk >= 10 ? 2 : 0)
  );
}

export const regionalStories = [
  {
    id: "road",
    name: "Salt on the road",
    issuer: 0,
    target: 2,
    minRenown: 0,
    text: "At Old Barrow, refugees and caravan guards both claim a seized shipment. Decide who deserves it.",
    choices: [
      {
        id: "guild",
        label: "Return the cargo to the League",
        desc: "Fight the raiders, then return to Greyhaven. League +8, Freefolk −3; 110 crowns and a Sentinel shield.",
        battle: true,
        tier: 1,
        reward: 110,
        gear: "shield-2",
        rep: { guild: 8, freefolk: -3 },
      },
      {
        id: "relief",
        label: "Feed the refugees · 6 rations",
        desc: "Spend 6 rations and return to Greyhaven peacefully. Freefolk +8, League −3; 55 crowns.",
        food: 6,
        reward: 55,
        rep: { freefolk: 8, guild: -3 },
      },
      {
        id: "seize",
        label: "Claim the cargo for your company",
        desc: "Take 4 salt crates if cargo space allows, then return to Greyhaven. League −8, Wardens −4; 85 crowns.",
        cargo: { salt: 4 },
        reward: 85,
        rep: { guild: -8, wardens: -4 },
      },
    ],
  },
  {
    id: "grove",
    name: "Whispering Grove oath",
    issuer: 3,
    target: 7,
    minRenown: 5,
    requires: "road",
    text: "Timber merchants want the grove cleared. The Freefolk shelter there and ask you to drive off armed loggers.",
    choices: [
      {
        id: "defend",
        label: "Defend the grove",
        desc: "Defeat a dangerous logging band and return to Saltbridge. Freefolk +10, League −2; 120 crowns and a Long pike.",
        battle: true,
        tier: 2,
        reward: 120,
        gear: "pike-2",
        rep: { freefolk: 10, guild: -2 },
      },
      {
        id: "timber",
        label: "Back the timber merchants",
        desc: "Take 8 wood and return peacefully. Freefolk −8, League +4, Wardens +2; 95 crowns.",
        wood: 8,
        reward: 95,
        rep: { freefolk: -8, guild: 4, wardens: 2 },
      },
    ],
  },
  {
    id: "crown",
    name: "Claim to the Broken Crown",
    issuer: 6,
    target: 11,
    minRenown: 15,
    requires: "grove",
    text: "At Broken Crown, the Wardens demand an ancestral seal while displaced families seek recognition. Both sides prepare to fight.",
    choices: [
      {
        id: "wardens",
        label: "Back the Wardens",
        desc: "Defeat an elite rebel band and return to Emberfall. Wardens +12, Freefolk −8; 190 crowns and a Captain's helm.",
        battle: true,
        tier: 3,
        reward: 190,
        gear: "helm-2",
        rep: { wardens: 12, freefolk: -8 },
      },
      {
        id: "freefolk",
        label: "Protect the displaced families",
        desc: "Defeat a dangerous Warden patrol and return to Emberfall. Freefolk +12, Wardens −8; 150 crowns and a Barbed spear.",
        battle: true,
        tier: 2,
        reward: 150,
        gear: "barbed-spear-2",
        rep: { freefolk: 12, wardens: -8 },
      },
      {
        id: "peace",
        label: "Broker peace · 30 crowns",
        desc: "Requires 5 reputation with both Wardens and Freefolk. Return peacefully; all factions +6; 100 crowns.",
        gold: 30,
        peace: true,
        reward: 100,
        rep: { guild: 6, wardens: 6, freefolk: 6 },
      },
    ],
  },
];
export function storyLock(s, story) {
  if (s.stories[story.id]?.status === "completed") return "Story completed";
  if (s.stories[story.id]?.status === "active") return "Already accepted";
  if (story.requires && s.stories[story.requires]?.status !== "completed")
    return `Complete ${regionalStories.find((q) => q.id === story.requires).name} first`;
  if (s.renown < story.minRenown) return `${story.minRenown} renown required`;
  return "";
}
export function storyOffers(s) {
  return places[s.location]?.type === "town" &&
    !s.battle &&
    !s.event &&
    !s.campOpen
    ? regionalStories.filter((q) => q.issuer === s.location)
    : [];
}
export function acceptStory(s, id) {
  if (townAccessLock(s)) return false;
  const story = storyOffers(s).find((q) => q.id === id);
  if (!story || storyLock(s, story) || s.contract || companyLost(s))
    return false;
  s.stories[id] = { status: "active", branch: null };
  s.contract = {
    kind: "story",
    storyId: id,
    name: story.name,
    issuer: story.issuer,
    target: story.target,
    phase: "investigate",
    reward: 0,
    tier: 1,
  };
  note(
    s,
    `Accepted regional contract: ${story.name}. Investigate ${places[story.target].name}.`,
  );
  return true;
}
export function storyChoiceLock(s, choice) {
  if (choice.food && s.food < choice.food)
    return `Needs ${choice.food} rations`;
  if (choice.gold && s.gold < choice.gold) return `Needs ${choice.gold} crowns`;
  if (
    choice.cargo &&
    cargoLoad(s) + Object.values(choice.cargo).reduce((a, b) => a + b, 0) >
      companyCargoCapacity(s)
  )
    return "Not enough cargo space";
  if (choice.peace && (s.reputation.wardens < 5 || s.reputation.freefolk < 5))
    return "Needs 5 Warden and Freefolk reputation";
  return "";
}
export function interactStory(s) {
  const c = s.contract,
    story = regionalStories.find((q) => q.id === c?.storyId);
  if (
    !story ||
    c.kind !== "story" ||
    s.battle ||
    s.event ||
    s.campOpen ||
    s.location !== c.target ||
    companyLost(s)
  )
    return false;
  if (c.phase === "return") return finishStory(s, story);
  if (c.phase !== "investigate") return false;
  s.destination = null;
  s.event = {
    kind: "story",
    storyId: story.id,
    title: story.name,
    text: story.text,
  };
  return true;
}
export function chooseStory(s, id) {
  const c = s.contract,
    story = regionalStories.find((q) => q.id === s.event?.storyId),
    choice = story?.choices.find((q) => q.id === id);
  if (
    !story ||
    !choice ||
    c?.kind !== "story" ||
    c.storyId !== story.id ||
    c.phase !== "investigate" ||
    s.location !== story.target ||
    s.battle ||
    companyLost(s) ||
    storyChoiceLock(s, choice)
  )
    return false;
  if (choice.food) s.food -= choice.food;
  if (choice.gold) s.gold -= choice.gold;
  if (choice.wood) s.inventory.wood += choice.wood;
  if (choice.cargo)
    for (const [good, quantity] of Object.entries(choice.cargo))
      s.cargo[good] += quantity;
  s.stories[story.id].branch = id;
  s.event = null;
  c.phase = choice.battle ? "battle" : "return";
  c.tier = choice.tier || 1;
  c.reward = choice.battle ? 40 : choice.reward;
  c.target = choice.battle ? story.target : story.issuer;
  note(
    s,
    `${story.name}: ${choice.label}. ${choice.battle ? "Fight at the site, then return for your reward." : "Return to the issuing village for your reward."}`,
  );
  return true;
}
function storyBattleWon(s) {
  const c = s.contract,
    story = regionalStories.find((q) => q.id === c?.storyId);
  if (c?.kind !== "story" || !story) return false;
  const choice = story.choices.find(
    (q) => q.id === s.stories[story.id]?.branch,
  );
  if (!choice) return false;
  c.phase = "return";
  c.target = story.issuer;
  c.reward = choice.reward;
  note(
    s,
    `${story.name}: the fighting is over. Return to ${places[story.issuer].name} to settle the contract.`,
  );
  return true;
}
function finishStory(s, story) {
  const progress = s.stories[story.id],
    choice = story.choices.find((q) => q.id === progress?.branch);
  if (!choice || progress.status !== "active" || s.location !== story.issuer)
    return false;
  progress.status = "completed";
  s.gold += choice.reward;
  s.knowledge += 2;
  s.renown += 3;
  s.completed++;
  for (const [faction, amount] of Object.entries(choice.rep))
    changeReputation(s, faction, amount);
  if (choice.gear) grantEquipment(s, choice.gear);
  note(
    s,
    `${story.name} completed: ${choice.label}. Earned ${choice.reward} crowns and 2 knowledge${choice.gear ? ` plus ${equipmentCatalog.find((i) => i.id === choice.gear).name}` : ""}. Your choice is remembered.`,
  );
  s.contract = null;
  return true;
}

export function caravanFoodPrice(s) {
  return Math.ceil(
    (s.research.includes("barter") ? 10 : 12) *
      (s.reputation.guild >= 10 ? 0.9 : s.reputation.guild <= -10 ? 1.25 : 1),
  );
}

// Repeatable trail encounters are selected from terrain, region, day, and a saved serial.
export const trailEncounters = [
  {
    id: "tracker",
    biome: "forest",
    title: "A wounded forest tracker",
    text: "A tracker lies beneath a fallen bough. Her route notes could help your company, but she needs treatment.",
    choices: [
      {
        id: "medicine",
        label: "Treat the tracker · 1 medicine",
        desc: "Gain 1 knowledge and Freefolk +2.",
        cost: { inventory: { medicine: 1 } },
        reward: { knowledge: 1, reputation: { freefolk: 2 } },
      },
      {
        id: "herbalist",
        label: "Prepare forest remedies · 2 herbs",
        desc: "Requires a conscious Herbalist. Gain 2 knowledge, Freefolk +2, and profession practice; takes 2 hours.",
        profession: "Herbalist",
        cost: { inventory: { herbs: 2 } },
        reward: { knowledge: 2, reputation: { freefolk: 2 } },
        hours: 2,
        practice: 1,
      },
      {
        id: "rob",
        label: "Take the tracker's purse",
        desc: "Gain 15 crowns. Freefolk −2; compassionate companions lose 6 resolve.",
        reward: { gold: 15, reputation: { freefolk: -2 } },
        compassionate: -6,
      },
    ],
  },
  {
    id: "snares",
    biome: "forest",
    title: "Poachers' snares",
    text: "Hidden traps ring a woodland clearing. The Freefolk use this trail to carry food and medicine.",
    choices: [
      {
        id: "freefolk",
        label: "Return the trapped game",
        desc: "Requires 5 Freefolk reputation. Gain 6 rations and Freefolk +1; takes 1 hour.",
        faction: "freefolk",
        standing: 5,
        reward: { food: 6, reputation: { freefolk: 1 } },
        hours: 1,
      },
      {
        id: "herbalist",
        label: "Gather the clearing's herbs",
        desc: "Requires a conscious Herbalist and 2 rations. Gain 4 herbs, 1 knowledge, and profession practice; takes 2 hours.",
        profession: "Herbalist",
        cost: { food: 2 },
        reward: { inventory: { herbs: 4 }, knowledge: 1 },
        hours: 2,
        practice: 1,
      },
      {
        id: "pelts",
        label: "Harvest the pelts",
        desc: "Gain 2 pelts. Freefolk −2.",
        reward: { inventory: { pelts: 2 }, reputation: { freefolk: -2 } },
      },
    ],
  },
  {
    id: "orecart",
    biome: "highlands",
    title: "An overturned ore cart",
    text: "A merchant's cart has spilled across a rocky slope. The driver offers salvage to anyone who can recover the load.",
    choices: [
      {
        id: "miner",
        label: "Recover the load with a Miner",
        desc: "Requires a conscious Miner. Gain 3 ore, League +1, and profession practice; takes 2 hours.",
        profession: "Miner",
        reward: { inventory: { ore: 3 }, reputation: { guild: 1 } },
        hours: 2,
        practice: 1,
      },
      {
        id: "buy",
        label: "Buy the damaged load · 8 crowns",
        desc: "Receive 3 ore and 1 wood.",
        cost: { gold: 8 },
        reward: { inventory: { ore: 3, wood: 1 } },
      },
      {
        id: "loot",
        label: "Seize the ore",
        desc: "Gain 4 ore. League −2 and Wardens −1; compassionate companions lose 6 resolve.",
        reward: {
          inventory: { ore: 4 },
          reputation: { guild: -2, wardens: -1 },
        },
        compassionate: -6,
      },
    ],
  },
  {
    id: "marker",
    biome: "highlands",
    title: "An old prospecting marker",
    text: "Weathered runes indicate a forgotten seam. Interpreting the stone could reveal useful routes and mineral deposits.",
    choices: [
      {
        id: "miner",
        label: "Read the stone with an Apprentice Miner",
        desc: "Requires Miner rank 1. Gain 2 knowledge, 2 ore, and profession practice; takes 3 hours.",
        profession: "Miner",
        rank: 1,
        reward: { knowledge: 2, inventory: { ore: 2 } },
        hours: 3,
        practice: 1,
      },
      {
        id: "chart",
        label: "Buy a surveyor's notes · 10 crowns",
        desc: "Gain 1 knowledge; takes 1 hour.",
        cost: { gold: 10 },
        reward: { knowledge: 1 },
        hours: 1,
      },
    ],
  },
  {
    id: "crossing",
    biome: "shallows",
    title: "A washed-out crossing",
    text: "River travellers are stranded beside a broken footbridge. Repairing it could win local trust.",
    choices: [
      {
        id: "smith",
        label: "Repair the crossing · 2 wood",
        desc: "Requires a conscious Smith. Gain League +2, 1 renown, and profession practice; takes 2 hours.",
        profession: "Smith",
        cost: { inventory: { wood: 2 } },
        reward: { renown: 1, reputation: { guild: 2 } },
        hours: 2,
        practice: 1,
      },
      {
        id: "warden",
        label: "Ask the Wardens for a ferry",
        desc: "Requires 5 Warden reputation. Gain 1 knowledge; takes 1 hour.",
        faction: "wardens",
        standing: 5,
        reward: { knowledge: 1 },
        hours: 1,
      },
      {
        id: "detour",
        label: "Survey the upstream ford",
        desc: "Gain 1 knowledge, but spend 3 hours searching.",
        reward: { knowledge: 1 },
        hours: 3,
      },
    ],
  },
  {
    id: "nets",
    biome: "shallows",
    title: "The river fishers",
    text: "Fishers haul their catch ashore. They welcome skilled cooks and paying customers, but guard their winter supplies.",
    choices: [
      {
        id: "cook",
        label: "Preserve the catch with a Cook",
        desc: "Requires a conscious Cook. Gain 6 rations and profession practice; takes 2 hours.",
        profession: "Cook",
        reward: { food: 6 },
        hours: 2,
        practice: 1,
      },
      {
        id: "buy",
        label: "Buy the catch · 10 crowns",
        desc: "Receive 8 rations.",
        cost: { gold: 10 },
        reward: { food: 8 },
      },
      {
        id: "steal",
        label: "Steal the winter catch",
        desc: "Gain 8 rations. League −2; compassionate companions lose 6 resolve.",
        reward: { food: 8, reputation: { guild: -2 } },
        compassionate: -6,
      },
    ],
  },
  {
    id: "wagon",
    biome: "grassland",
    title: "A stranded cloth wagon",
    text: "A snapped axle has halted a League shipment. The merchant has spare cloth, but urgently needs repairs or replacement goods.",
    choices: [
      {
        id: "smith",
        label: "Repair the axle · 1 ore and 1 wood",
        desc: "Requires a conscious Smith. Gain 20 crowns, League +2, and profession practice; takes 2 hours.",
        profession: "Smith",
        cost: { inventory: { ore: 1, wood: 1 } },
        reward: { gold: 20, reputation: { guild: 2 } },
        hours: 2,
        practice: 1,
      },
      {
        id: "trade",
        label: "Supply the shipment · 2 cloth cargo",
        desc: "Receive 30 crowns and League +2. Uses trade cargo, not crafting materials.",
        cost: { cargo: { cloth: 2 } },
        reward: { gold: 30, reputation: { guild: 2 } },
      },
      {
        id: "rob",
        label: "Seize the cloth cargo",
        desc: "Gain 2 cloth cargo and 12 crowns. League −4, Wardens −2; compassionate companions lose 6 resolve.",
        reward: {
          cargo: { cloth: 2 },
          gold: 12,
          reputation: { guild: -4, wardens: -2 },
        },
        compassionate: -6,
      },
    ],
  },
  {
    id: "levy",
    biome: "grassland",
    title: "An unofficial road levy",
    text: "Armed toll collectors demand payment. A recognized company can challenge them; a hard-hearted recruit might force them to back down.",
    choices: [
      {
        id: "warden",
        label: "Challenge the levy as Warden allies",
        desc: "Requires 5 Warden reputation. Gain 1 renown and Wardens +1.",
        faction: "wardens",
        standing: 5,
        reward: { renown: 1, reputation: { wardens: 1 } },
      },
      {
        id: "pay",
        label: "Settle the dispute · 12 crowns",
        desc: "Pay for safe passage and gain Wardens +1.",
        cost: { gold: 12 },
        reward: { reputation: { wardens: 1 } },
      },
      {
        id: "mercenary",
        label: "Intimidate them with a Mercenary",
        desc: "Requires a conscious companion with the Mercenary trait. Gain 12 crowns; Wardens −3.",
        trait: "mercenary",
        reward: { gold: 12, reputation: { wardens: -3 } },
      },
    ],
  },
];
export function trailRegion(s) {
  return s.position.x >= 900
    ? "Ember frontier"
    : s.position.x >= 450
      ? "Salt coast"
      : "Greyhaven marches";
}
function trailEncounterLock(s) {
  if (s.battle || s.event || s.campOpen || companyLost(s))
    return "Return to free exploration first.";
  if (places[s.location]?.type === "town")
    return "Leave the village to scout the surrounding land.";
  if (s.trailLedger[trailRegion(s)] === s.day)
    return "This region has already been scouted today. Explore another region or return tomorrow.";
  return null;
}
export function scoutLock(s) {
  return (
    trailEncounterLock(s) ||
    (!companyScout(s)
      ? "Requires a conscious Archer, Rogue or a companion working as a Thief."
      : null)
  );
}
export function beginTrailEncounter(s) {
  if (trailEncounterLock(s)) return false;
  const biome = terrainAt(s.position),
    pool = trailEncounters.filter((event) => event.biome === biome);
  const hash =
    Math.floor(s.position.x / 64) * 17 +
    Math.floor(s.position.y / 64) * 31 +
    s.day * 13 +
    s.encounterSerial * 7;
  let template = pool[hash % pool.length];
  if (template.id === s.lastTrailEncounter)
    template = pool[(hash + 1) % pool.length];
  const region = trailRegion(s);
  s.encounterSerial++;
  s.trailLedger[region] = s.day;
  s.lastTrailEncounter = template.id;
  s.destination = null;
  s.event = {
    kind: "trail",
    templateId: template.id,
    id: `${s.day}-${s.encounterSerial}-${region}`,
    region,
    title: template.title,
    text: template.text,
  };
  note(s, `Found ${template.title.toLowerCase()} in the ${region}.`);
  return true;
}
export function scoutSurroundings(s) {
  if (scoutLock(s)) return false;
  const scout = companyScout(s);
  spendHours(s, 1);
  if (scout?.profession === "Thief" && scout.hp > 0) practice(s, scout, 1);
  return beginTrailEncounter(s);
}
export function trailChoiceLock(s, choice) {
  if (!choice) return "Unknown choice.";
  if (choice.profession) {
    const worker = professional(s, choice.profession);
    if (!worker || worker.dead || professionRank(worker) < (choice.rank || 0))
      return `Requires a conscious ${choice.rank ? `rank ${choice.rank} ` : ""}${choice.profession}.`;
  }
  if (
    choice.trait &&
    !livingParty(s).some((p) => p.hp > 0 && hasTrait(p, choice.trait))
  )
    return `Requires a conscious companion with the ${companionTraits.find((t) => t.id === choice.trait).name} trait.`;
  if (choice.faction && s.reputation[choice.faction] < choice.standing)
    return `Requires ${choice.standing} ${factions.find((f) => f.id === choice.faction).name} reputation.`;
  const cost = choice.cost || {};
  if (s.gold < (cost.gold || 0)) return "Not enough crowns.";
  if (s.food < (cost.food || 0)) return "Not enough rations.";
  for (const [id, amount] of Object.entries(cost.inventory || {}))
    if ((s.inventory[id] || 0) < amount) return `Requires ${amount} ${id}.`;
  for (const [id, amount] of Object.entries(cost.cargo || {}))
    if ((s.cargo[id] || 0) < amount) return `Requires ${amount} ${id} cargo.`;
  const outgoing = Object.values(cost.cargo || {}).reduce(
      (sum, n) => sum + n,
      0,
    ),
    incoming = Object.values(choice.reward?.cargo || {}).reduce(
      (sum, n) => sum + n,
      0,
    );
  if (cargoLoad(s) - outgoing + incoming > companyCargoCapacity(s))
    return "Not enough trade cargo space.";
  return null;
}
export function trailEncounterOptions(s) {
  const template = trailEncounters.find(
    (event) => event.id === s.event?.templateId,
  );
  return s.event?.kind === "trail" && template
    ? [
        ...template.choices,
        {
          id: "leave",
          label: "Walk away",
          desc: "Continue your journey without rewards or costs.",
        },
      ]
    : [];
}
export function resolveTrailEncounter(s, choiceId) {
  const event = s.event,
    choice = trailEncounterOptions(s).find((choice) => choice.id === choiceId);
  if (
    !event ||
    s.battle ||
    s.campOpen ||
    companyLost(s) ||
    !choice ||
    trailChoiceLock(s, choice) ||
    s.encounterJournal.some((entry) => entry.id === event.id)
  )
    return false;
  const cost = choice.cost || {},
    reward = choice.reward || {},
    worker = choice.profession && professional(s, choice.profession);
  s.gold -= cost.gold || 0;
  s.food -= cost.food || 0;
  for (const [key, n] of Object.entries(cost.inventory || {}))
    s.inventory[key] -= n;
  for (const [key, n] of Object.entries(cost.cargo || {})) s.cargo[key] -= n;
  s.gold += reward.gold || 0;
  s.food += reward.food || 0;
  s.knowledge += reward.knowledge || 0;
  s.renown += reward.renown || 0;
  for (const [key, n] of Object.entries(reward.inventory || {}))
    s.inventory[key] += n;
  for (const [key, n] of Object.entries(reward.cargo || {})) s.cargo[key] += n;
  for (const [key, n] of Object.entries(reward.reputation || {}))
    changeReputation(s, key, n);
  if (choice.compassionate)
    for (const p of livingParty(s))
      if (hasTrait(p, "compassionate")) changeResolve(p, choice.compassionate);
  if (worker && choice.practice) practice(s, worker, choice.practice);
  if (
    event.templateId === "tracker" &&
    ["help", "herbalist"].includes(choiceId) &&
    s.travelers.tamsin === "unknown"
  ) {
    s.travelers.tamsin = "rescued";
    note(
      s,
      "The injured traveler is Sella of Ashbrook. She remembers your help and will meet you in Greyhaven.",
    );
  }
  s.encounterJournal.unshift({
    id: event.id,
    templateId: event.templateId,
    choiceId,
    day: s.day,
    region: event.region,
  });
  s.encounterJournal = s.encounterJournal.slice(0, 12);
  if (choice.hours) spendHours(s, choice.hours);
  s.event = null;
  note(s, `${event.title}: ${choice.label}. ${choice.desc}`);
  return true;
}

export const namedAdversaries = [
  {
    id: "rook",
    name: "Rook the Tollkeeper",
    issuer: 0,
    target: 2,
    minRenown: 5,
    tier: 2,
    reward: 160,
    gear: "rook-shield",
    reputation: { guild: 4, wardens: 3 },
    mechanic:
      "Rook rallies living allies for +1 damage and gains +2 damage below half health. Defeat his escort or control him with stuns.",
    kind: "brute",
    hp: 40,
    damage: 6,
    armor: 3,
  },
  {
    id: "ashfang",
    name: "Ashfang",
    issuer: 3,
    target: 7,
    minRenown: 15,
    tier: 2,
    reward: 210,
    gear: "ashfang-spear",
    reputation: { freefolk: 5 },
    mechanic:
      "Ashfang rushes 3 tiles. On even enemy rounds, its howl heals other living wolves by 3. Stuns interrupt the howl; fallen wolves stay fallen.",
    kind: "wolf",
    hp: 46,
    damage: 6,
    armor: 1,
  },
  {
    id: "maela",
    name: "Maela Cinder-Eye",
    issuer: 6,
    target: 9,
    minRenown: 30,
    tier: 3,
    reward: 320,
    gear: "cinder-bow",
    reputation: { wardens: 5, guild: 2 },
    mechanic:
      "Maela marks a cross of tiles for 4 fire damage on the next enemy turn. Move out, stun her, or defeat her to cancel the volley. Fire ignores armor.",
    kind: "archer",
    hp: 44,
    damage: 7,
    armor: 2,
  },
];
equipmentCatalog.push(
  {
    id: "rook-shield",
    name: "Tollkeeper's shield",
    slot: "shield",
    role: null,
    tier: 3,
    rarity: "Unique",
    bonus: 3,
    price: 110,
    perk: "bastion",
    uniqueBoss: "rook",
  },
  {
    id: "ashfang-spear",
    name: "Ashfang's tooth",
    slot: "weapon",
    role: "Spearman",
    tier: 3,
    rarity: "Unique",
    bonus: 5,
    price: 140,
    perk: "bleeding",
    uniqueBoss: "ashfang",
  },
  {
    id: "cinder-bow",
    name: "Cinder bow",
    slot: "weapon",
    role: "Archer",
    tier: 3,
    rarity: "Unique",
    bonus: 6,
    price: 165,
    perk: "reach",
    uniqueBoss: "maela",
  },
);
export function bountyLock(s, boss) {
  if (!boss) return "Unknown adversary.";
  if (s.bounties[boss.id])
    return "Already defeated; this bounty cannot be repeated.";
  if (s.contract) return "Complete or abandon the active contract first.";
  if (s.renown < boss.minRenown) return `${boss.minRenown} renown required.`;
  return null;
}
export function bountyOffers(s) {
  return contracts(s).length
    ? namedAdversaries.filter((boss) => boss.issuer === s.location)
    : [];
}
export function acceptBounty(s, id) {
  if (townAccessLock(s)) return false;
  const boss = bountyOffers(s).find((boss) => boss.id === id);
  if (!boss || bountyLock(s, boss)) return false;
  s.contract = {
    kind: "boss",
    bossId: id,
    name: `Bounty: ${boss.name}`,
    issuer: boss.issuer,
    target: boss.target,
    reward: boss.reward,
    tier: boss.tier,
  };
  note(s, `Accepted bounty for ${boss.name}. ${boss.mechanic}`);
  return true;
}
export function abandonBounty(s) {
  if (s.contract?.kind !== "boss" || s.battle || s.event) return false;
  note(s, `Abandoned ${s.contract.name}; the adversary remains undefeated.`);
  s.contract = null;
  return true;
}
function deployAdversary(s) {
  if (s.contract?.kind !== "boss") return;
  const boss = namedAdversaries.find((boss) => boss.id === s.contract.bossId);
  s.battle.bossId = boss.id;
  const leader = s.battle.enemies[0];
  Object.assign(leader, {
    bossId: boss.id,
    name: boss.name,
    kind: boss.kind,
    hp: boss.hp,
    max: boss.hp,
    damage: boss.damage,
    armor: boss.armor,
  });
  if (boss.id === "ashfang")
    for (const e of s.battle.enemies.slice(1))
      Object.assign(e, { kind: "wolf", hp: 18, max: 18, damage: 4, armor: 0 });
}
function finishBounty(s) {
  const boss = namedAdversaries.find((boss) => boss.id === s.contract?.bossId);
  if (!boss || s.bounties[boss.id]) return false;
  s.bounties[boss.id] = { day: s.day };
  grantEquipment(s, boss.gear);
  for (const [faction, n] of Object.entries(boss.reputation))
    changeReputation(s, faction, n);
  note(
    s,
    `${boss.name} defeated. Recovered ${equipmentCatalog.find((item) => item.id === boss.gear).name}; the bounty is recorded permanently.`,
  );
  return true;
}
export function bossThreat(s) {
  const threat = s.battle?.danger,
    source = s.battle?.enemies.find((e) => e.bossId === threat?.source);
  return threat && source?.hp > 0 && !(source.stun > 0) ? threat : null;
}
function resolveBossThreat(s) {
  const threat = s.battle.danger;
  if (!threat || threat.firesAt > s.battle.turn) return;
  const active = bossThreat(s);
  s.battle.danger = null;
  if (!active) {
    note(s, "Maela's marked volley was interrupted.");
    return;
  }
  for (const u of s.battle.units) {
    const p = s.party[u.id];
    if (
      p.hp <= 0 ||
      !threat.tiles.some((tile) => tile.x === u.x && tile.y === u.y)
    )
      continue;
    p.hp = Math.max(0, p.hp - 4);
    note(s, `${p.name} takes 4 fire damage from Maela's volley.`);
  }
}
function adversaryPower(s, e) {
  const rook = s.battle.enemies.find(
    (leader) => leader.bossId === "rook" && leader.hp > 0,
  );
  return (
    (rook && rook !== e && !(rook.stun > 0) && !rook.stunnedThisRound ? 1 : 0) +
    (e.bossId === "rook" && e.hp <= e.max / 2 ? 2 : 0)
  );
}
function adversaryTurn(s, e) {
  if (e.bossId === "rook" && e.hp <= e.max / 2 && !e.enraged) {
    e.enraged = true;
    note(s, "Rook becomes desperate: his attacks gain 2 damage.");
  }
  if (e.bossId === "ashfang" && s.battle.turn % 2 === 0) {
    let healed = 0;
    for (const wolf of s.battle.enemies.filter(
      (wolf) => wolf !== e && wolf.kind === "wolf" && wolf.hp > 0,
    )) {
      const amount = Math.min(3, wolf.max - wolf.hp);
      wolf.hp += amount;
      healed += amount;
    }
    note(s, `Ashfang howls: its living pack recovers ${healed} health.`);
  }
}
function markAdversaryThreat(s, e, target) {
  if (
    e.bossId !== "maela" ||
    s.party[target.id].hp <= 0 ||
    !hasLineOfSight(s, e, target)
  )
    return;
  const tiles = [
    { x: target.x, y: target.y },
    { x: target.x + 1, y: target.y },
    { x: target.x - 1, y: target.y },
    { x: target.x, y: target.y + 1 },
    { x: target.x, y: target.y - 1 },
  ].filter((tile) => tile.x >= 0 && tile.x < 9 && tile.y >= 0 && tile.y < 7);
  s.battle.danger = { source: "maela", firesAt: s.battle.turn + 1, tiles };
  note(
    s,
    `Maela marks ${s.party[target.id].name}'s position. Move off the marked tiles before the next enemy turn, or stun her to interrupt.`,
  );
}

// Settlement tutors turn crowns and travel time into profession experience.
export const villageTutors = {
  0: ["Cook", "Smith"],
  3: ["Cook", "Herbalist"],
  6: ["Smith", "Miner"],
};
export function lessonQuote(s, id) {
  const p = s.party.find((p) => p.id === id);
  if (!p) return null;
  const rank = professionRank(p);
  const surcharge = s.location === 3 ? 4 : s.location === 6 ? 8 : 0;
  return {
    price: Math.ceil(
      (24 + rank * 12 + surcharge) * (s.research.includes("barter") ? 0.8 : 1),
    ),
    hours: 3,
    xp: 3,
    rank,
  };
}
export function lessonLock(s, id) {
  const p = s.party.find((p) => p.id === id);
  if (!p || p.dead || p.hp <= 0) return "A conscious companion is required.";
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    places[s.location]?.type !== "town"
  )
    return "Visit a village training hall outside encounters and camp.";
  if (!villageTutors[s.location]?.includes(p.profession))
    return `This village does not teach ${p.profession}.`;
  if (professionRank(p) >= 3)
    return "Already a Master; no further lessons are needed.";
  if (s.lessonLedger?.[id] === s.day)
    return "Already trained today. Return tomorrow.";
  const required =
    professionRank(p) === 2 ? 15 : professionRank(p) === 1 ? 5 : 0;
  if (s.renown < required)
    return `Requires ${required} renown for this rank; company has ${s.renown}.`;
  if (s.gold < lessonQuote(s, id).price)
    return `Not enough crowns: requires ${lessonQuote(s, id).price}.`;
  return null;
}
export function takeLesson(s, id) {
  if (townAccessLock(s)) return false;
  if (lessonLock(s, id)) return false;
  const p = s.party.find((p) => p.id === id),
    quote = lessonQuote(s, id);
  s.gold -= quote.price;
  practice(s, p, quote.xp);
  spendHours(s, quote.hours);
  s.lessonLedger ||= {};
  s.lessonLedger[id] = s.day;
  note(
    s,
    `${p.name} studied ${p.profession} at ${places[s.location].name}: +${quote.xp} practice, ${quote.price} crowns, ${quote.hours} hours. Daily upkeep still applies.`,
  );
  return true;
}

export const tavernRumors = [
  {
    id: "hidden-compartment",
    issuer: 0,
    target: 10,
    name: "A smuggler’s second cache",
    renown: 0,
    desc: "A retired smuggler remembers a second compartment beneath the southern stash. Explore Forgotten Stash to search it.",
    reward: { gold: 20, knowledge: 1 },
  },
  {
    id: "iron-seam",
    issuer: 0,
    target: 4,
    name: "The overlooked iron seam",
    renown: 0,
    desc: "A miner points out a rich seam behind Iron Hollow’s old workings. Explore Iron Hollow for extra ore.",
    reward: { ore: 4, knowledge: 1 },
  },
  {
    id: "chapel-herbs",
    issuer: 3,
    target: 8,
    name: "The drowned herb garden",
    renown: 0,
    desc: "A ferryman recalls medicinal plants growing around Sunken Chapel. Explore its grounds to recover them.",
    reward: { herbs: 4, knowledge: 2 },
  },
  {
    id: "watchtower-ledger",
    issuer: 3,
    target: 5,
    name: "The missing patrol ledger",
    renown: 5,
    desc: "An old scout left a patrol ledger and pay chest at the Watchtower. Explore the tower to recover them.",
    reward: { gold: 25, knowledge: 2 },
  },
  {
    id: "grove-supplies",
    issuer: 6,
    target: 7,
    name: "The herbalist’s shelter",
    renown: 5,
    desc: "A traveller describes an abandoned shelter in Whispering Grove. Explore the grove for herbs and seasoned timber.",
    reward: { herbs: 5, wood: 3, knowledge: 2 },
  },
  {
    id: "quarry-records",
    issuer: 6,
    target: 9,
    name: "The quarry survey",
    renown: 10,
    desc: "A prospector hid survey notes near Redstone Quarry’s best deposits. Explore the quarry to recover ore and knowledge.",
    reward: { ore: 6, knowledge: 2 },
  },
];
export function rumorLock(s, id) {
  const rumor = tavernRumors.find((r) => r.id === id);
  if (!rumor) return "Unknown rumor.";
  if (s.rumors?.[id]) return "Already heard. See the journal.";
  if (s.explored.includes(rumor.target))
    return "You have already explored this location.";
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    companyLost(s) ||
    s.location !== rumor.issuer
  )
    return "Visit this rumor’s village tavern.";
  if (s.renown < rumor.renown) return `Requires ${rumor.renown} renown.`;
  if (s.gold < 8) return "Requires 8 crowns.";
  return null;
}
export function hearRumor(s, id) {
  if (townAccessLock(s)) return false;
  if (rumorLock(s, id)) return false;
  const rumor = tavernRumors.find((r) => r.id === id);
  s.gold -= 8;
  s.rumors ||= {};
  s.rumors[id] = { heardDay: s.day };
  if (!s.discovered.includes(rumor.target)) s.discovered.push(rumor.target);
  spendHours(s, 1);
  note(
    s,
    `Heard ${rumor.name}: ${rumor.desc} Landmark marked; nearby terrain remains unexplored.`,
  );
  return true;
}
export function resolveRumors(s) {
  for (const rumor of tavernRumors) {
    const record = s.rumors?.[rumor.id];
    if (
      !record ||
      record.resolvedDay ||
      rumor.target !== s.location ||
      !s.explored.includes(rumor.target)
    )
      continue;
    record.resolvedDay = s.day;
    for (const [resource, amount] of Object.entries(rumor.reward)) {
      if (resource === "gold" || resource === "knowledge")
        s[resource] += amount;
      else s.inventory[resource] += amount;
    }
    note(
      s,
      `Rumor confirmed: ${rumor.name}. Recovered ${Object.entries(rumor.reward)
        .map(([r, n]) => `${n} ${r === "gold" ? "crowns" : r}`)
        .join(", ")}.`,
    );
  }
}

export const companyBanners = [
  { id: "ashen", name: "Ashen sun", color: "#ad8057", symbol: "☀" },
  { id: "pine", name: "Pine wardens", color: "#72825a", symbol: "♠" },
  { id: "iron", name: "Iron tower", color: "#85948c", symbol: "▥" },
  { id: "wine", name: "Crimson star", color: "#986267", symbol: "✦" },
];
export const companyOrigins = [
  {
    id: "wanderers",
    name: "Road wanderers",
    desc: "120 crowns, 24 rations. A balanced start with four novice companions.",
    gold: 120,
    food: 24,
  },
  {
    id: "traders",
    name: "Caravan survivors",
    desc: "180 crowns, 18 rations and 4 grain. More trading capital, fewer provisions.",
    gold: 180,
    food: 18,
    grain: 4,
  },
  {
    id: "settlers",
    name: "Frontier settlers",
    desc: "80 crowns, 32 rations, 6 wood and 4 herbs. Supplies for building camp, less spending money.",
    gold: 80,
    food: 32,
    wood: 6,
    herbs: 4,
  },
  {
    id: "veterans",
    name: "Disbanded soldiers",
    desc: "70 crowns, 20 rations and 5 renown. Each founder starts at level 2 with one training point.",
    gold: 70,
    food: 20,
    renown: 5,
    veteran: true,
  },
];
export const founderRoles = {
  Swordswoman: { max: 28, damage: 7 },
  Shieldbearer: { max: 34, damage: 5 },
  Archer: { max: 22, damage: 6 },
  Spearman: { max: 26, damage: 6 },
  Wizard: { max: 20, damage: 4 },
  Cleric: { max: 26, damage: 5 },
};
export function safeCompanyName(
  value,
  fallback = "The Ashen Company",
  max = 30,
) {
  return typeof value === "string"
    ? value
        .replace(/[<>\x00-\x1f]/g, "")
        .trim()
        .slice(0, max) || fallback
    : fallback;
}
export function createCompany(options) {
  if (
    !options ||
    !companyBanners.some((b) => b.id === options.banner) ||
    !companyOrigins.some((o) => o.id === options.origin) ||
    !Array.isArray(options.founders) ||
    options.founders.length !== 4
  )
    return null;
  if (
    typeof options.name !== "string" ||
    !options.name.trim() ||
    options.name.trim().length > 30
  )
    return null;
  for (const p of options.founders)
    if (
      !p ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.trim().length > 18 ||
      !Object.hasOwn(founderRoles, p.role) ||
      !professions.includes(p.profession) ||
      !companionTraits.some((t) => t.id === p.trait)
    )
      return null;
  const s = fresh(),
    origin = companyOrigins.find((o) => o.id === options.origin);
  s.companyName = safeCompanyName(options.name);
  s.banner = options.banner;
  s.origin = origin.id;
  s.difficulty = ["forgiving", "standard", "veteran"].includes(
    options.difficulty,
  )
    ? options.difficulty
    : "standard";
  s.gold = origin.gold;
  s.food = origin.food;
  s.renown = origin.renown || 0;
  s.cargo.grain = origin.grain || 0;
  s.inventory.wood = origin.wood || 0;
  s.inventory.herbs = origin.herbs || 0;
  s.party = options.founders.map((p, id) => {
    const stats = founderRoles[p.role],
      hearty = p.trait === "hearty";
    return {
      ...s.party[id],
      name: safeCompanyName(p.name, `Companion ${id + 1}`, 18),
      role: p.role,
      preparedSpells: isCaster(p)
        ? spellCatalogFor(p)
            .filter((v) => !v.tome)
            .slice(0, 3)
            .map((v) => v.id)
        : null,
      knownSpells: [],
      max: hearty ? 32 : stats.max,
      hp: hearty ? 32 : stats.max,
      damage: stats.damage + (p.trait === "mercenary" ? 1 : 0),
      profession: p.profession,
      traits: [p.trait],
      level: origin.veteran ? 2 : 1,
      points: origin.veteran ? 1 : 0,
      ...avatarAppearance(p),
      coat: companyBanners.some((b) => b.color === p.coat)
        ? p.coat
        : companyBanners.find((b) => b.id === options.banner).color,
    };
  });
  s.log = [
    `${s.companyName} arrives at Greyhaven. ${origin.name}: find work, trade, or make camp.`,
  ];
  return s;
}
export function isCompanySave(raw) {
  return (
    !!raw &&
    Array.isArray(raw.party) &&
    raw.party.length > 0 &&
    raw.party.length <= 6 &&
    Array.isArray(raw.research) &&
    Number.isInteger(raw.location) &&
    (raw.location === -1 || !!places[raw.location]) &&
    ["day", "gold", "food", "morale", "knowledge", "completed"].every(
      (k) => Number.isFinite(raw[k]) && raw[k] >= 0,
    ) &&
    raw.party.every(
      (p) =>
        p &&
        typeof p.name === "string" &&
        Number.isFinite(p.hp) &&
        Number.isFinite(p.max) &&
        p.max > 0 &&
        p.hp >= 0 &&
        p.hp <= p.max,
    )
  );
}

export const avatarSkins = ["#e2c396", "#bd946e", "#8f624b", "#614637"];
export const avatarHair = ["#4b4635", "#927344", "#b5a68a", "#a25e3b"];
export function avatarAppearance(p = {}) {
  return {
    race: fantasyRaces.some((r) => r.id === p.race) ? p.race : "human",
    sex: p.sex === "male" ? "male" : "female",
    skin: avatarSkins.includes(p.skin) ? p.skin : avatarSkins[0],
    hair: avatarHair.includes(p.hair) ? p.hair : avatarHair[0],
    hairStyle: ["short", "long", "braid"].includes(p.hairStyle)
      ? p.hairStyle
      : "short",
  };
}
export function customizeAvatar(s, id, appearance) {
  const p = s.party[id];
  if (!p || p.dead || s.battle || s.event) return false;
  Object.assign(p, avatarAppearance({ ...appearance, race: p.race }));
  if (companyBanners.some((b) => b.color === appearance.coat))
    p.coat = appearance.coat;
  return true;
}
export function enterSite(s) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    companyLost(s) ||
    ![4, 9, 10].includes(s.location)
  )
    return false;
  s.siteProgress ||= {};
  s.event = {
    kind: "site",
    site: s.location,
    stage:
      s.location === 10
        ? s.stash.unlocked
          ? "opened"
          : s.stash.found
            ? "lock"
            : "search"
        : "entrance",
    pin: 0,
    strain: 0,
    message: "",
  };
  return true;
}
export function siteAction(s, action, value) {
  const e = s.event;
  if (e?.kind !== "site") return false;
  if (action === "leave") {
    s.event = null;
    return true;
  }
  if (e.site === 10) {
    if (
      action === "search" &&
      e.stage === "search" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value < 16
    ) {
      if (!s.stash.searched.includes(value)) s.stash.searched.push(value);
      if ([8, 2].includes(value)) {
        if (!s.stash.clues.includes(value)) s.stash.clues.push(value);
        e.message =
          value === 8
            ? "Oak carving: start here and walk THREE squares EAST. The last direction is scratched on the marker stone."
            : "Marker stone: after walking east from the oak, go ONE square NORTH. The chest lies beneath pale soil.";
      } else if (value === 7 && s.stash.clues.length === 2) {
        s.stash.found = true;
        e.stage = "lock";
        e.message =
          "You follow both clues and uncover a buried chest. Listen to each pin and find its sweet spot.";
      } else {
        const distance =
          Math.abs((value % 4) - 3) + Math.abs(Math.floor(value / 4) - 1);
        e.message =
          distance <= 1
            ? "A hollow sound under pale soil. Read BOTH the oak carving and marker stone before digging."
            : "Only roots and stones. Inspect the broken oak and the marker stone to piece together the route.";
      }
      return true;
    }
    if (
      action === "pick" &&
      e.stage === "lock" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 5
    ) {
      const target = [2, 4, 1][e.pin];
      if (value === target) {
        e.pin++;
        e.strain = 0;
        e.message = "Click! The pin holds.";
        if (e.pin === 3) {
          s.stash.unlocked = true;
          s.stash.loot = { gold: 30, medicine: 1, ore: 2, wood: 1, herbs: 1 };
          if (!s.explored.includes(10)) {
            s.explored.push(10);
            s.knowledge++;
          }
          for (const rumor of tavernRumors.filter((r) => r.target === 10)) {
            const record = s.rumors[rumor.id];
            if (!record || record.resolvedDay) continue;
            record.resolvedDay = s.day;
            for (const [resource, amount] of Object.entries(rumor.reward)) {
              if (resource === "knowledge") s.knowledge += amount;
              else
                s.stash.loot[resource] = (s.stash.loot[resource] || 0) + amount;
            }
          }
          e.stage = "opened";
          e.message =
            "The lid opens. Inspect the contents and choose what to take. Anything left stays here for another visit.";
        }
      } else {
        e.strain++;
        e.message =
          value < target
            ? "The pick catches: rotate the dial higher."
            : "Too far: rotate the dial lower.";
        if (e.strain === 3) {
          e.pin = 0;
          e.strain = 0;
          e.message = "The lock resets. Repairing the pick takes one hour.";
          spendHours(s, 1);
          if (companyLost(s)) return true;
        }
      }
      return true;
    }
    if (
      e.stage === "opened" &&
      action === "take" &&
      typeof value === "string"
    ) {
      const amount = s.stash.loot[value];
      if (
        !amount ||
        !["gold", "medicine", "ore", "wood", "herbs"].includes(value)
      )
        return false;
      if (value === "gold") s.gold += amount;
      else s.inventory[value] += amount;
      delete s.stash.loot[value];
      e.message = `Collected ${amount} ${value === "gold" ? "crowns" : value}. Remaining items stay in the chest.`;
      return true;
    }
    if (e.stage === "opened" && action === "take-all") {
      const contents = Object.keys(s.stash.loot);
      if (!contents.length) return false;
      for (const key of contents) siteAction(s, "take", key);
      e.message = "All contents collected. The empty chest remains open.";
      return true;
    }
    return false;
  }
  if (["entrance", "gallery", "vein"].includes(action)) {
    e.stage = action;
    e.message = "";
    return true;
  }
  if (action === "cart" && e.stage === "gallery") {
    const key = `cart-${e.site}`;
    if (s.siteProgress[key]) return false;
    s.siteProgress[key] = true;
    s.inventory.ore += 2;
    e.message = "Recovered two ore from the abandoned cart.";
    return true;
  }
  if (action === "mine" && e.stage === "vein") {
    if (s.explored.includes(e.site)) {
      e.message =
        "The exposed seam has been surveyed. Use fieldwork outside for further mining.";
      return false;
    }
    s.event = null;
    awardExploration(s);
    s.event = {
      ...e,
      message: "Surveyed the seam and recovered ore, materials, and knowledge.",
    };
    return true;
  }
  return false;
}

export function weatherInfo(s) {
  const season = ["Spring", "Summer", "Autumn", "Winter"][
      Math.floor((s.day - 1) / 7) % 4
    ],
    kind = ["clear", "rain", "storm", "cold"][(s.day - 1) % 4];
  return {
    season,
    kind,
    label: `${season} · ${kind}`,
    food: kind === "cold" || season === "Winter" ? 1 : 0,
    fatigue: kind === "storm" ? 0.5 : 0,
    visibility: kind === "rain" ? 30 : kind === "storm" ? 60 : 0,
  };
}
export function prepareAmbush(s) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    companyLost(s) ||
    s.food < 1 ||
    s.ambushReady
  )
    return false;
  s.food--;
  spendHours(s, 2);
  if (companyLost(s)) return false;
  s.ambushReady = true;
  s.stealth = { active: true, concealment: 100 };
  note(
    s,
    "Ambush prepared: +1 opening valor and a free full company turn before enemies can respond.",
  );
  return true;
}
export function tacticalAction(s, id, action) {
  const b = s.battle,
    u = b?.units.find((u) => u.id === id),
    p = s.party[id];
  if (!u || u.acted || p.hp <= 0) return false;
  if (action === "overwatch" && p.role === "Archer") {
    u.overwatch = true;
    u.acted = true;
    note(s, `${p.name} watches a firing lane until the next round.`);
    return true;
  }
  if (action === "wall" && p.role === "Shieldbearer") {
    u.guard = true;
    u.acted = true;
    for (const ally of b.units)
      if (
        s.party[ally.id].hp > 0 &&
        Math.abs(ally.x - u.x) + Math.abs(ally.y - u.y) <= 1
      )
        ally.guard = true;
    note(s, "Shield wall: adjacent companions brace together.");
    return true;
  }
  if (action === "push" && b.valor >= 1) {
    const e = b.enemies.find(
      (e) => e.hp > 0 && Math.abs(e.x - u.x) + Math.abs(e.y - u.y) === 1,
    );
    if (!e) return false;
    const x = e.x + (e.x - u.x),
      y = e.y + (e.y - u.y);
    if (
      x < 0 ||
      x > 8 ||
      y < 0 ||
      y > 6 ||
      terrainCell(s, x, y).blocked ||
      b.enemies.some((v) => v !== e && v.hp > 0 && v.x === x && v.y === y) ||
      b.units.some((v) => s.party[v.id].hp > 0 && v.x === x && v.y === y)
    )
      return false;
    e.x = x;
    e.y = y;
    hitEnemy(
      s,
      e,
      2 + (e.armor || 0) + (terrainCell(s, x, y).cost > 1 ? 3 : 0),
    );
    b.valor--;
    u.acted = true;
    if (b.enemies.every((e) => e.hp <= 0)) win(s);
    return true;
  }
  return false;
}
export function payCrimeFine(s) {
  const fee = (s.crime?.wanted || 0) * 20;
  if (
    !fee ||
    s.gold < fee ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town"
  )
    return false;
  s.gold -= fee;
  s.crime = { wanted: 0, stolen: false };
  s.patrols = s.patrols.filter((p) => p.id !== "warden-pursuit");
  note(s, `Paid ${fee} crowns in fines. Stolen goods surrendered.`);
  s.cargo = Object.fromEntries(tradeGoods.map((g) => [g.id, 0]));
  return true;
}
export function registerCrime(s, stolen = true) {
  s.crime ||= { wanted: 0, stolen: false };
  s.crime.wanted = Math.min(10, s.crime.wanted + 3);
  s.crime.stolen = s.crime.stolen || stolen;
  note(
    s,
    "Surviving witnesses report the raid. Warden patrols pursue the company; villages demand a fine.",
  );
  if (!s.patrols.some((p) => p.id === "warden-pursuit" && !p.cleared)) {
    s.patrols = s.patrols.filter((p) => p.id !== "warden-pursuit");
    const base = initialPatrols().find((p) => p.kind === "bandits");
    s.patrols.push({
      ...base,
      id: "warden-pursuit",
      name: "Warden pursuit",
      kind: "bandits",
      x: Math.max(20, s.position.x - 120),
      y: s.position.y,
      cleared: false,
      hostile: true,
    });
  }
}
export function personalGoal(p) {
  return p.profession === "Smith"
    ? "A weapon worthy of the company"
    : p.profession === "Herbalist"
      ? "Supplies for a sick family"
      : "A place to belong";
}
export function companionStory(s, id, choice) {
  const p = s.party[id];
  if (
    !s.campOpen ||
    s.battle ||
    s.event ||
    !p ||
    p.dead ||
    (p.storyComplete && choice !== "release")
  )
    return false;
  if (choice === "support") {
    const cost = p.profession === "Smith" ? 3 : 0;
    if (s.gold < 20 || s.inventory.ore < cost) return false;
    s.gold -= 20;
    s.inventory.ore -= cost;
    changeResolve(p, 20);
    if (cost) p.weapon = Math.min(4, (p.weapon || 0) + 1);
    else s.morale = Math.min(100, s.morale + 5);
    for (const q of livingParty(s))
      if (q !== p)
        s.bonds[bondKey(p.id, q.id)] = Math.min(
          100,
          bondValue(s, p.id, q.id) + 1,
        );
    p.storyComplete = "supported";
    p.personalQuest = { stage: 1, outcome: null };
  } else if (choice === "refuse") {
    changeResolve(p, -15);
    p.storyComplete = "refused";
    for (const q of livingParty(s))
      if (q !== p)
        s.bonds[bondKey(p.id, q.id)] = Math.max(
          0,
          bondValue(s, p.id, q.id) - 3,
        );
  } else if (choice === "release") {
    if ((p.resolve ?? 65) > 25) return false;
    if (s.fieldwork?.bannerBearer === p.id) s.fieldwork.bannerBearer = null;
    p.departed = true;
    p.dead = true;
    p.equipment = {};
    for (const role of campRoles)
      if (s.campJobs[role.id] === id) delete s.campJobs[role.id];
    p.storyComplete = "left";
    note(
      s,
      `${p.name} leaves the company alive. Their equipment stays in stores.`,
    );
    return true;
  } else return false;
  note(s, `${p.name}: ${personalGoal(p)} — ${p.storyComplete}.`);
  return true;
}
export const campFurniture = [
  { id: "table", name: "Shared table", wood: 4, gold: 15 },
  { id: "rack", name: "Tool rack", wood: 3, gold: 12 },
  { id: "brazier", name: "Sheltered brazier", wood: 5, gold: 20 },
];
export function placeFurniture(s, id, slot) {
  const f = campFurniture.find((f) => f.id === id);
  if (
    !s.campOpen ||
    s.battle ||
    s.event ||
    !f ||
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot > 5
  )
    return false;
  s.campFurniture ||= {};
  if (
    Object.entries(s.campFurniture).some(([key, v]) => key !== id && v === slot)
  ) {
    note(s, "That camp space is occupied. Choose another space.");
    return false;
  }
  if (s.campFurniture[id] === undefined) {
    if (s.gold < f.gold || s.inventory.wood < f.wood) return false;
    s.gold -= f.gold;
    s.inventory.wood -= f.wood;
  }
  s.campFurniture[id] = slot;
  note(s, `${f.name} placed in camp space ${slot + 1}.`);
  return true;
}
export function enterDungeon(s) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    companyLost(s) ||
    !["mine", "ruin"].includes(places[s.location]?.type)
  )
    return false;
  s.event = {
    kind: "dungeon",
    site: s.location,
    x: s.location === 12 && s.strongholdIntel.entry ? 6 : 0,
    y: s.location === 12 && s.strongholdIntel.entry ? 4 : 5,
    message:
      "Explore the tunnels. Inspect walls for secrets; reinforce unstable ground before crossing.",
  };
  return true;
}
export function dungeonLayout(site) {
  const layouts = {
    2: {
      name: "Burial chambers",
      walls: [
        [2, 1],
        [2, 2],
        [2, 3],
        [6, 4],
        [6, 1],
        [6, 2],
      ],
      secret: [4, 1],
      trap: [3, 3],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 55,
      clue: "Fresh air leaks through the northern burial wall.",
    },
    4: {
      name: "Timbered galleries",
      walls: [
        [2, 1],
        [2, 2],
        [2, 3],
        [6, 4],
      ],
      secret: [4, 1],
      trap: [3, 3],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 50,
      clue: "Scratched stone hints at a hidden door near the northern center.",
    },
    5: {
      name: "Garrison corridors",
      walls: [
        [1, 1],
        [1, 2],
        [3, 2],
        [3, 3],
        [5, 4],
      ],
      secret: [6, 1],
      trap: [3, 1],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 60,
      clue: "A loose banner conceals a door in the northeast wall.",
    },
    8: {
      name: "Flooded cloister",
      walls: [
        [2, 2],
        [3, 2],
        [4, 2],
        [6, 3],
        [6, 4],
      ],
      secret: [4, 1],
      trap: [3, 4],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 65,
      clue: "The northern altar sounds hollow when struck.",
    },
    9: {
      name: "Quarry switchbacks",
      walls: [
        [2, 1],
        [2, 2],
        [4, 3],
        [4, 4],
        [6, 1],
      ],
      secret: [4, 1],
      trap: [3, 3],
      collapse: [5, 4],
      guard: [7, 5],
      vault: [8, 5],
      reward: 60,
      clue: "A boarded survey tunnel lies near the northern center.",
    },
    11: {
      name: "Royal labyrinth",
      walls: [
        [1, 2],
        [2, 2],
        [3, 2],
        [5, 1],
        [5, 2],
        [6, 4],
        [7, 4],
      ],
      secret: [4, 1],
      trap: [3, 3],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 90,
      clue: "The crown carved into the northern wall hides a mechanism.",
    },
    12: {
      name: "Bandit stockade",
      walls: [
        [2, 1],
        [2, 2],
        [4, 3],
        [5, 3],
        [6, 3],
      ],
      secret: [6, 1],
      trap: [3, 3],
      collapse: [5, 4],
      guard: [7, 5],
      vault: [8, 5],
      reward: 70,
      clue: "A torn canvas screens a cache in the northeast corner.",
    },
    14: {
      name: "Crystal cave",
      walls: [
        [2, 1],
        [2, 2],
        [3, 2],
        [6, 2],
        [6, 3],
      ],
      secret: [4, 1],
      trap: [3, 3],
      collapse: [5, 3],
      guard: [7, 5],
      vault: [8, 5],
      reward: 65,
      clue: "The northern crystal wall resonates with a hollow echo.",
    },
  };
  return layouts[site] || layouts[4];
}
export function dungeonWalls(s) {
  const layout = dungeonLayout(s.event.site);
  return [
    ...layout.walls,
    ...(!s.siteProgress[`secret-${s.event.site}`] ? [layout.secret] : []),
  ];
}
export function dungeonAction(s, action, x, y) {
  const e = s.event;
  if (e?.kind !== "dungeon") return false;
  if (realmDungeonAction(s, action)) return true;
  const layout = dungeonLayout(e.site);
  if (action === "leave") {
    s.event = null;
    return true;
  }
  if (action === "inspect") {
    if (
      Math.abs(e.x - layout.secret[0]) + Math.abs(e.y - layout.secret[1]) <=
        1 &&
      !s.siteProgress[`secret-${e.site}`]
    ) {
      s.siteProgress[`secret-${e.site}`] = true;
      s.inventory.herbs += 4;
      e.message = "A secret passage! Four herbs recovered.";
    } else e.message = layout.clue;
    return true;
  }
  if (action === "shore") {
    if (s.inventory.wood < 2 || s.siteProgress[`shore-${e.site}`]) return false;
    s.inventory.wood -= 2;
    s.siteProgress[`shore-${e.site}`] = true;
    e.message = "Timbers secure the unstable passage.";
    return true;
  }
  if (action === "mine") {
    if (
      !["mine"].includes(places[e.site]?.type) ||
      e.y !== 1 ||
      ![1, 5].includes(e.x)
    )
      return false;
    const key = `deposit-${e.site}-${e.x}`,
      maker = professional(s, "Miner");
    if (s.siteProgress[key] || !maker) return false;
    s.siteProgress[key] = true;
    s.inventory.ore += 3 + professionRank(maker);
    practice(s, maker, 1);
    spendHours(s, 1);
    e.message = "Mined the deposit. Ore recovered and Miner practice gained.";
    return true;
  }
  if (
    action === "disarm" &&
    companyScout(s) &&
    Math.abs(e.x - layout.trap[0]) + Math.abs(e.y - layout.trap[1]) <= 1 &&
    !s.siteProgress[`hazard-${e.site}-3`]
  ) {
    s.siteProgress[`hazard-${e.site}-3`] = true;
    practice(s, companyScout(s), 1);
    e.message = "Your scout disables the trap without spending timber.";
    return true;
  }
  if (action === "disarm") {
    if (
      Math.abs(e.x - layout.trap[0]) + Math.abs(e.y - layout.trap[1]) > 1 ||
      s.inventory.wood < 1 ||
      s.siteProgress[`hazard-${e.site}-3`]
    )
      return false;
    s.inventory.wood--;
    s.siteProgress[`hazard-${e.site}-3`] = true;
    spendHours(s, 1);
    e.message = "The dart mechanism is disabled.";
    return true;
  }
  if (action === "vault") {
    if (
      e.x !== 8 ||
      e.y !== 5 ||
      !s.siteProgress[`guard-${e.site}`] ||
      s.siteProgress[`vault-${e.site}`]
    )
      return false;
    s.siteProgress[`vault-${e.site}`] = true;
    s.gold += layout.reward;
    s.knowledge += 2;
    e.message = `Recovered ${layout.reward} crowns and two knowledge from the guarded vault.`;
    return true;
  }
  if (
    action !== "move" ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x > 8 ||
    y < 0 ||
    y > 6 ||
    Math.abs(x - e.x) + Math.abs(y - e.y) !== 1 ||
    dungeonWalls(s).some(([a, b]) => a === x && b === y)
  )
    return false;
  e.x = x;
  e.y = y;
  e.message = "";
  if (
    (x === layout.trap[0] && y === layout.trap[1]) ||
    (x === layout.collapse[0] &&
      y === layout.collapse[1] &&
      !s.siteProgress[`shore-${e.site}`])
  ) {
    const key = `hazard-${e.site}-${x === layout.trap[0] && y === layout.trap[1] ? 3 : 5}`;
    if (!s.siteProgress[key]) {
      s.siteProgress[key] = true;
      for (const p of livingParty(s)) p.hp = Math.max(1, p.hp - 3);
      e.message =
        x === layout.trap[0] && y === layout.trap[1]
          ? "A dart trap deals 3 damage to each companion."
          : "A cave-in deals 3 damage. Reinforce the passage next time.";
    }
  }
  if (x === 7 && y === 5 && !s.siteProgress[`guard-${e.site}`]) {
    const contract = s.contract;
    s.event = null;
    s.contract = { target: e.site, tier: 2, reward: 40 };
    if (!startBattle(s)) {
      s.contract = contract;
      s.event = e;
      return false;
    }
    s.contract = contract;
    s.battle.kind = "patrol";
    s.battle.dungeonReturn = { ...e };
    if (e.site === 12) {
      const leader = s.battle.enemies[0];
      leader.name = "Captain Venn";
      leader.hp = leader.max = Math.ceil(
        36 *
          (s.difficulty === "forgiving"
            ? 0.8
            : s.difficulty === "veteran"
              ? 1.2
              : 1),
      );
      leader.damage += 1;
      leader.armor = 2;
      s.battle.stronghold = "briar";
      if (s.strongholdIntel.sabotaged) {
        for (const enemy of s.battle.enemies) {
          enemy.damage = Math.max(1, enemy.damage - 2);
          enemy.hp = enemy.max = Math.max(1, enemy.hp - 8);
        }
        note(
          s,
          "Sabotaged stores weaken Captain Venn and his defenders: eight fewer health and two less damage each.",
        );
      }
    }
    note(
      s,
      "Sentries guard the treasure chamber. Defeat them to open the vault.",
    );
  }
  return true;
}

function triggerOverwatch(s, e) {
  for (const u of s.battle.units) {
    const p = s.party[u.id];
    if (
      u.overwatch &&
      p.hp > 0 &&
      e.hp > 0 &&
      Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= attackRange(p, false, s) &&
      hasLineOfSight(s, u, e)
    ) {
      u.overwatch = false;
      hitEnemy(s, e, attackPower(s, p));
      if (u.pinningWatch && e.hp > 0) {
        e.root = 1;
        u.pinningWatch = false;
      }
      note(s, `${p.name} fires an overwatch shot.`);
    }
  }
}
function departCompanion(s, p) {
  if (s.fieldwork?.bannerBearer === p.id) s.fieldwork.bannerBearer = null;
  p.departed = true;
  p.dead = true;
  p.equipment = {};
  for (const role of campRoles)
    if (s.campJobs[role.id] === p.id) delete s.campJobs[role.id];
  note(
    s,
    `${p.name} leaves alive after losing faith in the company. Their equipment stays in stores.`,
  );
}

export function enterFarm(s) {
  if (
    s.location !== 13 ||
    s.battle ||
    s.event ||
    s.campOpen ||
    s.destination ||
    companyLost(s)
  )
    return false;
  s.event = {
    kind: "farm",
    site: 13,
    message:
      "The farmhouse is deserted. Muddy bootprints lead east, and a ledger lies beside a locked cellar. Explore for supplies and clues.",
  };
  return true;
}
export function farmAction(s, action) {
  if (s.event?.kind !== "farm") return false;
  if (action === "leave") {
    s.event = null;
    return true;
  }
  const key = `farm-${action}-13`;
  if (!["clue", "cellar", "well"].includes(action) || s.siteProgress[key])
    return false;
  if (action === "cellar" && !s.siteProgress["farm-clue-13"]) {
    s.event.message =
      "Three carved symbols lock the cellar. Find the farmer's ledger first.";
    return false;
  }
  s.siteProgress[key] = true;
  if (action === "clue") {
    s.event.message =
      "Ledger: seed, rain, harvest. The cellar combination is solved. Raiders carried supplies to Briarhide Camp; a charcoal map marks Echo Cavern beyond it.";
    for (const site of [12, 14])
      if (!s.discovered.includes(site)) s.discovered.push(site);
    s.knowledge++;
  } else if (action === "cellar") {
    s.food += 12;
    s.inventory.wood += 3;
    s.event.message =
      "The cellar opens: twelve preserved rations and three wood recovered.";
  } else {
    s.inventory.herbs += 3;
    s.event.message =
      "Medicinal herbs grow beside the old well. Three herbs recovered.";
  }
  spendHours(s, 1);
  note(s, `Ashbrook Farm: ${s.event.message}`);
  return true;
}
export function supplyForecast(s) {
  const food = campCost(s) + s.odyssey.prisoners.length,
    wages = dailyWages(s);
  return {
    food,
    wages,
    foodDays: food ? Math.floor(s.food / food) : 0,
    wageDays: wages ? Math.floor(Math.max(0, s.gold - s.wageDebt) / wages) : 0,
    nextMeal: Math.max(0, 24 - s.timeOfDay),
  };
}
export function combatPreview(s, id, x, y, skillMode = false) {
  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x > 8 ||
    y < 0 ||
    y > 6
  )
    return { allowed: false, reason: "Outside the battlefield." };
  const b = s.battle,
    u = b?.units.find((u) => u.id === id),
    p = s.party[id];
  if (!u || !p || p.hp <= 0)
    return { allowed: false, reason: "Select a conscious companion." };
  const tile = terrainCell(s, x, y),
    enemy = b.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (enemy) {
    const skill = skillMode ? skillFor(p) : null;
    let reason = u.acted
      ? "Action already spent."
      : skillMode && (!skill || u.cooldown > 0 || b.valor < skill.cost)
        ? "Ability unavailable: check valor and cooldown."
        : Math.abs(x - u.x) + Math.abs(y - u.y) > attackRange(p, skillMode, s)
          ? "Out of range."
          : !hasLineOfSight(s, u, enemy)
            ? "Sight blocked."
            : "";
    const flank = p.role === "Archer" ? 0 : flankingBonus(s, u, enemy);
    const cover =
      !skill?.piercing && Math.abs(x - u.x) + Math.abs(y - u.y) > 1
        ? tile.cover
        : 0;
    const armor = skill?.piercing
      ? 0
      : Math.max(0, enemyArmor(s, enemy) - (skill?.sunder ? 2 : 0));
    const damage = Math.max(
      1,
      attackPower(s, p) + (skill?.bonus || 0) + flank - cover - armor,
    );
    return {
      allowed: !reason,
      reason,
      damage,
      flank,
      cover,
      armor,
      kind: "attack",
      text:
        reason ||
        `${skill?.name || "Attack"}: ${damage} damage · armor −${armor} · cover −${cover} · flank +${flank}${skill?.area ? " · area attack" : ""}`,
    };
  }
  const path =
    !u.moved && (!u.acted || u.safeMove) && !skillMode
      ? battlePath(s, u, x, y)
      : null;
  let reactions = 0,
    previous = u,
    reacted = new Set();
  for (const point of path || []) {
    for (const e of b.enemies)
      if (
        !u.safeMove &&
        e.hp > 0 &&
        ![
          "archer",
          "mage",
          "cultist",
          "necromancer",
          "shaman",
          "sorcerer",
        ].includes(e.kind) &&
        !e.stun &&
        !e.distracted &&
        !e.reacted &&
        !reacted.has(e) &&
        Math.abs(e.x - previous.x) + Math.abs(e.y - previous.y) === 1 &&
        Math.abs(e.x - point.x) + Math.abs(e.y - point.y) > 1
      ) {
        reactions++;
        reacted.add(e);
      }
    previous = point;
  }
  const fire =
    b.threat?.tiles?.some((t) => t.x === x && t.y === y) ||
    b.enemies.some((e) => e.hp > 0 && e.casting?.x === x && e.casting?.y === y);
  const snare = path?.some((point) =>
    b.traps?.some((t) => !t.used && t.x === point.x && t.y === point.y),
  );
  return {
    allowed: !!path?.length,
    kind: "move",
    reactions,
    reactors: [...reacted].map((e) => e.id),
    text: path?.length
      ? `Move · ${tile.kind} · cost ${tile.cost}${reactions ? ` · WARNING: ${reactions} disengagement attack(s)` : " · no disengagement attacks"}${fire ? " · WARNING: marked hazard" : ""}${snare ? " · WARNING: goblin snare stops movement and deals four damage" : ""}`
      : "Movement unavailable or route blocked.",
  };
}
export const fieldGuide = {
  travel: [
    "Keep the company supplied",
    "Click anywhere on the map to walk freely. Villages contain markets, recruitment and contracts. Forage takes six hours; rich forests and farms yield more food. Repeated gathering at one location gives less until the next day. Food and wages are paid at midnight; hunger causes lasting wounds and death.",
  ],
  battle: [
    "Read the battlefield",
    "Select a companion, then click a highlighted destination or enemy. You can move and act once per round. Hover tiles for expected damage, cover and flanking; leaving melee range risks a reaction attack. Disengage trades your action for safe movement. Red warnings mark enemy hazards. End turn lets enemies act.",
  ],
  camp: [
    "Make camp work",
    "Assign companions to camp jobs. Matching professions operate upgrades, cook meals, forge supplies and treat wounds. Build furniture for extra benefits. Rest uses time and pays daily food and wages; check the forecast before resting.",
  ],
  dungeon: [
    "Explore carefully",
    "Grid buttons move one square. Inspect near suspicious walls to uncover secrets. Disarm darts from a neighboring tile or reinforce unstable passages. Ore needs a Miner. Defeat sentries before taking the vault; treasure is collected once.",
  ],
  farm: [
    "Follow the clues",
    "Search the farm's ledger before opening the cellar. Clues mark new destinations without revealing the surrounding terrain. Supplies and discoveries can only be collected once.",
  ],
};

export const fantasyRaces = [
  { id: "human", name: "Human", desc: "Versatile travelers; standard upkeep." },
  {
    id: "elf",
    name: "Elf",
    desc: "Spells reach one extra tile; one additional daily crown.",
  },
  {
    id: "dwarf",
    name: "Dwarf",
    desc: "One extra armor; one additional daily crown.",
  },
  {
    id: "orc",
    name: "Orc",
    desc: "One extra nonmagical melee attack; one additional daily ration.",
  },
];
export function campaignTasks(s) {
  return [
    {
      id: "farm",
      name: "Investigate Ashbrook Farm",
      done: !!s.siteProgress["farm-clue-13"],
      target: 13,
    },
    {
      id: "escort",
      name: "Escort Merrit to Saltbridge",
      done: ["arrived", "settled"].includes(s.travelers.merrit),
      target: 3,
    },
    {
      id: "stronghold",
      name: "Defeat Captain Venn at Briarhide",
      done: s.strongholds.briar.cleared,
      target: 12,
    },
  ];
}
export function beginCampaign(s) {
  if (
    s.location !== 0 ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    s.campaign.phase !== "unstarted"
  )
    return false;
  s.campaign = { phase: "inquiry", branch: null };
  for (const site of [12, 13])
    if (!s.discovered.includes(site)) s.discovered.push(site);
  note(
    s,
    "The Broken Road — Hungry Roads: investigate Ashbrook, escort Merrit, and break Briarhide. Greyhaven's food shortage raises prices until grain returns.",
  );
  updateCampaign(s);
  return true;
}
export function refreshStrongholds(s) {
  const h = s.strongholds?.briar;
  if (!h) return;
  const wave = s.patrols.find((p) => p.id === "briar-raiders");
  if (h.cleared) {
    for (const p of s.patrols)
      if (["briar-raiders", "road-bandits"].includes(p.id)) p.cleared = true;
    return;
  }
  if (wave?.cleared && s.day - h.lastSpawn >= 2) {
    Object.assign(wave, { x: 470, y: 490, waypoint: 0, cleared: false });
    h.lastSpawn = s.day;
    h.waves++;
    note(
      s,
      "Briarhide sends another raiding party onto the Greyhaven road. Defeat its leader to stop the raids.",
    );
  }
}
export function clearStronghold(s) {
  if (s.strongholds.briar.cleared) return false;
  s.strongholds.briar.cleared = true;
  markResettlement(s, "briar", 12);
  refreshStrongholds(s);
  note(
    s,
    "Captain Venn is defeated. Briarhide stops sending raiders; the nearby road is safer. Sealed grain and a weapons invoice remain in the stockade.",
  );
  updateCampaign(s);
  return true;
}
export function updateCampaign(s) {
  if (
    s.travelers?.merrit === "escorting" &&
    s.location === 3 &&
    !s.battle &&
    !s.event &&
    Math.hypot(s.position.x - places[3].x, s.position.y - places[3].y) <=
      entryRadius(places[3])
  ) {
    s.travelers.merrit = "arrived";
    note(
      s,
      "Merrit reaches Saltbridge safely. Visit him in the village to collect the escort payment.",
    );
  }
  if (
    s.campaign?.phase === "inquiry" &&
    campaignTasks(s).every((t) => t.done)
  ) {
    s.campaign.phase = "grain";
    note(
      s,
      "The trail is complete. Return to Briarhide and decide who receives the recovered grain.",
    );
  }
}
export function campaignAction(s, action) {
  if (s.battle || s.event || s.campOpen || companyLost(s)) return false;
  if (
    action === "escort" &&
    s.location === 0 &&
    s.campaign.phase !== "unstarted" &&
    s.travelers.merrit === "waiting"
  ) {
    s.travelers.merrit = "escorting";
    note(
      s,
      "Merrit and his cart join the company for the trip to Saltbridge. Defeat or retreat loses the escort; you can retry from Greyhaven.",
    );
    return true;
  }
  if (action === "grain" && s.location === 12 && s.campaign.phase === "grain") {
    s.event = {
      kind: "campaign",
      title: "The missing grain",
      text: "Captured grain bears the League's seal. Hungry families claim it was taken from their harvest. League: 90 crowns and cheaper food. Villagers: 55 crowns, a restored farm and cheaper food. Company: 16 rations and 25 crowns, but wanted status and lasting shortages.",
    };
    return true;
  }
  if (
    action === "report" &&
    s.location === 0 &&
    s.campaign.phase === "return"
  ) {
    s.campaign.phase = "completed";
    s.gold +=
      s.campaign.branch === "league"
        ? 90
        : s.campaign.branch === "villagers"
          ? 55
          : 25;
    s.knowledge += 3;
    s.renown += 5;
    if (s.campaign.branch === "league") {
      changeReputation(s, "guild", 8);
      changeReputation(s, "freefolk", -2);
    } else if (s.campaign.branch === "villagers") {
      changeReputation(s, "freefolk", 8);
      changeReputation(s, "guild", -2);
    } else {
      changeReputation(s, "guild", -8);
      registerCrime(s, true);
    }
    grantEquipment(s, "roadwarden-spear");
    note(
      s,
      "Hungry Roads completed. Venn's invoice points to Iron Hollow, setting up the next chapter. Your grain decision changes Greyhaven's food prices.",
    );
    return true;
  }
  return false;
}
export function chooseGrain(s, branch) {
  if (
    s.event?.kind !== "campaign" ||
    s.campaign.phase !== "grain" ||
    !["league", "villagers", "company"].includes(branch)
  )
    return false;
  s.campaign.branch = branch;
  s.campaign.phase = "return";
  if (branch === "company") s.food += 16;
  else if (branch === "villagers") s.travelers.farmRebuilt = true;
  s.event = null;
  note(
    s,
    `Recovered grain: ${branch === "league" ? "return it to the League" : branch === "villagers" ? "feed the villages" : "keep sixteen rations"}. Return to Greyhaven for the chapter payment.`,
  );
  return true;
}
function loseEscort(s) {
  failCaravanEscort(s);
  if (s.travelers?.merrit === "escorting") {
    s.travelers.merrit = "waiting";
    note(
      s,
      "Merrit abandons the dangerous escort. He waits in Greyhaven for another attempt.",
    );
  }
}
export function roadFoodModifier(s) {
  if (s.location === 3 && s.travelers?.merrit === "settled") return 0.9;
  if (s.location !== 0) return 1;
  let value =
    s.campaign?.phase === "unstarted"
      ? 1
      : s.campaign?.phase === "completed"
        ? s.campaign.branch === "company"
          ? 1.25
          : 0.85
        : 1.25;
  if (s.travelers?.farmRebuilt) value *= 0.9;
  return value;
}
export function travelerAction(s, action) {
  if (
    s.battle ||
    (s.event && s.event.kind !== "farm") ||
    s.campOpen ||
    companyLost(s)
  )
    return false;
  if (
    action === "rescue" &&
    s.location === 13 &&
    s.travelers.tamsin === "unknown" &&
    s.inventory.medicine >= 1
  ) {
    s.inventory.medicine--;
    s.travelers.tamsin = "rescued";
    changeReputation(s, "freefolk", 2);
    note(
      s,
      "Sella, an injured farmhand, returns to Greyhaven. Meet her there once she recovers.",
    );
    return true;
  }
  if (
    action === "meet" &&
    s.location === 0 &&
    s.travelers.tamsin === "rescued"
  ) {
    s.travelers.tamsin = "settled";
    s.inventory.herbs += 4;
    note(
      s,
      "Sella remembers your help. She brings four herbs and offers to rebuild Ashbrook Farm.",
    );
    return true;
  }
  if (
    action === "rebuild" &&
    s.location === 13 &&
    !s.travelers.farmRebuilt &&
    s.inventory.wood >= 6 &&
    s.gold >= 20 &&
    ["rescued", "settled"].includes(s.travelers.tamsin)
  ) {
    s.inventory.wood -= 6;
    s.gold -= 20;
    s.travelers.farmRebuilt = true;
    spendHours(s, 4);
    note(
      s,
      "Ashbrook Farm is rebuilt. Fields return to cultivation, Greyhaven food costs fall, and the farm yields four rations every three days.",
    );
    return true;
  }
  if (
    action === "harvest" &&
    s.location === 13 &&
    s.travelers.farmRebuilt &&
    (s.travelers.harvestDay < 0 || s.day - s.travelers.harvestDay >= 3)
  ) {
    s.travelers.harvestDay = s.day;
    s.food += 4;
    note(
      s,
      "Ashbrook's farmers remember the company: four rations from the new harvest.",
    );
    return true;
  }
  if (
    action === "merrit" &&
    s.location === 3 &&
    s.travelers.merrit === "arrived"
  ) {
    s.travelers.merrit = "settled";
    s.gold += 50;
    changeReputation(s, "guild", 3);
    note(
      s,
      "Merrit pays fifty crowns and settles in Saltbridge. Your escort helped restore this trade connection.",
    );
    return true;
  }
  return false;
}
export function personalQuestInfo(p) {
  return p.profession === "Smith"
    ? { target: 4, goal: "Find the lost smith's tools at Iron Hollow" }
    : p.profession === "Herbalist"
      ? { target: 13, goal: "Gather family remedies at Ashbrook Farm" }
      : { target: 12, goal: "Find proof of a safe home beyond Briarhide" };
}
export function advancePersonalQuest(s, id, choice) {
  const p = s.party[id];
  if (!p || p.dead || s.battle || s.event || companyLost(s)) return false;
  p.personalQuest ||= {
    stage: p.storyComplete === "supported" ? 1 : 0,
    outcome: null,
  };
  const q = p.personalQuest;
  if (
    choice === "reconcile" &&
    s.campOpen &&
    q.stage === 3 &&
    q.outcome === "claimed" &&
    s.gold >= 15
  ) {
    s.gold -= 15;
    q.outcome = "reconciled";
    changeResolve(p, 15);
    growPartyBonds(s, 5);
    note(s, `${p.name}'s rivalry softens after an honest apology.`);
    return true;
  }
  if (
    choice === "reconcile" &&
    s.campOpen &&
    p.storyComplete === "refused" &&
    q.stage === 0 &&
    s.gold >= 15
  ) {
    s.gold -= 15;
    p.storyComplete = "supported";
    q.stage = 1;
    changeResolve(p, 10);
    growPartyBonds(s, 2);
    note(
      s,
      `${p.name} accepts an apology. Their personal journey can continue.`,
    );
    return true;
  }
  if (
    choice === "investigate" &&
    !s.campOpen &&
    q.stage === 1 &&
    s.location === personalQuestInfo(p).target
  ) {
    if (s.location === 12 && !s.strongholds.briar.cleared) return false;
    if (
      s.location === 4 &&
      !s.siteProgress["cart-4"] &&
      !s.siteProgress["deposit-4-1"] &&
      !s.siteProgress["deposit-4-5"]
    ) {
      note(
        s,
        "Search Iron Hollow's cart or mine a deposit before recovering the smith's keepsake.",
      );
      return false;
    }
    if (s.location === 13 && !s.siteProgress["farm-well-13"]) {
      note(s, "Search Ashbrook's well before gathering the family remedies.");
      return false;
    }
    q.stage = 2;
    note(
      s,
      `${p.name}: a personal discovery at ${places[s.location].name}. Discuss its future at camp.`,
    );
    return true;
  }
  if (s.campOpen && q.stage === 2 && ["share", "claim"].includes(choice)) {
    q.stage = 3;
    q.outcome = choice === "share" ? "shared" : "claimed";
    if (choice === "share") {
      p.personalPerk =
        p.role === "Wizard"
          ? "arcanefocus"
          : p.role === "Cleric"
            ? "restorer"
            : p.role === "Shieldbearer"
              ? "guardian"
              : p.role === "Archer"
                ? "keeneye"
                : p.role === "Spearman"
                  ? "watchful"
                  : "linebreaker";
      changeResolve(p, 15);
      for (const other of livingParty(s))
        if (other !== p)
          s.bonds[bondKey(id, other.id)] = Math.min(
            100,
            bondValue(s, id, other.id) + 5,
          );
      note(
        s,
        `${p.name} shares their discovery and earns ${p.personalPerk}. Bonds strengthen.`,
      );
    } else {
      s.gold += 35;
      changeResolve(p, -25);
      const rival = livingParty(s).find((other) => other !== p);
      if (rival)
        s.bonds[bondKey(id, rival.id)] = Math.max(
          0,
          bondValue(s, id, rival.id) - 15,
        );
      note(
        s,
        `${p.name}'s discovery is sold for thirty-five crowns. A rivalry grows; low loyalty and unpaid wages can lead to departure.`,
      );
    }
    return true;
  }
  return false;
}
export function weaponPositionBonus(s, p) {
  const u = s.battle?.units.find((u) => u.id === p.id);
  return p.role === "Archer" &&
    u &&
    !u.moved &&
    ((equippedItem(s, p, "weapon")?.durability || 0) > 0 ||
      p.personalPerk === "keeneye")
    ? 2 + (p.personalPerk === "keeneye" ? 1 : 0)
    : 0;
}
export function braceSpear(s, id) {
  const u = s.battle?.units.find((u) => u.id === id),
    p = s.party[id],
    weapon = p && equippedItem(s, p, "weapon");
  if (
    !u ||
    u.acted ||
    p.hp <= 0 ||
    p.role !== "Spearman" ||
    !weapon ||
    weapon.durability <= 0
  )
    return false;
  u.acted = true;
  u.spearBrace = true;
  note(
    s,
    `${p.name} braces their spear: the next enemy entering two-tile reach takes a reaction hit and stops.`,
  );
  return true;
}
function spearApproach(s, e, to) {
  for (const u of s.battle.units) {
    const p = s.party[u.id];
    if (
      !u.spearBrace ||
      p.hp <= 0 ||
      Math.abs(e.x - u.x) + Math.abs(e.y - u.y) <= 2 ||
      Math.abs(to.x - u.x) + Math.abs(to.y - u.y) > 2 ||
      !hasLineOfSight(s, u, to)
    )
      continue;
    u.spearBrace = false;
    hitEnemy(s, e, attackPower(s, p) + (p.personalPerk === "watchful" ? 2 : 0));
    e.root = 1;
    note(s, `${p.name}'s spear intercepts ${e.name || e.kind}.`);
    break;
  }
}
export function shieldLaneBlocked(s, from, to) {
  return (
    s.battle?.units.some(
      (u) =>
        s.party[u.id].hp > 0 &&
        u.guard &&
        (equippedItem(s, s.party[u.id], "shield")?.durability || 0) > 0 &&
        Math.abs(from.x - u.x) + Math.abs(from.y - u.y) === 1 &&
        Math.abs(to.x - u.x) + Math.abs(to.y - u.y) > 1,
    ) || false
  );
}
equipmentCatalog.push({
  id: "roadwarden-spear",
  name: "Roadwarden spear",
  role: "Spearman",
  slot: "weapon",
  tier: 2,
  rarity: "Unique",
  bonus: 3,
  price: 95,
  perk: "reach",
  uniqueBoss: "broken-road",
});
export function isCaster(p) {
  return ["Wizard", "Cleric", "Druid", "Paladin"].includes(p?.role);
}
export const spellBook = [
  {
    id: "aether",
    name: "Aether dart",
    role: "Wizard",
    level: 1,
    range: 4,
    power: 7,
    kind: "damage",
    piercing: true,
  },
  {
    id: "veil",
    name: "Stone veil",
    role: "Wizard",
    level: 1,
    range: 3,
    kind: "ward",
    power: 4,
  },
  {
    id: "cinder",
    name: "Cinder bloom",
    role: "Wizard",
    level: 2,
    range: 4,
    power: 9,
    kind: "damage",
    area: true,
    ore: 1,
  },
  {
    id: "mend",
    name: "Restoring light",
    role: "Cleric",
    level: 1,
    range: 3,
    power: 8,
    kind: "heal",
    herbs: 1,
  },
  {
    id: "sun",
    name: "Sun lance",
    role: "Cleric",
    level: 2,
    range: 4,
    power: 10,
    kind: "damage",
    herbs: 1,
    piercing: true,
  },
  {
    id: "oath",
    name: "Shelter oath",
    role: "Cleric",
    level: 2,
    range: 3,
    power: 5,
    kind: "ward",
    area: true,
    herbs: 1,
  },
];
export function spellSlots(p) {
  if (!isCaster(p)) return { 1: 0, 2: 0 };
  return {
    1: Math.max(
      0,
      Math.min(4, 2 + Math.floor((p.level - 1) / 2)) - (p.spellSpent?.[1] || 0),
    ),
    2: Math.max(
      0,
      (p.level >= 3 ? Math.min(2, 1 + Math.floor((p.level - 3) / 3)) : 0) -
        (p.spellSpent?.[2] || 0),
    ),
  };
}
export function spellLock(s, id, spellId, x, y) {
  const p = s.party[id],
    u = s.battle?.units.find((u) => u.id === id),
    spell = spellsFor(p).find((v) => v.id === spellId);
  if (spell?.kind === "explore")
    return "Use this spell while exploring, outside combat.";
  if (u?.wildshape) return "Leave animal form before casting.";
  if (!spell || !u || p.hp <= 0 || p.dead || u.acted)
    return "Caster unavailable or action spent.";
  if (
    s.battle.realmMagic?.surfaces.some(
      (v) =>
        v.kind === "silence" &&
        v.turns > 0 &&
        Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 1,
    )
  )
    return "Silence prevents casting here.";
  if (p.wound?.type === "concussion" && spell.level === 2)
    return "Concussion prevents level-two casting until recovery.";
  if (spellSlots(p)[spell.level] < 1)
    return `No level ${spell.level} slots. Recover magic at camp or Emberfall.`;
  if (
    s.inventory.herbs < (spell.herbs || 0) ||
    s.inventory.ore < (spell.ore || 0)
  )
    return "Missing spell reagents.";
  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x > 8 ||
    y < 0 ||
    y > 6
  )
    return "Select a battlefield target.";
  if (
    Math.abs(x - u.x) + Math.abs(y - u.y) > spellRange(p, spell) ||
    !hasLineOfSight(s, u, { x, y })
  )
    return "Target out of range or sight.";
  if (["surface", "concentration"].includes(spell.kind))
    return terrainCell(s, x, y).blocked ? "Choose open ground." : "";
  const target = ["damage", "illusion", "counter"].includes(spell.kind)
    ? s.battle.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y)
    : s.battle.units.find(
        (v) => s.party[v.id].hp > 0 && v.x === x && v.y === y,
      );
  if (!target)
    return ["damage", "illusion", "counter"].includes(spell.kind)
      ? "Select a living enemy."
      : "Select a conscious ally.";
  if (
    spell.kind === "counter" &&
    !["mage", "cultist", "necromancer", "shaman", "sorcerer"].includes(
      target.kind,
    )
  )
    return "Choose an enemy spellcaster.";
  if (
    spell.kind === "heal" &&
    s.party[target.id].hp >= s.party[target.id].max &&
    !target.poison
  )
    return "That ally is already healthy.";
  return "";
}
export function castSpell(s, id, spellId, x, y) {
  if (spellLock(s, id, spellId, x, y)) return false;
  const p = s.party[id],
    u = s.battle.units.find((u) => u.id === id),
    spell = spellBook.find((v) => v.id === spellId);
  p.spellSpent ||= { 1: 0, 2: 0 };
  p.spellSpent[spell.level] = (p.spellSpent[spell.level] || 0) + 1;
  s.inventory.herbs -= spell.herbs || 0;
  s.inventory.ore -= spell.ore || 0;
  u.acted = true;
  combatCue(
    s,
    spell.kind === "heal" ? "heal" : spell.kind === "ward" ? "ward" : "spell",
    u,
    { x, y },
  );
  if (castRealmMagic(s, p, u, spell, x, y)) return true;
  const targets = ["damage", "illusion"].includes(spell.kind)
    ? s.battle.enemies.filter(
        (e) =>
          e.hp > 0 &&
          (spell.area
            ? Math.abs(e.x - x) + Math.abs(e.y - y) <= 1
            : e.x === x && e.y === y),
      )
    : s.battle.units.filter(
        (v) =>
          s.party[v.id].hp > 0 &&
          (spell.area
            ? Math.abs(v.x - x) + Math.abs(v.y - y) <= 1
            : v.x === x && v.y === y),
      );
  for (const target of targets) {
    if (!hasLineOfSight(s, u, target)) continue;
    if (spell.kind === "damage") {
      hitEnemy(
        s,
        target,
        spell.power +
          (p.personalPerk === "arcanefocus" ? 2 : 0) +
          (gearPerk(s, p, "focus") ? 2 : 0) +
          Math.floor(p.level / 2) +
          (p.spellSchool === "elemental" ? 3 : 0) +
          (p.spellSchool === "zeal" ? 3 : 0) +
          (spell.piercing ? enemyArmor(s, target) : 0),
      );
      if (
        p.spellSchool === "elemental" &&
        ["cinder", "firestorm"].includes(spell.id) &&
        target.hp > 0
      )
        target.burn = 2;
      if (spell.root && target.hp > 0)
        target.root = Math.max(target.root || 0, spell.root);
      if (spell.interrupt && target.casting) {
        target.casting = null;
        note(
          s,
          "Rebuke interrupts the enemy's prepared spell. Its slot remains spent.",
        );
      }
    } else if (spell.kind === "illusion") target.distracted = 2;
    else if (spell.kind === "heal") {
      target.poison = 0;
      s.party[target.id].hp = Math.min(
        s.party[target.id].max,
        s.party[target.id].hp +
          spell.power +
          p.level +
          (p.personalPerk === "restorer" ? 2 : 0) +
          (p.spellSchool === "restoration" ? 4 : 0),
      );
      if (
        p.spellSchool === "restoration" &&
        s.party[target.id].hp === s.party[target.id].max
      )
        s.party[target.id].injury = false;
    } else
      target.arcaneWard =
        spell.power +
        (p.talent === "greenheart" ? 2 : 0) +
        (gearPerk(s, p, "focus") ? 2 : 0) +
        (["barrier", "guardian"].includes(p.spellSchool) ? 3 : 0);
  }
  note(
    s,
    `${p.name} casts ${spell.name}; one level ${spell.level} slot spent${spell.herbs ? " and herbs consumed" : spell.ore ? " and ore consumed" : ""}.`,
  );
  if (s.battle.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}
export function recoverMagic(s) {
  const casters = livingParty(s).filter(
    (p) => isCaster(p) && Object.values(p.spellSpent || {}).some((v) => v > 0),
  );
  if (!casters.length || s.battle || s.event || companyLost(s)) return false;
  if (s.campOpen) {
    if (s.food < casters.length * 2 || s.inventory.herbs < casters.length * 2)
      return false;
    s.food -= casters.length * 2;
    s.inventory.herbs -= casters.length * 2;
    spendHours(s, 6, { resting: true });
  } else {
    if (s.location !== 6 || s.gold < casters.length * 15) return false;
    s.gold -= casters.length * 15;
    spendHours(s, 2);
  }
  for (const p of casters) if (!p.dead) p.spellSpent = { 1: 0, 2: 0 };
  note(
    s,
    "Spell slots restored. Camp meditation consumes food, herbs, and six hours; Emberfall temple services charge crowns.",
  );
  return true;
}

equipmentPerks.focus =
  "Spell damage and wards gain two power; slots and reagents are still consumed.";
equipmentCatalog.push({
  id: "beacon-staff",
  name: "Beacon focus staff",
  role: "Wizard",
  slot: "weapon",
  tier: 2,
  rarity: "Fine",
  bonus: 2,
  price: 90,
  perk: "focus",
});
export function fieldHealing(s, id, targetId) {
  const p = s.party[id],
    target = s.party[targetId];
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    p?.role !== "Cleric" ||
    p.dead ||
    p.hp <= 0 ||
    !target ||
    target.dead ||
    target.hp <= 0 ||
    target.hp >= target.max ||
    spellSlots(p)[1] < 1 ||
    s.inventory.herbs < 1
  )
    return false;
  p.spellSpent ||= { 1: 0, 2: 0 };
  p.spellSpent[1] = (p.spellSpent[1] || 0) + 1;
  s.inventory.herbs--;
  target.hp = Math.min(
    target.max,
    target.hp +
      8 +
      p.level +
      (p.personalPerk === "restorer" ? 2 : 0) +
      (p.spellSchool === "restoration" ? 4 : 0),
  );
  if (target.hp === target.max) target.injury = false;
  spendHours(s, 1);
  note(
    s,
    `${p.name} treats ${target.name} with Restoring light. One level-one slot, one herb and one hour spent.`,
  );
  return true;
}

export function isHidden(s) {
  return concealmentLevel(s) >= 60;
}
export function toggleStealth(s) {
  if (s.battle || s.event || s.campOpen || companyLost(s)) return false;
  s.stealth.active = !s.stealth.active;
  if (!s.stealth.active) {
    s.stealth.concealment = 0;
    s.ambushReady = false;
  }
  note(
    s,
    s.stealth.active
      ? "Keep still to conceal the company. Forest and darkness help; sneaking is slower. At 60% you evade authorities; at 75% you can ambush."
      : "The company leaves hiding.",
  );
  return true;
}
export function advanceStealth(s, seconds, moving = !!s.destination) {
  if (
    !s.stealth.active ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    return false;
  const forest = terrainAt(s.position) === "forest";
  const night = s.timeOfDay < 6 || s.timeOfDay >= 19;
  let rate = moving
    ? forest
      ? -4
      : -12
    : (forest ? 16 : night ? 10 : 6) + (travelWorker(s, "scout") ? 4 : 0);
  if (
    s.patrols.some(
      (p) =>
        !p.cleared &&
        p.kind !== "merchant" &&
        !passageSafe(s, p) &&
        Math.hypot(p.x - s.position.x, p.y - s.position.y) < 22,
    )
  )
    rate = -25;
  s.stealth.concealment = Math.max(
    0,
    Math.min(100, s.stealth.concealment + rate * Math.min(seconds, 5)),
  );
  if (s.stealth.concealment < 75) s.ambushReady = false;
  return true;
}
function passageSafe(s, p) {
  return (p.passageUntil || 0) > s.day * 24 + s.timeOfDay;
}
export function banditDemand(s, id) {
  return id === "briar-raiders"
    ? 35
    : 20 + Math.min(30, Math.floor(s.renown / 5) * 5);
}
export function confrontPatrol(s, id) {
  const p = nearbyPatrols(s).find((p) => p.id === id);
  if (
    !p ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    passageSafe(s, p)
  )
    return false;
  if (canAutoAmbush(s, p) || s.ambushReady) return startBattle(s, id);
  if (p.kind !== "bandits" || p.id === "warden-pursuit")
    return startBattle(s, id);
  s.destination = null;
  s.stealth = { active: false, concealment: 0 };
  s.event = { kind: "negotiation", patrolId: id };
  note(
    s,
    `${p.name} block the road and demand ${banditDemand(s, id)} crowns. Pay, offer provisions, or refuse and fight.`,
  );
  return true;
}
export function negotiateBandits(s, choice) {
  const e = s.event;
  const p =
    e?.kind === "negotiation" &&
    s.patrols.find((p) => p.id === e.patrolId && !p.cleared);
  if (
    !p ||
    !["gold", "food", "refuse"].includes(choice) ||
    s.battle ||
    companyLost(s)
  )
    return false;
  const gold = banditDemand(s, p.id);
  if ((choice === "gold" && s.gold < gold) || (choice === "food" && s.food < 8))
    return false;
  s.event = null;
  if (choice === "refuse") {
    note(s, "The offer is refused. Weapons are drawn.");
    return startBattle(s, p.id);
  }
  if (choice === "gold") s.gold -= gold;
  else s.food -= 8;
  p.passageUntil = s.day * 24 + s.timeOfDay + 8;
  note(
    s,
    `${p.name} accept ${choice === "gold" ? gold + " crowns" : "8 rations"}. They leave you alone for eight game hours.`,
  );
  return true;
}

// Specialists make scouting an earned company capability, while chance encounters
// still occur naturally for companies without a scout.
export function companyScout(s) {
  return (
    travelWorker(s, "scout") ||
    s.party.find(
      (p) =>
        !p.dead &&
        p.hp > 0 &&
        (["Archer", "Rogue"].includes(p.role) || p.profession === "Thief"),
    ) ||
    null
  );
}
export const travelRoles = [
  {
    id: "scout",
    name: "Scout",
    desc: "Archer or Thief. Reveals thirty extra pixels of land and builds concealment faster.",
  },
  {
    id: "quartermaster",
    name: "Quartermaster",
    desc: "Requires a company wagon. Saves one daily ration by managing its supplies.",
  },
  {
    id: "rearguard",
    name: "Rear guard",
    desc: "Requires a company wagon and a martial companion. Starts battles braced and reduces supply losses when retreating.",
  },
];
function travelEligible(s, p, role) {
  return (
    !!p &&
    !p.dead &&
    p.hp > 0 &&
    (role === "scout"
      ? ["Archer", "Rogue"].includes(p.role) || p.profession === "Thief"
      : s.wagon.owned && (role !== "rearguard" || !isCaster(p)))
  );
}
export function travelWorker(s, role) {
  const p = s.party[s.travelJobs?.[role]];
  return travelEligible(s, p, role) ? p : null;
}
export function assignTravelJob(s, role, id) {
  if (
    !travelRoles.some((v) => v.id === role) ||
    s.battle ||
    s.event ||
    companyLost(s)
  )
    return false;
  if (id === null) {
    delete s.travelJobs[role];
    return true;
  }
  const p = s.party[id];
  if (!Number.isInteger(id) || !travelEligible(s, p, role)) return false;
  for (const key of Object.keys(s.travelJobs))
    if (s.travelJobs[key] === id) delete s.travelJobs[key];
  s.travelJobs[role] = id;
  note(
    s,
    `${p.name} takes the ${travelRoles.find((v) => v.id === role).name} travel duty.`,
  );
  return true;
}
export function companyCargoCapacity(s) {
  return (
    cargoCapacity + (s.wagon?.owned ? 10 + (s.wagon.storage || 0) * 10 : 0)
  );
}
export function buyCompanyWagon(s, claim = false) {
  if (townAccessLock(s)) return false;
  if (
    s.wagon.owned ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    places[s.location]?.type !== "town"
  )
    return false;
  if (claim ? s.campaign.phase !== "completed" : s.gold < 250) return false;
  if (!claim) s.gold -= 250;
  s.wagon = { owned: true, storage: 0, workbench: 0, rails: 0, condition: 100 };
  note(
    s,
    claim
      ? "The road settlement awards your company a wagon. Cargo capacity rises to thirty."
      : "Purchased a company wagon for 250 crowns. Cargo capacity rises to thirty.",
  );
  return true;
}
export const wagonUpgrades = [
  {
    id: "storage",
    name: "Cargo racks",
    max: 2,
    gold: 50,
    wood: 5,
    ore: 1,
    desc: "Ten more cargo spaces per level.",
  },
  {
    id: "workbench",
    name: "Portable workbench",
    max: 1,
    gold: 70,
    wood: 4,
    ore: 3,
    desc: "A camp Smith can repair gear without a forge; fine crafting uses one less ore.",
  },
  {
    id: "rails",
    name: "Reinforced rails",
    max: 1,
    gold: 60,
    wood: 4,
    ore: 4,
    desc: "Reduces damage and supply losses when the company retreats or is defeated.",
  },
];
export function upgradeWagon(s, id) {
  const u = wagonUpgrades.find((v) => v.id === id);
  if (
    !u ||
    !s.wagon.owned ||
    !s.campOpen ||
    s.battle ||
    s.event ||
    companyLost(s) ||
    s.wagon[id] >= u.max ||
    s.gold < u.gold ||
    s.inventory.wood < u.wood ||
    s.inventory.ore < u.ore
  )
    return false;
  s.gold -= u.gold;
  s.inventory.wood -= u.wood;
  s.inventory.ore -= u.ore;
  s.wagon[id]++;
  note(s, `${u.name} installed on the company wagon.`);
  return true;
}
export function repairWagon(s) {
  const smith = s.campOpen && professional(s, "Smith");
  if (
    !s.wagon.owned ||
    s.wagon.condition >= 100 ||
    !smith ||
    s.battle ||
    s.event ||
    s.gold < 20 ||
    s.inventory.ore < 2
  )
    return false;
  s.gold -= 20;
  s.inventory.ore -= 2;
  s.wagon.condition = Math.min(100, s.wagon.condition + 40);
  practice(s, smith, 1);
  spendHours(s, 2);
  note(
    s,
    "The Smith restores forty wagon condition for twenty crowns and two ore.",
  );
  return true;
}
function damageCompanyWagon(s) {
  if (!s.wagon.owned) return;
  const protection =
    (s.wagon.rails && s.wagon.condition > 0 ? 1 : 0) +
    (travelWorker(s, "rearguard") ? 1 : 0);
  const food = Math.min(s.food, Math.max(1, 6 - protection * 2));
  s.food -= food;
  s.wagon.condition = Math.max(
    0,
    s.wagon.condition - Math.max(5, 20 - protection * 7),
  );
  let lost = Math.max(1, 4 - protection);
  for (const good of tradeGoods) {
    const amount = Math.min(s.cargo[good.id], lost);
    s.cargo[good.id] -= amount;
    lost -= amount;
  }
  note(
    s,
    `The wagon loses ${food} rations and some carried trade goods during the retreat. Rails and a rear guard protect supplies.`,
  );
}
export function strongholdScoutLock(s) {
  if (s.battle || s.event || s.campOpen || companyLost(s))
    return "Return to the map first.";
  if (!companyScout(s)) return "Requires a conscious Archer, Rogue or Thief.";
  if (
    Math.hypot(s.position.x - places[12].x, s.position.y - places[12].y) > 110
  )
    return "Approach Briarhide within 110 pixels.";
  if (s.strongholds.briar.cleared) return "The stronghold is already cleared.";
  return null;
}
export function scoutStronghold(s) {
  if (strongholdScoutLock(s) || s.strongholdIntel.scouted) return false;
  const scout = companyScout(s);
  s.destination = null;
  spendHours(s, 1);
  if (companyLost(s) || !companyScout(s)) return false;
  s.strongholdIntel.scouted = true;
  if (scout.profession === "Thief") practice(s, scout, 1);
  note(
    s,
    "Briarhide scouted: Captain Venn and three sentries guard the vault. A supply shed, captive scout, weak stores and drainage entrance offer infiltration opportunities.",
  );
  return true;
}
export function infiltrationLock(s, action) {
  const lock = strongholdScoutLock(s);
  if (lock) return lock;
  if (!s.strongholdIntel.scouted) return "Scout the stronghold first.";
  if (!isHidden(s))
    return "Build at least sixty percent concealment before infiltrating.";
  if (!["supplies", "prisoner", "sabotaged", "entry"].includes(action))
    return "Unknown infiltration action.";
  if (s.strongholdIntel[action]) return "Already completed.";
  if (action === "prisoner" && livingParty(s).length >= 6)
    return "Make space: the company can house six companions.";
  if (action === "sabotaged" && s.inventory.ore < 2)
    return "Sabotage requires two ore.";
  return null;
}
export function infiltrateStronghold(s, action) {
  if (infiltrationLock(s, action)) return false;
  const scout = companyScout(s);
  s.destination = null;
  s.strongholdIntel[action] = true;
  if (action === "supplies") {
    s.food += 6;
    s.inventory.medicine += 2;
    s.inventory.ore += 3;
  }
  if (action === "sabotaged") s.inventory.ore -= 2;
  if (action === "prisoner") {
    const vacancy = s.party.findIndex((p) => p.dead);
    const id = vacancy >= 0 ? vacancy : s.party.length;
    for (const role of travelRoles)
      if (s.travelJobs[role.id] === id) delete s.travelJobs[role.id];
    delete s.realm.lineage[id];
    delete s.expedition.careers[id];
    delete s.odyssey.journeys[id];
    if (s.party[id]) s.party[id].wound = null;
    s.party[id] = {
      ...fresh().party[3],
      id,
      name: "Edda",
      race: "orc",
      profession: "Thief",
      professionXP: 0,
      professionXPBy: {},
      traits: ["tireless"],
      equipment: {},
      personalQuest: { stage: 0, outcome: null },
      coat: "#847a58",
      spellSpent: { 1: 0, 2: 0 },
    };
    s.renown += 2;
    changeReputation(s, "freefolk", 3);
  }
  if (scout.profession === "Thief") practice(s, scout, 1);
  s.stealth.concealment = Math.max(0, s.stealth.concealment - 25);
  s.ambushReady = false;
  spendHours(s, 1);
  note(
    s,
    {
      supplies:
        "Stole six rations, two medicine and three ore without confronting the leader.",
      prisoner:
        "Edda, a captive orc scout, joins as a Spearman and Thief. Her food requirement is higher, but she can scout and infiltrate.",
      sabotaged:
        "Sabotaged the defenders' stores. The next assault reduces each defender's health by eight and damage by two.",
      entry:
        "Opened the drainage entrance. Entering Briarhide now begins beside the eastern stockade instead of at the main gate.",
    }[action],
  );
  return true;
}

function restoreExpansionState(s, raw) {
  if (s.battle) {
    s.battle.traps = (Array.isArray(raw.battle.traps) ? raw.battle.traps : [])
      .filter(
        (t) =>
          Number.isInteger(t.x) &&
          Number.isInteger(t.y) &&
          t.x >= 0 &&
          t.x < 9 &&
          t.y >= 0 &&
          t.y < 7,
      )
      .slice(0, 6)
      .map((t) => ({ x: t.x, y: t.y, used: t.used === true }));
    for (const u of s.battle.units)
      u.snared = Number.isInteger(u.snared)
        ? Math.max(0, Math.min(2, u.snared))
        : 0;
    for (const enemy of s.battle.enemies) {
      if (enemy.kind === "mage") {
        enemy.mana = Number.isInteger(enemy.mana)
          ? Math.max(0, Math.min(2, enemy.mana))
          : 2;
        enemy.casting =
          enemy.casting &&
          Number.isInteger(enemy.casting.x) &&
          Number.isInteger(enemy.casting.y) &&
          enemy.casting.x >= 0 &&
          enemy.casting.x < 9 &&
          enemy.casting.y >= 0 &&
          enemy.casting.y < 7
            ? { x: enemy.casting.x, y: enemy.casting.y }
            : null;
      }
      enemy.burn = Number.isInteger(enemy.burn)
        ? Math.max(0, Math.min(2, enemy.burn))
        : 0;
      enemy.distracted = Number.isInteger(enemy.distracted)
        ? Math.max(0, Math.min(2, enemy.distracted))
        : 0;
    }
  }
  s.strongholdIntel = Object.fromEntries(
    ["scouted", "supplies", "prisoner", "sabotaged", "entry"].map((k) => [
      k,
      raw.strongholdIntel?.[k] === true,
    ]),
  );
  s.travelJobs = {};
  const used = new Set();
  for (const role of travelRoles) {
    const id = raw.travelJobs?.[role.id];
    if (
      Number.isInteger(id) &&
      !used.has(id) &&
      travelEligible(s, s.party[id], role.id)
    ) {
      s.travelJobs[role.id] = id;
      used.add(id);
    }
  }
  s.escortLedger = Object.fromEntries(
    Object.entries(raw.escortLedger || {}).filter(
      ([id, day]) =>
        caravanRoutes.some((r) => r.patrolId === id) &&
        Number.isInteger(day) &&
        day >= 1 &&
        day <= s.day,
    ),
  );
  s.caravanEscort = null;
  const e = raw.caravanEscort,
    route = caravanRoutes.find((r) => r.patrolId === e?.patrolId),
    p = s.patrols.find((p) => p.id === e?.patrolId);
  if (
    route &&
    p &&
    !p.cleared &&
    !p.hostile &&
    ["active", "arrived"].includes(e.status)
  )
    s.caravanEscort = {
      patrolId: route.patrolId,
      destination: route.destination,
      origin: route.origin,
      status: e.status,
      reward: route.reward,
    };
  for (const p of s.patrols.filter((p) => p.kind === "merchant")) {
    const saved = raw.patrols?.find((v) => v.id === p.id),
      attacker = s.patrols.find(
        (v) =>
          v.id === saved?.raid?.attackerId &&
          v.kind === "bandits" &&
          v.id !== "warden-pursuit" &&
          !v.cleared,
      );
    p.raid =
      !p.cleared && attacker && Number.isFinite(saved.raid.deadline)
        ? {
            attackerId: attacker.id,
            deadline: Math.max(
              0,
              Math.min(s.day * 24 + 24, saved.raid.deadline),
            ),
            dismissed: saved.raid.dismissed === true,
            demanded: saved.raid.demanded === true,
          }
        : null;
    p.raidCooldown = Number.isFinite(saved?.raidCooldown)
      ? Math.max(0, Math.min(s.day * 24 + 48, saved.raidCooldown))
      : 0;
    p.wreck =
      saved?.wreck && p.cleared
        ? {
            looted: saved.wreck.looted === true,
            food: Number.isInteger(saved.wreck.food)
              ? Math.max(0, Math.min(15, saved.wreck.food))
              : 0,
            cargo: Object.fromEntries(
              tradeGoods.map((g) => [
                g.id,
                Number.isInteger(saved.wreck.cargo?.[g.id])
                  ? Math.max(0, Math.min(10, saved.wreck.cargo[g.id]))
                  : 0,
              ]),
            ),
            gear: (Array.isArray(saved.wreck.gear) ? saved.wreck.gear : [])
              .filter((id) =>
                initialPatrols()
                  .find((v) => v.id === p.id)
                  ?.gearStock?.includes(id),
              )
              .slice(0, 1),
          }
        : null;
  }
  if (s.event?.kind === "caravan-raid") {
    const p = s.patrols.find((p) => p.id === s.event.patrolId);
    s.event = p?.raid ? { kind: "caravan-raid", patrolId: p.id } : null;
  }
  updateCaravanEscort(s);
}

export const caravanRoutes = [
  {
    patrolId: "caravan",
    origin: 0,
    destination: 3,
    reward: 65,
    cargo: "mixed provisions",
  },
  {
    patrolId: "wheat-caravan",
    origin: 0,
    destination: 3,
    reward: 80,
    cargo: "wheat",
  },
  {
    patrolId: "armor-caravan",
    origin: 6,
    destination: 0,
    reward: 125,
    cargo: "armor and iron",
  },
  {
    patrolId: "cloth-caravan",
    origin: 3,
    destination: 6,
    reward: 100,
    cargo: "cloth and salt",
  },
];
export function caravanEscortOffers(s) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    s.caravanEscort ||
    places[s.location]?.type !== "town"
  )
    return [];
  return caravanRoutes.filter(
    (r) =>
      r.origin === s.location &&
      (!s.escortLedger[r.patrolId] ||
        s.day - s.escortLedger[r.patrolId] >= 3) &&
      s.patrols.some(
        (p) => p.id === r.patrolId && !p.cleared && !p.hostile && !p.raid,
      ),
  );
}
export function acceptCaravanEscort(s, id) {
  if (townAccessLock(s)) return false;
  const route = caravanEscortOffers(s).find((r) => r.patrolId === id);
  if (!route || companyLost(s)) return false;
  const p = s.patrols.find((p) => p.id === id);
  s.caravanEscort = {
    patrolId: id,
    origin: route.origin,
    destination: route.destination,
    reward: route.reward,
    status: "active",
  };
  s.escortLedger[id] = s.day;
  p.x = s.position.x - 40;
  p.y = s.position.y + 25;
  note(
    s,
    `${p.name} joins your company at ${places[route.origin].name}. Protect its ${route.cargo} on the free route to ${places[route.destination].name}; collect ${route.reward} crowns there.`,
  );
  return true;
}
function updateCaravanEscort(s) {
  const escort = s.caravanEscort;
  if (!escort || escort.status !== "active") return;
  const p = s.patrols.find((p) => p.id === escort.patrolId);
  if (!p || p.cleared || p.hostile) {
    failCaravanEscort(s);
    return;
  }
  if (!p.raid) {
    p.x = Math.max(12, s.position.x - 40);
    p.y = Math.min(WORLD.height - 18, s.position.y + 25);
  }
  if (s.location === escort.destination && !s.battle && !s.event && !p.raid) {
    escort.status = "arrived";
    note(
      s,
      `${p.name} reaches ${places[escort.destination].name}. Claim its escort payment at the village board.`,
    );
  }
}
export function claimCaravanEscort(s) {
  const e = s.caravanEscort;
  if (
    !e ||
    e.status !== "arrived" ||
    s.location !== e.destination ||
    s.battle ||
    s.event ||
    s.campOpen
  )
    return false;
  const p = s.patrols.find((p) => p.id === e.patrolId);
  if (!p || p.cleared) return false;
  s.gold += e.reward;
  changeTownCondition(s, e.destination, 6);
  s.renown += 2;
  s.knowledge++;
  changeReputation(s, "guild", 3);
  note(
    s,
    `Protected cargo delivered. Earned ${e.reward} crowns and restored a League trade connection.`,
  );
  s.caravanEscort = null;
  p.raidCooldown = s.day * 24 + s.timeOfDay + 8;
  return true;
}
export function abandonCaravanEscort(s) {
  if (!s.caravanEscort || s.battle || s.event) return false;
  failCaravanEscort(s);
  return true;
}
function failCaravanEscort(s) {
  if (!s.caravanEscort) return;
  const name =
    s.patrols.find((p) => p.id === s.caravanEscort.patrolId)?.name ||
    "The caravan";
  s.caravanEscort = null;
  changeReputation(s, "guild", -3);
  note(
    s,
    `${name}'s escort failed. League trust falls; another contract may become available after three days if the wagon survives.`,
  );
}
export function beginCaravanRaid(s, merchantId, attackerId) {
  const p = s.patrols.find(
    (p) =>
      p.id === merchantId && p.kind === "merchant" && !p.cleared && !p.hostile,
  );
  const attacker = s.patrols.find(
    (p) =>
      p.id === attackerId &&
      p.kind === "bandits" &&
      p.id !== "warden-pursuit" &&
      !p.cleared,
  );
  const now = s.day * 24 + s.timeOfDay;
  if (
    !p ||
    !attacker ||
    attacker.faction ||
    p.raid ||
    (p.raidCooldown || 0) > now ||
    Math.hypot(p.x - attacker.x, p.y - attacker.y) > 36 ||
    s.patrols.some((v) => v.raid?.attackerId === attackerId)
  )
    return false;
  p.raid = { attackerId, deadline: now + 3, dismissed: false, demanded: false };
  note(
    s,
    `${attacker.name} attack ${p.name}. The wagon can hold out for three game hours. Intervene, bargain for payment, or leave the road to the raiders.`,
  );
  return true;
}
export function updateRoadConflicts(s) {
  const now = s.day * 24 + s.timeOfDay;
  for (const p of s.patrols.filter((p) => p.raid)) {
    const attacker = s.patrols.find((a) => a.id === p.raid.attackerId);
    if (!attacker || attacker.cleared) {
      p.raid = null;
      continue;
    }
    if (now < p.raid.deadline || s.battle?.caravanDefense === p.id) continue;
    p.wreck = {
      looted: false,
      food: Math.floor(p.foodStock / 2),
      cargo: Object.fromEntries(
        tradeGoods.map((g) => [g.id, Math.floor((p.cargo[g.id] || 0) / 2)]),
      ),
      gear: (p.gearStock || []).slice(0, 1),
    };
    p.cleared = true;
    p.raid = null;
    p.foodStock = 0;
    p.cargo = Object.fromEntries(tradeGoods.map((g) => [g.id, 0]));
    p.gearStock = [];
    if (s.caravanEscort?.patrolId === p.id) failCaravanEscort(s);
    note(
      s,
      `${p.name} is overrun. Its broken wagon and remaining cargo stay on the road.`,
    );
  }
}
function promptCaravanRaid(s) {
  if (s.battle || s.event || s.campOpen) return false;
  const p = s.patrols.find(
    (p) =>
      p.raid &&
      !p.raid.dismissed &&
      Math.hypot(p.x - s.position.x, p.y - s.position.y) <= 90,
  );
  if (!p) return false;
  s.destination = null;
  s.event = { kind: "caravan-raid", patrolId: p.id };
  return true;
}
export function respondCaravanRaid(s, choice) {
  const p =
    s.event?.kind === "caravan-raid" &&
    s.patrols.find((p) => p.id === s.event.patrolId && p.raid);
  if (!p || !["help", "payment", "leave"].includes(choice)) return false;
  if (choice === "leave") {
    p.raid.dismissed = true;
    s.event = null;
    note(
      s,
      "You leave the wagon to its defenders. Return before the raid ends if you change your mind.",
    );
    return true;
  }
  const attacker = s.patrols.find(
    (a) => a.id === p.raid.attackerId && !a.cleared,
  );
  if (!attacker) return false;
  const event = s.event;
  s.event = null;
  if (!startBattle(s, attacker.id, { caravanDefense: p.id })) {
    s.event = event;
    return false;
  }
  if (choice === "payment" && !p.raid.demanded) {
    p.raid.demanded = true;
    s.gold += 15;
    changeReputation(s, "guild", -1);
    note(
      s,
      "The merchant pays fifteen crowns before you intervene. The League remembers the demand.",
    );
  }
  return true;
}
export function interveneCaravan(s, id) {
  const p = s.patrols.find((p) => p.id === id && p.raid);
  if (
    !p ||
    s.battle ||
    s.event ||
    s.campOpen ||
    Math.hypot(p.x - s.position.x, p.y - s.position.y) > 90
  )
    return false;
  s.event = { kind: "caravan-raid", patrolId: id };
  return true;
}
export function lootCaravanWreck(s, id) {
  const p = s.patrols.find((p) => p.id === id && p.wreck && !p.wreck.looted);
  if (
    !p ||
    s.battle ||
    s.event ||
    s.campOpen ||
    Math.hypot(p.x - s.position.x, p.y - s.position.y) > 54 ||
    companyLost(s)
  )
    return false;
  if (
    !p.wreck.food &&
    !p.wreck.gear.length &&
    cargoLoad(s) >= companyCargoCapacity(s)
  )
    return false;
  s.food += p.wreck.food;
  p.wreck.food = 0;
  for (const g of tradeGoods) {
    const n = Math.min(
      p.wreck.cargo[g.id],
      companyCargoCapacity(s) - cargoLoad(s),
    );
    s.cargo[g.id] += n;
    p.wreck.cargo[g.id] -= n;
  }
  for (const id of p.wreck.gear) grantEquipment(s, id);
  p.wreck.gear = [];
  p.wreck.looted = !Object.values(p.wreck.cargo).some((n) => n > 0);
  registerCrime(s);
  s.crime.stolen = true;
  note(
    s,
    "Recovered provisions and remaining cargo from the wreck. The cargo is marked stolen; excess goods remain if your wagon is full.",
  );
  return true;
}
function finishCaravanDefense(s) {
  const p = s.patrols.find((p) => p.id === s.battle.caravanDefense);
  if (!p) return;
  p.raid = null;
  changeTownCondition(s, nearestVillage(p), 6);
  p.raidCooldown = s.day * 24 + s.timeOfDay + 8;
  changeReputation(s, "guild", 3);
  note(s, `${p.name} survives the attack. Its cargo remains aboard.`);
}

export const spellSchools = [
  {
    id: "barrier",
    role: "Wizard",
    name: "Barrier scholar",
    desc: "Wards absorb three extra damage. Unlock Prism bastion, a second-level ward for adjacent allies.",
  },
  {
    id: "elemental",
    role: "Wizard",
    name: "Elementalist",
    desc: "Damage spells gain three power. Cinder bloom and Firestorm burn enemies for three damage over two enemy turns.",
  },
  {
    id: "illusion",
    role: "Wizard",
    name: "Illusionist",
    desc: "All spells gain one range. Phantom whisper and Mirage distract enemies, lowering attacks and preventing disengagement strikes.",
  },
  {
    id: "guardian",
    role: "Cleric",
    name: "Beacon guardian",
    desc: "Wards absorb three extra damage. Unlock Sanctuary, a stronger second-level group ward.",
  },
  {
    id: "restoration",
    role: "Cleric",
    name: "Restorer",
    desc: "Healing gains four power and cures injuries at full health. Unlock Renewal, a second-level group heal.",
  },
  {
    id: "zeal",
    role: "Cleric",
    name: "Dawn zealot",
    desc: "Damage spells gain three power. Unlock Rebuke, a first-level attack that interrupts enemy casting.",
  },
];
spellBook.push(
  {
    id: "bastion",
    name: "Prism bastion",
    role: "Wizard",
    school: "barrier",
    level: 2,
    range: 3,
    power: 5,
    kind: "ward",
    area: true,
    herbs: 1,
  },
  {
    id: "firestorm",
    name: "Firestorm",
    role: "Wizard",
    school: "elemental",
    level: 2,
    range: 4,
    power: 11,
    kind: "damage",
    area: true,
    ore: 1,
  },
  {
    id: "phantom",
    name: "Phantom whisper",
    role: "Wizard",
    school: "illusion",
    level: 1,
    range: 4,
    power: 0,
    kind: "illusion",
  },
  {
    id: "mirage",
    name: "Mirage",
    role: "Wizard",
    school: "illusion",
    level: 2,
    range: 4,
    power: 0,
    kind: "illusion",
    area: true,
    herbs: 1,
  },
  {
    id: "sanctuary",
    name: "Sanctuary",
    role: "Cleric",
    school: "guardian",
    level: 2,
    range: 3,
    power: 7,
    kind: "ward",
    area: true,
    herbs: 1,
  },
  {
    id: "renewal",
    name: "Renewal",
    role: "Cleric",
    school: "restoration",
    level: 2,
    range: 3,
    power: 6,
    kind: "heal",
    area: true,
    herbs: 1,
  },
  {
    id: "rebuke",
    name: "Rebuke",
    role: "Cleric",
    school: "zeal",
    level: 1,
    range: 4,
    power: 5,
    kind: "damage",
    piercing: true,
    interrupt: true,
  },
);
export function spellsFor(p) {
  return spellBook.filter(
    (v) =>
      v.role === p?.role &&
      (!v.school || v.school === p.spellSchool) &&
      (!v.tome || p.knownSpells?.includes(v.id)) &&
      (!Array.isArray(p.preparedSpells) || p.preparedSpells.includes(v.id)),
  );
}
export function spellRange(p, spell) {
  return (
    spell.range +
    (p.race === "elf" ? 1 : 0) +
    (p.spellSchool === "illusion" ? 1 : 0)
  );
}
export function learnSpellSchool(s, id, schoolId) {
  const p = s.party[id],
    school = spellSchools.find((v) => v.id === schoolId && v.role === p?.role);
  if (
    !school ||
    p.dead ||
    p.hp <= 0 ||
    p.level < 2 ||
    p.points < 1 ||
    p.spellSchool ||
    s.battle ||
    s.event
  )
    return false;
  p.points--;
  p.spellSchool = school.id;
  note(
    s,
    `${p.name} becomes a ${school.name}. This specialization is permanent and shares training points with strength and vitality.`,
  );
  return true;
}
export function enemyArmor(s, e) {
  return (
    (e.armor || 0) +
    (e.kind === "knight" && e.guard && !e.stun && !knightFlanked(s, e)
      ? 3
      : 0) +
    (s.battle?.layoutId !== "legacy" &&
    ["mage", "archer", "raider"].includes(e.kind) &&
    s.battle.enemies.some(
      (v) =>
        v !== e &&
        v.hp > 0 &&
        v.kind === "brute" &&
        v.guard &&
        Math.abs(v.x - e.x) + Math.abs(v.y - e.y) <= 1,
    )
      ? 1
      : 0) +
    (e.kind === "skeleton" &&
    s.battle?.enemies.some(
      (v) =>
        v !== e &&
        v.kind === "skeleton" &&
        v.hp > 0 &&
        Math.abs(v.x - e.x) + Math.abs(v.y - e.y) === 1,
    )
      ? 2
      : 0)
  );
}
export function enemyDescription(s, e) {
  if (newEnemyFamilies.some((f) => f.id === e.kind))
    return newEnemyReport(s, e);
  if (e.fleeing) return "Routed: attempting to escape at the eastern edge.";
  if (e.surrenderOffer)
    return "Offers surrender: capture, release, bargain or refuse.";
  if (e.kind === "mage")
    return `Spell slots ${e.mana || 0}/2${e.casting ? " · CHANNELING: move off the marked tile or interrupt" : " · Channels a visible spell before release; stun interrupts"}`;
  if (e.kind === "skeleton")
    return `Bone formation: ${enemyArmor(s, e)} armor · adjacent skeletons add two armor`;
  if (e.kind === "goblin")
    return `${e.trapper ? "Lays visible snares" : "Steals rations and flees"}${e.stolenFood ? ` · carrying ${e.stolenFood} stolen rations` : ""}`;
  return "";
}
function deployFantasyEnemies(s, patrol) {
  let family = patrol?.enemyFamily;
  if (!family && !patrol && !["boss", "story"].includes(s.contract?.kind)) {
    if ([2, 5, 8, 11].includes(s.location)) family = "skeleton";
    if (s.location === 14) family = "goblin";
  }
  if (newEnemyFamilies.some((f) => f.id === family)) {
    deployNewEnemies(s, family);
    return;
  }
  if (!family) return;
  s.battle.enemyFamily = family;
  s.battle.traps = [];
  for (const [i, enemy] of s.battle.enemies.entries()) {
    if (family === "goblin")
      Object.assign(enemy, {
        kind: "goblin",
        name: i === 0 ? "Goblin trapper" : "Goblin looter",
        hp: 14 + (s.contract?.tier || 1) * 2,
        max: 14 + (s.contract?.tier || 1) * 2,
        damage: 4,
        armor: 0,
        trapper: i === 0,
        snares: i === 0 ? 2 : 0,
      });
    if (family === "skeleton")
      Object.assign(enemy, { kind: "skeleton", name: "Bone sentry", armor: 1 });
    if (family === "mage")
      Object.assign(
        enemy,
        i === 0
          ? {
              kind: "mage",
              name: "Rogue spellbinder",
              hp: 22,
              max: 22,
              damage: 3,
              armor: 0,
              mana: 2,
              casting: null,
            }
          : {
              kind: "raider",
              name: "Bound guard",
              hp: 22,
              max: 22,
              damage: 5,
              armor: 1,
            },
      );
  }
}
function enemySpecialTurn(s, e) {
  if (newEnemyTurn(s, e)) return true;
  if (
    e.kind === "skeleton" &&
    s.battle.turn <= 2 &&
    !s.battle.units.some(
      (u) =>
        s.party[u.id].hp > 0 && Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 3,
    )
  )
    return true;
  if (coordinatedSpecialTurn(s, e)) return true;
  if (e.kind === "mage" && e.silenced > 0) {
    e.silenced--;
    e.casting = null;
    return true;
  }
  if (e.kind === "mage") {
    if (e.casting) {
      const tile = e.casting;
      e.casting = null;
      const u = s.battle.units.find(
        (u) => s.party[u.id].hp > 0 && u.x === tile.x && u.y === tile.y,
      );
      if (u && hasLineOfSight(s, e, u)) {
        const damage = damageCompanion(
          s,
          u,
          8 + armorPower(s, s.party[u.id]),
          true,
        );
        note(
          s,
          `${s.party[u.id].name} takes ${damage} from the spellbinder's released spell.`,
        );
      } else
        note(
          s,
          "The spellbinder's spell strikes empty ground. Its slot stays spent.",
        );
      return true;
    }
    if (e.mana > 0 && !e.distracted) {
      const target = s.battle.units
        .filter(
          (u) =>
            s.party[u.id].hp > 0 &&
            Math.abs(e.x - u.x) + Math.abs(e.y - u.y) <= 4 &&
            hasLineOfSight(s, e, u),
        )
        .sort((a, b) => s.party[a.id].hp - s.party[b.id].hp)[0];
      if (target) {
        e.mana--;
        e.casting = { x: target.x, y: target.y };
        note(
          s,
          `The spellbinder spends a slot and channels at ${target.x + 1},${target.y + 1}. Move off that tile or stun it before the next enemy turn.`,
        );
        return true;
      }
    }
  }
  if (e.kind === "goblin") {
    if (e.root > 0) {
      e.root--;
      return true;
    }
    if (e.stolenFood || e.hp <= e.max * 0.4) {
      if (e.x >= 8) {
        e.escaped = true;
        e.hp = 0;
        note(s, "A goblin escapes with its stolen supplies.");
        return true;
      }
      const route = battlePath(s, { ...e, side: "enemy" }, 8, e.y, 100);
      if (route?.length) {
        const step = route[0];
        spearApproach(s, e, step);
        enemyDisengagement(s, e, [step.x, step.y]);
        if (e.hp > 0) {
          e.x = step.x;
          e.y = step.y;
        }
      }
      return true;
    }
    if (e.trapper && e.snares > 0) {
      const x = e.x - 1,
        y = e.y;
      if (
        x >= 0 &&
        !terrainCell(s, x, y).blocked &&
        !s.battle.traps.some((t) => !t.used && t.x === x && t.y === y) &&
        !s.battle.units.some(
          (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
        ) &&
        !s.battle.enemies.some((v) => v.hp > 0 && v.x === x && v.y === y)
      ) {
        s.battle.traps.push({ x, y, used: false });
        e.snares--;
        note(
          s,
          "A goblin lays a snare. Avoid the marked tile or have an Archer or Thief disarm it.",
        );
        return true;
      }
    }
  }
  return false;
}
export function disarmBattleSnare(s, id, x, y) {
  const p = s.party[id],
    u = s.battle?.units.find((u) => u.id === id),
    trap = s.battle?.traps?.find((t) => !t.used && t.x === x && t.y === y);
  if (
    !p ||
    p.hp <= 0 ||
    p.dead ||
    !(["Archer", "Rogue"].includes(p.role) || p.profession === "Thief") ||
    !u ||
    u.acted ||
    !trap ||
    Math.abs(u.x - x) + Math.abs(u.y - y) > 1
  )
    return false;
  trap.used = true;
  u.acted = true;
  if (p.profession === "Thief") practice(s, p, 1);
  note(s, `${p.name} disarms the goblin snare.`);
  return true;
}

// Frontier consequences are independent of the Hungry Roads chapter.
export function freshRealm() {
  return {
    territories: { 0: "wardens", 3: "guild", 6: "guild" },
    charters: {},
    passage: {},
    strongholds: {},
    lineage: {},
    dungeons: {},
    journal: [],
    wagonDay: 0,
    wagonEvent: null,
    tracked: null,
    shards: 0,
    travelDistance: 0,
  };
}
export const fantasyStrongholds = [
  {
    id: "goblin",
    site: 14,
    name: "Bramble den",
    family: "goblin",
    leader: "Mossfang",
    routine: "Foragers leave at dawn; their stores feed the raiders.",
    action: "stores",
    operation: "Burn stolen stores",
    cost: "wood",
    amount: 3,
  },
  {
    id: "undead",
    site: 2,
    name: "Barrow crypt",
    family: "skeleton",
    leader: "The Oathless Marshal",
    routine: "Bone sentries march by night; a burial seal sustains them.",
    action: "seal",
    operation: "Consecrate burial seal",
    cost: "herbs",
    amount: 3,
  },
  {
    id: "arcane",
    site: 5,
    name: "Outcast spire",
    family: "mage",
    leader: "Magister Vale",
    routine: "A ritual binds the tower guards; its focus is exposed at dusk.",
    action: "ritual",
    operation: "Break ritual focus",
    cost: "ore",
    amount: 3,
  },
];
export function realmHold(s, id) {
  return (s.realm.strongholds[id] ||= {
    known: false,
    scouted: false,
    disrupted: false,
    cleared: false,
    lastSpawn: s.day,
    waves: 0,
  });
}
export function fantasyHoldLock(s, id, action = "scout") {
  const h = fantasyStrongholds.find((v) => v.id === id);
  if (!h || s.battle || s.event || s.campOpen || companyLost(s))
    return "Finish the current activity.";
  if (
    Math.hypot(
      s.position.x - places[h.site].x,
      s.position.y - places[h.site].y,
    ) > 110
  )
    return "Approach within 110 pixels.";
  const state = realmHold(s, id);
  if (state.cleared) return "Stronghold cleared.";
  if (action === "scout")
    return !companyScout(s)
      ? "Requires an Archer or Thief."
      : state.scouted
        ? "Already surveyed."
        : "";
  if (!state.scouted) return "Scout the stronghold first.";
  if (action === "disrupt")
    return state.disrupted
      ? "Already disrupted."
      : !isHidden(s)
        ? "Requires 60% concealment."
        : s.inventory[h.cost] < h.amount
          ? `Requires ${h.amount} ${h.cost}.`
          : "";
  return "";
}
export function fantasyHoldAction(s, id, action) {
  if (
    !["scout", "disrupt", "attack"].includes(action) ||
    fantasyHoldLock(s, id, action)
  )
    return false;
  const h = fantasyStrongholds.find((v) => v.id === id),
    state = realmHold(s, id);
  state.known = true;
  s.destination = null;
  if (action === "scout") {
    state.scouted = true;
    spendHours(s, 1);
    note(
      s,
      `${h.name}: ${h.routine} Scout reports ${h.leader} commands three defenders.`,
    );
    practice(s, companyScout(s), 1);
    return true;
  }
  if (action === "disrupt") {
    s.inventory[h.cost] -= h.amount;
    state.disrupted = true;
    s.stealth.concealment = Math.max(0, s.stealth.concealment - 30);
    spendHours(s, 1);
    note(
      s,
      `${h.name}: ${h.operation.toLowerCase()} completed. Reinforcements stop and defenders lose health; the ritual's spell slots are reduced.`,
    );
    return true;
  }
  const original = s.contract,
    location = s.location;
  s.location = h.site;
  s.contract = { target: h.site, tier: 2, reward: 60 };
  const ok = startBattle(s);
  s.contract = original;
  s.location = location;
  if (!ok) return false;
  const b = s.battle;
  b.kind = "patrol";
  b.realmStronghold = id;
  b.enemies.forEach((e, i) =>
    Object.assign(e, {
      kind: h.family,
      name: i === 0 ? h.leader : `${h.name} sentry`,
      hp: state.disrupted ? 20 : 32,
      max: state.disrupted ? 20 : 32,
      damage: state.disrupted ? 4 : 6,
      armor: h.family === "skeleton" ? 2 : 0,
      mana: state.disrupted ? 1 : 2,
      casting: null,
      trapper: h.family === "goblin" && i === 1,
      snares: 2,
    }),
  );
  note(
    s,
    `Assault on ${h.name}. Defeat ${h.leader} to end its patrols permanently.`,
  );
  return true;
}
export function refreshFantasyStrongholds(s) {
  for (const h of fantasyStrongholds) {
    const state = realmHold(s, h.id);
    if (s.discovered.includes(h.site)) state.known = true;
    if (
      !state.known ||
      state.cleared ||
      state.disrupted ||
      s.day - state.lastSpawn < 3
    )
      continue;
    if (
      (h.family === "skeleton" && s.timeOfDay >= 6 && s.timeOfDay < 18) ||
      (h.family === "goblin" && (s.timeOfDay < 5 || s.timeOfDay >= 12)) ||
      (h.family === "mage" && (s.timeOfDay < 16 || s.timeOfDay >= 22))
    )
      continue;
    state.lastSpawn = s.day;
    state.waves++;
    const active = s.patrols.filter((p) => p.realmHold === h.id && !p.cleared);
    if (active.length >= 2) continue;
    const at = places[h.site],
      id = `realm-${h.id}-${state.waves}`;
    s.patrols.push({
      id,
      name: `${h.name} raiders`,
      kind: "fantasy",
      enemyFamily: h.family,
      realmHold: h.id,
      hostile: true,
      cleared: false,
      x: at.x + 35,
      y: at.y + 25,
      route: [
        { x: at.x + 35, y: at.y + 25 },
        { x: at.x + 105, y: at.y + 65 },
        { x: at.x - 40, y: at.y + 90 },
      ],
      waypoint: 0,
    });
    note(s, `${h.name} sends another patrol onto nearby roads.`);
  }
}
function defeatFantasyStronghold(s, id) {
  const h = fantasyStrongholds.find((v) => v.id === id);
  if (!h || realmHold(s, id).cleared) return;
  realmHold(s, id).cleared = true;
  markResettlement(s, id, h.site);
  if (id === "arcane") {
    s.realm.shards += 2;
    note(s, "The spire yields two aether shards for frontier spell recovery.");
  }
  for (const p of s.patrols)
    if (
      p.realmHold === id ||
      p.id ===
        {
          goblin: "goblin-patrol",
          undead: "bone-patrol",
          arcane: "mage-patrol",
        }[id]
    )
      p.cleared = true;
  s.gold += 80;
  s.knowledge += 3;
  changeReputation(s, "wardens", 5);
  note(
    s,
    `${h.name} cleared. Its roads remain safe from new stronghold patrols. Eighty crowns and three knowledge recovered.`,
  );
}
export function territoryOwner(s, site = s.location) {
  return s.realm?.territories[site] || null;
}
export function townAccessLock(s, site = s.location) {
  const owner = territoryOwner(s, site);
  if (!owner) return "";
  return s.reputation[owner] <= -15 && s.realm.passage[site] !== s.day
    ? "Hostile rulers demand a 25-crown day pass before village services."
    : "";
}
export function territoryPrice(s) {
  const owner = territoryOwner(s);
  return owner
    ? s.reputation[owner] >= 10
      ? 0.9
      : s.reputation[owner] <= -10
        ? 1.2
        : 1
    : 1;
}
export function buyTerritoryPass(s) {
  if (s.battle || s.event || s.campOpen || !townAccessLock(s) || s.gold < 25)
    return false;
  s.gold -= 25;
  s.realm.passage[s.location] = s.day;
  note(s, `Purchased a day pass into ${places[s.location].name}.`);
  return true;
}
export function supportTerritory(s, faction) {
  if (
    !factions.some((v) => v.id === faction) ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    places[s.location]?.type !== "town" ||
    townAccessLock(s) ||
    s.gold < 40 ||
    s.food < 6 ||
    s.day - (s.realm.charters[s.location] || -99) < 3
  )
    return false;
  const old = territoryOwner(s);
  s.gold -= 40;
  s.food -= 6;
  s.realm.charters[s.location] = s.day;
  s.realm.territories[s.location] = faction;
  changeReputation(s, faction, 6);
  if (old !== faction) changeReputation(s, old, -6);
  for (const other of factions)
    if (other.id !== faction && other.id !== old)
      changeReputation(s, other.id, -2);
  note(
    s,
    `${places[s.location].name} charter now supports ${factions.find((v) => v.id === faction).name}. Rival factions remember your intervention; prices and recruitment follow local standing.`,
  );
  const guard = s.patrols.find((p) => p.id === `border-${s.location}`);
  if (guard) guard.cleared = false;
  refreshBorderPatrols(s);
  return true;
}
export function refreshBorderPatrols(s) {
  for (const site of Object.keys(s.realm.charters).map(Number)) {
    const owner = territoryOwner(s, site),
      id = `border-${site}`,
      at = places[site];
    let p = s.patrols.find((v) => v.id === id);
    if (!p) {
      p = {
        id,
        kind: "bandits",
        x: at.x + 75,
        y: at.y,
        route: [
          { x: at.x + 75, y: at.y },
          { x: at.x + 110, y: at.y + 50 },
          { x: at.x + 50, y: at.y + 85 },
        ],
        waypoint: 0,
        cleared: false,
      };
      s.patrols.push(p);
    }
    p.name = `${factions.find((v) => v.id === owner).name} border guard`;
    p.faction = owner;
    p.hostile = s.reputation[owner] <= -10;
  }
}
export const lineageStories = {
  elf: {
    name: "The fading sanctuary",
    site: 7,
    clue: "A living root still remembers the vanished wardens.",
    perk: "grove",
    effect:
      "One herb restores a caster's spent level-one slot at camp, once per day.",
  },
  dwarf: {
    name: "The ancestral workshop",
    site: 4,
    clue: "A maker's seal bears your companion's family name.",
    perk: "ancestor",
    effect: "The company deals two extra damage to undead enemies.",
  },
  orc: {
    name: "The broken command",
    site: 12,
    clue: "A commander's oath exposes the old order's betrayal.",
    perk: "oath",
    effect: "The companion gains two maximum health and improved resolve.",
  },
  human: {
    name: "Names on the road",
    site: 13,
    clue: "A household ledger preserves the names of displaced families.",
    perk: "kin",
    effect: "The companion gains two maximum health and improved resolve.",
  },
};
export function lineageStoryLock(s, id, action) {
  const p = s.party[id];
  if (!p || p.dead || p.hp <= 0 || s.battle || s.event || companyLost(s))
    return "Companion unavailable.";
  const story = lineageStories[p.race || "human"],
    state = s.realm.lineage[id];
  if (action === "begin")
    return state ? "Already begun." : s.campOpen ? "" : "Discuss at camp.";
  if (action === "investigate")
    return state?.stage !== 1
      ? "Discuss the story first."
      : s.location !== story.site || s.campOpen
        ? `Explore ${places[story.site].name}.`
        : "";
  if (["honor", "sell", "leave"].includes(action))
    return state?.stage !== 2
      ? "Find the evidence first."
      : !s.campOpen
        ? "Decide together at camp."
        : "";
  if (action === "reconcile")
    return state?.outcome !== "sold" || !s.campOpen || s.gold < 25
      ? "Requires a sold discovery, camp, and 25 crowns."
      : "";
  return "Unknown choice.";
}
export function lineageStoryAction(s, id, action) {
  if (lineageStoryLock(s, id, action)) return false;
  const p = s.party[id],
    story = lineageStories[p.race || "human"];
  if (action === "begin") {
    s.realm.lineage[id] = { stage: 1, outcome: null };
    if (!s.discovered.includes(story.site)) s.discovered.push(story.site);
    note(
      s,
      `${p.name}: ${story.name}. Follow the lead to ${places[story.site].name}.`,
    );
  }
  if (action === "investigate") {
    if (p.race === "orc") {
      const original = s.contract;
      s.contract = { target: s.location, tier: 1, reward: 40 };
      const ok = startBattle(s);
      s.contract = original;
      if (!ok) return false;
      s.battle.kind = "patrol";
      s.battle.realmLineage = id;
      const leader = s.battle.enemies[0];
      leader.name = "Commander Rhusk";
      leader.hp = leader.max = 28;
      leader.damage = 5;
      note(
        s,
        `${p.name} challenges Commander Rhusk. Defeat the old commander to recover his oath.`,
      );
      return true;
    }
    s.realm.lineage[id].stage = 2;
    s.knowledge++;
    note(s, `${p.name}: ${story.clue} Return to camp to decide its future.`);
  }
  if (action === "honor" || action === "reconcile") {
    if (action === "reconcile") s.gold -= 25;
    s.realm.lineage[id] = {
      stage: 3,
      outcome: action === "honor" ? "honored" : "reconciled",
    };
    p.lineagePerk = story.perk;
    p.resolve = Math.min(100, p.resolve + 15);
    if (["oath", "kin"].includes(story.perk)) {
      p.max += 2;
      p.hp = Math.min(p.max, p.hp + 2);
    }
    for (const q of livingParty(s))
      if (q.id !== id) {
        const key = [id, q.id].sort((a, b) => a - b).join(":");
        s.bonds[key] = Math.min(100, (s.bonds[key] || 0) + 5);
      }
    note(s, `${p.name}'s story resolved: ${story.effect}`);
  }
  if (action === "sell") {
    s.gold += 50;
    p.resolve = Math.max(0, p.resolve - 25);
    s.realm.lineage[id] = { stage: 3, outcome: "sold" };
    note(
      s,
      `Sold ${p.name}'s discovery for fifty crowns. Their trust falls; reconciliation remains possible.`,
    );
  }
  if (action === "leave") {
    s.realm.lineage[id] = { stage: 3, outcome: "departed" };
    departCompanion(s, p);
  }
  return true;
}
export function recoverFrontierSlot(s, id) {
  const p = s.party[id],
    elf = livingParty(s).some((v) => v.lineagePerk === "grove" && v.hp > 0);
  if (
    s.battle ||
    s.event ||
    !s.campOpen ||
    !elf ||
    !p ||
    !isCaster(p) ||
    p.hp <= 0 ||
    !p.spellSpent?.[1] ||
    s.inventory.herbs < 1 ||
    s.realm.groveDay === s.day
  )
    return false;
  s.inventory.herbs--;
  p.spellSpent[1]--;
  s.realm.groveDay = s.day;
  note(
    s,
    `Sanctuary lore restores one of ${p.name}'s level-one slots with a rare herb.`,
  );
  return true;
}
export function recordRealmEncounter(s, text) {
  if (!s.realm || typeof text !== "string") return;
  const record = {
    day: s.day,
    text: text.slice(0, 260),
    site: places[s.location] ? s.location : null,
  };
  if (
    s.realm.journal[0]?.text === record.text &&
    s.realm.journal[0]?.day === record.day
  )
    return;
  s.realm.journal.unshift(record);
  s.realm.journal = s.realm.journal.slice(0, 80);
}
export function realmJournal(s) {
  const leads = [];
  for (const h of fantasyStrongholds) {
    const st = s.realm.strongholds[h.id];
    if (st?.known)
      leads.push({
        id: `hold-${h.id}`,
        site: h.site,
        title: h.name,
        text: st.cleared
          ? "Cleared; patrols permanently stopped."
          : st.disrupted
            ? "Defenses disrupted; leader still alive."
            : st.scouted
              ? h.routine
              : "Scout its routines with an Archer or Thief.",
      });
  }
  for (const p of livingParty(s)) {
    const q = s.realm.lineage[p.id];
    if (q) {
      const st = lineageStories[p.race || "human"];
      leads.push({
        id: `lineage-${p.id}`,
        site: st.site,
        title: `${p.name}: ${st.name}`,
        text:
          q.stage === 1
            ? "Find personal evidence here."
            : q.stage === 2
              ? "Bring the discovery to camp."
              : q.outcome,
      });
    }
  }
  if (s.caravanEscort)
    leads.push({
      id: "caravan-escort",
      site: s.caravanEscort.destination,
      title: "Entrusted caravan",
      text: "Protect the cargo and collect payment at its destination.",
    });
  for (const p of livingParty(s))
    if (p.personalQuest?.stage === 1 || p.personalQuest?.stage === 2)
      leads.push({
        id: `personal-${p.id}`,
        site: personalQuestInfo(p).target,
        title: `${p.name}: personal request`,
        text:
          p.personalQuest.stage === 1
            ? personalQuestInfo(p).goal
            : "Discuss the evidence at camp.",
      });
  for (const r of tavernRumors)
    if (s.rumors[r.id])
      leads.push({
        id: `rumor-${r.id}`,
        site: r.target,
        title: r.name,
        text: r.desc,
      });
  if (s.travelers.tamsin !== "unknown")
    leads.push({
      id: "sella",
      site: 0,
      title: "Sella, rescued traveler",
      text: "Meet her again in Greyhaven.",
    });
  if (s.travelers.farmRebuilt)
    leads.push({
      id: "farm",
      site: 13,
      title: "Ashbrook harvest",
      text: "The rebuilt farm provides recurring harvests.",
    });
  for (const site of Object.keys(s.realm.charters).map(Number))
    leads.push({
      id: `charter-${site}`,
      site,
      title: `${places[site].name} charter`,
      text: `Controlled by ${factions.find((v) => v.id === territoryOwner(s, site)).name}.`,
    });
  return leads;
}
export function trackRealmLead(s, id) {
  const lead = realmJournal(s).find((v) => v.id === id);
  if (!lead || s.battle || s.event || s.campOpen || companyLost(s))
    return false;
  s.realm.tracked = id;
  return (
    s.location === lead.site ||
    moveTo(s, places[lead.site].x, places[lead.site].y)
  );
}
export function dungeonPuzzle(s) {
  if (s.event?.kind !== "dungeon") return null;
  const id = s.event.site;
  return (s.realm.dungeons[id] ||= {
    spotted: false,
    unlocked: false,
    pins: 0,
    dial: 0,
    strain: 0,
    rune: 0,
    door: false,
    cache: false,
  });
}
export function realmDungeonAction(s, action, value) {
  const q = dungeonPuzzle(s),
    e = s.event;
  if (!q || companyLost(s)) return false;
  const nearDoor = Math.abs(e.x - 4) + Math.abs(e.y - 3) <= 1;
  if (action === "scout-room") {
    if (!companyScout(s) || q.spotted) return false;
    q.spotted = true;
    practice(s, companyScout(s), 1);
    e.message =
      "Your scout marks the dart mechanism and finds a side-room lock at tile 5,4. Its runes read root, flame, star.";
    return true;
  }
  if (action === "dial") {
    if (!nearDoor || q.unlocked || !companyLockpicker(s)) return false;
    q.dial = (q.dial + 1) % 5;
    return true;
  }
  if (action === "pick") {
    const thief = companyLockpicker(s);
    if (!nearDoor || q.unlocked || !thief) return false;
    const target = [1, 3, 2][q.pins];
    if (q.dial === target) {
      q.pins++;
      q.strain = 0;
      e.message = "A tumbler clicks into place.";
      if (q.pins === 3) {
        q.unlocked = true;
        if (thief.profession === "Thief") practice(s, thief, 2);
        e.message =
          "The lockpicker opens the hidden lock. Solve its rune seal or spend magic to enter.";
      }
    } else {
      q.strain++;
      e.message =
        q.dial < target
          ? "The pin needs more tension."
          : "The pin bends under too much tension.";
      if (q.strain >= 3) {
        q.pins = 0;
        q.strain = 0;
        spendHours(s, 1);
        e.message = "The pick slips. An hour lost, and the tumblers reset.";
      }
    }
    return true;
  }
  if (action === "rune") {
    if (
      !nearDoor ||
      !q.unlocked ||
      q.door ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 2
    )
      return false;
    if (value === [0, 1, 2][q.rune]) q.rune++;
    else {
      q.rune = 0;
      e.message = "The rune seal dims. Read the scout's clue.";
    }
    if (q.rune === 3) {
      q.door = true;
      e.message = "Root, flame, star: the side chamber opens.";
    }
    return true;
  }
  if (action === "magic-door") {
    const p = livingParty(s).find(
      (p) => isCaster(p) && p.hp > 0 && spellSlots(p)[1] > 0,
    );
    if (!nearDoor || q.door || !p) return false;
    p.spellSpent ||= { 1: 0, 2: 0 };
    p.spellSpent[1]++;
    q.door = true;
    e.message = `${p.name} spends a level-one slot to dissolve the lock and rune seal.`;
    return true;
  }
  if (action === "side-cache") {
    if (!nearDoor || !q.door || q.cache) return false;
    q.cache = true;
    s.gold += 35;
    s.inventory.herbs += 2;
    s.realm.shards++;
    s.knowledge++;
    e.message =
      "Recovered 35 crowns, two herbs, an aether shard, and a fragment of lore. You can retreat without fighting the eastern guards.";
    note(
      s,
      `${places[e.site].name}: side chamber recovered; its contents will not respawn.`,
    );
    return true;
  }
  return false;
}
export const wagonEventKinds = {
  wheel: {
    title: "A cracked wagon wheel",
    text: "The wheel gives way on rough ground. Repair it, use the quartermaster's spare axle, or discard cargo to limp onward.",
  },
  crossing: {
    title: "The swollen crossing",
    text: "A flooded ford threatens the wagon. Let your scout find a crossing, pay a ferryman, or risk the current.",
  },
  overload: {
    title: "Cargo on the verge",
    text: "A heavily loaded wagon strains its bindings. A quartermaster can rebalance it; otherwise unload goods or lash the load with timber.",
  },
  raid: {
    title: "Shapes beyond the firelight",
    text: "Raiders creep toward the wagon after dark. A rear guard can drive them off; otherwise pay them or fight.",
  },
};
export function beginWagonEvent(s, kind) {
  if (
    !wagonEventKinds[kind] ||
    !s.wagon.owned ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    s.realm.wagonDay === s.day
  )
    return false;
  s.realm.wagonDay = s.day;
  s.realm.wagonEvent = { kind };
  s.destination = null;
  s.event = { kind: "wagon-travel", ...wagonEventKinds[kind] };
  return true;
}
export function checkWagonTravel(s, distance = 0) {
  if (!s.wagon.owned || s.battle || s.event || s.campOpen || s.location >= 0)
    return false;
  s.realm.travelDistance =
    (s.realm.travelDistance || 0) + Math.max(0, distance);
  if (s.realm.travelDistance < 600 || s.realm.wagonDay === s.day) return false;
  s.realm.travelDistance = 0;
  const kind =
    terrainAt(s.position) === "shallows"
      ? "crossing"
      : s.timeOfDay >= 20 || s.timeOfDay < 5
        ? "raid"
        : cargoLoad(s) > companyCargoCapacity(s) * 0.75
          ? "overload"
          : "wheel";
  return beginWagonEvent(s, kind);
}
export function wagonChoiceLock(s, choice) {
  if (s.event?.kind !== "wagon-travel" || !s.realm.wagonEvent)
    return "No wagon incident.";
  const kind = s.realm.wagonEvent.kind;
  const duty = {
    wheel: "quartermaster",
    crossing: "scout",
    overload: "quartermaster",
    raid: "rearguard",
  }[kind];
  if (choice === "duty")
    return travelWorker(s, duty) ? "" : `Assign a conscious ${duty} first.`;
  if (choice === "materials")
    return s.inventory.wood >= 2 && kind !== "raid"
      ? ""
      : "Requires two wood; unavailable for raids.";
  if (choice === "pay") return s.gold >= 20 ? "" : "Requires twenty crowns.";
  if (choice === "fight")
    return kind === "raid" ? "" : "No attackers to fight.";
  if (choice === "risk") return "";
  return "Unknown response.";
}
export function wagonChoice(s, choice) {
  if (wagonChoiceLock(s, choice)) return false;
  const kind = s.realm.wagonEvent.kind;
  s.event = null;
  s.realm.wagonEvent = null;
  if (choice === "duty") {
    note(
      s,
      `Your ${{ wheel: "quartermaster", crossing: "scout", overload: "quartermaster", raid: "rearguard" }[kind]} resolves ${wagonEventKinds[kind].title.toLowerCase()} without losses.`,
    );
    return true;
  }
  if (choice === "materials") {
    s.inventory.wood -= 2;
    spendHours(s, 1);
    note(s, "Used two timber to secure the company wagon.");
    return true;
  }
  if (choice === "pay") {
    s.gold -= 20;
    note(s, "Paid twenty crowns to bring the wagon through safely.");
    return true;
  }
  if (choice === "fight") {
    let p = s.patrols.find((p) => p.id === "wagon-night-raiders");
    if (!p) {
      p = {
        id: "wagon-night-raiders",
        name: "Night wagon raiders",
        kind: "bandits",
        hostile: true,
        cleared: false,
        route: [
          { x: s.position.x + 40, y: s.position.y },
          { x: s.position.x, y: s.position.y + 40 },
        ],
        waypoint: 0,
      };
      s.patrols.push(p);
    }
    p.x = s.position.x + 20;
    p.y = s.position.y;
    p.cleared = false;
    return startBattle(s, p.id);
  }
  s.wagon.condition = Math.max(0, s.wagon.condition - 15);
  s.food = Math.max(0, s.food - 3);
  let remaining = 3;
  for (const good of tradeGoods) {
    const n = Math.min(s.cargo[good.id], remaining);
    s.cargo[good.id] -= n;
    remaining -= n;
  }
  spendHours(s, 2);
  note(
    s,
    "Pushed onward: wagon condition −15, up to three rations and three cargo lost; two hours delayed.",
  );
  return true;
}
spellBook.push(
  {
    id: "silence-field",
    role: "Cleric",
    name: "Hushed Ground",
    level: 1,
    range: 4,
    kind: "surface",
    surface: "silence",
    power: 0,
    herbs: 1,
  },
  {
    id: "darkness-field",
    role: "Wizard",
    name: "Veil of Night",
    level: 1,
    range: 4,
    kind: "surface",
    surface: "darkness",
    power: 0,
    herbs: 1,
  },
  {
    id: "ember-field",
    role: "Wizard",
    name: "Ember Ground",
    level: 2,
    range: 4,
    kind: "surface",
    surface: "fire",
    power: 3,
    ore: 1,
  },
  {
    id: "counterspell",
    role: "Wizard",
    name: "Sever Spell",
    level: 1,
    range: 4,
    kind: "counter",
    power: 0,
  },
  {
    id: "concentration-aegis",
    role: "Cleric",
    name: "Beacon Circle",
    level: 2,
    range: 3,
    kind: "concentration",
    power: 4,
    herbs: 1,
  },
);
function castRealmMagic(s, p, u, spell, x, y) {
  if (!["surface", "counter", "concentration"].includes(spell.kind))
    return false;
  s.battle.realmMagic ||= { surfaces: [], concentration: [] };
  const m = s.battle.realmMagic;
  if (spell.kind === "counter") {
    const e = s.battle.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
    e.casting = null;
    e.silenced = 1;
  } else if (spell.kind === "concentration") {
    interruptConcentration(s, p.id);
    m.concentration.push({ id: p.id, x, y, power: spell.power, turns: 3 });
    for (const ally of s.battle.units)
      if (
        s.party[ally.id].hp > 0 &&
        Math.abs(ally.x - x) + Math.abs(ally.y - y) <= 1
      )
        ally.arcaneWard = spell.power;
  } else m.surfaces.push({ kind: spell.surface, x, y, turns: 3 });
  note(
    s,
    `${p.name} casts ${spell.name}. One level ${spell.level} slot spent. ${spell.kind === "counter" ? "The enemy cast is interrupted and its next turn silenced." : spell.kind === "concentration" ? "Wards renew for three rounds; damage to the caster breaks concentration." : "The ground effect lasts three enemy rounds."}`,
  );
  return true;
}
export function interruptConcentration(s, id) {
  if (!s.battle?.realmMagic) return false;
  const m = s.battle.realmMagic,
    removed = m.concentration.some((v) => v.id === id);
  m.concentration = m.concentration.filter((v) => v.id !== id);
  if (removed) note(s, `${s.party[id].name}'s concentration breaks.`);
  return removed;
}
function resolveRealmMagic(s) {
  const b = s.battle,
    m = b.realmMagic;
  if (!m) return;
  for (const surface of m.surfaces) {
    for (const e of b.enemies.filter(
      (v) =>
        v.hp > 0 && Math.abs(v.x - surface.x) + Math.abs(v.y - surface.y) <= 1,
    )) {
      if (surface.kind === "fire") {
        e.burningThisRound = true;
        hitEnemy(s, e, 3 + enemyArmor(s, e));
      }
      if (surface.kind === "silence") {
        e.casting = null;
        e.silenced = 1;
      }
    }
    for (const u of b.units.filter(
      (v) =>
        s.party[v.id].hp > 0 &&
        Math.abs(v.x - surface.x) + Math.abs(v.y - surface.y) <= 1,
    ))
      if (surface.kind === "fire")
        damageCompanion(s, u, 3 + armorPower(s, s.party[u.id]));
    surface.turns--;
  }
  for (const focus of m.concentration) {
    if (s.party[focus.id]?.hp <= 0 || s.party[focus.id]?.dead) {
      focus.turns = 0;
      continue;
    }
    for (const u of b.units)
      if (
        s.party[u.id].hp > 0 &&
        Math.abs(u.x - focus.x) + Math.abs(u.y - focus.y) <= 1
      )
        u.arcaneWard = focus.power;
    focus.turns--;
  }
  m.surfaces = m.surfaces.filter((v) => v.turns > 0);
  m.concentration = m.concentration.filter((v) => v.turns > 0);
}
function restoreRealm(s, raw) {
  const r = raw.realm || {},
    b = freshRealm(),
    count = (v, max = 10000) =>
      Number.isInteger(v) ? Math.max(0, Math.min(max, v)) : 0;
  for (const site of [0, 3, 6]) {
    if (factions.some((f) => f.id === r.territories?.[site]))
      b.territories[site] = r.territories[site];
    if (
      Number.isInteger(r.charters?.[site]) &&
      r.charters[site] > 0 &&
      r.charters[site] <= s.day
    )
      b.charters[site] = r.charters[site];
    if (r.passage?.[site] === s.day) b.passage[site] = s.day;
  }
  for (const h of fantasyStrongholds) {
    const old = r.strongholds?.[h.id];
    if (old)
      b.strongholds[h.id] = {
        known: old.known === true,
        scouted: old.scouted === true,
        disrupted: old.disrupted === true,
        cleared: old.cleared === true,
        lastSpawn: Math.min(s.day, Math.max(1, count(old.lastSpawn))),
        waves: count(old.waves),
      };
  }
  for (const p of s.party) {
    const q = r.lineage?.[p.id];
    p.lineagePerk = null;
    if (q && [1, 2, 3].includes(q.stage)) {
      const outcome = ["honored", "sold", "departed", "reconciled"].includes(
        q.outcome,
      )
        ? q.outcome
        : null;
      b.lineage[p.id] = { stage: q.stage, outcome };
      if (q.stage === 3 && ["honored", "reconciled"].includes(outcome))
        p.lineagePerk = lineageStories[p.race || "human"].perk;
    }
  }
  for (const site of [2, 4, 5, 8, 9, 11, 12, 14]) {
    const q = r.dungeons?.[site];
    if (q)
      b.dungeons[site] = {
        spotted: q.spotted === true,
        unlocked: q.unlocked === true,
        pins: count(q.pins, 3),
        dial: count(q.dial, 4),
        strain: count(q.strain, 2),
        rune: count(q.rune, 3),
        door: q.door === true,
        cache: q.cache === true,
      };
  }
  b.journal = (Array.isArray(r.journal) ? r.journal : [])
    .filter(
      (v) =>
        v &&
        typeof v.text === "string" &&
        Number.isInteger(v.day) &&
        v.day > 0 &&
        v.day <= s.day,
    )
    .slice(0, 80)
    .map((v) => ({
      day: v.day,
      text: v.text.slice(0, 260),
      site: places[v.site] ? v.site : null,
    }));
  b.shards = count(r.shards, 100);
  b.wagonDay = Math.min(s.day, count(r.wagonDay));
  b.travelDistance = count(r.travelDistance, 600);
  b.groveDay = Math.min(s.day, count(r.groveDay));
  if (
    s.wagon.owned &&
    wagonEventKinds[r.wagonEvent?.kind] &&
    raw.event?.kind === "wagon-travel" &&
    !s.battle
  ) {
    b.wagonEvent = { kind: r.wagonEvent.kind };
    s.event = { kind: "wagon-travel", ...wagonEventKinds[r.wagonEvent.kind] };
  } else if (s.event?.kind === "wagon-travel") s.event = null;
  s.realm = b;
  b.tracked = realmJournal(s).some((v) => v.id === r.tracked)
    ? r.tracked
    : null;
  const knownPatrols = new Set(initialPatrols().map((v) => v.id));
  for (const p of raw.patrols || []) {
    const h = fantasyStrongholds.find((v) => v.id === p.realmHold);
    if (
      h &&
      !p.cleared &&
      !b.strongholds[h.id]?.cleared &&
      typeof p.id === "string" &&
      new RegExp(`^realm-${h.id}-[0-9]+$`).test(p.id) &&
      Number.isFinite(p.x) &&
      Number.isFinite(p.y) &&
      !knownPatrols.has(p.id) &&
      s.patrols.filter((v) => v.realmHold === h.id).length < 2
    ) {
      const at = places[h.site];
      knownPatrols.add(p.id);
      s.patrols.push({
        id: p.id,
        name: `${h.name} raiders`,
        kind: "fantasy",
        enemyFamily: h.family,
        realmHold: h.id,
        hostile: true,
        cleared: p.cleared === true || b.strongholds[h.id]?.cleared === true,
        x: Math.max(0, Math.min(WORLD.width, p.x)),
        y: Math.max(0, Math.min(WORLD.height, p.y)),
        route: [
          { x: at.x + 35, y: at.y + 25 },
          { x: at.x + 105, y: at.y + 65 },
        ],
        waypoint: 0,
      });
    }
  }
  refreshBorderPatrols(s);
  for (const p of s.patrols.filter((v) => v.faction)) {
    const saved = raw.patrols?.find((v) => v.id === p.id);
    if (saved) {
      p.cleared = saved.cleared === true;
      if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        p.x = Math.max(0, Math.min(WORLD.width, saved.x));
        p.y = Math.max(0, Math.min(WORLD.height, saved.y));
      }
    }
  }
  const night = raw.patrols?.find(
    (p) => p.id === "wagon-night-raiders" && !p.cleared,
  );
  if (night && Number.isFinite(night.x) && Number.isFinite(night.y))
    s.patrols.push({
      id: "wagon-night-raiders",
      name: "Night wagon raiders",
      kind: "bandits",
      hostile: true,
      cleared: false,
      x: Math.max(0, Math.min(WORLD.width, night.x)),
      y: Math.max(0, Math.min(WORLD.height, night.y)),
      route: [
        { x: s.position.x + 40, y: s.position.y },
        { x: s.position.x, y: s.position.y + 40 },
      ],
      waypoint: 0,
    });
  if (s.battle) {
    s.battle.realmLineage =
      Number.isInteger(raw.battle.realmLineage) &&
      s.realm.lineage[raw.battle.realmLineage]?.stage === 1
        ? raw.battle.realmLineage
        : null;
    s.battle.realmStronghold = fantasyStrongholds.some(
      (v) => v.id === raw.battle.realmStronghold,
    )
      ? raw.battle.realmStronghold
      : null;
    const m = raw.battle.realmMagic || {},
      valid = (v) =>
        v &&
        Number.isInteger(v.x) &&
        v.x >= 0 &&
        v.x < 9 &&
        Number.isInteger(v.y) &&
        v.y >= 0 &&
        v.y < 7 &&
        Number.isInteger(v.turns) &&
        v.turns > 0;
    s.battle.realmMagic = {
      surfaces: (Array.isArray(m.surfaces) ? m.surfaces : [])
        .filter(
          (v) => valid(v) && ["fire", "silence", "darkness"].includes(v.kind),
        )
        .slice(0, 12)
        .map((v) => ({
          kind: v.kind,
          x: v.x,
          y: v.y,
          turns: count(v.turns, 3),
        })),
      concentration: (Array.isArray(m.concentration) ? m.concentration : [])
        .filter((v) => valid(v) && s.party[v.id] && isCaster(s.party[v.id]))
        .slice(0, 6)
        .map((v) => ({
          id: v.id,
          x: v.x,
          y: v.y,
          power: 4,
          turns: count(v.turns, 3),
        })),
    };
    for (const e of s.battle.enemies) e.silenced = count(e.silenced, 1);
  }
}

export function recoverShardMagic(s, id) {
  const p = s.party[id];
  if (
    s.battle ||
    s.event ||
    !s.campOpen ||
    !p ||
    p.dead ||
    p.hp <= 0 ||
    !isCaster(p) ||
    s.realm.shards < 1 ||
    !(p.spellSpent?.[1] || p.spellSpent?.[2])
  )
    return false;
  s.realm.shards--;
  if (p.spellSpent[2] > 0) p.spellSpent[2]--;
  else p.spellSpent[1] = Math.max(0, p.spellSpent[1] - 2);
  spendHours(s, 1);
  note(
    s,
    `An aether shard restores ${p.name}'s frontier magic: one level-two slot or up to two level-one slots.`,
  );
  return true;
}

export function freshExpedition() {
  return {
    mission: null,
    missionLedger: {},
    clues: {},
    careers: {},
    rivalries: {},
    conversationDay: 0,
    conversation: null,
    travelDistance: 0,
    promise: null,
    home: {
      owned: false,
      style: null,
      upgrades: {},
      stores: {
        food: 0,
        ore: 0,
        wood: 0,
        herbs: 0,
        medicine: 0,
        grain: 0,
        cloth: 0,
        salt: 0,
        iron: 0,
      },
      staff: {},
      harvestDay: 0,
    },
  };
}
export const tacticalMissions = [
  {
    id: "wagon-watch",
    name: "Hold the supply wagon",
    issuer: 0,
    site: 12,
    kind: "defense",
    reward: 90,
    desc: "Defend a thirty-health wagon through four enemy rounds. Killing its attackers also secures the cargo.",
  },
  {
    id: "captive",
    name: "Bring the captive home",
    issuer: 3,
    site: 2,
    kind: "rescue",
    reward: 100,
    desc: "Free the captive near tile 8,4, then bring their rescuer back to the western edge. Killing guards alone does not complete the rescue.",
  },
  {
    id: "withdrawal",
    name: "Survive the encirclement",
    issuer: 0,
    site: 5,
    kind: "escape",
    reward: 85,
    desc: "An overwhelming force blocks the road. Bring every conscious companion to the eastern edge and withdraw together.",
  },
  {
    id: "ritual",
    name: "Silence the three seals",
    issuer: 6,
    site: 11,
    kind: "ritual",
    reward: 120,
    desc: "Disrupt three marked ritual seals before six enemy rounds elapse. Each seal requires an adjacent companion's action.",
  },
];
export function missionLock(s, id, action = "accept") {
  const m = tacticalMissions.find((v) => v.id === id);
  if (!m || s.battle || s.event || s.campOpen || companyLost(s))
    return "Finish the current activity.";
  if (s.expedition.missionLedger[id]) return "Already completed.";
  if (action === "accept")
    return s.expedition.mission
      ? "Finish or abandon the active mission."
      : s.location !== m.issuer || townAccessLock(s)
        ? "Visit the issuing village's board."
        : "";
  return s.expedition.mission !== id
    ? "Accept this mission at its village board."
    : s.location !== m.site
      ? `Reach ${places[m.site].name}.`
      : "";
}
export function acceptMission(s, id) {
  if (missionLock(s, id)) return false;
  s.expedition.mission = id;
  const m = tacticalMissions.find((v) => v.id === id);
  if (!s.discovered.includes(m.site)) s.discovered.push(m.site);
  note(s, `Accepted ${m.name}: ${m.desc}`);
  return true;
}
export function abandonMission(s) {
  if (!s.expedition.mission || s.battle || s.event) return false;
  s.expedition.mission = null;
  note(s, "The tactical mission was abandoned without payment.");
  return true;
}
export function startMission(s) {
  const m = tacticalMissions.find((v) => v.id === s.expedition.mission);
  if (!m || missionLock(s, m.id, "start")) return false;
  const old = s.contract;
  s.contract = { target: m.site, tier: 2, reward: m.reward };
  const ok = startBattle(s);
  s.contract = old;
  if (!ok) return false;
  const b = s.battle;
  b.kind = "patrol";
  b.mission = m.id;
  b.objective = {
    kind: m.kind,
    rounds: 0,
    wagon: 30,
    rescuer: null,
    sigils: [],
    prisoner: { x: 7, y: 3 },
  };
  if (m.kind === "escape")
    for (const e of b.enemies) {
      e.hp = e.max = 42;
      e.damage = 4;
    }
  if (m.kind === "ritual") {
    Object.assign(b.enemies[0], {
      kind: "mage",
      name: "Ritual keeper",
      mana: 2,
      casting: null,
    });
    b.objective.limit = 6;
  }
  note(s, `${m.name}: ${m.desc}`);
  return true;
}
export function missionObjective(s) {
  const o = s.battle?.objective;
  if (!o) return "";
  if (o.kind === "defense")
    return `Protect wagon: ${o.wagon}/30 health · ${o.rounds}/4 rounds held.`;
  if (o.kind === "rescue")
    return o.rescuer === null
      ? "Free the captive at tile 8,4, then escort them west."
      : `Bring ${s.party[o.rescuer]?.name} and the captive to columns 1–2.`;
  if (o.kind === "escape")
    return "Reach columns 8–9 with every conscious companion; use Withdraw together.";
  return `Disrupt ritual seals: ${o.sigils.length}/3 · ${Math.max(0, 6 - o.rounds)} enemy rounds remain.`;
}
function battleVictoryAllowed(s) {
  const b = s.battle,
    o = b?.objective;
  if (!b) return false;
  if (!o) return true;
  if (!b.units.some((u) => s.party[u.id].hp > 0)) return false;
  if (o.kind === "defense")
    return o.wagon > 0 && (o.rounds >= 4 || b.enemies.every((e) => e.hp === 0));
  if (o.kind === "rescue")
    return (
      Number.isInteger(o.rescuer) &&
      b.units.some(
        (u) => u.id === o.rescuer && s.party[u.id].hp > 0 && u.x <= 1,
      )
    );
  if (o.kind === "escape")
    return b.units.filter((u) => s.party[u.id].hp > 0).every((u) => u.x >= 7);
  return o.sigils.length === 3;
}
export function missionActionLock(s, id, action, index = 0) {
  const b = s.battle,
    u = b?.units.find((u) => u.id === id),
    o = b?.objective;
  if (!o || !u || s.party[id].hp <= 0) return "Select a conscious companion.";
  if (action === "extract" || action === "escape")
    return battleVictoryAllowed(s)
      ? ""
      : "Bring the company or captive to the marked exit first.";
  if (u.acted) return "This companion's action is spent.";
  if (action === "free")
    return o.kind !== "rescue" || o.rescuer !== null
      ? "No captive to free."
      : Math.abs(u.x - 7) + Math.abs(u.y - 3) > 1
        ? "Stand beside the captive."
        : "";
  if (action === "carry") {
    const carrier = b.units.find((v) => v.id === o.rescuer);
    return o.kind !== "rescue" || !carrier || s.party[carrier.id].hp > 0
      ? "The rescuer is still able to escort the captive."
      : Math.abs(u.x - carrier.x) + Math.abs(u.y - carrier.y) > 1
        ? "Stand beside the fallen rescuer."
        : "";
  }
  if (action === "sigil") {
    const at = [
      [4, 1],
      [6, 3],
      [4, 5],
    ][index];
    return o.kind !== "ritual" || !at || o.sigils.includes(index)
      ? "Seal already disrupted or unavailable."
      : Math.abs(u.x - at[0]) + Math.abs(u.y - at[1]) > 1
        ? "Stand beside that seal."
        : "";
  }
  return "Unknown objective action.";
}
export function missionAction(s, id, action, index = 0) {
  if (missionActionLock(s, id, action, index)) return false;
  const b = s.battle,
    u = b.units.find((u) => u.id === id),
    o = b.objective;
  if (action === "free" || action === "carry") {
    o.rescuer = id;
    u.acted = true;
    note(
      s,
      `${s.party[id].name} frees the captive. Return to the western edge together.`,
    );
  }
  if (action === "sigil") {
    o.sigils.push(index);
    u.acted = true;
    note(s, `${s.party[id].name} breaks ritual seal ${index + 1}.`);
  }
  if (battleVictoryAllowed(s)) finishMission(s);
  return true;
}
function tickMission(s) {
  const b = s.battle,
    o = b?.objective;
  if (!o) return false;
  o.rounds++;
  if (o.kind === "defense")
    for (const e of b.enemies.filter(
      (e) => e.hp > 0 && Math.abs(e.x - 2) + Math.abs(e.y - 3) <= 1,
    ))
      o.wagon = Math.max(0, o.wagon - 4);
  if (
    o.wagon <= 0 ||
    (o.kind === "ritual" && o.rounds >= 6 && o.sigils.length < 3)
  ) {
    retreatBattle(s);
    note(
      s,
      "The objective was lost. Return to the mission site to retry; no reward granted.",
    );
    return true;
  }
  if (battleVictoryAllowed(s)) {
    finishMission(s);
    return true;
  }
  return false;
}
function finishMission(s) {
  const b = s.battle,
    m = tacticalMissions.find((v) => v.id === b?.mission);
  if (!m || s.expedition.missionLedger[m.id]) return false;
  wearBattleEquipment(s);
  s.gold += m.reward;
  s.renown += 3;
  s.knowledge += 2;
  s.expedition.missionLedger[m.id] = s.day;
  s.expedition.mission = null;
  for (const p of livingParty(s)) {
    p.xp += 20;
    while (p.xp >= p.level * 30) {
      p.xp -= p.level * 30;
      p.level++;
      p.points++;
    }
    changeResolve(p, 3);
  }
  growPartyBonds(s, 4, true);
  s.party.forEach((p) => (p._wildshape = false));
  s.battle = null;
  note(
    s,
    `${m.name} completed: ${m.reward} crowns, three renown, and two knowledge. The objective was secured.`,
  );
  return true;
}
export const careerPaths = [
  {
    id: "shadow",
    role: "Thief",
    name: "Shadow",
    desc: "Backstab distracted or engaged enemies for extra damage.",
  },
  {
    id: "saboteur",
    role: "Thief",
    name: "Saboteur",
    desc: "Disable an adjacent enemy's attacks and movement.",
  },
  {
    id: "tracker",
    role: "Archer",
    name: "Tracker",
    desc: "One extra bow range; mark quarry to improve company damage.",
  },
  {
    id: "sentinel",
    role: "Archer",
    name: "Sentinel",
    desc: "Set pinning overwatch that roots approaching enemies.",
  },
  {
    id: "duelist",
    role: "Swordswoman",
    name: "Duelist",
    desc: "Brace for a damaging riposte against an adjacent attacker.",
  },
  {
    id: "vanguard",
    role: "Swordswoman",
    name: "Vanguard",
    desc: "Sweep every adjacent enemy for one action and two valor.",
  },
  {
    id: "protector",
    role: "Shieldbearer",
    name: "Protector",
    desc: "Take two damage to reduce hits against a nearby chosen ally.",
  },
  {
    id: "captain",
    role: "Shieldbearer",
    name: "Captain",
    desc: "Rally adjacent allies: healing and extra valor.",
  },
  {
    id: "controller",
    role: "Spearman",
    name: "Controller",
    desc: "Root an enemy within spear reach.",
  },
  {
    id: "outrider",
    role: "Spearman",
    name: "Outrider",
    desc: "One extra movement; disengage without valor once per round.",
  },
  {
    id: "channeler",
    role: "Wizard",
    name: "Channeler",
    desc: "Recover one level-one slot once per battle for two valor.",
  },
  {
    id: "hexer",
    role: "Wizard",
    name: "Hexer",
    desc: "Distract and stun a nearby enemy for two valor.",
  },
  {
    id: "mentor",
    role: "Cleric",
    name: "Mentor",
    desc: "Treat an adjacent ally for four health and one herb.",
  },
  {
    id: "avenger",
    role: "Cleric",
    name: "Avenger",
    desc: "Strike within three tiles, with greater damage against undead.",
  },
];
export function careersFor(p) {
  return careerPaths.filter(
    (v) =>
      v.role === p?.role || (v.role === "Thief" && p?.profession === "Thief"),
  );
}
export function activeCareer(p) {
  return careersFor(p).find((v) => v.id === p?.career) || null;
}
export function careerLock(s, id, path) {
  const p = s.party[id];
  if (!p || p.dead || p.hp <= 0 || s.battle || s.event)
    return "Finish the current activity with a conscious companion.";
  return !careersFor(p).some((v) => v.id === path)
    ? "This class or profession cannot learn that path."
    : p.career
      ? "Career choices are permanent."
      : p.level < 2
        ? "Requires level two."
        : p.points < 1
          ? "Requires one training point."
          : "";
}
export function learnCareer(s, id, path) {
  if (careerLock(s, id, path)) return false;
  const p = s.party[id];
  p.points--;
  p.career = path;
  s.expedition.careers[id] = path;
  note(
    s,
    `${p.name} chooses the ${careerPaths.find((v) => v.id === path).name} career. This choice is permanent; Thief abilities require the Thief profession.`,
  );
  return true;
}
export function careerActionLock(s, id, targetId = null) {
  const b = s.battle,
    u = b?.units.find((v) => v.id === id),
    p = s.party[id],
    path = activeCareer(p);
  if (!u || !path || p.hp <= 0 || p.dead)
    return "Requires a trained, conscious specialist.";
  if (u.acted) return "This companion's action is spent.";
  const enemy = b.enemies.find((e) => e.id === targetId && e.hp > 0),
    ally = b.units.find((v) => v.id === targetId && s.party[v.id].hp > 0),
    dist = (v) => Math.abs(v.x - u.x) + Math.abs(v.y - u.y);
  if (
    ["vanguard", "channeler", "hexer", "avenger"].includes(path.id) &&
    b.valor < 2
  )
    return "Requires two valor.";
  if (
    [
      "shadow",
      "saboteur",
      "tracker",
      "controller",
      "hexer",
      "avenger",
    ].includes(path.id)
  ) {
    if (!enemy) return "Choose a living enemy.";
    const range = {
      shadow: 1,
      saboteur: 1,
      tracker: 5,
      controller: 2,
      hexer: 3,
      avenger: 3,
    }[path.id];
    if (dist(enemy) > range || !hasLineOfSight(s, u, enemy))
      return "Enemy out of range or sight.";
    if (
      path.id === "shadow" &&
      !enemy.distracted &&
      !b.units.some(
        (v) =>
          v.id !== id &&
          s.party[v.id].hp > 0 &&
          Math.abs(v.x - enemy.x) + Math.abs(v.y - enemy.y) === 1,
      )
    )
      return "Backstab requires a distracted enemy or another companion engaging them.";
  }
  if (["protector", "mentor"].includes(path.id)) {
    if (!ally || ally.id === id || dist(ally) > 1)
      return "Choose an adjacent conscious ally.";
    if (bondValue(s, id, ally.id) < 0)
      return "This companion refuses to protect or treat a rival. Repair their relationship first.";
    if (
      path.id === "mentor" &&
      (s.inventory.herbs < 1 || s.party[ally.id].hp >= s.party[ally.id].max)
    )
      return "Requires an herb and a wounded ally.";
  }
  if (path.id === "outrider" && u.outriderUsed)
    return "Once per company round.";
  if (path.id === "channeler" && (u.channelUsed || !p.spellSpent?.[1]))
    return "Recover one spent level-one slot once per battle.";
  if (
    path.id === "vanguard" &&
    !b.enemies.some((e) => e.hp > 0 && dist(e) === 1)
  )
    return "Stand beside an enemy to sweep.";
  return "";
}
export function careerAction(s, id, targetId = null) {
  if (careerActionLock(s, id, targetId)) return false;
  const b = s.battle,
    u = b.units.find((v) => v.id === id),
    p = s.party[id],
    path = activeCareer(p),
    e = b.enemies.find((e) => e.id === targetId),
    ally = b.units.find((v) => v.id === targetId);
  if (["vanguard", "channeler", "hexer", "avenger"].includes(path.id))
    b.valor -= 2;
  u.acted = true;
  if (path.id === "shadow") hitEnemy(s, e, attackPower(s, p) + 4);
  if (path.id === "saboteur") {
    e.weakened = 2;
    e.root = 1;
  }
  if (path.id === "tracker") e.exposed = 2;
  if (path.id === "sentinel") {
    u.overwatch = true;
    u.pinningWatch = true;
  }
  if (path.id === "duelist") {
    u.guard = true;
    u.riposte = true;
  }
  if (path.id === "vanguard")
    for (const enemy of b.enemies.filter(
      (e) => e.hp > 0 && Math.abs(e.x - u.x) + Math.abs(e.y - u.y) === 1,
    ))
      hitEnemy(s, enemy, Math.max(1, attackPower(s, p) - 1));
  if (path.id === "protector") {
    ally.protectedBy = id;
    u.guard = true;
  }
  if (path.id === "captain") {
    for (const v of b.units)
      if (Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 1)
        s.party[v.id].hp = Math.min(s.party[v.id].max, s.party[v.id].hp + 3);
    b.valor = Math.min(5, b.valor + 1);
  }
  if (path.id === "controller") {
    hitEnemy(s, e, 4);
    e.root = 2;
  }
  if (path.id === "outrider") {
    u.safeMove = true;
    u.acted = false;
    u.outriderUsed = true;
  }
  if (path.id === "channeler") {
    p.spellSpent[1]--;
    u.channelUsed = true;
  }
  if (path.id === "hexer") {
    e.distracted = 2;
    e.stun = 1;
  }
  if (path.id === "mentor") {
    s.inventory.herbs--;
    s.party[ally.id].hp = Math.min(
      s.party[ally.id].max,
      s.party[ally.id].hp + 4,
    );
  }
  if (path.id === "avenger")
    hitEnemy(s, e, 5 + (e.kind === "skeleton" ? 3 : 0));
  note(s, `${p.name} uses ${path.name}'s battle technique.`);
  if (b.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}
function shareGuardDamage(s, target) {
  target.protectedThisHit = false;
  const protector = s.battle.units.find(
    (u) =>
      u.id === target.protectedBy &&
      s.party[u.id].hp > 2 &&
      u.guard &&
      Math.abs(u.x - target.x) + Math.abs(u.y - target.y) <= 1,
  );
  if (protector && bondValue(s, target.id, protector.id) >= 0) {
    s.party[protector.id].hp -= 2;
    target.protectedThisHit = true;
    note(
      s,
      `${s.party[protector.id].name} shares the blow aimed at ${s.party[target.id].name}.`,
    );
  }
}
function coordinateTargets(s, e, targets) {
  if (s.battle.layoutId === "legacy" && !s.battle.mission) return;
  const score = (u) =>
    Math.abs(u.x - e.x) +
    Math.abs(u.y - e.y) +
    (u.guard ? 3 : 0) +
    terrainCell(s, u.x, u.y).cover +
    (e.kind === "wolf"
      ? (s.party[u.id].hp / s.party[u.id].max) * 4 +
        s.battle.units.filter(
          (v) =>
            v.id !== u.id &&
            s.party[v.id].hp > 0 &&
            Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 1,
        ).length *
          2
      : 0);
  targets.sort((a, b) => score(a) - score(b));
}
function coordinateSteps(s, e, target, options, retreat) {
  if (retreat || (s.battle.layoutId === "legacy" && !s.battle.mission)) return;
  const score = ([x, y]) =>
    Math.abs(x - target.x) +
    Math.abs(y - target.y) +
    (target.guard && x === target.x ? 2 : 0) -
    (["mage", "archer"].includes(e.kind) ? terrainCell(s, x, y).cover : 0) -
    s.battle.enemies.filter(
      (v) =>
        v !== e &&
        v.hp > 0 &&
        Math.abs(v.x - target.x) + Math.abs(v.y - target.y) === 1 &&
        Math.abs(x - target.x) + Math.abs(y - target.y) === 1,
    ).length;
  options.sort((a, b) => score(a) - score(b));
}
function coordinatedSpecialTurn(s, e) {
  if (e.kind === "brute") {
    e.guard = false;
    if (
      s.battle.layoutId !== "legacy" &&
      !s.battle.units.some(
        (u) =>
          s.party[u.id].hp > 0 &&
          Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 2,
      ) &&
      s.battle.enemies.some(
        (v) =>
          v !== e &&
          v.hp > 0 &&
          ["mage", "archer"].includes(v.kind) &&
          Math.abs(v.x - e.x) + Math.abs(v.y - e.y) <= 1,
      )
    ) {
      e.guard = true;
      note(s, "A shield-bearing bandit holds the line around its ranged ally.");
      return true;
    }
  }
  if ((s.battle.layoutId === "legacy" && !s.battle.mission) || e.root || e.stun)
    return false;
  if (
    e.kind === "mage" &&
    !e.casting &&
    s.battle.units.some(
      (u) =>
        s.party[u.id].hp > 0 && Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 2,
    )
  ) {
    const options = [
      [e.x + 1, e.y],
      [e.x - 1, e.y],
      [e.x, e.y + 1],
      [e.x, e.y - 1],
    ].filter(
      ([x, y]) =>
        x >= 0 &&
        x < 9 &&
        y >= 0 &&
        y < 7 &&
        !terrainCell(s, x, y).blocked &&
        !s.battle.units.some(
          (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
        ) &&
        !s.battle.enemies.some(
          (v) => v !== e && v.hp > 0 && v.x === x && v.y === y,
        ),
    );
    options.sort(
      (a, b) =>
        Math.min(
          ...s.battle.units
            .filter((u) => s.party[u.id].hp > 0)
            .map((u) => Math.abs(b[0] - u.x) + Math.abs(b[1] - u.y)),
        ) -
        Math.min(
          ...s.battle.units
            .filter((u) => s.party[u.id].hp > 0)
            .map((u) => Math.abs(a[0] - u.x) + Math.abs(a[1] - u.y)),
        ),
    );
    if (options[0]) {
      enemyDisengagement(s, e, options[0]);
      if (e.hp > 0) [e.x, e.y] = options[0];
      note(
        s,
        "The spellcaster retreats from the company rather than spending a slot at close quarters.",
      );
      return true;
    }
  }
  if (
    e.kind === "goblin" &&
    !e.trapper &&
    !e.stolenFood &&
    s.battle.traps?.some((t) => !t.used) &&
    e.hp > e.max * 0.4
  ) {
    const trap = s.battle.traps.find((t) => !t.used);
    if (
      Math.abs(e.x - trap.x) + Math.abs(e.y - trap.y) <= 2 &&
      s.battle.units.some(
        (u) =>
          s.party[u.id].hp > 0 &&
          Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 2,
      )
    ) {
      e.guard = true;
      note(
        s,
        "A goblin waits behind its snare, trying to lure the company onto the trapped approach.",
      );
      return true;
    }
  }
  return false;
}
export const observationTrails = [
  {
    id: "tracks",
    name: "Clawed footprints",
    kind: "tracks",
    target: 14,
    points: [
      { x: 625, y: 335 },
      { x: 720, y: 365 },
      { x: 805, y: 420 },
    ],
    clues: [
      "Small clawed feet drag sacks eastward.",
      "Dropped grain mixes with tracks turning southeast.",
      "The tracks disappear into Echo Cavern: a goblin den.",
    ],
    reward: "ore",
  },
  {
    id: "smoke",
    name: "Smoke through the trees",
    kind: "smoke",
    target: 12,
    points: [
      { x: 310, y: 390 },
      { x: 380, y: 435 },
      { x: 445, y: 480 },
    ],
    clues: [
      "A thin column rises beyond the eastern trees.",
      "Fresh axe cuts and bootprints lead toward a camp.",
      "Cooking smoke reveals Briarhide's supply tents.",
    ],
    reward: "wood",
  },
  {
    id: "lights",
    name: "Lights among the roots",
    kind: "lights",
    target: 7,
    points: [
      { x: 770, y: 155 },
      { x: 850, y: 180 },
      { x: 925, y: 205 },
    ],
    clues: [
      "Pale lights blink along a line of old standing stones.",
      "Roots carry a pulse toward the eastern grove.",
      "The light gathers at Whispering Grove's ancient sanctuary.",
    ],
    reward: "herbs",
  },
  {
    id: "road",
    name: "The buried royal road",
    kind: "road",
    target: 11,
    points: [
      { x: 1130, y: 650 },
      { x: 1220, y: 690 },
      { x: 1335, y: 735 },
    ],
    clues: [
      "Broken paving leads southeast beneath the grass.",
      "A weathered crown points toward the fallen keep.",
      "The royal road ends at Broken Crown.",
    ],
    reward: "ore",
  },
];
export function visibleClues(s) {
  return observationTrails.flatMap((t) => {
    const state = s.expedition.clues[t.id] || { stage: 0, seen: false };
    if (state.stage >= 3) return [];
    const p = t.points[state.stage];
    return state.seen ||
      Math.hypot(s.position.x - p.x, s.position.y - p.y) < 100
      ? [{ ...p, id: t.id, name: t.name, kind: t.kind, stage: state.stage }]
      : [];
  });
}
export function observeClues(s) {
  for (const t of observationTrails) {
    const st = s.expedition.clues[t.id] || { stage: 0, seen: false },
      p = t.points[st.stage];
    if (p && Math.hypot(s.position.x - p.x, s.position.y - p.y) < 100) {
      st.seen = true;
      s.expedition.clues[t.id] = st;
    }
  }
}
export function interpretClueLock(s, id) {
  const t = observationTrails.find((t) => t.id === id),
    st = s.expedition.clues[id] || { stage: 0 },
    p = t?.points[st.stage];
  if (!p || s.battle || s.event || s.campOpen || companyLost(s))
    return "Finish the current activity or choose an unfinished trail.";
  return !companyScout(s)
    ? "Requires a conscious Archer, Rogue or Thief."
    : Math.hypot(s.position.x - p.x, s.position.y - p.y) > 55
      ? "Approach within 55 pixels to read the clue."
      : "";
}
export function interpretClue(s, id) {
  if (interpretClueLock(s, id)) return false;
  const t = observationTrails.find((t) => t.id === id),
    st = s.expedition.clues[id] || { stage: 0, seen: true };
  note(s, `${t.name}: ${t.clues[st.stage]}`);
  st.stage++;
  st.seen = false;
  s.expedition.clues[id] = st;
  practice(s, companyScout(s), 1);
  if (st.stage === 3) {
    if (!s.discovered.includes(t.target)) s.discovered.push(t.target);
    s.knowledge += 2;
    s.inventory[t.reward] += 2;
    note(
      s,
      `Trail understood: ${places[t.target].name}. Two knowledge and two ${t.reward} recovered.`,
    );
  }
  return true;
}
export function followObservation(s, id) {
  const t = observationTrails.find((t) => t.id === id),
    st = s.expedition.clues[id];
  if (!t || !st || s.battle || s.event || s.campOpen) return false;
  const p = t.points[st.stage] || places[t.target];
  return moveTo(s, p.x, p.y);
}
export function beginTravelConversation(s) {
  const party = livingParty(s).filter((p) => p.hp > 0);
  if (
    party.length < 2 ||
    s.battle ||
    s.event ||
    s.campOpen ||
    s.expedition.conversationDay === s.day
  )
    return false;
  const first = party.find((p) => hasTrait(p, "mercenary")) || party[0],
    second = party.find((p) => p.id !== first.id);
  const kind =
    s.wageDebt > 0
      ? "wages"
      : s.hungerDays > 0
        ? "hunger"
        : bondValue(s, first.id, second.id) < 0
          ? "rivalry"
          : bondValue(s, first.id, second.id) >= 25
            ? "friendship"
            : "conversation";
  s.expedition.conversationDay = s.day;
  s.expedition.conversation = { kind, ids: [first.id, second.id] };
  s.destination = null;
  s.event = {
    kind: "travel-conversation",
    title: `${first.name} and ${second.name} on the road`,
    text: {
      wages:
        "Unpaid wages strain their trust. Settle the debt, promise payment tomorrow, or refuse.",
      hunger: "Hunger divides the party over its dwindling supplies.",
      rivalry:
        "An old disagreement becomes an argument. A shared meal can help repair their rivalry.",
      friendship: "Trusted companions offer to share the burden of the road.",
      conversation:
        "The companions discuss their doubts, their hopes, and their place in the company.",
    }[kind],
  };
  return true;
}
export function checkTravelConversation(s, distance) {
  s.expedition.travelDistance += Math.max(0, distance);
  if (s.expedition.travelDistance < 900) return false;
  if (beginTravelConversation(s)) {
    s.expedition.travelDistance = 0;
    return true;
  }
  return false;
}
export function conversationLock(s, choice) {
  const c = s.expedition.conversation;
  if (s.event?.kind !== "travel-conversation" || !c)
    return "No travel conversation.";
  if (choice === "meal") return s.food < 2 ? "Requires two rations." : "";
  if (choice === "pay")
    return c.kind !== "wages" || s.gold < s.wageDebt
      ? "Requires the full unpaid wage debt."
      : "";
  if (choice === "promise")
    return c.kind !== "wages" ? "Only available for unpaid wages." : "";
  if (choice === "listen") return "";
  if (choice === "dismiss") return "";
  return "Unknown response.";
}
export function respondConversation(s, choice) {
  if (conversationLock(s, choice)) return false;
  const c = s.expedition.conversation,
    [a, b] = c.ids,
    key = bondKey(a, b),
    party = c.ids.map((id) => s.party[id]);
  if (choice === "meal") {
    s.food -= 2;
    s.bonds[key] = Math.min(100, (s.bonds[key] || 0) + 8);
    for (const p of party) changeResolve(p, 6);
    note(s, "Sharing supplies repairs trust and reassures both companions.");
  }
  if (choice === "listen") {
    s.bonds[key] = Math.min(100, (s.bonds[key] || 0) + 3);
    for (const p of party) {
      changeResolve(p, 2);
      p.fatigue = Math.max(0, p.fatigue - 5);
    }
    note(s, "Listening eases their fatigue and strengthens their friendship.");
  }
  if (choice === "pay") {
    s.gold -= s.wageDebt;
    s.wageDebt = 0;
    for (const p of party) changeResolve(p, 6);
    note(
      s,
      "Overdue wages settled. The companions remember that you kept your word.",
    );
  }
  if (choice === "promise") {
    s.expedition.promise = { due: s.day + 1, ids: c.ids };
    note(
      s,
      "Promised to settle wages by the next dawn. A broken promise will damage trust.",
    );
  }
  if (choice === "dismiss") {
    s.bonds[key] = Math.max(-100, (s.bonds[key] || 0) - 6);
    for (const p of party) changeResolve(p, -8);
    note(s, "Dismissing the companions' concerns creates resentment.");
  }
  if (s.bonds[key] < 0) s.expedition.rivalries[key] = true;
  s.expedition.conversation = null;
  s.event = null;
  return true;
}
function settleTravelPromises(s) {
  const promise = s.expedition.promise;
  if (!promise || s.day < promise.due) return;
  const kept = s.wageDebt === 0;
  for (const id of promise.ids)
    if (s.party[id] && !s.party[id].dead)
      changeResolve(s.party[id], kept ? 5 : -12);
  const key = bondKey(...promise.ids);
  s.bonds[key] = Math.max(
    -100,
    Math.min(100, (s.bonds[key] || 0) + (kept ? 4 : -8)),
  );
  note(
    s,
    kept
      ? "Kept the promised wage payment. Trust improves."
      : "The promised wage payment was missed. Resolve and trust fall.",
  );
  if (s.bonds[key] < 0) s.expedition.rivalries[key] = true;
  s.expedition.promise = null;
}
export const homeUpgrades = [
  {
    id: "storage",
    name: "Storehouse",
    gold: 60,
    wood: 8,
    ore: 2,
    desc: "Increase reserve capacity from thirty to sixty units.",
  },
  {
    id: "beds",
    name: "Proper beds",
    gold: 65,
    wood: 8,
    ore: 0,
    desc: "Rest restores more health and removes more fatigue.",
  },
  {
    id: "infirmary",
    name: "Treatment room",
    gold: 80,
    wood: 5,
    ore: 2,
    desc: "An assigned Herbalist uses medicine to cure injuries during home rest.",
  },
  {
    id: "forge",
    name: "Permanent forge",
    gold: 90,
    wood: 6,
    ore: 6,
    desc: "An assigned Smith repairs equipment and crafts fine gear more efficiently.",
  },
  {
    id: "garden",
    name: "Kitchen garden",
    gold: 50,
    wood: 6,
    ore: 0,
    desc: "Harvest six stored rations every three days; farms harvest eight.",
  },
];
export function homeLock(s, action = "enter") {
  if (s.battle || s.event || s.campOpen || s.destination || companyLost(s))
    return "Finish the current activity and stop walking.";
  if (s.location !== 15) return "Travel to Wayfarer Lodge.";
  if (action === "buy")
    return s.expedition.home.owned
      ? "Already owned."
      : s.gold < 320 || s.inventory.wood < 10
        ? "Requires 320 crowns and ten wood."
        : "";
  return s.expedition.home.owned
    ? ""
    : "Purchase the abandoned property first.";
}
export function purchaseHome(s, style = "lodge") {
  if (!["lodge", "farm"].includes(style) || homeLock(s, "buy")) return false;
  s.gold -= 320;
  s.inventory.wood -= 10;
  s.expedition.home.owned = true;
  s.expedition.home.style = style;
  s.expedition.home.harvestDay = s.day;
  note(
    s,
    `The company purchased Wayfarer ${style === "farm" ? "Farm" : "Lodge"}. This is a permanent home; the wagon remains your traveling camp.`,
  );
  return true;
}
export function enterHome(s) {
  if (homeLock(s)) return false;
  s.event = {
    kind: "home",
    title: "The company home",
    text: "Store supplies, assign station workers, improve the property, and recover here.",
  };
  return true;
}
export function homeWorker(s, role) {
  const id = s.expedition.home.staff[role],
    p = s.party[id];
  return p &&
    !p.dead &&
    p.hp > 0 &&
    (role === "smith" ? p.profession === "Smith" : p.profession === "Herbalist")
    ? p
    : null;
}
export function assignHomeJob(s, role, id) {
  if (s.event?.kind !== "home" || !["smith", "medic"].includes(role))
    return false;
  if (id === null) {
    delete s.expedition.home.staff[role];
    return true;
  }
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    p.hp <= 0 ||
    p.profession !== (role === "smith" ? "Smith" : "Herbalist")
  )
    return false;
  s.expedition.home.staff[role] = id;
  return true;
}
export function upgradeHome(s, id) {
  const item = homeUpgrades.find((v) => v.id === id),
    h = s.expedition.home;
  if (
    s.event?.kind !== "home" ||
    !h.owned ||
    !item ||
    h.upgrades[id] ||
    s.gold < item.gold ||
    s.inventory.wood < item.wood ||
    s.inventory.ore < item.ore
  )
    return false;
  s.gold -= item.gold;
  s.inventory.wood -= item.wood;
  s.inventory.ore -= item.ore;
  h.upgrades[id] = 1;
  note(s, `${item.name} built at the company home.`);
  return true;
}
const reserveKeys = [
  "food",
  "ore",
  "wood",
  "herbs",
  "medicine",
  "grain",
  "cloth",
  "salt",
  "iron",
];
export function reserveCapacity(s) {
  return s.expedition.home.upgrades.storage ? 60 : 30;
}
export function reserveLoad(s) {
  return Object.values(s.expedition.home.stores).reduce((a, b) => a + b, 0);
}
export function transferHome(s, key, amount, direction = "deposit") {
  if (
    s.event?.kind !== "home" ||
    !reserveKeys.includes(key) ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > 60 ||
    !["deposit", "withdraw"].includes(direction)
  )
    return false;
  const stores = s.expedition.home.stores,
    source =
      key === "food"
        ? s
        : tradeGoods.some((g) => g.id === key)
          ? s.cargo
          : s.inventory;
  if (direction === "deposit") {
    if (source[key] < amount || reserveLoad(s) + amount > reserveCapacity(s))
      return false;
    source[key] -= amount;
    stores[key] += amount;
  } else {
    if (
      stores[key] < amount ||
      (source === s.cargo && cargoLoad(s) + amount > companyCargoCapacity(s))
    )
      return false;
    stores[key] -= amount;
    source[key] += amount;
  }
  return true;
}
export function restAtHome(s) {
  const h = s.expedition.home,
    cost = Math.max(2, Math.ceil(campCost(s) / 2));
  if (
    s.event?.kind !== "home" ||
    !h.owned ||
    s.food + h.stores.food < cost ||
    companyLost(s)
  )
    return false;
  const stored = Math.min(h.stores.food, cost);
  h.stores.food -= stored;
  s.food -= cost - stored;
  const medic = h.upgrades.infirmary && homeWorker(s, "medic"),
    treatment = medic && s.inventory.medicine > 0;
  if (treatment) {
    s.inventory.medicine--;
    for (const p of livingParty(s)) if (p.wound) p.wound.treated = true;
    practice(s, medic, 1);
  }
  spendHours(s, 12, { resting: true, mealsProvided: true });
  for (const p of livingParty(s)) {
    p.hp = Math.min(
      p.max,
      p.hp + 12 + (h.upgrades.beds ? 8 : 0) + (treatment ? 8 : 0),
    );
    p.fatigue = Math.max(0, p.fatigue - (h.upgrades.beds ? 60 : 40));
    if (treatment) p.injury = false;
    changeResolve(p, 3);
  }
  restRelationships(s);
  note(
    s,
    `Rested twelve hours at home for ${cost} rations; daily wages still apply. ${treatment ? "The assigned medic treated injuries with one medicine." : "Beds and shelter restore health and fatigue."}`,
  );
  return true;
}
export function harvestHome(s) {
  const h = s.expedition.home,
    amount = h.style === "farm" ? 8 : 6;
  if (
    s.event?.kind !== "home" ||
    !h.upgrades.garden ||
    s.day - h.harvestDay < 3 ||
    reserveLoad(s) + amount > reserveCapacity(s)
  )
    return false;
  h.harvestDay = s.day;
  h.stores.food += amount;
  note(
    s,
    `The home garden yields ${amount} stored rations. Another harvest will be ready in three days.`,
  );
  return true;
}
export function homeRepair(s, id) {
  const h = s.expedition.home,
    smith = homeWorker(s, "smith"),
    item = gearItem(s, id);
  if (
    s.event?.kind !== "home" ||
    !h.upgrades.forge ||
    !smith ||
    !item ||
    item.durability === 100 ||
    s.inventory.ore < 1 ||
    s.inventory.wood < 1
  )
    return false;
  s.inventory.ore--;
  s.inventory.wood--;
  s.gear.find((g) => g.id === id).durability = 100;
  practice(s, smith, 1);
  spendHours(s, 2);
  note(
    s,
    `${smith.name} repairs ${item.name} in the home forge for one ore and one wood.`,
  );
  return true;
}
export function homeCraft(s, template) {
  const h = s.expedition.home,
    smith = homeWorker(s, "smith"),
    plan = equipmentRecipe(s, template);
  if (
    s.event?.kind !== "home" ||
    !h.upgrades.forge ||
    !smith ||
    !plan ||
    !s.research.includes("armorer") ||
    s.inventory.ore < Math.max(1, plan.ore - 1) ||
    s.inventory.wood < plan.wood
  )
    return false;
  s.inventory.ore -= Math.max(1, plan.ore - 1);
  s.inventory.wood -= plan.wood;
  grantEquipment(s, template);
  practice(s, smith, 1);
  spendHours(s, 2);
  note(s, `${smith.name} crafts ${plan.item.name} at the permanent forge.`);
  return true;
}
export function upkeepForecast(s) {
  const food = campCost(s) + s.odyssey.prisoners.length,
    wages = dailyWages(s);
  return {
    food,
    wages,
    foodDays: Math.floor(s.food / food),
    paidDays: Math.floor(Math.max(0, s.gold - s.wageDebt) / Math.max(1, wages)),
    hoursToDawn: 24 - s.timeOfDay,
  };
}
function restoreExpedition(s, raw) {
  const r = raw.expedition || {},
    e = freshExpedition(),
    count = (v, max = 10000) =>
      Number.isInteger(v) ? Math.max(0, Math.min(max, v)) : 0;
  for (const m of tacticalMissions)
    if (
      Number.isInteger(r.missionLedger?.[m.id]) &&
      r.missionLedger[m.id] > 0 &&
      r.missionLedger[m.id] <= s.day
    )
      e.missionLedger[m.id] = r.missionLedger[m.id];
  e.mission = tacticalMissions.some(
    (m) => m.id === r.mission && !e.missionLedger[m.id],
  )
    ? r.mission
    : null;
  for (const t of observationTrails) {
    const old = r.clues?.[t.id];
    if (old)
      e.clues[t.id] = { stage: count(old.stage, 3), seen: old.seen === true };
  }
  for (const p of s.party) {
    const id = r.careers?.[p.id];
    p.career = p.level >= 2 && careerPaths.some((v) => v.id === id) ? id : null;
    if (p.career) e.careers[p.id] = p.career;
  }
  e.conversationDay = Math.min(s.day, count(r.conversationDay));
  e.travelDistance = count(r.travelDistance, 900);
  const validIds = (ids) =>
    Array.isArray(ids) &&
    ids.length === 2 &&
    ids[0] !== ids[1] &&
    ids.every((id) => Number.isInteger(id) && s.party[id] && !s.party[id].dead);
  if (
    r.promise &&
    validIds(r.promise.ids) &&
    Number.isInteger(r.promise.due) &&
    r.promise.due >= s.day &&
    r.promise.due <= s.day + 1
  )
    e.promise = { ids: r.promise.ids, due: r.promise.due };
  if (
    r.conversation &&
    validIds(r.conversation.ids) &&
    ["wages", "hunger", "rivalry", "friendship", "conversation"].includes(
      r.conversation.kind,
    ) &&
    raw.event?.kind === "travel-conversation" &&
    !s.battle
  ) {
    e.conversation = { ids: r.conversation.ids, kind: r.conversation.kind };
    s.event = {
      kind: "travel-conversation",
      title: `${s.party[e.conversation.ids[0]].name} and ${s.party[e.conversation.ids[1]].name} on the road`,
      text: "Your companions await your response. Sharing a meal or listening builds trust; promises must be kept.",
    };
  } else if (s.event?.kind === "travel-conversation") s.event = null;
  const h = r.home || {};
  e.home.owned = h.owned === true;
  e.home.style =
    e.home.owned && ["lodge", "farm"].includes(h.style)
      ? h.style
      : e.home.owned
        ? "lodge"
        : null;
  if (e.home.owned) {
    for (const upgrade of homeUpgrades)
      if (h.upgrades?.[upgrade.id] === 1) e.home.upgrades[upgrade.id] = 1;
    let remaining = e.home.upgrades.storage ? 60 : 30;
    for (const key of reserveKeys) {
      const amount = Math.min(remaining, count(h.stores?.[key], 60));
      e.home.stores[key] = amount;
      remaining -= amount;
    }
    e.home.harvestDay = Math.min(s.day, count(h.harvestDay));
    for (const role of ["smith", "medic"]) {
      const id = h.staff?.[role],
        p = s.party[id];
      if (
        Number.isInteger(id) &&
        p &&
        !p.dead &&
        p.profession === (role === "smith" ? "Smith" : "Herbalist")
      )
        e.home.staff[role] = id;
    }
  }
  for (let a = 0; a < s.party.length; a++)
    for (let b = a + 1; b < s.party.length; b++) {
      const key = bondKey(a, b),
        v = raw.bonds?.[key];
      if (
        r.rivalries?.[key] === true &&
        !s.party[a].dead &&
        !s.party[b].dead &&
        Number.isFinite(v) &&
        v < 0
      ) {
        e.rivalries[key] = true;
        s.bonds[key] = Math.max(-100, Math.floor(v));
      }
    }
  s.expedition = e;
  if (s.event?.kind === "home")
    s.event =
      e.home.owned && s.location === 15 && !s.battle
        ? {
            kind: "home",
            title: "The company home",
            text: "Your property and its stored supplies are preserved.",
          }
        : null;
  if (s.battle) {
    const m = tacticalMissions.find(
        (v) => v.id === raw.battle.mission && e.mission === v.id,
      ),
      o = raw.battle.objective;
    s.battle.mission = m?.id || null;
    if (m && o)
      s.battle.objective = {
        kind: m.kind,
        rounds: count(o.rounds, 6),
        wagon: count(o.wagon, 30),
        rescuer:
          Number.isInteger(o.rescuer) && s.party[o.rescuer] ? o.rescuer : null,
        sigils: [
          ...new Set(
            (Array.isArray(o.sigils) ? o.sigils : []).filter((v) =>
              [0, 1, 2].includes(v),
            ),
          ),
        ],
        prisoner: { x: 7, y: 3 },
        limit: 6,
      };
    else delete s.battle.objective;
    for (const enemy of s.battle.enemies) {
      enemy.weakened = count(enemy.weakened, 2);
      enemy.exposed = count(enemy.exposed, 2);
    }
    for (const u of s.battle.units) {
      u.channelUsed = u.channelUsed === true;
      u.pinningWatch = u.pinningWatch === true;
      u.riposte = u.riposte === true;
      u.outriderUsed = u.outriderUsed === true;
      u.protectedBy =
        Number.isInteger(u.protectedBy) && s.party[u.protectedBy]
          ? u.protectedBy
          : null;
    }
  }
}

export function recoverMagicAtHome(s, id) {
  const p = s.party[id];
  if (
    s.event?.kind !== "home" ||
    !s.expedition.home.owned ||
    !p ||
    p.dead ||
    p.hp <= 0 ||
    !isCaster(p) ||
    s.realm.shards < 1 ||
    !(p.spellSpent?.[1] || p.spellSpent?.[2])
  )
    return false;
  s.realm.shards--;
  if (p.spellSpent[2] > 0) p.spellSpent[2]--;
  else p.spellSpent[1] = Math.max(0, p.spellSpent[1] - 2);
  spendHours(s, 1);
  note(s, `${p.name} spends an aether shard restoring magic at home.`);
  return true;
}

// Regional travel, companion continuations, and captives share a bounded save ledger.
export const regions = [
  {
    id: "farmland",
    name: "Greyhaven Farmlands",
    desc: "Golden fields and rebuilt farms. Grain and rations are plentiful; hungry bandits watch the roads.",
    hazard: "A washed-out irrigation ditch cuts across the fields.",
    goods: "grain",
    color: "#b1ad72",
  },
  {
    id: "coast",
    name: "Salt Coast",
    desc: "Reed banks, floodwater and salt merchants. Salt is cheap at Saltbridge; iron and grain are in demand.",
    hazard: "The river has flooded a ford ahead.",
    goods: "salt",
    color: "#99ada0",
  },
  {
    id: "mountains",
    name: "Redstone Passes",
    desc: "Cold scree, narrow tracks and raider lookouts. Ore seams reward Miners; shelters prevent exhausting climbs.",
    hazard: "A scree fall blocks the mountain approach.",
    goods: "iron",
    color: "#9a9caa",
  },
  {
    id: "haunted",
    name: "Whispering Wilds",
    desc: "Pale roots and spirit lights surround old graves. Wolves, goblins and restless dead stalk the woodland. Herbalists recognize safe growth.",
    hazard: "False lanterns lure travelers into choking ghost-mist.",
    goods: "herbs",
    color: "#89959c",
  },
  {
    id: "city",
    name: "Emberfall Dominion",
    desc: "Terraced gardens, tiled roads and a flourishing magical city. Cloth and iron are cheap; grain is scarce. Its academy offers costly arcane travel.",
    hazard: "A leaking ward floods the old road with arcane static.",
    goods: "cloth",
    color: "#b1a48d",
  },
];
export function regionAt(position) {
  const id =
    position.y < 150
      ? "mountains"
      : position.x >= 870 && position.y < 400
        ? "haunted"
        : position.x >= 1000 && position.y >= 440
          ? "city"
          : position.x >= 450
            ? "coast"
            : "farmland";
  return regions.find((r) => r.id === id);
}
export function freshOdyssey() {
  return {
    distance: 0,
    hazardLedger: {},
    visited: {},
    journeys: {},
    prisoners: [],
    serial: 0,
    services: {},
    relics: {},
  };
}
export function checkRegionalTravel(s, distance) {
  const o = s.odyssey,
    r = regionAt(s.position);
  o.visited[r.id] = true;
  o.distance = Math.min(1200, o.distance + Math.max(0, distance));
  if (
    o.distance < 650 ||
    s.event ||
    s.battle ||
    s.campOpen ||
    s.location >= 0 ||
    o.hazardLedger[r.id] === s.day ||
    companyLost(s)
  )
    return false;
  o.distance = 0;
  o.hazardLedger[r.id] = s.day;
  s.destination = null;
  s.event = { kind: "region", region: r.id, title: r.name, text: r.hazard };
  note(s, `${r.name}: ${r.hazard}`);
  return true;
}
export function regionalChoiceLock(s, action) {
  const r = regions.find((r) => r.id === s.event?.region);
  if (s.event?.kind !== "region" || !r)
    return "No regional obstacle is pending.";
  if (action === "detour") return null;
  if (action === "supplies")
    return s.food < 2 || s.inventory.wood < 1
      ? "Requires two rations and one timber."
      : null;
  if (action === "specialist") {
    const prof = {
      farmland: "Cook",
      coast: "Thief",
      mountains: "Miner",
      haunted: "Herbalist",
      city: "Wizard",
    }[r.id];
    return !livingParty(s).some(
      (p) => p.hp > 0 && (p.profession === prof || p.role === prof),
    )
      ? `Requires a conscious ${prof}.`
      : null;
  }
  return "Unknown obstacle response.";
}
export function regionalChoice(s, action) {
  if (regionalChoiceLock(s, action)) return false;
  const r = regions.find((r) => r.id === s.event.region);
  s.event = null;
  if (action === "supplies") {
    s.food -= 2;
    s.inventory.wood--;
    spendHours(s, 1);
  }
  if (action === "detour") {
    spendHours(s, 3);
    for (const p of livingParty(s)) p.fatigue = Math.min(100, p.fatigue + 8);
  }
  if (action === "specialist") {
    spendHours(s, 1);
    s.knowledge++;
  }
  note(
    s,
    `${r.name}: ${action === "detour" ? "took a tiring three-hour detour" : action === "supplies" ? "used supplies to secure the crossing" : "a specialist found a safe one-hour route"}.`,
  );
  return true;
}
export function regionalServiceLock(s, action, target = null) {
  if (s.battle || s.event || s.campOpen || companyLost(s) || townAccessLock(s))
    return "Visit an accessible village outside an encounter.";
  if (action === "provisions")
    return s.location !== 0
      ? "Only Greyhaven's farm market offers harvest bundles."
      : s.gold < 18
        ? "Requires eighteen crowns."
        : s.odyssey.services.harvest === s.day
          ? "One harvest bundle per day."
          : null;
  if (action === "remedies")
    return s.location !== 3
      ? "Only Saltbridge's reed apothecary offers remedies."
      : s.gold < 20
        ? "Requires twenty crowns."
        : s.odyssey.services.remedies === s.day
          ? "One remedy bundle per day."
          : null;
  if (action === "transit") {
    if (s.location !== 6)
      return "Arcane travel is available only at Emberfall's academy.";
    if (![0, 3].includes(target) || !s.discovered.includes(target))
      return "Choose a discovered village.";
    if (
      s.wagon.owned ||
      s.caravanEscort ||
      s.travelers.merrit === "escorting" ||
      s.odyssey.prisoners.length
    )
      return "The gate cannot carry wagons, escorts or prisoners.";
    if (
      !livingParty(s).some(
        (p) => p.hp > 0 && isCaster(p) && spellSlots(p)[2] > 0,
      )
    )
      return "A conscious caster needs an available level-two slot.";
    return s.gold < 50 ? "Requires fifty crowns." : null;
  }
  return "Unknown regional service.";
}
export function regionalService(s, action, target = null) {
  if (regionalServiceLock(s, action, target)) return false;
  if (action === "provisions") {
    s.gold -= 18;
    s.food += 12;
    s.odyssey.services.harvest = s.day;
  }
  if (action === "remedies") {
    s.gold -= 20;
    s.inventory.herbs += 4;
    s.inventory.medicine += 1;
    s.odyssey.services.remedies = s.day;
  }
  if (action === "transit") {
    const p = livingParty(s).find(
      (p) => p.hp > 0 && isCaster(p) && spellSlots(p)[2] > 0,
    );
    s.gold -= 50;
    p.spellSpent[2]++;
    spendHours(s, 2);
    if (companyLost(s)) return true;
    s.location = target;
    s.position = { x: places[target].x, y: places[target].y };
    s.destination = null;
    s.trail = [{ ...s.position }];
    discoverNearby(s);
  }
  note(
    s,
    `Regional service: ${action === "transit" ? `arcane passage to ${places[target].name}, fifty crowns and a level-two slot` : action === "provisions" ? "twelve harvest rations for eighteen crowns" : "four herbs and one medicine for twenty crowns"}.`,
  );
  return true;
}
export function regionalForage(s) {
  const r = regionAt(s.position);
  return r.id === "mountains"
    ? { resource: "ore", amount: professional(s, "Miner") ? 2 : 1 }
    : r.id === "haunted"
      ? { resource: "herbs", amount: professional(s, "Herbalist") ? 2 : 1 }
      : null;
}

export const companionContinuations = {
  Swordswoman: {
    title: "The broken dueling oath",
    testimony:
      "An old dueling tutor remembers a companion who fled the watchtower rather than execute a prisoner. The discarded oath blade may prove why.",
    evidence:
      "Inside the abandoned guard post, a broken blade lies beside an order to kill unarmed travelers. Your companion kept their honor at the cost of their name.",
    meet: 0,
    site: 5,
    resource: "ore",
    perk: "oathstrike",
    desc: "Once per battle, strike an adjacent enemy and brace without valor.",
  },
  Shieldbearer: {
    title: "Names beneath the barrow",
    testimony:
      "A ferryman carried nameless soldiers to the barrow. A shield bearing their household names was buried with them.",
    evidence:
      "Cleaning the buried shield reveals the names of people your companion thought they had failed. Their last inscription thanks the defender who held the retreat.",
    meet: 3,
    site: 2,
    resource: "herbs",
    perk: "steadfast",
    desc: "Once per battle, grant every conscious companion a two-point ward.",
  },
  Spearman: {
    title: "The watcher's last post",
    testimony:
      "A quarry foreman saw a watchman leave a spear beside a collapsed pass. An unfinished evacuation map remains beneath the rubble.",
    evidence:
      "The repaired map shows the watchman deliberately drew the raiders away from fleeing families. Your companion can restore that lonely watch to the company.",
    meet: 3,
    site: 9,
    resource: "ore",
    perk: "holdfast",
    desc: "Once per battle, root every enemy within spear reach for two rounds.",
  },
  Archer: {
    title: "The hunter's missing sister",
    testimony:
      "A caravan witness saw the missing hunter entering the pale grove. Her trail markers were made with medicinal sap.",
    evidence:
      "The sap reveals a hidden message: the hunter survived and chose to guard the grove. She asks your companion to protect the people beside them instead of chasing her shadow.",
    meet: 0,
    site: 7,
    resource: "herbs",
    perk: "trueflight",
    desc: "Once per battle, mark every visible enemy for stronger company attacks.",
  },
  Wizard: {
    title: "An apprentice's forbidden notes",
    testimony:
      "An academy archivist admits the apprentice was expelled for sharing spells with poor villagers. Their copied notes were hidden in the Broken Crown.",
    evidence:
      "The rebound notes teach a careful way to preserve a final spark. A dedication asks that this knowledge help those who cannot pay for city magic.",
    meet: 6,
    site: 11,
    resource: "ore",
    perk: "lastspark",
    desc: "Once per battle, recover one spent level-one slot without valor.",
  },
  Cleric: {
    title: "The bell that forgot its dead",
    testimony:
      "A temple keeper remembers a drowned chapel whose bell recorded names erased from the official rolls. Its clapper still bears them.",
    evidence:
      "Herbs lift the tarnish from the bell clapper. The forgotten names return, and your companion promises that company mercy will reach beyond temple walls.",
    meet: 6,
    site: 8,
    resource: "herbs",
    perk: "mercy",
    desc: "Once per battle, heal all conscious companions by four health.",
  },
};
export function continuationInfo(s, id) {
  const p = s.party[id],
    q = s.odyssey.journeys[id],
    c = companionContinuations[p?.role];
  return c
    ? {
        ...c,
        stage: q?.stage || 0,
        outcome: q?.outcome || null,
        partner: q?.partner ?? null,
      }
    : null;
}
export function continuationLock(s, id, action) {
  const p = s.party[id],
    q = s.odyssey.journeys[id],
    c = companionContinuations[p?.role];
  if (!p || p.dead || p.hp <= 0 || !c || s.battle || s.event || companyLost(s))
    return "Requires a conscious companion outside an encounter.";
  if (action === "begin")
    return !s.campOpen
      ? "Discuss the next journey at camp."
      : q
        ? "This follow-up journey has already begun."
        : p.personalQuest?.stage !== 3
          ? "Finish this companion's first personal journey."
          : null;
  if (!q || q.stage === 4) return "No unfinished follow-up journey.";
  if (action === "meet")
    return q.stage !== 1 || s.campOpen || s.location !== c.meet
      ? `Visit ${places[c.meet].name} together first.`
      : townAccessLock(s);
  if (action === "recover")
    return q.stage !== 2 || s.campOpen || s.location !== c.site
      ? `Follow the testimony to ${places[c.site].name}.`
      : s.inventory[c.resource] < 2
        ? `Requires two ${c.resource} for the investigation.`
        : null;
  if (!s.campOpen || q.stage !== 3)
    return "Recover the evidence, then discuss it at camp.";
  const partner = s.party[q.partner];
  if (action === "swear")
    return !partner || partner.dead || bondValue(s, id, partner.id) < 10
      ? "The chosen partner must be alive with at least ten bond."
      : s.wageDebt > 0
        ? "Settle unpaid wages before making an oath."
        : null;
  if (action === "reconcile")
    return s.gold < 25
      ? "Requires twenty-five crowns for restitution."
      : !partner || partner.dead
        ? "Their chosen partner is no longer in the company."
        : null;
  return action === "depart" ? null : "Unknown journey decision.";
}
export function continueCompanion(s, id, action) {
  if (continuationLock(s, id, action)) return false;
  const p = s.party[id],
    c = companionContinuations[p.role];
  if (action === "begin") {
    const partner = livingParty(s)
      .filter((v) => v.id !== id)
      .sort((a, b) => bondValue(s, id, b.id) - bondValue(s, id, a.id))[0];
    s.odyssey.journeys[id] = {
      stage: 1,
      partner: partner?.id ?? null,
      outcome: null,
    };
    if (!s.discovered.includes(c.meet)) s.discovered.push(c.meet);
  } else if (action === "meet") {
    s.odyssey.journeys[id].stage = 2;
    if (!s.discovered.includes(c.site)) s.discovered.push(c.site);
    spendHours(s, 1);
    note(
      s,
      `${p.name}: ${c.testimony} Recover the evidence at ${places[c.site].name}; bring two ${c.resource}.`,
    );
  } else if (action === "recover") {
    s.inventory[c.resource] -= 2;
    spendHours(s, 2);
    if (p.dead) return true;
    s.odyssey.journeys[id].stage = 3;
    note(
      s,
      `${p.name}: ${c.evidence} Discuss its meaning with the company at camp.`,
    );
  } else {
    const q = s.odyssey.journeys[id];
    q.stage = 4;
    q.outcome = action;
    if (action === "depart") {
      departCompanion(s, p);
      s.reputation.freefolk = Math.min(100, s.reputation.freefolk + 3);
    } else {
      if (action === "reconcile") s.gold -= 25;
      const key = bondKey(id, q.partner);
      s.bonds[key] = Math.max(10, bondValue(s, id, q.partner) + 12);
      delete s.expedition.rivalries[key];
      changeResolve(p, 15);
      changeResolve(s.party[q.partner], 8);
      s.knowledge += 2;
      note(
        s,
        `${p.name} and ${s.party[q.partner].name} ${action === "swear" ? "swear a company oath" : "repair their trust"}. ${c.desc}`,
      );
    }
  }
  note(s, `${p.name}: ${c.title} — stage ${s.odyssey.journeys[id].stage}/4.`);
  return true;
}
export function chooseJourneyPartner(s, id, partnerId) {
  const p = s.party[id],
    other = s.party[partnerId],
    q = s.odyssey.journeys[id];
  if (
    !s.campOpen ||
    s.battle ||
    s.event ||
    !p ||
    p.dead ||
    p.hp <= 0 ||
    !other ||
    other.dead ||
    other.hp <= 0 ||
    id === partnerId ||
    !q ||
    q.stage >= 4
  )
    return false;
  q.partner = partnerId;
  note(
    s,
    `${other.name} agrees to accompany ${p.name}'s personal journey. Their actual trust still determines the final oath.`,
  );
  return true;
}
export function continuationTechniqueLock(s, id, target = null) {
  const p = s.party[id],
    u = s.battle?.units.find((v) => v.id === id),
    q = s.odyssey.journeys[id];
  if (
    !u ||
    p.hp <= 0 ||
    !q ||
    q.stage !== 4 ||
    !["swear", "reconcile"].includes(q.outcome)
  )
    return "Complete this companion's follow-up with an oath or reconciliation.";
  if (u.questUsed)
    return "This personal technique was already used in this battle.";
  if (u.acted) return "Action already spent.";
  if (p.role === "Wizard" && !(p.spellSpent?.[1] > 0))
    return "Spend a level-one slot before recovering it.";
  if (p.role === "Swordswoman") {
    const e = s.battle.enemies.find((e) => e.id === target && e.hp > 0);
    if (!e || Math.abs(e.x - u.x) + Math.abs(e.y - u.y) > 1)
      return "Choose an adjacent living enemy.";
  }
  return null;
}
export function continuationTechnique(s, id, target = null) {
  if (continuationTechniqueLock(s, id, target)) return false;
  const p = s.party[id],
    b = s.battle,
    u = b.units.find((v) => v.id === id);
  u.questUsed = true;
  u.acted = true;
  if (p.role === "Swordswoman") {
    hitEnemy(
      s,
      b.enemies.find((e) => e.id === target),
      attackPower(s, p) + 2,
    );
    u.guard = true;
  }
  if (p.role === "Shieldbearer")
    b.units
      .filter((v) => s.party[v.id].hp > 0)
      .forEach((v) => (v.arcaneWard = Math.max(v.arcaneWard || 0, 2)));
  if (p.role === "Spearman")
    b.enemies
      .filter((e) => e.hp > 0 && Math.abs(e.x - u.x) + Math.abs(e.y - u.y) <= 2)
      .forEach((e) => (e.root = 2));
  if (p.role === "Archer")
    b.enemies
      .filter((e) => e.hp > 0 && hasLineOfSight(s, u, e))
      .forEach((e) => (e.exposed = 2));
  if (p.role === "Wizard") p.spellSpent[1]--;
  if (p.role === "Cleric")
    livingParty(s)
      .filter((v) => v.hp > 0)
      .forEach((v) => (v.hp = Math.min(v.max, v.hp + 4)));
  note(
    s,
    `${p.name} uses ${companionContinuations[p.role].perk}; once per battle.`,
  );
  if (b.enemies.every((e) => e.hp <= 0)) win(s);
  return true;
}

export function prisonerGuard(s) {
  return (
    campWorker(s, "guard") ||
    travelWorker(s, "rearguard") ||
    s.party.find(
      (p) =>
        p.hp > 0 &&
        !p.dead &&
        (p.role === "Shieldbearer" || p.profession === "Thief"),
    )
  );
}
function surrenderEligible(s, e) {
  const b = s.battle;
  return (
    b &&
    !b.mission &&
    !b.realmStronghold &&
    !b.stronghold &&
    !b.dungeonReturn &&
    !Number.isInteger(b.realmLineage) &&
    !e.bossId &&
    !e.escaped &&
    ["raider", "archer", "brute", "goblin", "mage"].includes(e.kind) &&
    (b.kind === "patrol" ||
      (b.kind === "contract" &&
        !["boss", "story"].includes(s.contract?.kind))) &&
    !b.caravanRaid &&
    b.patrolId !== "warden-pursuit"
  );
}
export function refreshSurrender(s) {
  const b = s.battle;
  if (!b) return false;
  const alive = b.enemies.filter((e) => e.hp > 0),
    company = b.units.filter((u) => s.party[u.id].hp > 0);
  for (const e of alive) {
    if (!surrenderEligible(s, e) || b.turn < 2) continue;
    if (e.hp <= e.max / 2 && company.length >= alive.length + 1) {
      if (!e.refused) e.surrenderOffer = true;
      if (e.refused && e.hp <= e.max / 4) e.fleeing = true;
    }
  }
  return alive.some((e) => e.surrenderOffer);
}
export function surrenderLock(s, id, action) {
  const e = s.battle?.enemies.find((e) => e.id === id);
  if (!e || e.hp <= 0 || !e.surrenderOffer || !surrenderEligible(s, e))
    return "This enemy has not offered surrender.";
  if (action === "capture")
    return s.odyssey.prisoners.length >= 3
      ? "The company can supervise at most three prisoners."
      : !prisonerGuard(s)
        ? "Requires a conscious Shieldbearer, Thief or assigned guard."
        : null;
  if (action === "ransom") return null;
  if (action === "release" || action === "refuse") return null;
  return "Unknown surrender response.";
}
export function answerSurrender(s, id, action) {
  if (surrenderLock(s, id, action)) return false;
  const e = s.battle.enemies.find((e) => e.id === id);
  if (action === "refuse") {
    e.surrenderOffer = false;
    e.refused = true;
    e.fleeing = e.hp <= e.max / 4;
    note(s, "Surrender refused. A badly wounded enemy may try to escape.");
    return true;
  }
  if (action === "capture") {
    const serial = ++s.odyssey.serial;
    s.odyssey.prisoners.push({
      id: serial,
      name: `${e.kind === "goblin" ? "Grik" : e.kind === "mage" ? "Varen" : e.kind === "archer" ? "Hale" : "Bram"}${serial > 1 ? ` ${serial}` : ""} the captive`,
      kind: e.kind,
      day: s.day,
      trust: 0,
      unfed: 0,
    });
  }
  if (action === "ransom") {
    s.gold += 8;
    changeReputation(s, "wardens", -1);
  }
  if (action === "release") {
    changeReputation(s, "freefolk", 1);
  }
  e.surrendered = true;
  e.hp = 0;
  e.casting = null;
  note(
    s,
    `${e.kind} ${action === "capture" ? "captured: one ration per day, with supervision needed" : action === "ransom" ? "buys safe passage for eight crowns" : "released alive"}.`,
  );
  if (s.battle.enemies.every((e) => e.hp <= 0)) win(s);
  return true;
}
function routeEnemy(s, e) {
  if (!e.fleeing || (e.bossId && !surrenderEligible(s, e))) return false;
  if (e.root > 0 || e.stun > 0) return false;
  if (e.x >= 8) {
    e.hp = 0;
    e.escaped = true;
    e.casting = null;
    note(
      s,
      "A routed enemy escapes the battlefield. Their stolen supplies are lost.",
    );
    return true;
  }
  const options = [
    [e.x + 1, e.y],
    [e.x, e.y - 1],
    [e.x, e.y + 1],
  ].filter(
    ([x, y]) =>
      x >= 0 &&
      x < 9 &&
      y >= 0 &&
      y < 7 &&
      !terrainCell(s, x, y).blocked &&
      !s.battle.units.some(
        (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
      ) &&
      !s.battle.enemies.some(
        (v) => v !== e && v.hp > 0 && v.x === x && v.y === y,
      ),
  );
  const point = options[0];
  if (point) {
    enemyDisengagement(s, e, point);
    if (e.hp > 0) [e.x, e.y] = point;
    triggerOverwatch(s, e);
  }
  return true;
}
export function settlePrisoners(s) {
  if (!s.odyssey.prisoners.length) return;
  const guard = prisonerGuard(s);
  s.odyssey.prisoners = s.odyssey.prisoners.filter((p) => {
    if (s.food > 0) {
      s.food--;
      p.trust = Math.min(3, p.trust + 1);
      p.unfed = 0;
    } else {
      p.unfed++;
      p.trust = Math.max(0, p.trust - 1);
    }
    if (p.unfed >= 2 || (!guard && s.day - p.day >= 3)) {
      note(
        s,
        `${p.name} escaped ${p.unfed >= 2 ? "after being denied food" : "without supervision"}.`,
      );
      return false;
    }
    return true;
  });
}
export function prisonerActionLock(s, id, action) {
  const p = s.odyssey.prisoners.find((v) => v.id === id);
  if (!p || s.battle || s.event || companyLost(s))
    return "Manage a current prisoner outside an encounter.";
  if (action === "release") return null;
  if (action === "ransom")
    return s.campOpen || ![0, 3, 6].includes(s.location)
      ? "Visit a village guard to collect the bounty."
      : townAccessLock(s);
  if (action === "recruit")
    return p.kind === "goblin"
      ? "Goblins can be released or delivered for bounty, but cannot join this company."
      : !s.campOpen
        ? "Discuss recruitment at camp."
        : p.trust < 2
          ? "Provide at least two days of food to earn trust."
          : s.wageDebt > 0
            ? "Pay existing wage debts first."
            : livingParty(s).length >= 6
              ? "The company already has six companions."
              : s.gold < 60
                ? "Requires sixty crowns for release and equipment."
                : null;
  return "Unknown prisoner decision.";
}
export function prisonerAction(s, id, action) {
  if (prisonerActionLock(s, id, action)) return false;
  const captive = s.odyssey.prisoners.find((v) => v.id === id);
  if (action === "ransom") {
    s.gold += captive.kind === "mage" ? 45 : 30;
    changeReputation(s, "wardens", 2);
  }
  if (action === "release") changeReputation(s, "freefolk", 1);
  if (action === "recruit") {
    const vacancy = s.party.findIndex((v) => v.dead),
      slot = vacancy < 0 ? s.party.length : vacancy;
    const role =
      captive.kind === "mage"
        ? "Wizard"
        : captive.kind === "archer"
          ? "Archer"
          : captive.kind === "brute"
            ? "Shieldbearer"
            : "Swordswoman";
    const p = {
      ...fresh().party[0],
      id: slot,
      name: captive.name.replace(" the captive", ""),
      role,
      hp: 24,
      max: 24,
      damage: founderRoles[role].damage,
      level: 1,
      xp: 0,
      points: 0,
      profession: "Thief",
      professionXP: 0,
      professionXPBy: {},
      traits: ["mercenary"],
      race: "human",
      resolve: 50,
      fatigue: 0,
      weapon: 0,
      armor: 0,
      dead: false,
      departed: false,
      injury: false,
      personalQuest: { stage: 0, outcome: null },
      storyComplete: null,
      personalPerk: null,
      talent: null,
      advancedSkill: null,
      career: null,
      spellSchool: null,
      spellSpent: { 1: 0, 2: 0 },
      equipment: { weapon: null, armor: null, shield: null, helmet: null },
    };
    s.gold -= 60;
    for (const other of s.party) delete s.bonds[bondKey(slot, other.id)];
    delete s.realm.lineage[slot];
    delete s.expedition.careers[slot];
    delete s.odyssey.journeys[slot];
    if (vacancy < 0) s.party.push(p);
    else s.party[slot] = p;
    s.recruitSerial++;
    note(
      s,
      `${p.name} joins as a ${role} and Thief with Mercenary wages and fifty resolve.`,
    );
  }
  s.odyssey.prisoners = s.odyssey.prisoners.filter((v) => v.id !== id);
  note(s, `${captive.name}: ${action}.`);
  return true;
}

equipmentPerks.frostbind =
  "Basic attacks root their target for one round; broken gear loses this effect.";
equipmentPerks.farshot =
  "Gain two bow range while stationary; moving removes the bonus.";
equipmentPerks.spellbreak =
  "Basic hits interrupt enemy channels and silence the caster for one round.";
equipmentPerks.coverward =
  "Reduce incoming damage by two while standing in cover.";
equipmentCatalog.push(
  {
    id: "winter-pike",
    name: "Winterglass pike",
    role: "Spearman",
    slot: "weapon",
    tier: 3,
    rarity: "Rare",
    bonus: 3,
    price: 140,
    perk: "frostbind",
    uniqueBoss: true,
  },
  {
    id: "horizon-bow",
    name: "Horizon bow",
    role: "Archer",
    slot: "weapon",
    tier: 3,
    rarity: "Rare",
    bonus: 3,
    price: 140,
    perk: "farshot",
    uniqueBoss: true,
  },
  {
    id: "spellbreaker",
    name: "Spellbreaker blade",
    role: "Swordswoman",
    slot: "weapon",
    tier: 3,
    rarity: "Rare",
    bonus: 3,
    price: 140,
    perk: "spellbreak",
    uniqueBoss: true,
  },
  {
    id: "grove-helmet",
    name: "Grovewarden helm",
    role: null,
    slot: "helmet",
    tier: 3,
    rarity: "Rare",
    bonus: 1,
    price: 120,
    perk: "coverward",
    uniqueBoss: true,
  },
);
export const regionalRelics = [
  {
    id: "winter-pike",
    site: 9,
    resource: "ore",
    amount: 4,
    desc: "Reforge a frozen haft at Redstone Quarry.",
  },
  {
    id: "horizon-bow",
    site: 5,
    resource: "wood",
    amount: 4,
    desc: "Restore the watchtower's abandoned bow.",
  },
  {
    id: "spellbreaker",
    site: 11,
    resource: "ore",
    amount: 4,
    desc: "Rebind a blade in the Broken Crown's wards.",
  },
  {
    id: "grove-helmet",
    site: 7,
    resource: "herbs",
    amount: 4,
    desc: "Cleanse a helm woven into the grove's roots.",
  },
];
export function relicLock(s, id) {
  const r = regionalRelics.find((v) => v.id === id);
  if (!r) return "Unknown relic.";
  if (s.odyssey.relics[id]) return "Already recovered.";
  if (
    s.location !== r.site ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return `Visit ${places[r.site].name} outside an encounter.`;
  if (!companyScout(s))
    return "Requires a conscious Archer or Thief to locate the relic.";
  if (s.knowledge < 2 || s.inventory[r.resource] < r.amount)
    return `Requires two knowledge and ${r.amount} ${r.resource}.`;
  return null;
}
export function recoverRelic(s, id) {
  if (relicLock(s, id)) return false;
  const r = regionalRelics.find((v) => v.id === id);
  s.knowledge -= 2;
  s.inventory[r.resource] -= r.amount;
  s.odyssey.relics[id] = true;
  spendHours(s, 2);
  grantEquipment(s, id);
  note(
    s,
    `Recovered ${equipmentCatalog.find((v) => v.id === id).name}. A finite regional relic.`,
  );
  return true;
}
export function equipmentComparison(s, item, p) {
  if (!canEquipEquipment(s, item, p))
    return { allowed: false, text: "This companion cannot use this item." };
  const copy = {
    ...p,
    equipment: { ...p.equipment, [item.slot]: item.instanceId },
  };
  if (item.twoHanded) copy.equipment.shield = null;
  const attack = attackPower(s, copy) - attackPower(s, p),
    armor = armorPower(s, copy) - armorPower(s, p);
  const old = equippedItem(s, p, item.slot),
    changes = [];
  if (item.twoHanded && equippedItem(s, p, "shield"))
    changes.push("Shield returns to stores");
  if (old?.perk && old.perk !== item.perk)
    changes.push(`Lose: ${equipmentPerks[old.perk]}`);
  if (item.perk && item.durability > 0)
    changes.push(`Gain: ${equipmentPerks[item.perk]}`);
  if (item.durability === 0) changes.push("Broken: no item bonus or perk");
  return {
    allowed: true,
    attack,
    armor,
    text: `ATK ${attack >= 0 ? "+" : ""}${attack} · Armor ${armor >= 0 ? "+" : ""}${armor}${changes.length ? " · " + changes.join(" · ") : ""}`,
  };
}
function restoreOdyssey(s, raw) {
  const o = freshOdyssey(),
    r = raw.odyssey || {},
    count = (v, max = 100000) =>
      Number.isInteger(v) ? Math.max(0, Math.min(max, v)) : 0;
  o.distance = count(r.distance, 1200);
  o.serial = count(r.serial, 1000000000);
  for (const region of regions) {
    if (r.visited?.[region.id] === true) o.visited[region.id] = true;
    const d = r.hazardLedger?.[region.id];
    if (Number.isInteger(d) && d >= 1 && d <= s.day)
      o.hazardLedger[region.id] = d;
  }
  for (const name of ["harvest", "remedies"]) {
    const d = r.services?.[name];
    if (Number.isInteger(d) && d >= 1 && d <= s.day) o.services[name] = d;
  }
  for (const relic of regionalRelics)
    if (r.relics?.[relic.id] === true) o.relics[relic.id] = true;
  for (const p of s.party) {
    const q = r.journeys?.[p.id];
    if (
      !q ||
      (p.dead && q.stage !== 4) ||
      !companionContinuations[p.role] ||
      p.personalQuest?.stage !== 3 ||
      ![1, 2, 3, 4].includes(q.stage)
    )
      continue;
    o.journeys[p.id] = {
      stage: q.stage,
      partner:
        Number.isInteger(q.partner) && q.partner !== p.id && s.party[q.partner]
          ? q.partner
          : null,
      outcome:
        q.stage === 4 && ["swear", "reconcile", "depart"].includes(q.outcome)
          ? q.outcome
          : null,
    };
    if (q.stage === 4 && !o.journeys[p.id].outcome) o.journeys[p.id].stage = 3;
  }
  for (const p of Array.isArray(r.prisoners) ? r.prisoners.slice(0, 3) : []) {
    if (
      !p ||
      !Number.isSafeInteger(p.id) ||
      p.id < 1 ||
      p.id > 1000000000 ||
      o.prisoners.some((v) => v.id === p.id) ||
      !["raider", "archer", "brute", "goblin", "mage"].includes(p.kind)
    )
      continue;
    o.prisoners.push({
      id: p.id,
      name:
        typeof p.name === "string" ? p.name.slice(0, 40) : "Unknown captive",
      kind: p.kind,
      day: Math.max(1, Math.min(s.day, count(p.day))),
      trust: count(p.trust, 3),
      unfed: count(p.unfed, 1),
    });
    o.serial = Math.max(o.serial, p.id);
  }
  s.odyssey = o;
  if (s.event?.kind === "region") {
    const region = regions.find((v) => v.id === raw.event?.region);
    s.event =
      region && !s.battle
        ? {
            kind: "region",
            region: region.id,
            title: region.name,
            text: region.hazard,
          }
        : null;
  }
  if (s.battle) {
    for (const e of s.battle.enemies) {
      e.surrenderOffer =
        e.surrenderOffer === true && e.hp > 0 && surrenderEligible(s, e);
      e.refused = e.refused === true;
      e.fleeing = e.fleeing === true && surrenderEligible(s, e);
      e.surrendered = e.surrendered === true && e.hp === 0;
    }
    for (const u of s.battle.units) u.questUsed = u.questUsed === true;
  }
}

export function freshChronicle() {
  return {
    heraldry: { field: "ashen", charge: "sun", trim: "gold", title: null },
    towns: {
      0: { condition: 55, aidDay: 0 },
      3: { condition: 60, aidDay: 0 },
      6: { condition: 75, aidDay: 0 },
    },
    settlements: {},
    routes: {},
    scouted: {},
    kills: {},
    lastWorldDay: 1,
  };
}
export const newEnemyFamilies = [
  {
    id: "troll",
    name: "Crag trolls",
    counter:
      "Burning prevents regeneration; leave the marked smash area before the next enemy turn.",
    site: 9,
  },
  {
    id: "spider",
    name: "Silkfang spiders",
    counter:
      "Avoid web tiles or disarm them with an Archer or Thief; healing spells cleanse venom.",
    site: 7,
  },
  {
    id: "cultist",
    name: "Hollow Star cult",
    counter:
      "Interrupt or silence the marked prayer before it heals an ally. Prayer slots remain spent.",
    site: 8,
  },
  {
    id: "knight",
    name: "Iron Oath deserters",
    counter:
      "Engage from two adjacent sides to break the shield bonus; armor-piercing spells and sunder also help.",
    site: 5,
  },
];
export function newEnemyPatrols() {
  return newEnemyFamilies.map((f, i) => {
    const p = places[f.site];
    return {
      id: `new-${f.id}`,
      name: f.name,
      kind: "fantasy",
      enemyFamily: f.id,
      x: p.x + 65,
      y: p.y + 55,
      route: [
        { x: p.x + 65, y: p.y + 55 },
        { x: Math.min(WORLD.width - 20, p.x + 125), y: p.y + 95 },
        { x: p.x + 30, y: p.y + 65 },
      ],
      waypoint: 0,
      cleared: false,
      hostile: true,
    };
  });
}
function deployNewEnemies(s, family) {
  const b = s.battle;
  b.enemyFamily = family;
  b.traps = [];
  b.feedback = [];
  b.fxSerial = 0;
  const kinds =
    family === "necromancer"
      ? ["necromancer", "skeleton", "skeleton"]
      : family === "shaman"
        ? ["shaman", "wolf", "wolf"]
        : family === "sorcerer"
          ? ["sorcerer", "knight", "raider"]
          : family === "cultist"
            ? ["cultist", "raider", "raider"]
            : family === "knight"
              ? ["knight", "archer", "knight"]
              : family === "troll"
                ? ["troll", "goblin"]
                : ["spider", "spider", "spider"];
  b.enemies = kinds.map((kind, id) => ({
    id,
    kind,
    name: ["necromancer", "shaman", "sorcerer"].includes(kind)
      ? kind.charAt(0).toUpperCase() + kind.slice(1)
      : kind === "troll"
        ? "Crag troll"
        : kind === "spider"
          ? "Silkfang"
          : kind === "cultist"
            ? "Hollow celebrant"
            : kind === "knight"
              ? "Iron Oath knight"
              : kind === "archer"
                ? "Oath archer"
                : kind === "wolf"
                  ? "Thorn wolf"
                  : kind === "skeleton"
                    ? "Bound skeleton"
                    : kind === "goblin"
                      ? "Crag scavenger"
                      : "Cult blade",
    x: 7,
    y: 1 + id * 2,
    hp: kind === "troll" ? 40 : kind === "knight" ? 26 : 18,
    max: kind === "troll" ? 40 : kind === "knight" ? 26 : 18,
    damage:
      kind === "troll" ? 7 : kind === "spider" ? 4 : kind === "cultist" ? 3 : 5,
    armor: kind === "knight" ? 2 : kind === "troll" ? 1 : 0,
    mana:
      kind === "cultist"
        ? 2
        : ["necromancer", "shaman", "sorcerer"].includes(kind)
          ? 3
          : 0,
    webs: kind === "spider" ? 2 : 0,
    guard: kind === "knight",
    snares: 0,
  }));
  note(
    s,
    `${newEnemyFamilies.find((f) => f.id === family).name} encountered. Scout their patrol before fighting to learn its counters.`,
  );
}
function knightFlanked(s, e) {
  return (
    s.battle.units.filter(
      (u) =>
        s.party[u.id].hp > 0 && Math.abs(u.x - e.x) + Math.abs(u.y - e.y) === 1,
    ).length >= 2
  );
}
function newEnemyTurn(s, e) {
  if (arcaneEnemyTurn(s, e)) return true;
  const b = s.battle;
  if (!newEnemyFamilies.some((f) => f.id === e.kind)) return false;
  const targets = b.units
      .filter((u) => s.party[u.id].hp > 0)
      .sort(
        (a, c) =>
          Math.abs(a.x - e.x) +
          Math.abs(a.y - e.y) -
          Math.abs(c.x - e.x) -
          Math.abs(c.y - e.y),
      ),
    t = targets[0];
  if (!t) return false;
  if (e.kind === "troll") {
    if (!e.burningThisRound && !e.burn && e.hp < e.max) {
      e.hp = Math.min(e.max, e.hp + 4);
      combatCue(s, "heal", e, e);
      note(
        s,
        "The troll regenerates four health. Fire prevents this regeneration.",
      );
    }
    if (e.smash) {
      const tile = e.smash;
      e.smash = null;
      combatCue(s, "smash", e, tile);
      for (const u of b.units.filter(
        (u) =>
          s.party[u.id].hp > 0 &&
          Math.abs(u.x - tile.x) + Math.abs(u.y - tile.y) <= 1,
      ))
        damageCompanion(s, u, 9);
      note(
        s,
        "The troll smashes its marked area. Moving out would have avoided the blow.",
      );
      return true;
    }
    if (Math.abs(t.x - e.x) + Math.abs(t.y - e.y) <= 2) {
      e.smash = { x: t.x, y: t.y };
      note(
        s,
        `Troll smash incoming at ${t.x + 1},${t.y + 1} and adjacent tiles. Move before the next enemy turn.`,
      );
      return true;
    }
  }
  if (e.kind === "spider" && e.webs > 0) {
    const x = e.x - 1,
      y = e.y;
    if (
      x >= 0 &&
      !terrainCell(s, x, y).blocked &&
      !b.traps.some((v) => !v.used && v.x === x && v.y === y) &&
      !b.units.some((u) => s.party[u.id].hp > 0 && u.x === x && u.y === y) &&
      !b.enemies.some((v) => v.hp > 0 && v.x === x && v.y === y)
    ) {
      b.traps.push({ x, y, used: false, kind: "web" });
      e.webs--;
      combatCue(s, "web", e, { x, y });
      note(
        s,
        "A Silkfang spins a visible web. It snares movement; an Archer or Thief can disarm it.",
      );
      return true;
    }
  }
  if (e.kind === "cultist") {
    if (e.silenced > 0) {
      e.silenced--;
      e.casting = null;
      return true;
    }
    if (e.casting) {
      const tile = e.casting;
      e.casting = null;
      const ally = b.enemies.find(
        (v) => v.hp > 0 && v.x === tile.x && v.y === tile.y,
      );
      if (ally && hasLineOfSight(s, e, ally)) {
        ally.hp = Math.min(ally.max, ally.hp + 8);
        combatCue(s, "heal", e, ally);
        note(
          s,
          "The cultist's prepared prayer restores eight health to its marked ally.",
        );
      }
      return true;
    }
    const ally = b.enemies
      .filter(
        (v) =>
          v !== e &&
          v.hp > 0 &&
          v.hp < v.max &&
          Math.abs(v.x - e.x) + Math.abs(v.y - e.y) <= 4 &&
          hasLineOfSight(s, e, v),
      )
      .sort((a, c) => a.hp / a.max - c.hp / c.max)[0];
    if (ally && e.mana > 0 && !e.distracted) {
      e.mana--;
      e.casting = { x: ally.x, y: ally.y, heal: true };
      note(
        s,
        "The cultist spends a prayer slot and marks an ally. Stun, silence or counter it before the next turn.",
      );
      return true;
    }
  }
  if (e.kind === "knight") {
    e.guard = !knightFlanked(s, e);
    if (e.charge) {
      e.charge = null;
      e.charging = true;
      return false;
    }
    const d = Math.abs(t.x - e.x) + Math.abs(t.y - e.y);
    if (d >= 3 && d <= 4 && !e.root && hasLineOfSight(s, e, t)) {
      e.charge = { x: t.x, y: t.y };
      note(
        s,
        "The knight lowers its shield for a charge next turn. Break the line or brace for the approach.",
      );
      return true;
    }
  }
  return false;
}
export function newEnemyReport(s, e) {
  const f = newEnemyFamilies.find((v) => v.id === e.kind);
  return `${f?.counter || ""}${arcaneEnemyFamilies.some((v) => v.id === e.kind) ? ` Slots ${e.mana || 0}/3${e.casting ? " · SPELL PREPARED" : ""}` : ""}${e.kind === "cultist" ? ` Prayer slots ${e.mana || 0}/2${e.casting ? " · PRAYER PREPARED" : ""}` : ""}${e.kind === "knight" ? ` Shield ${knightFlanked(s, e) ? "flanked" : "holding"}${e.charge ? " · CHARGE PREPARED" : ""}` : ""}${e.kind === "troll" && e.smash ? " · SMASH PREPARED" : ""}`;
}
export function scoutEnemyLock(s, id) {
  const p = s.patrols.find((p) => p.id === id && !p.cleared),
    f = newEnemyFamilies.find((f) => f.id === p?.enemyFamily);
  return !p || !f
    ? "No new enemy patrol here."
    : s.battle || s.event || s.campOpen || companyLost(s)
      ? "Return to free exploration."
      : !companyScout(s)
        ? "Requires a conscious Archer, Rogue or Thief."
        : Math.hypot(p.x - s.position.x, p.y - s.position.y) > 125
          ? "Approach within 125 pixels to scout the patrol."
          : s.chronicle.scouted[id]
            ? "Already scouted."
            : null;
}
export function scoutEnemy(s, id) {
  if (scoutEnemyLock(s, id)) return false;
  const p = s.patrols.find((p) => p.id === id),
    f = newEnemyFamilies.find((f) => f.id === p.enemyFamily);
  spendHours(s, 1);
  s.chronicle.scouted[id] = true;
  s.knowledge++;
  note(s, `${f.name}: ${f.counter}`);
  return true;
}
function recordNewEnemyVictory(s) {
  const f = newEnemyFamilies.find((f) => f.id === s.battle?.enemyFamily);
  if (f) s.chronicle.kills[f.id] = (s.chronicle.kills[f.id] || 0) + 1;
}
export function combatCue(s, type, from, to) {
  const b = s.battle;
  if (!b) return;
  from.facing = Math.atan2(to.y - from.y, to.x - from.x);
  b.feedback ||= [];
  b.fxSerial = (b.fxSerial || 0) + 1;
  b.feedback.push({
    id: b.fxSerial,
    type,
    from: { x: from.x, y: from.y },
    to: { x: to.x, y: to.y },
  });
  b.feedback = b.feedback.slice(-30);
}
export function battleStatuses(s, entity, side = "enemy") {
  const u = entity,
    p = side === "party" ? s.party[u.id] : null,
    flags = [];
  if (u.stun) flags.push("Stunned");
  if (u.root || u.snared) flags.push("Rooted");
  if (
    u.silenced ||
    s.battle?.realmMagic?.surfaces.some(
      (v) =>
        v.kind === "silence" && Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 1,
    )
  )
    flags.push("Silenced");
  if (u.poison) flags.push("Poisoned");
  if (u.burn) flags.push("Burning");
  if (u.bleed) flags.push("Bleeding");
  if (u.guard) flags.push("Braced");
  if (u.arcaneWard) flags.push("Warded");
  if (u.surrenderOffer) flags.push("Surrender");
  if (u.fleeing) flags.push("Fleeing");
  if (u.exposed) flags.push("Marked");
  if (u.casting) flags.push("Channeling");
  if (u.empowered) flags.push("Empowered");
  if (u.wildshape) flags.push("Animal form");
  if (u.aura) flags.push("Protective aura");
  if (u.smash || u.charge) flags.push("Windup");
  if (p?.wound)
    flags.push(
      woundTypes.find((w) => w.id === p.wound.type)?.name || "Wounded",
    );
  if (terrainCell(s, u.x, u.y).cover > 0) flags.push("Cover");
  return flags;
}
function resolveCompanyPoison(s) {
  for (const u of s.battle.units) {
    if (u.poison > 0 && s.party[u.id].hp > 0) {
      damageCompanion(
        s,
        u,
        2 +
          armorPower(s, s.party[u.id]) +
          (s.party[u.id].role === "Shieldbearer" ? 2 : 0),
      );
      u.poison--;
      note(
        s,
        `${s.party[u.id].name} suffers venom damage. Healing magic cleanses it.`,
      );
    }
  }
}

export const woundTypes = [
  {
    id: "sprain",
    name: "Sprained leg",
    desc: "One fewer movement tile, down to a minimum of one.",
  },
  {
    id: "eye",
    name: "Damaged aim",
    desc: "Two less attack power until recovered.",
  },
  {
    id: "concussion",
    name: "Concussion",
    desc: "Cannot cast level-two spells until recovered.",
  },
  {
    id: "infection",
    name: "Infected wound",
    desc: "Untreated: lose two health and gain five fatigue daily; damage cannot kill outright.",
  },
];
export function inflictWound(s, id, type, severity = 1) {
  const p = s.party[id];
  if (
    !Number.isFinite(severity) ||
    !p ||
    p.dead ||
    p.wound ||
    !woundTypes.some((w) => w.id === type)
  )
    return false;
  const n = Math.max(1, Math.min(3, Math.floor(severity)));
  p.wound = { type, severity: n, remaining: n * 24, treated: false };
  p.injury = true;
  note(
    s,
    `${p.name} suffers ${woundTypes.find((w) => w.id === type).name.toLowerCase()}. Treatment and fed rest are needed.`,
  );
  return true;
}
function recordBattleWound(s, p, before, damage, ranged) {
  if (p.wound || p.dead || before <= 0) return;
  if (p.hp === 0 || (damage >= 8 && p.hp < p.max / 2)) {
    const type = isCaster(p)
      ? "concussion"
      : p.role === "Archer"
        ? "eye"
        : ranged
          ? "infection"
          : "sprain";
    inflictWound(s, p.id, type, p.hp === 0 ? 2 : 1);
  }
}
export function progressWounds(s, hours) {
  if (!Number.isFinite(hours) || hours <= 0) return;
  for (const p of livingParty(s)) {
    if (!p.wound) continue;
    p.wound.remaining = Math.max(
      0,
      p.wound.remaining - hours * (p.wound.treated ? 1 : 0.25),
    );
    if (p.wound.remaining === 0) {
      p.wound = null;
      if (p.hp >= p.max / 2) p.injury = false;
      note(s, `${p.name}'s lasting wound has recovered.`);
    }
  }
}
export function woundTreatmentLock(s, id, method) {
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    !p.wound ||
    s.battle ||
    (s.event && s.event.kind !== "home") ||
    companyLost(s)
  )
    return "Treat a living wounded companion outside combat.";
  if (method === "bandage")
    return s.inventory.medicine < 1
      ? "Requires one medicine and two hours."
      : null;
  if (method === "herbal")
    return !professional(s, "Herbalist")
      ? "Requires a conscious Herbalist."
      : s.inventory.herbs < 3
        ? "Requires three herbs and three hours."
        : null;
  if (method === "surgery")
    return s.campOpen || places[s.location]?.type !== "town"
      ? "Visit a village surgeon."
      : townAccessLock(s) ||
          (s.gold < 40 || s.inventory.medicine < 1
            ? "Requires forty crowns, one medicine and six hours."
            : null);
  return "Unknown treatment.";
}
export function treatWound(s, id, method) {
  if (woundTreatmentLock(s, id, method)) return false;
  const p = s.party[id];
  p.wound.treated = true;
  if (method === "bandage") {
    s.inventory.medicine--;
    p.wound.remaining = Math.min(p.wound.remaining, 24);
    spendHours(s, 2, { resting: true });
  }
  if (method === "herbal") {
    s.inventory.herbs -= 3;
    p.wound.remaining = Math.max(1, p.wound.remaining - 12);
    practice(s, professional(s, "Herbalist"), 1);
    spendHours(s, 3, { resting: true });
  }
  if (method === "surgery") {
    s.gold -= 40;
    s.inventory.medicine--;
    spendHours(s, 6, { resting: true });
    p.wound = null;
    p.injury = false;
  }
  if (!p.dead) p.hp = Math.min(p.max, p.hp + 4);
  note(
    s,
    `${p.name}: ${method} treatment; ${p.wound ? `${Math.ceil(p.wound.remaining)} hours of fed rest still needed` : "lasting wound healed"}.`,
  );
  return true;
}

export const heraldicCharges = [
  { id: "sun", name: "Sun", symbol: "☀" },
  { id: "tower", name: "Tower", symbol: "▥" },
  { id: "wolf", name: "Wolf", symbol: "◆" },
  { id: "star", name: "Star", symbol: "✦" },
  { id: "leaf", name: "Leaf", symbol: "♠" },
];
export const heraldicTrims = [
  { id: "gold", name: "Gold", color: "#d8bb75" },
  { id: "silver", name: "Silver", color: "#c6d3cf" },
  { id: "bone", name: "Bone", color: "#e4d6af" },
];
export const earnedTitles = [
  {
    id: "roadwardens",
    name: "Roadwardens",
    faction: "wardens",
    desc: "Earned by clearing Briarhide or a fantasy stronghold. Friendly Wardens recognize the title.",
  },
  {
    id: "leaguefriends",
    name: "League Friends",
    faction: "guild",
    desc: "Earned at fifteen League reputation. Friendly League merchants reduce prices by five percent.",
  },
  {
    id: "grovekeepers",
    name: "Grovekeepers",
    faction: "freefolk",
    desc: "Earned at fifteen Freefolk reputation. Grove communities recognize your protection.",
  },
  {
    id: "monsterhunters",
    name: "Monster Hunters",
    faction: "wardens",
    desc: "Earned after defeating two of the new enemy families.",
  },
];
export function titleUnlocked(s, id) {
  return id === "roadwardens"
    ? s.strongholds.briar.cleared ||
        fantasyStrongholds.some((h) => realmHold(s, h.id).cleared)
    : id === "leaguefriends"
      ? s.reputation.guild >= 15
      : id === "grovekeepers"
        ? s.reputation.freefolk >= 15
        : id === "monsterhunters"
          ? Object.keys(s.chronicle.kills).filter(
              (k) => s.chronicle.kills[k] > 0,
            ).length >= 2
          : false;
}
export function customizeHeraldry(s, field, charge, trim) {
  if (
    s.battle ||
    s.event ||
    companyLost(s) ||
    !companyBanners.some((b) => b.id === field) ||
    !heraldicCharges.some((c) => c.id === charge) ||
    !heraldicTrims.some((t) => t.id === trim)
  )
    return false;
  s.chronicle.heraldry = { ...s.chronicle.heraldry, field, charge, trim };
  note(s, "Company heraldry updated. The banner travels with the company.");
  return true;
}
export function adoptTitle(s, id) {
  if (
    s.battle ||
    s.event ||
    companyLost(s) ||
    (id !== null && !titleUnlocked(s, id))
  )
    return false;
  s.chronicle.heraldry.title = id;
  note(
    s,
    id
      ? `The company adopts the title ${earnedTitles.find((t) => t.id === id).name}.`
      : "The company travels under its name alone.",
  );
  return true;
}
export function companyTitlePrice(s) {
  return s.chronicle?.heraldry.title === "leaguefriends" &&
    titleUnlocked(s, "leaguefriends") &&
    s.reputation.guild >= 15
    ? 0.95
    : 1;
}
export function factionReaction(s, id) {
  const f = factions.find((f) => f.id === id),
    standing = s.reputation[id],
    title = earnedTitles.find((t) => t.id === s.chronicle.heraldry.title);
  return standing <= -10
    ? `${f.name} remembers the company's hostile actions; your banner brings suspicion.`
    : title?.faction === id && titleUnlocked(s, title.id)
      ? `${f.name} recognizes the ${title.name}. ${id === "guild" ? "League Friends receive a further five-percent purchase discount." : "Your earned title is welcomed, but services still follow local reputation."}`
      : standing >= 10
        ? `${f.name} welcomes your company banner as a known ally.`
        : `${f.name} knows the company by its deeds, and awaits proof of trust.`;
}

export function nearestVillage(point) {
  return [0, 3, 6].sort(
    (a, b) =>
      Math.hypot(point.x - places[a].x, point.y - places[a].y) -
      Math.hypot(point.x - places[b].x, point.y - places[b].y),
  )[0];
}
export function townCondition(s, id = s.location) {
  return s.chronicle.towns[id]?.condition ?? 55;
}
export function townConditionLabel(s, id = s.location) {
  const n = townCondition(s, id);
  return n < 35 ? "Struggling" : n >= 80 ? "Thriving" : "Recovering";
}
export function changeTownCondition(s, id, amount) {
  const t = s.chronicle.towns[id];
  if (t) t.condition = Math.max(10, Math.min(100, t.condition + amount));
}
export function livingPriceModifier(s) {
  return townCondition(s) < 35 ? 1.15 : townCondition(s) >= 80 ? 0.9 : 1;
}
function regionalThreats(s, id) {
  const p = places[id];
  return s.patrols.filter(
    (v) =>
      !v.cleared &&
      !v.faction &&
      ["bandits", "fantasy"].includes(v.kind) &&
      Math.hypot(p.x - v.x, p.y - v.y) < 260,
  ).length;
}
export function updateLivingWorld(s) {
  const c = s.chronicle;
  if (c.lastWorldDay >= s.day) return false;
  const days = Math.min(30, s.day - c.lastWorldDay);
  c.lastWorldDay = s.day;
  for (const id of [0, 3, 6]) {
    const pressure = regionalThreats(s, id);
    changeTownCondition(
      s,
      id,
      (pressure
        ? Math.max(-4, -pressure * 2)
        : s.travelers.farmRebuilt
          ? 3
          : 2) * days,
    );
  }
  for (const [id, state] of Object.entries(c.settlements))
    if (!state.arrived && s.day - state.clearedDay >= 3) {
      state.arrived = true;
      changeTownCondition(s, nearestVillage(places[state.site]), 8);
      note(
        s,
        `Settlers arrive at ${places[state.site].name}. The former stronghold now offers supplies and a chance to help rebuild.`,
      );
    }
  updateWorldRoutes(s);
  return true;
}
export function townAidLock(s, action) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    ![0, 3, 6].includes(s.location) ||
    townAccessLock(s)
  )
    return "Visit an accessible village.";
  if (s.chronicle.towns[s.location].aidDay === s.day)
    return "The village has already received aid today.";
  return action === "repair"
    ? s.gold < 20 || s.inventory.wood < 3
      ? "Requires twenty crowns, three timber and two hours."
      : null
    : action === "food"
      ? s.food < 6
        ? "Requires six rations and one hour."
        : null
      : "Unknown village aid.";
}
export function aidVillage(s, action) {
  if (townAidLock(s, action)) return false;
  const id = s.location;
  s.chronicle.towns[id].aidDay = s.day;
  if (action === "repair") {
    s.gold -= 20;
    s.inventory.wood -= 3;
    spendHours(s, 2);
    changeTownCondition(s, id, 12);
  } else {
    s.food -= 6;
    spendHours(s, 1);
    changeTownCondition(s, id, 8);
  }
  changeReputation(s, territoryOwner(s, id) || "freefolk", 2);
  note(
    s,
    `${places[id].name} improves to ${townConditionLabel(s, id)} (${townCondition(s, id)}/100).`,
  );
  return true;
}
export function markResettlement(s, id, site) {
  if (!s.chronicle.settlements[id])
    s.chronicle.settlements[id] = {
      site,
      clearedDay: s.day,
      arrived: false,
      tradeDay: 0,
      helped: false,
    };
}
export function settlementLock(s, id, action) {
  const q = s.chronicle.settlements[id];
  if (
    !q?.arrived ||
    q.site !== s.location ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
  )
    return "Visit a resettled stronghold outside an encounter.";
  return action === "trade"
    ? q.tradeDay === s.day
      ? "Settler supplies have already been purchased today."
      : s.gold < 8
        ? "Requires eight crowns."
        : null
    : action === "rebuild"
      ? q.helped
        ? "The settlement has already been rebuilt."
        : s.gold < 25 || s.inventory.wood < 5
          ? "Requires twenty-five crowns, five timber and four hours."
          : null
      : "Unknown settler action.";
}
export function helpSettlement(s, id, action) {
  if (settlementLock(s, id, action)) return false;
  const q = s.chronicle.settlements[id];
  if (action === "trade") {
    q.tradeDay = s.day;
    s.gold -= 8;
    s.food += 6;
  } else {
    q.helped = true;
    s.gold -= 25;
    s.inventory.wood -= 5;
    spendHours(s, 4);
    s.knowledge += 2;
    changeTownCondition(s, nearestVillage(places[q.site]), 10);
    changeReputation(s, "freefolk", 3);
  }
  note(
    s,
    `${places[q.site].name}: ${action === "trade" ? "settlers sell six rations" : "the company helps build permanent roofs and fences"}.`,
  );
  return true;
}
export function updateWorldRoutes(s) {
  if (s.day < 2) return;
  for (const p of s.patrols.filter(
    (p) =>
      p.kind === "merchant" &&
      !p.cleared &&
      !p.hostile &&
      !p.raid &&
      p.id !== s.caravanEscort?.patrolId,
  )) {
    const original = initialPatrols().find((v) => v.id === p.id);
    if (!original) continue;
    const danger = s.patrols.some(
      (v) =>
        !v.cleared &&
        !v.faction &&
        v.kind === "bandits" &&
        original.route.some(
          (point) =>
            Math.hypot(point.x - v.x, point.y - v.y) < (p.detoured ? 180 : 120),
        ),
    );
    if ((s.chronicle.routes[p.id] || false) === danger) continue;
    s.chronicle.routes[p.id] = danger;
    p.route = original.route.map((point) => ({
      x: point.x,
      y: Math.max(
        20,
        Math.min(WORLD.height - 20, point.y + (danger ? -120 : 0)),
      ),
    }));
    p.waypoint = 0;
    p.detoured = danger;
    note(
      s,
      `${p.name} ${danger ? "takes a northern detour around active raiders" : "returns to its original route as the road becomes safer"}.`,
    );
  }
}
function restoreChronicle(s, raw) {
  const c = freshChronicle(),
    r = raw.chronicle || {},
    number = (v, min, max, fallback) =>
      Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;
  c.lastWorldDay = Math.floor(number(r.lastWorldDay, 1, s.day, s.day));
  for (const p of s.party) {
    const w = raw.party[p.id]?.wound;
    p.wound =
      w &&
      woundTypes.some((t) => t.id === w.type) &&
      Number.isFinite(w.remaining) &&
      w.remaining > 0
        ? {
            type: w.type,
            severity: Math.floor(number(w.severity, 1, 3, 1)),
            remaining: number(w.remaining, 1, 72, 24),
            treated: w.treated === true,
          }
        : null;
  }
  const h = r.heraldry || {};
  c.heraldry = {
    field: companyBanners.some((v) => v.id === h.field) ? h.field : s.banner,
    charge: heraldicCharges.some((v) => v.id === h.charge) ? h.charge : "sun",
    trim: heraldicTrims.some((v) => v.id === h.trim) ? h.trim : "gold",
    title: earnedTitles.some((v) => v.id === h.title) ? h.title : null,
  };
  for (const id of [0, 3, 6])
    c.towns[id] = {
      condition: Math.floor(
        number(r.towns?.[id]?.condition, 10, 100, c.towns[id].condition),
      ),
      aidDay: Math.floor(number(r.towns?.[id]?.aidDay, 0, s.day, 0)),
    };
  for (const [id, site] of [
    ["briar", 12],
    ...fantasyStrongholds.map((h) => [h.id, h.site]),
  ]) {
    const q = r.settlements?.[id],
      cleared =
        id === "briar" ? s.strongholds.briar.cleared : realmHold(s, id).cleared;
    if (cleared)
      c.settlements[id] = {
        site,
        clearedDay: Math.floor(number(q?.clearedDay, 1, s.day, s.day)),
        arrived:
          q?.arrived === true &&
          s.day - Math.floor(number(q?.clearedDay, 1, s.day, s.day)) >= 3,
        tradeDay: Math.floor(number(q?.tradeDay, 0, s.day, 0)),
        helped: q?.helped === true,
      };
  }
  for (const f of newEnemyFamilies) {
    c.kills[f.id] = Math.floor(number(r.kills?.[f.id], 0, 1000, 0));
    if (r.scouted?.[`new-${f.id}`] === true) c.scouted[`new-${f.id}`] = true;
  }
  s.chronicle = c;
  if (c.heraldry.title && !titleUnlocked(s, c.heraldry.title))
    c.heraldry.title = null;
  for (const p of s.patrols.filter((p) => p.kind === "merchant")) {
    if (r.routes?.[p.id] === true && p.id !== s.caravanEscort?.patrolId) {
      c.routes[p.id] = true;
      const original = initialPatrols().find((v) => v.id === p.id);
      p.route = original.route.map((point) => ({
        ...point,
        y: Math.max(20, Math.min(WORLD.height - 20, point.y - 120)),
      }));
      p.detoured = true;
    }
  }
  if (s.battle) {
    s.battle.feedback = [];
    s.battle.fxSerial = 0;
    for (const u of s.battle.units)
      u.poison = Math.floor(number(u.poison, 0, 2, 0));
    for (const e of s.battle.enemies) {
      e.webs = Math.floor(number(e.webs, 0, 2, 0));
      if (e.kind === "cultist") {
        e.mana = Math.floor(number(e.mana, 0, 2, 2));
        const a = e.casting;
        e.casting =
          a &&
          Number.isInteger(a.x) &&
          Number.isInteger(a.y) &&
          a.x >= 0 &&
          a.x < 9 &&
          a.y >= 0 &&
          a.y < 7
            ? { x: a.x, y: a.y, heal: true }
            : null;
      }
      for (const key of ["smash", "charge"]) {
        const a = e[key];
        e[key] =
          a &&
          Number.isInteger(a.x) &&
          Number.isInteger(a.y) &&
          a.x >= 0 &&
          a.x < 9 &&
          a.y >= 0 &&
          a.y < 7
            ? { x: a.x, y: a.y }
            : null;
      }
    }
    for (const t of s.battle.traps || [])
      t.kind =
        raw.battle?.traps?.find((v) => v.x === t.x && v.y === t.y)?.kind ===
        "web"
          ? "web"
          : "snare";
  }
}

// Prepared magic uses the same finite slots in combat and on the overworld.
export function freshArcana() {
  return {
    passages: {},
    grimoires: {},
    recovered: {},
    services: {},
    exploration: {},
  };
}
Object.assign(founderRoles, {
  Rogue: { max: 24, damage: 6 },
  Druid: { max: 24, damage: 4 },
  Paladin: { max: 32, damage: 5 },
});
Object.assign(classSkills, {
  Rogue: {
    name: "Backstab",
    cost: 1,
    cooldown: 2,
    range: 1,
    bonus: 4,
    desc: "Strike with four extra power. Gain another three when a companion also engages the target.",
  },
  Paladin: {
    name: "Oath strike",
    cost: 1,
    cooldown: 2,
    range: 1,
    bonus: 3,
    desc: "A committed melee strike; protective aura is a separate class action.",
  },
});
Object.assign(specializations, {
  Rogue: [
    {
      id: "duelist",
      name: "Knife specialist",
      desc: "Two extra attack power.",
    },
    { id: "skirmisher", name: "Fleetfoot", desc: "One extra movement tile." },
  ],
  Druid: [
    {
      id: "greenheart",
      name: "Greenheart",
      desc: "Bark wards gain two protection.",
    },
    { id: "skirmisher", name: "Pathfinder", desc: "One extra movement tile." },
  ],
  Paladin: [
    {
      id: "bulwark",
      name: "Oath guardian",
      desc: "Bracing protects adjacent companions.",
    },
    { id: "duelist", name: "Zealot", desc: "Two extra attack power." },
  ],
});
spellBook.push(
  {
    id: "briar",
    name: "Grasping briars",
    role: "Druid",
    level: 1,
    range: 4,
    kind: "damage",
    power: 4,
    root: 2,
    herbs: 1,
  },
  {
    id: "bark",
    name: "Barkskin",
    role: "Druid",
    level: 1,
    range: 3,
    kind: "ward",
    power: 5,
  },
  {
    id: "storm",
    name: "Thornstorm",
    role: "Druid",
    level: 2,
    range: 4,
    kind: "damage",
    power: 7,
    area: true,
    herbs: 1,
  },
  {
    id: "lay-hands",
    name: "Healing oath",
    role: "Paladin",
    level: 1,
    range: 1,
    kind: "heal",
    power: 6,
    herbs: 1,
  },
  {
    id: "oath-ward",
    name: "Guardian light",
    role: "Paladin",
    level: 1,
    range: 3,
    kind: "ward",
    power: 4,
  },
  {
    id: "judgment",
    name: "Radiant judgment",
    role: "Paladin",
    level: 2,
    range: 3,
    kind: "damage",
    power: 10,
    piercing: true,
    herbs: 1,
  },
  {
    id: "reveal",
    name: "Lantern of secrets",
    role: "Wizard",
    level: 1,
    range: 0,
    kind: "explore",
    power: 0,
    desc: "Reveal nearby landmarks or both stash clues, once per landmark.",
  },
  {
    id: "waystep",
    name: "Mist crossing",
    role: "Wizard",
    level: 2,
    range: 0,
    kind: "explore",
    power: 0,
    desc: "Cross a regional travel obstacle without supplies or detour fatigue.",
  },
  {
    id: "rootsense",
    name: "Root sense",
    role: "Druid",
    level: 1,
    range: 0,
    kind: "explore",
    power: 0,
    desc: "Uncover a hidden herbal cache at each wilderness landmark, once.",
  },
  {
    id: "wildbridge",
    name: "Living bridge",
    role: "Druid",
    level: 2,
    range: 0,
    kind: "explore",
    power: 0,
    desc: "Resolve farmland, coast or mountain travel obstacles using a spell slot.",
  },
  {
    id: "haven",
    name: "Quiet sanctuary",
    role: "Cleric",
    level: 1,
    range: 0,
    kind: "explore",
    power: 0,
    herbs: 1,
    desc: "Dispel ghost-mist or arcane static during a regional travel encounter.",
  },
  {
    id: "sanctify",
    name: "Consecrated road",
    role: "Paladin",
    level: 1,
    range: 0,
    kind: "explore",
    power: 0,
    herbs: 1,
    desc: "Dispel ghost-mist or arcane static during a regional travel encounter.",
  },
  {
    id: "mirror-ward",
    name: "Prismatic mantle",
    role: "Wizard",
    level: 2,
    range: 3,
    kind: "ward",
    power: 8,
    area: true,
    tome: true,
    ore: 1,
  },
  {
    id: "mass-mend",
    name: "Circle of restoration",
    role: "Cleric",
    level: 2,
    range: 3,
    kind: "heal",
    power: 6,
    area: true,
    tome: true,
    herbs: 2,
  },
  {
    id: "ancient-root",
    name: "Elder grasp",
    role: "Druid",
    level: 2,
    range: 4,
    kind: "damage",
    power: 8,
    root: 2,
    area: true,
    tome: true,
    herbs: 2,
  },
  {
    id: "dawn-spear",
    name: "Spear of dawn",
    role: "Paladin",
    level: 2,
    range: 5,
    kind: "damage",
    power: 12,
    piercing: true,
    tome: true,
    ore: 1,
  },
);
export const grimoires = [
  {
    id: "prism",
    name: "Prism codex",
    spell: "mirror-ward",
    site: 5,
    price: 65,
  },
  {
    id: "restoration",
    name: "Book of returning light",
    spell: "mass-mend",
    site: 8,
    price: 65,
  },
  {
    id: "elder",
    name: "The rootbound folio",
    spell: "ancient-root",
    site: 7,
    price: 60,
  },
  {
    id: "dawn",
    name: "Dawn oath scripture",
    spell: "dawn-spear",
    site: 11,
    price: 70,
  },
];
export function spellCatalogFor(p) {
  return spellBook.filter(
    (v) =>
      v.role === p?.role &&
      (!v.school || v.school === p.spellSchool) &&
      (!v.tome || p.knownSpells?.includes(v.id)),
  );
}
export function preparationCapacity(p) {
  return Math.min(6, 3 + Math.floor((p.level || 1) / 3));
}
export function preparationLock(s, id, ids) {
  const p = s.party[id];
  return !p || p.dead || p.hp <= 0 || !isCaster(p)
    ? "Requires a conscious caster."
    : s.battle || s.event || (!s.campOpen && s.location !== 6)
      ? "Prepare spells at camp or Emberfall's academy."
      : !Array.isArray(ids) ||
          !ids.length ||
          new Set(ids).size !== ids.length ||
          ids.length > preparationCapacity(p) ||
          ids.some((id) => !spellCatalogFor(p).some((v) => v.id === id))
        ? `Choose one to ${preparationCapacity(p)} known spells, without duplicates.`
        : null;
}
export function prepareSpells(s, id, ids) {
  if (preparationLock(s, id, ids)) return false;
  const p = s.party[id];
  if (
    Array.isArray(p.preparedSpells) &&
    p.preparedSpells.length === ids.length &&
    p.preparedSpells.every((v) => ids.includes(v))
  )
    return false;
  p.preparedSpells = [...ids];
  spendHours(s, 1);
  note(
    s,
    `${p.name} prepares ${ids.length} spells in one hour. Slots are not restored.`,
  );
  return true;
}
export function recoverGrimoireLock(s, id) {
  const t = grimoires.find((v) => v.id === id);
  return !t ||
    s.location !== t.site ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
    ? "Explore the grimoire's landmark outside an encounter."
    : s.arcana.recovered[id]
      ? "This landmark's grimoire has been recovered."
      : !s.explored.includes(t.site)
        ? "Explore or clear this landmark before searching its archive."
        : null;
}
export function recoverGrimoire(s, id) {
  if (recoverGrimoireLock(s, id)) return false;
  s.arcana.recovered[id] = true;
  s.arcana.grimoires[id] = (s.arcana.grimoires[id] || 0) + 1;
  spendHours(s, 2);
  note(
    s,
    `Recovered ${grimoires.find((v) => v.id === id).name}. Read it at camp or the academy to learn its spell.`,
  );
  return true;
}
export function learnGrimoireLock(s, id, tome) {
  const p = s.party[id],
    t = grimoires.find((v) => v.id === tome),
    spell = spellBook.find((v) => v.id === t?.spell);
  return !p || p.dead || p.hp <= 0 || !t || spell.role !== p.role
    ? "This grimoire belongs to another magical class."
    : s.battle || s.event || (!s.campOpen && s.location !== 6)
      ? "Study at camp or Emberfall's academy."
      : p.knownSpells?.includes(spell.id)
        ? "Spell already learned."
        : !(s.arcana.grimoires[tome] > 0)
          ? "Requires a copy of this grimoire."
          : s.knowledge < 2
            ? "Requires two knowledge and four hours."
            : null;
}
export function learnGrimoire(s, id, tome) {
  if (learnGrimoireLock(s, id, tome)) return false;
  const p = s.party[id],
    t = grimoires.find((v) => v.id === tome);
  s.knowledge -= 2;
  s.arcana.grimoires[tome]--;
  p.knownSpells = [...(p.knownSpells || []), t.spell];
  spendHours(s, 4);
  note(
    s,
    `${p.name} learns ${spellBook.find((v) => v.id === t.spell).name}. Prepare it before use.`,
  );
  if (!Array.isArray(p.preparedSpells))
    p.preparedSpells = spellCatalogFor(p)
      .filter((v) => !v.tome)
      .slice(0, preparationCapacity(p))
      .map((v) => v.id);
  return true;
}
export function academyLock(s, action, id = null) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    s.location !== 6 ||
    townAccessLock(s)
  )
    return "Visit Emberfall's academy outside an encounter.";
  const t = grimoires.find((v) => v.id === id);
  if (action === "tome")
    return !t
      ? "Unknown grimoire."
      : s.arcana.services[`tome-${id}`] === s.day
        ? "One copy of each grimoire per day."
        : s.gold < t.price
          ? `Requires ${t.price} crowns.`
          : null;
  if (action === "reagents")
    return s.arcana.services.reagents === s.day
      ? "One reagent parcel daily."
      : s.gold < 24
        ? "Requires twenty-four crowns and one hour."
        : null;
  if (action === "tuition") {
    const p = s.party[id];
    return !p || p.hp <= 0 || p.dead || !isCaster(p)
      ? "Choose a conscious caster."
      : s.arcana.services[`tuition-${id}`] === s.day
        ? "One lesson per companion daily."
        : s.gold < 35
          ? "Requires thirty-five crowns and three hours."
          : null;
  }
  return "Unknown academy service.";
}
export function academyService(s, action, id = null) {
  if (academyLock(s, action, id)) return false;
  if (action === "tome") {
    const t = grimoires.find((v) => v.id === id);
    s.gold -= t.price;
    s.arcana.grimoires[id] = (s.arcana.grimoires[id] || 0) + 1;
    s.arcana.services[`tome-${id}`] = s.day;
    note(s, `Purchased ${t.name}.`);
  }
  if (action === "reagents") {
    s.gold -= 24;
    s.inventory.herbs += 4;
    s.inventory.ore += 2;
    s.arcana.services.reagents = s.day;
    spendHours(s, 1);
    note(s, "Academy parcel: four herbs and two mineral reagents.");
  }
  if (action === "tuition") {
    s.gold -= 35;
    s.arcana.services[`tuition-${id}`] = s.day;
    spendHours(s, 3);
    s.knowledge++;
    note(
      s,
      `${s.party[id].name} studies at the academy, earning one knowledge.`,
    );
  }
  return true;
}
export function explorationMagicLock(s, id, spellId) {
  const p = s.party[id],
    spell = spellsFor(p).find((v) => v.id === spellId && v.kind === "explore");
  if (!p || p.hp <= 0 || p.dead || !spell)
    return "Requires a conscious caster with this exploration spell prepared.";
  if (s.battle || s.campOpen || companyLost(s))
    return "Use exploration magic while traveling.";
  if (p.wound?.type === "concussion" && spell.level === 2)
    return "Concussion prevents level-two magic.";
  if (spellSlots(p)[spell.level] < 1)
    return `Requires one level ${spell.level} spell slot.`;
  if (s.inventory.herbs < (spell.herbs || 0)) return "Requires one herb.";
  const key = `${spellId}-${s.location}`;
  if (spellId === "reveal")
    return s.event &&
      !(
        s.event.kind === "site" &&
        s.event.site === 10 &&
        s.event.stage === "search"
      )
      ? "Reveal secrets outside other encounters."
      : s.location < 0
        ? "Approach a landmark first."
        : s.arcana.exploration[key]
          ? "Secrets here have already been revealed."
          : null;
  if (spellId === "rootsense")
    return s.event || s.location < 0 || places[s.location]?.type === "town"
      ? "Seek a wilderness landmark outside an encounter."
      : s.arcana.exploration[key]
        ? "This root cache has already been gathered."
        : null;
  if (s.event?.kind !== "region")
    return "Use this spell during a regional travel obstacle.";
  if (
    spellId === "wildbridge" &&
    !["farmland", "coast", "mountains"].includes(s.event.region)
  )
    return "Living bridge only crosses farmland, coast and mountain obstacles.";
  if (
    ["haven", "sanctify"].includes(spellId) &&
    !["haunted", "city"].includes(s.event.region)
  )
    return "This spell dispels haunted mist or arcane static.";
  return null;
}
export function castExplorationMagic(s, id, spellId) {
  if (explorationMagicLock(s, id, spellId)) return false;
  const p = s.party[id],
    spell = spellsFor(p).find((v) => v.id === spellId);
  p.spellSpent ||= { 1: 0, 2: 0 };
  p.spellSpent[spell.level] = (p.spellSpent[spell.level] || 0) + 1;
  s.inventory.herbs -= spell.herbs || 0;
  if (spellId === "reveal") {
    s.arcana.exploration[`${spellId}-${s.location}`] = true;
    for (const [site, landmark] of places.entries())
      if (
        Math.hypot(landmark.x - s.position.x, landmark.y - s.position.y) <=
          250 &&
        !s.discovered.includes(site)
      )
        s.discovered.push(site);
    if (s.location === 10 && !s.stash.found) {
      s.stash.clues = [8, 2];
      if (s.event)
        s.event.message =
          "Your lantern reveals both clue carvings. Follow the east-then-north directions and dig at the marked soil.";
    }
    s.knowledge++;
  } else if (spellId === "rootsense") {
    s.arcana.exploration[`${spellId}-${s.location}`] = true;
    s.inventory.herbs += 3;
  } else {
    s.event = null;
    s.destination = null;
  }
  spendHours(s, 1);
  note(
    s,
    `${p.name} uses ${spell.name}. One level ${spell.level} slot spent${spell.herbs ? " and one herb consumed" : ""}; ${spellId === "rootsense" ? "three hidden herbs recovered" : spellId === "reveal" ? "nearby secrets revealed" : "the obstacle is safely resolved without travel supplies or detour fatigue"}.`,
  );
  return true;
}
export const fantasyClassInfo = [
  {
    id: "Rogue",
    desc: "Fast melee scout. Backstab rewards engaging an enemy beside an ally; deft hands can read a stash lock's next pin without replacing its puzzle.",
  },
  {
    id: "Druid",
    desc: "Nature caster with roots, wards and herbal discovery. Wolf form spends a level-one slot for three rounds of stronger, faster melee, preventing spellcasting.",
  },
  {
    id: "Paladin",
    desc: "Armored oath caster. Protective aura spends a level-one slot and an action, reducing damage to nearby allies for three enemy turns.",
  },
];
export function fantasyRecruitment(s) {
  const role =
    s.location === 0 ? "Paladin" : s.location === 3 ? "Rogue" : "Druid";
  return [
    {
      id: `fantasy-${s.location}`,
      name: role === "Paladin" ? "Aveline" : role === "Rogue" ? "Nix" : "Rowan",
      role,
      profession: role === "Rogue" ? "Cook" : "Herbalist",
      max: founderRoles[role].max,
      cost: role === "Rogue" ? 75 : 95,
      traits: [role === "Rogue" ? "tireless" : "resolute"],
      race: role === "Druid" ? "elf" : "human",
    },
  ];
}
export function fantasyActionLock(s, id, action) {
  const p = s.party[id],
    u = s.battle?.units.find((v) => v.id === id);
  if (!p || p.hp <= 0 || p.dead) return "Choose a conscious companion.";
  if (action === "read-lock")
    return p.role !== "Rogue" ||
      s.event?.kind !== "site" ||
      s.event.site !== 10 ||
      s.event.stage !== "lock"
      ? "A Rogue can read the next pin of the Forgotten Stash lock."
      : null;
  if (!u || u.acted) return "Requires an available combat action.";
  if (action === "revert")
    return p.role !== "Druid" || !u.wildshape ? "Not in animal form." : null;
  if (
    s.battle.realmMagic?.surfaces.some(
      (v) =>
        v.kind === "silence" && Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 1,
    )
  )
    return "Silence prevents invoking magic here.";
  return (action === "wolf-form" && p.role === "Druid") ||
    (action === "aura" && p.role === "Paladin")
    ? spellSlots(p)[1] < 1
      ? "Requires one level-one slot."
      : u.wildshape || u.aura
        ? "This class power is already active."
        : null
    : "This class cannot use that power.";
}
export function fantasyAction(s, id, action) {
  if (fantasyActionLock(s, id, action)) return false;
  const p = s.party[id],
    u = s.battle?.units.find((v) => v.id === id);
  if (action === "read-lock") {
    s.event.message = `${p.name} reads the tumblers: pin ${s.event.pin + 1} settles at tension ${[2, 4, 1][s.event.pin]}. Set the dial and test it.`;
    return true;
  }
  if (action === "revert") {
    u.wildshape = 0;
    p._wildshape = false;
    u.acted = true;
    return true;
  }
  p.spellSpent ||= { 1: 0, 2: 0 };
  p.spellSpent[1] = (p.spellSpent[1] || 0) + 1;
  if (action === "wolf-form") {
    u.wildshape = 3;
    p._wildshape = true;
  } else u.aura = 3;
  u.acted = true;
  combatCue(s, "ward", u, u);
  note(
    s,
    `${p.name} invokes ${action === "aura" ? "a protective aura" : "wolf form"} for three enemy turns. One level-one slot spent.`,
  );
  return true;
}
function fantasyAttackBonus(s, p) {
  const u = s.battle?.units.find((v) => v.id === p.id);
  return p.role === "Druid" && u?.wildshape ? 3 : 0;
}
function paladinProtection(s, target) {
  return s.battle?.units.some(
    (v) =>
      v.aura > 0 &&
      s.party[v.id].hp > 0 &&
      Math.abs(v.x - target.x) + Math.abs(v.y - target.y) <= 1,
  )
    ? 2
    : 0;
}
function settleFantasyPowers(s) {
  for (const u of s.battle.units) {
    if (u.wildshape > 0) u.wildshape--;
    s.party[u.id]._wildshape = !!u.wildshape;
    if (u.aura > 0) u.aura--;
  }
}
export const arcaneEnemyFamilies = [
  {
    id: "necromancer",
    name: "Gravebinders",
    site: 2,
    counter:
      "Kill the necromancer first, or interrupt its marked resurrection. Three slots; each corpse can be raised only once.",
  },
  {
    id: "shaman",
    name: "Thorn shamans",
    site: 7,
    counter:
      "Interrupt the marked beast blessing, or stun empowered wolves. Three slots; empowerment adds three attack power for two turns.",
  },
  {
    id: "sorcerer",
    name: "Rift sorcerers",
    site: 14,
    counter:
      "Move out of the marked tile and adjacent cells, or interrupt the channel. Three slots; the area spell also hits the sorcerer's allies.",
  },
];
newEnemyFamilies.push(...arcaneEnemyFamilies);
function arcaneEnemyTurn(s, e) {
  if (!arcaneEnemyFamilies.some((v) => v.id === e.kind)) return false;
  const b = s.battle;
  if (e.silenced > 0) {
    e.silenced--;
    e.casting = null;
    return true;
  }
  if (e.casting) {
    const mark = e.casting;
    e.casting = null;
    if (!hasLineOfSight(s, e, mark)) {
      note(
        s,
        "The prepared spell loses line of sight; its slot remains spent.",
      );
      return true;
    }
    combatCue(s, "spell", e, mark);
    if (e.kind === "necromancer") {
      const corpse = b.enemies.find(
        (v) =>
          v !== e && v.hp <= 0 && !v.raised && v.x === mark.x && v.y === mark.y,
      );
      if (
        corpse &&
        !b.units.some(
          (u) => s.party[u.id].hp > 0 && u.x === mark.x && u.y === mark.y,
        ) &&
        !b.enemies.some((v) => v.hp > 0 && v.x === mark.x && v.y === mark.y)
      ) {
        corpse.hp = Math.min(corpse.max, 10);
        corpse.raised = true;
        note(
          s,
          "The gravebinder raises its marked corpse. This corpse cannot be raised again.",
        );
      }
    }
    if (e.kind === "shaman") {
      const beast = b.enemies.find(
        (v) =>
          v.kind === "wolf" &&
          v.hp > 0 &&
          (Number.isInteger(mark.targetId)
            ? v.id === mark.targetId
            : v.x === mark.x && v.y === mark.y),
      );
      if (beast && hasLineOfSight(s, e, beast)) {
        beast.empowered = 2;
        note(s, "The marked wolf gains three attack power for two turns.");
      }
    }
    if (e.kind === "sorcerer") {
      for (const u of b.units.filter(
        (u) =>
          s.party[u.id].hp > 0 &&
          Math.abs(u.x - mark.x) + Math.abs(u.y - mark.y) <= 1,
      ))
        damageCompanion(s, u, 8, true);
      for (const ally of b.enemies.filter(
        (v) =>
          v !== e &&
          v.hp > 0 &&
          Math.abs(v.x - mark.x) + Math.abs(v.y - mark.y) <= 1,
      ))
        hitEnemy(s, ally, 8);
      note(
        s,
        "The rift spell erupts across its marked area, including nearby enemy allies.",
      );
    }
    return true;
  }
  if (e.mana <= 0 || e.distracted) return false;
  let target;
  if (e.kind === "necromancer")
    target = b.enemies.find(
      (v) =>
        v !== e &&
        v.hp <= 0 &&
        !v.raised &&
        Math.abs(v.x - e.x) + Math.abs(v.y - e.y) <= 4 &&
        hasLineOfSight(s, e, v),
    );
  if (e.kind === "shaman")
    target = b.enemies.find(
      (v) =>
        v.kind === "wolf" &&
        v.hp > 0 &&
        !v.empowered &&
        Math.abs(v.x - e.x) + Math.abs(v.y - e.y) <= 4 &&
        hasLineOfSight(s, e, v),
    );
  if (e.kind === "sorcerer")
    target = b.units.find(
      (u) =>
        s.party[u.id].hp > 0 &&
        Math.abs(u.x - e.x) + Math.abs(u.y - e.y) <= 4 &&
        hasLineOfSight(s, e, u),
    );
  if (!target) return false;
  e.mana--;
  e.casting = {
    x: target.x,
    y: target.y,
    ...(e.kind === "shaman" ? { targetId: target.id } : {}),
  };
  note(
    s,
    `${e.kind} spends a slot and prepares ${e.kind === "necromancer" ? "resurrection" : e.kind === "shaman" ? "a beast blessing" : "an area eruption"} at ${target.x + 1},${target.y + 1}. Move, stun, silence or counter before its next turn.`,
  );
  return true;
}
function restoreArcana(s, raw) {
  const a = freshArcana(),
    r = raw.arcana || {};
  for (const t of grimoires) {
    a.grimoires[t.id] = Number.isInteger(r.grimoires?.[t.id])
      ? Math.max(0, Math.min(20, r.grimoires[t.id]))
      : 0;
    a.recovered[t.id] = r.recovered?.[t.id] === true;
  }
  const keys = [
    "reagents",
    ...grimoires.map((t) => `tome-${t.id}`),
    ...s.party.map((p) => `tuition-${p.id}`),
  ];
  for (const key of keys)
    if (
      Number.isInteger(r.services?.[key]) &&
      r.services[key] >= 1 &&
      r.services[key] <= s.day
    )
      a.services[key] = r.services[key];
  for (const spell of ["reveal", "rootsense"])
    for (let site = 0; site < places.length; site++)
      if (r.exploration?.[`${spell}-${site}`] === true)
        a.exploration[`${spell}-${site}`] = true;
  a.passages = {};
  for (const room of hiddenPassages) {
    const q = r.passages?.[room.site];
    if (q && a.exploration[`reveal-${room.site}`])
      a.passages[room.site] = {
        searched: q.searched === true,
        loot: Object.fromEntries(
          Object.entries(room.loot).map(([key, max]) => [
            key,
            q.searched === true && Number.isInteger(q.loot?.[key])
              ? Math.max(0, Math.min(max, q.loot[key]))
              : 0,
          ]),
        ),
      };
  }
  s.arcana = a;
  if (
    raw.event?.kind === "arcane-passage" &&
    raw.event.site === s.location &&
    hiddenPassages.some((v) => v.site === s.location) &&
    a.exploration[`reveal-${s.location}`]
  ) {
    const room = hiddenPassages.find((v) => v.site === s.location);
    s.event = {
      kind: "arcane-passage",
      site: s.location,
      title: room.name,
      text: room.desc,
    };
  }
  for (const p of s.party) {
    p.knownSpells = [
      ...new Set(
        (Array.isArray(p.knownSpells) ? p.knownSpells : []).filter((id) =>
          spellBook.some((v) => v.id === id && v.role === p.role && v.tome),
        ),
      ),
    ];
    p.preparedSpells = Array.isArray(p.preparedSpells)
      ? [
          ...new Set(
            p.preparedSpells.filter((id) =>
              spellCatalogFor({ ...p, preparedSpells: null }).some(
                (v) => v.id === id,
              ),
            ),
          ),
        ].slice(0, preparationCapacity(p))
      : null;
    p._wildshape = false;
  }
  if (s.battle) {
    for (const u of s.battle.units) {
      u.wildshape =
        s.party[u.id].role === "Druid" && Number.isInteger(u.wildshape)
          ? Math.max(0, Math.min(3, u.wildshape))
          : 0;
      u.aura =
        s.party[u.id].role === "Paladin" && Number.isInteger(u.aura)
          ? Math.max(0, Math.min(3, u.aura))
          : 0;
      s.party[u.id]._wildshape = !!u.wildshape;
    }
    for (const e of s.battle.enemies) {
      e.empowered = Number.isInteger(e.empowered)
        ? Math.max(0, Math.min(3, e.empowered))
        : 0;
      e.raised = e.raised === true;
      if (arcaneEnemyFamilies.some((v) => v.id === e.kind)) {
        e.mana = Number.isInteger(e.mana)
          ? Math.max(0, Math.min(3, e.mana))
          : 3;
        const t = e.casting;
        e.casting =
          t &&
          Number.isInteger(t.x) &&
          Number.isInteger(t.y) &&
          t.x >= 0 &&
          t.x < 9 &&
          t.y >= 0 &&
          t.y < 7
            ? {
                x: t.x,
                y: t.y,
                ...(e.kind === "shaman" &&
                Number.isInteger(t.targetId) &&
                s.battle.enemies.some(
                  (v) => v.id === t.targetId && v.kind === "wolf",
                )
                  ? { targetId: t.targetId }
                  : {}),
              }
            : null;
      }
    }
  }
}

export const hiddenPassages = [
  {
    site: 2,
    name: "The lantern crypt",
    desc: "Your light reveals a narrow stair behind the barrow's carved stones.",
    loot: { gold: 18, herbs: 2 },
  },
  {
    site: 14,
    name: "The veiled ledge",
    desc: "A folded stone wall opens onto an old explorer's sheltered ledge.",
    loot: { gold: 12, medicine: 1 },
  },
  {
    site: 11,
    name: "The oath archive",
    desc: "Faded sigils outline a sealed room beneath the broken throne.",
    loot: { gold: 20, ore: 2 },
  },
];
export function passageLock(s, action, resource = null) {
  const room = hiddenPassages.find((v) => v.site === s.location),
    state = s.arcana.passages?.[s.location];
  if (!room || !s.arcana.exploration[`reveal-${s.location}`])
    return "Reveal this hidden passage with Lantern of secrets first.";
  if (s.battle || s.campOpen || companyLost(s))
    return "Explore this passage outside combat and camp.";
  if (action === "enter")
    return s.event ? "Finish the current encounter." : null;
  if (s.event?.kind !== "arcane-passage" || s.event.site !== s.location)
    return "Enter the revealed passage.";
  if (action === "search")
    return state?.searched ? "The chamber has already been searched." : null;
  if (action === "take")
    return !Object.hasOwn(room.loot, resource) || !(state?.loot?.[resource] > 0)
      ? "Nothing of that kind remains."
      : null;
  return action === "leave" ? null : "Unknown passage action.";
}
export function passageAction(s, action, resource = null) {
  if (passageLock(s, action, resource)) return false;
  const room = hiddenPassages.find((v) => v.site === s.location);
  s.arcana.passages ||= {};
  s.arcana.passages[s.location] ||= { searched: false, loot: {} };
  const q = s.arcana.passages[s.location];
  if (action === "enter")
    s.event = {
      kind: "arcane-passage",
      site: s.location,
      title: room.name,
      text: room.desc,
    };
  if (action === "search") {
    q.searched = true;
    q.loot = { ...room.loot };
    spendHours(s, 2);
    note(s, `${room.name}: a chest stands open; choose what to take.`);
  }
  if (action === "take") {
    const amount = q.loot[resource];
    q.loot[resource] = 0;
    if (resource === "gold") s.gold += amount;
    else s.inventory[resource] += amount;
    note(s, `Recovered ${amount} ${resource} from ${room.name}.`);
  }
  if (action === "leave") s.event = null;
  return true;
}
equipmentCatalog.push(
  {
    id: "night-knives",
    name: "Nightsteel knives",
    role: "Rogue",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 2,
    price: 80,
    perk: "nimble",
  },
  {
    id: "grove-staff",
    name: "Rootwoven staff",
    role: "Druid",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 2,
    price: 85,
    perk: "focus",
  },
  {
    id: "oathblade",
    name: "Dawn oathblade",
    role: "Paladin",
    slot: "weapon",
    tier: 2,
    rarity: "Fine",
    bonus: 2,
    price: 90,
    perk: "riposte",
  },
);

export function freshFieldwork() {
  return {
    standardUnlocked: false,
    bannerBearer: null,
    campSize: 0,
    campPositions: {},
    lastCampRoll: 0,
    campOpportunity: null,
    report: null,
    reportCheckpoint: null,
    reportSerial: 0,
  };
}
export function standardBearer(s) {
  const id = s.fieldwork?.bannerBearer,
    p = s.party[id];
  return s.fieldwork?.standardUnlocked &&
    Number.isInteger(id) &&
    p &&
    !p.dead &&
    p.hp > 0
    ? p
    : null;
}
export function standardLock(s) {
  return s.fieldwork.standardUnlocked
    ? "Company standard already unlocked."
    : s.battle ||
        s.event ||
        companyLost(s) ||
        (!s.campOpen && places[s.location]?.type !== "town")
      ? "Unlock the standard at camp or a village."
      : s.renown < 5
        ? "Requires five renown."
        : s.knowledge < 4 || s.gold < 40
          ? "Requires four knowledge and forty crowns."
          : null;
}
export function unlockStandard(s) {
  if (standardLock(s)) return false;
  s.knowledge -= 4;
  s.gold -= 40;
  s.fieldwork.standardUnlocked = true;
  note(
    s,
    "Company standard unlocked. Assign a conscious companion as flag bearer to display it and gain one opening valor.",
  );
  return true;
}
export function assignFlagBearer(s, id) {
  if (
    !s.fieldwork.standardUnlocked ||
    s.battle ||
    s.event ||
    companyLost(s) ||
    (id !== null &&
      (!Number.isInteger(id) ||
        !s.party[id] ||
        s.party[id].dead ||
        s.party[id].hp <= 0))
  )
    return false;
  s.fieldwork.bannerBearer = id;
  note(
    s,
    id === null
      ? "The company standard is packed away."
      : `${s.party[id].name} carries the company standard.`,
  );
  return true;
}
export function naturalConcealment(s) {
  return terrainAt(s.position) === "forest"
    ? s.timeOfDay >= 20 || s.timeOfDay < 6
      ? 80
      : 65
    : 0;
}
export function concealmentLevel(s) {
  return Math.max(
    naturalConcealment(s),
    s.stealth?.active ? s.stealth.concealment || 0 : 0,
  );
}
export function canAutoAmbush(s, patrol) {
  return (
    !!patrol &&
    (naturalConcealment(s) >= 60 ||
      (isHidden(s) && s.stealth.concealment >= 75)) &&
    patrol?.kind !== "wolves" &&
    !["spider", "troll"].includes(patrol?.enemyFamily)
  );
}
export function campCapacity(s) {
  return 4 + (s.fieldwork?.campSize || 0) * 2;
}
export function campCrowding(s) {
  return Math.max(0, livingParty(s).length - campCapacity(s));
}
export function campExpansionLock(s) {
  return !s.campOpen || s.battle || s.event || companyLost(s)
    ? "Pitch camp before expanding it."
    : s.fieldwork.campSize >= 2
      ? "The camp is fully expanded."
      : s.gold < 60 + s.fieldwork.campSize * 30 ||
          s.inventory.wood < 10 + s.fieldwork.campSize * 5
        ? `Requires ${60 + s.fieldwork.campSize * 30} crowns, ${10 + s.fieldwork.campSize * 5} timber and four hours.`
        : null;
}
export function expandCamp(s) {
  if (campExpansionLock(s)) return false;
  s.gold -= 60 + s.fieldwork.campSize * 30;
  s.inventory.wood -= 10 + s.fieldwork.campSize * 5;
  s.fieldwork.campSize++;
  spendHours(s, 4);
  note(
    s,
    `Camp expanded. Sleeping capacity ${campCapacity(s)}; the cleared building area grows with the company.`,
  );
  return true;
}
export function campBounds(s) {
  const n = s.fieldwork?.campSize || 0;
  return {
    left: 145 - n * 25,
    top: 105 - n * 15,
    right: 525 + n * 30,
    bottom: 340 + n * 15,
  };
}
export function campFurniturePoint(s, id) {
  return (
    s.fieldwork?.campPositions[id] || {
      x: 230 + (s.campFurniture[id] % 3) * 70,
      y: 155 + Math.floor(s.campFurniture[id] / 3) * 45,
    }
  );
}
export function furniturePlacementLock(s, id, x, y) {
  const f = campFurniture.find((v) => v.id === id),
    b = campBounds(s);
  if (!s.campOpen || s.battle || s.event || companyLost(s) || !f)
    return "Place furniture in a pitched camp.";
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < b.left ||
    y < b.top ||
    x + 34 > b.right ||
    y + 26 > b.bottom
  )
    return "Drop inside the cleared camp area; expansion creates more room.";
  const occupied = [
    { x: 165, y: 110, w: 85, h: 95 },
    { x: 300, y: 220, w: 48, h: 45 },
    { x: 278, y: 270, w: 110, h: 58 },
    { x: 183, y: 270, w: 60, h: 25 },
    ...(s.wagon.owned ? [{ x: 370, y: 305, w: 65, h: 45 }] : []),
    ...(s.campUpgrades.forge ? [{ x: 430, y: 270, w: 55, h: 45 }] : []),
    ...(s.campUpgrades.infirmary ? [{ x: 450, y: 190, w: 70, h: 50 }] : []),
    ...(s.campUpgrades.watchpost ? [{ x: 455, y: 85, w: 55, h: 50 }] : []),
    ...Object.keys(s.campFurniture)
      .filter((v) => v !== id)
      .map((v) => ({ ...campFurniturePoint(s, v), w: 34, h: 26 })),
  ];
  if (
    occupied.some(
      (p) => x < p.x + p.w && x + 34 > p.x && y < p.y + p.h && y + 26 > p.y,
    )
  )
    return "Leave room around companions, stations and other furniture.";
  return s.campFurniture[id] === undefined &&
    (s.gold < f.gold || s.inventory.wood < f.wood)
    ? `Requires ${f.gold} crowns and ${f.wood} timber.`
    : null;
}
export function placeCampFurniture(s, id, x, y) {
  x = Math.round(x / 5) * 5;
  y = Math.round(y / 5) * 5;
  if (furniturePlacementLock(s, id, x, y)) return false;
  const f = campFurniture.find((v) => v.id === id),
    building = s.campFurniture[id] === undefined;
  if (building) {
    s.gold -= f.gold;
    s.inventory.wood -= f.wood;
    s.campFurniture[id] = campFurniture.findIndex((v) => v.id === id);
  }
  s.fieldwork.campPositions[id] = { x, y };
  if (building) spendHours(s, 2);
  note(
    s,
    `${f.name} ${building ? "built" : "moved"}. Drag it again to rearrange camp.`,
  );
  return true;
}
export function rollCampOpportunity(s) {
  const f = s.fieldwork;
  if (f.lastCampRoll === s.day) return false;
  f.lastCampRoll = s.day;
  f.campOpportunity = null;
  if (
    s.day < 2 ||
    (s.day * 13 + Math.floor(s.position.x / 64) * 7 + s.skirmishes * 5) % 3 !==
      1
  )
    return false;
  const candidates = livingParty(s).filter(
    (p) =>
      !p.storyComplete ||
      p.personalQuest?.stage === 2 ||
      continuationInfo(s, p.id)?.stage === 3,
  );
  if (!candidates.length) return false;
  const p = candidates[(s.day + s.skirmishes) % candidates.length];
  f.campOpportunity = { id: p.id, day: s.day };
  note(s, `${p.name} asks for a quiet moment by the campfire.`);
  return true;
}
export function campOpportunity(s, id) {
  return (
    s.campOpen &&
    s.fieldwork.campOpportunity?.day === s.day &&
    s.fieldwork.campOpportunity.id === id
  );
}
export const safeRestSites = [
  { site: 15, name: "Wayfarer guest lodge", rate: 5 },
  { site: 16, name: "Pinewatch refuge", rate: 4 },
  { site: 17, name: "Saltroad hostel", rate: 5 },
  { site: 18, name: "Redstone shelter", rate: 6 },
];
places.push(
  { name: "Pinewatch Refuge", x: 300, y: 70, type: "inn", scene: "inn" },
  { name: "Saltroad Hostel", x: 650, y: 470, type: "inn", scene: "inn" },
  { name: "Redstone Shelter", x: 1260, y: 270, type: "inn", scene: "inn" },
);
export function safeRestCost(s) {
  const lodge = safeRestSites.find((v) => v.site === s.location);
  return lodge
    ? livingParty(s).length * lodge.rate + dailyWages(s) + s.wageDebt
    : 0;
}
export function safeRestLock(s) {
  return !safeRestSites.some((v) => v.site === s.location) ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s)
    ? "Visit a lodge or roadside shelter outside an encounter."
    : s.gold < safeRestCost(s)
      ? `Requires ${safeRestCost(s)} crowns for beds, meals, wages and debt.`
      : null;
}
export function restAtShelter(s) {
  if (safeRestLock(s)) return false;
  const site = s.location,
    lodge = safeRestSites.find((v) => v.site === site);
  s.gold -= livingParty(s).length * lodge.rate;
  s.destination = null;
  spendHours(s, 24, { mealsProvided: true, resting: true });
  for (const p of livingParty(s)) {
    p.hp = p.max;
    p.injury = !!p.wound;
    p.fatigue = Math.max(0, (p.fatigue || 0) - 70);
    changeResolve(p, 5);
  }
  s.morale = Math.min(100, s.morale + 12);
  note(
    s,
    `Rested safely at ${lodge.name}. Paid beds and meals prevent starvation and woodland interruptions; lasting wounds still require treatment and recovery.`,
  );
  return true;
}
export function wagonManifest(s) {
  const cells = [];
  for (const good of tradeGoods)
    for (
      let i = 0;
      i < (s.cargo[good.id] || 0) && cells.length < companyCargoCapacity(s);
      i++
    )
      cells.push({ id: good.id, name: good.name });
  while (cells.length < companyCargoCapacity(s)) cells.push(null);
  return cells;
}
function variedBattleTerrain(s) {
  const b = s.battle;
  if (!b?.terrainVariation || b.terrainBaseLayout !== b.layoutId) return null;
  const style = battlefield(s).style;
  let tiles =
    style === "forest"
      ? [
          obstacleTile(3, 1, "tree"),
          obstacleTile(5, 4, "tree"),
          obstacleTile(4, 3, "log"),
          coverTile(2, 2, "brush"),
          coverTile(6, 2, "brush"),
          coverTile(3, 5, "brush"),
          mudTile(4, 5),
        ]
      : style === "ruin"
        ? [
            obstacleTile(3, 2, "wall"),
            obstacleTile(5, 4, "wall"),
            coverTile(4, 3),
            coverTile(3, 5),
            coverTile(6, 1),
            mudTile(4, 1),
          ]
        : style === "quarry"
          ? [
              obstacleTile(4, 2, "rock"),
              obstacleTile(3, 4, "rock"),
              coverTile(5, 5),
              coverTile(6, 2),
              coverTile(3, 1),
              mudTile(4, 4),
            ]
          : style === "river"
            ? [
                obstacleTile(4, 0, "water"),
                obstacleTile(4, 1, "water"),
                obstacleTile(4, 6, "water"),
                coverTile(3, 2, "brush"),
                coverTile(5, 5, "brush"),
                mudTile(4, 2),
                mudTile(4, 5),
                { x: 4, y: 3, kind: "bridge", cover: 0, cost: 1 },
              ]
            : [
                obstacleTile(4, 4, "wagon"),
                obstacleTile(3, 1, "log"),
                coverTile(3, 5),
                coverTile(5, 2, "brush"),
                coverTile(6, 3, "brush"),
                mudTile(4, 2),
              ];
  if (b.terrainVariation === 2)
    tiles = tiles.map((v) => ({ ...v, x: 8 - v.x, y: 6 - v.y }));
  return tiles.filter(
    (tile) =>
      !tile.blocked ||
      !b.terrainFormation?.some((p) => p.x === tile.x && p.y === tile.y),
  );
}
export function reportSnapshot(s) {
  return {
    gold: s.gold,
    food: s.food,
    knowledge: s.knowledge,
    shards: s.realm.shards,
    grimoires: { ...s.arcana.grimoires },
    inventory: { ...s.inventory },
    cargo: { ...s.cargo },
    gear: s.gear.map((g) => ({
      id: g.id,
      template: g.template,
      durability: g.durability,
    })),
    party: s.party.map((p) => ({
      id: p.id,
      name: p.name,
      hp: p.hp,
      dead: !!p.dead,
      departed: !!p.departed,
      fatigue: p.fatigue || 0,
      injury: !!p.injury,
      wound: p.wound?.type || null,
      level: p.level,
      personalPerk: typeof p.personalPerk === "string" ? p.personalPerk : null,
      resolve: p.resolve,
      spellSpent: { ...(p.spellSpent || {}) },
    })),
  };
}
function encounterKey(s) {
  return s.battle
    ? `battle:${s.battle.patrolId || s.battle.kind}:${s.battle.enemyFamily || s.battle.bossId || s.battle.layoutId}`
    : s.event
      ? `event:${s.event.kind}:${s.event.site ?? s.event.templateId ?? s.event.region ?? s.event.id ?? s.event.title}`
      : null;
}
export function beginAfterAction(s, kind, title) {
  s.fieldwork.reportCheckpoint = {
    kind,
    title,
    before: reportSnapshot(s),
    key:
      kind === "battle"
        ? null
        : encounterKey(s) || `action:${s.fieldwork.reportSerial}`,
  };
}
export function updateAfterActionReport(s) {
  const f = s.fieldwork,
    current = encounterKey(s),
    cp = f.reportCheckpoint;
  if (f.report) return false;
  if (cp && cp.kind === "battle" && s.battle && cp.key === null)
    cp.key = current;
  if (cp && (current !== cp.key || (cp.kind === "battle" && !s.battle))) {
    if (cp.kind === "event" && s.battle) {
      beginAfterAction(s, "battle", s.battle.enemyFamily || "Combat");
      f.reportCheckpoint.key = current;
      return false;
    }
    if (cp.kind === "battle" && s.battle) {
      cp.key = current;
      return false;
    }
    const before = cp.before,
      after = reportSnapshot(s),
      loot = [],
      costs = [],
      conditions = [];
    for (const key of ["gold", "food", "knowledge"]) {
      const delta = after[key] - before[key];
      if (delta > 0)
        loot.push(
          `${delta} ${key === "gold" ? "crowns" : key === "food" ? "rations" : "knowledge"} gained`,
        );
      if (delta < 0)
        costs.push(
          `${-delta} ${key === "gold" ? "crowns" : key === "food" ? "rations" : "knowledge"} spent or lost`,
        );
    }
    if (Number.isFinite(before.shards)) {
      const delta = after.shards - before.shards;
      if (delta > 0)
        loot.push(`${delta} aether shard${delta === 1 ? "" : "s"}`);
      if (delta < 0)
        costs.push(`${-delta} aether shard${delta === -1 ? "" : "s"} consumed`);
    }
    if (before.grimoires)
      for (const tome of grimoires) {
        const delta =
          (after.grimoires[tome.id] || 0) - (before.grimoires[tome.id] || 0);
        if (delta > 0) loot.push(`${delta} ${tome.name}`);
        if (delta < 0) costs.push(`${-delta} ${tome.name} studied`);
      }
    for (const key of Object.keys(s.inventory)) {
      const delta = (after.inventory[key] || 0) - (before.inventory[key] || 0);
      if (delta > 0) loot.push(`${delta} ${key}`);
      if (delta < 0) costs.push(`${-delta} ${key} consumed`);
    }
    for (const key of Object.keys(s.cargo)) {
      const delta = (after.cargo[key] || 0) - (before.cargo[key] || 0);
      if (delta > 0) loot.push(`${delta} ${key} trade goods`);
      if (delta < 0) costs.push(`${-delta} ${key} trade goods lost`);
    }
    for (const g of after.gear)
      if (!before.gear.some((v) => v.id === g.id))
        loot.push(
          equipmentCatalog.find((v) => v.id === g.template)?.name ||
            "New equipment",
        );
    for (const p of after.party) {
      const old = before.party.find((v) => v.id === p.id);
      if (!old || (old.dead && !p.dead)) {
        conditions.push(`${p.name} joined the company.`);
        continue;
      }
      if (p.personalPerk && p.personalPerk !== old.personalPerk)
        conditions.push(
          `${p.name} learned ${p.personalPerk.charAt(0).toUpperCase() + p.personalPerk.slice(1)}.`,
        );
      if (old.spellSpent)
        for (const level of [1, 2]) {
          const spent =
            (p.spellSpent[level] || 0) - (old.spellSpent[level] || 0);
          if (spent > 0)
            costs.push(
              `${p.name}: ${spent} level ${level} spell slot${spent === 1 ? "" : "s"} spent`,
            );
        }
      if (p.dead && !old.dead)
        conditions.push(
          p.departed ? `${p.name} left the company alive.` : `${p.name} died.`,
        );
      else if (
        p.hp !== old.hp ||
        p.wound !== old.wound ||
        p.injury !== old.injury ||
        p.level !== old.level ||
        (Number.isFinite(old.resolve) && p.resolve !== old.resolve) ||
        (Number.isFinite(old.fatigue) && p.fatigue !== old.fatigue)
      )
        conditions.push(
          `${p.name}: ${p.hp - old.hp >= 0 ? "+" : ""}${p.hp - old.hp} health${p.wound ? ` · ${woundTypes.find((v) => v.id === p.wound)?.name || "lasting wound"}` : p.injury ? " · injured" : ""}${p.level > old.level ? ` · level ${p.level}` : ""}${Number.isFinite(old.resolve) && p.resolve !== old.resolve ? ` · resolve ${Math.round(p.resolve)}` : ""}${Number.isFinite(old.fatigue) && p.fatigue !== old.fatigue ? ` · fatigue ${Math.round(p.fatigue)}` : ""}.`,
        );
    }
    for (const g of after.gear) {
      const old = before.gear.find((v) => v.id === g.id);
      if (old && g.durability < old.durability)
        costs.push(
          `${equipmentCatalog.find((v) => v.id === g.template)?.name || "Equipment"}: −${old.durability - g.durability} condition`,
        );
    }
    f.report = {
      id: ++f.reportSerial,
      title: cp.title,
      kind: cp.kind,
      outcome: cp.outcome || "Encounter completed",
      day: s.day,
      loot,
      costs,
      conditions,
    };
    f.reportCheckpoint = null;
    return true;
  }
  if (!cp && current)
    f.reportCheckpoint = {
      kind: s.battle ? "battle" : "event",
      title: s.battle
        ? s.battle.enemyFamily || "Combat"
        : s.event.title || places[s.event.site]?.name || "Encounter",
      before: reportSnapshot(s),
      key: current,
    };
  return false;
}
export function dismissAfterActionReport(s) {
  if (!s.fieldwork.report) return false;
  s.fieldwork.report = null;
  return true;
}
function restoreFieldwork(s, raw) {
  const f = freshFieldwork(),
    r = raw.fieldwork || {};
  f.standardUnlocked = r.standardUnlocked === true;
  f.bannerBearer =
    f.standardUnlocked &&
    Number.isInteger(r.bannerBearer) &&
    s.party[r.bannerBearer] &&
    !s.party[r.bannerBearer].dead
      ? r.bannerBearer
      : null;
  f.campSize = Number.isInteger(r.campSize)
    ? Math.max(0, Math.min(2, r.campSize))
    : 0;
  f.lastCampRoll = Number.isInteger(r.lastCampRoll)
    ? Math.max(0, Math.min(s.day, r.lastCampRoll))
    : 0;
  if (
    r.campOpportunity?.day === s.day &&
    Number.isInteger(r.campOpportunity.id) &&
    s.party[r.campOpportunity.id] &&
    !s.party[r.campOpportunity.id].dead
  )
    f.campOpportunity = { id: r.campOpportunity.id, day: s.day };
  for (const item of campFurniture) {
    const q = r.campPositions?.[item.id],
      b = campBounds({ ...s, fieldwork: f });
    if (
      s.campFurniture[item.id] !== undefined &&
      Number.isFinite(q?.x) &&
      Number.isFinite(q?.y) &&
      q.x >= b.left &&
      q.y >= b.top &&
      q.x + 34 <= b.right &&
      q.y + 26 <= b.bottom
    )
      f.campPositions[item.id] = { x: q.x, y: q.y };
  }
  f.reportSerial = Number.isInteger(r.reportSerial)
    ? Math.max(0, Math.min(1e9, r.reportSerial))
    : 0;
  if (r.report && ["battle", "event"].includes(r.report.kind)) {
    f.report = {
      id: f.reportSerial,
      title: safeCompanyName(r.report.title, "After-action report", 80),
      kind: r.report.kind,
      outcome: safeCompanyName(r.report.outcome, "Encounter completed", 40),
      day: s.day,
      ...Object.fromEntries(
        ["loot", "costs", "conditions"].map((key) => [
          key,
          (Array.isArray(r.report[key]) ? r.report[key] : [])
            .filter((v) => typeof v === "string")
            .slice(0, 30)
            .map((v) => safeCompanyName(v, "", 180)),
        ]),
      ),
    };
  }
  const cp = r.reportCheckpoint;
  if (
    cp &&
    ["battle", "event"].includes(cp.kind) &&
    cp.before &&
    Number.isFinite(cp.before.gold) &&
    Array.isArray(cp.before.party) &&
    Array.isArray(cp.before.gear) &&
    cp.before.inventory &&
    cp.before.cargo &&
    [
      cp.before.gold,
      cp.before.food,
      cp.before.knowledge,
      ...Object.values(cp.before.inventory),
      ...Object.values(cp.before.cargo),
    ].every(Number.isFinite) &&
    cp.before.party.every(
      (p) =>
        p &&
        Number.isInteger(p.id) &&
        typeof p.name === "string" &&
        Number.isFinite(p.hp),
    ) &&
    cp.before.gear.every(
      (g) => g && Number.isInteger(g.id) && Number.isFinite(g.durability),
    )
  )
    f.reportCheckpoint = {
      kind: cp.kind,
      title: safeCompanyName(cp.title, "Encounter", 80),
      key: typeof cp.key === "string" ? cp.key : null,
      before: cp.before,
    };
  s.fieldwork = f;
  if (s.battle) {
    const formation = raw.battle?.terrainFormation;
    s.battle.terrainFormation = Array.isArray(formation)
      ? formation
          .filter(
            (p) =>
              p &&
              Number.isInteger(p.x) &&
              Number.isInteger(p.y) &&
              p.x >= 0 &&
              p.x < 9 &&
              p.y >= 0 &&
              p.y < 7,
          )
          .slice(0, 24)
      : [...s.battle.units, ...s.battle.enemies].map((p) => ({
          x: p.x,
          y: p.y,
        }));
    s.battle.terrainVariation = Number.isInteger(s.battle.terrainVariation)
      ? Math.max(0, Math.min(2, s.battle.terrainVariation))
      : 0;
    s.battle.terrainBaseLayout = battleLayouts.some(
      (v) => v.id === s.battle.terrainBaseLayout,
    )
      ? s.battle.terrainBaseLayout
      : s.battle.layoutId;
  }
}
export function companyLockpicker(s) {
  return (
    livingParty(s).find((p) => p.hp > 0 && p.role === "Rogue") ||
    professional(s, "Thief")
  );
}
export function resolveCampOpportunity(s, id, choice) {
  if (!campOpportunity(s, id)) return false;
  const previous = s.fieldwork.reportCheckpoint;
  beginAfterAction(s, "event", `${s.party[id].name}'s campfire conversation`);
  if (!companionStory(s, id, choice)) {
    s.fieldwork.reportCheckpoint = previous;
    return false;
  }
  s.fieldwork.campOpportunity = null;
  updateAfterActionReport(s);
  return true;
}
export function resolveCampPersonalQuest(s, id, choice) {
  if (!campOpportunity(s, id)) return false;
  const previous = s.fieldwork.reportCheckpoint;
  beginAfterAction(s, "event", `${s.party[id].name}'s personal journey`);
  if (!advancePersonalQuest(s, id, choice)) {
    s.fieldwork.reportCheckpoint = previous;
    return false;
  }
  s.fieldwork.campOpportunity = null;
  updateAfterActionReport(s);
  return true;
}

// Field life: saved encounter terrain, company order, travel safety and recovery.
export function fieldLifeState() {
  return {
    encounter: 0,
    speed: 1,
    autoPause: true,
    paused: false,
    heading: 0,
    order: [],
    deployment: {},
    losses: [],
    wildlife: [
      { id: "deer-briar", x: 340, y: 185, hp: 3, homeX: 340, homeY: 185 },
      { id: "deer-east", x: 965, y: 280, hp: 3, homeX: 965, homeY: 280 },
      { id: "deer-north", x: 515, y: 108, hp: 3, homeX: 515, homeY: 108 },
    ],
    ecology: [],
  };
}
export function companyOrder(s) {
  const ids = s.party.filter((p) => !p.dead).map((p) => p.id);
  return [
    ...new Set([
      ...(s.fieldLife?.order || []).filter((id) => ids.includes(id)),
      ...ids,
    ]),
  ];
}
export function reorderCompany(s, id, offset) {
  if (s.battle || s.event || ![-1, 1].includes(offset)) return false;
  const order = companyOrder(s),
    i = order.indexOf(id),
    j = i + offset;
  if (i < 0 || j < 0 || j >= order.length) return false;
  [order[i], order[j]] = [order[j], order[i]];
  s.fieldLife.order = order;
  return true;
}
export function setDeployment(s, id, x, y) {
  if (
    s.battle ||
    s.event ||
    !s.party[id] ||
    s.party[id].dead ||
    !Number.isInteger(x) ||
    x < 0 ||
    x > 2 ||
    !Number.isInteger(y) ||
    y < 0 ||
    y > 6
  )
    return false;
  const occupied = Object.entries(s.fieldLife.deployment).find(
    ([other, p]) => Number(other) !== id && p.x === x && p.y === y,
  );
  if (occupied) delete s.fieldLife.deployment[occupied[0]];
  s.fieldLife.deployment[id] = { x, y };
  return true;
}
export function autoFormation(s) {
  if (s.battle || s.event) return false;
  s.fieldLife.deployment = {};
  const order = companyOrder(s).sort(
    (a, b) => formationRank(s.party[a]) - formationRank(s.party[b]),
  );
  const counts = [0, 0, 0],
    lanes = [3, 1, 5, 0, 6, 2, 4];
  for (const id of order) {
    const rank = formationRank(s.party[id]);
    let x = rank === 0 ? 2 : rank === 1 ? 1 : 0;
    if (counts[x] >= 7) x = counts.findIndex((n) => n < 7);
    s.fieldLife.deployment[id] = { x, y: lanes[counts[x]++] };
  }
  return true;
}
function formationRank(p) {
  return ["Shieldbearer", "Paladin"].includes(p.role)
    ? 0
    : ["Archer", "Wizard", "Cleric", "Druid"].includes(p.role)
      ? 2
      : 1;
}
function deployCompanyFormation(s) {
  const occupied = new Set();
  for (const u of s.battle.units) {
    const wanted = s.fieldLife.deployment[u.id];
    if (wanted) {
      u.x = wanted.x;
      u.y = wanted.y;
    }
    while (occupied.has(`${u.x}:${u.y}`)) {
      u.y = (u.y + 1) % 7;
      if (!u.y) u.x = (u.x + 1) % 3;
    }
    occupied.add(`${u.x}:${u.y}`);
    u.facing = 0;
  }
  s.battle.enemies.forEach((e) => (e.facing = Math.PI));
}
function encounterTerrain(s) {
  const b = s.battle,
    style = battlefield(s).style;
  let seed = b.fieldSeed >>> 0;
  const rand = (n) => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed % n;
  };
  const tiles = [],
    protectedCells = new Set(b.terrainFormation.map((p) => `${p.x}:${p.y}`));
  // Deployment columns remain open; the centre always has an east/west route.
  const corridor = 1 + rand(5),
    count = 9 + rand(6),
    used = new Set();
  for (let attempt = 0; tiles.length < count && attempt < 200; attempt++) {
    const x = 3 + rand(4),
      y = rand(7),
      key = `${x}:${y}`;
    if (used.has(key) || protectedCells.has(key)) continue;
    used.add(key);
    const n = rand(10);
    const obstacle =
      style === "forest"
        ? n % 2
          ? "tree"
          : "log"
        : style === "ruin"
          ? "wall"
          : style === "river"
            ? "water"
            : style === "quarry"
              ? "rock"
              : n % 2
                ? "log"
                : "rock";
    tiles.push(
      n < 4 && y !== corridor
        ? obstacleTile(x, y, obstacle)
        : n < 8
          ? coverTile(
              x,
              y,
              style === "ruin" || style === "quarry" ? "rubble" : "brush",
            )
          : mudTile(x, y),
    );
  }
  if (b.caravanRaid) {
    const x = 4,
      y = corridor === 3 ? 4 : 3;
    if (!protectedCells.has(`${x}:${y}`)) {
      const i = tiles.findIndex((t) => t.x === x && t.y === y);
      if (i >= 0) tiles.splice(i, 1);
      tiles.push(obstacleTile(x, y, "wagon"));
    }
  }
  return tiles;
}
export function setTravelSpeed(s, speed) {
  if (![0.5, 1, 2, 3].includes(speed)) return false;
  s.fieldLife.speed = speed;
  return true;
}
export function nearbyThreat(s) {
  return s.patrols.find(
    (p) =>
      !p.cleared &&
      p.kind !== "merchant" &&
      (!p.faction || p.hostile) &&
      !passageSafe(s, p) &&
      Math.hypot(p.x - s.position.x, p.y - s.position.y) < 115 &&
      !isHidden(s),
  );
}
export function resumeTravel(s) {
  s.fieldLife.paused = false;
  s.fieldLife.ignoreThreat = nearbyThreat(s)?.id || null;
}
export function updateTravelSafety(s) {
  if (
    !s.fieldLife.autoPause ||
    s.fieldLife.paused ||
    s.battle ||
    s.event ||
    s.campOpen
  )
    return false;
  const p = nearbyThreat(s);
  if (!p) {
    s.fieldLife.ignoreThreat = null;
    return false;
  }
  if (p.id === s.fieldLife.ignoreThreat) return false;
  s.fieldLife.paused = true;
  note(
    s,
    `Travel paused: ${p.name} nearby. Review the threat, then resume when ready.`,
  );
  return true;
}
export function advanceEcology(s, seconds) {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0 ||
    s.battle ||
    s.event ||
    s.campOpen ||
    s.fieldLife.paused ||
    s.fieldwork.report
  )
    return;
  for (const deer of s.fieldLife.wildlife) {
    if (deer.hp <= 0) continue;
    const wolf = s.patrols.find(
      (p) =>
        !p.cleared &&
        p.kind === "wolves" &&
        Math.hypot(p.x - deer.x, p.y - deer.y) < 100,
    );
    if (wolf) {
      const d = Math.hypot(wolf.x - deer.x, wolf.y - deer.y),
        step = Math.min(seconds * 18, Math.max(0, d - 5));
      if (d > 0) {
        wolf.x += ((deer.x - wolf.x) / d) * step;
        wolf.y += ((deer.y - wolf.y) / d) * step;
      }
      wolf.ecologyTarget = deer.id;
      wolf.activity = "Hunting wildlife";
      const dx = deer.x - wolf.x,
        dy = deer.y - wolf.y,
        l = Math.hypot(dx, dy) || 1;
      deer.x = Math.max(
        12,
        Math.min(WORLD.width - 12, deer.x + (dx / l) * seconds * 9),
      );
      deer.y = Math.max(
        12,
        Math.min(WORLD.height - 12, deer.y + (dy / l) * seconds * 9),
      );
      if (d < 20) {
        deer.hp = Math.max(0, deer.hp - seconds);
        if (!deer.hp) {
          wolf.activity = "Feeding";
          wolf.fedUntil = s.day * 24 + s.timeOfDay + 4;
          s.fieldLife.ecology.unshift(`${wolf.name} brought down a deer.`);
          s.fieldLife.ecology = s.fieldLife.ecology.slice(0, 8);
        }
      }
    } else {
      deer.x += Math.sin(s.timeOfDay + deer.homeX) * seconds * 2;
      deer.y += Math.cos(s.timeOfDay + deer.homeY) * seconds;
    }
  }
}
function leaveRecoveryCache(s, outcome) {
  const food = Math.min(s.food, outcome === "defeat" ? 12 : 6),
    cargo = {};
  s.food -= food;
  for (const good of tradeGoods) {
    const n = Math.min(s.cargo[good.id] || 0, outcome === "defeat" ? 3 : 1);
    if (n) {
      cargo[good.id] = n;
      s.cargo[good.id] -= n;
    }
  }
  if (food || Object.keys(cargo).length) {
    s.fieldLife.losses.push({
      id: `cache-${s.fieldLife.encounter}-${s.day}-${s.fieldLife.losses.length}`,
      x: s.position.x,
      y: s.position.y,
      food,
      cargo,
      day: s.day,
      claimed: false,
    });
    s.fieldLife.losses = s.fieldLife.losses.slice(-12);
    note(
      s,
      `Abandoned ${food} rations and trade cargo at the battlefield. Return to recover the supplies.`,
    );
  }
}
export function recoverFieldCache(s, id) {
  const cache = s.fieldLife.losses.find((v) => v.id === id);
  if (
    !cache ||
    cache.claimed ||
    s.battle ||
    s.event ||
    s.campOpen ||
    Math.hypot(cache.x - s.position.x, cache.y - s.position.y) > 55
  )
    return false;
  if (
    Object.values(cache.cargo).reduce((a, b) => a + b, 0) + cargoLoad(s) >
    companyCargoCapacity(s)
  )
    return false;
  beginAfterAction(s, "event", "Recovered battlefield supplies");
  s.food += cache.food;
  for (const [good, n] of Object.entries(cache.cargo))
    s.cargo[good] = (s.cargo[good] || 0) + n;
  cache.claimed = true;
  note(s, "Recovered the abandoned supplies.");
  return true;
}
export function rescueCompanion(s, id) {
  const p = s.party[id];
  if (
    !p ||
    p.dead ||
    p.hp > 0 ||
    s.battle ||
    s.event ||
    !s.party.some((q) => !q.dead && q.hp > 0) ||
    s.inventory.medicine < 1
  )
    return false;
  beginAfterAction(s, "event", `Emergency treatment: ${p.name}`);
  s.inventory.medicine--;
  p.hp = Math.max(1, Math.floor(p.max * 0.15));
  p.injury = true;
  inflictWound(s, id, "sprain", 2);
  spendHours(s, 2, { resting: true });
  note(
    s,
    `${p.name} is stabilized and can travel. Treat their lasting wound and rest.`,
  );
  return true;
}
function restoreFieldLife(s, raw) {
  const f = fieldLifeState(),
    r = raw.fieldLife || {};
  f.encounter = Number.isSafeInteger(r.encounter)
    ? Math.max(0, r.encounter)
    : 0;
  f.speed = [0.5, 1, 2, 3].includes(r.speed) ? r.speed : 1;
  f.autoPause = r.autoPause !== false;
  f.paused = r.paused === true;
  f.heading = Number.isFinite(r.heading) ? r.heading : 0;
  f.order = Array.isArray(r.order)
    ? r.order
        .filter(
          (id) => Number.isInteger(id) && s.party[id] && !s.party[id].dead,
        )
        .slice(0, 24)
    : [];
  for (const [id, p] of Object.entries(r.deployment || {}))
    if (
      s.party[id] &&
      Number.isInteger(p?.x) &&
      p.x >= 0 &&
      p.x <= 2 &&
      Number.isInteger(p.y) &&
      p.y >= 0 &&
      p.y <= 6
    )
      f.deployment[id] = { x: p.x, y: p.y };
  if (Array.isArray(r.wildlife))
    f.wildlife = r.wildlife
      .filter(
        (v) =>
          v &&
          typeof v.id === "string" &&
          Number.isFinite(v.x) &&
          Number.isFinite(v.y) &&
          Number.isFinite(v.hp),
      )
      .slice(0, 12)
      .map((v) => ({
        ...v,
        homeX: Number.isFinite(v.homeX) ? v.homeX : v.x,
        homeY: Number.isFinite(v.homeY) ? v.homeY : v.y,
        hp: Math.max(0, Math.min(3, v.hp)),
        x: Math.max(12, Math.min(WORLD.width - 12, v.x)),
        y: Math.max(12, Math.min(WORLD.height - 12, v.y)),
      }));
  if (Array.isArray(r.losses))
    f.losses = r.losses
      .filter(
        (v) =>
          v &&
          typeof v.id === "string" &&
          Number.isFinite(v.x) &&
          Number.isFinite(v.y),
      )
      .slice(-12)
      .map((v) => ({
        ...v,
        food: Math.max(0, Math.min(12, Number(v.food) || 0)),
        cargo: Object.fromEntries(
          tradeGoods.map((g) => [
            g.id,
            Math.max(0, Math.min(3, Math.floor(Number(v.cargo?.[g.id]) || 0))),
          ]),
        ),
        claimed: !!v.claimed,
      }));
  f.ecology = Array.isArray(r.ecology)
    ? r.ecology.filter((v) => typeof v === "string").slice(0, 8)
    : [];
  s.fieldLife = f;
  if (s.battle && Number.isSafeInteger(raw.battle?.fieldSeed))
    s.battle.fieldSeed = raw.battle.fieldSeed >>> 0;
  if (s.battle) {
    for (const u of s.battle.units) {
      const old = raw.battle?.units?.find((v) => v.id === u.id);
      u.facing = Number.isFinite(old?.facing) ? old.facing : 0;
    }
    for (const e of s.battle.enemies) {
      const old = raw.battle?.enemies?.find((v) => v.id === e.id);
      e.facing = Number.isFinite(old?.facing) ? old.facing : Math.PI;
      if (
        !e.bossId &&
        ["wolf", "goblin", "bandit", "raider", "brute", "archer"].includes(
          e.kind,
        ) &&
        old?.fleeing === true
      )
        e.fleeing = true;
    }
  }
}
