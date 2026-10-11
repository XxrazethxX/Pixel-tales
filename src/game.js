export const places = [
  { name: "Greyhaven", x: 170, y: 280, type: "town" },
  { name: "Pinewatch", x: 350, y: 145, type: "forest" },
  { name: "Old Barrow", x: 575, y: 235, type: "ruin" },
  { name: "Saltbridge", x: 590, y: 355, type: "town" },
  { name: "Iron Hollow", x: 220, y: 95, type: "mine" },
  { name: "Watchtower", x: 685, y: 95, type: "ruin" },
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
export function fresh() {
  return {
    version: 3,
    inventory: { ore: 0, wood: 0, herbs: 0, medicine: 1 },
    explored: [],
    event: null,
    renown: 0,
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
  if (s.day % 3 === 0)
    s.event = {
      title: "Strangers at the roadside",
      text: "A wounded courier asks for medicine. A merchant offers to buy your silence and leave him behind.",
    };
  return true;
}
export function camp(s) {
  if (s.battle || s.event) return false;
  const wages = s.party.length * 2;
  if (s.food < 4 || s.gold < wages) {
    note(s, "Camp needs 4 rations and 2 crowns per companion for wages.");
    return false;
  }
  s.food -= 4;
  s.gold -= wages;
  s.day++;
  s.morale = Math.min(100, s.morale + 10);
  for (const p of s.party) {
    p.hp = Math.min(p.max, p.hp + (s.research.includes("medicine") ? 18 : 10));
    if (p.hp === p.max) p.injury = false;
  }
  note(s, "Campfires lit. Wages paid, wounds tended, spirits lifted.");
  return true;
}
export function research(s, id) {
  const r = studies.find((r) => r.id === id);
  if (
    !r ||
    s.research.includes(id) ||
    s.knowledge < r.cost ||
    s.battle ||
    s.event
  )
    return false;
  s.knowledge -= r.cost;
  s.research.push(id);
  note(s, `Learned ${r.name}.`);
  return true;
}
export function startBattle(s) {
  if (
    s.battle ||
    s.event ||
    !s.contract ||
    s.contract.kind === "delivery" ||
    s.location !== s.contract.target ||
    !s.party.some((p) => p.hp > 0)
  )
    return false;
  s.battle = {
    turn: 1,
    units: s.party
      .filter((p) => p.hp > 0)
      .map((p, i) => ({
        id: p.id,
        x: 1,
        y: i + 1,
        acted: false,
        moved: false,
        guard: false,
      })),
    enemies: [
      { id: 0, x: 7, y: 1, hp: 16, max: 16 },
      { id: 1, x: 6, y: 3, hp: 20, max: 20 },
      { id: 2, x: 7, y: 5, hp: 16, max: 16 },
    ],
  };
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
    if (d > (p.role === "Archer" ? 4 : p.role === "Spearman" ? 2 : 1))
      return false;
    e.hp = Math.max(0, e.hp - attackPower(s, p));
    note(s, `${p.name} strikes for ${attackPower(s, p)} damage.`);
    u.acted = true;
  } else {
    if (
      u.moved ||
      d > 2 ||
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
  const reward = s.contract.reward;
  s.gold += reward;
  s.knowledge += 2;
  s.completed++;
  s.renown += 5;
  s.inventory.ore += 2;
  s.inventory.wood += 2;
  for (const p of s.party.filter((p) => p.hp > 0)) {
    p.xp += 35;
    while (p.xp >= p.level * 30) {
      p.xp -= p.level * 30;
      p.level++;
      p.points++;
    }
  }
  note(
    s,
    `Contract fulfilled. Earned ${reward} crowns, 2 knowledge, and 35 XP per survivor.`,
  );
  s.contract = null;
  s.battle = null;
}
export function endTurn(s) {
  const b = s.battle;
  if (!b) return false;
  for (const e of b.enemies.filter((e) => e.hp > 0)) {
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
    const dist = () => Math.abs(t.x - e.x) + Math.abs(t.y - e.y);
    if (dist() > 1) {
      const options = [
        [e.x + Math.sign(t.x - e.x), e.y],
        [e.x, e.y + Math.sign(t.y - e.y)],
      ].filter(
        ([x, y]) =>
          x >= 0 &&
          x <= 8 &&
          y >= 0 &&
          y <= 6 &&
          (x !== e.x || y !== e.y) &&
          !b.units.some(
            (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
          ) &&
          !b.enemies.some((v) => v.hp > 0 && v !== e && v.x === x && v.y === y),
      );
      if (options.length) [e.x, e.y] = options[0];
    }
    if (dist() === 1) {
      const p = s.party[t.id];
      p.hp = Math.max(
        0,
        p.hp -
          Math.max(
            1,
            (p.role === "Shieldbearer" ? 3 : 5) -
              (p.armor || 0) -
              (t.guard ? 2 : 0),
          ),
      );
      p.injury = p.hp < p.max / 2;
      note(
        s,
        `${p.name} takes a hit${p.hp === 0 ? " and falls unconscious" : ""}.`,
      );
    }
  }
  if (s.party.every((p) => p.hp === 0)) {
    s.battle = null;
    s.contract = null;
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
    b.units.forEach((u) => {
      u.acted = false;
      u.moved = false;
      u.guard = false;
    });
  }
  return true;
}

export function restore(raw) {
  const base = fresh();
  if (
    !raw ||
    ![1, 2, 3].includes(raw.version) ||
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
    version: 3,
    inventory: { ...base.inventory, ...raw.inventory },
    explored: raw.explored || [],
    event: raw.event || null,
  };
  const validPosition =
    raw.position &&
    Number.isFinite(raw.position.x) &&
    Number.isFinite(raw.position.y) &&
    raw.position.x >= 12 &&
    raw.position.x <= 756 &&
    raw.position.y >= 18 &&
    raw.position.y <= 414;
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
  result.party = result.party.map((p, id) => ({
    ...base.party[0],
    ...p,
    id,
    armor: p.armor || 0,
    weapon: p.weapon || 0,
    profession: p.profession || "Cook",
    professionXP: p.professionXP || 0,
  }));
  // Old saves retain company progression but return to the map for the new combat rules.
  if (raw.version === 1) result.battle = null;
  return result;
}
export function attackPower(s, p) {
  return (
    p.damage +
    (p.weapon || 0) +
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
  note(s, `${s.party[id].name} braces: incoming damage reduced this round.`);
  return true;
}
export function train(s, id, kind) {
  const p = s.party[id];
  if (
    !p ||
    s.battle ||
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
    p = s.party[target];
  if (
    !r ||
    !p ||
    s.battle ||
    s.event ||
    !s.party.some((p) => p.profession === "Smith") ||
    Object.entries({ ore: r.ore, wood: r.wood, herbs: r.herbs || 0 }).some(
      ([k, v]) => s.inventory[k] < v,
    ) ||
    (id === "blade" && p.weapon >= 4) ||
    (id === "armor" && p.armor >= 3)
  )
    return false;
  for (const k of ["ore", "wood", "herbs"]) s.inventory[k] -= r[k] || 0;
  if (id === "blade") p.weapon += 2;
  if (id === "armor") p.armor++;
  if (id === "medicine") s.inventory.medicine++;
  if (id === "meal") s.food += 8;
  s.party.find((p) => p.profession === "Smith").professionXP++;
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
  p.hp = Math.min(p.max, p.hp + 15);
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
  s.inventory.ore += type === "mine" ? 6 : 2;
  s.inventory.wood += type === "forest" ? 5 : 1;
  s.inventory.herbs += type === "forest" ? 4 : 1;
  for (const p of s.party)
    if (p.profession === (type === "mine" ? "Miner" : "Herbalist"))
      p.professionXP++;
  note(
    s,
    `Explored ${places[s.location].name}. Discovered knowledge and gathered crafting materials.`,
  );
  return true;
}
export function forage(s) {
  if (s.battle || s.event) return false;
  s.food += 6;
  s.day++;
  s.morale = Math.max(0, s.morale - 3);
  note(s, "Gathered 6 rations. A day passes.");
  return true;
}
export function resolveEvent(s, choice) {
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
export function contracts(s) {
  return [
    { name: "Wolves in human clothing", target: 1, reward: 65, kind: "battle" },
    { name: "The barrow road", target: 2, reward: 85, kind: "battle" },
    {
      name: "Supplies for Saltbridge",
      target: 3,
      reward: 45,
      kind: "delivery",
    },
    { name: "Silence the watchtower", target: 5, reward: 100, kind: "battle" },
  ];
}
export function accept(s, index) {
  const c = contracts(s)[index];
  if (
    !c ||
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
    s.gold < o[0]
  )
    return false;
  s.gold -= o[0];
  if (item === "food") s.food += o[1];
  else s.inventory[item] += o[1];
  note(s, `Bought ${o[1]} ${item} for ${o[0]} crowns.`);
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
    x: Math.max(12, Math.min(756, x)),
    y: Math.max(18, Math.min(414, y)),
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
  if (p.y < 110 && p.x < 370) return "highlands";
  if (p.x > 275 && p.x < 395 && p.y < 230) return "forest";
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
    const amount = Math.min(budget, length, 160 - s.walked);
    s.position.x += (dx / length) * amount;
    s.position.y += (dy / length) * amount;
    s.walked += amount;
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
        s.event = {
          title: "Strangers in the wilderness",
          text: "A wounded courier asks for medicine. A merchant offers to buy your silence and leave him behind.",
        };
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
