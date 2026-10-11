import assert from "node:assert/strict";
import { fresh, places } from "../src/game.js";
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
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await click("New Company");
  await page.getByLabel("Founder 1 sex", { exact: true }).selectOption("male");
  await page
    .getByLabel("Founder 1 hairstyle", { exact: true })
    .selectOption("braid");
  await page
    .getByLabel("Founder 1 skin", { exact: true })
    .selectOption("#8f624b");
  await click("Begin adventure");
  assert.equal((await state()).party[0].sex, "male");
  assert.equal((await state()).party[0].hairStyle, "braid");
  await click("Company");
  await page.getByText("Customize avatar", { exact: true }).first().click();
  await page.getByLabel("Mara Sex", { exact: true }).selectOption("female");
  assert.equal((await state()).party[0].sex, "female");
  await page.getByLabel("Mara Coat", { exact: true }).selectOption("#986267");
  assert.equal((await state()).party[0].coat, "#986267");
  const stash = await state();
  stash.location = 10;
  stash.position = { x: places[10].x, y: places[10].y };
  await seed(stash);
  await click("Enter Forgotten Stash");
  assert.equal((await state()).event.stage, "search");
  await click("Search 1,1");
  assert.equal((await state()).gold, 120);
  await click("Search 4,2");
  assert.equal((await state()).event.stage, "lock");
  const dial = () => page.getByRole("slider", { name: "Lockpick dial" });
  await dial().fill("2");
  await click("Test tension");
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).event.pin, 1);
  for (const v of ["4", "1"]) {
    await dial().fill(v);
    await click("Test tension");
  }
  assert.equal((await state()).gold, 150);
  await click("Leave site");
  await click("Enter Forgotten Stash");
  assert.equal((await state()).event.stage, "opened");
  await click("Leave site");
  const mine = await state();
  mine.location = 4;
  mine.position = { x: places[4].x, y: places[4].y };
  await seed(mine);
  await click("Enter Iron Hollow");
  await click("Enter gallery");
  await click("Inspect abandoned cart");
  await click("Enter ore chamber");
  await click("Survey ore seam");
  assert.equal((await state()).inventory.ore, 10);
  await page.screenshot({ path: "/tmp/pixel-mine-interior.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-mine-mobile.png" });
  await click("Leave site");
  const wolves = fresh(),
    pack = wolves.patrols.find((p) => p.id === "pine-wolves");
  wolves.location = -1;
  wolves.position = { x: pack.x, y: pack.y };
  await seed(wolves);
  await page.screenshot({ path: "/tmp/pixel-wolves-map.png" });
  await click("Confront Pinewatch wolf pack");
  assert.ok((await state()).battle.enemies.every((e) => e.kind === "wolf"));
  assert.deepEqual(errors, []);
  console.log(
    "Sites and avatars smoke passed: founder appearance, puzzle search, lock pins and reloads, unique loot, mine rooms, cart and survey, mobile interiors, wolf map and wolf combat.",
  );
} finally {
  await browser.close();
}
