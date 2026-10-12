import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fresh, startBattle, enterDungeon, places } from "../src/game.js";
import { enterGame, dismissReports } from "./smoke-menu.mjs";
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
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.GAME_URL || "http://127.0.0.1:3002/";
  await page.goto(url);
  await page.waitForFunction(() => document.body.dataset.gameArt === "ready");
  await page.evaluate(() => document.fonts.ready);
  // Verify the native atlas paths and actual visible appearance differences.
  const result = await page.evaluate(async () => {
    const art = await import("./src/art.js");
    while (!art.gameArtReady())
      await new Promise((r) => requestAnimationFrame(r));
    const roles = [
      "Swordswoman",
      "Shieldbearer",
      "Archer",
      "Spearman",
      "Wizard",
      "Cleric",
      "Rogue",
      "Druid",
      "Paladin",
    ];
    const picture = (extra) =>
      art.portraitArtwork({
        id: 0,
        role: "Archer",
        coat: "#7f9069",
        sex: "male",
        skin: "#d9b486",
        hair: "#6b4c33",
        hairStyle: "short",
        race: "human",
        ...extra,
      });
    const difference = (a, b) => {
      const aa = a.getContext("2d").getImageData(0, 0, 48, 48).data;
      const bb = b.getContext("2d").getImageData(0, 0, 48, 48).data;
      let count = 0;
      for (let i = 0; i < aa.length; i += 4)
        if (
          aa[i] !== bb[i] ||
          aa[i + 1] !== bb[i + 1] ||
          aa[i + 2] !== bb[i + 2]
        )
          count++;
      return count;
    };
    const base = picture({});
    const changes = Object.fromEntries(
      Object.entries({
        sex: { sex: "female" },
        coat: { coat: "#ba684f" },
        skin: { skin: "#704a38" },
        hair: { hair: "#d3b276" },
        race: { race: "orc" },
        style: { hairStyle: "braid" },
      }).map(([id, opts]) => [id, difference(base, picture(opts))]),
    );
    const gallery = document.createElement("canvas");
    gallery.width = 900;
    gallery.height = 540;
    const c = gallery.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#c6b58b";
    c.fillRect(0, 0, 900, 540);
    for (let i = 0; i < 18; i++) {
      const p = picture({
        role: roles[Math.floor(i / 2)],
        sex: i % 2 ? "female" : "male",
      });
      const x = (i % 6) * 150 + 39,
        y = Math.floor(i / 6) * 145 + 16;
      c.drawImage(p, x, y, 72, 72);
      c.fillStyle = "#453e2c";
      c.font = "12px monospace";
      c.fillText(roles[Math.floor(i / 2)], (i % 6) * 150 + 18, y + 92);
      c.fillText(i % 2 ? "Female" : "Male", (i % 6) * 150 + 18, y + 108);
    }
    for (let i = 0; i < 4; i++) {
      const p = picture({ race: ["human", "elf", "dwarf", "orc"][i] });
      c.drawImage(p, 45 + i * 200, 455, 64, 64);
      c.fillText(["Human", "Elf", "Dwarf", "Orc"][i], 115 + i * 200, 491);
    }
    gallery.id = "art-review";
    gallery.style.cssText =
      "position:fixed;inset:0;z-index:9999;width:900px;height:540px";
    document.body.append(gallery);
    return {
      changes,
      classes: new Set(roles.map((role) => picture({ role }).toDataURL())).size,
    };
  });
  assert.equal(result.classes, 9);
  for (const [name, count] of Object.entries(result.changes))
    assert.ok(
      count > 5,
      `${name} must visibly change the avatar; changed ${count} pixels`,
    );
  await page
    .locator("#art-review")
    .screenshot({ path: "docs/screenshots/art-companions.png" });
  await page.locator("#art-review").evaluate((e) => e.remove());
  const seed = async (s) => {
    await dismissReports(page);
    const menu = page.getByRole("button", { name: "Main menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.evaluate(
      (s) => localStorage.setItem("pixel-tales", JSON.stringify(s)),
      s,
    );
    await page.reload();
    await enterGame(page);
    await page.waitForFunction(() => document.body.dataset.gameArt === "ready");
    await page.waitForTimeout(120);
  };
  const rich = () => {
    const s = fresh();
    s.gold = 500;
    s.food = 200;
    s.knowledge = 30;
    s.inventory.wood = 90;
    for (const p of s.patrols) p.cleared = true;
    return s;
  };
  let s = rich();
  await seed(s);
  await page.screenshot({ path: "docs/screenshots/art-world.png" });
  await page.getByRole("button", { name: "Make camp", exact: true }).click();
  // Close only the drawer so scenery remains accessible, without breaking camp.
  await page.locator("#drawer").evaluate((e) => (e.hidden = true));
  await page.screenshot({ path: "docs/screenshots/art-camp.png" });
  s = rich();
  s.campUpgrades.tents = 2;
  s.campUpgrades.forge = 1;
  s.campUpgrades.cookpot = 1;
  s.campUpgrades.infirmary = 1;
  s.wagon.owned = true;
  await seed(s);
  await page.getByRole("button", { name: "Make camp", exact: true }).click();
  await page.locator("#drawer").evaluate((e) => (e.hidden = true));
  await page.screenshot({ path: "docs/screenshots/art-built-camp.png" });
  s = rich();
  const patrol = s.patrols[0];
  patrol.cleared = false;
  patrol.kind = "bandit";
  patrol.enemyFamily = "shaman";
  patrol.x = s.position.x;
  patrol.y = s.position.y;
  assert.ok(startBattle(s, patrol.id));
  s.battle.layout = "forest";
  s.battle.openingAmbush = false;
  await seed(s);
  await page.screenshot({ path: "docs/screenshots/art-battle.png" });
  s = rich();
  s.position = { x: places[4].x, y: places[4].y };
  s.location = 4;
  enterDungeon(s, 4);
  await seed(s);
  await page.screenshot({ path: "docs/screenshots/art-dungeon.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  s = rich();
  await seed(s);
  await page.getByRole("button", { name: "Company", exact: true }).click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "docs/screenshots/art-company-mobile.png" });
  // Embedded textures must work when the game is opened directly from a ZIP.
  const offline = await browser.newPage();
  offline.on("pageerror", (e) => errors.push(e.message));
  // This managed Chromium blocks file:// navigation. Exercise the same
  // standalone HTML/bundle with all external requests blocked instead.
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8")
    .replace(
      '<link rel="stylesheet" href="style.css" />',
      () =>
        `<style>${readFileSync(new URL("../style.css", import.meta.url), "utf8")}</style>`,
    )
    .replace(
      /<script\s+src="game.bundle.js"[\s\S]*?<\/script>/,
      () =>
        `<script>${readFileSync(new URL("../game.bundle.js", import.meta.url), "utf8")}</script>`,
    );
  await offline.route("**/*", (route) => route.abort());
  await offline.setContent(html);
  await offline.waitForFunction(
    () => document.body.dataset.gameArt === "ready",
  );
  await enterGame(offline);
  assert.equal(await offline.locator("#boot-status").isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(
    `PASS: nine classes, male/female and coat/skin/hair/race/style customization (${JSON.stringify(result.changes)}), world, built camp, enemies, battle cover, direct dungeon tiles, mobile layout and embedded sprite rendering with external requests blocked; no browser errors.`,
  );
} finally {
  await browser.close();
}
