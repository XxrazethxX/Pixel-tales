import assert from "node:assert/strict";
import {
  fresh,
  places,
  startBattle,
  combatPreview,
  enterDungeon,
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
  const arrive = (s, i) => {
    s.location = i;
    s.position = { x: places[i].x, y: places[i].y };
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await click("New Company");
  await page
    .getByLabel("Campaign difficulty", { exact: true })
    .selectOption("forgiving");
  await click("Begin adventure");
  assert.equal((await state()).difficulty, "forgiving");
  await click("Company");
  await page.getByText("Supply forecast", { exact: true }).waitFor();
  await click("Dismiss introduction");
  assert.equal((await state()).helpSeen.travel, true);
  const farm = fresh();
  arrive(farm, 13);
  await seed(farm);
  await click("Explore abandoned farm");
  await click("Open the cellar");
  assert.match((await state()).event.message, /ledger/);
  await click("Read the farmer’s ledger");
  assert.ok((await state()).discovered.includes(12));
  assert.ok((await state()).discovered.includes(14));
  await click("Open the cellar");
  assert.equal((await state()).food, 36);
  await page.reload();
  await enterGame(page);
  assert.equal(
    await page
      .getByRole("button", { name: "Open the cellar", exact: true })
      .isEnabled(),
    false,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await click("Search the old well");
  assert.equal((await state()).inventory.herbs, 3);
  assert.equal(
    await page
      .locator("#event")
      .evaluate(
        (el) =>
          el.getBoundingClientRect().right <= innerWidth &&
          el.scrollWidth <= el.clientWidth,
      ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-farm-mobile.png" });
  await click("Leave farm");
  const dungeon = fresh();
  arrive(dungeon, 5);
  enterDungeon(dungeon);
  dungeon.event.x = 6;
  dungeon.event.y = 0;
  await seed(dungeon);
  await click("Inspect nearby walls");
  assert.equal((await state()).siteProgress["secret-5"], true);
  await page.screenshot({ path: "/tmp/pixel-unique-dungeon-mobile.png" });
  await click("Leave dungeon");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const combat = fresh();
  arrive(combat, 1);
  combat.contract = { target: 1, reward: 65 };
  startBattle(combat);
  Object.assign(combat.battle.units[0], { x: 0, y: 0 });
  Object.assign(combat.battle.units[1], { x: 0, y: 1 });
  Object.assign(combat.battle.units[2], { x: 1, y: 1 });
  Object.assign(combat.battle.enemies[0], { x: 3, y: 1, hp: 100, max: 100 });
  const preview = combatPreview(combat, 2, 3, 1);
  await seed(combat);
  await click("Nell");
  await page.locator(".combat-preview-menu > summary").click();
  const target = page.locator(".target-previews > button").first();
  assert.match(
    await target.textContent(),
    new RegExp(`${preview.damage} damage`),
  );
  await target.click();
  assert.equal((await state()).battle.enemies[0].hp, 100 - preview.damage);
  assert.match(
    await page.locator("#combat-report").textContent(),
    /Nell strikes/,
  );
  const during = await page.locator("#map").evaluate((c) => c.toDataURL());
  await page.waitForTimeout(1100);
  const settled = await page.locator("#map").evaluate((c) => c.toDataURL());
  assert.notEqual(
    during,
    settled,
    "floating damage and attack effect must clear after the action",
  );
  await page.screenshot({ path: "/tmp/pixel-combat-feedback-desktop.png" });
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).battle.enemies[0].hp, 100 - preview.damage);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".combat-preview-menu > summary").click();
  assert.equal(
    await page
      .locator(".combat-preview-menu")
      .evaluate(
        (el) =>
          el.getBoundingClientRect().right <= innerWidth &&
          el.scrollWidth <= el.clientWidth,
      ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-combat-preview-mobile.png" });
  await page.getByText("Movement previews", { exact: true }).click();
  const movement = page.getByLabel("Preview movement destination", {
    exact: true,
  });
  assert.ok(await movement.locator("option").count());
  const destination = (await movement.inputValue()).split(",").map(Number);
  await click("Move to previewed tile");
  const moved = (await state()).battle.units[0];
  assert.equal(moved.x, destination[0]);
  assert.equal(moved.y, destination[1]);
  assert.equal(moved.moved, true);
  await page.locator("#field-tip > summary").click();
  assert.match(await page.locator("#field-tip").textContent(), /Disengage/);
  await click("Got it");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: difficulty creation, survival forecast and guide, clue-linked farm/camp/cave discovery, unique dungeon secrets, saved one-time supplies, exact target damage, transient attack effects, battle reload, and mobile interiors/previews.",
  );
} finally {
  await browser.close();
}
