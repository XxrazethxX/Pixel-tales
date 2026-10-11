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
  recruitmentOffers,
  companionTraits,
  companionWages,
  resolveLabel,
  bondValue,
  bondLabel,
  bondSupport,
  shareStories,
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
  buyGear,
  sell,
  salePrices,
  innCost,
  restAtInn,
  companyStanding,
  contractDifficulty,
  equipmentCatalog,
  gearItem,
  gearOwner,
  equippedItem,
  armorPower,
  equipEquipment,
  unequipEquipment,
  buyEquipment,
  sellEquipment,
  equipmentPrice,
  equipmentRecipe,
  craftEquipment,
  openCamp,
  leaveCamp,
  buildCamp,
  campStructures,
  campRoles,
  campWorker,
  canAssignCampJob,
  assignCampJob,
  fatigueLabel,
  fatiguePenalty,
  campBuildPlan,
  livingParty,
  companyLost,
  dailyWages,
  payWages,
  clockInfo,
  advanceClock,
} from "./game.js";
import {
  worldArtwork,
  fogArtwork,
  drawLandmark,
  drawCharacter,
  drawMapLabel,
  drawWagon,
  drawBattlefield,
  pixelIcon,
  portraitArtwork,
  venueArtwork,
  partyCoats,
  drawCampScene,
  drawWolf,
  drawLighting,
} from "./art.js";
let s = fresh();
try {
  s = restore(JSON.parse(localStorage.getItem("pixel-tales")));
} catch {}
const heldKeys = new Set();
let renderedTab = null;
let observedLocation = null,
  pendingVillage = null;
let drawerOpen = false,
  abilityMode = false;
let tab = "Company",
  selected = 0,
  craftTarget = 0,
  gearTarget = 0;
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
  const head = document.createElement("div");
  head.className = "card-heading";
  const kind = /market|quartermaster/i.test(title)
    ? "market"
    : /lantern|roof/i.test(title)
      ? "tavern"
      : /blacksmith|blade|forge|steel/i.test(title)
        ? "sword"
        : /armor/i.test(title)
          ? "shield"
          : /research|knowledge|road|trail|medicine/i.test(title)
            ? "knowledge"
            : "contract";
  head.append(pixelIcon(kind), heading);
  d.append(head);
  const content = document.createElement("div");
  content.innerHTML = body;
  d.append(content);
  return d;
}
function equipmentCard(item) {
  const c = card(
    item.name,
    `<p class="gear-quality quality-${item.tier}">${item.rarity} · ${item.role || "All companions"}</p><p>+${item.bonus} ${item.slot === "weapon" ? "attack" : "armor"} when equipped</p>`,
  );
  c.classList.add("gear-card");
  c.dataset.quality = item.tier;
  c.querySelector(".pixel-icon").replaceWith(
    pixelIcon(item.slot === "armor" ? "shield" : item.id.split("-")[0], 28),
  );
  return c;
}
function objective() {
  if (s.event)
    return "A roadside encounter awaits your decision. Choose how to respond below.";
  if (s.battle) {
    const p = s.party[selected],
      u = s.battle.units.find((u) => u.id === selected);
    if (abilityMode)
      return `${classSkills[p.role].name} armed: click an outlined enemy within ${attackRange(p, true)} tiles. ${classSkills[p.role].desc} Costs ${classSkills[p.role].cost} valor.`;
    return `Valor ${s.battle.valor}/5 · Round ${s.battle.turn} · ${p.name}: ${u?.moved ? "movement used" : `move up to ${movementRange(p)} tiles`} · ${u?.acted ? "action used" : "attack or brace"}. ${resolveLabel(p)} · ${bondSupport(s, p) ? "Trusted support +1 attack · " : ""}${fatigueLabel(p)} · Fatigue ${Math.round(p.fatigue || 0)}/100. Melee flanking +2: place allies on opposite sides of a foe. Wolves rush wounded targets and gain +1 damage when hunting together.`;
  }
  if (s.contract)
    return `Active: ${s.contract.name}. ${s.location === s.contract.target ? "Use the gold button below to complete your objective." : `Travel to ${places[s.contract.target].name} by clicking any point on the map.`}`;
  return s.destination
    ? "Walking · click or tap anywhere to change direction. Companions follow your route."
    : "Click or tap anywhere to walk. Visit towns for contracts and trade, or venture into the wilderness.";
}
function render() {
  if (companyLost(s)) {
    tab = "Company";
    drawerOpen = true;
    heldKeys.clear();
  }
  if (tab === "Camp" && !s.campOpen) tab = "Company";

  if (!s.party[gearTarget] || s.party[gearTarget].dead)
    gearTarget = s.party.find((p) => !p.dead)?.id || 0;
  if (!s.party[craftTarget] || s.party[craftTarget].dead)
    craftTarget = s.party.find((p) => !p.dead)?.id || 0;
  const inVillage =
    places[s.location]?.type === "town" &&
    !s.battle &&
    !s.event &&
    !s.campOpen &&
    !companyLost(s);
  if (observedLocation !== s.location) {
    pendingVillage = places[s.location]?.type === "town" ? s.location : null;
    observedLocation = s.location;
  }
  if (pendingVillage !== null && inVillage) {
    pendingVillage = null;
    stopMovement(s);
    heldKeys.clear();
    drawerOpen = true;
    tab = "Town";
  }
  if (
    ["Town", "Market", "Blacksmith", "Tavern", "Contracts"].includes(tab) &&
    !inVillage
  )
    tab = "Company";

  document.body.classList.toggle("drawer-open", drawerOpen);
  document.body.classList.toggle("encounter", !!s.event);
  document.body.classList.toggle("in-battle", !!s.battle);
  document.body.classList.toggle("in-camp", !!s.campOpen);
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
  [...$("resources").children].forEach((el, i) => {
    el.textContent = el.textContent.replace(/^[◈▧✦☀◆]\s*/, "");
    el.prepend(
      pixelIcon(["crown", "food", "knowledge", "sun", "shield"][i], 16),
    );
  });
  if (!s.battle || s.battle.units.find((u) => u.id === selected)?.acted)
    abilityMode = false;
  $("objective").textContent = objective();
  $("tabs").replaceChildren(
    ...[
      ...(s.campOpen ? ["Camp"] : []),
      "Company",
      "Equipment",
      "Research",
      "Workshop",
      "Journal",
    ].map((t) => {
      const b = button(t, () => {
        drawerOpen = tab === t ? !drawerOpen : true;
        tab = t;
      });
      b.setAttribute("aria-label", t);
      if (t === "Equipment" && s.gear.length) b.dataset.count = s.gear.length;
      b.classList.toggle("active", drawerOpen && tab === t);
      return b;
    }),
  );
  $("panel-title").textContent =
    tab === "Town"
      ? places[s.location].name
      : {
          Company: "The Ashen Company",
          Equipment: "Equipment & loot",
          Camp: "The company camp",
          Market: "Market square",
          Blacksmith: "The forge",
          Tavern: "The Crooked Lantern",
          Contracts: "Contract board",
          Research: "Discoveries",
          Workshop: "Company stores",
          Journal: "Road journal",
        }[tab] || tab;
  $("panel-kicker").textContent =
    inVillage &&
    ["Town", "Market", "Blacksmith", "Tavern", "Contracts"].includes(tab)
      ? `${places[s.location].name} · SETTLEMENT`
      : "THE ASHEN COMPANY";
  const panel = $("panel");
  panel.replaceChildren();
  if (tab === "Company") {
    const standing = companyStanding(s);
    panel.append(
      card(
        "The Ashen Company",
        `<div class="row"><span class="hint">${s.completed} contracts · ${s.skirmishes} skirmishes · ${s.renown} renown</span><span class="badge">Morale ${s.morale}%</span></div><div class="bar"><i style="width:${s.morale}%"></i></div><p>${standing.name}${standing.next ? ` · ${standing.next.renown - s.renown} more renown to become ${standing.next.name}` : " · Highest standing achieved"}. Complete contracts to unlock tougher work.</p><p>Map: ${s.discovered.length}/${places.length} locations discovered.</p><p>Wages: ${dailyWages(s)} crowns per day. At 85 morale, all attacks gain +1 damage. Injuries reduce attack by 1. Skilled cooks reduce camp supplies to ${campCost(s)} rations.</p>`,
      ),
    );
    panel.append(
      card(
        "Daily upkeep",
        `<p>${livingParty(s).length} living companions require ${campCost(s)} rations and ${dailyWages(s)} crowns per day. ${s.wageDebt ? `${s.wageDebt} crowns are overdue.` : "Wages are up to date."} ${s.hungerDays ? `<strong>STARVING · day ${s.hungerDays}. Find food; hunger damages the company every day.</strong>` : "The company is fed."}</p>`,
      ),
    );
    if (s.wageDebt)
      panel.append(
        button(
          "Pay overdue wages",
          () => payWages(s),
          !s.gold || !!s.battle || !!s.event,
        ),
      );
    if (companyLost(s))
      panel.append(
        card(
          "The company has perished",
          "<p>All companions died of starvation. Start a new company to continue.</p>",
        ),
      );
    s.party.forEach((p) => {
      if (p.dead) {
        const memorial = card(
          `${p.name} · Fallen`,
          "<p>Died of starvation. Starvation deaths are permanent; medicine and rest cannot revive this companion.</p>",
        );
        memorial.classList.add("fallen");
        memorial.querySelector(".pixel-icon").replaceWith(portraitArtwork(p));
        panel.append(memorial);
        return;
      }
      const c = card(
        `${p.name} · Level ${p.level}`,
        `<p>${p.role} · ${rankNames[professionRank(p)]} ${p.profession} (${p.professionXP} practice${professionRank(p) < 3 ? ` / ${[3, 8, 15][professionRank(p)]} for next rank` : " · mastered"}) ${p.injury ? "· INJURED" : ""}</p><div class="row"><span class="hint">HP ${p.hp}/${p.max}</span><span class="hint">ATK ${attackPower(s, p)} · Armor ${armorPower(s, p)}</span></div><div class="bar"><i style="width:${(p.hp / p.max) * 100}%"></i></div><p>${fatigueLabel(p)} · Fatigue ${Math.round(p.fatigue || 0)}/100${fatiguePenalty(p) ? ` · −${fatiguePenalty(p)} attack${fatiguePenalty(p) === 2 ? " · −1 movement" : ""}` : ""}</p><div class="bar fatigue-bar"><i style="width:${p.fatigue || 0}%"></i></div><p>XP ${p.xp}/${p.level * 30} · ${p.points} training points</p>`,
      );
      const worn = card(
        "Equipped gear",
        `<p>Weapon: ${equippedItem(s, p, "weapon")?.name || "Company issue"}<br>Armor: ${equippedItem(s, p, "armor")?.name || "Company issue"}</p>`,
      );
      worn.append(
        button("Manage equipment", () => {
          gearTarget = p.id;
          tab = "Equipment";
        }),
      );
      const character = card(
        "Character & bonds",
        `<p>${resolveLabel(p)} · Resolve ${Math.round(p.resolve ?? 65)}/100${(p.resolve ?? 65) < 25 ? " · −1 attack" : ""}</p><p>Daily wages: ${companionWages(p)} crowns${p.traits?.includes("hearty") ? " · +1 daily ration" : ""}</p>`,
      );
      for (const id of p.traits || []) {
        const trait = companionTraits.find((t) => t.id === id);
        if (trait) {
          const text = document.createElement("p");
          text.textContent = `${trait.name}: ${trait.desc}`;
          character.append(text);
        }
      }
      const connections = document.createElement("details"),
        heading = document.createElement("summary");
      heading.textContent = "Relationships";
      connections.append(heading);
      for (const friend of livingParty(s).filter(
        (friend) => friend.id !== p.id,
      )) {
        const value = bondValue(s, p.id, friend.id),
          line = document.createElement("p");
        line.textContent = `${friend.name} · ${bondLabel(value)} · ${value}/100`;
        connections.append(line);
      }
      character.append(connections);
      c.append(character, worn);
      c.classList.add("companion-card");
      c.querySelector(".pixel-icon").replaceWith(portraitArtwork(p));
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
  if (tab === "Camp") {
    panel.append(
      card(
        "Campfire & company stores",
        `<p>The camp travels with you. ${livingParty(s).length} companions · ${s.food} rations · ${s.gold} crowns</p><p>Wood ${s.inventory.wood} · Ore ${s.inventory.ore} · Herbs ${s.inventory.herbs}</p>${s.preparedValor ? "<p>Guard preparation: +1 valor in the next battle.</p>" : ""}<p>Daily upkeep: ${campCost(s)} rations and ${dailyWages(s)} crowns. ${s.hungerDays ? `<strong>Starving for ${s.hungerDays} day(s). Empty meals prevent recovery.</strong>` : "Rest with enough food to recover."} ${s.wageDebt ? `${s.wageDebt} crowns in overdue wages.` : ""}</p>`,
      ),
    );
    const rest = card(
      "Rest & prepare",
      "<p>Rest until the next 08:00. Daily upkeep is settled at midnight. Planning is paused; construction takes two hours. Camp improvements persist when you pack up.</p>",
    );
    rest.append(
      button("Rest until dawn", () => camp(s), false, true),
      button("Forage · 6 rations / 6 hours", () => forage(s)),
      button("Open camp workshop", () => {
        tab = "Workshop";
      }),
    );
    if (s.wageDebt)
      rest.append(button("Pay overdue wages", () => payWages(s), !s.gold));
    panel.append(rest);
    const social = card(
      "Supper & stories",
      "<p>Choose two companions to share a meal and a conversation. Costs 2 rations and 2 hours, once per day for the company. Improves their bond by 4 and personal resolve by 8; a convivial companion adds one extra bond point. Trusted companions (25+) support adjacent allies in combat.</p>",
    );
    const companions = livingParty(s).filter((p) => p.hp > 0),
      firstSelect = document.createElement("select"),
      secondSelect = document.createElement("select");
    firstSelect.setAttribute("aria-label", "First conversation companion");
    secondSelect.setAttribute("aria-label", "Second conversation companion");
    for (const p of companions) {
      firstSelect.add(new Option(p.name, String(p.id)));
      secondSelect.add(new Option(p.name, String(p.id)));
    }
    if (companions[1]) secondSelect.value = String(companions[1].id);
    const conversation = button(
      "Share supper & stories",
      () =>
        shareStories(s, Number(firstSelect.value), Number(secondSelect.value)),
      s.food < 2 || companions.length < 2 || s.lastConversationDay === s.day,
    );
    const updateConversation = () => {
      conversation.disabled =
        s.food < 2 ||
        companions.length < 2 ||
        s.lastConversationDay === s.day ||
        firstSelect.value === secondSelect.value;
    };
    firstSelect.onchange = updateConversation;
    secondSelect.onchange = updateConversation;
    social.append(firstSelect, secondSelect, conversation);
    panel.append(social);
    const duties = card(
      "Camp duties",
      "<p>Choose one job per conscious companion. Build its station first. Jobs use current professions and operate on fed rests of at least six hours, once per day. Workers recover 3 fatigue per hour; resting companions recover 5.</p>",
    );
    for (const role of campRoles) {
      const worker = campWorker(s, role.id),
        row = card(
          role.name,
          `<p>${role.desc}</p><p>${s.campUpgrades[role.building] ? (worker ? `${worker.name} on duty` : "Unstaffed") : `Requires ${campStructures.find((b) => b.id === role.building).name}`}</p>`,
        );
      const selector = document.createElement("select");
      selector.setAttribute("aria-label", role.name);
      selector.add(new Option("No assignment", ""));
      livingParty(s)
        .filter((p) => p.hp > 0)
        .forEach((p) => {
          const option = new Option(
            `${p.name} · ${p.profession} · ${fatigueLabel(p)}`,
            String(p.id),
          );
          option.disabled = !canAssignCampJob(s, role.id, p.id);
          selector.add(option);
        });
      selector.value = worker ? String(worker.id) : "";
      selector.disabled = !s.campUpgrades[role.building];
      selector.onchange = () => {
        assignCampJob(
          s,
          role.id,
          selector.value === "" ? null : Number(selector.value),
        );
        render();
      };
      row.append(selector);
      duties.append(row);
    }
    panel.append(duties);
    for (const building of campStructures) {
      const plan = campBuildPlan(s, building.id);
      const done = plan.level >= plan.max;
      const c = card(
        `${plan.name} · ${plan.level}/${plan.max}`,
        `<p>${plan.desc}</p>${done ? "<p>Fully built.</p>" : `<p>Cost: ${plan.gold} crowns · ${plan.wood} wood${plan.ore ? ` · ${plan.ore} ore` : ""}${plan.herbs ? ` · ${plan.herbs} herbs` : ""} · 2 hours</p>`}`,
      );
      c.dataset.campUpgrade = building.id;
      c.append(
        button(
          done
            ? `${plan.name} complete`
            : `${plan.level ? "Upgrade" : "Build"} ${plan.name}`,
          () => buildCamp(s, building.id),
          done ||
            s.gold < plan.gold ||
            s.inventory.wood < plan.wood ||
            s.inventory.ore < plan.ore ||
            s.inventory.herbs < plan.herbs,
        ),
      );
      panel.append(c);
    }
    panel.append(
      button("View camp", () => {
        drawerOpen = false;
      }),
      button("Break camp", () => {
        leaveCamp(s);
        drawerOpen = false;
        tab = "Company";
      }),
    );
  }
  if (tab === "Equipment") {
    panel.append(
      card(
        "Company equipment",
        "<p>Choose a companion to equip or transfer gear. Weapons fit their class; armor fits anyone. Bonuses add to permanent improvements. Gear stays locked during combat and encounters.</p>",
      ),
    );
    const selector = document.createElement("select");
    selector.setAttribute("aria-label", "Equipment companion");
    livingParty(s).forEach((p) =>
      selector.add(new Option(`${p.name} · ${p.role}`, p.id)),
    );
    selector.value = gearTarget;
    selector.onchange = () => {
      gearTarget = Number(selector.value);
      render();
    };
    panel.append(selector);
    const p = s.party[gearTarget];
    const loadout = card(
      `${p.name}'s loadout`,
      `<p>ATK ${attackPower(s, p)} · Armor ${armorPower(s, p)}<br>Permanent improvements: weapon +${p.weapon}, armor +${p.armor}</p>`,
    );
    for (const slot of ["weapon", "armor"]) {
      const item = equippedItem(s, p, slot);
      const line = document.createElement("p");
      line.textContent = `${slot === "weapon" ? "Weapon" : "Armor"}: ${item?.name || "Company issue"}`;
      loadout.append(line);
      if (item)
        loadout.append(
          button(
            `Unequip ${item.name}`,
            () => unequipEquipment(s, p.id, slot),
            !!s.battle || !!s.event,
          ),
        );
    }
    panel.append(loadout);
    if (!s.gear.length)
      panel.append(
        card(
          "No spare gear yet",
          "<p>Win a battle for loot or visit a village blacksmith to buy equipment. Research Armorer's craft to unlock fine equipment recipes.</p>",
        ),
      );
    for (const entry of s.gear) {
      const item = gearItem(s, entry.id),
        owner = gearOwner(s, entry.id);
      const c = equipmentCard(item);
      const ownership = document.createElement("p");
      ownership.textContent = owner
        ? `Equipped by ${owner.name}`
        : "In company stores";
      if (owner?.id !== p.id && (!item.role || item.role === p.role)) {
        const delta = item.bonus - (equippedItem(s, p, item.slot)?.bonus || 0);
        const comparison = document.createElement("p");
        comparison.textContent = `For ${p.name}: ${delta >= 0 ? "+" : ""}${delta} ${item.slot === "weapon" ? "attack" : "armor"} compared with current gear.`;
        c.append(comparison);
      }
      c.append(
        ownership,
        button(
          `${owner && owner.id !== p.id ? "Transfer" : "Equip"} ${item.name}`,
          () => equipEquipment(s, entry.id, p.id),
          !!s.battle ||
            !!s.event ||
            owner?.id === p.id ||
            (item.role && item.role !== p.role),
          true,
        ),
      );
      if (places[s.location]?.type === "town")
        c.append(
          button(
            `Sell ${item.name} · ${Math.floor(item.price * 0.4)} crowns`,
            () => sellEquipment(s, entry.id),
            !!owner || !!s.battle || !!s.event,
          ),
        );
      panel.append(c);
    }
  }
  if (tab === "Contracts") {
    panel.append(
      card(
        `The ${places[s.location].name} contract board`,
        `<p>${companyStanding(s).name} · ${s.renown} renown. Every village posts its own work. Build renown to earn the trust needed for dangerous and elite jobs.</p>`,
      ),
    );
    if (s.contract)
      panel.append(
        card(
          s.contract.name,
          `<p>Destination: ${places[s.contract.target].name}</p><p>Reward: ${s.contract.reward} crowns</p><span class="badge">ACTIVE · ${s.contract.kind === "delivery" ? "Deliver 5 rations" : `Defeat ${contractDifficulty(s.contract).enemies} enemies`}</span>`,
        ),
      );
    else
      contracts(s).forEach((c, i) => {
        const difficulty = contractDifficulty(c);
        const locked = s.renown < c.minRenown;
        const el = card(
          c.name,
          `<p>${c.kind === "delivery" ? "Deliver 5 rations" : `Defeat ${difficulty.enemies} enemies · ${difficulty.label}`} at ${places[c.target].name}.</p><p>${c.reward} crowns · ${c.kind === "delivery" ? "1 knowledge" : `${difficulty.knowledge} knowledge · ${difficulty.xp} XP · ${difficulty.renown} renown + salvage`}</p>`,
        );
        if (locked)
          el.append(
            card(
              "Company standing required",
              `<p>${c.minRenown} renown required · earn ${c.minRenown - s.renown} more.</p>`,
            ),
          );
        el.append(
          button(
            "Accept contract",
            () => accept(s, i),
            locked ||
              !!s.battle ||
              !!s.event ||
              places[s.location]?.type !== "town",
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
        `<p>Ore ${s.inventory.ore} · Wood ${s.inventory.wood} · Herbs ${s.inventory.herbs} · Medicine ${s.inventory.medicine}</p><p>Explore sites or buy materials in towns. Permanent improvements below are applied to your selected companion. Weapon improvements cap at +4; armor improvements cap at 3. Named gear is crafted separately and assigned in Equipment.</p>`,
      ),
    );
    const target = card("Equip a companion", "");
    livingParty(s).forEach((p) =>
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
  if (tab === "Workshop") {
    panel.append(
      card(
        "Armorer's bench",
        `<p>${s.research.includes("armorer") ? "Fine equipment recipes unlocked." : "Research Armorer's craft after Tempered steel to unlock these recipes."} A conscious Smith is required; higher profession ranks reduce ore costs.</p>`,
      ),
    );
    for (const item of equipmentCatalog.filter((item) => item.tier === 2)) {
      const plan = equipmentRecipe(s, item.id),
        c = equipmentCard(item);
      const cost = document.createElement("p");
      cost.textContent = `Crafting: ${plan.ore} ore · ${plan.wood} wood · +2 Smith practice`;
      c.append(
        cost,
        button(
          `Craft ${item.name}`,
          () => craftEquipment(s, item.id),
          !s.research.includes("armorer") ||
            !plan.smith ||
            s.inventory.ore < plan.ore ||
            s.inventory.wood < plan.wood ||
            !!s.battle ||
            !!s.event,
        ),
      );
      panel.append(c);
    }
  }
  if (
    inVillage &&
    ["Town", "Market", "Blacksmith", "Tavern", "Contracts"].includes(tab)
  ) {
    if (tab !== "Town")
      panel.prepend(
        button("Back to village", () => {
          tab = "Town";
        }),
      );
    if (tab === "Town") {
      panel.append(
        card(
          places[s.location].name,
          "<p>Your company has arrived. Choose a place to visit, or close this menu to continue walking.</p>",
        ),
      );
      for (const [venue, destination, description] of [
        [
          "Market square",
          "Market",
          "Buy provisions and sell surplus materials.",
        ],
        ["Blacksmith", "Blacksmith", "Buy and equip weapons and armor."],
        [
          "The Crooked Lantern",
          "Tavern",
          "Hire companions or rest to recover the whole party.",
        ],
        [
          "Contract board",
          "Contracts",
          "Find paid work and accept a contract.",
        ],
      ]) {
        const c = card(venue, `<p>${description}</p>`);
        c.classList.add("venue-card");
        c.prepend(venueArtwork(destination));
        c.append(
          button(
            `Visit ${venue}`,
            () => {
              tab = destination;
            },
            false,
            true,
          ),
        );
        panel.append(c);
      }
      panel.append(
        button("Leave village", () => {
          drawerOpen = false;
        }),
      );
    }
    if (tab === "Market") {
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
      const resale = card(
        "Sell supplies",
        "<p>Turn surplus loot into crowns. Keep materials needed for crafting.</p>",
      );
      for (const [item, price] of Object.entries(salePrices)) {
        const owned = s.inventory[item];
        resale.append(
          button(
            `Sell 1 ${item} · ${price} crowns (${owned} owned)`,
            () => sell(s, item),
            owned < 1,
          ),
        );
        if (owned > 1)
          resale.append(
            button(`Sell all ${item} · ${owned * price} crowns`, () =>
              sell(s, item, owned),
            ),
          );
      }
      panel.append(resale);
    }
    if (tab === "Tavern") {
      const inn = card(
        "Companions seeking work",
        `<p>Capacity: ${livingParty(s).length}/6. Review traits and daily costs before hiring. New companions begin with no bonds; Specialist recruits leave the hiring board once hired.</p>`,
      );
      for (const offer of recruitmentOffers(s)) {
        const candidate = card(
          `${offer.name} · ${offer.role}`,
          `<p>${offer.profession} · HP ${offer.max} · ATK ${6 + (offer.traits.includes("mercenary") ? 1 : 0)}</p><p>Hire: ${offer.cost} crowns · Daily wages: ${companionWages(offer)} crowns · Daily rations: ${offer.traits.includes("hearty") ? 2 : 1}</p>`,
        );
        for (const id of offer.traits) {
          const trait = companionTraits.find((t) => t.id === id),
            text = document.createElement("p");
          text.textContent = `${trait.name}: ${trait.desc}`;
          candidate.append(text);
        }
        candidate.append(
          button(
            offer.standard
              ? "Recruit companion"
              : `Hire ${offer.name} · ${offer.cost} crowns`,
            () => recruit(s, offer.id),
            s.gold < offer.cost || livingParty(s).length >= 6,
          ),
        );
        inn.append(candidate);
      }
      const rest = card(
        "A night under a roof",
        `<p>Full health, injuries cured, +15 morale. Includes meals and company wages; uses no rations. Takes one day.</p><p>${innCost(s)} crowns for ${livingParty(s).length} companions.</p>`,
      );
      rest.append(
        button(
          `Rest at inn · ${innCost(s)} crowns`,
          () => restAtInn(s),
          s.gold < innCost(s),
        ),
      );
      panel.append(rest, inn);
    }
    if (tab === "Blacksmith") {
      panel.append(
        card(
          "Blacksmith",
          "<p>Purchase permanent improvements for a companion: up to +4 attack and +3 armor. Buy named gear below, then assign it in Equipment.</p>",
        ),
      );
      const selector = document.createElement("select");
      selector.setAttribute("aria-label", "Equip companion");
      livingParty(s).forEach((p) =>
        selector.add(
          new Option(
            `${p.name} · weapon +${p.weapon} · armor ${p.armor}`,
            p.id,
          ),
        ),
      );
      selector.value = craftTarget;
      selector.onchange = () => {
        craftTarget = Number(selector.value);
        render();
      };
      panel.append(selector);
      for (const [item, label, cost, cap] of [
        ["weapon", "Weapon +2", 35, 4],
        ["armor", "Armor +1", 30, 3],
      ]) {
        const price = s.research.includes("barter")
          ? Math.ceil(cost * 0.8)
          : cost;
        panel.append(
          button(
            `${label} · ${price} crowns`,
            () => buyGear(s, item, craftTarget),
            s.gold < price || s.party[craftTarget][item] >= cap,
          ),
        );
      }
    }
  }
  if (inVillage && tab === "Blacksmith") {
    panel.append(
      card(
        "Equipment for sale",
        "<p>Named gear goes into company stores for assignment. Fine stock requires 5 renown; rare gear is recovered from elite battles. Permanent improvements above remain separate from equipment.</p>",
      ),
    );
    for (const item of equipmentCatalog.filter((item) => item.tier <= 2)) {
      const c = equipmentCard(item),
        price = equipmentPrice(s, item);
      c.append(
        button(
          `Buy ${item.name} · ${price} crowns`,
          () => buyEquipment(s, item.id),
          s.gold < price || (item.tier === 2 && s.renown < 5),
        ),
      );
      panel.append(c);
    }
    panel.append(
      button("Open company equipment", () => {
        tab = "Equipment";
      }),
    );
  }
  const a = $("actions");
  a.replaceChildren();
  if (companyLost(s)) {
    a.append(
      button("Company lost · start a new company", () => $("reset").click()),
    );
  } else if (s.campOpen) {
    if (!drawerOpen)
      a.append(
        button(
          "Return to camp menu",
          () => {
            tab = "Camp";
            drawerOpen = true;
          },
          false,
          true,
        ),
        button("Break camp", () => {
          leaveCamp(s);
          drawerOpen = false;
          tab = "Company";
        }),
      );
    $("map-label").textContent = "The Ashen Company · camp";
  } else if (s.event) {
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
      button("Make camp", () => {
        if (openCamp(s)) {
          heldKeys.clear();
          tab = "Camp";
          drawerOpen = true;
        }
      }),
      button("Forage · +6 rations / 6 hours", () => forage(s)),
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
            ? "Work mine · 2 rations / 6 hours"
            : "Gather herbs · 2 rations / 6 hours",
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
    nearbyPatrols(s).forEach((p) => {
      if (p.kind === "merchant") {
        if (!p.hostile)
          a.append(
            button(
              `Trade · 10 rations / ${s.research.includes("barter") ? 10 : 12} crowns`,
              () => tradeCaravan(s, p.id),
              s.gold < (s.research.includes("barter") ? 10 : 12),
            ),
          );
        a.append(button(`Attack ${p.name}`, () => startBattle(s, p.id)));
        a.lastChild.title =
          "Fight caravan guards for 60 crowns and 10 rations. First attack costs 10 morale and 5 renown; the caravan stops trading.";
      } else
        a.append(
          button(`Confront ${p.name}`, () => startBattle(s, p.id), false, true),
        );
    });
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
  if (renderedTab !== tab) {
    $("drawer").scrollTop = 0;
    renderedTab = tab;
  }
  updateClockUI();
  draw();
}
function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function person(x, y, c, step = 0, role = "", variant = 0) {
  drawCharacter(ctx, x, y, c, step, role, variant);
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
  ctx.imageSmoothingEnabled = false;
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
  if (s.campOpen) {
    view.scale = Math.min(w / 560, Math.max(160, h - 180) / 400);
    view.x = 325 - w / view.scale / 2;
    view.y = 225 - Math.max(160, h - 180) / view.scale / 2;
  }
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
  rect(
    -768,
    -432,
    WORLD.width + 1536,
    WORLD.height + 864,
    s.campOpen ? "#8d9b6e" : "#a3a775",
  );
  if (s.campOpen) {
    drawCampScene(ctx, s);
    return;
  }
  if (s.battle) {
    drawBattlefield(ctx);
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
                ? "#967442"
                : "#aa6349"
              : "#657a4d";
            ctx.lineWidth = 2;
            ctx.strokeRect(109 + x * 62, 4 + y * 60, 51, 49);
          }
        }
    }
    s.battle.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        if (e.kind === "wolf") drawWolf(ctx, 136 + e.x * 62, 28 + e.y * 60);
        else
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
                : "Swordswoman",
          );
        ctx.fillStyle = "#4c4935";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `${e.kind || "raider"}${e.stun ? " STUN" : ""}${e.root ? " ROOT" : ""}${e.bleed ? " BLEED" : ""}`,
          136 + e.x * 62,
          12 + e.y * 60,
        );
        rect(117 + e.x * 62, 49 + e.y * 60, 38, 5, "#777451");
        rect(118 + e.x * 62, 50 + e.y * 60, 36, 3, "#c5b78a");
        rect(
          118 + e.x * 62,
          50 + e.y * 60,
          Math.round((36 * e.hp) / e.max),
          3,
          "#a65f49",
        );
      });
    s.battle.units
      .filter((u) => s.party[u.id].hp > 0)
      .forEach((u) => {
        if (selected === u.id) {
          ctx.strokeStyle = "#5b6541";
          ctx.strokeRect(108 + u.x * 62, 3 + u.y * 60, 54, 52);
        }
        person(
          136 + u.x * 62,
          28 + u.y * 60,
          u.acted ? "#889079" : partyCoats[u.id],
          0,
          s.party[u.id].role,
          u.id,
        );
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#474b33";
        ctx.fillText(s.party[u.id].name, 136 + u.x * 62, 12 + u.y * 60);
        rect(117 + u.x * 62, 49 + u.y * 60, 38, 5, "#777451");
        rect(118 + u.x * 62, 50 + u.y * 60, 36, 3, "#c5b78a");
        rect(
          118 + u.x * 62,
          50 + u.y * 60,
          (36 * s.party[u.id].hp) / s.party[u.id].max,
          3,
          "#a2b477",
        );
      });
    drawLighting(ctx, s, canvas.width, canvas.height);
    return;
  }
  ctx.drawImage(worldArtwork(), 0, 0);
  ctx.drawImage(fogArtwork(s.charted), 0, 0);
  places.forEach((p, i) => {
    if (!s.discovered.includes(i) && s.contract?.target !== i) return;
    drawLandmark(ctx, p, i);
    drawMapLabel(ctx, p.name, p.x, p.y + (p.type === "town" ? 58 : 39));
    if (s.contract?.target === i) {
      drawMapLabel(
        ctx,
        "CONTRACT",
        p.x,
        p.y - (p.type === "town" ? 53 : 37),
        true,
      );
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
      const hostile = p.kind !== "merchant" || p.hostile;
      const color = hostile ? "#a16c54" : "#b39d69";
      if (p.kind === "merchant") drawWagon(ctx, p.x - 9, p.y - 8, p.hostile);
      else
        person(
          p.x - 17,
          p.y - 8,
          color,
          Math.sin(performance.now() / 150) > 0 ? 1 : -1,
          "Shieldbearer",
          1,
        );
      person(
        p.x + (p.kind === "merchant" ? 24 : 0),
        p.y,
        color,
        Math.sin(performance.now() / 150) > 0 ? -1 : 1,
        hostile ? "Spearman" : "",
        3,
      );
      drawMapLabel(ctx, p.name, p.x, p.y - 37, hostile);
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
  partyPositions(s)
    .map((point, i) => ({ ...point, i }))
    .filter((p) => !s.party[p.i].dead)
    .sort((a, b) => a.y - b.y)
    .forEach((p) => {
      const step = s.destination
        ? Math.sin(performance.now() / 100 + p.i * 1.7) > 0
          ? 2
          : -2
        : 0;
      person(p.x, p.y, partyCoats[p.i], step, s.party[p.i].role, p.i);
    });
  drawLighting(ctx, s, canvas.width, canvas.height);
}
canvas.onclick = (e) => {
  if (s.campOpen || companyLost(s)) return;
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
    observedLocation = null;
    selected = 0;
    render();
  }
};
render();

$("close-drawer").onclick = () => {
  if (s.campOpen) {
    leaveCamp(s);
    tab = "Company";
  }
  drawerOpen = false;
  render();
};
let previousFrame = 0,
  lastSave = 0;
function updateClockUI() {
  const info = clockInfo(s);
  const label = `Day ${s.day} · ${info.time} · ${info.period}`;
  if ($("clock-label").textContent !== label)
    $("clock-label").textContent = label;
  $("day-marker").style.left = `${info.percent}%`;
  $("day-scale").setAttribute("aria-valuenow", String(s.timeOfDay));
  $("day-scale").setAttribute("aria-valuetext", label);
  const disheartened = livingParty(s).filter((p) => (p.resolve ?? 65) < 25);
  const exhausted = livingParty(s).filter((p) => fatiguePenalty(p) === 2);
  $("survival-warning").hidden =
    !s.hungerDays && !s.wageDebt && !exhausted.length && !disheartened.length;
  $("survival-warning").textContent =
    `${s.hungerDays ? `STARVING · day ${s.hungerDays}. Find food before the next meal. ` : ""}${s.wageDebt ? `${s.wageDebt} crowns in unpaid wages. ` : ""}${exhausted.length ? `${exhausted.length} exhausted · camp to recover. ` : ""}${disheartened.length ? `${disheartened.length} disheartened · share a meal and rest.` : ""}`;
}
function animate(time) {
  if (
    heldKeys.size &&
    !s.battle &&
    !s.event &&
    !s.campOpen &&
    !companyLost(s) &&
    !drawerOpen
  ) {
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
  if (s.destination && !document.hidden) {
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
  if (
    !s.battle &&
    !s.event &&
    !s.campOpen &&
    !companyLost(s) &&
    !drawerOpen &&
    !document.hidden
  ) {
    const dayBefore = s.day;
    advanceClock(s, seconds);
    if (dayBefore !== s.day || s.event || companyLost(s)) render();
    updateClockUI();
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
  a.imageSmoothingEnabled = false;
  a.drawImage(worldArtwork(), 0, 0, atlas.width, atlas.height);
  const sx = atlas.width / WORLD.width,
    sy = atlas.height / WORLD.height,
    cols = Math.ceil(WORLD.width / 64);
  const known = new Set(s.charted);
  a.fillStyle = "#3e513cdd";
  for (let row = 0; row < Math.ceil(WORLD.height / 64); row++)
    for (let col = 0; col < cols; col++) {
      if (!known.has(row * cols + col))
        a.fillRect(col * 64 * sx, row * 64 * sy, 64 * sx + 1, 64 * sy + 1);
    }
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
  if (s.campOpen || companyLost(s)) return;
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
      `${enemy.kind || "raider"} · HP ${enemy.hp}/${enemy.max} · Armor ${enemy.armor || 0} · Range ${enemy.kind === "archer" ? 4 : 1}${enemy.kind === "wolf" ? " · Rush 2 · pack hunter" : enemy.kind === "archer" ? " · Keeps distance" : " · Melee flanking +2"}${enemy.stun ? " · Stunned" : ""}${enemy.bleed ? " · Bleeding" : ""}`;
});
