import assert from "node:assert/strict";
import {
  fresh,
  places,
  inflictWound,
  startBattle,
  markResettlement,
} from "../src/game.js";
import {
  enterGame,
  gameClick,
  dismissReports,
  openDetails,
} from "./smoke-menu.mjs";
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
  const click = (name) => gameClick(page, name);
  const close = async () => {
    await dismissReports(page);
    const b = page.getByRole("button", { name: "Close panel", exact: true });
    if (await b.isVisible()) await b.click();
  };
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
  const seed = async (s) => {
    await dismissReports(page);
    const titleContinue = page.getByRole("button", {
        name: "Continue",
        exact: true,
      }),
      menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (!(await titleContinue.isVisible()) && (await menu.isVisible()))
      await menu.click();
    await dismissReports(page);
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const s = fresh();
  s.food = 100;
  s.gold = 200;
  s.inventory.medicine = 3;
  s.inventory.wood = 10;
  s.reputation.guild = 15;
  for (const p of s.patrols) p.cleared = true;
  inflictWound(s, 0, "sprain", 2);
  await seed(s);
  await close();
  await click("Company");
  await page.getByLabel("Banner field", { exact: true }).selectOption("wine");
  await page.getByLabel("Banner emblem", { exact: true }).selectOption("wolf");
  await page.getByLabel("Banner trim", { exact: true }).selectOption("silver");
  await click("Apply heraldry");
  await click("Adopt League Friends");
  await page.waitForTimeout(800);
  assert.equal((await state()).chronicle.heraldry.charge, "wolf");
  await click(`Bandage · 1 medicine, 2h: ${s.party[0].name}`);
  await page.waitForTimeout(800);
  assert.ok((await state()).party[0].wound.treated);
  await page.screenshot({ path: "docs/screenshots/chronicle-company.png" });
  await close();
  const town = page.getByRole("button", {
    name: "Enter Greyhaven",
    exact: true,
  });
  if (await town.count()) await town.click();
  else await click("Town");
  await click("Repair village · 20 crowns, 3 timber, 2h");
  await page.waitForTimeout(800);
  assert.equal((await state()).chronicle.towns[0].condition, 67);
  const scout = fresh(),
    patrol = scout.patrols.find((p) => p.id === "new-troll");
  scout.position = { x: patrol.x - 100, y: patrol.y };
  for (const p of scout.patrols) if (p.id !== patrol.id) p.cleared = true;
  await seed(scout);
  await close();
  await click("Scout Crag trolls · 1h");
  await page.waitForTimeout(800);
  assert.ok((await state()).chronicle.scouted[patrol.id]);
  await page.evaluate(() =>
    localStorage.setItem(
      "pixel-tales-settings",
      JSON.stringify({ reduceMotion: true, largeText: false, slowDays: false }),
    ),
  );
  for (const family of ["troll", "spider", "cultist", "knight"]) {
    const b = fresh();
    const p = b.patrols.find((p) => p.id === `new-${family}`);
    b.position = { x: p.x, y: p.y };
    b.food = 100;
    assert.ok(startBattle(b, p.id));
    await seed(b);
    await page
      .getByText("Battle conditions and enemy intentions", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: /^End round / }).click();
    await page.waitForTimeout(300);
    if (family === "troll")
      await page.screenshot({ path: "docs/screenshots/chronicle-battle.png" });
  }
  const world = fresh();
  world.day = 4;
  world.food = 100;
  world.gold = 100;
  world.strongholds.briar.cleared = true;
  markResettlement(world, "briar", 12);
  world.chronicle.settlements.briar.clearedDay = 1;
  world.chronicle.settlements.briar.arrived = true;
  world.location = 12;
  world.position = { x: places[12].x, y: places[12].y };
  world.discovered = places.map((_, i) => i);
  world.inventory.wood = 10;
  for (const p of world.patrols) p.cleared = true;
  await seed(world);
  await close();
  await click("Trade with settlers · 8 crowns for 6 rations");
  await click("Rebuild settlement · 25 crowns, 5 timber, 4h");
  await page.waitForTimeout(800);
  assert.ok((await state()).chronicle.settlements.briar.helped);
  await page.setViewportSize({ width: 390, height: 844 });
  await click("Company");
  await page.screenshot({ path: "docs/screenshots/chronicle-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Chronicle desktop/mobile browser checks passed; no page errors.",
  );
} finally {
  await browser.close();
}
