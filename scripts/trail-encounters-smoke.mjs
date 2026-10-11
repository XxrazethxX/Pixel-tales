import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import { fresh, beginTrailEncounter, trailEncounters } from "../src/game.js";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const click = (name) =>
    page.getByRole("button", { name, exact: true }).click();
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
  const seed = async (s) => {
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
    await page.waitForSelector("#tabs button");
  };
  const fixture = (id) => {
    const s = fresh();
    s.location = -1;
    s.position = { x: 600, y: 480 };
    beginTrailEncounter(s);
    const t = trailEncounters.find((e) => e.id === id);
    Object.assign(s.event, { templateId: t.id, title: t.title, text: t.text });
    return s;
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  await seed(fresh());
  assert.equal(
    await page
      .getByRole("button", { name: "Scout surroundings · 1 hour", exact: true })
      .isDisabled(),
    true,
  );
  const forest = fresh();
  forest.location = -1;
  forest.position = { x: 965, y: 220 };
  await seed(forest);
  await click("Scout surroundings · 1 hour");
  let s = await state();
  assert.equal(s.event.templateId, "snares");
  assert.equal(s.trailLedger["Ember frontier"], 1);
  assert.equal(
    await page
      .getByRole("button", { name: "Return the trapped game", exact: true })
      .isDisabled(),
    true,
  );
  const time = s.timeOfDay;
  await page.waitForTimeout(350);
  assert.equal((await state()).timeOfDay, time);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-trail-choices-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).event.templateId, "snares");
  await click("Gather the clearing's herbs");
  s = await state();
  assert.equal(s.inventory.herbs, 4);
  assert.equal(s.food, 22);
  assert.equal(s.party[2].professionXP, 1);
  assert.equal(s.encounterJournal[0].choiceId, "herbalist");
  assert.equal(
    await page
      .getByRole("button", { name: "Scout surroundings · 1 hour", exact: true })
      .isDisabled(),
    true,
  );
  await click("Company");
  await page.getByText("Recent encounters (1)", { exact: true }).click();
  assert.ok(
    (await page.locator("#panel").textContent()).includes(
      "Poachers' snares: Gather the clearing's herbs",
    ),
  );
  await page.screenshot({ path: "/tmp/pixel-trail-journal-mobile.png" });
  const wagon = fixture("wagon");
  wagon.cargo.grain = 20;
  await seed(wagon);
  assert.equal(
    await page
      .getByRole("button", { name: "Seize the cloth cargo", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("button", {
        name: "Supply the shipment · 2 cloth cargo",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  wagon.cargo.grain = 0;
  wagon.cargo.cloth = 2;
  await seed(wagon);
  await click("Supply the shipment · 2 cloth cargo");
  s = await state();
  assert.equal(s.cargo.cloth, 0);
  assert.equal(s.gold, 150);
  assert.equal(s.reputation.guild, 2);
  const levy = fixture("levy");
  await seed(levy);
  assert.equal(
    await page
      .getByRole("button", {
        name: "Intimidate them with a Mercenary",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  levy.party[0].traits = ["mercenary"];
  await seed(levy);
  await click("Intimidate them with a Mercenary");
  assert.equal((await state()).reputation.wardens, -3);
  const automatic = fresh();
  automatic.location = -1;
  automatic.position = { x: 600, y: 480 };
  automatic.day = 5;
  automatic.timeOfDay = 23.99;
  automatic.food = 100;
  automatic.gold = 500;
  await seed(automatic);
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("pixel-tales")).event?.kind === "trail",
    null,
    { timeout: 4000 },
  );
  s = await state();
  assert.equal(s.day, 6);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "/tmp/pixel-trail-choices.png" });
  await click("Walk away");
  assert.equal((await state()).event, null);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: terrain-based scouting, faction/profession/trait options, cargo capacity, exact rewards, regional daily cooldown, mobile choices and journal, pending-save persistence, paused clock, natural daily encounters, and walk-away safety.",
  );
} finally {
  await browser.close();
}
