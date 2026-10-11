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
    desc: "Each 160 pixels of travel uses 3 rations instead of 4.",
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
    version: 7,
    inventory: { ore: 0, wood: 0, herbs: 0, medicine: 1 },
    gear: [],
    nextGearId: 1,
    explored: [],
    event: null,
    renown: 0,
    skirmishes: 0,
    discovered: [0, 3],
    charted: initialChart(),
    patrols: initialPatrols(),
    day: 1,
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
      equipment: { weapon: null, armor: null },
    })),
  };
}
export function note(s, t) {
  s.log.unshift(`Day ${s.day} · ${t}`);
  s.log = s.log.slice(0, 30);
}
export function travel(s, to) {
  if (s.battle || s.event || to === s.location || !places[to]) return false;
  const cost = s.research.includes("rations") ? 3 : 4;
  if (s.food < cost) {
    note(s, "Not enough provisions to travel. Buy supplies or forage.");
    return false;
  }
  s.food -= cost;
  s.day++;
  s.location = to;
  s.position = { x: places[to].x, y: places[to].y };
  s.trail = [{ ...s.position }];
  s.destination = null;
  s.morale = Math.max(0, s.morale - 2);
  note(s, `Reached ${places[to].name}. Used ${cost} rations.`);
  if (s.day % 3 === 0) s.event = roadEvent(s);
  return true;
}
export function camp(s) {
  if (s.battle || s.event) return false;
  const wages = s.party.length * 2,
    foodCost = campCost(s),
    cook = professional(s, "Cook"),
    recovery =
      (s.research.includes("medicine") ? 18 : 10) +
      professionBonus(s, "Herbalist") * 2;
  if (s.food < foodCost || s.gold < wages) {
    note(
      s,
      `Camp needs ${foodCost} rations and 2 crowns per companion for wages.`,
    );
    return false;
  }
  s.food -= foodCost;
  s.gold -= wages;
  s.day++;
  s.morale = Math.min(100, s.morale + 10 + professionBonus(s, "Cook"));
  for (const p of s.party) {
    p.hp = Math.min(p.max, p.hp + recovery);
    if (p.hp === p.max) p.injury = false;
  }
  if (cook) practice(s, cook, 1);
  note(s, "Campfires lit. Wages paid, wounds tended, spirits lifted.");
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
    (!patrol &&
      (!s.contract ||
        s.contract.kind === "delivery" ||
        s.location !== s.contract.target)) ||
    !s.party.some((p) => p.hp > 0)
  )
    return false;
  s.destination = null;
  if (patrol?.kind === "merchant" && !patrol.hostile) {
    patrol.hostile = true;
    s.morale = Math.max(0, s.morale - 10);
    s.renown = Math.max(0, s.renown - 5);
    note(
      s,
      "You attack peaceful traders. −10 morale, −5 renown; this caravan will no longer trade.",
    );
  }
  s.battle = {
    kind: patrol ? "patrol" : "contract",
    patrolId: patrol?.id || null,
    caravanRaid: patrol?.kind === "merchant",
    turn: 1,
    valor: 3,
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
  if (!u || u.acted || p.hp <= 0 || x < 0 || y < 0 || x > 8 || y > 6)
    return false;
  const d = Math.abs(x - u.x) + Math.abs(y - u.y);
  const e = b.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (e) {
    if (d > attackRange(p)) return false;
    const damage = hitEnemy(s, e, attackPower(s, p));
    note(s, `${p.name} strikes for ${damage} damage.`);
    u.acted = true;
  } else {
    if (
      u.moved ||
      d > movementRange(p) ||
      d === 0 ||
      b.units.some((v) => v.x === x && v.y === y && s.party[v.id].hp > 0)
    )
      return false;
    u.x = x;
    u.y = y;
    u.moved = true;
  }
  if (b.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}
function win(s) {
  const patrolFight = s.battle.kind === "patrol";
  const raid = patrolFight && s.battle.caravanRaid;
  const difficulty = contractDifficulty(patrolFight ? null : s.contract);
  const reward = patrolFight ? (raid ? 60 : 40) : s.contract.reward;
  if (raid) s.food += 10;
  s.gold += reward;
  s.knowledge += difficulty.knowledge;
  if (patrolFight) {
    s.skirmishes++;
    const patrol = s.patrols.find((p) => p.id === s.battle.patrolId);
    if (patrol) patrol.cleared = true;
  } else s.completed++;
  if (!raid) s.renown += difficulty.renown;
  s.inventory.ore += difficulty.salvage;
  s.inventory.wood += difficulty.salvage;
  for (const p of s.party.filter((p) => p.hp > 0)) {
    p.xp += difficulty.xp;
    while (p.xp >= p.level * 30) {
      p.xp -= p.level * 30;
      p.level++;
      p.points++;
    }
  }
  note(
    s,
    `${raid ? "Caravan plundered · 10 rations seized" : patrolFight ? "Patrol defeated" : "Contract fulfilled"}. Earned ${reward} crowns, ${difficulty.knowledge} knowledge, and ${difficulty.xp} XP per survivor.`,
  );
  const lootPool = equipmentCatalog.filter(
    (item) => item.tier === difficulty.tier,
  );
  const loot = lootPool[(s.completed + s.skirmishes - 1) % lootPool.length];
  grantEquipment(s, loot.id);
  note(
    s,
    `Recovered ${loot.rarity.toLowerCase()} ${loot.name}. Open Equipment to assign the loot.`,
  );
  if (!patrolFight) s.contract = null;
  s.battle = null;
}
export function endTurn(s) {
  const b = s.battle;
  if (!b) return false;
  for (const e of b.enemies.filter((e) => e.hp > 0)) {
    if (e.bleed > 0) {
      hitEnemy(s, e, 2 + (e.armor || 0));
      e.bleed--;
      note(s, "An enemy suffers 2 bleeding damage.");
      if (e.hp === 0) continue;
    }
    if (e.stun > 0) {
      e.stun--;
      e.root = Math.max(0, (e.root || 0) - 1);
      note(s, "A stunned enemy loses its turn.");
      continue;
    }
    const targets = b.units
      .filter((u) => s.party[u.id].hp > 0)
      .sort(
        (a, c) =>
          Math.abs(a.x - e.x) +
          Math.abs(a.y - e.y) -
          (Math.abs(c.x - e.x) + Math.abs(c.y - e.y)),
      );
    const t = targets[0];
    if (!t) break;
    const range = e.kind === "archer" ? 4 : 1,
      dist = () => Math.abs(t.x - e.x) + Math.abs(t.y - e.y);
    const rooted = (e.root || 0) > 0;
    e.root = Math.max(0, (e.root || 0) - 1);
    if (!rooted && (dist() > range || (e.kind === "archer" && dist() <= 1))) {
      const options = [
        [e.x + 1, e.y],
        [e.x - 1, e.y],
        [e.x, e.y + 1],
        [e.x, e.y - 1],
      ].filter(
        ([x, y]) =>
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
      if (options.length) [e.x, e.y] = options[0];
    }
    if (dist() <= range) {
      const p = s.party[t.id],
        aura = b.units.some(
          (u) =>
            u.id !== t.id &&
            u.guard &&
            s.party[u.id].hp > 0 &&
            s.party[u.id].talent === "bulwark" &&
            Math.abs(u.x - t.x) + Math.abs(u.y - t.y) <= 1,
        )
          ? 2
          : 0;
      const damage = Math.max(
        1,
        (e.damage || 5) -
          (p.role === "Shieldbearer" ? 2 : 0) -
          armorPower(s, p) -
          (t.guard ? 2 : 0) -
          aura,
      );
      p.hp = Math.max(0, p.hp - damage);
      p.injury = p.hp < p.max / 2;
      note(
        s,
        `${p.name} takes ${damage} damage${p.hp === 0 ? " and falls unconscious" : ""}.`,
      );
    }
  }
  if (b.enemies.every((e) => e.hp === 0)) {
    win(s);
    return true;
  }
  if (s.party.every((p) => p.hp === 0)) {
    s.battle = null;
    if (b.kind !== "patrol") s.contract = null;
    s.gold = Math.max(0, s.gold - 20);
    s.location = 0;
    s.position = { x: places[0].x, y: places[0].y };
    s.trail = [{ ...s.position }];
    for (const p of s.party) {
      p.hp = 1;
      p.injury = true;
    }
    s.morale = Math.max(0, s.morale - 20);
    note(
      s,
      "Company defeated. Rescuers bring you to Greyhaven; lost 20 crowns.",
    );
  } else {
    b.turn++;
    b.valor = Math.min(5, (b.valor ?? 3) + 1);
    b.units.forEach((u) => {
      u.acted = false;
      u.moved = false;
      u.guard = false;
      u.cooldown = Math.max(0, (u.cooldown || 0) - 1);
    });
  }
  return true;
}

export function restore(raw) {
  const base = fresh();
  if (
    !raw ||
    ![1, 2, 3, 4, 5, 6, 7].includes(raw.version) ||
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
    version: 7,
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
    profession: p.profession || "Cook",
    professionXP: p.professionXP || 0,
    professionXPBy: Object.fromEntries(
      Object.entries(p.professionXPBy || {}).filter(
        ([k, v]) => professions.includes(k) && Number.isFinite(v) && v >= 0,
      ),
    ),
    talent: talentsFor(p).some((t) => t.id === p.talent) ? p.talent : null,
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
    .map((item) => ({ id: item.id, template: item.template }));
  result.nextGearId = result.gear.reduce(
    (max, item) => Math.max(max, item.id + 1),
    1,
  );
  const assigned = new Set();
  for (const p of result.party) {
    const saved = p.equipment;
    p.equipment = { weapon: null, armor: null };
    for (const slot of ["weapon", "armor"]) {
      const item = result.gear.find((item) => item.id === saved?.[slot]);
      const template =
        item &&
        equipmentCatalog.find((template) => template.id === item.template);
      if (
        template &&
        template.slot === slot &&
        (!template.role || template.role === p.role) &&
        !assigned.has(item.id)
      ) {
        p.equipment[slot] = item.id;
        assigned.add(item.id);
      }
    }
  }
  // Old saves retain company progression but return to the map for the new combat rules.
  if (raw.version === 1) result.battle = null;
  if (result.battle) {
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
    (p.injury ? 1 : 0)
  );
}
export function guard(s, id) {
  const u = s.battle?.units.find((u) => u.id === id);
  if (!u || u.acted || s.party[id].hp <= 0) return false;
  u.guard = true;
  u.acted = true;
  s.battle.valor = Math.min(5, (s.battle.valor ?? 3) + 1);
  note(s, `${s.party[id].name} braces: incoming damage reduced this round.`);
  return true;
}
export function train(s, id, kind) {
  const p = s.party[id];
  if (
    !p ||
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
export function recruit(s) {
  if (
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    s.gold < 60 ||
    s.party.length >= 6
  )
    return false;
  const id = s.party.length;
  s.gold -= 60;
  s.party.push({
    id,
    name: id === 4 ? "Tamsin" : "Bram",
    role: id === 4 ? "Archer" : "Shieldbearer",
    max: 26,
    hp: 26,
    damage: 6,
    level: 1,
    xp: 0,
    points: 0,
    injury: false,
    armor: 0,
    weapon: 0,
    profession: id === 4 ? "Herbalist" : "Miner",
    professionXP: 0,
    professionXPBy: {},
    talent: null,
    equipment: { weapon: null, armor: null },
  });
  note(
    s,
    `${s.party[id].name} joins the company. Daily wages increase by 2 crowns.`,
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
    s.battle ||
    s.event ||
    s.inventory.medicine < 1 ||
    (p.hp === p.max && !p.injury)
  )
    return false;
  s.inventory.medicine--;
  p.hp = Math.min(p.max, p.hp + healAmount(s));
  const herbalist = professional(s, "Herbalist");
  if (herbalist) practice(s, herbalist, 1);
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
  if (s.battle || s.event) return false;
  s.food += 6;
  const herbalist = professional(s, "Herbalist");
  if (herbalist) {
    s.inventory.herbs += 1 + professionRank(herbalist);
    practice(s, herbalist, 1);
  }
  s.day++;
  s.morale = Math.max(0, s.morale - 3);
  note(s, "Gathered 6 rations. A day passes.");
  return true;
}
export function resolveEvent(s, choice) {
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
      s.day++;
      note(s, "Waited a day for the storm to pass.");
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
  if (places[s.location]?.type !== "town" || s.battle || s.event) return [];
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
  const offers = {
      food: [15, 10],
      ore: [10, 3],
      herbs: [8, 3],
      wood: [6, 3],
      medicine: [12, 1],
    },
    o = offers[item];
  if (
    !o ||
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    s.gold < (s.research.includes("barter") ? Math.ceil(o[0] * 0.8) : o[0])
  )
    return false;
  const price = s.research.includes("barter") ? Math.ceil(o[0] * 0.8) : o[0];
  if (s.gold < price) return false;
  s.gold -= price;
  if (item === "food") s.food += o[1];
  else s.inventory[item] += o[1];
  note(s, `Bought ${o[1]} ${item} for ${price} crowns.`);
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
  if (s.battle || s.event || !Number.isFinite(x) || !Number.isFinite(y))
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
    const amount = Math.min(budget, length, 160 - s.walked, 12);
    s.position.x += (dx / length) * amount;
    s.position.y += (dy / length) * amount;
    s.walked += amount;
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
    if (s.walked >= 160 - 0.001) {
      const cost = s.research.includes("rations") ? 3 : 4;
      if (s.food < cost) {
        s.walked = 159.999;
        s.destination = null;
        note(s, "Provisions exhausted. Stop to forage before continuing.");
        break;
      }
      s.food -= cost;
      s.walked = 0;
      s.day++;
      s.morale = Math.max(0, s.morale - 2);
      note(s, `A day on the road. Used ${cost} rations.`);
      if (s.day % 3 === 0) {
        s.event = roadEvent(s);
        s.destination = null;
        break;
      }
    }
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
  const radius = s.research.includes("scouting") ? 210 : 140,
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
  ];
}
export function advancePatrols(s, seconds) {
  if (s.battle || s.event || !Number.isFinite(seconds) || seconds <= 0)
    return false;
  for (const p of s.patrols.filter((p) => !p.cleared)) {
    let budget = Math.min(seconds, 5) * (p.kind === "merchant" ? 14 : 20);
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
    price = s.research.includes("barter") ? 10 : 12;
  if (!p || s.battle || s.event || s.gold < price) return false;
  s.gold -= price;
  s.food += 10;
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
  note(
    s,
    `${p.name} takes up ${name}. Previous profession experience is retained.`,
  );
  return true;
}
export function campCost(s) {
  return Math.max(2, 4 - professionBonus(s, "Cook"));
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
  s.day++;
  const yieldAmount = 3 + professionRank(maker) * 2;
  if (type === "mine") s.inventory.ore += yieldAmount;
  else {
    s.inventory.herbs += yieldAmount;
    s.inventory.wood += 2;
  }
  practice(s, maker, 2);
  note(
    s,
    `${maker.name} worked at ${places[s.location].name}: gained ${yieldAmount} ${type === "mine" ? "ore" : "herbs"} for 2 rations and a day.`,
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
export function talentsFor(p) {
  return specializations[p.role] || [];
}
export function learnTalent(s, id, talent) {
  const p = s.party[id],
    t = p && talentsFor(p).find((t) => t.id === talent);
  if (!t || s.battle || s.event || p.talent || p.level < 2 || p.points < 1)
    return false;
  p.points--;
  p.talent = talent;
  note(s, `${p.name} specializes as ${t.name}.`);
  return true;
}
export function attackRange(p, skill = false) {
  return (
    (skill
      ? classSkills[p.role]?.range || 1
      : p.role === "Archer"
        ? 4
        : p.role === "Spearman"
          ? 2
          : 1) + (p.talent === "marksman" ? 1 : 0)
  );
}
export function movementRange(p) {
  return p.talent === "skirmisher" ? 3 : 2;
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
    skill = p && classSkills[p.role],
    enemy = b?.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (
    !b ||
    !u ||
    !p ||
    !skill ||
    p.hp <= 0 ||
    u.acted ||
    u.cooldown > 0 ||
    b.valor < skill.cost ||
    !enemy ||
    Math.abs(x - u.x) + Math.abs(y - u.y) > attackRange(p, true)
  )
    return false;
  b.valor -= skill.cost;
  u.acted = true;
  u.cooldown = skill.cooldown;
  const victims =
    p.role === "Swordswoman"
      ? b.enemies.filter(
          (e) => e.hp > 0 && Math.abs(e.x - x) + Math.abs(e.y - y) <= 1,
        )
      : [enemy];
  victims.forEach((e) => {
    const damage = hitEnemy(s, e, attackPower(s, p) + skill.bonus);
    if (p.role === "Shieldbearer") e.stun = p.talent === "stalwart" ? 2 : 1;
    if (p.talent === "pinning") e.root = 2;
    if (p.talent === "reaver" || p.talent === "bloodletter") e.bleed = 2;
    note(s, `${p.name} uses ${skill.name} for ${damage} damage.`);
  });
  if (b.enemies.every((e) => e.hp === 0)) win(s);
  return true;
}

export function buyGear(s, item, target = 0) {
  const p = s.party[target];
  const offer = { weapon: [35, 2, 4], armor: [30, 1, 3] }[item];
  if (
    !p ||
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

export const salePrices = { ore: 2, wood: 1, herbs: 1, medicine: 4 };
export function sell(s, item, quantity = 1) {
  const price = salePrices[item];
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
  return s.party.length * 6;
}
export function restAtInn(s) {
  const price = innCost(s);
  if (
    s.battle ||
    s.event ||
    places[s.location]?.type !== "town" ||
    s.gold < price
  )
    return false;
  s.destination = null;
  s.gold -= price;
  s.day++;
  s.morale = Math.min(100, s.morale + 15);
  for (const p of s.party) {
    p.hp = p.max;
    p.injury = false;
  }
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
  return template ? { ...template, instanceId: item.id } : null;
}
export function equippedItem(s, p, slot) {
  return gearItem(s, p.equipment?.[slot]);
}
export function gearOwner(s, id) {
  return (
    s.party.find(
      (p) => p.equipment?.weapon === id || p.equipment?.armor === id,
    ) || null
  );
}
export function armorPower(s, p) {
  return (p.armor || 0) + (equippedItem(s, p, "armor")?.bonus || 0);
}
export function grantEquipment(s, templateId) {
  if (!equipmentCatalog.some((item) => item.id === templateId)) return false;
  const item = { id: s.nextGearId++, template: templateId };
  s.gear.push(item);
  return item.id;
}
export function equipEquipment(s, id, target) {
  const item = gearItem(s, id),
    p = s.party[target];
  if (
    !item ||
    !p ||
    s.battle ||
    s.event ||
    (item.role && item.role !== p.role) ||
    p.equipment?.[item.slot] === id
  )
    return false;
  const previous = gearOwner(s, id);
  if (previous) previous.equipment[item.slot] = null;
  p.equipment ||= { weapon: null, armor: null };
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
    !["weapon", "armor"].includes(slot) ||
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
  return s.research.includes("barter")
    ? Math.ceil(item.price * 0.8)
    : item.price;
}
export function buyEquipment(s, templateId) {
  const item = equipmentCatalog.find((item) => item.id === templateId);
  if (
    !item ||
    item.tier > 2 ||
    (item.tier === 2 && s.renown < 5) ||
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
  const price = Math.floor(item.price * 0.4);
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
      (item.slot === "armor" ? 6 : 5) - (smith ? professionRank(smith) : 0),
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
