import { readFileSync } from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = async (text) =>
  page.getByRole("button", { name: text, exact: true }).click();
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("pixel-tales")));
const tile = async (x, y) => {
  const r = await page.locator("canvas").boundingBox();
  await page.mouse.click(
    r.x + ((136 + x * 62) * r.width) / 768,
    r.y + ((28 + y * 60) * r.height) / 432,
  );
};
await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
await page.waitForSelector("#destinations button");
assert.equal(await page.locator("#tabs button").count(), 5);
await click("Contracts");
await page
  .getByRole("button", { name: "Accept contract", exact: true })
  .first()
  .click();
await click("Pinewatch");
await click("Explore · knowledge & materials");
await click("Engage raiders");
for (let turn = 0; turn < 30 && (await state()).battle; turn++) {
  for (const id of (await state()).battle.units.map((u) => u.id)) {
    let s = await state();
    if (!s.battle) break;
    let u = s.battle.units.find((u) => u.id === id),
      p = s.party[id];
    if (p.hp <= 0) continue;
    const btn = page
      .locator("#actions button")
      .filter({ hasText: new RegExp("^" + p.name) });
    await btn.click();
    const range = p.role === "Archer" ? 4 : p.role === "Spearman" ? 2 : 1;
    let enemies = s.battle.enemies
      .filter((e) => e.hp > 0)
      .sort(
        (a, b) =>
          Math.abs(a.x - u.x) +
          Math.abs(a.y - u.y) -
          (Math.abs(b.x - u.x) + Math.abs(b.y - u.y)),
      );
    if (Math.abs(enemies[0].x - u.x) + Math.abs(enemies[0].y - u.y) > range) {
      let opts = [];
      for (let x = 0; x < 9; x++)
        for (let y = 0; y < 7; y++)
          if (
            Math.abs(x - u.x) + Math.abs(y - u.y) <= 2 &&
            !s.battle.enemies.some((e) => e.hp > 0 && e.x === x && e.y === y) &&
            !s.battle.units.some(
              (v) => s.party[v.id].hp > 0 && v.x === x && v.y === y,
            )
          )
            opts.push({
              x,
              y,
              d: Math.abs(x - enemies[0].x) + Math.abs(y - enemies[0].y),
            });
      opts.sort((a, b) => a.d - b.d);
      if (opts.length) await tile(opts[0].x, opts[0].y);
    }
    s = await state();
    u = s.battle.units.find((u) => u.id === id);
    const e = s.battle.enemies.find(
      (e) => e.hp > 0 && Math.abs(e.x - u.x) + Math.abs(e.y - u.y) <= range,
    );
    if (e) await tile(e.x, e.y);
  }
  const s = await state();
  if (s.battle) await click(`End round ${s.battle.turn}`);
}
assert.equal(
  (await state()).completed,
  1,
  "contract should be won through browser clicks",
);
assert.ok((await state()).party.some((p) => p.points > 0));
await click("Research");
await page
  .locator("#panel")
  .getByRole("button", { name: "Research", exact: true })
  .first()
  .click();
assert.ok((await state()).research.includes("rations"));
await click("Workshop");
await page.getByRole("button", { name: "Craft", exact: true }).first().click();
assert.equal((await state()).party[0].weapon, 2);
await click("Greyhaven");
await click("Help · 1 medicine");
await click("Town");
await click("Recruit companion");
assert.equal((await state()).party.length, 5);
await click("Contracts");
await page
  .getByRole("button", { name: "Accept contract", exact: true })
  .nth(2)
  .click();
await click("Saltbridge");
await click("Deliver 5 rations");
assert.equal((await state()).completed, 2);
await page.reload();
assert.equal((await state()).party.length, 5);
await page.screenshot({ path: "/tmp/pixel-tales-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "/tmp/pixel-tales-mobile.png", fullPage: true });
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  "mobile overflow",
);
assert.deepEqual(errors, []);
console.log(
  "PASS: startup, browser-driven combat victory, exploration, research, crafting, roadside choice, recruitment, delivery, save/reload, mobile layout; no JS errors.",
);
// Exercise startup with no network and no usable origin/storage (download-style runtime).
const offlineContext = await browser.newContext({ offline: true });
const offlinePage = await offlineContext.newPage();
const offlineErrors = [];
offlinePage.on("pageerror", (error) => offlineErrors.push(error.message));
let offlineHTML = readFileSync(
  new URL("../index.html", import.meta.url),
  "utf8",
);
offlineHTML = offlineHTML
  .replace(/<link[^>]*>/g, "")
  .replace(
    /<script\s+src="game.bundle.js"[\s\S]*?<\/script>/,
    () =>
      "<script>" +
      readFileSync(new URL("../game.bundle.js", import.meta.url), "utf8") +
      "</script>",
  );
await offlinePage.setContent(offlineHTML);
assert.equal(await offlinePage.locator("#tabs button").count(), 5);
await offlinePage
  .getByRole("button", { name: "Contracts", exact: true })
  .click();
await offlinePage
  .getByRole("button", { name: "Accept contract", exact: true })
  .first()
  .click();
assert.ok(
  (await offlinePage.locator("#objective").textContent()).includes(
    "Wolves in human clothing",
  ),
);
assert.deepEqual(offlineErrors, []);
console.log(
  "PASS: game starts and accepts a contract without network access or available localStorage.",
);
await browser.close();
