import { enterGame, exploreSite } from "./smoke-menu.mjs";
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
    await enterGame(page);
    await page.waitForSelector("#tabs button");
  };
  const arrive = (s, i) => {
    s.location = i;
    s.position = { x: places[i].x, y: places[i].y };
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  const s = fresh();
  s.gold = 500;
  s.contract = { name: "Existing work", target: 1, reward: 65 };
  await seed(s);
  await click("Visit The Crooked Lantern");
  await click("Hear rumor: A smuggler’s second cache");
  let heard = await state();
  assert.equal(heard.gold, 492);
  assert.equal(heard.timeOfDay, 9);
  assert.ok(heard.discovered.includes(10));
  assert.deepEqual(heard.charted, s.charted);
  assert.equal(heard.contract.name, "Existing work");
  assert.equal(
    await page
      .getByRole("button", {
        name: "Hear rumor: A smuggler’s second cache",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await click("Journal");
  assert.match(
    await page.locator("#rumor-journal").textContent(),
    /Heard on day 1/,
  );
  await click("Walk to Forgotten Stash");
  assert.ok((await state()).destination);
  await page.reload();
  await enterGame(page);
  await click("Journal");
  assert.equal(
    await page
      .getByRole("button", { name: "Walk to Forgotten Stash", exact: true })
      .count(),
    1,
  );
  heard = await state();
  arrive(heard, 10);
  await seed(heard);
  await exploreSite(page);
  let found = await state();
  assert.equal(found.gold, 542);
  assert.equal(found.knowledge, 2);
  assert.equal(found.rumors["hidden-compartment"].resolvedDay, 1);
  assert.equal(found.contract.name, "Existing work");
  await click("Journal");
  assert.match(
    await page.locator("#rumor-journal").textContent(),
    /Confirmed on day 1/,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Walk to Forgotten Stash", exact: true })
      .count(),
    0,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: "/tmp/pixel-rumor-journal-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.reload();
  await enterGame(page);
  assert.equal((await state()).gold, 542);
  assert.equal((await state()).rumors["hidden-compartment"].resolvedDay, 1);
  const coast = fresh();
  coast.gold = 100;
  arrive(coast, 3);
  await seed(coast);
  await click("Visit The Crooked Lantern");
  assert.equal(
    await page
      .getByRole("button", {
        name: "Hear rumor: The missing patrol ledger",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await click("Hear rumor: The drowned herb garden");
  assert.ok((await state()).rumors["chapel-herbs"]);
  assert.deepEqual(errors, []);
  console.log(
    "Tavern rumor browser smoke passed: local offers, costs, marked landmarks, unchanged fog and contracts, journal travel, one-time finds, persistence, renown locks and mobile layout.",
  );
} finally {
  await browser.close();
}
