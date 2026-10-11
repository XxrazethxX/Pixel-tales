import {
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
let drawerOpen = false;
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
    return `Round ${s.battle.turn} · ${p.name}: ${u?.moved ? "movement used" : "move up to 2 tiles"} · ${u?.acted ? "action used" : "attack or brace"}. Move and attack in the same round. Bows reach 4 tiles; spears 2; other weapons 1.`;
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
    `<span>◈ ${s.gold} crowns</span><span>▧ ${s.food} rations</span><span>✦ ${s.knowledge} knowledge</span><span>☀ Day ${s.day}</span>`;
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
        `<div class="row"><span class="hint">${s.completed} contracts · ${s.renown} renown</span><span class="badge">Morale ${s.morale}%</span></div><div class="bar"><i style="width:${s.morale}%"></i></div><p>Wages: ${s.party.length * 2} crowns per camp. At 85 morale, all attacks gain +1 damage. Injuries reduce attack by 1.</p>`,
      ),
    );
    s.party.forEach((p) => {
      const c = card(
        `${p.name} · Level ${p.level}`,
        `<p>${p.role} · ${p.profession} (${p.professionXP} practice) ${p.injury ? "· INJURED" : ""}</p><div class="row"><span class="hint">HP ${p.hp}/${p.max}</span><span class="hint">ATK ${attackPower(s, p)} · Armor ${p.armor}</span></div><div class="bar"><i style="width:${(p.hp / p.max) * 100}%"></i></div><p>XP ${p.xp}/${p.level * 30} · ${p.points} training points</p>`,
      );
      if (p.points)
        c.append(
          button("Strength +1", () => train(s, p.id, "strength"), !!s.battle),
          button(
            "Vitality +5 HP",
            () => train(s, p.id, "vitality"),
            !!s.battle,
          ),
        );
      if (p.hp < p.max || p.injury)
        c.append(
          button(
            "Use medicine · heal 15",
            () => heal(s, p.id),
            s.inventory.medicine < 1 || !!s.battle || !!s.event,
          ),
        );
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
          done || s.knowledge < r.cost || !!s.battle || !!s.event,
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
        el = card(
          r.name,
          `<p>${r.desc}${["blade", "armor"].includes(r.id) ? ` · ${p.name}` : ""}</p><p>Costs: ${r.ore} ore · ${r.wood} wood · ${r.herbs || 0} herbs</p>`,
        );
      el.append(
        button(
          "Craft",
          () => craft(s, r.id, craftTarget),
          !!s.battle ||
            !!s.event ||
            s.inventory.ore < r.ore ||
            s.inventory.wood < r.wood ||
            s.inventory.herbs < (r.herbs || 0) ||
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
          "<p>Travel to Greyhaven or Saltbridge for the market and recruitment.</p>",
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
            `${label} · ${cost} crowns`,
            () => buy(s, id),
            s.gold < cost || !!s.event || !!s.battle,
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
    a.append(c);
  } else if (s.battle) {
    a.append(
      button(`End round ${s.battle.turn}`, () => endTurn(s), false, true),
      button(
        "Brace · reduce damage",
        () => guard(s, selected),
        s.battle.units.find((u) => u.id === selected)?.acted,
      ),
      button("Retreat · lose 15 crowns", () => {
        s.gold = Math.max(0, s.gold - 15);
        s.battle = null;
        s.morale = Math.max(0, s.morale - 10);
        note(s, "Retreated. Contract remains active.");
      }),
    );
    s.battle.units.forEach((u) => {
      const p = s.party[u.id];
      a.append(
        button(
          `${p.name}${u.acted ? " ✓" : ""}`,
          () => (selected = u.id),
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
        `Camp · 4 rations / ${s.party.length * 2} crowns`,
        () => camp(s),
        s.food < 4 || s.gold < s.party.length * 2,
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
        Math.min(768 - w / view.scale, s.position.x - w / view.scale / 2),
      );
  view.y = s.battle
    ? (432 - h / view.scale) / 2
    : Math.max(
        0,
        Math.min(
          432 - (h - 180) / view.scale,
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
  rect(-768, -432, 2304, 1296, "#657454");
  for (let i = 0; i < 450; i++) {
    const x = (i * 137 + 31) % 768,
      y = (i * 83 + 17) % 432;
    rect(x, y, 2, 2, i % 2 ? "#73805a" : "#596e4c");
  }
  if (s.battle) {
    rect(0, 0, 768, 432, "#3b4937");
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 9; x++) {
        rect(
          105 + x * 62,
          0 + y * 60,
          60,
          58,
          (x + y) % 2 ? "#526044" : "#59664a",
        );
        const active = s.battle.units.find((u) => u.id === selected);
        if (active && !active.acted) {
          const p = s.party[selected],
            range = p.role === "Archer" ? 4 : p.role === "Spearman" ? 2 : 1;
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
                (!active.moved &&
                  !occupied &&
                  !enemy &&
                  distance <= 2 &&
                  distance > 0)
              ) {
                ctx.strokeStyle = enemy ? "#d9a07e" : "#a3b578";
                ctx.lineWidth = 2;
                ctx.strokeRect(109 + x * 62, 4 + y * 60, 51, 49);
              }
            }
        }
      }
    s.battle.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        person(136 + e.x * 62, 28 + e.y * 60, "#8f5143");
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
  for (let y = 0; y <= 432; y += 4) {
    const x = 475 + Math.sin(y / 65) * 38;
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 65; i++) {
    let x = (i * 71 + 50) % 740,
      y = (i * 43 + 25) % 380;
    if (places.every((p) => Math.hypot(p.x - x, p.y - y) > 48)) tree(x, y);
  }
  for (let i = 0; i < 12; i++) {
    const x = 40 + i * 29,
      y = 35 + (i % 3) * 14;
    rect(x, y, 24, 26, "#596452");
    rect(x + 5, y - 8, 14, 12, "#7a8269");
  }
  places.forEach((p, i) => {
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
    if (ally) selected = ally.id;
    else act(s, selected, tx, ty);
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
    };
    advanceMovement(s, seconds);
    if (
      before.day !== s.day ||
      before.location !== s.location ||
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
