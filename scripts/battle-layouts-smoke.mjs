import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import { fresh, places, startBattle } from "../src/game.js";
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
  const point = async (x, y) =>
    page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect();
        return {
          x:
            r.x +
            (136 + x * 62 - Number(c.dataset.viewX)) * Number(c.dataset.scale),
          y:
            r.y +
            (28 + y * 60 - Number(c.dataset.viewY)) * Number(c.dataset.scale),
        };
      },
      { x, y },
    );
  const tile = async (x, y) => {
    const p = await point(x, y);
    await page.mouse.click(p.x, p.y);
  };
  const fight = (location) => {
    const s = fresh();
    s.location = location;
    s.position = { x: places[location].x, y: places[location].y };
    s.contract = { target: location, reward: 65 };
    startBattle(s);
    return s;
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  const ruin = fight(2);
  Object.assign(ruin.battle.units[2], { x: 3, y: 3 });
  Object.assign(ruin.battle.enemies[0], { x: 5, y: 3, hp: 30, max: 30 });
  await seed(ruin);
  await click("Nell");
  assert.ok(
    (await page.locator("#objective").textContent()).includes(
      "Ruined courtyard",
    ),
  );
  await tile(5, 3);
  assert.equal((await state()).battle.enemies[0].hp, 30);
  assert.equal((await state()).battle.units[2].acted, false);
  await click("Aimed shot · 2 valor");
  await tile(5, 3);
  assert.equal((await state()).battle.valor, 3);
  assert.equal((await state()).battle.units[2].acted, false);
  const wall = await point(4, 3);
  await page.mouse.move(wall.x, wall.y);
  assert.ok(
    (await page.locator("#map-label").textContent()).includes(
      "impassable · blocks sight",
    ),
  );
  await page.screenshot({ path: "/tmp/pixel-ruin-field.png" });
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).battle.layoutId, "ruin-court");
  assert.equal((await state()).battle.units[2].x, 3);
  const move = fight(2);
  Object.assign(move.battle.units[0], { x: 3, y: 3 });
  await seed(move);
  await tile(4, 3);
  assert.equal((await state()).battle.units[0].moved, false);
  await tile(3, 4);
  assert.equal((await state()).battle.units[0].moved, true);
  await seed(fight(8));
  assert.ok(
    (await page.locator("#objective").textContent()).includes("Flooded ford"),
  );
  await page.screenshot({ path: "/tmp/pixel-river-field.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: "/tmp/pixel-river-field-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [location, id] of [
    [4, "quarry"],
    [7, "forest-grove"],
  ]) {
    await seed(fight(location));
    assert.equal((await state()).battle.layoutId, id);
    await page.screenshot({ path: `/tmp/pixel-${id}-field.png` });
  }
  const caravan = fresh(),
    trader = caravan.patrols.find((p) => p.id === "caravan");
  caravan.location = -1;
  caravan.position = { x: trader.x, y: trader.y };
  startBattle(caravan, trader.id);
  await seed(caravan);
  assert.equal((await state()).battle.layoutId, "road");
  await page.screenshot({ path: "/tmp/pixel-caravan-field.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: contextual battle layouts, ranged and skill sight restrictions, blocked movement and legal detours, terrain tooltips, saved deployment, caravan battle, regional field artwork and mobile combat.",
  );
} finally {
  await browser.close();
}
