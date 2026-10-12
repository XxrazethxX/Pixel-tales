import { resolveCampPersonalQuest } from "./game.js";
import { resolveCampOpportunity } from "./game.js";
import { companyLockpicker } from "./game.js";
import {
  standardBearer,
  standardLock,
  unlockStandard,
  assignFlagBearer,
  concealmentLevel,
  canAutoAmbush,
  campCapacity,
  campCrowding,
  campExpansionLock,
  expandCamp,
  campBounds,
  campFurniturePoint,
  furniturePlacementLock,
  placeCampFurniture,
  campOpportunity,
  safeRestSites,
  safeRestCost,
  safeRestLock,
  restAtShelter,
  wagonManifest,
  beginAfterAction,
  updateAfterActionReport,
  dismissAfterActionReport,
} from "./game.js";
import { hiddenPassages, passageLock, passageAction } from "./game.js";
import { drawArcanePassage } from "./art.js";
import {
  grimoires,
  spellCatalogFor,
  preparationCapacity,
  prepareSpells,
  preparationLock,
  recoverGrimoire,
  recoverGrimoireLock,
  learnGrimoire,
  learnGrimoireLock,
  academyService,
  academyLock,
  castExplorationMagic,
  explorationMagicLock,
  fantasyClassInfo,
  fantasyAction,
  fantasyActionLock,
} from "./game.js";
import { drawArcaneLandmark } from "./art.js";
import {
  newEnemyFamilies,
  scoutEnemy,
  scoutEnemyLock,
  newEnemyReport,
  battleStatuses,
  woundTypes,
  treatWound,
  woundTreatmentLock,
  heraldicCharges,
  heraldicTrims,
  earnedTitles,
  titleUnlocked,
  customizeHeraldry,
  adoptTitle,
  factionReaction,
  townCondition,
  townConditionLabel,
  aidVillage,
  townAidLock,
  helpSettlement,
  settlementLock,
} from "./game.js";
import { drawCompanyBanner, drawLivingPlace } from "./art.js";
import {
  tacticalMissions,
  missionLock,
  acceptMission,
  abandonMission,
  startMission,
  missionObjective,
  missionActionLock,
  missionAction,
  careerPaths,
  careersFor,
  activeCareer,
  careerLock,
  learnCareer,
  careerActionLock,
  careerAction,
  observationTrails,
  visibleClues,
  observeClues,
  interpretClueLock,
  interpretClue,
  followObservation,
  conversationLock,
  respondConversation,
  upkeepForecast,
  homeUpgrades,
  homeLock,
  purchaseHome,
  enterHome,
  homeWorker,
  assignHomeJob,
  upgradeHome,
  reserveCapacity,
  reserveLoad,
  transferHome,
  restAtHome,
  harvestHome,
  homeRepair,
  homeCraft,
  recoverMagicAtHome,
  fantasyStrongholds,
  realmHold,
  fantasyHoldLock,
  fantasyHoldAction,
  territoryOwner,
  townAccessLock,
  buyTerritoryPass,
  supportTerritory,
  lineageStories,
  lineageStoryLock,
  lineageStoryAction,
  recoverFrontierSlot,
  recoverShardMagic,
  realmJournal,
  trackRealmLead,
  dungeonPuzzle,
  realmDungeonAction,
  wagonChoiceLock,
  wagonChoice,
  campJobReady,
  companyScout,
  travelRoles,
  travelWorker,
  assignTravelJob,
  companyCargoCapacity,
  buyCompanyWagon,
  wagonUpgrades,
  upgradeWagon,
  repairWagon,
  strongholdScoutLock,
  scoutStronghold,
  infiltrationLock,
  infiltrateStronghold,
  caravanEscortOffers,
  acceptCaravanEscort,
  claimCaravanEscort,
  abandonCaravanEscort,
  respondCaravanRaid,
  interveneCaravan,
  lootCaravanWreck,
  spellSchools,
  learnSpellSchool,
  spellsFor,
  spellRange,
  enemyArmor,
  enemyDescription,
  disarmBattleSnare,
  toggleStealth,
  advanceStealth,
  isHidden,
  confrontPatrol,
  negotiateBandits,
  banditDemand,
  tradeCaravanEquipment,
  entryRadius,
  beginCampaign,
  campaignTasks,
  campaignAction,
  chooseGrain,
  travelerAction,
  personalQuestInfo,
  advancePersonalQuest,
  braceSpear,
  fantasyRaces,
  isCaster,
  spellBook,
  spellSlots,
  spellLock,
  castSpell,
  recoverMagic,
  fieldHealing,
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
  regions,
  regionAt,
  regionalChoice,
  regionalChoiceLock,
  regionalService,
  regionalServiceLock,
  chooseJourneyPartner,
  continuationInfo,
  continuationLock,
  continueCompanion,
  continuationTechnique,
  continuationTechniqueLock,
  prisonerAction,
  prisonerActionLock,
  prisonerGuard,
  answerSurrender,
  surrenderLock,
  regionalRelics,
  relicLock,
  recoverRelic,
  equipmentComparison,
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
  purchaseModifier,
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
  drawFantasyEnemy,
  drawWolf,
  chestPreview,
  drawSiteInterior,
  drawDungeonInterior,
  drawCompanyHome,
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
  caravanId = null,
  spellMode = null;
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
function card(title, body = "") {
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
    if (missionObjective(s)) return missionObjective(s);
    if (spellMode)
      return `Spell prepared: ${spellBook.find((v) => v.id === spellMode)?.name}. Select an outlined target or use Spell targets below. Slots persist between battles.`;
    if (abilityMode)
      return `${skillFor(p).name} armed: click an outlined enemy within ${attackRange(p, true, s)} tiles. ${skillFor(p).desc} Costs ${skillFor(p).cost} valor.`;
    return `${s.battle.openingAmbush ? "AMBUSH · Free opening turn · " : ""}${battlefield(s).name} · Round ${s.battle.turn} · Valor ${s.battle.valor}/5 · ${p.name}: ${u?.moved ? "movement used" : `move up to ${movementRange(p)} tiles`}, ${u?.acted ? "action used" : "attack or brace"}. ${resolveLabel(p)} · ${fatigueLabel(p)} · Fatigue ${Math.round(p.fatigue || 0)}/100. ${bondSupport(s, p) ? "Trusted support +1 attack. " : ""}${battlefield(s).text} Rubble blocks 2 ranged damage; bushes block 1 and cost 2 movement; trees and deadfall block movement and sight; Melee flanking +2. Disengage before leaving melee reach.${s.battle.wildlife ? " Wolves rush wounded targets and gain pack damage." : ""}${s.battle.bossId ? ` ${namedAdversaries.find((boss) => boss.id === s.battle.bossId).name}: ${bossThreat(s) ? "FIRE INCOMING: move off marked tiles or stun Maela." : "Hover the named enemy for its special mechanic."}` : ""}`;
  }
  if (s.expedition.mission) {
    const m = tacticalMissions.find((v) => v.id === s.expedition.mission);
    return `${m.name}: travel to ${places[m.site].name}. ${m.desc}`;
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
  combatMotion = new Map(),
  attackEffects = [],
  lastCue = 0;
function captureCombatFeedback() {
  if (battleVisual !== s.battle) {
    battleVisual = s.battle;
    visualSnapshot = new Map();
    combatMotion.clear();
    combatEffects = [];
    attackEffects = [];
    lastCue = 0;
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
  for (const cue of s.battle.feedback || [])
    if (cue.id > lastCue) {
      attackEffects.push({ ...cue, start: now });
      lastCue = cue.id;
    }
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
  drawAttackEffects();
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
let campCategory = "Overview",
  dungeonDoorOpen = false,
  dungeonPanelOpen = false,
  pendingFurniture = null,
  campDrag = null;
const drawerFoldState = new Map();
function render() {
  updateAfterActionReport(s);
  if (
    !s.battle ||
    !isCaster(s.party[selected]) ||
    (spellMode &&
      spellBook.find((spell) => spell.id === spellMode)?.role !==
        s.party[selected]?.role)
  )
    spellMode = null;
  captureCombatFeedback();
  document.querySelector(".brand small").textContent =
    `${s.companyName}${s.chronicle.heraldry.title ? " · " + earnedTitles.find((t) => t.id === s.chronicle.heraldry.title).name : ""}`.toUpperCase();
  document.querySelector(".brand-mark").textContent =
    heraldicCharges.find((b) => b.id === s.chronicle.heraldry.charge)?.symbol ||
    "✦";
  document.querySelector(".brand-mark").style.color = heraldicTrims.find(
    (t) => t.id === s.chronicle.heraldry.trim,
  ).color;
  document.querySelector(".brand-mark").style.background = companyBanners.find(
    (b) => b.id === s.chronicle.heraldry.field,
  ).color;
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
    ["site", "dungeon", "farm", "arcane-passage"].includes(s.event?.kind),
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
  for (const d of panel.querySelectorAll("details")) {
    const summary = d.querySelector("summary");
    if (summary)
      drawerFoldState.set(`${renderedTab}:${summary.textContent}`, d.open);
  }
  panel.replaceChildren();
  if (tab === "Company") {
    appendExpeditionCompany(panel);
    appendOdysseyCompany(panel);
    appendChronicleCompany(panel);
    appendStandardPanel(panel);
    appendArcanaPanel(panel);
    appendRealmCompany(panel);
    appendTravelJobs(panel);
    appendWagonPanel(panel);
    if (s.caravanEscort) appendEscortPanel(panel);
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
    const campaign = card(
      "The Broken Road · Hungry Roads",
      `<p>${s.campaign.phase === "unstarted" ? "Greyhaven's contract board has a lead on missing grain and caravans." : s.campaign.phase === "completed" ? `Chapter complete: grain went to ${s.campaign.branch}. Venn's invoice implicates Iron Hollow; the next chapter is still to come.` : s.campaign.phase === "grain" ? "Return to Briarhide to decide who receives the grain." : s.campaign.phase === "return" ? "Report your decision in Greyhaven." : "Investigate the farm, escort Merrit, and defeat Briarhide's captain."}</p>`,
    );
    if (s.campaign.phase !== "unstarted")
      for (const task of campaignTasks(s)) {
        const row = document.createElement("p");
        row.textContent = `${task.done ? "✓" : "○"} ${task.name}`;
        campaign.append(row);
      }
    campaign.append(
      document.createTextNode(
        `Briarhide: ${s.strongholds.briar.cleared ? "cleared · no new raids" : "active · raiders replenish every two days after defeat"}`,
      ),
    );
    panel.append(campaign);
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
        `<p>${cargoLoad(s)}/${companyCargoCapacity(s)} capacity · ${tradeGoods.map((g) => `${g.name}: ${s.cargo[g.id]}`).join(" · ")}</p><p>Visit village markets or nearby caravans to trade.</p>`,
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
        memorial
          .querySelector(".pixel-icon")
          .replaceWith(portraitArtwork(p, s));
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
      c.querySelector(".pixel-icon").replaceWith(portraitArtwork(p, s));
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
      const lineage = document.createElement("p");
      lineage.textContent = `${fantasyRaces.find((r) => r.id === avatarAppearance(p).race).name}: ${fantasyRaces.find((r) => r.id === avatarAppearance(p).race).desc}${p.personalPerk ? ` · Personal ability: ${p.personalPerk}` : ""}`;
      c.append(lineage);
      const progression = document.createElement("details"),
        summary = document.createElement("summary");
      summary.textContent = "Class abilities & specialization";
      progression.append(summary);
      progression.open = p.points > 0 && (!p.talent || !p.advancedSkill);
      const ability = document.createElement("p");
      ability.className = "hint";
      ability.textContent = isCaster(p)
        ? `Spell slots: level 1 ${spellSlots(p)[1]} · level 2 ${spellSlots(p)[2]}. Recharge at camp or Emberfall. ${spellsFor(
            p,
          )
            .map((v) => v.name)
            .join(", ")}`
        : `${skillFor(p).name} · ${skillFor(p).cost} valor · ${skillFor(p).desc}`;
      progression.append(ability);
      if (isCaster(p)) {
        const current = spellSchools.find((v) => v.id === p.spellSchool);
        const text = document.createElement("p");
        text.textContent = current
          ? `${current.name}: ${current.desc}`
          : "At level two, spend one training point on one permanent school.";
        progression.append(text);
        for (const school of spellSchools.filter((v) => v.role === p.role)) {
          const row = card(school.name, `<p>${school.desc}</p>`);
          row.append(
            button(
              p.spellSchool === school.id
                ? `${school.name} learned`
                : `Learn ${school.name} · 1 point`,
              () => learnSpellSchool(s, p.id, school.id),
              !!p.spellSchool ||
                p.level < 2 ||
                p.points < 1 ||
                !!s.battle ||
                !!s.event,
            ),
          );
          progression.append(row);
        }
      }
      if (p.role === "Cleric" && !s.battle && !s.event && !s.campOpen)
        for (const target of livingParty(s).filter(
          (t) => t.hp > 0 && t.hp < t.max,
        ))
          progression.append(
            button(
              `Heal ${target.name} with ${p.name} · 1 slot / 1 herb / 1 hour`,
              () => fieldHealing(s, p.id, target.id),
              spellSlots(p)[1] < 1 || s.inventory.herbs < 1,
            ),
          );
      const hint = document.createElement("p");
      hint.className = "hint";
      hint.textContent = isCaster(p)
        ? "Spell slots increase with level. Second-level magic becomes available at level 3. Slots persist through combat and ordinary rests."
        : "Choose one permanent specialization at level 2 for one training point. Uses the same points as strength and vitality.";
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
      advancedHint.textContent = isCaster(p)
        ? "Magic is scarce outside Emberfall. Meditation consumes herbs and rations; temple recovery costs crowns."
        : "At level 4, spend two training points to permanently upgrade your class action. Requires a specialization. Choose one path; it replaces the basic skill and keeps your specialization's effects.";
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
    appendContinuationPanel(panel);
    appendStandardPanel(panel);
    appendWoundPanel(panel);
    appendArcanaPanel(panel);
    if (s.odyssey.prisoners.length) appendPrisoners(panel);
    appendWagonPanel(panel);
    appendTravelJobs(panel);
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
    appendCampBuildPalette(panel);
    for (const p of livingParty(s).filter(
      (p) =>
        campOpportunity(s, p.id) &&
        (!p.storyComplete || (p.resolve ?? 65) <= 25),
    )) {
      const c = card(
        `${p.name}’s goal`,
        `<p>${personalGoal(p)}. Resolve ${Math.round(p.resolve ?? 65)}. Support costs 20 crowns${p.profession === "Smith" ? " and 3 ore; improves their weapon" : "; builds loyalty and morale"}.</p>`,
      );
      c.append(
        button(
          `Support ${p.name}`,
          () => resolveCampOpportunity(s, p.id, "support"),
          !!p.storyComplete ||
            s.gold < 20 ||
            (p.profession === "Smith" && s.inventory.ore < 3),
        ),
        button(
          `Refuse ${p.name}`,
          () => resolveCampOpportunity(s, p.id, "refuse"),
          !!p.storyComplete,
        ),
      );
      if ((p.resolve ?? 65) <= 25)
        c.append(
          button(`Release ${p.name}`, () =>
            resolveCampOpportunity(s, p.id, "release"),
          ),
        );
      panel.append(c);
    }
    for (const p of livingParty(s).filter((p) => campOpportunity(s, p.id))) {
      const stage =
        p.personalQuest?.stage || (p.storyComplete === "supported" ? 1 : 0);
      if (stage > 0 || p.storyComplete === "refused") {
        const journey = card(
          `${p.name} · personal journey`,
          `<p>${personalQuestInfo(p).goal}. ${stage === 1 ? "Travel to their objective, then investigate together." : stage === 2 ? "Discovery recovered. Share it to earn an ability and strengthen bonds, or sell it for thirty-five crowns and risk a rivalry." : stage === 3 ? `Resolved: ${p.personalQuest?.outcome}. ${p.personalPerk ? `Ability: ${p.personalPerk}.` : "Trust can be repaired at camp."}` : "A refused companion may accept an apology."}</p>`,
        );
        if (
          p.storyComplete === "refused" ||
          p.personalQuest?.outcome === "claimed"
        )
          journey.append(
            button(
              `Reconcile with ${p.name} · 15 crowns`,
              () => resolveCampPersonalQuest(s, p.id, "reconcile"),
              s.gold < 15,
            ),
          );
        if (stage === 2)
          journey.append(
            button(`Share ${p.name}'s discovery`, () =>
              resolveCampPersonalQuest(s, p.id, "share"),
            ),
            button(`Sell ${p.name}'s discovery`, () =>
              resolveCampPersonalQuest(s, p.id, "claim"),
            ),
          );
        panel.append(journey);
      }
    }
    if (livingParty(s).some(isCaster))
      panel.append(
        card(
          "Recover magic",
          "<p>Each exhausted caster needs two rations and two herbs for six hours of meditation. Daily upkeep still applies if midnight passes. Ordinary rest does not replenish slots.</p>",
        ),
        button("Meditate · restore spell slots", () => recoverMagic(s)),
      );
    const duties = card(
      "Camp duties",
      "<p>Choose one job per conscious companion. Build its station first. Jobs use current professions and operate on fed rests of at least six hours, once per day. Workers recover 3 fatigue per hour; resting companions recover 5.</p>",
    );
    for (const role of campRoles) {
      const worker = campWorker(s, role.id),
        row = card(
          role.name,
          `<p>${role.desc}</p><p>${campJobReady(s, role.id) ? (worker ? `${worker.name} on duty` : "Unstaffed") : `Requires ${campStructures.find((b) => b.id === role.building).name}`}</p>`,
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
      selector.disabled = !campJobReady(s, role.id);
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
        const comparison = document.createElement("p");
        comparison.textContent = `For ${p.name}: ${equipmentComparison(s, item, p).text}`;
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
  if (tab === "Contracts" && s.location === 0) {
    const chapter = card(
      "The Broken Road · Hungry Roads",
      "<p>Three connected jobs: investigate Ashbrook Farm, escort Merrit to Saltbridge, and defeat Captain Venn. Recover the grain and choose whether the League, villagers, or your company receives it. Regular contracts remain available between objectives.</p>",
    );
    if (s.campaign.phase === "unstarted")
      chapter.append(
        button("Begin Hungry Roads", () => beginCampaign(s), false, true),
      );
    else
      chapter.append(
        document.createTextNode(
          `Campaign: ${s.campaign.phase}. Track objectives in Company.`,
        ),
      );
    panel.append(chapter);
  }
  if (tab === "Contracts") {
    appendMissionBoard(panel);
    if (s.caravanEscort) appendEscortPanel(panel);
    for (const route of caravanEscortOffers(s)) {
      const p = s.patrols.find((p) => p.id === route.patrolId);
      const row = card(
        `Escort: ${p.name}`,
        `<p>Protect ${route.cargo} on your chosen route to ${places[route.destination].name}. ${route.reward} crowns on arrival. Bandits may attack the wagon; retreat abandons the escort.</p>`,
      );
      row.append(
        button(
          `Escort ${p.name} · ${route.reward} crowns`,
          () => acceptCaravanEscort(s, route.patrolId),
          false,
          true,
        ),
      );
      panel.append(row);
    }
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
      appendTerritoryPanel(panel);
      appendRegionalServices(panel);
      appendLivingVillage(panel);
      if (s.location === 6) appendAcademy(panel);
      appendWoundPanel(panel);
      if (
        s.location === 0 &&
        s.campaign.phase !== "unstarted" &&
        s.travelers.merrit === "waiting"
      )
        panel.append(
          card(
            "Merrit's escort",
            "<p>Merrit needs a safe journey to Saltbridge. Fifty crowns on arrival. His cart follows your company; retreat or defeat loses the escort.</p>",
          ),
          button("Escort Merrit to Saltbridge", () =>
            campaignAction(s, "escort"),
          ),
        );
      if (s.location === 0 && s.travelers.tamsin === "rescued")
        panel.append(
          button("Meet Sella again", () => travelerAction(s, "meet")),
        );
      if (s.location === 3 && s.travelers.merrit === "settled")
        panel.append(
          card(
            "Merrit’s new stall",
            "<p>Your former escort remembers the company. Restored deliveries lower Saltbridge food prices by ten percent.</p>",
          ),
        );
      if (s.location === 3 && s.travelers.merrit === "arrived")
        panel.append(
          button("Meet Merrit · collect 50 crowns", () =>
            travelerAction(s, "merrit"),
          ),
        );
      if (s.location === 0 && s.campaign.phase === "return")
        panel.append(
          button(
            "Report recovered grain",
            () => campaignAction(s, "report"),
            false,
            true,
          ),
        );
      appendWagonPanel(panel);
      if (s.caravanEscort?.status === "arrived") appendEscortPanel(panel);
      if (s.location === 6) {
        const magic = card(
          "Temple of the Beacon",
          "<p>Magic is scarce in frontier villages. Emberfall's flourishing temples and academies train casters and replenish spell slots. Recovery costs fifteen crowns per exhausted caster and two hours.</p>",
        );
        magic.append(
          button("Restore spell slots at temple", () => recoverMagic(s)),
        );
        panel.append(magic);
      }

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
            !!townAccessLock(s),
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
          `<p>Cargo ${cargoLoad(s)}/${companyCargoCapacity(s)}. ${stock.demand > 0 ? `Shortage: ${stock.shortage} · ${stock.demand} units still needed. Deliver goods to earn League reputation.` : "The regional shortage has been relieved."} Stocks and demand change every three days. Selling a bulk load quotes each unit as the shortage is filled.</p>`,
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
                cargoLoad(s) + quantity > companyCargoCapacity(s),
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
    for (const item of equipmentCatalog.filter(
      (item) =>
        item.tier <= 2 && (item.id !== "beacon-staff" || s.location === 6),
    )) {
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
          `<p>Carried cargo ${cargoLoad(s)}/${companyCargoCapacity(s)}. Caravan food: ${caravan.foodStock} rations. Cargo purchases reduce its stock; raiding seizes remaining cargo and harms League and Warden reputation.</p>`,
        ),
      );
      for (const good of tradeGoods.filter((g) => caravan.cargo[g.id] > 0)) {
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
              cargoLoad(s) >= companyCargoCapacity(s),
          ),
        );
        panel.append(c);
      }
      for (const id of caravan.gearStock || []) {
        const item = equipmentCatalog.find((item) => item.id === id);
        if (!item) continue;
        const cost = Math.ceil(item.price * purchaseModifier(s));
        const row = card(
          item.name,
          `<p>${item.slot} · ${item.rarity} · bonus ${item.bonus}. One available.</p>`,
        );
        row.append(
          button(
            `Buy ${item.name} · ${cost} crowns`,
            () => tradeCaravanEquipment(s, caravan.id, id),
            s.gold < cost,
          ),
        );
        panel.append(row);
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
    if (pendingFurniture) {
      a.append(
        card(
          `Place ${campFurniture.find((f) => f.id === pendingFurniture).name}`,
          "<p>Drag onto an empty part of the highlighted clearing. Red means occupied or outside camp; green means it fits.</p>",
        ),
        button("Cancel camp placement", () => {
          pendingFurniture = null;
          campDrag = null;
        }),
      );
    }
    $("map-label").textContent = `${s.companyName} · camp`;
  } else if (s.event) {
    const bandits =
      s.event.kind === "negotiation" &&
      s.patrols.find((p) => p.id === s.event.patrolId);
    const c = card(
      bandits ? `${bandits.name} · Road toll` : s.event.title,
      bandits
        ? `<p>The bandits close around your company. Pay ${banditDemand(s, bandits.id)} crowns or surrender 8 rations for eight game hours of passage. Refusing starts combat.</p>`
        : `<p>${s.event.text}</p>`,
    );
    c.id = "event";
    const raided =
      s.event.kind === "caravan-raid" &&
      s.patrols.find((p) => p.id === s.event.patrolId);
    if (s.event.kind === "region") {
      for (const [action, label] of [
        ["specialist", "Find a route with a specialist · 1 hour"],
        ["supplies", "Secure the crossing · 2 rations / 1 wood / 1 hour"],
        ["detour", "Take the long way · 3 hours / fatigue"],
      ])
        c.append(
          lockedButton(
            label,
            () => regionalChoice(s, action),
            regionalChoiceLock(s, action),
          ),
        );
    } else if (s.event.kind === "home") {
      appendHomePanel(c);
    } else if (s.event.kind === "travel-conversation") {
      for (const [choice, label] of [
        ["meal", "Share a meal · 2 rations"],
        ["listen", "Listen and share the burden"],
        ["pay", "Settle overdue wages"],
        ["promise", "Promise payment by dawn"],
        ["dismiss", "Dismiss their concerns"],
      ])
        c.append(
          lockedButton(
            label,
            () => respondConversation(s, choice),
            conversationLock(s, choice),
          ),
        );
    } else if (s.event.kind === "wagon-travel") {
      for (const [choice, label] of [
        ["duty", "Use assigned travel specialist"],
        ["materials", "Secure wagon · 2 wood / 1 hour"],
        ["pay", "Pay for safe passage · 20 crowns"],
        ["risk", "Push onward · risk supplies"],
        ["fight", "Fight the night raiders"],
      ])
        c.append(
          button(
            label,
            () => wagonChoice(s, choice),
            !!wagonChoiceLock(s, choice),
          ),
        );
      a.append(c);
    } else if (raided) {
      c.querySelector("h3").textContent = `${raided.name} under attack`;
      c.querySelector("p").textContent =
        "Bandits surround the wagon. Intervene to protect its cargo, demand fifteen crowns before helping, or leave. Without help the wagon will fall after three game hours, leaving a wreck.";
      c.append(
        button(
          "Defend the caravan",
          () => respondCaravanRaid(s, "help"),
          false,
          true,
        ),
        button("Demand 15 crowns, then defend", () =>
          respondCaravanRaid(s, "payment"),
        ),
        button("Leave the caravan", () => respondCaravanRaid(s, "leave")),
      );
      heldKeys.clear();
    } else if (bandits) {
      heldKeys.clear();
      c.append(
        button(
          `Pay ${banditDemand(s, bandits.id)} crowns`,
          () => negotiateBandits(s, "gold"),
          s.gold < banditDemand(s, bandits.id),
          true,
        ),
        button(
          "Offer 8 rations",
          () => negotiateBandits(s, "food"),
          s.food < 8,
        ),
        button("Refuse · Fight", () => negotiateBandits(s, "refuse")),
      );
    } else if (s.event.kind === "dungeon") {
      const e = s.event,
        layout = dungeonLayout(e.site),
        c = card(
          `${places[e.site].name} · ${layout.name}`,
          `<p>${e.message}</p><p>Click adjacent tiles on the dungeon floor, or use WASD / arrow keys. Click a nearby feature to inspect it. Watch for unstable ground, traps and sentries.</p>`,
        );
      c.id = "event";
      $("map-label").textContent = `${places[e.site].name} · ${layout.name}`;
      c.classList.add("dungeon-controls");
      const grid = document.createElement("div");
      grid.className = "dungeon-grid";
      const fallback = fold("Accessible dungeon tile controls");
      fallback.append(grid);
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 9; x++) {
          const blocked = dungeonWalls(s).some(([a, b]) => a === x && b === y);
          grid.append(
            button(
              e.x === x && e.y === y
                ? "Party"
                : blocked
                  ? "Wall"
                  : x === 4 && y === 3
                    ? s.realm.dungeons[e.site]?.cache
                      ? "Empty"
                      : "Seal"
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
      const controls = fold("Dungeon actions", dungeonPanelOpen);
      controls.addEventListener("toggle", () => {
        if (controls.isConnected) dungeonPanelOpen = controls.open;
      });
      appendDungeonPuzzle(controls);
      controls.append(
        fallback,
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
          companyScout(s)
            ? "Scout disarms darts"
            : "Disarm darts · 1 wood / 1 hour",
          () => dungeonAction(s, "disarm"),
          (!companyScout(s) && s.inventory.wood < 1) ||
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
      c.append(controls);
      a.append(c);
    } else if (s.event.kind === "campaign") {
      c.append(
        button("Return grain to the League", () => chooseGrain(s, "league")),
        button("Give grain to hungry villagers", () =>
          chooseGrain(s, "villagers"),
        ),
        button("Keep grain · 16 rations", () => chooseGrain(s, "company")),
      );
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
      if (s.travelers.tamsin === "unknown")
        c.append(
          button(
            "Rescue Sella · 1 medicine",
            () => travelerAction(s, "rescue"),
            s.inventory.medicine < 1,
          ),
        );
      if (!s.travelers.farmRebuilt && s.travelers.tamsin !== "unknown")
        c.append(
          button(
            "Rebuild farm · 6 wood / 20 crowns",
            () => travelerAction(s, "rebuild"),
            s.inventory.wood < 6 || s.gold < 20,
          ),
        );
      if (s.travelers.farmRebuilt)
        c.append(
          button(
            "Collect farm harvest",
            () => travelerAction(s, "harvest"),
            s.travelers.harvestDay >= 0 && s.day - s.travelers.harvestDay < 3,
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
          ? "<p>Inspect the <strong>broken oak</strong> and <strong>marker stone</strong> to reconstruct the route. Search the right square, open the lock, then choose your loot.</p>"
          : "<p>Walk into the timbered gallery, inspect the abandoned cart, and enter the ore chamber to survey the exposed seam.</p>",
      );
      if (e.site === 10) c.classList.add("stash-card");
      if (e.message) {
        const feedback = document.createElement("p");
        feedback.className = "site-feedback";
        feedback.setAttribute("role", "status");
        feedback.textContent = e.message;
        c.append(feedback);
      }
      if (e.site === 10 && e.stage === "search") {
        const grid = document.createElement("div");
        grid.className = "stash-grid";
        for (let i = 0; i < 16; i++) {
          const label =
            i === 8
              ? "Broken oak"
              : i === 2
                ? "Marker stone"
                : s.stash.searched.includes(i)
                  ? `Checked ${(i % 4) + 1},${Math.floor(i / 4) + 1}`
                  : `Search ${(i % 4) + 1},${Math.floor(i / 4) + 1}`;
          const tile = button(label, () => siteAction(s, "search", i));
          if (s.stash.clues.includes(i)) tile.classList.add("clue-found");
          grid.append(tile);
        }
        const clues = document.createElement("p");
        clues.className = "stash-clues";
        clues.textContent = `Clues ${s.stash.clues.length}/2. ${s.stash.clues.includes(8) ? "Oak: THREE squares EAST. " : "Inspect the oak. "}${s.stash.clues.includes(2) ? "Stone: ONE square NORTH." : "Inspect the marker stone."}`;
        c.append(clues);
        c.append(grid);
      }
      if (e.site === 10 && e.stage === "lock") {
        const pins = document.createElement("p");
        pins.className = "lock-pins";
        pins.textContent = `Pins ${[0, 1, 2].map((i) => (i < e.pin ? "◆" : "◇")).join(" ")} · Set pin ${e.pin + 1}/3 · Strain ${e.strain}/3`;
        c.append(pins);
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
      if (e.site === 10 && e.stage === "opened") {
        c.append(chestPreview(s.stash.loot));
        const contents = Object.entries(s.stash.loot);
        const heading = document.createElement("p");
        heading.textContent = contents.length
          ? "Open chest — choose what to carry. Leftover items remain here."
          : "The chest is empty. You have collected its contents.";
        c.append(heading);
        for (const [key, amount] of contents)
          c.append(
            button(`Take ${amount} ${key === "gold" ? "crowns" : key}`, () =>
              siteAction(s, "take", key),
            ),
          );
        if (contents.length)
          c.append(
            button(
              "Take all contents",
              () => siteAction(s, "take-all"),
              false,
              true,
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
    if (!["site", "dungeon", "farm", "arcane-passage"].includes(s.event.kind))
      a.append(c);
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
        s.battle.openingAmbush
          ? "Finish ambush · Take additional turn"
          : `End round ${s.battle.turn}`,
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
    appendMissionCombat(a);
    appendCareerCombat(a);
    appendOdysseyCombat(a);
    appendBattleConditions(a);
    appendFantasyCombat(a);
    const actor = s.party[selected],
      unit = s.battle.units.find((u) => u.id === selected),
      skill = skillFor(actor);
    if (skill)
      a.append(
        button(
          `${skill.name} · ${skill.cost} valor${unit.cooldown ? ` · cooldown ${unit.cooldown}` : ""}`,
          () => (abilityMode = !abilityMode),
          unit.acted || unit.cooldown > 0 || s.battle.valor < skill.cost,
          abilityMode,
        ),
      );
    if (isCaster(actor)) {
      const magic = document.createElement("details"),
        summary = document.createElement("summary");
      summary.textContent = `Spells · level 1 ${spellSlots(actor)[1]} / level 2 ${spellSlots(actor)[2]}`;
      magic.className = "combat-preview-menu";
      magic.append(summary);
      for (const spell of spellsFor(actor).filter(
        (v) => v.kind !== "explore",
      )) {
        const hint = document.createElement("p");
        hint.textContent = `${spell.name}: ${spell.power} ${spell.kind === "damage" ? "base damage" : spell.kind === "heal" ? "healing + level" : spell.kind === "illusion" ? "distraction: weaker attacks and no disengagement strikes" : spell.kind === "surface" ? `${spell.surface} ground for three rounds; affects both sides` : spell.kind === "counter" ? "interrupt and silence an enemy caster" : spell.kind === "concentration" ? "maintained wards; taking damage breaks concentration" : "protection on the next hit"} · range ${spellRange(actor, spell)}${spell.area ? " · adjacent area" : ""}${spell.piercing ? " · ignores armor" : ""}`;
        magic.append(hint);
        magic.append(
          button(
            `Prepare ${spell.name} · level ${spell.level} slot${spell.herbs ? " / 1 herb" : spell.ore ? " / 1 ore" : ""}`,
            () => {
              spellMode = spell.id;
              abilityMode = false;
            },
            unit.acted || spellSlots(actor)[spell.level] < 1,
          ),
        );
      }
      if (spellMode) {
        const spell = spellBook.find((v) => v.id === spellMode),
          targets = ["surface", "concentration"].includes(spell.kind)
            ? Array.from({ length: 63 }, (_, i) => ({
                x: i % 9,
                y: Math.floor(i / 9),
                name: `tile ${(i % 9) + 1},${Math.floor(i / 9) + 1}`,
              }))
            : ["damage", "illusion", "counter"].includes(spell.kind)
              ? s.battle.enemies.filter((e) => e.hp > 0)
              : s.battle.units.filter((u) => s.party[u.id].hp > 0);
        const groundTarget = ["surface", "concentration"].includes(spell.kind),
          targetMenu = groundTarget ? document.createElement("div") : magic;
        if (groundTarget) targetMenu.className = "dungeon-grid";
        for (const target of targets) {
          const label = `Cast ${spell.name} on ${["surface", "concentration", "damage", "illusion", "counter"].includes(spell.kind) ? target.name || target.kind : s.party[target.id].name}`;
          const b = button(
            groundTarget ? `${target.x + 1},${target.y + 1}` : label,
            () => castSpell(s, selected, spell.id, target.x, target.y),
            !!spellLock(s, selected, spell.id, target.x, target.y),
          );
          b.setAttribute("aria-label", label);
          targetMenu.append(b);
        }
        if (groundTarget) magic.append(targetMenu);
        magic.append(
          button("Cancel spell", () => {
            spellMode = null;
          }),
        );
        magic.open = true;
      }
      a.append(magic);
    }
    for (const trap of (s.battle.traps || []).filter((t) => !t.used)) {
      if (actor.role === "Archer" || actor.profession === "Thief")
        a.append(
          button(
            `Disarm snare ${trap.x + 1},${trap.y + 1}`,
            () => disarmBattleSnare(s, selected, trap.x, trap.y),
            unit.acted ||
              Math.abs(unit.x - trap.x) + Math.abs(unit.y - trap.y) > 1,
          ),
        );
    }
    if (actor.role === "Spearman")
      a.append(
        button(
          "Brace equipped spear",
          () => braceSpear(s, selected),
          unit.acted,
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
            spellMode = null;
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
          `${enemy.name || enemy.kind}: ${preview.text || preview.reason}${enemyDescription(s, enemy) ? ` · ${enemyDescription(s, enemy)}` : ""}`,
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
      button(s.stealth.active ? "Leave hiding" : "Hide company", () =>
        toggleStealth(s),
      ),
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
          : isHidden(s) && s.stealth.concealment >= 75
            ? "Ambush ready · Confront a patrol"
            : "Prepare ambush · 1 ration / 2 hours",
        () => prepareAmbush(s),
        !!s.ambushReady || (isHidden(s) && s.stealth.concealment >= 75),
      ),
    );
    if (
      Math.hypot(s.position.x - places[12].x, s.position.y - places[12].y) <=
        110 &&
      !s.strongholds.briar.cleared
    ) {
      const intel = card(
        "Briarhide reconnaissance",
        s.strongholdIntel.scouted
          ? "<p>Captain Venn and three sentries guard the eastern vault. Concealment of sixty percent allows one covert action. Each action costs an hour and twenty-five concealment.</p>"
          : "<p>An Archer or Thief can scout the stockade from this distance. Survey the guards and discover supplies, a prisoner, weak stores and an alternate entrance.</p>",
      );
      if (!s.strongholdIntel.scouted)
        intel.append(
          button(
            "Scout Briarhide · 1 hour",
            () => scoutStronghold(s),
            !!strongholdScoutLock(s),
          ),
        );
      else
        for (const [id, label] of [
          ["supplies", "Steal stronghold supplies"],
          ["prisoner", "Rescue captive Edda"],
          ["sabotaged", "Sabotage stores · 2 ore"],
          ["entry", "Open drainage entrance"],
        ]) {
          const action = button(
            s.strongholdIntel[id] ? `${label} · Done` : label,
            () => infiltrateStronghold(s, id),
            !!infiltrationLock(s, id),
          );
          action.title =
            infiltrationLock(s, id) || "One hour, twenty-five concealment";
          intel.append(action);
        }
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "Stronghold scouting & infiltration";
      details.append(summary, intel);
      details.open = !s.strongholdIntel.scouted;
      a.append(details);
    }
    if (s.location === 12 && s.campaign.phase === "grain")
      a.append(
        button(
          "Decide the grain's fate",
          () => campaignAction(s, "grain"),
          false,
          true,
        ),
      );
    for (const p of livingParty(s))
      if (
        (p.personalQuest?.stage ||
          (p.storyComplete === "supported" ? 1 : 0)) === 1 &&
        personalQuestInfo(p).target === s.location
      )
        a.append(
          button(`Investigate for ${p.name}`, () =>
            advancePersonalQuest(s, p.id, "investigate"),
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
      if (p.wreck && !p.wreck.looted) {
        a.append(
          button(`Search wreck: ${p.name}`, () => lootCaravanWreck(s, p.id)),
        );
        return;
      }
      if (p.raid) {
        a.append(
          button(
            `Intervene: ${p.name}`,
            () => interveneCaravan(s, p.id),
            false,
            true,
          ),
        );
        return;
      }
      if (s.caravanEscort?.patrolId === p.id) return;
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
          "Fight caravan guards for 60 crowns, up to 10 remaining rations, and remaining cargo and equipment. First attack costs 10 morale and 5 renown, League −12 and Wardens −6; the caravan stops trading.";
      } else
        a.append(
          button(
            `${canAutoAmbush(s, p) ? "Ambush" : "Confront"} ${p.name}`,
            () => confrontPatrol(s, p.id),
            (p.passageUntil || 0) > s.day * 24 + s.timeOfDay,
            true,
          ),
        );
    });
    if (s.destination)
      a.prepend(button("Stop walking", () => stopMovement(s), false, true));
    $("map-label").textContent =
      `${places[s.location]?.name || terrainAt(s.position).toUpperCase()} · ${Math.round(s.position.x)}, ${Math.round(s.position.y)}`;
  }
  appendExpeditionWorld(a);
  appendOdysseyWorld(a);
  appendChronicleWorld(a);
  appendArcanaWorld(a);
  appendShelterActions(a);
  appendRealmWorldActions(a);
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
  appendRealmJournal(rumorJournal);
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
  appendActionRequirements();
  if (tab === "Camp") organizeCampPanel(panel);
  if (tab === "Town") organizeVillagePanel(panel);
  if (s.battle) organizeCombatControls(a);
  for (const d of panel.querySelectorAll("details")) {
    const summary = d.querySelector("summary"),
      key = `${tab}:${summary?.textContent}`;
    if (drawerFoldState.has(key)) d.open = drawerFoldState.get(key);
  }
  positionObjective();
  draw();
  renderAfterAction();
}
function positionObjective() {
  $("objective").style.bottom =
    !s.battle && !s.event && !s.campOpen
      ? `${$("actions").offsetHeight + (innerWidth <= 700 ? 20 : 26)}px`
      : "";
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
  if (
    ["site", "dungeon", "farm", "home", "arcane-passage"].includes(
      s.event?.kind,
    )
  ) {
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
    canvas.dataset.viewX = view.x;
    canvas.dataset.viewY = view.y;
    canvas.dataset.scale = view.scale;
    if (s.event.kind === "arcane-passage") drawArcanePassage(ctx, s);
    else if (s.event.kind === "dungeon") {
      drawDungeonInterior(ctx, s);
      drawDungeonHighlights();
    } else if (s.event.kind === "farm") drawFarmInterior(ctx, s);
    else if (s.event.kind === "home") drawCompanyHome(ctx, s);
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
    drawCompanyBanner(ctx, s, 610, 230, 2);
    drawCampLayoutOverlay();
    return;
  }
  if (s.battle) {
    drawBattlefield(ctx, s);
    drawRealmMagic();
    drawMissionObjective();
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

    for (const trap of (s.battle.traps || []).filter((t) => !t.used)) {
      rect(119 + trap.x * 62, 15 + trap.y * 60, 26, 3, "#ae6547");
      rect(130 + trap.x * 62, 5 + trap.y * 60, 3, 25, "#ae6547");
      drawMapLabel(
        ctx,
        trap.kind === "web" ? "WEB" : "SNARE",
        136 + trap.x * 62,
        42 + trap.y * 60,
        true,
      );
    }
    for (const enemy of s.battle.enemies.filter((e) => e.hp > 0 && e.casting)) {
      ctx.strokeStyle = ["cultist", "shaman"].includes(enemy.kind)
        ? "#668e59"
        : enemy.kind === "sorcerer"
          ? "#b65e43"
          : "#9261aa";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        108 + enemy.casting.x * 62,
        3 + enemy.casting.y * 60,
        54,
        52,
      );
      drawMapLabel(
        ctx,
        enemy.kind === "shaman"
          ? "BLESS NEXT"
          : enemy.kind === "necromancer"
            ? "RAISE NEXT"
            : enemy.kind === "sorcerer"
              ? "BURST NEXT"
              : enemy.kind === "cultist"
                ? "HEAL NEXT"
                : "SPELL NEXT",
        136 + enemy.casting.x * 62,
        12 + enemy.casting.y * 60,
        true,
      );
    }
    if (s.wagon.owned) {
      drawWagon(ctx, 48, 222, false, "mixed");
      drawMapLabel(ctx, `WAGON ${Math.round(s.wagon.condition)}%`, 48, 256);
    }
    const active = s.battle.units.find((u) => u.id === selected);
    if (active && (!active.acted || active.safeMove)) {
      const p = s.party[selected],
        range = spellMode
          ? spellRange(
              p,
              spellBook.find((v) => v.id === spellMode),
            )
          : attackRange(p, abilityMode, s);
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
            (spellMode && !spellLock(s, selected, spellMode, x, y)) ||
            (!spellMode &&
              enemy &&
              !active.acted &&
              distance <= range &&
              hasLineOfSight(s, active, { x, y })) ||
            (!spellMode &&
              !abilityMode &&
              !active.moved &&
              !enemy &&
              !occupied &&
              distance > 0 &&
              battlePath(s, active, x, y) !== null)
          ) {
            ctx.strokeStyle = spellMode
              ? "#8a79aa"
              : enemy
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
        else if (
          [
            "goblin",
            "skeleton",
            "mage",
            "troll",
            "spider",
            "cultist",
            "knight",
            "necromancer",
            "shaman",
            "sorcerer",
          ].includes(e.kind)
        )
          drawFantasyEnemy(
            ctx,
            e.kind,
            136 + visual.x * 62,
            28 + visual.y * 60,
          );
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
        if (e.kind === "mage")
          drawMapLabel(
            ctx,
            `SLOTS ${e.mana || 0}/2`,
            136 + visual.x * 62,
            64 + visual.y * 60,
            true,
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
        if (u.wildshape) drawWolf(ctx, 136 + visual.x * 62, 28 + visual.y * 60);
        else
          person(
            136 + visual.x * 62,
            28 + visual.y * 60,
            u.acted ? "#889079" : s.party[u.id].coat || partyCoats[u.id],
            0,
            s.party[u.id].role,
            u.id,
            s.party[u.id],
          );
        if (!u.wildshape)
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
    drawBattleSignals();
    drawCombatEffects();
    drawLighting(ctx, s, canvas.width, canvas.height);
    drawWeather(ctx, s);
    return;
  }
  ctx.drawImage(worldArtwork(), 0, 0);
  ctx.drawImage(fogArtwork(s.charted), 0, 0);
  drawObservationClues();
  places.forEach((p, i) => {
    if (!s.discovered.includes(i) && s.contract?.target !== i) return;
    if (s.location === i) {
      ctx.save();
      ctx.strokeStyle = "#e5d18b99";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, entryRadius(p), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawLandmark(ctx, p, i);
    drawLivingPlace(ctx, s, p, i);
    drawArcaneLandmark(ctx, s, p, i);
    if (territoryOwner(s, i))
      drawMapLabel(
        ctx,
        factions.find((f) => f.id === territoryOwner(s, i)).name,
        p.x,
        p.y - 65,
      );
    const tracked = realmJournal(s).find((v) => v.id === s.realm.tracked);
    if (tracked?.site === i)
      drawMapLabel(ctx, "TRACKED LEAD", p.x, p.y - 48, true);
    drawMapLabel(ctx, p.name, p.x, p.y + (p.type === "town" ? 58 : 39));
    if (i === 13 && s.travelers.farmRebuilt)
      drawMapLabel(ctx, "RESTORED", p.x, p.y - 35);
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
        (!p.cleared || (p.wreck && !p.wreck.looted)) &&
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
      if (p.kind === "fantasy") {
        drawFantasyEnemy(ctx, p.enemyFamily, p.x, p.y);
        drawMapLabel(ctx, p.name, p.x, p.y - 37, true);
        return;
      }
      if (p.kind === "wolves") {
        drawWolf(ctx, p.x - 12, p.y, 1);
        drawWolf(ctx, p.x + 10, p.y + 8, -1);
        drawMapLabel(ctx, p.name, p.x, p.y - 37, true);
        return;
      }
      if (p.wreck) {
        drawWagon(ctx, p.x, p.y, true, "empty");
        drawMapLabel(ctx, "WAGON WRECK", p.x, p.y - 37, true);
        return;
      }
      if (p.raid) drawMapLabel(ctx, "UNDER ATTACK", p.x, p.y + 38, true);
      if (p.kind === "merchant")
        drawWagon(ctx, p.x - 9, p.y - 8, p.hostile, p.caravanType);
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
  if (s.stealth.active) ctx.globalAlpha = isHidden(s) ? 0.55 : 0.85;
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
  ctx.globalAlpha = 1;
  s.odyssey.prisoners.forEach((prisoner, index) => {
    const point = partyPositions(s).at(-1) || s.position;
    person(point.x - 15 - index * 13, point.y + 12, "#77796b", 0, "", index, {
      race: prisoner.kind === "goblin" ? "orc" : "human",
    });
    rect(point.x - 17 - index * 13, point.y + 14, 5, 1, "#b6b2a1");
  });
  const bearer = standardBearer(s);
  if (bearer) {
    const point = partyPositions(s)[bearer.id] || s.position;
    drawCompanyBanner(ctx, s, point.x + 17, point.y - 14);
  }
  if (isHidden(s))
    drawMapLabel(ctx, "HIDDEN", s.position.x, s.position.y - 35, true);
  if (s.wagon.owned) {
    drawWagon(ctx, s.position.x - 55, s.position.y + 45, false, "mixed");
    drawMapLabel(ctx, "Company wagon", s.position.x - 55, s.position.y + 70);
  }
  if (s.travelers.merrit === "escorting") {
    drawWagon(ctx, s.position.x - 45, s.position.y + 28, false);
    person(s.position.x - 23, s.position.y + 28, "#bc9b65", 0, "", 2);
    drawMapLabel(ctx, "Merrit", s.position.x - 40, s.position.y + 56);
  }
  drawLighting(ctx, s, canvas.width, canvas.height);
  drawWeather(ctx, s);
}
canvas.onclick = (e) => {
  if (s.campOpen || companyLost(s) || s.fieldwork.report) return;
  const r = canvas.getBoundingClientRect(),
    x = view.x + (e.clientX - r.left) / view.scale,
    y = view.y + (e.clientY - r.top) / view.scale;
  if (s.event?.kind === "dungeon") {
    const tx = Math.floor((x - 105) / 62),
      ty = Math.floor(y / 60);
    interactDungeonTile(tx, ty);
    render();
    return;
  }
  if (s.battle) {
    const tx = Math.floor((x - 105) / 62),
      ty = Math.floor(y / 60),
      ally = s.battle.units.find(
        (u) => u.x === tx && u.y === ty && s.party[u.id].hp > 0,
      );
    if (ally && !spellMode) {
      selected = ally.id;
      abilityMode = false;
      spellMode = null;
    } else {
      const success = spellMode
        ? castSpell(s, selected, spellMode, tx, ty)
        : abilityMode
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
  $("hidden-scale").value = concealmentLevel(s);
  $("hidden-label").textContent =
    `${isHidden(s) ? "Hidden" : s.stealth.active ? "Concealing" : "Visible"} · ${Math.round(concealmentLevel(s))}%${isHidden(s) ? " · Concealed attacks can ambush" : ""}`;

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
    const hiddenBefore = isHidden(s);
    const ambushBefore = isHidden(s) && s.stealth.concealment >= 75;
    advanceStealth(s, seconds, heldKeys.size > 0 || !!s.destination);
    if (
      hiddenBefore !== isHidden(s) ||
      ambushBefore !== (isHidden(s) && s.stealth.concealment >= 75)
    )
      render();
    advanceClock(s, seconds * (menuSettings.slowDays ? 0.5 : 1));
    if (dayBefore !== s.day || s.event || companyLost(s)) render();
    updateClockUI();
    const nearbyBefore = nearbyPatrols(s)
      .map((p) => p.id)
      .join(",");
    advancePatrols(s, seconds);
    if (
      s.battle ||
      s.event ||
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
    (combatEffects.length || attackEffects.length || combatMotion.size) &&
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

window.addEventListener("resize", () => {
  positionObjective();
  draw();
});

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
    !gameActive ||
    s.fieldwork.report ||
    event.target.closest?.("input,select,textarea,[contenteditable=true]")
  )
    return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (
    s.event?.kind === "dungeon" &&
    !drawerOpen &&
    walkingKeys.includes(key) &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    event.preventDefault();
    const [dx, dy] = {
      w: [0, -1],
      ArrowUp: [0, -1],
      s: [0, 1],
      ArrowDown: [0, 1],
      a: [-1, 0],
      ArrowLeft: [-1, 0],
      d: [1, 0],
      ArrowRight: [1, 0],
    }[key];
    dungeonAction(s, "move", s.event.x + dx, s.event.y + dy);
    render();
    return;
  }

  if (
    !walkingKeys.includes(key) ||
    s.battle ||
    s.event ||
    drawerOpen ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  heldKeys.add(key);
});
window.addEventListener("keyup", (event) => {
  if (
    heldKeys.delete(
      event.key.length === 1 ? event.key.toLowerCase() : event.key,
    ) &&
    !heldKeys.size
  ) {
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
      `${enemy.name || enemy.kind || "raider"} · HP ${enemy.hp}/${enemy.max} · Armor ${enemyArmor(s, enemy)} · Range ${["archer", "mage", "cultist", "necromancer", "shaman", "sorcerer"].includes(enemy.kind) ? 4 : 1}${enemy.kind === "wolf" ? ` · Rush ${enemy.bossId === "ashfang" ? 3 : 2} · pack hunter` : enemy.kind === "archer" ? " · Keeps distance" : " · Melee flanking +2"}${enemyDescription(s, enemy) ? ` · ${enemyDescription(s, enemy)}` : ""}${enemy.stun ? " · Stunned" : ""}${enemy.bleed ? " · Bleeding" : ""}${enemy.bossId ? ` · ${namedAdversaries.find((boss) => boss.id === enemy.bossId)?.mechanic || "Named adversary"}` : ""}`;
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
    f.race = creatorField(
      c,
      `Founder ${i + 1} race`,
      "human",
      fantasyRaces.map((r) => [r.id, r.name]),
    );
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
      desc.textContent = `${fantasyRaces.find((r) => r.id === f.race.value).desc} ${["Wizard", "Cleric", "Druid", "Paladin"].includes(f.role.value) ? "Caster: one extra daily crown. " : ""}${f.trait.value === "hearty" ? 32 : stats.max} health · ${stats.damage + (f.trait.value === "mercenary" ? 1 : 0)} attack · ${f.trait.value === "mercenary" ? 3 : 2} crowns per day. ${t.desc}`;
      portrait.replaceChildren(
        portraitArtwork({
          ...p,
          ...Object.fromEntries(
            ["race", "sex", "skin", "hair", "hairStyle"].map((k) => [
              k,
              f[k].value,
            ]),
          ),
          role: f.role.value,
          coat:
            f.coat.value ||
            companyBanners.find((b) => b.id === banner.value).color,
        }),
      );
    };
    for (const key of ["race", "sex", "skin", "hair", "hairStyle", "coat"])
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

function appendTravelJobs(panel) {
  const row = card(
    "Travel duties",
    `<p>${companyScout(s) ? `${companyScout(s).name} can scout as an Archer or Thief.` : "Recruit an Archer or assign the Thief profession to unlock scouting."} A companion can hold one travel duty; camp jobs are assigned separately.</p>`,
  );
  for (const role of travelRoles) {
    const label = document.createElement("p");
    label.textContent = `${role.name}: ${role.desc}`;
    row.append(label);
    const select = document.createElement("select");
    select.setAttribute("aria-label", `${role.name} travel duty`);
    select.add(new Option("Unassigned", ""));
    for (const p of livingParty(s).filter((p) => p.hp > 0)) {
      const option = new Option(p.name, String(p.id));
      option.disabled =
        role.id === "scout"
          ? !(["Archer", "Rogue"].includes(p.role) || p.profession === "Thief")
          : !s.wagon.owned || (role.id === "rearguard" && isCaster(p));
      select.add(option);
    }
    select.value = travelWorker(s, role.id)?.id ?? "";
    select.disabled = !!s.battle || !!s.event;
    select.onchange = () => {
      assignTravelJob(
        s,
        role.id,
        select.value === "" ? null : Number(select.value),
      );
      render();
    };
    row.append(select);
  }
  panel.append(row);
}
function appendWagonPanel(panel) {
  if (!s.wagon.owned) {
    const row = card(
      "Company wagon",
      "<p>Purchase a wagon for 250 crowns at a village, or claim one after completing Hungry Roads. It adds ten cargo spaces, follows your company and supports travel duties and camp upgrades.</p>",
    );
    if (places[s.location]?.type === "town" && !s.campOpen) {
      row.append(
        button(
          "Buy company wagon · 250 crowns",
          () => buyCompanyWagon(s),
          s.gold < 250 || !!s.battle || !!s.event,
        ),
      );
      if (s.campaign.phase === "completed")
        row.append(
          button(
            "Claim earned company wagon",
            () => buyCompanyWagon(s, true),
            !!s.battle || !!s.event,
          ),
        );
    }
    panel.append(row);
    return;
  }
  const row = card(
    "Company wagon",
    `<p>Condition ${Math.round(s.wagon.condition)}/100 · cargo ${cargoLoad(s)}/${companyCargoCapacity(s)}. Quartermasters save food; rear guards and rails protect supplies during retreat. A camp Smith can maintain the wagon.</p>`,
  );
  appendWagonManifest(row);
  if (s.campOpen) {
    for (const upgrade of wagonUpgrades) {
      const text = document.createElement("p");
      text.textContent = `${upgrade.name} ${s.wagon[upgrade.id]}/${upgrade.max}: ${upgrade.desc}`;
      row.append(text);
      row.append(
        button(
          `Build ${upgrade.name} · ${upgrade.gold} crowns / ${upgrade.wood} wood / ${upgrade.ore} ore`,
          () => upgradeWagon(s, upgrade.id),
          s.wagon[upgrade.id] >= upgrade.max ||
            s.gold < upgrade.gold ||
            s.inventory.wood < upgrade.wood ||
            s.inventory.ore < upgrade.ore,
        ),
      );
    }
    row.append(
      button(
        "Repair wagon · 20 crowns / 2 ore / 2 hours",
        () => repairWagon(s),
        s.wagon.condition >= 100 ||
          !professional(s, "Smith") ||
          s.gold < 20 ||
          s.inventory.ore < 2,
      ),
    );
  }
  panel.append(row);
}
function appendEscortPanel(panel) {
  const escort = s.caravanEscort;
  if (!escort) return;
  const name =
    s.patrols.find((p) => p.id === escort.patrolId)?.name || "Caravan";
  const row = card(
    `Escort: ${name}`,
    `<p>${escort.status === "arrived" ? "Arrived safely." : "Protect this wagon while travelling freely."} Destination ${places[escort.destination].name} · reward ${escort.reward} crowns.</p>`,
  );
  if (escort.status === "arrived" && s.location === escort.destination)
    row.append(
      button(
        "Collect caravan escort payment",
        () => claimCaravanEscort(s),
        !!s.battle || !!s.event,
      ),
    );
  row.append(
    button(
      "Abandon caravan escort",
      () => abandonCaravanEscort(s),
      !!s.battle || !!s.event,
    ),
  );
  panel.append(row);
}

function appendTerritoryPanel(panel) {
  const owner = territoryOwner(s),
    name = factions.find((v) => v.id === owner)?.name;
  const c = card("Village allegiance", "");
  const text = document.createElement("p");
  text.textContent = `${places[s.location].name} is controlled by ${name}. Local standing affects prices and recruitment; hostile rulers charge a day pass.`;
  c.append(text);
  if (townAccessLock(s))
    c.append(
      button(
        "Buy village day pass · 25 crowns",
        () => buyTerritoryPass(s),
        s.gold < 25,
      ),
    );
  const details = document.createElement("details"),
    summary = document.createElement("summary");
  summary.textContent = "Back a faction charter";
  details.append(summary);
  const hint = document.createElement("p");
  hint.textContent =
    "Commit 40 crowns and six rations. Your faction gains six reputation, the previous rulers lose six, and other rivals lose two. One charter per village every three days; a border guard protects the new rulers.";
  details.append(hint);
  for (const f of factions)
    details.append(
      button(
        `Back ${f.name} · 40 crowns / 6 rations`,
        () => supportTerritory(s, f.id),
        !!townAccessLock(s) ||
          s.gold < 40 ||
          s.food < 6 ||
          s.day - (s.realm.charters[s.location] || -99) < 3,
      ),
    );
  c.append(details);
  panel.append(c);
}
function appendRealmCompany(panel) {
  const journal = card(
    "Encounter journal",
    "<p>Known leads, recurring travelers, faction promises, and the company's decisions.</p>",
  );
  appendRealmJournal(journal);
  panel.append(journal);
  const reagents = document.createElement("p");
  reagents.textContent = `Aether shards: ${s.realm.shards}. Find them in hidden dungeon chambers and the Outcast spire; at camp, one restores a level-two slot or two level-one slots.`;
  panel.append(reagents);
  const stories = document.createElement("details"),
    title = document.createElement("summary");
  title.textContent = "Companion heritage stories";
  stories.append(title);
  for (const p of livingParty(s)) {
    const story = lineageStories[p.race || "human"],
      q = s.realm.lineage[p.id],
      c = card(`${p.name} · ${story.name}`, "");
    const text = document.createElement("p");
    text.textContent = `${places[story.site].name} · ${q?.outcome || (q?.stage === 2 && "Evidence found; decide at camp") || (q?.stage === 1 && "Follow the lead") || "Discuss at camp"}. ${story.effect}`;
    c.append(text);
    for (const [action, label] of [
      ["begin", "Discuss heritage"],
      ["investigate", "Investigate personal lead"],
      ["honor", "Honor the discovery"],
      ["sell", "Sell discovery · 50 crowns"],
      ["leave", "Let companion leave"],
      ["reconcile", "Reconcile · 25 crowns"],
    ])
      c.append(
        button(
          `${label}: ${p.name}`,
          () => lineageStoryAction(s, p.id, action),
          !!lineageStoryLock(s, p.id, action),
        ),
      );
    if (isCaster(p) && s.campOpen)
      c.append(
        button(
          `Use aether shard: ${p.name}`,
          () => recoverShardMagic(s, p.id),
          s.realm.shards < 1 || !(p.spellSpent?.[1] || p.spellSpent?.[2]),
        ),
      );
    if (isCaster(p) && s.campOpen)
      c.append(
        button(`Sanctuary recovery: ${p.name} · 1 herb`, () =>
          recoverFrontierSlot(s, p.id),
        ),
      );
    stories.append(c);
  }
  panel.append(stories);
}
function appendRealmJournal(panel) {
  const leads = realmJournal(s);
  if (leads.length) {
    const details = document.createElement("details"),
      summary = document.createElement("summary");
    summary.textContent = `Known leads and consequences (${leads.length})`;
    details.append(summary);
    for (const lead of leads) {
      const c = card(lead.title, "");
      const text = document.createElement("p");
      text.textContent = `${places[lead.site].name}: ${lead.text}`;
      c.append(
        text,
        button(
          `Track: ${lead.title}`,
          () => {
            if (trackRealmLead(s, lead.id)) drawerOpen = false;
          },
          !!s.battle || !!s.event || s.campOpen,
        ),
      );
      details.append(c);
    }
    panel.append(details);
  }
  const history = document.createElement("details"),
    summary = document.createElement("summary");
  summary.textContent = `Company chronicle (${s.realm.journal.length})`;
  history.append(summary);
  for (const record of s.realm.journal.slice(0, 30)) {
    const p = document.createElement("p");
    p.textContent = `Day ${record.day} · ${record.text}`;
    history.append(p);
  }
  panel.append(history);
}
function appendRealmWorldActions(a) {
  if (s.battle || s.event || s.campOpen || companyLost(s)) return;
  for (const h of fantasyStrongholds) {
    if (
      Math.hypot(
        s.position.x - places[h.site].x,
        s.position.y - places[h.site].y,
      ) > 110
    )
      continue;
    const state = realmHold(s, h.id);
    state.known = true;
    if (state.cleared) continue;
    const details = document.createElement("details"),
      summary = document.createElement("summary");
    summary.textContent = `${h.name} · scout, disrupt, assault`;
    details.append(summary);
    const p = document.createElement("p");
    p.textContent = state.scouted
      ? h.routine
      : "An enemy stronghold sends raiders onto nearby roads. Survey it with an Archer or Thief.";
    details.append(p);
    details.append(
      button(
        `Survey ${h.name}`,
        () => fantasyHoldAction(s, h.id, "scout"),
        !!fantasyHoldLock(s, h.id, "scout"),
      ),
      button(
        `${h.operation} · ${h.amount} ${h.cost}`,
        () => fantasyHoldAction(s, h.id, "disrupt"),
        !!fantasyHoldLock(s, h.id, "disrupt"),
      ),
      button(
        `Assault ${h.name}`,
        () => {
          fantasyHoldAction(s, h.id, "attack");
          drawerOpen = false;
        },
        !!fantasyHoldLock(s, h.id, "attack"),
      ),
    );
    a.append(details);
  }
  for (const p of livingParty(s)) {
    if (
      s.realm.lineage[p.id]?.stage === 1 &&
      lineageStories[p.race || "human"].site === s.location
    )
      a.append(
        button(`Investigate personal lead: ${p.name}`, () =>
          lineageStoryAction(s, p.id, "investigate"),
        ),
      );
  }
}
function appendDungeonPuzzle(c) {
  const q = dungeonPuzzle(s),
    e = s.event,
    near = Math.abs(e.x - 4) + Math.abs(e.y - 3) <= 1;
  const details = document.createElement("details"),
    summary = document.createElement("summary");
  details.open = near && dungeonDoorOpen;
  summary.textContent = "Side chamber · scouting, lock, rune seal";
  details.append(summary);
  const p = document.createElement("p");
  p.textContent = q.cache
    ? "Side chamber emptied."
    : `Door at tile 5,4. Lock ${q.unlocked ? "open" : `${q.pins}/3 pins · tension ${q.dial}/4 · strain ${q.strain}/3`}; rune sequence ${q.rune}/3. ${q.spotted ? "Root, flame, star." : "An Archer or Thief can read the hidden clues."}`;
  details.append(p);
  details.append(
    button(
      "Scout dungeon hazards",
      () => realmDungeonAction(s, "scout-room"),
      !companyScout(s) || q.spotted,
    ),
    button(
      "Adjust side-room lock tension",
      () => realmDungeonAction(s, "dial"),
      !near || !companyLockpicker(s) || q.unlocked,
    ),
    button(
      "Pick side-room tumbler",
      () => realmDungeonAction(s, "pick"),
      !near || !companyLockpicker(s) || q.unlocked,
    ),
  );
  for (const [i, name] of ["Root", "Flame", "Star"].entries())
    details.append(
      button(
        `Touch ${name} rune`,
        () => realmDungeonAction(s, "rune", i),
        !near || !q.unlocked || q.door,
      ),
    );
  details.append(
    button(
      "Dissolve seal · level 1 spell slot",
      () => realmDungeonAction(s, "magic-door"),
      !near ||
        q.door ||
        !livingParty(s).some(
          (p) => isCaster(p) && p.hp > 0 && spellSlots(p)[1] > 0,
        ),
    ),
    button(
      "Search side chamber",
      () => realmDungeonAction(s, "side-cache"),
      !near || !q.door || q.cache,
    ),
  );
  c.append(details);
}
function drawRealmMagic() {
  for (const v of s.battle.realmMagic?.surfaces || []) {
    ctx.fillStyle = {
      fire: "#bf703a55",
      silence: "#7b91ad55",
      darkness: "#3c315faa",
    }[v.kind];
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 9; x++)
        if (Math.abs(x - v.x) + Math.abs(y - v.y) <= 1)
          ctx.fillRect(108 + x * 62, 3 + y * 60, 54, 52);
    drawMapLabel(
      ctx,
      v.kind.toUpperCase(),
      136 + v.x * 62,
      42 + v.y * 60,
      true,
    );
  }
  for (const focus of s.battle.realmMagic?.concentration || [])
    drawMapLabel(ctx, "BEACON", 136 + focus.x * 62, 12 + focus.y * 60, true);
}

function lockedButton(label, fn, reason) {
  const wrap = document.createElement("div"),
    b = button(label, fn, !!reason);
  b.title = reason || "";
  wrap.append(b);
  if (reason) {
    const p = document.createElement("small");
    p.className = "hint";
    p.textContent = reason;
    wrap.append(p);
  }
  return wrap;
}
function fold(title, open = false) {
  const d = document.createElement("details"),
    s = document.createElement("summary");
  s.textContent = title;
  d.open = open;
  d.append(s);
  return d;
}
function appendExpeditionCompany(panel) {
  const f = upkeepForecast(s),
    cost = card("Company outlook", "");
  const p = document.createElement("p");
  p.textContent = `Daily cost: ${f.food} rations and ${f.wages} crowns. Supplies cover ${f.foodDays} days; available crowns cover ${f.paidDays} days after wage debt. Next upkeep in ${Math.ceil(f.hoursToDawn)} game hours. Travel days last five real minutes while active; menus and encounters pause time.`;
  cost.append(p);
  panel.append(cost);
  const careers = fold("Class careers · permanent progression");
  for (const companion of livingParty(s)) {
    const c = card(
      `${companion.name} · ${activeCareer(companion)?.name || "Choose a career"}`,
      "",
    );
    const desc = document.createElement("p");
    desc.textContent =
      "Level two and one training point. Choose one permanent path; Thief paths require the Thief profession to operate.";
    c.append(desc);
    for (const path of careersFor(companion)) {
      const text = document.createElement("p");
      text.textContent = `${path.name}: ${path.desc}`;
      c.append(
        text,
        lockedButton(
          `Learn ${path.name}: ${companion.name}`,
          () => learnCareer(s, companion.id, path.id),
          careerLock(s, companion.id, path.id),
        ),
      );
    }
    careers.append(c);
  }
  panel.append(careers);
  const trails = fold("Observed trails · follow the evidence");
  for (const t of observationTrails) {
    const st = s.expedition.clues[t.id];
    if (!st) continue;
    const c = card(t.name, "");
    const text = document.createElement("p");
    text.textContent = `${st.stage}/3 clues understood. ${st.stage ? t.clues[st.stage - 1] : "A sign has been spotted, but its meaning is unclear."}`;
    c.append(
      text,
      button(
        `Follow ${t.name}`,
        () => {
          if (followObservation(s, t.id)) drawerOpen = false;
        },
        !!s.battle || !!s.event || s.campOpen,
      ),
    );
    trails.append(c);
  }
  panel.append(trails);
  const home = fold("Company home · permanent investment"),
    h = s.expedition.home;
  const text = document.createElement("p");
  text.textContent = h.owned
    ? `Wayfarer ${h.style === "farm" ? "Farm" : "Lodge"}: ${reserveLoad(s)}/${reserveCapacity(s)} stored reserves. Visit to build stations, rest, and craft.`
    : "An abandoned property stands southeast of Echo Cavern. Purchase it for 320 crowns and ten wood; choose a lodge or farm. The wagon remains your traveling camp.";
  home.append(
    text,
    button(
      "Travel to Wayfarer Lodge",
      () => {
        moveTo(s, places[15].x, places[15].y);
        drawerOpen = false;
      },
      !!s.battle || !!s.event || s.campOpen,
    ),
  );
  panel.append(home);
  const bonds = fold("Travel relationships");
  const info = document.createElement("p");
  info.textContent =
    "Long journeys prompt conversations. Shared meals build trust; dismissal creates rivals. Protective and healing career techniques can be refused between rivals. Promised wages must be settled by the next dawn.";
  bonds.append(info);
  if (s.expedition.promise) {
    const promise = document.createElement("p");
    promise.textContent = `Outstanding promise: pay wage debt by day ${s.expedition.promise.due}.`;
    bonds.append(promise);
  }
  panel.append(bonds);
}
function appendMissionBoard(panel) {
  const d = fold("Tactical missions · varied battle objectives");
  for (const m of tacticalMissions.filter((v) => v.issuer === s.location)) {
    const c = card(m.name, "");
    const p = document.createElement("p");
    p.textContent = `${places[m.site].name} · ${m.reward} crowns. ${m.desc}`;
    c.append(
      p,
      lockedButton(
        `Accept mission: ${m.name}`,
        () => acceptMission(s, m.id),
        missionLock(s, m.id),
      ),
    );
    d.append(c);
  }
  panel.append(d);
  if (s.expedition.mission) {
    const m = tacticalMissions.find((v) => v.id === s.expedition.mission);
    panel.append(
      card(`Active mission: ${m.name}`, `<p>${m.desc}</p>`),
      button("Abandon tactical mission", () => abandonMission(s)),
    );
  }
}
function appendExpeditionWorld(a) {
  if (s.battle || s.event || s.campOpen || companyLost(s)) return;
  observeClues(s);
  for (const clue of visibleClues(s).filter(
    (v) => Math.hypot(v.x - s.position.x, v.y - s.position.y) <= 55,
  ))
    a.append(
      lockedButton(
        `Read ${clue.name}`,
        () => interpretClue(s, clue.id),
        interpretClueLock(s, clue.id),
      ),
    );
  if (s.location === 15) {
    if (s.expedition.home.owned)
      a.append(
        lockedButton("Enter company home", () => enterHome(s), homeLock(s)),
      );
    else {
      const d = fold("Purchase Wayfarer property");
      for (const style of ["lodge", "farm"])
        d.append(
          lockedButton(
            `Buy ${style} · 320 crowns / 10 wood`,
            () => purchaseHome(s, style),
            homeLock(s, "buy"),
          ),
        );
      a.append(d);
    }
  }
  const m = tacticalMissions.find((v) => v.id === s.expedition.mission);
  if (m && s.location === m.site)
    a.append(
      lockedButton(
        `Begin mission: ${m.name}`,
        () => startMission(s),
        missionLock(s, m.id, "start"),
      ),
    );
}
function appendMissionCombat(a) {
  const o = s.battle?.objective;
  if (!o) return;
  const d = fold(`Objective · ${missionObjective(s)}`);
  d.open = true;
  if (o.kind === "rescue")
    d.append(
      lockedButton(
        o.rescuer === null ? "Free captive" : "Extract captive",
        () =>
          missionAction(s, selected, o.rescuer === null ? "free" : "extract"),
        missionActionLock(s, selected, o.rescuer === null ? "free" : "extract"),
      ),
    );
  if (o.kind === "rescue" && o.rescuer !== null && s.party[o.rescuer]?.hp <= 0)
    d.append(
      lockedButton(
        "Take over captive escort",
        () => missionAction(s, selected, "carry"),
        missionActionLock(s, selected, "carry"),
      ),
    );
  if (o.kind === "escape")
    d.append(
      lockedButton(
        "Withdraw together",
        () => missionAction(s, selected, "escape"),
        missionActionLock(s, selected, "escape"),
      ),
    );
  if (o.kind === "ritual")
    for (let i = 0; i < 3; i++)
      d.append(
        lockedButton(
          `Disrupt ritual seal ${i + 1}`,
          () => missionAction(s, selected, "sigil", i),
          missionActionLock(s, selected, "sigil", i),
        ),
      );
  a.append(d);
}
function appendCareerCombat(a) {
  const path = activeCareer(s.party[selected]);
  if (!path) return;
  const d = fold(`Class technique · ${path.name}`),
    hint = document.createElement("p");
  hint.textContent = path.desc;
  d.append(hint);
  const enemyPaths = [
      "shadow",
      "saboteur",
      "tracker",
      "controller",
      "hexer",
      "avenger",
    ],
    allyPaths = ["protector", "mentor"];
  const targets = enemyPaths.includes(path.id)
    ? s.battle.enemies
        .filter((e) => e.hp > 0)
        .map((e) => ({ id: e.id, name: e.name || e.kind }))
    : allyPaths.includes(path.id)
      ? s.battle.units
          .filter((u) => u.id !== selected && s.party[u.id].hp > 0)
          .map((u) => ({ id: u.id, name: s.party[u.id].name }))
      : [{ id: null, name: "company" }];
  for (const target of targets)
    d.append(
      lockedButton(
        `Use ${path.name} on ${target.name}`,
        () => careerAction(s, selected, target.id),
        careerActionLock(s, selected, target.id),
      ),
    );
  a.append(d);
}
let reserveResource = "food";
function appendHomePanel(c) {
  const h = s.expedition.home,
    stores = document.createElement("p");
  stores.textContent = `${h.style === "farm" ? "Farm" : "Lodge"} reserves ${reserveLoad(s)}/${reserveCapacity(s)}: ${Object.entries(
    h.stores,
  )
    .map(([k, v]) => `${k} ${v}`)
    .join(" · ")}`;
  c.append(stores);
  const reserve = fold("Store and withdraw supplies"),
    select = document.createElement("select");
  select.setAttribute("aria-label", "Home reserve resource");
  for (const key of Object.keys(h.stores)) select.add(new Option(key, key));
  select.value = reserveResource;
  select.onchange = () => {
    reserveResource = select.value;
    render();
  };
  reserve.append(select);
  const carried =
    reserveResource === "food"
      ? s
      : tradeGoods.some((g) => g.id === reserveResource)
        ? s.cargo
        : s.inventory;
  for (const amount of [1, 5])
    for (const direction of ["deposit", "withdraw"])
      reserve.append(
        lockedButton(
          `${direction === "deposit" ? "Store" : "Withdraw"} ${amount} ${reserveResource}`,
          () => transferHome(s, reserveResource, amount, direction),
          direction === "deposit"
            ? carried[reserveResource] < amount
              ? "Not enough carried supplies."
              : reserveLoad(s) + amount > reserveCapacity(s)
                ? "Make room in home reserves."
                : ""
            : h.stores[reserveResource] < amount
              ? "Not enough supplies in home reserves."
              : carried === s.cargo &&
                  cargoLoad(s) + amount > companyCargoCapacity(s)
                ? "Make room in company cargo."
                : "",
        ),
      );
  c.append(reserve);
  c.append(
    lockedButton(
      "Rest at home · 12 hours",
      () => restAtHome(s),
      s.food + h.stores.food < Math.max(2, Math.ceil(campCost(s) / 2))
        ? "Not enough rations in company or home stores."
        : "",
    ),
    lockedButton(
      "Harvest kitchen garden",
      () => harvestHome(s),
      !h.upgrades.garden
        ? "Build a kitchen garden first."
        : s.day - h.harvestDay < 3
          ? `Ready on day ${h.harvestDay + 3}.`
          : reserveLoad(s) + (h.style === "farm" ? 8 : 6) > reserveCapacity(s)
            ? "Make room in home reserves."
            : "",
    ),
  );
  const upgrades = fold("Improve the property");
  for (const item of homeUpgrades) {
    const p = document.createElement("p");
    p.textContent = item.desc;
    upgrades.append(
      p,
      lockedButton(
        `Build ${item.name} · ${item.gold} crowns / ${item.wood} wood / ${item.ore} ore`,
        () => upgradeHome(s, item.id),
        h.upgrades[item.id]
          ? "Already built."
          : s.gold < item.gold ||
              s.inventory.wood < item.wood ||
              s.inventory.ore < item.ore
            ? "Gather the listed crowns and materials."
            : "",
      ),
    );
  }
  c.append(upgrades);
  const stations = fold("Home stations · assign operators");
  for (const [role, label] of [
    ["smith", "Home smith"],
    ["medic", "Home medic"],
  ]) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", label);
    select.add(new Option("Unassigned", ""));
    for (const p of livingParty(s))
      if (p.profession === (role === "smith" ? "Smith" : "Herbalist"))
        select.add(new Option(p.name, p.id));
    select.value = h.staff[role] ?? "";
    select.onchange = () => {
      assignHomeJob(s, role, select.value === "" ? null : Number(select.value));
      render();
    };
    const p = document.createElement("p");
    p.textContent = label;
    stations.append(p, select);
  }
  for (const gear of s.gear.filter((g) => g.durability < 100))
    stations.append(
      lockedButton(
        `Home repair: ${gear.name}`,
        () => homeRepair(s, gear.id),
        !h.upgrades.forge || !homeWorker(s, "smith")
          ? "Build a forge and assign a conscious Smith."
          : s.inventory.ore < 1 || s.inventory.wood < 1
            ? "Requires one ore and one wood."
            : "",
      ),
    );
  for (const item of equipmentCatalog.filter((v) => v.tier === 2)) {
    const quote = equipmentRecipe(s, item.id);
    stations.append(
      lockedButton(
        `Home craft: ${item.name}`,
        () => homeCraft(s, item.id),
        !h.upgrades.forge || !homeWorker(s, "smith")
          ? "Build a forge and assign a conscious Smith."
          : !s.research.includes("armorer")
            ? "Requires the Armorer discovery."
            : s.inventory.ore < Math.max(1, quote.ore - 1) ||
                s.inventory.wood < quote.wood
              ? `Requires ${Math.max(1, quote.ore - 1)} ore and ${quote.wood} wood.`
              : "",
      ),
    );
  }
  for (const p of livingParty(s).filter(isCaster))
    stations.append(
      lockedButton(
        `Home magic recovery: ${p.name} · 1 aether shard`,
        () => recoverMagicAtHome(s, p.id),
        s.realm.shards < 1
          ? "Find an aether shard in a hidden chamber or mage stronghold."
          : !(p.spellSpent?.[1] || p.spellSpent?.[2])
            ? "All spell slots are already ready."
            : "",
      ),
    );
  c.append(
    stations,
    button("Leave company home", () => (s.event = null)),
  );
}
function drawMissionObjective() {
  const o = s.battle.objective;
  if (!o) return;
  if (o.kind === "defense") {
    drawWagon(ctx, 136 + 2 * 62, 28 + 3 * 60, false, "wheat");
    drawMapLabel(ctx, `DEFEND ${o.wagon}/30`, 136 + 2 * 62, 3 * 60 - 4, true);
  }
  if (o.kind === "rescue") {
    const carrier = s.battle.units.find((u) => u.id === o.rescuer),
      x = carrier?.x ?? 7,
      y = carrier?.y ?? 3;
    person(151 + x * 62, 37 + y * 60, "#c4b48b", 0, "", 2);
    drawMapLabel(
      ctx,
      carrier ? "CAPTIVE FOLLOWS" : "CAPTIVE",
      136 + x * 62,
      y * 60 - 3,
      true,
    );
  }
  if (o.kind === "escape" || o.kind === "rescue") {
    const x = o.kind === "escape" ? 7 : 0;
    ctx.fillStyle = "#d0bf6755";
    ctx.fillRect(105 + x * 62, 0, 124, 420);
    drawMapLabel(ctx, "EXIT", 136 + x * 62, 20, true);
  }
  if (o.kind === "ritual")
    for (const [i, [x, y]] of [
      [4, 1],
      [6, 3],
      [4, 5],
    ].entries()) {
      ctx.strokeStyle = o.sigils.includes(i) ? "#6f8c61" : "#b16c9a";
      ctx.lineWidth = 3;
      ctx.strokeRect(115 + x * 62, 12 + y * 60, 35, 30);
      drawMapLabel(
        ctx,
        o.sigils.includes(i) ? "BROKEN" : `SEAL ${i + 1}`,
        136 + x * 62,
        42 + y * 60,
        true,
      );
    }
}
function drawObservationClues() {
  for (const clue of visibleClues(s)) {
    const x = clue.x,
      y = clue.y;
    ctx.fillStyle = {
      tracks: "#67503c",
      smoke: "#72796a",
      lights: "#a0b8bd",
      road: "#b6ae87",
    }[clue.kind];
    if (clue.kind === "tracks")
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x + i * 5, y + (i % 2) * 5, 3, 4);
    if (clue.kind === "smoke")
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x + (i % 2) * 4, y - i * 7, 5, 6);
    if (clue.kind === "lights")
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x + i * 5, y + (i % 2) * 5, 3, 3);
    if (clue.kind === "road")
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x + i * 6, y + (i % 2) * 3, 5, 6);
    drawMapLabel(ctx, clue.name, x, y + 24, true);
  }
}

function appendActionRequirements() {
  const source = drawerOpen ? $("panel") : $("actions"),
    buttons = [...source.querySelectorAll("button:disabled")];
  if (!buttons.length) return;
  const details = fold("Unavailable actions · requirements"),
    seen = new Set();
  for (const b of buttons) {
    const label = b.textContent;
    if (seen.has(label)) continue;
    seen.add(label);
    const reason = b.title || inferActionRequirement(label);
    b.title = reason;
    const text = document.createElement("p");
    text.textContent = `${label}: ${reason}`;
    details.append(text);
    if (seen.size >= 12) break;
  }
  source.append(details);
}
function inferActionRequirement(label) {
  if (s.battle) {
    const unit = s.battle.units.find((u) => u.id === selected);
    if (unit?.acted)
      return "The selected companion has already spent their action this round.";
    if (label.startsWith("Prepare ")) {
      const spell = spellBook.find((v) =>
        label.startsWith(`Prepare ${v.name} ·`),
      );
      if (spell && spellSlots(s.party[selected])[spell.level] < 1)
        return `No level ${spell.level} spell slots remain. Recover at camp, at home with rare supplies, or in Emberfall.`;
    }
    return "Requires a living target within range and sight, enough valor, and an unused action or movement.";
  }
  if (label.startsWith("Sell"))
    return "You need unassigned stock or equipment to sell.";
  if (label.includes("Recruit") || label.startsWith("Hire"))
    return livingParty(s).length >= 6
      ? "The company can house six companions. Make room before recruiting."
      : "You need enough crowns for the recruitment fee.";
  const currencies = {
    crowns: s.gold,
    wood: s.inventory.wood,
    ore: s.inventory.ore,
    herbs: s.inventory.herbs,
    rations: s.food,
    knowledge: s.knowledge,
    renown: s.renown,
  };
  for (const match of label.matchAll(
    /(\d+) (crowns|wood|ore|herbs|rations|knowledge|renown)/g,
  )) {
    const [_, amount, key] = match;
    if (currencies[key] < Number(amount))
      return `Requires ${amount} ${key}; you have ${currencies[key]}.`;
  }
  if (label.startsWith("Learn"))
    return "Check the listed class, level, training points, prerequisites, and permanent choices.";
  if (label.startsWith("Build"))
    return "This improvement is already built, or its listed materials and camp requirements are not met.";
  if (label.includes("Rest"))
    return "Finish the encounter and provide the listed food or crowns for rest.";
  if (label.includes("repair") || label.includes("Repair"))
    return "Requires damaged equipment, the listed materials, and a conscious assigned Smith where applicable.";
  if (s.event?.kind === "dungeon")
    return "Stand beside the relevant dungeon feature and bring the required profession or materials.";
  return "Check the action's listed location, resources, companion requirements, and one-time completion status.";
}

function appendOdysseyCompany(panel) {
  const region = regionAt(s.position),
    atlas = fold(`Regions · ${region.name}`);
  for (const r of regions) {
    const line = document.createElement("p");
    line.textContent = `${r.name}${s.odyssey.visited[r.id] || r.id === region.id ? " · visited" : ""}: ${r.desc}`;
    atlas.append(line);
  }
  atlas.append(
    card(
      "Regional travel",
      "<p>Long journeys can encounter local obstacles once per region each day. Specialists save time; supplies or tiring detours provide alternatives. Mountains yield ore, haunted woods yield herbs. Village markets offer regional services.</p>",
    ),
  );
  panel.append(atlas);
  appendContinuationPanel(panel);
  if (s.odyssey.prisoners.length) appendPrisoners(panel);
  const relics = fold("Regional relics · finite tactical equipment");
  for (const r of regionalRelics) {
    const item = equipmentCatalog.find((v) => v.id === r.id),
      line = document.createElement("p");
    line.textContent = `${item.name}: ${equipmentPerks[item.perk]} ${r.desc} ${s.odyssey.relics[r.id] ? "Recovered." : `Two knowledge and ${r.amount} ${r.resource}.`}`;
    relics.append(line);
    if (s.discovered.includes(r.site) && !s.odyssey.relics[r.id])
      relics.append(
        button(
          `Travel to relic: ${places[r.site].name}`,
          () => moveTo(s, places[r.site].x, places[r.site].y),
          !!s.battle || !!s.event || s.campOpen,
        ),
      );
  }
  panel.append(relics);
}
function appendPrisoners(panel) {
  const menu = fold(`Prisoners · ${s.odyssey.prisoners.length}/3`, true),
    guard = prisonerGuard(s);
  const desc = document.createElement("p");
  desc.textContent = `Each prisoner consumes one extra ration at dawn. Two fed days permit recruitment at camp for sixty crowns. Two hungry days cause escape; three days without supervision also cause escape. Supervisor: ${guard?.name || "none"}. Recruitment brings Mercenary wages and fifty resolve.`;
  menu.append(desc);
  for (const p of s.odyssey.prisoners) {
    const c = card(p.name),
      line = document.createElement("p");
    line.textContent = `${p.kind} · trust ${p.trust}/2 · hungry days ${p.unfed} · captured day ${p.day}`;
    c.append(line);
    for (const [action, label] of [
      [
        "ransom",
        `Deliver ${p.name} for bounty · ${p.kind === "mage" ? 45 : 30} crowns`,
      ],
      ["recruit", `Recruit ${p.name} · 60 crowns`],
      ["release", `Release ${p.name}`],
    ])
      c.append(
        lockedButton(
          label,
          () => prisonerAction(s, p.id, action),
          prisonerActionLock(s, p.id, action),
        ),
      );
    menu.append(c);
  }
  panel.append(menu);
}
function appendRegionalServices(panel) {
  const r = regionAt(s.position),
    c = card(r.name),
    line = document.createElement("p");
  c.dataset.villageService = "regional";
  line.textContent = r.desc;
  c.append(line);
  if (s.location === 0)
    c.append(
      lockedButton(
        "Buy harvest bundle · 18 crowns / 12 rations",
        () => regionalService(s, "provisions"),
        regionalServiceLock(s, "provisions"),
      ),
    );
  if (s.location === 3)
    c.append(
      lockedButton(
        "Buy reed remedies · 20 crowns",
        () => regionalService(s, "remedies"),
        regionalServiceLock(s, "remedies"),
      ),
    );
  if (s.location === 6) {
    const gates = fold("Academy gates · fifty crowns and one level-two slot");
    const hint = document.createElement("p");
    hint.textContent =
      "Passage takes two hours. Gates carry the company, but cannot transport a wagon, escorted travelers or prisoners.";
    gates.append(hint);
    for (const id of [0, 3])
      gates.append(
        lockedButton(
          `Arcane passage to ${places[id].name}`,
          () => regionalService(s, "transit", id),
          regionalServiceLock(s, "transit", id),
        ),
      );
    c.append(gates);
  }
  for (const p of livingParty(s)) {
    const q = continuationInfo(s, p.id);
    if (q?.stage === 1 && q.meet === s.location)
      c.append(
        lockedButton(
          `Hear testimony for ${p.name}`,
          () => continueCompanion(s, p.id, "meet"),
          continuationLock(s, p.id, "meet"),
        ),
      );
  }
  panel.append(c);
  if (s.odyssey.prisoners.length) appendPrisoners(panel);
}
function appendOdysseyWorld(a) {
  if (s.battle || s.event || s.campOpen) return;
  for (const p of livingParty(s)) {
    const q = continuationInfo(s, p.id);
    if (q?.stage === 2 && q.site === s.location)
      a.append(
        lockedButton(
          `Recover evidence for ${p.name}`,
          () => continueCompanion(s, p.id, "recover"),
          continuationLock(s, p.id, "recover"),
        ),
      );
  }
  for (const r of regionalRelics)
    if (r.site === s.location && !s.odyssey.relics[r.id])
      a.append(
        lockedButton(
          `Recover ${equipmentCatalog.find((v) => v.id === r.id).name}`,
          () => recoverRelic(s, r.id),
          relicLock(s, r.id),
        ),
      );
}
function appendOdysseyCombat(a) {
  const q = continuationInfo(s, selected);
  if (q?.stage === 4 && ["swear", "reconcile"].includes(q.outcome)) {
    const menu = fold(`Personal technique · ${q.perk}`),
      targets =
        s.party[selected].role === "Swordswoman"
          ? s.battle.enemies.filter((e) => e.hp > 0)
          : [null];
    const hint = document.createElement("p");
    hint.textContent = q.desc;
    menu.append(hint);
    for (const e of targets)
      menu.append(
        lockedButton(
          `Use ${q.perk}${e ? ` on ${e.name || e.kind} ${e.id + 1}` : ""}`,
          () => continuationTechnique(s, selected, e?.id ?? null),
          continuationTechniqueLock(s, selected, e?.id ?? null),
        ),
      );
    a.append(menu);
  }
  const offers = s.battle.enemies.filter((e) => e.hp > 0 && e.surrenderOffer);
  if (offers.length) {
    const menu = fold("Enemy surrender · decide their fate", true);
    for (const e of offers) {
      const line = document.createElement("p");
      line.textContent = `${e.name || e.kind} ${e.id + 1} offers surrender. Capture costs food and supervision; safe passage pays eight crowns but lowers Warden reputation.`;
      menu.append(line);
      for (const [action, label] of [
        ["capture", "Take prisoner"],
        ["ransom", "Sell safe passage"],
        ["release", "Release alive"],
        ["refuse", "Refuse surrender"],
      ])
        menu.append(
          lockedButton(
            `${label}: ${e.kind} ${e.id + 1}`,
            () => answerSurrender(s, e.id, action),
            surrenderLock(s, e.id, action),
          ),
        );
    }
    a.append(menu);
  }
}

function appendContinuationPanel(panel) {
  const journeys = fold("Companion continuations · oaths and reconciliation");
  for (const p of livingParty(s)) {
    if (tab === "Camp" && !campOpportunity(s, p.id)) continue;
    const q = continuationInfo(s, p.id);
    if (!q) continue;
    const partner = s.party[q.partner],
      c = card(`${p.name} · ${q.title}`);
    const line = document.createElement("p");
    line.textContent = `${q.desc} ${q.stage === 0 ? "Finish their first personal journey, then begin this follow-up at camp." : q.stage === 1 ? `Hear testimony at ${places[q.meet].name}.` : q.stage === 2 ? `Recover evidence at ${places[q.site].name}; bring two ${q.resource}.` : q.stage === 3 ? `Discuss the evidence at camp. Partner: ${partner?.name || "none"}; bond ${partner ? bondValue(s, p.id, partner.id) : 0}.` : `Resolved: ${q.outcome}.`} `;
    c.append(line);
    if (q.stage >= 2) {
      const story = document.createElement("p");
      story.textContent = q.stage === 2 ? q.testimony : q.evidence;
      c.append(story);
    }
    if (s.campOpen && q.stage > 0 && q.stage < 4) {
      const partners = document.createElement("select");
      partners.setAttribute("aria-label", `Journey partner: ${p.name}`);
      partners.add(new Option("Choose a partner", ""));
      for (const other of livingParty(s).filter(
        (v) => v.id !== p.id && v.hp > 0,
      ))
        partners.add(
          new Option(
            `${other.name} · bond ${bondValue(s, p.id, other.id)}`,
            String(other.id),
          ),
        );
      partners.value = q.partner === null ? "" : String(q.partner);
      partners.onchange = () => {
        if (partners.value !== "")
          chooseJourneyPartner(s, p.id, Number(partners.value));
        render();
      };
      c.append(partners);
    }
    const choices =
      q.stage === 0
        ? [["begin", `Begin ${p.name}'s follow-up`]]
        : q.stage === 1
          ? [["meet", `Hear testimony for ${p.name}`]]
          : q.stage === 2
            ? [["recover", `Recover evidence for ${p.name}`]]
            : q.stage === 3
              ? [
                  ["swear", `Swear an oath with ${p.name}`],
                  ["reconcile", `Reconcile ${p.name}'s rivalry · 25 crowns`],
                  ["depart", `Let ${p.name} leave peacefully`],
                ]
              : [];
    for (const [action, label] of choices)
      c.append(
        lockedButton(
          label,
          () => continueCompanion(s, p.id, action),
          continuationLock(s, p.id, action),
        ),
      );
    journeys.append(c);
  }
  panel.append(journeys);
}

function appendWoundPanel(panel) {
  const wounded = livingParty(s).filter((p) => p.wound);
  if (!wounded.length) return;
  const section = fold("Lasting wounds · treatment and recovery", true);
  for (const p of wounded) {
    const w = woundTypes.find((w) => w.id === p.wound.type),
      c = card(`${p.name} · ${w.name}`);
    const text = document.createElement("p");
    text.textContent = `${w.desc} ${p.wound.treated ? "Treated" : "Untreated"} · ${Math.ceil(p.wound.remaining)} recovery hours remaining. Fed rest restores one hour per hour after treatment; untreated recovery is four times slower. Empty supplies prevent recovery.`;
    c.append(text);
    for (const [method, label] of [
      ["bandage", "Bandage · 1 medicine, 2h"],
      ["herbal", "Herbal care · 3 herbs, 3h"],
      ["surgery", "Surgery · 40 crowns, 1 medicine, 6h"],
    ])
      c.append(
        lockedButton(
          `${label}: ${p.name}`,
          () => treatWound(s, p.id, method),
          woundTreatmentLock(s, p.id, method),
        ),
      );
    section.append(c);
  }
  panel.append(section);
}
function appendChronicleCompany(panel) {
  const h = s.chronicle.heraldry,
    section = fold("Company heraldry and earned titles", true),
    preview = document.createElement("canvas");
  preview.width = 96;
  preview.height = 100;
  preview.style.width = "96px";
  preview.setAttribute("aria-label", "Company heraldry preview");
  drawCompanyBanner(preview.getContext("2d"), s, 25, 8, 3, true);
  section.append(preview);
  const select = (label, items, value) => {
    const l = document.createElement("label"),
      el = document.createElement("select");
    l.textContent = label;
    el.setAttribute("aria-label", label);
    for (const item of items) {
      const o = document.createElement("option");
      o.value = item.id;
      o.textContent = item.name;
      el.append(o);
    }
    el.value = value;
    l.append(el);
    section.append(l);
    return el;
  };
  const field = select("Banner field", companyBanners, h.field),
    charge = select("Banner emblem", heraldicCharges, h.charge),
    trim = select("Banner trim", heraldicTrims, h.trim);
  section.append(
    button(
      "Apply heraldry",
      () => customizeHeraldry(s, field.value, charge.value, trim.value),
      !!s.battle || !!s.event,
    ),
  );
  for (const t of earnedTitles) {
    const c = card(t.name + (h.title === t.id ? " · adopted" : ""));
    const p = document.createElement("p");
    p.textContent = t.desc;
    c.append(
      p,
      lockedButton(
        `Adopt ${t.name}`,
        () => adoptTitle(s, t.id),
        titleUnlocked(s, t.id)
          ? null
          : "Earn this title through the listed deeds.",
      ),
    );
    section.append(c);
  }
  if (h.title)
    section.append(button("Remove company title", () => adoptTitle(s, null)));
  panel.append(section);
  const world = fold("Living villages, factions and settlements");
  for (const id of [0, 3, 6]) {
    const p = document.createElement("p");
    p.textContent = `${places[id].name}: ${townConditionLabel(s, id)} · ${townCondition(s, id)}/100. ${townCondition(s, id) < 35 ? "Shortage prices +15%." : townCondition(s, id) >= 80 ? "Prosperity prices −10%." : "Ordinary prices."}`;
    world.append(p);
  }
  for (const f of factions) {
    const p = document.createElement("p");
    p.textContent = factionReaction(s, f.id);
    world.append(p);
  }
  for (const q of Object.values(s.chronicle.settlements)) {
    const p = document.createElement("p");
    p.textContent = `${places[q.site].name}: ${q.arrived ? (q.helped ? "Rebuilt settlement" : "Settlers have arrived") : `Settlers expected in ${Math.max(0, 3 - (s.day - q.clearedDay))} days`}.`;
    world.append(p);
  }
  panel.append(world);
  appendWoundPanel(panel);
}
function appendLivingVillage(panel) {
  const owner = territoryOwner(s, s.location);
  if (owner) {
    const greeting = document.createElement("p");
    greeting.textContent = factionReaction(s, owner);
    panel.append(greeting);
  }
  const c = card(`${townConditionLabel(s)} village · ${townCondition(s)}/100`);
  const p = document.createElement("p");
  p.textContent =
    "Nearby raiders damage prosperity each day. Safe roads, protected trade and donated supplies help villages recover. Struggling markets cost 15% more; thriving markets cost 10% less.";
  c.append(
    p,
    lockedButton(
      "Repair village · 20 crowns, 3 timber, 2h",
      () => aidVillage(s, "repair"),
      townAidLock(s, "repair"),
    ),
    lockedButton(
      "Donate village food · 6 rations, 1h",
      () => aidVillage(s, "food"),
      townAidLock(s, "food"),
    ),
  );
  panel.append(c);
}
function appendChronicleWorld(a) {
  if (s.battle || s.event || s.campOpen) return;
  for (const patrol of s.patrols.filter(
    (p) =>
      !p.cleared &&
      newEnemyFamilies.some((f) => f.id === p.enemyFamily) &&
      Math.hypot(p.x - s.position.x, p.y - s.position.y) <= 125,
  )) {
    const f = newEnemyFamilies.find((f) => f.id === patrol.enemyFamily);
    a.append(
      lockedButton(
        `Scout ${f.name} · 1h`,
        () => scoutEnemy(s, patrol.id),
        scoutEnemyLock(s, patrol.id),
      ),
    );
    if (s.chronicle.scouted[patrol.id]) {
      const p = document.createElement("p");
      p.textContent = f.counter;
      a.append(p);
    }
  }
  for (const [id, q] of Object.entries(s.chronicle.settlements))
    if (q.arrived && q.site === s.location) {
      a.append(
        lockedButton(
          "Trade with settlers · 8 crowns for 6 rations",
          () => helpSettlement(s, id, "trade"),
          settlementLock(s, id, "trade"),
        ),
        lockedButton(
          "Rebuild settlement · 25 crowns, 5 timber, 4h",
          () => helpSettlement(s, id, "rebuild"),
          settlementLock(s, id, "rebuild"),
        ),
      );
    }
}
function appendBattleConditions(a) {
  const d = fold("Battle conditions and enemy intentions");
  d.className = "battle-conditions";
  for (const u of s.battle.units.filter((u) => s.party[u.id].hp > 0)) {
    const p = document.createElement("p");
    p.textContent = `${s.party[u.id].name}: ${battleStatuses(s, u, "party").join(" · ") || "Ready"}`;
    d.append(p);
  }
  for (const e of s.battle.enemies.filter((e) => e.hp > 0)) {
    const p = document.createElement("p");
    p.textContent = `${e.name || e.kind}: ${battleStatuses(s, e).join(" · ") || "Ready"}. ${newEnemyReport(s, e)}`;
    d.append(p);
  }
  a.append(d);
}
function drawBattleSignals() {
  for (const e of s.battle.enemies.filter((e) => e.hp > 0)) {
    const mark = e.smash || e.charge || e.casting;
    if (mark) {
      ctx.save();
      ctx.strokeStyle = e.casting
        ? ["shaman", "cultist"].includes(e.kind)
          ? "#668e59"
          : e.kind === "sorcerer"
            ? "#b65e43"
            : "#9261aa"
        : "#b65e43";
      ctx.lineWidth = 3;
      ctx.strokeRect(109 + mark.x * 62, 4 + mark.y * 60, 51, 49);
      if (e.smash || (e.kind === "sorcerer" && e.casting))
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ])
          if (
            mark.x + dx >= 0 &&
            mark.x + dx < 9 &&
            mark.y + dy >= 0 &&
            mark.y + dy < 7
          )
            ctx.strokeRect(
              109 + (mark.x + dx) * 62,
              4 + (mark.y + dy) * 60,
              51,
              49,
            );
      ctx.restore();
    }
    const statuses = battleStatuses(s, e);
    if (statuses.length)
      drawMapLabel(
        ctx,
        statuses.map((v) => v.slice(0, 3).toUpperCase()).join(" "),
        136 + e.x * 62,
        70 + e.y * 60,
        true,
      );
  }
}
function drawAttackEffects() {
  const now = performance.now();
  attackEffects = attackEffects.filter((e) => now - e.start < 650);
  for (const e of attackEffects) {
    const t = (now - e.start) / 650,
      from = { x: 136 + e.from.x * 62, y: 28 + e.from.y * 60 },
      to = { x: 136 + e.to.x * 62, y: 28 + e.to.y * 60 };
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - t) * 3);
    ctx.lineWidth = 3;
    ctx.strokeStyle =
      e.type === "heal"
        ? "#77a46a"
        : e.type === "spell"
          ? "#af8bbb"
          : "#eed69a";
    ctx.fillStyle = ctx.strokeStyle;
    if (e.type === "arrow") {
      const f = menuSettings.reduceMotion ? 1 : Math.min(1, t * 2),
        x = from.x + (to.x - from.x) * f,
        y = from.y + (to.y - from.y) * f;
      ctx.beginPath();
      ctx.moveTo(x - 9, y + 3);
      ctx.lineTo(x + 9, y - 3);
      ctx.stroke();
      ctx.fillRect(x + 5, y - 5, 4, 4);
    } else if (e.type === "strike") {
      ctx.beginPath();
      ctx.arc(
        to.x,
        to.y,
        18,
        menuSettings.reduceMotion ? 0 : t * 4,
        menuSettings.reduceMotion ? 2 : t * 4 + 2,
      );
      ctx.stroke();
    } else {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          r = menuSettings.reduceMotion ? 15 : 8 + t * 24;
        ctx.fillRect(
          to.x + Math.cos(a) * r - 2,
          to.y + Math.sin(a) * r - 2,
          4,
          4,
        );
      }
      if (e.type === "heal") {
        ctx.fillRect(to.x - 2, to.y - 9, 4, 18);
        ctx.fillRect(to.x - 9, to.y - 2, 18, 4);
      }
    }
    ctx.restore();
  }
}

function appendArcanaPanel(panel) {
  const classes = fold("Fantasy classes · combat roles and professions");
  for (const f of fantasyClassInfo) {
    const p = document.createElement("p");
    p.textContent = `${f.id}: ${f.desc} Choose these classes when founding a company or recruit local specialists: Paladin in Greyhaven, Rogue in Saltbridge, Druid in Emberfall. Their profession remains a separate choice.`;
    classes.append(p);
  }
  panel.append(classes);
  const section = fold("Spell preparation and grimoires", s.campOpen);
  const intro = document.createElement("p");
  intro.textContent =
    "Prepare spells at camp or Emberfall. Changing the list takes one hour and never replenishes slots. Exploration and combat share spell slots. Older companies retain their existing repertoire until their first preparation.";
  section.append(intro);
  for (const p of livingParty(s).filter(isCaster)) {
    const c = card(
        `${p.name} · ${p.role} · ${preparationCapacity(p)} prepared spells maximum`,
      ),
      choices = [];
    for (const spell of spellCatalogFor(p)) {
      const row = document.createElement("label"),
        check = document.createElement("input");
      check.type = "checkbox";
      check.value = spell.id;
      check.checked = (
        p.preparedSpells ||
        spellCatalogFor(p)
          .slice(0, preparationCapacity(p))
          .map((v) => v.id)
      ).includes(spell.id);
      check.setAttribute("aria-label", `Prepare ${spell.name}: ${p.name}`);
      row.className = "spell-choice";
      row.append(
        check,
        document.createTextNode(
          ` ${spell.name} · level ${spell.level}${spell.kind === "explore" ? " · exploration" : ""}${spell.desc ? " — " + spell.desc : ""}`,
        ),
      );
      c.append(row);
      choices.push(check);
    }
    const ids = () => choices.filter((v) => v.checked).map((v) => v.value),
      apply = button(`Prepare spells: ${p.name} · 1h`, () =>
        prepareSpells(s, p.id, ids()),
      ),
      hint = document.createElement("small");
    hint.className = "hint";
    const validate = () => {
      const reason = preparationLock(s, p.id, ids());
      apply.disabled = !!reason;
      apply.title = reason || "";
      hint.textContent =
        reason ||
        `${ids().length}/${preparationCapacity(p)} spells selected; one hour, slots unchanged.`;
    };
    for (const check of choices) check.addEventListener("change", validate);
    validate();
    c.append(apply, hint);
    for (const t of grimoires.filter(
      (t) => spellBook.find((v) => v.id === t.spell).role === p.role,
    )) {
      const spell = spellBook.find((v) => v.id === t.spell),
        line = document.createElement("p");
      line.textContent = `${t.name}: ${spell.name} · ${p.knownSpells?.includes(spell.id) ? "learned" : `${s.arcana.grimoires[t.id] || 0} copies carried`}. Found at ${places[t.site].name} or purchased at Emberfall.`;
      c.append(
        line,
        lockedButton(
          `Study ${t.name}: ${p.name} · 2 knowledge, 4h`,
          () => learnGrimoire(s, p.id, t.id),
          learnGrimoireLock(s, p.id, t.id),
        ),
      );
    }
    section.append(c);
  }
  panel.append(section);
}
function appendAcademy(panel) {
  const d = fold("Emberfall academy · grimoires, reagents and tuition", true);
  const intro = document.createElement("p");
  intro.textContent =
    "A flourishing city supports a full magical academy. Remote villages offer ordinary supplies; camp meditation requires food, herbs and time. The existing Emberfall recovery service restores slots for fifteen crowns per depleted caster and two hours.";
  d.append(intro);
  for (const t of grimoires)
    d.append(
      lockedButton(
        `Buy ${t.name} · ${t.price} crowns`,
        () => academyService(s, "tome", t.id),
        academyLock(s, "tome", t.id),
      ),
    );
  d.append(
    lockedButton(
      "Academy reagents · 24 crowns, 1h",
      () => academyService(s, "reagents"),
      academyLock(s, "reagents"),
    ),
  );
  for (const p of livingParty(s).filter(isCaster))
    d.append(
      lockedButton(
        `Academy tuition: ${p.name} · 35 crowns, 3h`,
        () => academyService(s, "tuition", p.id),
        academyLock(s, "tuition", p.id),
      ),
    );
  panel.append(d);
  appendArcanaPanel(panel);
}
function appendArcanaWorld(a) {
  if (s.event?.kind === "arcane-passage") {
    $("map-label").textContent = s.event.title + " · hidden passage";
    const room = hiddenPassages.find((v) => v.site === s.location),
      q = s.arcana.passages?.[s.location],
      c = card(room.name);
    const text = document.createElement("p");
    text.textContent =
      room.desc +
      (q?.searched
        ? " The chest is open. Uncollected contents remain when you leave."
        : "Search the chamber to open its chest.");
    c.append(text);
    if (!q?.searched)
      c.append(
        lockedButton(
          "Search hidden chamber · 2h",
          () => passageAction(s, "search"),
          passageLock(s, "search"),
        ),
      );
    for (const resource of Object.keys(room.loot))
      if (q?.loot?.[resource] > 0)
        c.append(
          button(`Take ${q.loot[resource]} ${resource}`, () =>
            passageAction(s, "take", resource),
          ),
        );
    c.append(button("Leave hidden passage", () => passageAction(s, "leave")));
    a.append(c);
    return;
  }
  if (
    !s.event &&
    !s.battle &&
    !s.campOpen &&
    hiddenPassages.some((v) => v.site === s.location) &&
    s.arcana.exploration[`reveal-${s.location}`]
  )
    a.append(
      lockedButton(
        "Enter unveiled passage",
        () => passageAction(s, "enter"),
        passageLock(s, "enter"),
      ),
    );

  if (s.battle || s.campOpen) return;
  const d = fold("Exploration magic · shared spell slots");
  let count = 0;
  for (const p of livingParty(s).filter(isCaster))
    for (const spell of spellsFor(p).filter((v) => v.kind === "explore")) {
      d.append(
        lockedButton(
          `${spell.name}: ${p.name} · level ${spell.level}, 1h`,
          () => castExplorationMagic(s, p.id, spell.id),
          explorationMagicLock(s, p.id, spell.id),
        ),
      );
      count++;
    }
  if (count) a.append(d);
  for (const t of grimoires.filter(
    (t) => t.site === s.location && !s.arcana.recovered[t.id],
  ))
    a.append(
      lockedButton(
        `Search archive: ${t.name} · 2h`,
        () => recoverGrimoire(s, t.id),
        recoverGrimoireLock(s, t.id),
      ),
    );
  if (
    s.event?.kind === "site" &&
    s.event.site === 10 &&
    s.event.stage === "lock"
  )
    for (const p of livingParty(s).filter((p) => p.role === "Rogue"))
      a.append(
        lockedButton(
          `Read lock pin: ${p.name}`,
          () => fantasyAction(s, p.id, "read-lock"),
          fantasyActionLock(s, p.id, "read-lock"),
        ),
      );
}
function appendFantasyCombat(a) {
  const p = s.party[selected];
  if (p.role === "Druid") {
    const u = s.battle.units.find((v) => v.id === selected),
      action = u.wildshape ? "revert" : "wolf-form";
    a.append(
      lockedButton(
        u.wildshape ? "Leave wolf form · action" : "Wolf form · level 1 slot",
        () => fantasyAction(s, selected, action),
        fantasyActionLock(s, selected, action),
      ),
    );
  }
  if (p.role === "Paladin")
    a.append(
      lockedButton(
        "Protective aura · level 1 slot",
        () => fantasyAction(s, selected, "aura"),
        fantasyActionLock(s, selected, "aura"),
      ),
    );
}

function appendStandardPanel(panel) {
  const c = card("Company standard · designated flag bearer"),
    p = document.createElement("p");
  p.textContent =
    "The flag is packed away until its bearer is appointed. Unlock it with five renown, four knowledge and forty crowns. A conscious bearer grants one opening valor.";
  c.append(p);
  if (!s.fieldwork.standardUnlocked)
    c.append(
      lockedButton(
        "Unlock company standard",
        () => unlockStandard(s),
        standardLock(s),
      ),
    );
  else {
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Designated flag bearer");
    select.add(new Option("Keep the flag packed away", ""));
    for (const p of livingParty(s))
      select.add(new Option(`${p.name} · ${p.role}`, p.id));
    select.value = s.fieldwork.bannerBearer ?? "";
    select.disabled = !!s.battle || !!s.event;
    select.onchange = () => {
      assignFlagBearer(s, select.value === "" ? null : Number(select.value));
      render();
    };
    c.append(select);
  }
  panel.append(c);
}
function appendCampBuildPalette(panel) {
  const c = card("Camp layout & expansion"),
    p = document.createElement("p");
  p.textContent = `${livingParty(s).length}/${campCapacity(s)} sleeping spaces · ${campCrowding(s) ? `${campCrowding(s)} companions are crowded: less healing, lower morale and resolve.` : "Enough space for the company."} Choose a blueprint, then drag it onto the camp. Drag built furniture to move it. Expansion increases the cleared area and sleeping capacity.`;
  c.append(
    p,
    lockedButton(
      `Expand camp · capacity ${campCapacity(s) + 2}`,
      () => expandCamp(s),
      campExpansionLock(s),
    ),
  );
  for (const f of campFurniture)
    c.append(
      button(
        `${s.campFurniture[f.id] === undefined ? "Build" : "Arrange"} ${f.name}`,
        () => {
          pendingFurniture = f.id;
          campDrag = null;
          drawerOpen = false;
          note(
            s,
            `Drag ${f.name} onto an empty part of the camp. ${s.campFurniture[f.id] === undefined ? `${f.gold} crowns and ${f.wood} timber; two hours to build.` : "Relocation is free."}`,
          );
        },
        s.campFurniture[f.id] === undefined &&
          (s.gold < f.gold || s.inventory.wood < f.wood),
      ),
    );
  panel.append(c);
}
function organizeCampPanel(panel) {
  const groups = new Map(
    ["Overview", "Build", "Jobs", "Care", "Magic", "Companions", "Wagon"].map(
      (k) => [k, document.createElement("section")],
    ),
  );
  for (const el of [...panel.children]) {
    const title = el.querySelector("h3,summary")?.textContent || el.textContent;
    let group = "Overview";
    if (
      /Camp layout|furnish|Cookpot|Portable forge|Watch post|Medicine tent|Sleeping tent|campUpgrade/i.test(
        title,
      ) ||
      el.dataset.campUpgrade
    )
      group = "Build";
    else if (/Camp duties|maintenance|repairs/i.test(title)) group = "Jobs";
    else if (/lasting wounds|prisoner|captiv/i.test(title)) group = "Care";
    else if (
      /magic|Spell preparation|Fantasy classes|Meditate|spell slots/i.test(
        title,
      )
    )
      group = "Magic";
    else if (/goal|journey|companion continuation|Supper|standard/i.test(title))
      group = "Companions";
    else if (/wagon|Travel duties|travel jobs/i.test(title)) group = "Wagon";
    groups.get(group).append(el);
  }
  panel.replaceChildren();
  const nav = document.createElement("nav");
  nav.className = "category-nav";
  nav.setAttribute("aria-label", "Camp categories");
  for (const name of groups.keys())
    nav.append(
      button(
        name,
        () => {
          campCategory = name;
          render();
        },
        false,
        name === campCategory,
      ),
    );
  for (const control of nav.querySelectorAll("button"))
    control.setAttribute(
      "aria-pressed",
      String(control.textContent === campCategory),
    );
  panel.append(nav);
  const opportunity = s.fieldwork.campOpportunity;
  if (
    opportunity?.day === s.day &&
    s.party[opportunity.id] &&
    !s.party[opportunity.id].dead
  ) {
    const companion = s.party[opportunity.id],
      prompt = card(`${companion.name} asks for a quiet moment`);
    const p = document.createElement("p");
    p.textContent =
      "A personal conversation is available by the campfire tonight.";
    prompt.append(
      p,
      button(`Hear ${companion.name} by the fire`, () => {
        campCategory = "Companions";
        render();
      }),
    );
    groups.get("Overview").prepend(prompt);
  }
  for (const [name, section] of groups) {
    section.hidden = name !== campCategory;
    section.dataset.campCategory = name;
    panel.append(section);
  }
  if (campCategory === "Companions" && !s.fieldwork.campOpportunity) {
    const p = document.createElement("p");
    p.textContent =
      "No companion is asking for a personal conversation tonight. These moments occur occasionally at camp; active stories remain in the company journal.";
    groups.get("Companions").prepend(p);
  }
}
function organizeVillagePanel(panel) {
  const venues = [],
    services = [],
    affairs = [];
  for (const el of [...panel.children]) {
    if (el.classList.contains("venue-card") || el.querySelector(".venue-art"))
      venues.push(el);
    else {
      const title =
        el.querySelector("h3,summary")?.textContent || el.textContent;
      if (
        el.dataset.villageService ||
        /wagon|magic|academy|Spell preparation|Fantasy classes|wound|Regional services|temple/i.test(
          title,
        )
      )
        services.push(el);
      else affairs.push(el);
    }
  }
  panel.replaceChildren();
  const p = document.createElement("p");
  p.className = "village-intro";
  p.textContent =
    "Choose a village place. Local services and affairs are grouped below.";
  const placesGrid = document.createElement("div");
  placesGrid.className = "village-places";
  placesGrid.append(...venues);
  panel.append(p, placesGrid);
  if (services.length) {
    const d = fold("Local services · care, wagons and magic");
    d.append(...services);
    panel.append(d);
  }
  if (affairs.length) {
    const d = fold("Village affairs · allegiance, aid and stories");
    d.append(...affairs);
    panel.append(d);
  }
}
function appendWagonManifest(row) {
  const d = fold(
      `Wagon hold · ${cargoLoad(s)}/${companyCargoCapacity(s)} cargo spaces`,
    ),
    grid = document.createElement("div");
  grid.className = "wagon-hold";
  grid.setAttribute("aria-label", "Cargo fitted inside the company wagon");
  for (const cell of wagonManifest(s)) {
    const tile = document.createElement("span");
    tile.className = cell ? "cargo-cell occupied" : "cargo-cell";
    tile.title = cell?.name || "Empty cargo space";
    tile.textContent = cell
      ? { grain: "W", salt: "S", iron: "I", cloth: "C", herbs: "H" }[cell.id] ||
        cell.id.slice(0, 1).toUpperCase()
      : "·";
    grid.append(tile);
  }
  const p = document.createElement("p");
  p.textContent =
    "Each traded unit occupies one cargo space. Cargo racks add room; provisions and equipped gear stay with the company.";
  d.append(grid, p);
  row.append(d);
}
function appendShelterActions(a) {
  if (s.battle || s.event || s.campOpen) return;
  const lodge = safeRestSites.find((v) => v.site === s.location);
  if (!lodge) return;
  const c = card(lodge.name);
  const p = document.createElement("p");
  p.textContent = `Secure beds and meals for a full day · ${safeRestCost(s)} crowns including wages and debt. Recover health and fatigue without woodland interruptions. Lasting wounds recover gradually; surgery is still a village service.`;
  c.append(
    p,
    lockedButton(
      "Rest at secure lodge",
      () => {
        beginAfterAction(s, "event", `Rest at ${lodge.name}`);
        restAtShelter(s);
      },
      safeRestLock(s),
    ),
  );
  a.append(c);
}
function interactDungeonTile(x, y) {
  const e = s.event;
  if (e?.kind !== "dungeon" || x < 0 || x > 8 || y < 0 || y > 6) return false;
  const layout = dungeonLayout(e.site),
    distance = Math.abs(x - e.x) + Math.abs(y - e.y);
  if (x === 4 && y === 3 && distance <= 1) {
    const q = dungeonPuzzle(s);
    dungeonDoorOpen = true;
    dungeonPanelOpen = true;
    if (q.door) return realmDungeonAction(s, "side-cache");
    if (!q.spotted && companyScout(s)) realmDungeonAction(s, "scout-room");
    e.message =
      "The sealed side room is within reach. Choose its lock, rune seal or magical opening below.";
    return true;
  }
  if (distance === 1 && !dungeonWalls(s).some(([a, b]) => a === x && b === y))
    return dungeonAction(s, "move", x, y);
  if (distance <= 1 && x === layout.secret[0] && y === layout.secret[1])
    return dungeonAction(s, "inspect");
  if (distance <= 1 && x === layout.trap[0] && y === layout.trap[1])
    return dungeonAction(s, "disarm");
  if (distance <= 1 && x === layout.collapse[0] && y === layout.collapse[1])
    return dungeonAction(s, "shore");
  if (x === e.x && y === e.y) {
    if (x === 8 && y === 5) return dungeonAction(s, "vault");
    if ([1, 5].includes(x) && y === 1 && places[e.site].type === "mine")
      return dungeonAction(s, "mine");
    return dungeonAction(s, "inspect");
  }
  note(
    s,
    "Choose an adjacent floor tile; nearby features can be inspected directly.",
  );
  return false;
}
function organizeCombatControls(a) {
  const turn = document.createElement("div"),
    movement = document.createElement("div");
  turn.className = "combat-control-group";
  movement.className = "combat-control-group";
  turn.setAttribute("aria-label", "Turn and defense controls");
  movement.setAttribute("aria-label", "Movement and positioning controls");
  for (const b of [...a.children].filter((el) => el.tagName === "BUTTON")) {
    const text = b.textContent;
    if (/^End round|^Finish ambush|^Brace|^Retreat/.test(text)) {
      b.title = /^Finish ambush/.test(text)
        ? "Complete the free opening turn. The company acts once more before enemies respond."
        : /^End/.test(text)
          ? "Finish the company turn. Unused companion actions are forfeited."
          : "Brace protects against the next enemy turn; retreat ends the fight and loses crowns.";
      turn.append(b);
    } else if (/^Push adjacent|^Disengage/.test(text)) {
      b.title = text.startsWith("Disengage")
        ? "Spend your action to leave melee safely, then move."
        : "Push an adjacent enemy into another open tile.";
      movement.append(b);
    }
  }
  if (turn.children.length) a.prepend(turn);
  if (movement.children.length) a.insertBefore(movement, turn.nextSibling);
  for (const b of a.querySelectorAll("button"))
    if (/valor/.test(b.textContent) && !b.title)
      b.title =
        "A class action spends valor and the selected companion’s action. Select an eligible enemy tile.";
}
function renderAfterAction() {
  let dialog = document.getElementById("after-action-report");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "after-action-report";
    dialog.className = "after-action-report";
    dialog.setAttribute("aria-label", "After-action report");
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dismissAfterActionReport(s);
      dialog.close();
      render();
    });
    document.body.append(dialog);
  }
  if (!gameActive || !s.fieldwork.report) {
    if (dialog.open) dialog.close();
    return;
  }
  const report = s.fieldwork.report;
  dialog.replaceChildren();
  const title = document.createElement("h2"),
    sub = document.createElement("p");
  title.textContent = "After-action report";
  sub.textContent = `${report.outcome || "Encounter completed"} · ${report.title} · Day ${report.day}`;
  dialog.append(title, sub);
  const content = document.createElement("div");
  content.className = "report-details";
  for (const [label, lines, empty] of [
    [
      "Company condition",
      report.conditions,
      "No new injuries or health changes.",
    ],
    ["Loot & gains", report.loot, "No loot acquired."],
    [
      "Supplies & equipment",
      report.costs,
      "No recorded costs or equipment wear.",
    ],
  ]) {
    const section = document.createElement("section"),
      heading = document.createElement("h3");
    heading.textContent = label;
    section.append(heading);
    for (const text of lines.length ? lines : [empty]) {
      const p = document.createElement("p");
      p.textContent = text;
      section.append(p);
    }
    content.append(section);
  }
  dialog.append(content);
  dialog.append(
    button("Continue adventure", () => {
      dismissAfterActionReport(s);
      dialog.close();
    }),
  );
  if (!dialog.open) {
    heldKeys.clear();
    stopMovement(s);
    dialog.showModal();
  }
}
function canvasPoint(event) {
  const r = canvas.getBoundingClientRect();
  return {
    x: view.x + (event.clientX - r.left) / view.scale,
    y: view.y + (event.clientY - r.top) / view.scale,
  };
}
canvas.addEventListener("pointerdown", (event) => {
  if (!s.campOpen || drawerOpen || s.fieldwork.report) return;
  const point = canvasPoint(event),
    id =
      pendingFurniture ||
      Object.keys(s.campFurniture).find((id) => {
        const p = campFurniturePoint(s, id);
        return (
          point.x >= p.x &&
          point.x <= p.x + 34 &&
          point.y >= p.y &&
          point.y <= p.y + 26
        );
      });
  if (!id) return;
  event.preventDefault();
  campDrag = { id, x: point.x - 17, y: point.y - 13 };
  canvas.setPointerCapture(event.pointerId);
  draw();
});
canvas.addEventListener("pointermove", (event) => {
  if (!campDrag) return;
  const point = canvasPoint(event);
  campDrag.x = point.x - 17;
  campDrag.y = point.y - 13;
  draw();
});
canvas.addEventListener("pointerup", (event) => {
  if (!campDrag) return;
  const drag = campDrag;
  campDrag = null;
  const reason = furniturePlacementLock(
    s,
    drag.id,
    Math.round(drag.x / 5) * 5,
    Math.round(drag.y / 5) * 5,
  );
  if (reason) note(s, reason);
  else if (placeCampFurniture(s, drag.id, drag.x, drag.y))
    pendingFurniture = null;
  if (canvas.hasPointerCapture(event.pointerId))
    canvas.releasePointerCapture(event.pointerId);
  render();
});
canvas.addEventListener("pointercancel", () => {
  campDrag = null;
  draw();
});
function drawCampLayoutOverlay() {
  if (!pendingFurniture && !campDrag) return;
  const b = campBounds(s);
  ctx.save();
  ctx.strokeStyle = "#e8d495";
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 2;
  ctx.strokeRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
  ctx.setLineDash([]);
  if (campDrag) {
    const valid = !furniturePlacementLock(
      s,
      campDrag.id,
      Math.round(campDrag.x / 5) * 5,
      Math.round(campDrag.y / 5) * 5,
    );
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = valid ? "#758f59" : "#b1654d";
    ctx.fillRect(campDrag.x, campDrag.y, 34, 26);
  }
  ctx.restore();
}
function drawDungeonHighlights() {
  const e = s.event;
  if (e?.kind !== "dungeon") return;
  ctx.save();
  ctx.strokeStyle = "#d9cc99";
  ctx.lineWidth = 2;
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const x = e.x + dx,
      y = e.y + dy;
    if (
      x >= 0 &&
      x < 9 &&
      y >= 0 &&
      y < 7 &&
      !dungeonWalls(s).some(([a, b]) => a === x && b === y)
    )
      ctx.strokeRect(107 + x * 62, 2 + y * 60, 54, 52);
  }
  ctx.restore();
}
