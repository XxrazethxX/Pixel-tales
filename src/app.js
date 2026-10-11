import {
  campCost,
  healAmount,
  craftPlan,
  professional,
  professionRank,
  rankNames,
  professions,
  assignProfession,
  talentsFor,
  learnTalent,
  classSkills,
  useSkill,
  attackRange,
  movementRange,
  workSite,
  WORLD,
  advancePatrols,
  nearbyPatrols,
  tradeCaravan,
  discoverNearby,
  fresh,
  restore,
  places,
  studies,
  note,
  moveTo,
  stopMovement,
  advanceMovement,
  partyPositions,
  terrainAt,
  camp,
  research,
  startBattle,
  act,
  endTurn,
  guard,
  attackPower,
  train,
  recruit,
  recipes,
  craft,
  heal,
  explore,
  forage,
  resolveEvent,
  contracts,
  accept,
  deliver,
  buy,
} from "./game.js";
let s = fresh();
try {
  s = restore(JSON.parse(localStorage.getItem("pixel-tales")));
} catch {}
let drawerOpen = false,
  abilityMode = false;
let tab = "Company",
  selected = 0,
  craftTarget = 0;
const $ = (id) => document.getElementById(id),
  canvas = $("map"),
  ctx = canvas.getContext("2d");
function button(text, fn, disabled = false, primary = false) {
  const b = document.createElement("button");
  b.textContent = text;
  b.disabled = disabled;
  b.className = primary ? "primary" : "";
  b.onclick = () => {
    if (s.destination) stopMovement(s);
    fn();
    render();
  };
  return b;
}
function card(title, body) {
  const d = document.createElement("div");
  d.className = "card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  d.append(heading);
  const content = document.createElement("div");
  content.innerHTML = body;
  d.append(content);
  return d;
}
function objective() {
  if (s.event)
    return "A roadside encounter awaits your decision. Choose how to respond below.";
  if (s.battle) {
    const p = s.party[selected],
      u = s.battle.units.find((u) => u.id === selected);
    if (abilityMode)
      return `${classSkills[p.role].name} armed: click an outlined enemy within ${attackRange(p, true)} tiles. ${classSkills[p.role].desc} Costs ${classSkills[p.role].cost} valor.`;
    return `Valor ${s.battle.valor}/5 · Round ${s.battle.turn} · ${p.name}: ${u?.moved ? "movement used" : `move up to ${movementRange(p)} tiles`} · ${u?.acted ? "action used" : "attack or brace"}. Move and attack in the same round. Bows reach 4 tiles; spears 2; other weapons 1.`;
  }
  if (s.contract)
    return `Active: ${s.contract.name}. ${s.location === s.contract.target ? "Use the gold button below to complete your objective." : `Travel to ${places[s.contract.target].name} by clicking any point on the map.`}`;
  return s.destination
    ? "Walking · click or tap anywhere to change direction. Companions follow your route."
    : "Click or tap anywhere to walk. Visit towns for contracts and trade, or venture into the wilderness.";
}
function render() {
  document.body.classList.toggle("drawer-open", drawerOpen);
  document.body.classList.toggle("encounter", !!s.event);
  document.body.classList.toggle("in-battle", !!s.battle);
  $("drawer").hidden = !drawerOpen;
  $("journal").hidden = tab !== "Journal";
  $("panel").hidden = tab === "Journal";
  if (
    s.battle &&
    !s.battle.units.some((u) => u.id === selected && s.party[u.id].hp > 0)
  )
    selected = s.battle.units.find((u) => s.party[u.id].hp > 0)?.id || 0;
  try {
    localStorage.setItem("pixel-tales", JSON.stringify(s));
    $("save-status").textContent = "Progress saved locally";
  } catch {
    $("save-status").textContent =
      "Storage unavailable · progress is temporary";
  }
  $("resources").innerHTML =
    `<span>◈ ${s.gold} crowns</span><span>▧ ${s.food} rations</span><span>✦ ${s.knowledge} knowledge</span><span>☀ Day ${s.day}</span>${s.battle ? `<span>◆ Valor ${s.battle.valor}/5</span>` : ""}`;
  if (!s.battle || s.battle.units.find((u) => u.id === selected)?.acted)
    abilityMode = false;
  $("objective").textContent = objective();
  $("tabs").replaceChildren(
    ...["Company", "Contracts", "Research", "Workshop", "Town", "Journal"].map(
      (t) => {
        const b = button(t, () => {
          drawerOpen = tab === t ? !drawerOpen : true;
          tab = t;
        });
        b.classList.toggle("active", drawerOpen && tab === t);
        return b;
      },
    ),
  );
  const panel = $("panel");
  panel.replaceChildren();
  if (tab === "Company") {
    panel.append(
      card(
        "The Ashen Company",
        `<div class="row"><span class="hint">${s.completed} contracts · ${s.skirmishes} skirmishes · ${s.renown} renown</span><span class="badge">Morale ${s.morale}%</span></div><div class="bar"><i style="width:${s.morale}%"></i></div><p>Map: ${s.discovered.length}/${places.length} locations discovered.</p><p>Wages: ${s.party.length * 2} crowns per camp. At 85 morale, all attacks gain +1 damage. Injuries reduce attack by 1. Skilled cooks reduce camp supplies to ${campCost(s)} rations.</p>`,
      ),
    );
    s.party.forEach((p) => {
      const c = card(
        `${p.name} · Level ${p.level}`,
        `<p>${p.role} · ${rankNames[professionRank(p)]} ${p.profession} (${p.professionXP} practice${professionRank(p) < 3 ? ` / ${[3, 8, 15][professionRank(p)]} for next rank` : " · mastered"}) ${p.injury ? "· INJURED" : ""}</p><div class="row"><span class="hint">HP ${p.hp}/${p.max}</span><span class="hint">ATK ${attackPower(s, p)} · Armor ${p.armor}</span></div><div class="bar"><i style="width:${(p.hp / p.max) * 100}%"></i></div><p>XP ${p.xp}/${p.level * 30} · ${p.points} training points</p>`,
      );
      if (p.points)
        c.append(
          button(
            "Strength +1",
            () => train(s, p.id, "strength"),
            !!s.battle || !!s.event,
          ),
          button(
            "Vitality +5 HP",
            () => train(s, p.id, "vitality"),
            !!s.battle || !!s.event,
          ),
        );
      if (p.hp < p.max || p.injury)
        c.append(
          button(
            `Use medicine · heal ${healAmount(s)}`,
            () => heal(s, p.id),
            s.inventory.medicine < 1 || !!s.battle || !!s.event,
          ),
        );
      const professionSelect = document.createElement("select");
      professionSelect.setAttribute("aria-label", `Profession for ${p.name}`);
      professions.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.selected = name === p.profession;
        professionSelect.append(option);
      });
      professionSelect.disabled = !!s.battle || !!s.event;
      professionSelect.onchange = () => {
        stopMovement(s);
        assignProfession(s, p.id, professionSelect.value);
        render();
      };
      c.append(professionSelect);
      const progression = document.createElement("details"),
        summary = document.createElement("summary");
      summary.textContent = "Class abilities & specialization";
      progression.append(summary);
      progression.open = p.points > 0 && !p.talent;
      const ability = document.createElement("p");
      ability.className = "hint";
      ability.textContent = `${classSkills[p.role].name} · ${classSkills[p.role].cost} valor · ${classSkills[p.role].desc}`;
      progression.append(ability);
      const hint = document.createElement("p");
      hint.className = "hint";
      hint.textContent =
        "Choose one permanent specialization at level 2 for one training point. Uses the same points as strength and vitality.";
      progression.append(hint);
      talentsFor(p).forEach((t) => {
        const text = document.createElement("p");
        text.className = "hint";
        text.textContent = `${t.name}: ${t.desc}`;
        progression.append(
          text,
          button(
            p.talent === t.id
              ? `${t.name} learned`
              : `Learn ${t.name} · 1 point`,
            () => learnTalent(s, p.id, t.id),
            !!p.talent ||
              p.level < 2 ||
              p.points < 1 ||
              !!s.battle ||
              !!s.event,
          ),
        );
      });
      c.append(progression);
      panel.append(c);
    });
  }
  if (tab === "Contracts") {
    panel.append(
      card(
        "The contract board",
        "<p>Town contracts fund your company. Combat rewards gear materials and character experience; deliveries provide a safer way to earn knowledge.</p>",
      ),
    );
    if (s.contract)
      panel.append(
        card(
          s.contract.name,
          `<p>Destination: ${places[s.contract.target].name}</p><p>Reward: ${s.contract.reward} crowns</p><span class="badge">ACTIVE · ${s.contract.kind === "delivery" ? "Deliver 5 rations" : "Defeat three raiders"}</span>`,
        ),
      );
    else
      contracts(s).forEach((c, i) => {
        const el = card(
          c.name,
          `<p>${c.kind === "delivery" ? "Deliver 5 rations" : "Disperse three armed raiders"} at ${places[c.target].name}.</p><p>${c.reward} crowns · ${c.kind === "delivery" ? "1 knowledge" : "2 knowledge + XP + salvage"}</p>`,
        );
        el.append(
          button(
            "Accept contract",
            () => accept(s, i),
            !!s.battle || !!s.event || places[s.location]?.type !== "town",
            true,
          ),
        );
        panel.append(el);
      });
  }
  if (tab === "Research") {
    panel.append(
      card(
        "Knowledge of the road",
        "<p>Complete contracts and explore sites to gain knowledge. Discoveries permanently improve your company.</p>",
      ),
    );
    studies.forEach((r) => {
      const done = s.research.includes(r.id),
        el = card(
          r.name,
          `<p>${r.desc}</p><span class="badge">${r.cost} knowledge</span>`,
        );
      el.append(
        button(
          done ? "Discovered" : "Research",
          () => research(s, r.id),
          done ||
            s.knowledge < r.cost ||
            (r.requires && !s.research.includes(r.requires)) ||
            !!s.battle ||
            !!s.event,
        ),
      );
      panel.append(el);
    });
  }
  if (tab === "Workshop") {
    panel.append(
      card(
        "Company stores",
        `<p>Ore ${s.inventory.ore} · Wood ${s.inventory.wood} · Herbs ${s.inventory.herbs} · Medicine ${s.inventory.medicine}</p><p>Explore sites or buy materials in towns. Equipment is applied directly to your selected companion. Weapon upgrades cap at +4; armor caps at 3.</p>`,
      ),
    );
    const target = card("Equip a companion", "");
    s.party.forEach((p) =>
      target.append(
        button(p.name, () => (craftTarget = p.id), false, craftTarget === p.id),
      ),
    );
    panel.append(target);
    recipes.forEach((r) => {
      const p = s.party[craftTarget],
        plan = craftPlan(s, r.id),
        el = card(
          r.name,
          `<p>${r.id === "meal" ? `Gain ${8 + (plan.maker ? professionRank(plan.maker) : 0) * 2} rations` : r.id === "medicine" ? `Creates ${1 + Math.floor((plan.maker ? professionRank(plan.maker) : 0) / 2)} medicine; each heals ${healAmount(s)} HP and cures injury` : r.desc}${["blade", "armor"].includes(r.id) ? ` · ${p.name}` : ""}</p><p>Costs: ${plan.cost.ore} ore · ${plan.cost.wood} wood · ${plan.cost.herbs} herbs</p><p>${plan.maker ? `${rankNames[professionRank(plan.maker)]} ${plan.profession} ${plan.maker.name}` : `Requires a conscious ${plan.profession}`} · Higher ranks improve efficiency.</p>`,
        );
      el.append(
        button(
          "Craft",
          () => craft(s, r.id, craftTarget),
          !!s.battle ||
            !!s.event ||
            !plan.maker ||
            s.inventory.ore < plan.cost.ore ||
            s.inventory.wood < plan.cost.wood ||
            s.inventory.herbs < plan.cost.herbs ||
            (r.id === "blade" && p.weapon >= 4) ||
            (r.id === "armor" && p.armor >= 3),
        ),
      );
      panel.append(el);
    });
  }
  if (tab === "Town") {
    if (places[s.location]?.type !== "town")
      panel.append(
        card(
          "Far from home",
          "<p>Travel to Greyhaven, Saltbridge, or Emberfall for the market and recruitment.</p>",
        ),
      );
    else {
      panel.append(
        card(
          places[s.location].name,
          "<p>Trade with the quartermaster, hire companions, and prepare for the road.</p>",
        ),
      );
      const market = card("Quartermaster", "");
      [
        ["food", "10 rations", 15],
        ["ore", "3 ore", 10],
        ["wood", "3 wood", 6],
        ["herbs", "3 herbs", 8],
        ["medicine", "1 medicine", 12],
      ].forEach(([id, label, cost]) =>
        market.append(
          button(
            `${label} · ${s.research.includes("barter") ? Math.ceil(cost * 0.8) : cost} crowns`,
            () => buy(s, id),
            s.gold <
              (s.research.includes("barter") ? Math.ceil(cost * 0.8) : cost) ||
              !!s.event ||
              !!s.battle,
          ),
        ),
      );
      panel.append(market);
      const inn = card(
        "The Crooked Lantern",
        `<p>${s.party.length < 6 ? (s.party.length === 4 ? "Tamsin, an archer and herbalist" : "Bram, a shieldbearer and miner") + " is looking for work." : "Your company is full."}</p><p>Recruitment: 60 crowns · +2 wages per camp · Capacity 6</p>`,
      );
      inn.append(
        button(
          "Recruit companion",
          () => recruit(s),
          s.gold < 60 || s.party.length >= 6 || !!s.battle || !!s.event,
        ),
      );
      panel.append(inn);
    }
  }
  const a = $("actions");
  a.replaceChildren();
  if (s.event) {
    const c = card(s.event.title, `<p>${s.event.text}</p>`);
    c.id = "event";
    if (s.event.kind === "camp")
      c.append(
        button(
          "Search · 2 rations",
          () => resolveEvent(s, "search"),
          s.food < 2,
          true,
        ),
        button("Walk away", () => resolveEvent(s, "leave")),
      );
    else if (s.event.kind === "storm")
      c.append(
        button(
          "Take shelter · 1 day",
          () => resolveEvent(s, "shelter"),
          false,
          true,
        ),
        button("Press on · lose health & morale", () =>
          resolveEvent(s, "push"),
        ),
      );
    else {
      c.append(
        button(
          "Help · 1 medicine",
          () => resolveEvent(s, "help"),
          s.inventory.medicine < 1,
          true,
        ),
        button("Take 12 crowns · −8 morale", () => resolveEvent(s, "trade")),
        button("Walk away", () => resolveEvent(s, "leave")),
      );
    }
    a.append(c);
  } else if (s.battle) {
    a.append(
      button(
        `End round ${s.battle.turn}`,
        () => {
          abilityMode = false;
          endTurn(s);
        },
        false,
        true,
      ),
      button(
        "Brace · reduce damage",
        () => guard(s, selected),
        s.battle.units.find((u) => u.id === selected)?.acted,
      ),
      button("Retreat · lose 15 crowns", () => {
        s.gold = Math.max(0, s.gold - 15);
        s.battle = null;
        s.morale = Math.max(0, s.morale - 10);
        note(s, "Retreated. The company lives to fight another day.");
      }),
    );
    const actor = s.party[selected],
      unit = s.battle.units.find((u) => u.id === selected),
      skill = classSkills[actor.role];
    a.append(
      button(
        `${skill.name} · ${skill.cost} valor${unit.cooldown ? ` · cooldown ${unit.cooldown}` : ""}`,
        () => (abilityMode = !abilityMode),
        unit.acted || unit.cooldown > 0 || s.battle.valor < skill.cost,
        abilityMode,
      ),
    );
    if (abilityMode)
      a.append(button("Basic attack", () => (abilityMode = false)));
    s.battle.units.forEach((u) => {
      const p = s.party[u.id];
      a.append(
        button(
          `${p.name}${u.acted ? " ✓" : ""}`,
          () => {
            selected = u.id;
            abilityMode = false;
          },
          p.hp <= 0,
          selected === u.id,
        ),
      );
    });
    $("map-label").textContent =
      "Select ally · click tile to move / enemy to attack";
  } else {
    a.append(
      button(
        `Camp · ${campCost(s)} rations / ${s.party.length * 2} crowns`,
        () => camp(s),
        s.food < campCost(s) || s.gold < s.party.length * 2,
      ),
      button("Forage · +6 rations / 1 day", () => forage(s)),
    );
    if (places[s.location]?.type === "town")
      a.append(
        button(`Enter ${places[s.location].name}`, () => {
          drawerOpen = true;
          tab = "Town";
        }),
        button("Contract board", () => {
          drawerOpen = true;
          tab = "Contracts";
        }),
      );
    if (s.location >= 0 && places[s.location]?.type !== "town")
      a.append(
        button(
          s.explored.includes(s.location)
            ? "Site explored"
            : "Explore · knowledge & materials",
          () => explore(s),
          s.explored.includes(s.location),
        ),
      );
    if (["forest", "mine"].includes(places[s.location]?.type))
      a.append(
        button(
          places[s.location].type === "mine"
            ? "Work mine · 2 rations / 1 day"
            : "Gather herbs · 2 rations / 1 day",
          () => workSite(s),
          s.food < 2 ||
            !professional(
              s,
              places[s.location].type === "mine" ? "Miner" : "Herbalist",
            ),
        ),
      );
    if (s.contract?.target === s.location)
      a.append(
        button(
          s.contract.kind === "delivery"
            ? "Deliver 5 rations"
            : "Engage raiders",
          () => (s.contract.kind === "delivery" ? deliver(s) : startBattle(s)),
          s.contract.kind === "delivery" && s.food < 5,
          true,
        ),
      );
    nearbyPatrols(s).forEach((p) =>
      a.append(
        button(
          p.kind === "merchant"
            ? `Trade · 10 rations / ${s.research.includes("barter") ? 10 : 12} crowns`
            : `Confront ${p.name}`,
          () =>
            p.kind === "merchant"
              ? tradeCaravan(s, p.id)
              : startBattle(s, p.id),
          p.kind === "merchant" &&
            s.gold < (s.research.includes("barter") ? 10 : 12),
          p.kind === "bandits",
        ),
      ),
    );
    if (s.destination)
      a.prepend(button("Stop walking", () => stopMovement(s), false, true));
    $("map-label").textContent =
      `${places[s.location]?.name || terrainAt(s.position).toUpperCase()} · ${Math.round(s.position.x)}, ${Math.round(s.position.y)}`;
  }
  $("log").replaceChildren(
    ...s.log.slice(0, 6).map((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      return p;
    }),
  );
  draw();
}
function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function tree(x, y) {
  rect(x + 5, y + 14, 4, 12, "#594d35");
  rect(x, y + 6, 15, 12, "#2c4433");
  rect(x + 3, y, 9, 12, "#37523c");
}
function person(x, y, c, step = 0, role = "") {
  rect(x - 8, y + 15, 18, 4, "#364b35");
  rect(x - 5, y - 11, 10, 9, "#c4aa78");
  rect(x - 7, y - 2, 14, 13, c);
  rect(x - 6, y + 11 + step, 4, 6, "#202729");
  rect(x + 2, y + 11 - step, 4, 6, "#202729");
  if (role === "Shieldbearer") rect(x - 11, y, 5, 12, "#a0a09a");
  if (role === "Spearman") rect(x + 10, y - 17, 2, 29, "#c5bb89");
  if (role === "Archer") {
    rect(x + 9, y - 4, 2, 14, "#bd9560");
    rect(x + 11, y - 1, 2, 8, "#bd9560");
  }
  rect(x - 5, y - 13, 10, 4, "#4c4639");
}
const view = { x: 0, y: 0, scale: 1 };
function draw() {
  const bounds = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(bounds.width)),
    h = Math.max(1, Math.round(bounds.height));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#25362a";
  ctx.fillRect(0, 0, w, h);
  view.scale = s.battle
    ? Math.min(w / 768, h / 432)
    : Math.max(w / 768, Math.max(160, h - 180) / 432);
  view.x = s.battle
    ? (768 - w / view.scale) / 2
    : Math.max(
        0,
        Math.min(
          WORLD.width - w / view.scale,
          s.position.x - w / view.scale / 2,
        ),
      );
  view.y = s.battle
    ? (432 - h / view.scale) / 2
    : Math.max(
        0,
        Math.min(
          WORLD.height - (h - 180) / view.scale,
          s.position.y - (h - 180) / view.scale / 2,
        ),
      );
  canvas.dataset.viewX = view.x;
  canvas.dataset.viewY = view.y;
  canvas.dataset.scale = view.scale;
  ctx.setTransform(
    view.scale,
    0,
    0,
    view.scale,
    -view.x * view.scale,
    -view.y * view.scale,
  );
  rect(-768, -432, WORLD.width + 1536, WORLD.height + 864, "#657454");
  for (let i = 0; i < 1800; i++) {
    const x = (i * 137 + 31) % WORLD.width,
      y = (i * 83 + 17) % WORLD.height;
    rect(x, y, 2, 2, i % 2 ? "#73805a" : "#596e4c");
  }
  if (s.battle) {
    rect(0, 0, 768, 432, "#3b4937");
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 9; x++)
        rect(105 + x * 62, y * 60, 60, 58, (x + y) % 2 ? "#526044" : "#59664a");
    const active = s.battle.units.find((u) => u.id === selected);
    if (active && !active.acted) {
      const p = s.party[selected],
        range = attackRange(p, abilityMode);
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 9; x++) {
          const distance = Math.abs(active.x - x) + Math.abs(active.y - y),
            enemy = s.battle.enemies.some(
              (e) => e.hp > 0 && e.x === x && e.y === y,
            ),
            occupied = s.battle.units.some(
              (u) => s.party[u.id].hp > 0 && u.x === x && u.y === y,
            );
          if (
            (enemy && distance <= range) ||
            (!abilityMode &&
              !active.moved &&
              !enemy &&
              !occupied &&
              distance > 0 &&
              distance <= movementRange(p))
          ) {
            ctx.strokeStyle = enemy
              ? abilityMode
                ? "#e8c87e"
                : "#d9a07e"
              : "#a3b578";
            ctx.lineWidth = 2;
            ctx.strokeRect(109 + x * 62, 4 + y * 60, 51, 49);
          }
        }
    }
    s.battle.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        person(
          136 + e.x * 62,
          28 + e.y * 60,
          e.kind === "archer"
            ? "#9b784e"
            : e.kind === "brute"
              ? "#765c63"
              : "#8f5143",
          0,
          e.kind === "archer"
            ? "Archer"
            : e.kind === "brute"
              ? "Shieldbearer"
              : "",
        );
        ctx.fillStyle = "#e5d8bb";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `${e.kind || "raider"}${e.stun ? " STUN" : ""}${e.root ? " ROOT" : ""}${e.bleed ? " BLEED" : ""}`,
          136 + e.x * 62,
          12 + e.y * 60,
        );
        rect(118 + e.x * 62, 50 + e.y * 60, (36 * e.hp) / e.max, 3, "#b97560");
      });
    s.battle.units
      .filter((u) => s.party[u.id].hp > 0)
      .forEach((u) => {
        if (selected === u.id) {
          ctx.strokeStyle = "#dfc588";
          ctx.strokeRect(108 + u.x * 62, 3 + u.y * 60, 54, 52);
        }
        person(136 + u.x * 62, 28 + u.y * 60, u.acted ? "#69746a" : "#bca168");
        rect(
          118 + u.x * 62,
          50 + u.y * 60,
          (36 * s.party[u.id].hp) / s.party[u.id].max,
          3,
          "#a2b477",
        );
      });
    return;
  }
  ctx.strokeStyle = "#456775";
  ctx.lineWidth = 24;
  ctx.beginPath();
  for (let y = 0; y <= WORLD.height; y += 4) {
    const x = 475 + Math.sin(y / 65) * 38;
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 260; i++) {
    let x = (i * 71 + 50) % (WORLD.width - 28),
      y = (i * 43 + 25) % (WORLD.height - 52);
    if (places.every((p) => Math.hypot(p.x - x, p.y - y) > 48)) tree(x, y);
  }
  for (let i = 0; i < 12; i++) {
    const x = 40 + i * 29,
      y = 35 + (i % 3) * 14;
    rect(x, y, 24, 26, "#596452");
    rect(x + 5, y - 8, 14, 12, "#7a8269");
  }
  const cols = Math.ceil(WORLD.width / 64),
    charted = new Set(s.charted);
  for (let row = 0; row < Math.ceil(WORLD.height / 64); row++)
    for (let col = 0; col < cols; col++)
      if (!charted.has(row * cols + col))
        rect(col * 64, row * 64, 64, 64, "#142c28b8");
  places.forEach((p, i) => {
    if (!s.discovered.includes(i) && s.contract?.target !== i) return;
    if (p.type === "town") {
      rect(p.x - 17, p.y - 14, 34, 28, "#baad7e");
      rect(p.x - 21, p.y - 22, 42, 12, "#704b39");
      rect(p.x - 4, p.y + 1, 8, 13, "#3e4030");
    } else if (p.type === "ruin") {
      rect(p.x - 18, p.y - 17, 10, 32, "#92937a");
      rect(p.x + 8, p.y - 17, 10, 32, "#92937a");
      rect(p.x - 18, p.y - 20, 36, 8, "#a0a184");
    } else if (p.type === "mine") {
      rect(p.x - 20, p.y - 18, 40, 32, "#7d806a");
      rect(p.x - 9, p.y - 5, 18, 20, "#27352c");
      rect(p.x - 23, p.y + 12, 46, 4, "#a19a77");
    } else if (p.type === "cache") {
      rect(p.x - 12, p.y - 7, 24, 16, "#9e7850");
      rect(p.x - 12, p.y - 9, 24, 5, "#c4ac74");
      rect(p.x - 2, p.y - 6, 4, 8, "#d2bd7e");
    } else tree(p.x - 7, p.y - 16);
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#16251b";
    ctx.fillText(p.name, p.x, p.y + 35);
    if (s.contract?.target === i) {
      ctx.fillStyle = "#f4d484";
      ctx.fillText("⚑ CONTRACT", p.x, p.y - 35);
    }
  });
  s.patrols
    .filter(
      (p) =>
        !p.cleared &&
        Math.hypot(p.x - s.position.x, p.y - s.position.y) <
          (s.research.includes("scouting") ? 210 : 140),
    )
    .forEach((p) => {
      const color = p.kind === "bandits" ? "#a85f49" : "#d3b46e";
      person(
        p.x - 17,
        p.y - 8,
        color,
        Math.sin(performance.now() / 150) > 0 ? 1 : -1,
      );
      person(
        p.x,
        p.y,
        color,
        Math.sin(performance.now() / 150) > 0 ? -1 : 1,
        p.kind === "bandits" ? "Spearman" : "",
      );
      ctx.font = "10px monospace";
      ctx.fillStyle = p.kind === "bandits" ? "#f6b39b" : "#f4dc91";
      ctx.textAlign = "center";
      ctx.fillText(p.name, p.x, p.y - 30);
    });
  drawAtlas();
  if (s.destination) {
    const goal = s.destination;
    ctx.strokeStyle = "#e2cd8e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, 9, 0, Math.PI * 2);
    ctx.stroke();
    rect(goal.x - 1, goal.y - 14, 2, 6, "#e2cd8e");
    rect(goal.x - 1, goal.y + 9, 2, 6, "#e2cd8e");
  }
  const colors = [
    "#e0c47f",
    "#8e9b98",
    "#8ca46e",
    "#ab8265",
    "#9d88ac",
    "#b6aa8a",
  ];
  partyPositions(s)
    .map((point, i) => ({ ...point, i }))
    .sort((a, b) => a.y - b.y)
    .forEach((p) => {
      const step = s.destination
        ? Math.sin(performance.now() / 100 + p.i * 1.7) > 0
          ? 2
          : -2
        : 0;
      person(p.x, p.y, colors[p.i], step, s.party[p.i].role);
    });
}
canvas.onclick = (e) => {
  const r = canvas.getBoundingClientRect(),
    x = view.x + (e.clientX - r.left) / view.scale,
    y = view.y + (e.clientY - r.top) / view.scale;
  if (s.battle) {
    const tx = Math.floor((x - 105) / 62),
      ty = Math.floor(y / 60),
      ally = s.battle.units.find(
        (u) => u.x === tx && u.y === ty && s.party[u.id].hp > 0,
      );
    if (ally) {
      selected = ally.id;
      abilityMode = false;
    } else {
      const success = abilityMode
        ? useSkill(s, selected, tx, ty)
        : act(s, selected, tx, ty);
      if (!success)
        note(
          s,
          "No action: check range, remaining action, cooldown, and valor.",
        );
    }
  } else {
    heldKeys.clear();
    moveTo(s, x, y);
    drawerOpen = false;
  }
  render();
};
$("reset").onclick = () => {
  if (
    confirm("Start a new company? Your current local save will be replaced.")
  ) {
    s = fresh();
    selected = 0;
    render();
  }
};
render();

$("close-drawer").onclick = () => {
  drawerOpen = false;
  render();
};
const heldKeys = new Set();
let previousFrame = 0,
  lastSave = 0;
function animate(time) {
  if (heldKeys.size && !s.battle && !s.event && !drawerOpen) {
    const x =
      (heldKeys.has("d") || heldKeys.has("ArrowRight") ? 1 : 0) -
      (heldKeys.has("a") || heldKeys.has("ArrowLeft") ? 1 : 0);
    const y =
      (heldKeys.has("s") || heldKeys.has("ArrowDown") ? 1 : 0) -
      (heldKeys.has("w") || heldKeys.has("ArrowUp") ? 1 : 0);
    if (x || y) moveTo(s, s.position.x + x * 100, s.position.y + y * 100);
  }
  const seconds = previousFrame
    ? Math.min((time - previousFrame) / 1000, 0.1)
    : 0;
  previousFrame = time;
  if (s.destination) {
    const before = {
      day: s.day,
      location: s.location,
      moving: !!s.destination,
      discovered: s.discovered.length,
    };
    advanceMovement(s, seconds);
    if (
      before.day !== s.day ||
      before.location !== s.location ||
      before.discovered !== s.discovered.length ||
      !s.destination
    )
      render();
    else {
      draw();
      $("map-label").textContent =
        `${places[s.location]?.name || terrainAt(s.position).toUpperCase()} · ${Math.round(s.position.x)}, ${Math.round(s.position.y)} · walking`;
    }
    if (time - lastSave > 750) {
      try {
        localStorage.setItem("pixel-tales", JSON.stringify(s));
      } catch {}
      lastSave = time;
    }
  }
  if (!s.battle && !s.event && !drawerOpen) {
    const nearbyBefore = nearbyPatrols(s)
      .map((p) => p.id)
      .join(",");
    advancePatrols(s, seconds);
    if (
      nearbyBefore !==
      nearbyPatrols(s)
        .map((p) => p.id)
        .join(",")
    )
      render();
    else draw();
    if (time - lastSave > 750) {
      try {
        localStorage.setItem("pixel-tales", JSON.stringify(s));
      } catch {}
      lastSave = time;
    }
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => draw());

const walkingKeys = [
  "w",
  "a",
  "s",
  "d",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
];
window.addEventListener("keydown", (event) => {
  if (
    !walkingKeys.includes(event.key) ||
    s.battle ||
    s.event ||
    drawerOpen ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  heldKeys.add(event.key);
});
window.addEventListener("keyup", (event) => {
  if (heldKeys.delete(event.key) && !heldKeys.size) {
    stopMovement(s);
    render();
  }
});
window.addEventListener("blur", () => {
  if (heldKeys.size) {
    heldKeys.clear();
    stopMovement(s);
    render();
  }
});

function drawAtlas() {
  const atlas = $("atlas"),
    a = atlas.getContext("2d");
  a.fillStyle = "#20362e";
  a.fillRect(0, 0, atlas.width, atlas.height);
  const sx = atlas.width / WORLD.width,
    sy = atlas.height / WORLD.height,
    cols = Math.ceil(WORLD.width / 64);
  a.fillStyle = "#657454";
  for (const cell of s.charted)
    a.fillRect(
      (cell % cols) * 64 * sx,
      Math.floor(cell / cols) * 64 * sy,
      64 * sx + 1,
      64 * sy + 1,
    );
  places.forEach((p, i) => {
    if (s.discovered.includes(i) || s.contract?.target === i) {
      a.fillStyle =
        s.contract?.target === i
          ? "#f4d484"
          : p.type === "town"
            ? "#e3d1a2"
            : "#8ab282";
      a.fillRect(p.x * sx - 2, p.y * sy - 2, 4, 4);
    }
  });
  a.strokeStyle = "#c0bda0";
  a.strokeRect(
    view.x * sx,
    view.y * sy,
    (canvas.width / view.scale) * sx,
    (Math.max(160, canvas.height - 180) / view.scale) * sy,
  );
  a.fillStyle = "#fff2c1";
  a.fillRect(s.position.x * sx - 2, s.position.y * sy - 2, 4, 4);
  if (s.destination) {
    a.strokeStyle = "#e6bf74";
    a.strokeRect(s.destination.x * sx - 3, s.destination.y * sy - 3, 6, 6);
  }
}
$("atlas").onclick = (event) => {
  const r = $("atlas").getBoundingClientRect();
  heldKeys.clear();
  drawerOpen = false;
  moveTo(
    s,
    ((event.clientX - r.left) / r.width) * WORLD.width,
    ((event.clientY - r.top) / r.height) * WORLD.height,
  );
  render();
};

canvas.addEventListener("pointermove", (event) => {
  if (!s.battle) return;
  const bounds = canvas.getBoundingClientRect(),
    x = Math.floor(
      (view.x + (event.clientX - bounds.left) / view.scale - 105) / 62,
    ),
    y = Math.floor((view.y + (event.clientY - bounds.top) / view.scale) / 60),
    enemy = s.battle.enemies.find((e) => e.hp > 0 && e.x === x && e.y === y);
  if (enemy)
    $("map-label").textContent =
      `${enemy.kind || "raider"} · HP ${enemy.hp}/${enemy.max} · Armor ${enemy.armor || 0} · Range ${enemy.kind === "archer" ? 4 : 1}${enemy.stun ? " · Stunned" : ""}${enemy.bleed ? " · Bleeding" : ""}`;
});
