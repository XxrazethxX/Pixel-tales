import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  trailEncounters,
  trailRegion,
  scoutLock,
  beginTrailEncounter,
  scoutSurroundings,
  trailEncounterOptions,
  trailChoiceLock,
  resolveEvent,
  restore,
  advanceClock,
  advanceMovement,
  moveTo,
  DAY_SECONDS,
} from "../src/game.js";
const outside = () => {
  const s = fresh();
  s.location = -1;
  s.position = { x: 600, y: 480 };
  return s;
};
const encounter = (id) => {
  const s = outside();
  beginTrailEncounter(s);
  const t = trailEncounters.find((e) => e.id === id);
  Object.assign(s.event, { templateId: t.id, title: t.title, text: t.text });
  return s;
};
test("terrain-based selection is reproducible, region-specific, and avoids immediate repeats", () => {
  for (const [position, biome] of [
    [{ x: 965, y: 220 }, "forest"],
    [{ x: 120, y: 100 }, "highlands"],
    [{ x: 475 + Math.sin(350 / 65) * 38, y: 350 }, "shallows"],
    [{ x: 600, y: 480 }, "grassland"],
  ]) {
    const a = outside(),
      b = outside();
    a.position = b.position = position;
    assert.equal(beginTrailEncounter(a), true);
    assert.equal(beginTrailEncounter(b), true);
    assert.equal(a.event.templateId, b.event.templateId);
    assert.equal(
      trailEncounters.find((e) => e.id === a.event.templateId).biome,
      biome,
    );
    const previous = a.event.templateId;
    resolveEvent(a, "leave");
    a.day++;
    beginTrailEncounter(a);
    assert.notEqual(a.event.templateId, previous);
  }
});
test("scouting spends an hour and blocks repeat regional rewards until the next day", () => {
  const s = outside(),
    hour = s.timeOfDay;
  assert.equal(scoutSurroundings(s), true);
  assert.equal(s.timeOfDay, hour + 1);
  const event = s.event;
  resolveEvent(s, "leave");
  assert.equal(scoutSurroundings(s), false);
  assert.equal(s.timeOfDay, hour + 1);
  assert.equal(s.encounterJournal[0].id, event.id);
  s.position = { x: 965, y: 220 };
  assert.equal(trailRegion(s), "Ember frontier");
  assert.equal(scoutSurroundings(s), true);
  resolveEvent(s, "leave");
  s.day++;
  assert.equal(scoutLock(s), null);
});
test("villages, camp, battle, and existing encounters prevent scouting without time or resource changes", () => {
  for (const mode of ["town", "camp", "battle", "event", "lost"]) {
    const s = outside();
    if (mode === "town") s.location = 0;
    if (mode === "camp") s.campOpen = true;
    if (mode === "battle") s.battle = {};
    if (mode === "event") s.event = {};
    if (mode === "lost") s.party.forEach((p) => (p.dead = true));
    const before = JSON.stringify(s);
    assert.equal(scoutSurroundings(s), false);
    assert.equal(JSON.stringify(s), before);
  }
});
test("active exploration mixes trail events with traditional road encounters, pauses movement, and cannot double trigger", () => {
  const s = outside();
  s.food = 100;
  s.gold = 500;
  s.day = 11;
  s.timeOfDay = 23.9;
  moveTo(s, 800, 480);
  advanceClock(s, DAY_SECONDS / 24);
  assert.equal(s.day, 12);
  assert.equal(s.event.kind, "trail");
  assert.equal(s.destination, null);
  const before = JSON.stringify(s);
  assert.equal(advanceClock(s, 10), false);
  assert.equal(advanceMovement(s, 10).changed, false);
  assert.equal(JSON.stringify(s), before);
  resolveEvent(s, "leave");
  advanceClock(s, 10);
  assert.equal(s.event, null);
});
for (const template of trailEncounters)
  for (const choice of template.choices) {
    test(`${template.id}/${choice.id} charges exact costs, applies rewards and practice, and resolves once`, () => {
      const s = encounter(template.id);
      s.gold = 100;
      s.food = 50;
      s.inventory = { ore: 50, wood: 50, herbs: 50, medicine: 50, pelts: 50 };
      s.cargo = { grain: 4, cloth: 4, salt: 4, iron: 4 };
      s.reputation = { guild: 10, wardens: 10, freefolk: 10 };
      s.party.forEach((p) => (p.professionXP = 15));
      s.party[0].traits = ["mercenary"];
      assert.equal(trailChoiceLock(s, choice), null);
      const before = structuredClone(s),
        worker = s.party.find((p) => p.profession === choice.profession);
      assert.equal(resolveEvent(s, choice.id), true);
      assert.equal(
        s.gold,
        before.gold - (choice.cost?.gold || 0) + (choice.reward?.gold || 0),
      );
      assert.equal(
        s.food,
        before.food - (choice.cost?.food || 0) + (choice.reward?.food || 0),
      );
      assert.equal(
        s.knowledge,
        before.knowledge + (choice.reward?.knowledge || 0),
      );
      assert.equal(s.renown, before.renown + (choice.reward?.renown || 0));
      for (const key of Object.keys(s.inventory))
        assert.equal(
          s.inventory[key],
          before.inventory[key] -
            (choice.cost?.inventory?.[key] || 0) +
            (choice.reward?.inventory?.[key] || 0),
        );
      for (const key of Object.keys(s.cargo))
        assert.equal(
          s.cargo[key],
          before.cargo[key] -
            (choice.cost?.cargo?.[key] || 0) +
            (choice.reward?.cargo?.[key] || 0),
        );
      for (const key of Object.keys(s.reputation))
        assert.equal(
          s.reputation[key],
          before.reputation[key] + (choice.reward?.reputation?.[key] || 0),
        );
      assert.equal(s.timeOfDay, before.timeOfDay + (choice.hours || 0));
      if (worker) assert.equal(worker.professionXP, 16);
      assert.equal(
        s.party[2].resolve,
        before.party[2].resolve + (choice.compassionate || 0),
      );
      assert.equal(s.event, null);
      assert.equal(s.encounterJournal[0].choiceId, choice.id);
      assert.equal(resolveEvent(s, choice.id), false);
    });
  }
test("profession rank, conscious workers, trait and reputation gates reject choices atomically", () => {
  for (const [id, choiceId, change] of [
    ["marker", "miner", (s) => (s.party[1].professionXP = 0)],
    ["tracker", "herbalist", (s) => (s.party[2].hp = 0)],
    ["snares", "freefolk", (s) => (s.reputation.freefolk = 4)],
    ["levy", "mercenary", () => {}],
  ]) {
    const s = encounter(id);
    change(s);
    const before = JSON.stringify(s);
    assert.equal(resolveEvent(s, choiceId), false);
    assert.equal(JSON.stringify(s), before);
  }
});
test("cost and cargo capacity validation never partially charges unavailable choices", () => {
  for (const [id, choiceId, change] of [
    ["tracker", "medicine", (s) => (s.inventory.medicine = 0)],
    ["orecart", "buy", (s) => (s.gold = 7)],
    ["wagon", "trade", (s) => (s.cargo.cloth = 1)],
    ["wagon", "smith", (s) => (s.inventory.ore = 0)],
    ["wagon", "rob", (s) => (s.cargo.grain = 20)],
    ["snares", "herbalist", (s) => (s.food = 1)],
  ]) {
    const s = encounter(id);
    change(s);
    const before = JSON.stringify(s);
    assert.equal(resolveEvent(s, choiceId), false);
    assert.equal(JSON.stringify(s), before);
  }
  const s = encounter("wagon");
  const before = JSON.stringify(s);
  assert.equal(resolveEvent(s, "invented"), false);
  assert.equal(JSON.stringify(s), before);
});
test("pending events, regional cooldowns, and recent outcomes survive reload without duplicate payouts", () => {
  const s = encounter("orecart");
  s.gold = 100;
  const loaded = restore(s);
  assert.equal(loaded.event.templateId, "orecart");
  assert.equal(resolveEvent(loaded, "buy"), true);
  const replay = structuredClone(loaded);
  replay.event = s.event;
  const saved = restore(replay);
  assert.equal(saved.event, null);
  assert.equal(saved.gold, 92);
  assert.equal(saved.encounterJournal.length, 1);
  assert.equal(scoutLock(saved).includes("already"), true);
});
test("legacy and malformed saves gain safe trail defaults, and event text is rebuilt from definitions", () => {
  const s = outside();
  delete s.encounterSerial;
  delete s.encounterJournal;
  delete s.trailLedger;
  const legacy = restore(s);
  assert.equal(legacy.encounterSerial, 0);
  assert.deepEqual(legacy.encounterJournal, []);
  assert.deepEqual(legacy.trailLedger, {});
  s.encounterSerial = -99;
  s.trailLedger = { "Salt coast": 999, "not a region": 1 };
  s.encounterJournal = [{}, null, { id: 1 }];
  s.event = { kind: "trail", templateId: "invented" };
  const safe = restore(s);
  assert.equal(safe.event, null);
  assert.deepEqual(safe.encounterJournal, []);
  assert.deepEqual(safe.trailLedger, {});
  const active = encounter("wagon");
  active.event.title = "<script>bad</script>";
  const repaired = restore(active);
  assert.equal(repaired.event.title, "A stranded cloth wagon");
});
test("the journal stays bounded while repeated days still offer fresh encounters", () => {
  const s = outside();
  for (let i = 0; i < 20; i++) {
    s.day = i + 1;
    assert.equal(beginTrailEncounter(s), true);
    assert.equal(resolveEvent(s, "leave"), true);
  }
  assert.equal(s.encounterJournal.length, 12);
  assert.equal(restore(s).encounterJournal.length, 12);
});

test("traditional courier, storm and camp events remain in the natural exploration cycle", () => {
  for (const [day, title] of [
    [6, "An abandoned camp"],
    [18, "Storm over the borderlands"],
    [30, "Strangers in the wilderness"],
  ]) {
    const s = outside();
    s.day = day - 1;
    s.timeOfDay = 23.9;
    s.food = 100;
    s.gold = 500;
    advanceClock(s, DAY_SECONDS / 24);
    assert.equal(s.day, day);
    assert.equal(s.event.title, title);
  }
});
