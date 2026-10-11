import assert from "node:assert/strict";
import { fresh, places } from "../src/game.js";
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
    await page.waitForSelector("#tabs button");
  };
  const arrive = (s, i) => {
    s.location = i;
    s.position = { x: places[i].x, y: places[i].y };
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  const s = fresh();
  s.gold = 500;
  s.renown = 30;
  await seed(s);
  await click("Visit Training hall");
  assert.match(
    await page.locator("#panel").textContent(),
    /Greyhaven teaches Cook and Smith/,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Train Osric · Miner", exact: true })
      .isDisabled(),
    true,
  );
  await click("Train Mara · Smith");
  let trained = await state();
  assert.equal(trained.party[0].professionXP, 3);
  assert.equal(trained.gold, 476);
  assert.equal(trained.timeOfDay, 11);
  assert.equal(
    await page
      .getByRole("button", { name: "Train Mara · Smith", exact: true })
      .isDisabled(),
    true,
  );
  assert.match(
    await page.locator("#panel").textContent(),
    /Already trained today/,
  );
  await page.reload();
  await click("Visit Training hall");
  assert.equal(
    await page
      .getByRole("button", { name: "Train Mara · Smith", exact: true })
      .isDisabled(),
    true,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("heading", { name: "Mara", exact: true })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-training-mobile.png" });
  await click("Back to village");
  assert.equal(
    await page
      .getByRole("button", { name: "Visit Training hall", exact: true })
      .count(),
    1,
  );
  trained = await state();
  arrive(trained, 6);
  await seed(trained);
  await click("Visit Training hall");
  assert.match(
    await page.locator("#panel").textContent(),
    /Emberfall teaches Smith and Miner/,
  );
  await click("Train Osric · Miner");
  assert.equal((await state()).party[1].professionXP, 3);
  const coast = fresh();
  coast.gold = 500;
  coast.renown = 30;
  arrive(coast, 3);
  await seed(coast);
  await click("Visit Training hall");
  await click("Train Nell · Herbalist");
  assert.equal((await state()).party[2].professionXP, 3);
  const wild = await state();
  arrive(wild, 1);
  await seed(wild);
  assert.equal(
    await page
      .getByRole("button", { name: "Visit Training hall", exact: true })
      .count(),
    0,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Accept contract", exact: true })
      .count(),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Training hall browser smoke passed: settlement venue, regional tutors, lessons, rank and resource changes, daily locks, reloads, mobile controls, village navigation and wilderness restrictions.",
  );
} finally {
  await browser.close();
}
