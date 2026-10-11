import assert from "node:assert/strict";
import { fresh, places, startBattle, registerCrime } from "../src/game.js";
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
  const click = (n) =>
    page.getByRole("button", { name: n, exact: true }).click();
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
  const arrive = (s, i) => {
    s.location = i;
    s.position = { x: places[i].x, y: places[i].y };
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await enterGame(page);
  const camp = fresh();
  camp.gold = 500;
  camp.inventory.wood = 30;
  camp.inventory.ore = 10;
  await seed(camp);
  await click("Close panel");
  await click("Make camp");
  await page
    .getByLabel("Shared table space", { exact: true })
    .selectOption("2");
  await click("Build Shared table");
  assert.equal((await state()).campFurniture.table, 2);
  await click("Support Mara");
  assert.equal((await state()).party[0].storyComplete, "supported");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-expanded-camp-mobile.png" });
  await click("Break camp");
  const crime = fresh();
  crime.gold = 200;
  crime.cargo.grain = 3;
  registerCrime(crime);
  await seed(crime);
  await click("Pay fine and surrender cargo");
  assert.equal((await state()).crime.wanted, 0);
  assert.equal((await state()).cargo.grain, 0);
  const dungeon = fresh();
  arrive(dungeon, 4);
  await seed(dungeon);
  await click("Explore dungeon");
  for (let x = 1; x <= 7; x++)
    await page
      .getByRole("button", { name: `Dungeon tile ${x + 1},6`, exact: true })
      .click();
  assert.ok((await state()).battle.dungeonReturn);
  const win = await state();
  win.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(win.battle.enemies[0], { x: 2, y: 1, hp: 1, armor: 0 });
  await seed(win);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(150);
  const point = await page.locator("#map").evaluate((c) => {
    const r = c.getBoundingClientRect();
    return {
      x:
        r.x +
        (136 + 2 * 62 - Number(c.dataset.viewX)) * Number(c.dataset.scale),
      y: r.y + (28 + 60 - Number(c.dataset.viewY)) * Number(c.dataset.scale),
    };
  });
  await page.mouse.click(point.x, point.y);
  assert.equal((await state()).event.kind, "dungeon");
  await page
    .getByRole("button", { name: "Dungeon tile 9,6", exact: true })
    .click();
  await click("Open guarded vault");
  assert.ok((await state()).siteProgress["vault-4"]);
  await page.screenshot({ path: "/tmp/pixel-dungeon-desktop.png" });
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).event.x, 8);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.equal(
    await page.locator("#event").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.left >= 0 && r.right <= innerWidth && el.scrollWidth <= el.clientWidth
      );
    }),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-dungeon-mobile.png" });
  await click("Leave dungeon");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const combat = fresh();
  arrive(combat, 1);
  combat.contract = { target: 1, reward: 65 };
  startBattle(combat);
  await seed(combat);
  await click("Nell");
  await click("Overwatch");
  assert.equal((await state()).battle.units[2].overwatch, true);
  await click("Osric");
  await click("Shield wall");
  assert.equal((await state()).battle.units[1].guard, true);
  const rain = fresh();
  rain.day = 3;
  await seed(rain);
  assert.match(await page.locator("#weather-label").textContent(), /storm/);
  await click("Close panel");
  await click("Prepare ambush · 1 ration / 2 hours");
  assert.equal((await state()).ambushReady, true);
  assert.deepEqual(errors, []);
  console.log(
    "Campaign expansion smoke passed: camp placement, companion goal, mobile camp, crime fines, playable dungeon and sentries, persistent vault, overwatch, shield wall, storm label and ambush.",
  );
} finally {
  await browser.close();
}
