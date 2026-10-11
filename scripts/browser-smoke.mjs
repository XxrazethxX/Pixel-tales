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
const worldClick = async (x, y) => {
  const r = await page.locator("#map").boundingBox();
  const view = await page.locator("#map").evaluate((c) => ({
    x: Number(c.dataset.viewX),
    y: Number(c.dataset.viewY),
    scale: Number(c.dataset.scale),
  }));
  await page.mouse.click(
    r.x + (x - view.x) * view.scale,
    r.y + (y - view.y) * view.scale,
  );
};
const tile = (x, y) => worldClick(136 + x * 62, 28 + y * 60);
const walk = async (x, y) => {
  if (await page.locator("#drawer").isVisible()) await click("Close panel");
  for (let attempt = 0; attempt < 8; attempt++) {
    await worldClick(x, y);
    await page.waitForFunction(
      () => {
        const s = JSON.parse(localStorage.getItem("pixel-tales"));
        return !s.destination || s.event;
      },
      {},
      { timeout: 20000 },
    );
    const s = await state();
    if (s.event) {
      if (
        await page
          .getByRole("button", { name: "Walk away", exact: true })
          .isVisible()
      )
        await click("Walk away");
      else await click("Take shelter · 1 day");
      continue;
    }
    assert.ok(
      Math.hypot(s.position.x - x, s.position.y - y) <
        (s.location === 0 || s.location === 3 || s.location === 6 ? 29 : 1),
      "party must reach clicked world coordinate",
    );
    return;
  }
  throw Error("Could not finish walking");
};
await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
await page.waitForSelector("#tabs button");
assert.equal(await page.locator("#tabs button").count(), 5);
assert.equal(await page.locator("#drawer").isVisible(), true);
assert.equal(
  await page
    .getByRole("button", { name: "Visit Market square", exact: true })
    .count(),
  1,
);
assert.equal(
  await page
    .getByRole("button", { name: "Accept contract", exact: true })
    .count(),
  0,
);
await page.screenshot({ path: "/tmp/pixel-tales-village.png" });
await click("Close panel");
// Choose open terrain rather than a landmark and redirect while actually walking.
await worldClick(260, 300);
await page.waitForFunction(
  () => JSON.parse(localStorage.getItem("pixel-tales")).position.x > 190,
);
let walking = await state();
assert.ok(walking.position.x < 260);
assert.ok(Math.abs(walking.destination.x - 260) < 1);
await worldClick(245, 235);
assert.ok(Math.abs((await state()).destination.y - 235) < 1);
await click("Stop walking");
const stopped = (await state()).position;
await page.waitForTimeout(200);
assert.deepEqual((await state()).position, stopped);
await page.reload();
assert.deepEqual((await state()).position, stopped);
await page.keyboard.down("d");
await page.waitForTimeout(300);
await page.keyboard.up("d");
assert.ok(
  (await state()).position.x > stopped.x,
  "keyboard steering moves the party",
);
// Approach an independently moving caravan and trade through its proximity action.
await page.evaluate(() => localStorage.removeItem("pixel-tales"));
await page.reload();
await worldClick(285, 355);
await page
  .getByRole("button", { name: "Trade · 10 rations / 12 crowns", exact: true })
  .waitFor({ timeout: 10000 });
await click("Trade · 10 rations / 12 crowns");
assert.equal((await state()).gold, 108);
assert.equal((await state()).food, 34);
await page
  .getByRole("button", { name: "Attack Copper Road caravan", exact: true })
  .click();
assert.equal((await state()).battle.caravanRaid, true);
assert.equal((await state()).patrols[0].hostile, true);
await click("Retreat · lose 15 crowns");
assert.equal(
  await page
    .getByRole("button", {
      name: "Trade · 10 rations / 12 crowns",
      exact: true,
    })
    .count(),
  0,
);
// Begin the full contract smoke run with independent state.
await page.evaluate(() => localStorage.removeItem("pixel-tales"));
await page.reload();
await click("Visit Contract board");
await page
  .getByRole("button", { name: "Accept contract", exact: true })
  .first()
  .click();
await walk(350, 145);
await click("Explore · knowledge & materials");
await click("Engage raiders");
await click("Nell");
await click("Aimed shot · 2 valor");
await tile(6, 3);
assert.equal((await state()).battle.enemies[1].hp, 11);
assert.equal((await state()).battle.valor, 1);
assert.equal((await state()).battle.units[2].cooldown, 2);
await page.screenshot({ path: "/tmp/pixel-tales-battle.png", fullPage: true });

for (let turn = 0; turn < 30 && (await state()).battle; turn++) {
  for (const id of (await state()).battle.units.map((u) => u.id)) {
    let s = await state();
    if (!s.battle) break;
    let u = s.battle.units.find((u) => u.id === id),
      p = s.party[id];
    if (p.hp <= 0 || u.acted) continue;
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
await click("Company");
await page
  .getByRole("button", { name: "Learn Duelist · 1 point", exact: true })
  .click();
assert.equal((await state()).party[0].talent, "duelist");
await page
  .getByRole("combobox", { name: "Profession for Mara", exact: true })
  .selectOption("Cook");
assert.equal((await state()).party[0].profession, "Cook");
await page
  .getByRole("combobox", { name: "Profession for Mara", exact: true })
  .selectOption("Smith");
await click("Close panel");
await click("Gather herbs · 2 rations / 1 day");
await click("Gather herbs · 2 rations / 1 day");
assert.ok((await state()).party[2].professionXP >= 5);

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
await walk(170, 280);
assert.equal(await page.locator("#drawer").isVisible(), true);
await click("Visit The Crooked Lantern");
await click("Recruit companion");
await click("Back to village");
await click("Visit Market square");
await click("10 rations · 15 crowns");
await click("Back to village");
await click("Visit Blacksmith");
await click("Weapon +2 · 35 crowns");
assert.equal((await state()).party[0].weapon, 4);
await click("Back to village");
assert.equal((await state()).party.length, 5);
await click("Visit Contract board");
await page
  .getByRole("button", { name: "Accept contract", exact: true })
  .nth(2)
  .click();
await walk(590, 355);
await click("Close panel");
await click("Deliver 5 rations");
assert.equal((await state()).completed, 2);
await page.reload();
assert.equal((await state()).party.length, 5);
await page.screenshot({ path: "/tmp/pixel-tales-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "/tmp/pixel-tales-mobile.png", fullPage: true });
const mobileStart = (await state()).position;
await walk(mobileStart.x - 15, mobileStart.y - 5);
assert.ok(
  (await state()).position.x < mobileStart.x,
  "mobile map click moves party",
);
const screenParty = await page.locator("#map").evaluate((c) => {
  const s = JSON.parse(localStorage.getItem("pixel-tales"));
  const r = c.getBoundingClientRect();
  return {
    y: r.y + (s.position.y - Number(c.dataset.viewY)) * Number(c.dataset.scale),
  };
});
const controls = await page.locator("#actions").boundingBox();
assert.ok(
  screenParty.y + 22 < controls.y,
  "party remains visible above mobile controls",
);
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  "mobile overflow",
);
// Travel beyond the original map using the navigator, handle encounters, and find a hidden stash.
while ((await state()).food < 15) await click("Forage · +6 rations / 1 day");
const atlasClick = async (x, y) => {
  const r = await page.locator("#atlas").boundingBox();
  await page.mouse.click(
    r.x + (x / 1536) * r.width,
    r.y + (y / 864) * r.height,
  );
};
for (let attempt = 0; attempt < 8; attempt++) {
  await atlasClick(350, 620);
  await page.waitForFunction(
    () => {
      const s = JSON.parse(localStorage.getItem("pixel-tales"));
      return !s.destination || s.event;
    },
    {},
    { timeout: 20000 },
  );
  const s = await state();
  if (!s.event) break;
  if (
    await page
      .getByRole("button", { name: "Walk away", exact: true })
      .isVisible()
  )
    await click("Walk away");
  else await click("Take shelter · 1 day");
}
assert.equal(
  (await state()).location,
  10,
  "navigator reaches the hidden stash beyond the old map",
);
assert.ok((await state()).discovered.includes(10));
const goldBeforeStash = (await state()).gold;
await click("Explore · knowledge & materials");
assert.equal((await state()).gold, goldBeforeStash + 30);
const charted = (await state()).charted;
await page.reload();
assert.deepEqual((await state()).charted, charted);
await page.screenshot({ path: "/tmp/pixel-tales-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: "/tmp/pixel-tales-desktop.png", fullPage: true });
assert.deepEqual(errors, []);
console.log(
  "PASS: free walking, redirection, stop/reload, browser-driven combat victory, exploration, research, crafting, roadside choice, recruitment, delivery, save/reload, mobile layout, caravan trading, navigator travel, hidden stash discovery, persistent charting, aimed shots, specialization learning, profession reassignment, and fieldwork ranks; no JS errors.",
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
  .getByRole("button", { name: "Visit Contract board", exact: true })
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
