import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  enterSite,
  siteAction,
  restore,
  customizeAvatar,
  avatarAppearance,
  avatarSkins,
} from "../src/game.js";
const arrive = (s, i) => {
  s.location = i;
  s.position = { x: places[i].x, y: places[i].y };
};
test("avatar appearance changes independently of combat statistics and survives reload", () => {
  const s = fresh(),
    damage = s.party[0].damage;
  assert.equal(
    customizeAvatar(s, 0, {
      sex: "male",
      skin: avatarSkins[2],
      hair: "#a25e3b",
      hairStyle: "braid",
    }),
    true,
  );
  assert.equal(s.party[0].damage, damage);
  assert.equal(restore(s).party[0].sex, "male");
  assert.equal(restore(s).party[0].hairStyle, "braid");
  assert.equal(avatarAppearance({ skin: "invalid" }).skin, avatarSkins[0]);
  s.battle = {};
  assert.equal(customizeAvatar(s, 0, {}), false);
});
test("stash search and lock picking gate rewards, permit feedback and survive saved pins", () => {
  const s = fresh();
  arrive(s, 10);
  s.contract = { target: 1, reward: 65 };
  assert.equal(enterSite(s), true);
  siteAction(s, "search", 0);
  assert.equal(s.event.stage, "search");
  assert.equal(s.gold, 120);
  siteAction(s, "search", 7);
  siteAction(s, "pick", 0);
  assert.match(s.event.message, /higher/);
  siteAction(s, "pick", 2);
  const copy = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(copy.event.pin, 1);
  siteAction(copy, "pick", 4);
  siteAction(copy, "pick", 1);
  assert.equal(copy.event.stage, "opened");
  assert.equal(copy.gold, 150);
  assert.equal(copy.knowledge, 1);
  assert.equal(copy.contract.target, 1);
  siteAction(copy, "leave");
  enterSite(copy);
  assert.equal(copy.event.stage, "opened");
  assert.equal(siteAction(copy, "pick", 1), false);
  assert.equal(copy.gold, 150);
});
test("three lock mistakes cost an hour and reset the pins without granting loot", () => {
  const s = fresh();
  arrive(s, 10);
  enterSite(s);
  siteAction(s, "search", 7);
  siteAction(s, "pick", 2);
  for (let i = 0; i < 3; i++) siteAction(s, "pick", 0);
  assert.equal(s.event.pin, 0);
  assert.equal(s.timeOfDay, 9);
  assert.equal(s.gold, 120);
});
test("mine rooms and cart rewards persist while surveys cannot pay twice", () => {
  const s = fresh();
  arrive(s, 4);
  enterSite(s);
  siteAction(s, "gallery");
  assert.equal(siteAction(s, "cart"), true);
  assert.equal(siteAction(s, "cart"), false);
  siteAction(s, "vein");
  assert.equal(siteAction(s, "mine"), true);
  assert.equal(s.inventory.ore, 8);
  const c = restore(s);
  siteAction(c, "gallery");
  assert.equal(siteAction(c, "cart"), false);
  siteAction(c, "vein");
  assert.equal(siteAction(c, "mine"), false);
  assert.equal(c.inventory.ore, 8);
  siteAction(c, "leave");
  assert.equal(c.event, null);
});
test("sites require actual arrival and reject active encounters and camp", () => {
  const s = fresh();
  assert.equal(enterSite(s), false);
  arrive(s, 4);
  s.campOpen = true;
  assert.equal(enterSite(s), false);
  s.campOpen = false;
  assert.equal(enterSite(s), true);
  assert.equal(enterSite(s), false);
  assert.equal(siteAction(s, "bogus"), false);
});
