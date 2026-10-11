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
export function fresh() {
  return {
    version: 11,
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
    })),
  };
}
export function note(s, t) {
  s.log.unshift(`Day ${s.day} · ${t}`);
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
  if (s.day % 3 === 0) s.event = roadEvent(s);
  return true;
}
export function camp(s) {
  if (s.battle || s.event || companyLost(s)) return false;
  s.destination = null;
  const cook = professional(s, "Cook");
  const recovery =
    (s.research.includes("medicine") ? 18 : 10) +
    professionBonus(s, "Herbalist") * 2 +
    (s.campUpgrades.tents || 0) * 5 +
    (s.campUpgrades.infirmary || 0) * 6;
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
      p.hp = Math.min(p.max, p.hp + recovery);
      if (p.hp === p.max || (s.campUpgrades.infirmary && p.hp >= p.max / 2))
        p.injury = false;
    }
    if (cook && !cook.dead && campWorker(s, "cook")?.id !== cook.id)
      practice(s, cook, 1);
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
  return true;
}
export function research(s, id) {
  const r = studies.find((r) => r.id === id);
  if (
    !r ||
    s.research.includes(id) ||
    s.knowledge < r.cost ||
    (r.requires && !s.research.includes(r.requires)) ||
    s.battle ||
    s.event
  )
    return false;
  s.knowledge -= r.cost;
  s.research.push(id);
  if (id === "cartography") s.discovered = places.map((p, i) => i);
  if (id === "scouting") discoverNearby(s);
  note(s, `Learned ${r.name}.`);
  return true;
}
export function startBattle(s, patrolId = null) {
  const patrol = patrolId
    ? s.patrols.find((p) => p.id === patrolId && !p.cleared)
    : null;
  if (
    patrolId &&
    (!patrol ||
      Math.hypot(patrol.x - s.position.x, patrol.y - s.position.y) > 48)
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
  s.destination = null;
  if (patrol?.kind === "merchant" && !patrol.hostile) {
    patrol.hostile = true;
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
    wildlife: patrol?.kind === "wolves",
    turn: 1,
    valor: Math.min(5, 3 + (s.campUpgrades.watchpost || 0) + s.preparedValor),
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
  deployBattle(s, patrol);
  if (!patrol) deployAdversary(s);
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
  wearBattleEquipment(s);
  const patrolFight = s.battle.kind === "patrol";
  const bossFight = !patrolFight && s.contract?.kind === "boss";
  const raid = patrolFight && s.battle.caravanRaid;
  const wildlife = patrolFight && s.battle.wildlife;
  const difficulty = wildlife
    ? { tier: 1, knowledge: 1, xp: 20, salvage: 0, renown: 2 }
    : contractDifficulty(patrolFight ? null : s.contract);
  const reward = patrolFight
    ? wildlife
      ? 0
      : raid
        ? 60
        : 40
    : s.contract.reward;
  if (wildlife) {
    s.food += 6;
    s.inventory.pelts += 2;
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
    changeReputation(s, wildlife ? "freefolk" : "wardens", 1);
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
    `${wildlife ? "Wolf pack defeated · 6 rations and 2 pelts recovered" : raid ? "Caravan plundered · remaining provisions and cargo seized" : patrolFight ? "Patrol defeated" : s.contract?.kind === "story" ? "Faction battle won" : "Contract fulfilled"}. Earned ${reward} crowns, ${difficulty.knowledge} knowledge, and ${difficulty.xp} XP per survivor.`,
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
  s.battle = null;
}
export function endTurn(s) {
  const b = s.battle;
  if (!b) return false;
  b.enemies.forEach((e) => (e.stunnedThisRound = false));
  resolveBossThreat(s);
  for (const e of b.enemies.filter((e) => e.hp > 0)) {
    if (e.bleed > 0) {
      hitEnemy(s, e, 2 + (e.armor || 0));
      e.bleed--;
      note(s, "An enemy suffers 2 bleeding damage.");
      if (e.hp === 0) continue;
    }
    if (e.stun > 0) {
      e.stunnedThisRound = true;
      e.stun--;
      e.root = Math.max(0, (e.root || 0) - 1);
      note(s, "A stunned enemy loses its turn.");
      continue;
    }
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
    const t = targets[0];
    if (!t) break;
    const range = e.kind === "archer" ? 4 : 1,
      dist = () => Math.abs(t.x - e.x) + Math.abs(t.y - e.y);
    const rooted = (e.root || 0) > 0;
    e.root = Math.max(0, (e.root || 0) - 1);
    const rush = e.bossId === "ashfang" ? 3 : e.kind === "wolf" ? 2 : 1;
    let movement = rush;
    for (
      let step = 0;
      !rooted &&
      movement > 0 &&
      step < rush &&
      (dist() > range ||
        !hasLineOfSight(s, e, t) ||
        (e.kind === "archer" && dist() <= 1));
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
      const retreat = e.kind === "archer" && dist() <= 1;
      options.sort(
        (a, c) =>
          (Math.abs(a[0] - t.x) +
            Math.abs(a[1] - t.y) -
            (Math.abs(c[0] - t.x) + Math.abs(c[1] - t.y))) *
          (retreat ? -1 : 1),
      );
      if (!retreat && battleTerrain(s).some((tile) => tile.blocked)) {
        const route = enemyApproach(s, e, t, range, movement);
        options =
          route && terrainCell(s, route[0], route[1]).cost <= movement
            ? [route]
            : [];
      }
      if (options.length) {
        enemyDisengagement(s, e, options[0]);
        if (e.hp <= 0) break;
        movement -= terrainCell(s, options[0][0], options[0][1]).cost;
        [e.x, e.y] = options[0];
      }
    }
    if (e.hp > 0 && dist() <= range && hasLineOfSight(s, e, t)) {
      const p = s.party[t.id];
      const power =
        (e.damage || 5) +
        adversaryPower(s, e) +
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
      const damage = damageCompanion(s, t, power, e.kind === "archer");
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
    if (e.hp > 0) markAdversaryThreat(s, e, t);
  }
  if (b.enemies.every((e) => e.hp === 0)) {
    win(s);
    return true;
  }
  if (s.party.every((p) => p.hp === 0)) {
    wearBattleEquipment(s, "defeat");
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
    });
  }
  return true;
}

export function restore(raw) {
  const base = fresh();
  if (
    !raw ||
    ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(raw.version) ||
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
    version: 11,
    inventory: { ...base.inventory, ...raw.inventory },
    explored: raw.explored || [],
    event: raw.event || null,
  };
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
          ...(p.kind === "merchant"
            ? {
                foodStock: Number.isInteger(saved.foodStock)
                  ? Math.max(0, Math.min(30, saved.foodStock))
                  : 30,
                cargo: Object.fromEntries(
                  tradeGoods.map((g) => [
                    g.id,
                    Number.isInteger(saved.cargo?.[g.id])
                      ? Math.max(0, Math.min(20, saved.cargo[g.id]))
                      : p.cargo[g.id],
                  ]),
                ),
              }
            : {}),
        }
      : p;
  });
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
              typeof id === "string" && /^(0|3|6)-(veteran|ranger)$/.test(id),
          ),
        ),
      ]
    : [];
  result.cargo = Object.fromEntries(
    tradeGoods.map((g) => [
      g.id,
      Number.isInteger(raw.cargo?.[g.id])
        ? Math.max(0, Math.min(cargoCapacity, raw.cargo[g.id]))
        : 0,
    ]),
  );
  let cargoRoom = cargoCapacity;
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
  return result;
}
export function attackPower(s, p) {
  return (
    p.damage +
    (p.weapon || 0) +
    (equippedItem(s, p, "weapon")?.bonus || 0) +
    (p.talent === "duelist" ? 2 : 0) +
    (s.research.includes("steel") ? 2 : 0) +
    (s.morale >= 85 ? 1 : 0) -
    (p.injury ? 1 : 0) -
    fatiguePenalty(p) -
    ((p.resolve ?? 65) < 25 ? 1 : 0) +
    (hasTrait(p, "mercenary") ? 1 : 0) +
    bondSupport(s, p)
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
  s.gold -= offer.cost;
  const companion = {
    id,
    name: offer.name,
    role: offer.role,
    max: offer.max,
    hp: offer.max,
    damage: 6,
    level: 1,
    xp: 0,
    points: 0,
    injury: false,
    dead: false,
    fatigue: 0,
    resolve: 65,
    traits: [...offer.traits],
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
    (p.hp === p.max && !p.injury)
  )
    return false;
  s.inventory.medicine--;
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
  return true;
}
export function forage(s) {
  if (s.battle || s.event || companyLost(s)) return false;
  s.food += forageAmount(s);
  const herbalist = professional(s, "Herbalist");
  if (herbalist) {
    s.inventory.herbs += 1 + professionRank(herbalist);
    practice(s, herbalist, 1);
  }
  spendHours(s, 6);
  s.morale = Math.max(0, s.morale - 3);
  note(s, `Gathered ${forageAmount(s)} rations in six hours.`);
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

// Continuous overworld navigation. Landmarks grant services within 28 world pixels;
// they do not constrain the player's route or destination.
export function nearbyPlace(position) {
  return places.findIndex(
    (p) => Math.hypot(p.x - position.x, p.y - position.y) <= 28,
  );
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
  if (p.y < 150 && p.x < 450) return "highlands";
  if (
    (p.x > 275 && p.x < 395 && p.y < 230) ||
    (p.x > 870 && p.x < 1150 && p.y < 400)
  )
    return "forest";
  return "grassland";
}
export function advanceMovement(s, seconds) {
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
  let budget = seconds * (terrainAt(s.position) === "shallows" ? 36 : 70),
    changed = false,
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
    s.position.x += (dx / length) * amount;
    s.position.y += (dy / length) * amount;
    s.walked = (s.walked + amount) % 160;
    discoverNearby(s);
    budget -= amount;
    changed = true;
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
  return { changed, arrived };
}
export function partyPositions(s) {
  return s.party.map((p, index) => {
    if (index === 0) return { ...s.position };
    let remaining = index * 17,
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
      (s.campUpgrades.watchpost ? 40 : 0),
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
      cargo: { grain: 4, cloth: 2, salt: 3, iron: 1 },
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
  ];
}
export function advancePatrols(s, seconds) {
  if (
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    return false;
  for (const p of s.patrols.filter((p) => !p.cleared)) {
    let budget =
      Math.min(seconds, 5) *
      (p.kind === "merchant" ? 14 : p.kind === "wolves" ? 24 : 20);
    const playerDistance = Math.hypot(s.position.x - p.x, s.position.y - p.y);
    if (
      p.kind !== "merchant" &&
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
  return true;
}
export function nearbyPatrols(s) {
  return s.patrols.filter(
    (p) =>
      !p.cleared && Math.hypot(p.x - s.position.x, p.y - s.position.y) <= 48,
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

export const professions = ["Smith", "Miner", "Herbalist", "Cook"];
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
      .filter((p) => p.profession === name && p.hp > 0)
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
  return count
    ? Math.max(
        1,
        count +
          livingParty(s).filter((p) => hasTrait(p, "hearty")).length -
          Math.min(2, professionBonus(s, "Cook")) -
          (s.research.includes("rations") ? 1 : 0) -
          (s.campUpgrades.cookpot || 0) -
          (s.campOpen && campWorker(s, "cook") ? 1 : 0),
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
    (s && gearPerk(s, p, "reach") ? 1 : 0)
  );
}
export function movementRange(p) {
  return Math.max(
    1,
    (p.talent === "skirmisher" ? 3 : 2) - (fatiguePenalty(p) === 2 ? 1 : 0),
  );
}
export function hitEnemy(s, e, power) {
  const damage = Math.max(1, power - (e.armor || 0)),
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
        (skill.piercing ? e.armor || 0 : 0) +
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
      item.durability = Math.max(0, before.durability - loss);
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
  wearBattleEquipment(s, "retreat");
  s.gold = Math.max(0, s.gold - 15);
  s.morale = Math.max(0, s.morale - 10);
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
          ? !s.campUpgrades.forge || !smith
            ? "Build a camp forge and assign a conscious Smith."
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
  const item = equipmentCatalog.find((item) => item.id === templateId);
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
        (s.campOpen && campWorker(s, "smith") ? 1 : 0),
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
export const DAY_SECONDS = 240;
export function livingParty(s) {
  return s.party.filter((p) => !p.dead);
}
export function companyLost(s) {
  return livingParty(s).length === 0;
}
export function dailyWages(s) {
  return livingParty(s).reduce((total, p) => total + companionWages(p), 0);
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
  if (companyLost(s)) {
    s.destination = null;
    s.campOpen = false;
    s.event = null;
    s.battle = null;
    note(s, "The company has perished. Start a new company to continue.");
  }
}
export function spendHours(s, hours, options = {}) {
  if (!Number.isFinite(hours) || hours <= 0 || companyLost(s)) return false;
  let remaining = Math.min(hours, 24 * 30);
  while (remaining > 0.000001 && !companyLost(s)) {
    const untilMidnight = 24 - s.timeOfDay;
    const amount = Math.min(remaining, untilMidnight);
    if (!options.resting)
      for (const p of livingParty(s))
        p.fatigue = Math.min(
          100,
          (p.fatigue || 0) + amount * (hasTrait(p, "tireless") ? 1.5 : 2),
        );
    s.timeOfDay += amount;
    remaining -= amount;
    if (s.timeOfDay >= 24 - 0.000001) {
      s.timeOfDay = 0;
      s.day++;
      settleDay(s, !!options.mealsProvided);
    }
  }
  return true;
}
export function advanceClock(s, seconds) {
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
  if (s.day !== before && !companyLost(s) && s.day % 3 === 0) {
    if (s.day % 6 === 0) beginTrailEncounter(s);
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
export function canAssignCampJob(s, roleId, companionId) {
  const role = campRoles.find((role) => role.id === roleId),
    p = s.party[companionId];
  return !!(
    role &&
    p &&
    !p.dead &&
    p.hp > 0 &&
    s.campUpgrades[role.building] &&
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
      const ore = 2 + professionRank(smith);
      s.inventory.wood--;
      s.inventory.ore += ore;
      practice(s, smith, 2);
      note(s, `${smith.name} salvaged ${ore} ore using 1 wood at the forge.`);
    } else note(s, `${smith.name} needs 1 wood to work the camp forge.`);
  }
  if (medic) {
    if (s.inventory.herbs >= 2) {
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
  return hasTrait(p, "mercenary") ? 3 : 2;
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
  return offers.filter(
    (offer) => offer.standard || !s.hiredRecruits.includes(offer.id),
  );
}

// Terrain, movement, and disengagement share the same rules with the canvas UI.
const coverTile = (x, y, kind = "rubble") => ({
  x,
  y,
  kind,
  cover: 2,
  cost: 1,
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
  if (patrol?.kind === "merchant") return "road";
  if (patrol?.kind === "wolves") return "forest-edge";
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
  return "road";
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
  const p = s.party[u.id];
  for (const point of path) {
    if (!u.safeMove)
      for (const enemy of s.battle.enemies) {
        if (
          enemy.hp <= 0 ||
          enemy.kind === "archer" ||
          enemy.stun ||
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
    u.x = point.x;
    u.y = point.y;
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
      (p.role === "Shieldbearer" ? 2 : 0) -
      armorPower(s, p) -
      (target.guard ? 2 + (gearPerk(s, p, "bastion") ? 2 : 0) : 0) -
      bondProtection(s, target) -
      aura -
      (ranged ? terrainCell(s, target.x, target.y).cover : 0),
  );
  p.hp = Math.max(0, p.hp - damage);
  p.injury = p.hp < p.max / 2;
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
function purchaseModifier(s) {
  return (
    (s.research.includes("barter") ? 0.8 : 1) *
    (s.reputation.guild >= 10 ? 0.9 : s.reputation.guild <= -10 ? 1.25 : 1)
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
        price: Math.ceil(offer[0] * region.supply[item] * purchaseModifier(s)),
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
    quantity > cargoCapacity ||
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
      cargoLoad(s) + quantity > cargoCapacity
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
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > cargoCapacity ||
    s.battle ||
    s.event ||
    s.campOpen ||
    companyLost(s) ||
    p.cargo[good] < quantity ||
    cargoLoad(s) + quantity > cargoCapacity ||
    s.gold < unit * quantity
  )
    return false;
  s.gold -= unit * quantity;
  p.cargo[good] -= quantity;
  s.cargo[good] += quantity;
  note(s, `Bought ${quantity} ${good} from ${p.name}.`);
  return true;
}
function lootCaravanCargo(s, p) {
  if (!p) return;
  const rations = Math.min(10, p.foodStock);
  s.food += rations;
  p.foodStock -= rations;
  for (const good of tradeGoods) {
    const recovered = Math.min(p.cargo[good.id], cargoCapacity - cargoLoad(s));
    if (recovered > 0) {
      s.cargo[good.id] += recovered;
      p.cargo[good.id] -= recovered;
      note(s, `Seized ${recovered} ${good.id} from caravan cargo.`);
    }
  }
}
export function forageAmount(s) {
  return 6 + (s.reputation.freefolk >= 10 ? 2 : 0);
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
      cargoCapacity
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
export function scoutLock(s) {
  if (s.battle || s.event || s.campOpen || companyLost(s))
    return "Return to free exploration first.";
  if (places[s.location]?.type === "town")
    return "Leave the village to scout the surrounding land.";
  if (s.trailLedger[trailRegion(s)] === s.day)
    return "This region has already been scouted today. Explore another region or return tomorrow.";
  return null;
}
export function beginTrailEncounter(s) {
  if (scoutLock(s)) return false;
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
  spendHours(s, 1);
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
  if (cargoLoad(s) - outgoing + incoming > cargoCapacity)
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
