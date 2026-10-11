import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import { fresh } from "../src/game.js";
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
    await click("Research");
  };
  const card = (name) =>
    page
      .locator(".card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  const s = fresh();
  s.knowledge = 100;
  await seed(s);
  assert.match(
    await card("Food preservation").textContent(),
    /Requires Trailcraft\./,
  );
  assert.equal(
    await card("Food preservation")
      .getByRole("button", { name: "Research", exact: true })
      .isDisabled(),
    true,
  );
  await card("Trailcraft")
    .getByRole("button", { name: "Research", exact: true })
    .click();
  assert.match(
    await card("Food preservation").textContent(),
    /Requires 10 renown; company has 0/,
  );
  const unlocked = await state();
  unlocked.renown = 20;
  unlocked.research = ["rations", "medicine", "barter", "armorer", "steel"];
  await seed(unlocked);
  for (const name of [
    "Food preservation",
    "Marching discipline",
    "Company charter",
    "Campaign maintenance",
    "Tactical drills",
  ]) {
    await card(name)
      .getByRole("button", { name: "Research", exact: true })
      .click();
    assert.equal(
      await card(name)
        .getByRole("button", { name: "Discovered", exact: true })
        .isDisabled(),
      true,
    );
  }
  const purchased = await state();
  assert.equal(purchased.knowledge, 63);
  await page.reload();
  await enterGame(page);
  await click("Research");
  assert.equal((await state()).research.length, 10);
  await page.setViewportSize({ width: 390, height: 844 });
  await card("Tactical drills").scrollIntoViewIfNeeded();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.waitForTimeout(250);
  await page.screenshot({ path: "/tmp/pixel-advanced-research-mobile.png" });
  const poor = fresh();
  poor.renown = 20;
  poor.research = ["steel"];
  await seed(poor);
  assert.match(
    await card("Tactical drills").textContent(),
    /Requires 8 knowledge; company has 0/,
  );
  assert.equal(
    await card("Tactical drills")
      .getByRole("button", { name: "Research", exact: true })
      .isDisabled(),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Advanced research browser smoke passed: prerequisite and renown gates, purchases, exact knowledge costs, saved discoveries, insufficient knowledge, mobile layout; no JavaScript errors.",
  );
} finally {
  await browser.close();
}
