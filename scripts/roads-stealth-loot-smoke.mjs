import assert from "node:assert/strict";
import {
  fresh,
  places,
  nearbyPlace,
  startBattle,
  toggleStealth,
  advanceStealth,
} from "../src/game.js";
import { enterGame } from "./smoke-menu.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
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
    const menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
  };
  const close = async () => {
    const b = page.getByRole("button", { name: "Close panel", exact: true });
    if (await b.isVisible()) await b.click();
  };
  const near = (s, id, distance = 0) => {
    const p = s.patrols.find((p) => p.id === id);
    s.position = { x: p.x + distance, y: p.y };
    s.location = nearbyPlace(s.position);
    return p;
  };
  const mobile = async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const caravan = fresh();
  caravan.gold = 500;
  near(caravan, "armor-caravan");
  await seed(caravan);
  await close();
  await click("View caravan cargo");
  await click("Buy Mail shirt · 64 crowns");
  assert.ok((await state()).gear.some((g) => g.template === "armor-2"));
  assert.ok(
    !(await state()).patrols
      .find((p) => p.id === "armor-caravan")
      .gearStock.includes("armor-2"),
  );
  await page.reload();
  await enterGame(page);
  await close();
  await click("View caravan cargo");
  assert.equal(
    await page
      .getByRole("button", { name: "Buy Mail shirt · 64 crowns", exact: true })
      .count(),
    0,
  );
  const wheat = fresh();
  near(wheat, "wheat-caravan");
  await seed(wheat);
  await close();
  await click("View caravan cargo");
  await click("Buy caravan grain · 9 crowns");
  assert.equal((await state()).cargo.grain, 1);
  await close();
  await page.screenshot({ path: "/tmp/pixel-specialized-caravan.png" });
  const bandits = fresh();
  near(bandits, "knives", 35);
  await seed(bandits);
  await close();
  await page
    .getByRole("button", { name: "Pay 20 crowns", exact: true })
    .waitFor();
  assert.equal((await state()).battle, null);
  await mobile();
  await page.screenshot({ path: "/tmp/pixel-bandit-negotiation-mobile.png" });
  await click("Pay 20 crowns");
  assert.equal((await state()).gold, 100);
  assert.equal((await state()).event, null);
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).event, null);
  const refused = fresh();
  near(refused, "knives", 35);
  await seed(refused);
  await close();
  await click("Refuse · Fight");
  assert.equal((await state()).battle.patrolId, "knives");
  const stash = fresh();
  stash.location = 10;
  stash.position = { x: places[10].x + 50, y: places[10].y };
  await seed(stash);
  await close();
  await click("Enter Forgotten Stash");
  await click("Search 4,2");
  assert.equal((await state()).event.stage, "search");
  await click("Broken oak");
  await click("Marker stone");
  await click("Checked 4,2");
  assert.equal((await state()).event.stage, "lock");
  const dial = page.getByRole("slider", { name: "Lockpick dial" });
  await dial.fill("0");
  await click("Test tension");
  assert.match((await state()).event.message, /higher/);
  for (const n of ["2", "4", "1"]) {
    await dial.fill(n);
    await click("Test tension");
  }
  assert.equal((await state()).gold, 120);
  assert.equal((await state()).event.stage, "opened");
  await page.screenshot({ path: "/tmp/pixel-open-stash-mobile.png" });
  await click("Take 1 medicine");
  assert.equal((await state()).inventory.medicine, 2);
  await click("Leave site");
  await page.reload();
  await enterGame(page);
  await click("Enter Forgotten Stash");
  assert.equal(
    await page
      .getByRole("button", { name: "Take 1 medicine", exact: true })
      .count(),
    0,
  );
  await click("Take 30 crowns");
  assert.equal((await state()).gold, 150);
  await click("Take all contents");
  assert.deepEqual((await state()).stash.loot, {});
  const hidden = fresh();
  hidden.position = { x: 340, y: 200 };
  hidden.location = 1;
  hidden.patrols.forEach((p) => (p.cleared = true));
  await seed(hidden);
  await close();
  await click("Hide company");
  await page.waitForFunction(
    () => Number(document.querySelector("#hidden-scale").value) >= 75,
    {},
    { timeout: 10000 },
  );
  assert.match(
    await page.locator("#hidden-label").textContent(),
    /Hidden.*Ambush ready/,
  );
  await page.screenshot({ path: "/tmp/pixel-hidden-party-mobile.png" });
  const ambush = fresh();
  near(ambush, "knives");
  toggleStealth(ambush);
  advanceStealth(ambush, 5, false);
  ambush.stealth.concealment = 100;
  startBattle(ambush, "knives");
  ambush.battle.layoutId = "deadfall";
  ambush.battle.units.forEach((u) => {
    u.acted = true;
    u.moved = true;
  });
  await seed(ambush);
  const enemies = JSON.stringify((await state()).battle.enemies);
  await click("Finish ambush · Take additional turn");
  assert.equal(JSON.stringify((await state()).battle.enemies), enemies);
  assert.ok((await state()).battle.units.every((u) => !u.acted && !u.moved));
  await page.screenshot({ path: "/tmp/pixel-deadfall-battle-mobile.png" });
  const wanted = fresh();
  wanted.crime.wanted = 3;
  wanted.stealth = { active: true, concealment: 100 };
  wanted.position = { x: 800, y: 700 };
  wanted.location = -1;
  wanted.patrols.push({
    ...wanted.patrols.find((p) => p.id === "knives"),
    id: "warden-pursuit",
    name: "Warden pursuit",
    x: 830,
    y: 700,
  });
  await seed(wanted);
  await page.waitForTimeout(400);
  assert.equal((await state()).battle, null);
  await click("Leave hiding");
  await page
    .getByRole("button", { name: "End round 1", exact: true })
    .waitFor();
  assert.equal((await state()).battle.patrolId, "warden-pursuit");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: specialized caravan stock and artwork, paid and refused bandit negotiations, larger stash entry radius, two-clue search, readable mobile loot selection and persistence, live hidden meter, authority evasion, free full ambush turn, and deadfall battlefield.",
  );
} finally {
  await browser.close();
}
