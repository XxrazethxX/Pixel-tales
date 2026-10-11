import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  createCompany,
  companyOrigins,
  companyBanners,
  isCompanySave,
  restore,
  dailyWages,
  campCost,
} from "../src/game.js";
const options = () => ({
  name: "The Silver Foxes",
  banner: "pine",
  origin: "wanderers",
  founders: fresh().party.map((p) => ({
    name: p.name,
    role: p.role,
    profession: p.profession,
    trait: p.traits[0],
  })),
});
test("custom company retains four valid founders and a functional fresh world", () => {
  const o = options();
  o.founders[0] = {
    name: "Rowan",
    role: "Archer",
    profession: "Herbalist",
    trait: "tireless",
  };
  const s = createCompany(o);
  assert.equal(s.companyName, o.name);
  assert.equal(s.party[0].name, "Rowan");
  assert.equal(s.party[0].max, 22);
  assert.equal(s.party[0].damage, 6);
  assert.equal(s.party[0].profession, "Herbalist");
  assert.deepEqual(s.party[0].traits, ["tireless"]);
  assert.equal(s.party[0].coat, companyBanners[1].color);
  assert.equal(s.location, 0);
  assert.equal(s.party.length, 4);
  assert.equal(isCompanySave(s), true);
});
for (const origin of companyOrigins)
  test(`${origin.name} applies its advertised starting resources and progression`, () => {
    const o = options();
    o.origin = origin.id;
    const s = createCompany(o);
    assert.equal(s.gold, origin.gold);
    assert.equal(s.food, origin.food);
    assert.equal(s.cargo.grain, origin.grain || 0);
    assert.equal(s.inventory.wood, origin.wood || 0);
    assert.equal(s.inventory.herbs, origin.herbs || 0);
    assert.equal(s.renown, origin.renown || 0);
    assert.equal(s.party[0].level, origin.veteran ? 2 : 1);
    assert.equal(s.party[0].points, origin.veteran ? 1 : 0);
  });
test("hearty and mercenary founders have actual upkeep and combat tradeoffs", () => {
  const o = options();
  o.founders[0].trait = "mercenary";
  o.founders[2].trait = "hearty";
  const s = createCompany(o);
  assert.equal(s.party[0].damage, 8);
  assert.equal(s.party[2].max, 32);
  assert.equal(dailyWages(s), 9);
  assert.equal(campCost(s), 5);
});
test("company customization and portraits survive reload; legacy companies get safe defaults", () => {
  const s = createCompany(options()),
    c = restore(JSON.parse(JSON.stringify(s)));
  assert.equal(c.companyName, s.companyName);
  assert.equal(c.banner, "pine");
  assert.equal(c.party[0].coat, s.party[0].coat);
  const old = fresh();
  delete old.companyName;
  delete old.banner;
  delete old.origin;
  assert.equal(restore(old).companyName, "The Ashen Company");
  assert.equal(restore(old).banner, "ashen");
});
test("invalid creator choices fail without generating a partial company", () => {
  for (const key of ["name", "banner", "origin", "founders"]) {
    const o = options();
    o[key] = key === "founders" ? [] : "";
    assert.equal(createCompany(o), null);
  }
  for (const key of ["name", "role", "profession", "trait"]) {
    const o = options();
    o.founders[0][key] = "";
    assert.equal(createCompany(o), null);
  }
  const badRole = options();
  badRole.founders[0].role = "constructor";
  assert.equal(createCompany(badRole), null);
  const o = options();
  o.name = "x".repeat(31);
  assert.equal(createCompany(o), null);
});
test("player-entered company and companion names cannot inject markup into cards", () => {
  const o = options();
  o.name = "<b>Foxes</b>";
  o.founders[0].name = "<i>Ada</i>";
  const s = createCompany(o);
  assert.equal(s.companyName, "bFoxes/b");
  assert.equal(s.party[0].name, "iAda/i");
  assert.equal(
    restore({
      ...s,
      companyName: "<script>",
      party: s.party.map((p) => ({ ...p, name: "<b>Mara" })),
    }).party[0].name,
    "bMara",
  );
});
test("save availability rejects absent, corrupt and oversize-party snapshots", () => {
  assert.equal(isCompanySave(null), false);
  assert.equal(isCompanySave({}), false);
  const s = fresh();
  s.party.push(...s.party);
  assert.equal(isCompanySave(s), false);
  const bad = fresh();
  bad.party[0].hp = 100;
  assert.equal(isCompanySave(bad), false);
});
