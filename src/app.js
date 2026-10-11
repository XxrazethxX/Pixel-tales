import {
  dungeonLayout,
  enterFarm,
  farmAction,
  supplyForecast,
  combatPreview,
  fieldGuide,
  weatherInfo,
  prepareAmbush,
  tacticalAction,
  payCrimeFine,
  personalGoal,
  companionStory,
  campFurniture,
  placeFurniture,
  enterDungeon,
  dungeonAction,
  dungeonWalls,
  avatarSkins,
  avatarHair,
  avatarAppearance,
  customizeAvatar,
  enterSite,
  siteAction,
  createCompany,
  companyBanners,
  companyOrigins,
  founderRoles,
  isCompanySave,
  campCost,
  healAmount,
  craftPlan,
  professional,
  professionRank,
  rankNames,
  professions,
  assignProfession,
  villageTutors,
  lessonQuote,
  lessonLock,
  takeLesson,
  tavernRumors,
  rumorLock,
  hearRumor,
  talentsFor,
  learnTalent,
  skillFor,
  advancedSkillsFor,
  learnAdvancedSkill,
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
  researchLock,
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
  scoutSurroundings,
  scoutLock,
  trailRegion,
  trailEncounters,
  trailEncounterOptions,
  trailChoiceLock,
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
  equipmentCondition,
  equipmentSalePrice,
  repairQuote,
  repairEquipment,
  retreatBattle,
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
  equipmentSlots,
  equipmentPerks,
  canEquipEquipment,
  battleTerrain,
  battlefield,
  namedAdversaries,
  bountyOffers,
  bountyLock,
  acceptBounty,
  abandonBounty,
  bossThreat,
  hasLineOfSight,
  terrainCell,
  battlePath,
  disengage,
  disengageCost,
  tradeGoods,
  cargoCapacity,
  cargoLoad,
  marketState,
  tradePrice,
  tradeQuote,
  tradeGoodsAtVillage,
  supplyOffer,
  regionalSalePrice,
  caravanCargoPrice,
  tradeCaravanCargo,
  caravanFoodPrice,
  factions,
  factionStanding,
  regionalStories,
  storyOffers,
  storyLock,
  acceptStory,
  interactStory,
  storyChoiceLock,
  chooseStory,
  forageAmount,
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
  drawSiteInterior,
  drawDungeonInterior,
  drawFarmInterior,
  drawLighting,
  drawLoadout,
} from "./art.js";
let gameActive = false;
let hasSessionCompany = false;
let menuSettings = { largeText: false, reduceMotion: false, slowDays: false };
try {
  const saved = JSON.parse(localStorage.getItem("pixel-tales-settings"));
  for (const key of Object.keys(menuSettings))
    menuSettings[key] = saved?.[key] === true;
} catch {}
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
  gearTarget = 0,
  caravanId = null;
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
    `<p class="gear-quality quality-${item.tier}">${item.rarity} · ${item.role || (item.slot === "shield" ? "Melee companions" : "All companions")} · ${item.slot}</p><p>+${item.bonus} ${item.slot === "weapon" ? "attack" : "armor"} when equipped</p>${item.twoHanded ? "<p>Two-handed: returns your shield to stores.</p>" : ""}${item.perk ? `<p class="gear-perk">${equipmentPerks[item.perk]}</p>` : ""}`,
  );
  if (item.instanceId) {
    const condition = document.createElement("p");
    condition.className = item.durability <= 25 ? "gear-worn" : "hint";
    condition.textContent = `${equipmentCondition(item)} · Condition ${item.durability}/100${item.durability === 0 ? " · no gear bonus or perk until repaired" : item.durability <= 25 ? " · reduced gear bonus" : ""}`;
    c.append(condition);
    const bar = document.createElement("div");
    bar.className = "bar condition-bar";
    const fill = document.createElement("i");
    fill.style.width = `${item.durability}%`;
    bar.append(fill);
    c.append(bar);
  }
  c.classList.add("gear-card");
  c.dataset.quality = item.tier;
  c.querySelector(".pixel-icon").replaceWith(
    pixelIcon(
      item.slot === "shield" || item.slot === "armor"
        ? "shield"
        : item.slot === "helmet"
          ? "sun"
          : item.role === "Spearman"
            ? "spear"
            : item.id.includes("sword") || item.role === "Swordswoman"
              ? "sword"
              : item.id.split("-")[0],
      28,
    ),
  );
  return c;
}
function repairButton(item) {
  const quote = repairQuote(s, item.instanceId);
  const cost =
    quote.mode === "camp"
      ? `${quote.ore} ore · ${quote.wood} wood · 2 hours`
      : `${quote.gold} crowns`;
  const b = button(
    `Repair ${item.name} · ${cost}`,
    () => repairEquipment(s, item.instanceId),
    !!quote.locked ||
      !quote.missing ||
      (quote.mode === "camp"
        ? s.inventory.ore < quote.ore || s.inventory.wood < quote.wood
        : s.gold < quote.gold),
  );
  b.title =
    quote.locked ||
    (quote.mode === "camp"
      ? `${quote.smith.name} restores this item and gains one Smith practice.`
      : "Restore condition, bonuses and perks to full strength.");
  return b;
}
function objective() {
  if (s.event)
    return "A roadside encounter awaits your decision. Choose how to respond below.";
  if (s.battle) {
    const p = s.party[selected],
      u = s.battle.units.find((u) => u.id === selected);
    if (abilityMode)
      return `${skillFor(p).name} armed: click an outlined enemy within ${attackRange(p, true, s)} tiles. ${skillFor(p).desc} Costs ${skillFor(p).cost} valor.`;
    return `${battlefield(s).name} · Round ${s.battle.turn} · Valor ${s.battle.valor}/5 · ${p.name}: ${u?.moved ? "movement used" : `move up to ${movementRange(p)} tiles`}, ${u?.acted ? "action used" : "attack or brace"}. ${resolveLabel(p)} · ${fatigueLabel(p)} · Fatigue ${Math.round(p.fatigue || 0)}/100. ${bondSupport(s, p) ? "Trusted support +1 attack. " : ""}${battlefield(s).text} Cover blocks 2 ranged damage; mud costs 2; Melee flanking +2. Disengage before leaving melee reach.${s.battle.wildlife ? " Wolves rush wounded targets and gain pack damage." : ""}${s.battle.bossId ? ` ${namedAdversaries.find((boss) => boss.id === s.battle.bossId).name}: ${bossThreat(s) ? "FIRE INCOMING: move off marked tiles or stun Maela." : "Hover the named enemy for its special mechanic."}` : ""}`;
  }
  if (s.contract)
    return `Active: ${s.contract.name}. ${s.location === s.contract.target ? "Use the gold button below to complete your objective." : `Travel to ${places[s.contract.target].name} by clicking any point on the map.`}`;
  return s.destination
    ? "Walking · click or tap anywhere to change direction. Companions follow your route."
    : "Click or tap anywhere to walk. Visit towns for contracts and trade, or venture into the wilderness.";
}
let battleVisual = null,
  visualSnapshot = new Map(),
  combatEffects = [],
  combatMotion = new Map();
function captureCombatFeedback() {
  if (battleVisual !== s.battle) {
    battleVisual = s.battle;
    visualSnapshot = new Map();
    combatMotion.clear();
    combatEffects = [];
  }
  if (!s.battle) return;
  const now = performance.now(),
    next = new Map();
  const entities = [
    ...s.battle.units.map((u) => ({
      ...u,
      key: `party-${u.id}`,
      hp: s.party[u.id].hp,
    })),
    ...s.battle.enemies.map((e, i) => ({ ...e, key: `enemy-${i}` })),
  ];
  for (const e of entities) {
    const old = visualSnapshot.get(e.key);
    if (old && (old.x !== e.x || old.y !== e.y) && !menuSettings.reduceMotion)
      combatMotion.set(e.key, { from: old, to: e, start: now });
    if (old && old.hp !== e.hp)
      combatEffects.push({ x: e.x, y: e.y, amount: e.hp - old.hp, start: now });
    next.set(e.key, { x: e.x, y: e.y, hp: e.hp });
  }
  visualSnapshot = next;
}
function combatPosition(key, entity) {
  const motion = combatMotion.get(key);
  if (!motion || menuSettings.reduceMotion) return entity;
  const t = Math.min(1, (performance.now() - motion.start) / 320),
    ease = t * t * (3 - 2 * t);
  if (t === 1) combatMotion.delete(key);
  return {
    x: motion.from.x + (motion.to.x - motion.from.x) * ease,
    y: motion.from.y + (motion.to.y - motion.from.y) * ease,
  };
}
function drawCombatEffects() {
  const now = performance.now();
  combatEffects = combatEffects.filter((e) => now - e.start < 950);
  for (const e of combatEffects) {
    const t = (now - e.start) / 950,
      x = 136 + e.x * 62,
      y = 28 + e.y * 60;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - t) * 2);
    ctx.fillStyle = e.amount < 0 ? "#b34f3e" : "#426742";
    ctx.strokeStyle = "#f8e8bd";
    ctx.lineWidth = 2;
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    const label = `${e.amount > 0 ? "+" : ""}${e.amount}`;
    ctx.strokeText(label, x, y - 12 - (menuSettings.reduceMotion ? 0 : t * 22));
    ctx.fillText(label, x, y - 12 - (menuSettings.reduceMotion ? 0 : t * 22));
    if (e.amount < 0 && t < 0.25 && !menuSettings.reduceMotion) {
      ctx.strokeStyle = "#e9d390";
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 9);
      ctx.lineTo(x + 11, y + 9);
      ctx.moveTo(x + 11, y - 9);
      ctx.lineTo(x - 11, y + 9);
      ctx.stroke();
    }
    ctx.restore();
  }
}
function helpContext() {
  return s.battle
    ? "battle"
    : s.event?.kind === "dungeon"
      ? "dungeon"
      : s.event?.kind === "farm"
        ? "farm"
        : s.campOpen
          ? "camp"
          : "travel";
}
function renderHelp() {
  let el = $("field-tip");
  if (!el) {
    el = document.createElement("details");
    el.id = "field-tip";
    $("actions").append(el);
  }
  el.replaceChildren();
  const context = helpContext(),
    [title, text] = fieldGuide[context];
  const summary = document.createElement("summary");
  summary.textContent = `Help · ${title}`;
  const p = document.createElement("p");
  p.textContent = text;
  el.append(
    summary,
    p,
    button("Got it", () => {
      s.helpSeen[context] = true;
    }),
  );
  el.open = false;
  el.ontoggle = () => {
    if (el.open) s.helpSeen[context] = true;
  };
}
function render() {
  captureCombatFeedback();
  document.querySelector(".brand small").textContent =
    s.companyName.toUpperCase();
  document.querySelector(".brand-mark").textContent =
    companyBanners.find((b) => b.id === s.banner)?.symbol || "✦";
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
    [
      "Town",
      "Market",
      "Blacksmith",
      "Tavern",
      "Contracts",
      "Training",
    ].includes(tab) &&
    !inVillage
  )
    tab = "Company";

  document.body.classList.toggle(
    "in-site",
    ["site", "dungeon", "farm"].includes(s.event?.kind),
  );
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
          Company: s.companyName,
          Equipment: "Equipment & loot",
          Camp: "The company camp",
          Market: "Market square",
          Blacksmith: "The forge",
          Tavern: "The Crooked Lantern",
          Training: "Training hall",
          Contracts: "Contract board",
          Research: "Discoveries",
          Workshop: "Company stores",
          Journal: "Road journal",
        }[tab] || tab;
  $("panel-kicker").textContent =
    inVillage &&
    [
      "Town",
      "Market",
      "Blacksmith",
      "Tavern",
      "Contracts",
      "Training",
    ].includes(tab)
      ? `${places[s.location].name} · SETTLEMENT`
      : s.companyName.toUpperCase();
  const panel = $("panel");
  panel.replaceChildren();
  if (tab === "Company") {
    const guide = document.createElement("details");
    const guideTitle = document.createElement("summary");
    guideTitle.textContent = "Field guide · travel, combat and survival";
    guide.append(guideTitle);
    guide.open = !s.helpSeen.travel;
    for (const [title, text] of Object.values(fieldGuide))
      guide.append(card(title, `<p>${text}</p>`));
    guide.append(
      button("Dismiss introduction", () => {
        s.helpSeen.travel = true;
      }),
    );
    panel.append(guide);
    const forecast = supplyForecast(s);
    panel.append(
      card(
        "Supply forecast",
        `<p>${s.difficulty[0].toUpperCase() + s.difficulty.slice(1)} campaign. Next meal in ${forecast.nextMeal.toFixed(1)} hours. Daily needs: ${forecast.food} rations and ${forecast.wages} crowns.</p><p>${forecast.foodDays} full food days · ${forecast.wageDays} full wage days after current debt. Cold weather can increase food needs; hiring increases upkeep.</p>`,
      ),
    );
    if (s.crime.wanted)
      panel.append(
        card(
          "Wanted company",
          `<p>Wanted ${s.crime.wanted}/10 · ${s.crime.stolen ? "Cargo marked stolen" : "No marked stolen cargo"}. Warden patrols pursue you. Village guards accept fines.</p>`,
        ),
      );
    const standing = companyStanding(s);
    panel.append(
      card(
        s.companyName,
        `<div class="row"><span class="hint">${s.completed} contracts · ${s.skirmishes} skirmishes · ${s.renown} renown</span><span class="badge">Morale ${s.morale}%</span></div><div class="bar"><i style="width:${s.morale}%"></i></div><p>${standing.name}${standing.next ? ` · ${standing.next.renown - s.renown} more renown to become ${standing.next.name}` : " · Highest standing achieved"}. Complete contracts to unlock tougher work.</p><p>Map: ${s.discovered.length}/${places.length} locations discovered.</p><p>Wages: ${dailyWages(s)} crowns per day. At 85 morale, all attacks gain +1 damage. Injuries reduce attack by 1. Skilled cooks reduce camp supplies to ${campCost(s)} rations.</p>`,
      ),
    );
    panel.append(
      card(
        "Daily upkeep",
        `<p>${livingParty(s).length} living companions require ${campCost(s)} rations and ${dailyWages(s)} crowns per day. ${s.wageDebt ? `${s.wageDebt} crowns are overdue.` : "Wages are up to date."} ${s.hungerDays ? `<strong>STARVING · day ${s.hungerDays}. Find food; hunger damages the company every day.</strong>` : "The company is fed."}</p>`,
      ),
    );
    const politics = card(
      "Factions & regional tales",
      "<p>Faction choices change trading terms, equipment access, and wilderness support. Regional story contracts are posted only at village boards.</p>",
    );
    for (const faction of factions) {
      const text = document.createElement("p");
      text.textContent = `${faction.name} · ${s.reputation[faction.id]} · ${factionStanding(s.reputation[faction.id])}. ${faction.desc}`;
      politics.append(text);
    }
    for (const story of regionalStories)
      if (s.stories[story.id]) {
        const text = document.createElement("p"),
          progress = s.stories[story.id];
        text.textContent = `${story.name} · ${progress.status}${progress.branch ? ` · ${story.choices.find((c) => c.id === progress.branch)?.label || ""}` : ""}`;
        politics.append(text);
      }
    panel.append(
      politics,
      card(
        "Trade cargo",
        `<p>${cargoLoad(s)}/${cargoCapacity} capacity · ${tradeGoods.map((g) => `${g.name}: ${s.cargo[g.id]}`).join(" · ")}</p><p>Visit village markets or nearby caravans to trade.</p>`,
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
    const adversaries = card(
      "Named adversaries",
      "<p>Find optional bounties at village contract boards. Each adversary awards one unique item and cannot be hunted repeatedly.</p>",
    );
    for (const boss of namedAdversaries) {
      const text = document.createElement("p");
      text.textContent = `${boss.name}: ${s.bounties[boss.id] ? `defeated on day ${s.bounties[boss.id].day}` : `${boss.minRenown} renown · bounty issued in ${places[boss.issuer].name}`}`;
      adversaries.append(text);
    }
    panel.append(adversaries);
    const trail = card(
      "Trail journal",
      `<p>${trailRegion(s)} · ${s.trailLedger[trailRegion(s)] === s.day ? "Scouted today" : "Scouting available outside villages"}. Scout once per region each day. Terrain, professions, traits, and faction standing shape your options.</p>`,
    );
    const history = document.createElement("details"),
      heading = document.createElement("summary");
    heading.textContent = `Recent encounters (${s.encounterJournal.length})`;
    history.append(heading);
    for (const entry of s.encounterJournal) {
      const template = trailEncounters.find((e) => e.id === entry.templateId),
        choice = template.choices.find((c) => c.id === entry.choiceId);
      const line = document.createElement("p");
      line.textContent = `Day ${entry.day} · ${entry.region} · ${template.title}: ${choice?.label || "Walked away"}. ${choice?.desc || ""}`;
      history.append(line);
    }
    trail.append(history);
    panel.append(trail);
    s.party.forEach((p) => {
      if (p.dead) {
        const memorial = card(
          `${p.name} · ${p.departed ? "Left company" : "Fallen"}`,
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
        `<p>Weapon: ${equippedItem(s, p, "weapon")?.name || "Company issue"}<br>Armor: ${equippedItem(s, p, "armor")?.name || "Company issue"}<br>Shield: ${equippedItem(s, p, "shield")?.name || "None"}<br>Helmet: ${equippedItem(s, p, "helmet")?.name || "None"}</p>`,
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
      const appearanceEditor = document.createElement("details");
      appearanceEditor.dataset.avatar = String(p.id);
      appearanceEditor.append(menuElement("summary", "Customize avatar"));
      for (const [key, label, opts] of [
        [
          "sex",
          "Sex",
          [
            ["male", "Male"],
            ["female", "Female"],
          ],
        ],
        ["coat", "Coat", companyBanners.map((b) => [b.color, b.name])],
        ["skin", "Skin tone", avatarSkins.map((v, i) => [v, `Tone ${i + 1}`])],
        [
          "hair",
          "Hair color",
          avatarHair.map((v, i) => [
            v,
            ["Dark", "Blond", "Silver", "Auburn"][i],
          ]),
        ],
        [
          "hairStyle",
          "Hairstyle",
          [
            ["short", "Short"],
            ["long", "Long"],
            ["braid", "Braid"],
          ],
        ],
      ]) {
        const input = creatorField(
          appearanceEditor,
          `${p.name} ${label}`,
          key === "coat"
            ? p.coat || companyBanners.find((b) => b.id === s.banner).color
            : avatarAppearance(p)[key],
          opts,
        );
        input.disabled = !!s.battle || !!s.event;
        input.onchange = () => {
          customizeAvatar(s, p.id, {
            ...avatarAppearance(p),
            [key]: input.value,
          });
          render();
          document.querySelector(`details[data-avatar="${p.id}"]`).open = true;
        };
      }
      c.append(appearanceEditor);
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
      progression.open = p.points > 0 && (!p.talent || !p.advancedSkill);
      const ability = document.createElement("p");
      ability.className = "hint";
      ability.textContent = `${skillFor(p).name} · ${skillFor(p).cost} valor · ${skillFor(p).desc}`;
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
      const advancedHint = document.createElement("p");
      advancedHint.className = "hint";
      advancedHint.textContent =
        "At level 4, spend two training points to permanently upgrade your class action. Requires a specialization. Choose one path; it replaces the basic skill and keeps your specialization's effects.";
      progression.append(advancedHint);
      for (const choice of advancedSkillsFor(p)) {
        const text = document.createElement("p");
        text.className = "hint";
        text.textContent = `${choice.name} · ${choice.cost} valor · ${choice.cooldown} round cooldown: ${choice.desc}`;
        progression.append(
          text,
          button(
            p.advancedSkill === choice.id
              ? `${choice.name} mastered`
              : `Master ${choice.name} · 2 points`,
            () => learnAdvancedSkill(s, p.id, choice.id),
            !!p.advancedSkill ||
              !p.talent ||
              p.level < 4 ||
              p.points < 2 ||
              !!s.battle ||
              !!s.event,
          ),
        );
      }
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
      button(`Forage · ${forageAmount(s)} rations / 6 hours`, () => forage(s)),
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
    const furnishings = card(
      "Camp furnishings",
      "<p>Place furnishings in one of six camp spaces. Table: +2 rest healing. Rack: +1 staffed forge ore. Brazier: shelter from storm fatigue.</p>",
    );
    for (const f of campFurniture) {
      const slot = document.createElement("select");
      slot.setAttribute("aria-label", `${f.name} space`);
      for (let i = 0; i < 6; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Space ${i + 1}`;
        slot.append(option);
      }
      const cost = document.createElement("p");
      cost.textContent = `${f.name}: ${f.wood} wood, ${f.gold} crowns to build; relocation is free.`;
      furnishings.append(cost);
      slot.value = s.campFurniture[f.id] ?? 0;
      furnishings.append(
        slot,
        button(
          `${s.campFurniture[f.id] === undefined ? "Build" : "Move"} ${f.name}`,
          () => placeFurniture(s, f.id, Number(slot.value)),
        ),
      );
    }
    panel.append(furnishings);
    for (const p of livingParty(s).filter(
      (p) => !p.storyComplete || (p.resolve ?? 65) <= 25,
    )) {
      const c = card(
        `${p.name}’s goal`,
        `<p>${personalGoal(p)}. Resolve ${Math.round(p.resolve ?? 65)}. Support costs 20 crowns${p.profession === "Smith" ? " and 3 ore; improves their weapon" : "; builds loyalty and morale"}.</p>`,
      );
      c.append(
        button(
          `Support ${p.name}`,
          () => companionStory(s, p.id, "support"),
          !!p.storyComplete ||
            s.gold < 20 ||
            (p.profession === "Smith" && s.inventory.ore < 3),
        ),
        button(
          `Refuse ${p.name}`,
          () => companionStory(s, p.id, "refuse"),
          !!p.storyComplete,
        ),
      );
      if ((p.resolve ?? 65) <= 25)
        c.append(
          button(`Release ${p.name}`, () => companionStory(s, p.id, "release")),
        );
      panel.append(c);
    }
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
    const maintenance = card(
      "Camp equipment maintenance",
      "<p>A staffed forge repairs worn gear with ore, wood and two hours of work per item. Higher Smith ranks reduce ore costs. View condition and repair quotes in Equipment.</p>",
    );
    maintenance.append(
      button("Open camp repairs", () => {
        tab = "Equipment";
      }),
    );
    panel.append(maintenance);
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
        "<p>Choose a companion to equip or transfer gear. Weapons fit their class; armor fits anyone. Bonuses add to permanent improvements. Battles wear equipped gear: at 25 condition bonuses are reduced; at zero gear bonuses and perks stop working. Repair here at a village or staffed camp forge. Gear stays locked during combat and encounters.</p>",
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
    for (const slot of equipmentSlots) {
      const item = equippedItem(s, p, slot);
      const line = document.createElement("p");
      line.textContent = `${slot[0].toUpperCase() + slot.slice(1)}: ${item?.name || "Company issue"}`;
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
      if (item.durability < 100) c.append(repairButton(item));
      const ownership = document.createElement("p");
      ownership.textContent = owner
        ? `Equipped by ${owner.name}`
        : "In company stores";
      if (owner?.id !== p.id && canEquipEquipment(s, item, p)) {
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
            !canEquipEquipment(s, item, p),
          true,
        ),
      );
      if (places[s.location]?.type === "town")
        c.append(
          button(
            `Sell ${item.name} · ${equipmentSalePrice(item)} crowns`,
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
          `<p>Destination: ${places[s.contract.target].name}</p><p>Reward: ${s.contract.reward} crowns</p><span class="badge">ACTIVE · ${s.contract.kind === "story" ? `${s.contract.phase === "investigate" ? "Investigate and choose" : s.contract.phase === "return" ? "Return to claim reward" : "Win the faction battle"}` : s.contract.kind === "delivery" ? "Deliver 5 rations" : `Defeat ${contractDifficulty(s.contract).enemies} enemies`}</span>`,
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
  if (tab === "Contracts") {
    panel.append(
      card(
        "Named bounties",
        "<p>Optional adversaries have special mechanics and one-time unique rewards. Review the encounter before accepting.</p>",
      ),
    );
    if (s.contract?.kind === "boss")
      panel.append(
        button(
          "Abandon bounty",
          () => abandonBounty(s),
          !!s.battle || !!s.event,
        ),
      );
    for (const boss of bountyOffers(s)) {
      const locked = bountyLock(s, boss),
        c = card(
          boss.name,
          `<p>Optional bounty at ${places[boss.target].name} · ${boss.minRenown} renown required.</p><p>${boss.mechanic}</p><p>${boss.reward} crowns and ${equipmentCatalog.find((item) => item.id === boss.gear).name}. Faction reputation and normal battle progression also apply.</p>${locked ? `<p>${locked}</p>` : ""}`,
        );
      c.append(
        button(
          s.bounties[boss.id]
            ? `${boss.name} defeated`
            : `Accept bounty: ${boss.name}`,
          () => acceptBounty(s, boss.id),
          !!locked,
          true,
        ),
      );
      panel.append(c);
    }
    panel.append(
      card(
        "Regional stories",
        "<p>One-time branching contracts connect the regions. Your choices affect factions and unlock the next chapter.</p>",
      ),
    );
    for (const story of storyOffers(s)) {
      const locked = storyLock(s, story),
        c = card(
          story.name,
          `<p>Investigate ${places[story.target].name}. ${story.text}</p><p>${locked || "Choose a side or seek a peaceful solution. Rewards depend on your decisions."}</p>`,
        );
      c.append(
        button(
          `Accept ${story.name}`,
          () => acceptStory(s, story.id),
          !!locked || !!s.contract,
        ),
      );
      panel.append(c);
    }
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
      const locked = researchLock(s, r.id);
      if (!done && locked) {
        const hint = document.createElement("p");
        hint.textContent = locked;
        el.append(hint);
      }
      el.append(
        button(
          done ? "Discovered" : "Research",
          () => research(s, r.id),
          !!locked,
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
    [
      "Town",
      "Market",
      "Blacksmith",
      "Tavern",
      "Contracts",
      "Training",
    ].includes(tab)
  ) {
    if (tab !== "Town")
      panel.prepend(
        button("Back to village", () => {
          tab = "Town";
        }),
      );
    if (tab === "Town") {
      if (s.crime.wanted) {
        const c = card(
          "Village guard",
          `<p>Wanted ${s.crime.wanted}/10. Witnesses reported your raids. Pay ${s.crime.wanted * 20} crowns and surrender carried trade goods to stop pursuit.</p>`,
        );
        c.append(
          button(
            "Pay fine and surrender cargo",
            () => payCrimeFine(s),
            s.gold < s.crime.wanted * 20,
          ),
        );
        panel.append(c);
      }
      if (
        s.contract?.kind === "story" &&
        s.contract.phase === "return" &&
        s.contract.target === s.location
      )
        panel.append(
          button("Claim story reward", () => interactStory(s), false, true),
        );
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
          "Training hall",
          "Training",
          "Pay local tutors to improve companion professions.",
        ],
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
    if (tab === "Training") {
      panel.append(
        card(
          "Local tutors",
          `<p>${places[s.location].name} teaches ${villageTutors[s.location].join(" and ")}. A lesson grants 3 profession practice and takes 3 hours. One lesson per companion per day, across all villages and professions. Apprentices need 5 renown to continue training; Journeymen need 15. Masters need no lessons.</p><p>The whole company waits during lessons: fatigue, food, wages, and starvation still apply. A fair bargain discounts tuition by 20%.</p>`,
        ),
      );
      for (const p of livingParty(s)) {
        const quote = lessonQuote(s, p.id),
          locked = lessonLock(s, p.id);
        const c = card(
          p.name,
          `<p>${p.profession} · ${rankNames[professionRank(p)]} · ${p.professionXP} practice${quote.rank < 3 ? ` / ${[3, 8, 15][quote.rank]} for next rank` : " · mastered"}</p><p>${quote.price} crowns · 3 hours · +3 practice</p>`,
        );
        if (locked) {
          const hint = document.createElement("p");
          hint.textContent = locked;
          c.append(hint);
        }
        c.append(
          button(
            `Train ${p.name} · ${p.profession}`,
            () => takeLesson(s, p.id),
            !!locked,
            true,
          ),
        );
        panel.append(c);
      }
    }
    if (tab === "Market") {
      const market = card("Quartermaster", "");
      for (const [id, label] of [
        ["food", "10 rations"],
        ["ore", "3 ore"],
        ["wood", "3 wood"],
        ["herbs", "3 herbs"],
        ["medicine", "1 medicine"],
      ]) {
        const offer = supplyOffer(s, id);
        market.append(
          button(
            `${label} · ${offer.price} crowns`,
            () => buy(s, id),
            s.gold < offer.price,
          ),
        );
      }
      panel.append(market);
      const resale = card(
        "Sell supplies",
        "<p>Turn surplus loot into crowns. Keep materials needed for crafting.</p>",
      );
      for (const item of Object.keys(salePrices)) {
        const price = regionalSalePrice(s, item);
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
      const stock = marketState(s),
        marketInfo = card(
          "Regional trade",
          `<p>Cargo ${cargoLoad(s)}/${cargoCapacity}. ${stock.demand > 0 ? `Shortage: ${stock.shortage} · ${stock.demand} units still needed. Deliver goods to earn League reputation.` : "The regional shortage has been relieved."} Stocks and demand change every three days. Selling a bulk load quotes each unit as the shortage is filled.</p>`,
        );
      panel.append(marketInfo);
      for (const good of tradeGoods) {
        const c = card(
          good.name,
          `<p>${s.cargo[good.id]} carried · ${stock.stock[good.id]} in stock. Buy ${tradePrice(s, good.id)} / sell ${tradePrice(s, good.id, "sell")} crowns per unit.</p>`,
        );
        for (const quantity of [1, 5]) {
          const cost = tradeQuote(s, good.id, quantity);
          c.append(
            button(
              `Buy ${quantity} ${good.id} · ${cost} crowns`,
              () => tradeGoodsAtVillage(s, good.id, quantity),
              s.gold < cost ||
                stock.stock[good.id] < quantity ||
                cargoLoad(s) + quantity > cargoCapacity,
            ),
          );
        }
        if (s.cargo[good.id]) {
          const quantity = s.cargo[good.id],
            value = tradeQuote(s, good.id, quantity, "sell");
          c.append(
            button(`Sell ${quantity} ${good.id} · ${value} crowns`, () =>
              tradeGoodsAtVillage(s, good.id, quantity, "sell"),
            ),
          );
        }
        panel.append(c);
      }
    }
    if (tab === "Tavern") {
      panel.append(
        card(
          "Local rumors",
          "<p>Buy a round and listen for exploration leads: 8 crowns and one hour. A rumor marks a landmark without revealing nearby terrain. Explore it for a one-time find; your active contract stays available. Heard rumors are kept in the Journal.</p>",
        ),
      );
      for (const rumor of tavernRumors.filter((r) => r.issuer === s.location)) {
        const locked = rumorLock(s, rumor.id),
          c = card(
            rumor.name,
            `<p>${rumor.desc}</p><p>Find: ${Object.entries(rumor.reward)
              .map(([r, n]) => `${n} ${r === "gold" ? "crowns" : r}`)
              .join(" · ")}</p>`,
          );
        if (locked) {
          const hint = document.createElement("p");
          hint.textContent = locked;
          c.append(hint);
        }
        c.append(
          button(
            `Hear rumor: ${rumor.name}`,
            () => hearRumor(s, rumor.id),
            !!locked,
          ),
        );
        panel.append(c);
      }

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
    const repairs = card(
      "Equipment repairs",
      "<p>Restore damaged equipment to full condition. Equipped items can be repaired outside combat. Camp repairs require a staffed forge and materials instead of crowns.</p>",
    );
    for (const entry of s.gear) {
      const item = gearItem(s, entry.id);
      if (item.durability < 100) {
        const row = equipmentCard(item);
        row.append(repairButton(item));
        repairs.append(row);
      }
    }
    if (!s.gear.some((entry) => gearItem(s, entry.id).durability < 100))
      repairs.append(
        document.createTextNode(
          "All company equipment is serviceable at full condition.",
        ),
      );
    panel.append(repairs);
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
          s.gold < price ||
            (item.tier === 2 && s.renown < 5 && s.reputation.wardens < 10),
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
  if (tab === "Caravan") {
    const caravan = nearbyPatrols(s).find(
      (p) => p.id === caravanId && p.kind === "merchant" && !p.hostile,
    );
    if (caravan) {
      panel.append(
        card(
          caravan.name,
          `<p>Carried cargo ${cargoLoad(s)}/${cargoCapacity}. Caravan food: ${caravan.foodStock} rations. Cargo purchases reduce its stock; raiding seizes remaining cargo and harms League and Warden reputation.</p>`,
        ),
      );
      for (const good of tradeGoods) {
        const cost = caravanCargoPrice(s, good.id),
          c = card(
            good.name,
            `<p>${caravan.cargo[good.id]} available · ${s.cargo[good.id]} carried.</p>`,
          );
        c.append(
          button(
            `Buy caravan ${good.id} · ${cost} crowns`,
            () => tradeCaravanCargo(s, caravan.id, good.id),
            s.gold < cost ||
              caravan.cargo[good.id] < 1 ||
              cargoLoad(s) >= cargoCapacity,
          ),
        );
        panel.append(c);
      }
    } else
      panel.append(
        card(
          "Caravan unavailable",
          "<p>Approach a friendly caravan to trade its cargo.</p>",
        ),
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
    $("map-label").textContent = `${s.companyName} · camp`;
  } else if (s.event) {
    const c = card(s.event.title, `<p>${s.event.text}</p>`);
    c.id = "event";
    if (s.event.kind === "dungeon") {
      const e = s.event,
        layout = dungeonLayout(e.site),
        c = card(
          `${places[e.site].name} · ${layout.name}`,
          `<p>${e.message}</p><p>Company position ${e.x + 1},${e.y + 1}. Arrow tiles move one square. Inspect walls for secrets. Unstable ground and traps hurt the party. Sentries guard the eastern vault.</p>`,
        );
      c.id = "event";
      const grid = document.createElement("div");
      grid.className = "dungeon-grid";
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 9; x++) {
          const blocked = dungeonWalls(s).some(([a, b]) => a === x && b === y);
          grid.append(
            button(
              e.x === x && e.y === y
                ? "Party"
                : blocked
                  ? "Wall"
                  : x === 8 && y === 5
                    ? "Vault"
                    : x === 7 && y === 5
                      ? "Guard"
                      : [1, 5].includes(x) &&
                          y === 1 &&
                          places[e.site].type === "mine"
                        ? "Ore"
                        : (x === layout.trap[0] && y === layout.trap[1]) ||
                            (x === layout.collapse[0] &&
                              y === layout.collapse[1])
                          ? "Trap"
                          : "·",
              () => dungeonAction(s, "move", x, y),
              blocked || Math.abs(x - e.x) + Math.abs(y - e.y) !== 1,
            ),
          );
          grid.lastChild.setAttribute(
            "aria-label",
            `Dungeon tile ${x + 1},${y + 1}`,
          );
        }
      c.append(
        grid,
        button(
          "Mine deposit · 1 hour",
          () => dungeonAction(s, "mine"),
          places[e.site].type !== "mine" ||
            e.y !== 1 ||
            ![1, 5].includes(e.x) ||
            !professional(s, "Miner") ||
            !!s.siteProgress[`deposit-${e.site}-${e.x}`],
        ),
        button(
          "Disarm darts · 1 wood / 1 hour",
          () => dungeonAction(s, "disarm"),
          s.inventory.wood < 1 ||
            !!s.siteProgress[`hazard-${e.site}-3`] ||
            Math.abs(e.x - layout.trap[0]) + Math.abs(e.y - layout.trap[1]) > 1,
        ),
        button("Inspect nearby walls", () => dungeonAction(s, "inspect")),
        button(
          "Reinforce passage · 2 wood",
          () => dungeonAction(s, "shore"),
          s.inventory.wood < 2 || !!s.siteProgress[`shore-${e.site}`],
        ),
        button(
          "Open guarded vault",
          () => dungeonAction(s, "vault"),
          e.x !== 8 ||
            e.y !== 5 ||
            !s.siteProgress[`guard-${e.site}`] ||
            !!s.siteProgress[`vault-${e.site}`],
        ),
        button("Leave dungeon", () => dungeonAction(s, "leave")),
      );
      a.append(c);
    } else if (s.event.kind === "farm") {
      const c = card("Ashbrook Farm", `<p>${s.event.message}</p>`);
      c.id = "event";
      for (const [action, label] of [
        ["clue", "Read the farmer’s ledger"],
        ["cellar", "Open the cellar"],
        ["well", "Search the old well"],
      ])
        c.append(
          button(
            label,
            () => farmAction(s, action),
            !!s.siteProgress[`farm-${action}-13`],
          ),
        );
      c.append(button("Leave farm", () => farmAction(s, "leave")));
      a.append(c);
    } else if (s.event.kind === "site") {
      const e = s.event;
      $("objective").textContent =
        `Inside ${places[e.site].name} · ${e.stage}. ${e.message}`;
      const c = card(
        e.site === 10 ? "Buried stash" : "Mine interior",
        e.site === 10
          ? "<p>A broken oak marks the southwest square. The inscription reads: three squares east, one square north. Search the ground, then pick the chest’s three pins.</p>"
          : "<p>Walk into the timbered gallery, inspect the abandoned cart, and enter the ore chamber to survey the exposed seam.</p>",
      );
      if (e.message) {
        const feedback = document.createElement("p");
        feedback.textContent = e.message;
        c.append(feedback);
      }
      if (e.site === 10 && e.stage === "search") {
        const grid = document.createElement("div");
        grid.className = "stash-grid";
        for (let i = 0; i < 16; i++)
          grid.append(
            button(
              i === 8
                ? "Broken oak"
                : `Search ${(i % 4) + 1},${Math.floor(i / 4) + 1}`,
              () => siteAction(s, "search", i),
            ),
          );
        c.append(grid);
      }
      if (e.site === 10 && e.stage === "lock") {
        c.append(
          document.createTextNode(
            `Pin ${e.pin + 1}/3 · Strain ${e.strain}/3. Listen to the tension feedback.`,
          ),
        );
        const dial = document.createElement("input");
        dial.type = "range";
        dial.min = 0;
        dial.max = 5;
        dial.step = 1;
        dial.value = 0;
        dial.setAttribute("aria-label", "Lockpick dial");
        const value = document.createElement("span");
        value.textContent = "Dial 0";
        dial.oninput = () => (value.textContent = `Dial ${dial.value}`);
        c.append(
          dial,
          value,
          button("Test tension", () =>
            siteAction(s, "pick", Number(dial.value)),
          ),
        );
      }
      if (e.site !== 10) {
        c.append(
          button("Entrance", () => siteAction(s, "entrance")),
          button("Enter gallery", () => siteAction(s, "gallery")),
          button("Enter ore chamber", () => siteAction(s, "vein")),
        );
        if (e.stage === "gallery")
          c.append(
            button(
              "Inspect abandoned cart",
              () => siteAction(s, "cart"),
              !!s.siteProgress[`cart-${e.site}`],
            ),
          );
        if (e.stage === "vein")
          c.append(
            button(
              "Survey ore seam",
              () => siteAction(s, "mine"),
              s.explored.includes(e.site),
            ),
          );
      }
      c.append(button("Leave site", () => siteAction(s, "leave")));
      a.append(c);
    } else if (s.event.kind === "story") {
      const story = regionalStories.find((q) => q.id === s.event.storyId);
      for (const choice of story.choices) {
        const row = card(choice.label, `<p>${choice.desc}</p>`),
          locked = storyChoiceLock(s, choice);
        if (locked) {
          const hint = document.createElement("p");
          hint.textContent = locked;
          row.append(hint);
        }
        row.append(
          button(choice.label, () => chooseStory(s, choice.id), !!locked, true),
        );
        c.append(row);
      }
    } else if (s.event.kind === "trail") {
      for (const choice of trailEncounterOptions(s)) {
        const row = card(choice.label, `<p>${choice.desc}</p>`),
          locked = trailChoiceLock(s, choice);
        if (locked) {
          const hint = document.createElement("p");
          hint.textContent = locked;
          row.append(hint);
        }
        row.append(
          button(
            choice.label,
            () => resolveEvent(s, choice.id),
            !!locked,
            true,
          ),
        );
        c.append(row);
      }
    } else if (s.event.kind === "camp")
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
    if (!["site", "dungeon", "farm"].includes(s.event.kind)) a.append(c);
  } else if (s.battle) {
    if (s.party[selected].role === "Archer")
      a.append(
        button("Overwatch", () => tacticalAction(s, selected, "overwatch")),
      );
    if (s.party[selected].role === "Shieldbearer")
      a.append(
        button("Shield wall", () => tacticalAction(s, selected, "wall")),
      );
    a.append(
      button("Push adjacent enemy · 1 valor", () =>
        tacticalAction(s, selected, "push"),
      ),
    );
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
        `Disengage · ${disengageCost(s, selected)} valor`,
        () => disengage(s, selected),
        s.battle.units.find((u) => u.id === selected)?.acted ||
          s.battle.units.find((u) => u.id === selected)?.moved ||
          s.battle.valor < disengageCost(s, selected),
      ),
      button(
        "Brace · reduce damage",
        () => guard(s, selected),
        s.battle.units.find((u) => u.id === selected)?.acted,
      ),
      button("Retreat · lose 15 crowns", () => retreatBattle(s)),
    );
    const actor = s.party[selected],
      unit = s.battle.units.find((u) => u.id === selected),
      skill = skillFor(actor);
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
    const previewCard = card(
      "Target previews",
      "<p>Damage includes armor, cover and flanking. Abilities can add status effects. Hover terrain for movement risks; disengage before leaving a melee enemy.</p>",
    );
    for (const enemy of s.battle.enemies.filter((e) => e.hp > 0)) {
      const preview = combatPreview(s, selected, enemy.x, enemy.y, abilityMode);
      previewCard.append(
        button(
          `${enemy.name || enemy.kind}: ${preview.text || preview.reason}`,
          () => {
            if (abilityMode) useSkill(s, selected, enemy.x, enemy.y);
            else act(s, selected, enemy.x, enemy.y);
          },
          !preview.allowed,
        ),
      );
    }
    const moves = document.createElement("details"),
      moveSummary = document.createElement("summary");
    moveSummary.textContent = "Movement previews";
    moves.append(moveSummary);
    const moveChoice = document.createElement("select");
    moveChoice.setAttribute("aria-label", "Preview movement destination");
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 9; x++) {
        const preview = combatPreview(s, selected, x, y);
        if (preview.kind !== "move" || !preview.allowed) continue;
        const option = document.createElement("option");
        option.value = `${x},${y}`;
        option.textContent = `${x + 1},${y + 1} · ${preview.text}`;
        moveChoice.append(option);
      }
    if (moveChoice.options.length) {
      const moveDescription = document.createElement("p"),
        moveButton = button("Move to previewed tile", () => {
          const [x, y] = moveChoice.value.split(",").map(Number);
          act(s, selected, x, y);
        });
      const updateMove = () => {
        const [x, y] = moveChoice.value.split(",").map(Number);
        moveDescription.textContent = combatPreview(s, selected, x, y).text;
      };
      moveChoice.onchange = updateMove;
      updateMove();
      moves.append(moveChoice, moveDescription, moveButton);
    } else
      moves.append(
        document.createTextNode("No movement remains for this companion."),
      );
    previewCard.append(moves);
    previewCard.classList.add("target-previews");
    const previews = document.createElement("details");
    previews.className = "combat-preview-menu";
    const summary = document.createElement("summary");
    summary.textContent = "Target previews";
    previews.append(summary, previewCard);
    a.append(previews);
    const report = document.createElement("p");
    report.id = "combat-report";
    report.setAttribute("role", "status");
    report.textContent = s.log[0] || "";
    a.append(report);
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
      button(`Forage · +${forageAmount(s)} rations / 6 hours`, () => forage(s)),
      button(
        "Scout surroundings · 1 hour",
        () => {
          drawerOpen = false;
          heldKeys.clear();
          scoutSurroundings(s);
        },
        !!scoutLock(s),
      ),
    );
    a.lastChild.title =
      scoutLock(s) ||
      `Scout the ${trailRegion(s)} for a terrain-based encounter. Once per region each day; scouting takes one hour.`;
    a.append(
      button(
        s.ambushReady
          ? "Ambush prepared"
          : "Prepare ambush · 1 ration / 2 hours",
        () => prepareAmbush(s),
        !!s.ambushReady,
      ),
    );
    if (s.location === 13)
      a.append(
        button("Explore abandoned farm", () => enterFarm(s), false, true),
      );
    if (["mine", "ruin"].includes(places[s.location]?.type))
      a.append(button("Explore dungeon", () => enterDungeon(s)));
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
    if (
      s.location >= 0 &&
      places[s.location]?.type !== "town" &&
      s.location !== 13
    )
      a.append(
        button(
          [4, 9, 10].includes(s.location)
            ? `Enter ${places[s.location].name}`
            : s.explored.includes(s.location)
              ? "Site explored"
              : "Explore · knowledge & materials",
          () => ([4, 9, 10].includes(s.location) ? enterSite(s) : explore(s)),
          s.explored.includes(s.location) && ![4, 9, 10].includes(s.location),
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
    if (s.contract?.target === s.location) {
      if (s.contract.kind === "story")
        a.append(
          button(
            s.contract.phase === "battle"
              ? "Fight for your chosen faction"
              : s.contract.phase === "return"
                ? "Claim story reward"
                : `Investigate ${s.contract.name}`,
            () => {
              drawerOpen = false;
              s.contract.phase === "battle" ? startBattle(s) : interactStory(s);
            },
            false,
            true,
          ),
        );
      else
        a.append(
          button(
            s.contract.kind === "delivery"
              ? "Deliver 5 rations"
              : s.contract.kind === "boss"
                ? `Challenge ${namedAdversaries.find((boss) => boss.id === s.contract.bossId).name}`
                : "Engage raiders",
            () =>
              s.contract.kind === "delivery" ? deliver(s) : startBattle(s),
            s.contract.kind === "delivery" && s.food < 5,
            true,
          ),
        );
    }
    nearbyPatrols(s).forEach((p) => {
      if (p.kind === "merchant") {
        if (!p.hostile)
          a.append(
            button(
              `Trade · 10 rations / ${caravanFoodPrice(s)} crowns`,
              () => tradeCaravan(s, p.id),
              s.gold < caravanFoodPrice(s) || p.foodStock < 10,
            ),
          );
        if (!p.hostile)
          a.append(
            button("View caravan cargo", () => {
              caravanId = p.id;
              tab = "Caravan";
              drawerOpen = true;
            }),
          );
        a.append(button(`Attack ${p.name}`, () => startBattle(s, p.id)));
        a.lastChild.title =
          "Fight caravan guards for 60 crowns, up to 10 remaining rations, and available cargo. First attack costs 10 morale and 5 renown, League −12 and Wardens −6; the caravan stops trading.";
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
  const rumorJournal = $("rumor-journal");
  rumorJournal.replaceChildren();
  for (const rumor of tavernRumors.filter((r) => s.rumors[r.id])) {
    const record = s.rumors[rumor.id],
      c = card(
        rumor.name,
        `<p>${rumor.desc}</p><p>${record.resolvedDay ? `Confirmed on day ${record.resolvedDay}` : `Heard on day ${record.heardDay} · Explore ${places[rumor.target].name}`}</p>`,
      );
    if (!record.resolvedDay)
      c.append(
        button(
          `Walk to ${places[rumor.target].name}`,
          () => {
            moveTo(s, places[rumor.target].x, places[rumor.target].y);
            drawerOpen = false;
          },
          !!s.battle || !!s.event || !!s.campOpen || companyLost(s),
        ),
      );
    rumorJournal.append(c);
  }
  if (!rumorJournal.children.length)
    rumorJournal.textContent =
      "No rumors heard yet. Visit a village tavern for exploration leads.";
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
  renderHelp();
  draw();
}
function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function person(x, y, c, step = 0, role = "", variant = 0, appearance = {}) {
  drawCharacter(ctx, x, y, c, step, role, variant, appearance);
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
  if (["site", "dungeon", "farm"].includes(s.event?.kind)) {
    view.scale = Math.min(w / 768, Math.max(160, h - 160) / 432);
    view.x = (768 - w / view.scale) / 2;
    view.y = (432 - Math.max(160, h - 160) / view.scale) / 2;
    ctx.setTransform(
      view.scale,
      0,
      0,
      view.scale,
      -view.x * view.scale,
      -view.y * view.scale,
    );
    if (s.event.kind === "dungeon") drawDungeonInterior(ctx, s);
    else if (s.event.kind === "farm") drawFarmInterior(ctx, s);
    else drawSiteInterior(ctx, s);
    return;
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
    drawBattlefield(ctx, s);
    const threat = bossThreat(s);
    if (threat)
      for (const tile of threat.tiles) {
        ctx.fillStyle = "#b37044";
        ctx.globalAlpha = 0.35;
        ctx.fillRect(107 + tile.x * 62, 2 + tile.y * 60, 56, 54);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#a55538";
        ctx.lineWidth = 2;
        ctx.strokeRect(108 + tile.x * 62, 3 + tile.y * 60, 54, 52);
        ctx.fillStyle = "#77432e";
        ctx.font = "8px monospace";
        ctx.textAlign = "left";
        ctx.fillText("FIRE NEXT", 111 + tile.x * 62, 54 + tile.y * 60);
      }

    const active = s.battle.units.find((u) => u.id === selected);
    if (active && (!active.acted || active.safeMove)) {
      const p = s.party[selected],
        range = attackRange(p, abilityMode, s);
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
            (enemy &&
              !active.acted &&
              distance <= range &&
              hasLineOfSight(s, active, { x, y })) ||
            (!abilityMode &&
              !active.moved &&
              !enemy &&
              !occupied &&
              distance > 0 &&
              battlePath(s, active, x, y) !== null)
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
        const visual = combatPosition(
          `enemy-${s.battle.enemies.indexOf(e)}`,
          e,
        );
        if (e.kind === "wolf")
          drawWolf(ctx, 136 + visual.x * 62, 28 + visual.y * 60);
        else
          person(
            136 + visual.x * 62,
            28 + visual.y * 60,
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
          `${e.name?.split(" ")[0] || e.kind || "raider"}${e.stun ? " STUN" : ""}${e.root ? " ROOT" : ""}${e.bleed ? " BLEED" : ""}`,
          136 + visual.x * 62,
          12 + visual.y * 60,
        );
        rect(117 + visual.x * 62, 49 + visual.y * 60, 38, 5, "#777451");
        rect(118 + visual.x * 62, 50 + visual.y * 60, 36, 3, "#c5b78a");
        rect(
          118 + visual.x * 62,
          50 + visual.y * 60,
          Math.round((36 * e.hp) / e.max),
          3,
          "#a65f49",
        );
      });
    for (const enemy of s.battle.enemies.filter(
      (enemy) => enemy.bossId && enemy.hp > 0,
    )) {
      ctx.strokeStyle = "#c1a15d";
      ctx.lineWidth = 1;
      ctx.strokeRect(116 + enemy.x * 62, 48 + enemy.y * 60, 40, 7);
    }
    s.battle.units
      .filter((u) => s.party[u.id].hp > 0)
      .forEach((u) => {
        const visual = combatPosition(`party-${u.id}`, u);
        if (selected === u.id) {
          ctx.strokeStyle = "#5b6541";
          ctx.strokeRect(108 + visual.x * 62, 3 + visual.y * 60, 54, 52);
        }
        person(
          136 + visual.x * 62,
          28 + visual.y * 60,
          u.acted ? "#889079" : s.party[u.id].coat || partyCoats[u.id],
          0,
          s.party[u.id].role,
          u.id,
          s.party[u.id],
        );
        drawLoadout(
          ctx,
          s,
          s.party[u.id],
          136 + visual.x * 62,
          28 + visual.y * 60,
        );
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#474b33";
        ctx.fillText(
          s.party[u.id].name,
          136 + visual.x * 62,
          12 + visual.y * 60,
        );
        rect(117 + visual.x * 62, 49 + visual.y * 60, 38, 5, "#777451");
        rect(118 + visual.x * 62, 50 + visual.y * 60, 36, 3, "#c5b78a");
        rect(
          118 + visual.x * 62,
          50 + visual.y * 60,
          (36 * s.party[u.id].hp) / s.party[u.id].max,
          3,
          "#a2b477",
        );
      });
    drawCombatEffects();
    drawLighting(ctx, s, canvas.width, canvas.height);
    drawWeather(ctx, s);
    return;
  }
  ctx.drawImage(worldArtwork(), 0, 0);
  ctx.drawImage(fogArtwork(s.charted), 0, 0);
  places.forEach((p, i) => {
    if (!s.discovered.includes(i) && s.contract?.target !== i) return;
    drawLandmark(ctx, p, i);
    drawMapLabel(ctx, p.name, p.x, p.y + (p.type === "town" ? 58 : 39));
    if (
      tavernRumors.some(
        (r) => r.target === i && s.rumors[r.id] && !s.rumors[r.id].resolvedDay,
      ) &&
      s.contract?.target !== i
    )
      drawMapLabel(ctx, "RUMOR", p.x, p.y - (p.type === "town" ? 53 : 37));
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
          Math.max(
            60,
            (s.research.includes("scouting") ? 210 : 140) -
              weatherInfo(s).visibility,
          ),
    )
    .forEach((p) => {
      const hostile = p.kind !== "merchant" || p.hostile;
      const color = hostile ? "#a16c54" : "#b39d69";
      if (p.kind === "wolves") {
        drawWolf(ctx, p.x - 12, p.y, 1);
        drawWolf(ctx, p.x + 10, p.y + 8, -1);
        drawMapLabel(ctx, p.name, p.x, p.y - 37, true);
        return;
      }
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
      const step =
        s.destination && !menuSettings.reduceMotion
          ? Math.sin(performance.now() / 100 + p.i * 1.7) > 0
            ? 2
            : -2
          : 0;
      person(
        p.x,
        p.y,
        s.party[p.i].coat || partyCoats[p.i],
        step,
        s.party[p.i].role,
        p.i,
        s.party[p.i],
      );
      drawLoadout(ctx, s, s.party[p.i], p.x, p.y);
    });
  drawLighting(ctx, s, canvas.width, canvas.height);
  drawWeather(ctx, s);
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
  stopMovement(s);
  heldKeys.clear();
  render();
  gameActive = false;
  showFrontMenu();
};
showFrontMenu();

$("close-drawer").onclick = () => {
  if (s.campOpen) {
    leaveCamp(s);
    tab = "Company";
  }
  drawerOpen = false;
  render();
};
let previousFrame = 0,
  lastSave = 0,
  lastCampDraw = 0;
function updateClockUI() {
  let weather = $("weather-label");
  if (!weather) {
    weather = document.createElement("span");
    weather.id = "weather-label";
    $("resources").append(weather);
  }
  weather.textContent = weatherInfo(s).label;
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
  if (!gameActive) {
    previousFrame = time;
    requestAnimationFrame(animate);
    return;
  }
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
    advanceClock(s, seconds * (menuSettings.slowDays ? 0.5 : 1));
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
  for (const [key, motion] of combatMotion)
    if (time - motion.start >= 320) combatMotion.delete(key);
  if (
    s.battle &&
    (combatEffects.length || combatMotion.size) &&
    !document.hidden
  )
    draw();
  if (
    s.campOpen &&
    !document.hidden &&
    !menuSettings.reduceMotion &&
    time - lastCampDraw > 400
  ) {
    draw();
    lastCampDraw = time;
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
  if (!gameActive) return;
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
  if (x >= 0 && x < 9 && y >= 0 && y < 7) {
    const tile = terrainCell(s, x, y);
    $("map-label").textContent = tile.blocked
      ? `${tile.kind} · impassable · ${tile.blocksSight ? "blocks sight" : "clear sight"}`
      : `${tile.kind} · movement cost ${tile.cost} · ranged cover ${tile.cover}`;
  }
  if (enemy)
    $("map-label").textContent =
      `${enemy.name || enemy.kind || "raider"} · HP ${enemy.hp}/${enemy.max} · Armor ${enemy.armor || 0} · Range ${enemy.kind === "archer" ? 4 : 1}${enemy.kind === "wolf" ? ` · Rush ${enemy.bossId === "ashfang" ? 3 : 2} · pack hunter` : enemy.kind === "archer" ? " · Keeps distance" : " · Melee flanking +2"}${enemy.stun ? " · Stunned" : ""}${enemy.bleed ? " · Bleeding" : ""}${enemy.bossId ? ` · ${namedAdversaries.find((boss) => boss.id === enemy.bossId)?.mechanic || "Named adversary"}` : ""}`;
  if (x >= 0 && x < 9 && y >= 0 && y < 7) {
    const preview = combatPreview(s, selected, x, y, abilityMode);
    $("map-label").textContent += ` · ${preview.text || preview.reason}`;
  }
});

function menuRead(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function menuWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function menuElement(tag, text, className) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (className) e.className = className;
  return e;
}
function menuButton(text, fn, disabled = false) {
  const b = menuElement("button", text);
  b.type = "button";
  b.disabled = disabled;
  b.onclick = fn;
  return b;
}
function menuMessage(text) {
  let e = $("menu-message");
  if (!e) {
    e = menuElement("p", "", "menu-message");
    e.id = "menu-message";
    e.setAttribute("role", "status");
    $("menu-content").append(e);
  }
  e.textContent = text;
}
function menuShell(title) {
  gameActive = false;
  heldKeys.clear();
  document.body.classList.add("menu-open");
  $("front-menu").hidden = false;
  for (const e of document.querySelectorAll(
    "body > header, body > main, body > footer",
  ))
    e.inert = true;
  applyMenuSettings();
  const root = $("menu-content");
  root.replaceChildren();
  root.append(
    menuElement("div", "THE BORDERLANDS AWAIT", "eyebrow"),
    menuElement("h1", "PIXEL TALES"),
    menuElement("h2", title),
  );
  return root;
}
function applyMenuSettings() {
  document.body.classList.toggle("large-text", menuSettings.largeText);
  document.body.classList.toggle("reduce-motion", menuSettings.reduceMotion);
}
function beginPlaying(company) {
  hasSessionCompany = true;
  s = company;
  gameActive = true;
  observedLocation = null;
  pendingVillage = null;
  selected = 0;
  abilityMode = false;
  drawerOpen = false;
  tab = "Company";
  heldKeys.clear();
  $("front-menu").hidden = true;
  document.body.classList.remove("menu-open");
  for (const e of document.querySelectorAll(
    "body > header, body > main, body > footer",
  ))
    e.inert = false;
  render();
}
function showFrontMenu() {
  const root = menuShell("A company of your own"),
    saved = hasSessionCompany ? s : menuRead("pixel-tales"),
    valid = isCompanySave(saved);
  root.append(
    menuElement(
      "p",
      "Walk the open map. Build your camp. Decide what kind of company survives.",
      "menu-intro",
    ),
  );
  if (valid)
    root.append(
      menuElement(
        "p",
        `${saved.companyName || "The Ashen Company"} · Day ${saved.day} · ${saved.party.filter((p) => !p.dead).length} companions`,
        "save-preview",
      ),
    );
  else if (saved)
    root.append(
      menuElement(
        "p",
        "The autosave could not be read. It has been kept; you can load a manual save.",
        "menu-message",
      ),
    );
  const controls = menuElement("div", "", "menu-controls");
  controls.append(
    menuButton("Continue", () => beginPlaying(restore(saved)), !valid),
    menuButton("New Company", showCompanyCreator),
    menuButton("Load", showLoadMenu),
    menuButton("Settings", showSettingsMenu),
  );
  root.append(controls);
  root.append(
    menuElement(
      "p",
      "Progress saves in this browser. Manual slots keep separate snapshots.",
      "menu-footnote",
    ),
  );
}
function showLoadMenu() {
  const root = menuShell("Saved companies");
  root.append(
    menuElement(
      "p",
      "Continue uses the latest autosave. Save a snapshot in one of three slots before trying a different company.",
      "menu-intro",
    ),
  );
  const entries = menuRead("pixel-tales-slots", []),
    slots = Array.isArray(entries) ? entries.slice(0, 3) : [];
  const current = hasSessionCompany ? s : menuRead("pixel-tales");
  for (let i = 0; i < 3; i++) {
    const entry = slots[i],
      valid = isCompanySave(entry?.state),
      c = menuElement("section", "", "menu-save-card");
    c.append(menuElement("h3", `Slot ${i + 1}`));
    c.append(
      menuElement(
        "p",
        valid
          ? `${entry.state.companyName || "The Ashen Company"} · Day ${entry.state.day} · ${entry.state.gold} crowns · ${entry.state.party.filter((p) => !p.dead).length} companions`
          : entry
            ? "Unreadable save; not loaded."
            : "Empty slot",
      ),
    );
    c.append(
      menuButton(
        `Load slot ${i + 1}`,
        () => {
          if (
            !confirm(
              "Load this snapshot? It will replace the current autosave. Other manual slots remain saved.",
            )
          )
            return;
          beginPlaying(restore(entry.state));
        },
        !valid,
      ),
    );
    c.append(
      menuButton(
        `Save to slot ${i + 1}`,
        () => {
          if (entry && !confirm(`Replace the snapshot in slot ${i + 1}?`))
            return;
          slots[i] = { state: current };
          if (!menuWrite("pixel-tales-slots", slots)) {
            menuMessage(
              "Storage is unavailable or full. The slot was not saved.",
            );
            return;
          }
          showLoadMenu();
        },
        !isCompanySave(current),
      ),
    );
    root.append(c);
  }
  root.append(menuButton("Back", showFrontMenu));
}
function showSettingsMenu() {
  const root = menuShell("Settings");
  for (const [key, label, desc] of [
    [
      "largeText",
      "Larger interface text",
      "Larger text in menus, cards and controls.",
    ],
    [
      "reduceMotion",
      "Reduced motion",
      "Disable interface transitions and walking bob animation.",
    ],
    [
      "slowDays",
      "Longer exploration days",
      "Eight minutes per exploration day instead of four. Lessons, rest and other timed actions keep their stated duration.",
    ],
  ]) {
    const row = menuElement("label", "", "setting-row"),
      input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("aria-label", label);
    input.checked = menuSettings[key];
    input.onchange = () => {
      menuSettings[key] = input.checked;
      applyMenuSettings();
      if (!menuWrite("pixel-tales-settings", menuSettings))
        menuMessage(
          "Settings apply for this session; browser storage is unavailable.",
        );
    };
    row.append(input, menuElement("strong", label), menuElement("p", desc));
    root.append(row);
  }
  root.append(menuButton("Back", showFrontMenu));
}
function creatorField(parent, label, value, options, maxLength) {
  const row = menuElement("label", "", "creator-field");
  row.append(menuElement("span", label));
  const input = document.createElement(options ? "select" : "input");
  input.setAttribute("aria-label", label);
  if (options)
    for (const [id, text] of options) {
      const option = menuElement("option", text);
      option.value = id;
      input.append(option);
    }
  else {
    input.type = "text";
    input.required = true;
    input.maxLength = maxLength || 30;
  }
  input.value = value;
  row.append(input);
  parent.append(row);
  return input;
}
function showCompanyCreator() {
  const root = menuShell("Found your company"),
    form = document.createElement("form");
  form.id = "company-creator";
  const name = creatorField(
    form,
    "Company name",
    "The Ashen Company",
    null,
    30,
  );
  const banner = creatorField(
    form,
    "Company banner",
    "ashen",
    companyBanners.map((b) => [b.id, `${b.symbol} ${b.name}`]),
  );
  const preview = menuElement("div", "", "banner-preview");
  form.append(preview);
  const updateBanner = () => {
    const b = companyBanners.find((b) => b.id === banner.value);
    preview.textContent = `${b.symbol}  ${name.value || "Your company"}`;
    preview.style.background = b.color;
  };
  banner.onchange = updateBanner;
  name.oninput = updateBanner;
  updateBanner();
  const difficulty = creatorField(form, "Campaign difficulty", "standard", [
    ["forgiving", "Forgiving"],
    ["standard", "Standard"],
    ["veteran", "Veteran"],
  ]);
  form.append(
    menuElement(
      "p",
      "Forgiving: 20% lower food needs, 25% lower wages, weaker enemies. Veteran: 25% higher upkeep, tougher enemies, 15% more battle crowns. Difficulty stays with this company.",
      "save-preview",
    ),
  );
  const origin = creatorField(
    form,
    "Starting background",
    "wanderers",
    companyOrigins.map((o) => [o.id, o.name]),
  );
  const originDesc = menuElement("p", "", "save-preview");
  const updateOrigin = () =>
    (originDesc.textContent = companyOrigins.find(
      (o) => o.id === origin.value,
    ).desc);
  origin.onchange = updateOrigin;
  updateOrigin();
  form.append(originDesc);
  form.append(
    menuElement("h3", "Your founding companions"),
    menuElement(
      "p",
      "Choose four founders. Classes can repeat. Traits affect upkeep, resolve, hunger and combat; professions determine camp jobs and fieldwork.",
    ),
  );
  const defaults = fresh().party,
    fields = [],
    portraitUpdates = [];
  defaults.forEach((p, i) => {
    const c = menuElement("fieldset", "", "founder-card");
    c.append(menuElement("legend", `Founder ${i + 1}`));
    const f = {
      name: creatorField(c, `Founder ${i + 1} name`, p.name, null, 18),
      role: creatorField(
        c,
        `Founder ${i + 1} class`,
        p.role,
        Object.keys(founderRoles).map((r) => [
          r,
          r === "Swordswoman" ? "Swordfighter" : r,
        ]),
      ),
      profession: creatorField(
        c,
        `Founder ${i + 1} profession`,
        p.profession,
        professions.map((r) => [r, r]),
      ),
      trait: creatorField(
        c,
        `Founder ${i + 1} trait`,
        p.traits[0],
        companionTraits.map((t) => [t.id, t.name]),
      ),
    };
    f.sex = creatorField(c, `Founder ${i + 1} sex`, i % 2 ? "male" : "female", [
      ["male", "Male"],
      ["female", "Female"],
    ]);
    f.skin = creatorField(
      c,
      `Founder ${i + 1} skin`,
      avatarSkins[0],
      avatarSkins.map((v, i) => [v, `Skin tone ${i + 1}`]),
    );
    f.hair = creatorField(
      c,
      `Founder ${i + 1} hair color`,
      avatarHair[0],
      avatarHair.map((v, i) => [v, ["Dark", "Blond", "Silver", "Auburn"][i]]),
    );
    f.hairStyle = creatorField(c, `Founder ${i + 1} hairstyle`, "short", [
      ["short", "Short"],
      ["long", "Long"],
      ["braid", "Braid"],
    ]);
    f.coat = creatorField(c, `Founder ${i + 1} coat`, "", [
      ["", "Company colors"],
      ...companyBanners.map((b) => [b.color, b.name]),
    ]);
    const portrait = document.createElement("div"),
      desc = menuElement("p");
    const update = () => {
      const stats = founderRoles[f.role.value],
        t = companionTraits.find((t) => t.id === f.trait.value);
      desc.textContent = `${f.trait.value === "hearty" ? 32 : stats.max} health · ${stats.damage + (f.trait.value === "mercenary" ? 1 : 0)} attack · ${f.trait.value === "mercenary" ? 3 : 2} crowns per day. ${t.desc}`;
      portrait.replaceChildren(
        portraitArtwork({
          ...p,
          ...Object.fromEntries(
            ["sex", "skin", "hair", "hairStyle"].map((k) => [k, f[k].value]),
          ),
          role: f.role.value,
          coat:
            f.coat.value ||
            companyBanners.find((b) => b.id === banner.value).color,
        }),
      );
    };
    for (const key of ["sex", "skin", "hair", "hairStyle", "coat"])
      f[key].onchange = update;
    portraitUpdates.push(update);
    f.role.onchange = update;
    f.trait.onchange = update;
    update();
    c.prepend(portrait);
    c.append(desc);
    fields.push(f);
    form.append(c);
  });
  banner.onchange = () => {
    updateBanner();
    portraitUpdates.forEach((update) => update());
  };
  const cost = menuElement("p", "", "save-preview");
  form.append(cost);
  const updateCosts = () => {
    const wages = fields.reduce(
        (n, f) => n + (f.trait.value === "mercenary" ? 3 : 2),
        0,
      ),
      rations = 4 + fields.filter((f) => f.trait.value === "hearty").length;
    cost.textContent = `Starting daily upkeep: ${wages} crowns and ${rations} rations. Skilled cooks and camp improvements can reduce food use.`;
  };
  for (const f of fields) {
    const previous = f.trait.onchange;
    f.trait.onchange = () => {
      previous();
      updateCosts();
    };
  }
  updateCosts();
  const submit = menuElement("button", "Begin adventure");
  submit.type = "submit";
  submit.className = "primary";
  form.append(submit, menuButton("Cancel", showFrontMenu));
  form.onsubmit = (event) => {
    event.preventDefault();
    const company = createCompany({
      name: name.value,
      banner: banner.value,
      origin: origin.value,
      difficulty: difficulty.value,
      founders: fields.map((f) =>
        Object.fromEntries(
          Object.entries(f).map(([k, input]) => [k, input.value]),
        ),
      ),
    });
    if (!company) {
      menuMessage("Enter a company name and a name for every founder.");
      return;
    }
    if (
      (hasSessionCompany || isCompanySave(menuRead("pixel-tales"))) &&
      !confirm(
        "Begin a new company? This replaces the autosave. Manual save slots are kept.",
      )
    )
      return;
    beginPlaying(company);
  };
  root.append(form);
}

function drawWeather(c, s) {
  const w = weatherInfo(s);
  if (!["rain", "storm", "cold"].includes(w.kind)) return;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.strokeStyle = w.kind === "cold" ? "#e4e2c370" : "#b9c7ca50";
  c.lineWidth = 1;
  for (let i = 0; i < 35; i++) {
    const x = (i * 97 + s.day * 13) % c.canvas.width,
      y = (i * 73 + s.day * 31) % c.canvas.height;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (w.kind === "cold" ? 1 : 4), y + (w.kind === "cold" ? 2 : 12));
    c.stroke();
  }
  if (w.kind === "storm") {
    c.fillStyle = "#303f4828";
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  }
  c.restore();
}
