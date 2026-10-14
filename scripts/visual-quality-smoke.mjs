import assert from "node:assert/strict";
import { fresh, places } from "../src/game.js";
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
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  const review = await page.evaluate(async () => {
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
    const frame = (role, sex, step) => {
      const c = document.createElement("canvas");
      c.width = 40;
      c.height = 44;
      art.drawCharacter(c.getContext("2d"), 20, 20, "#7f9069", step, role, 0, {
        sex,
        race: "human",
      });
      return c;
    };
    const delta = (a, b, ymax = 44) => {
      const aa = a.getContext("2d").getImageData(0, 0, 40, ymax).data,
        bb = b.getContext("2d").getImageData(0, 0, 40, ymax).data;
      return aa.reduce((n, v, i) => n + Number(v !== bb[i]), 0);
    };
    const checks = [];
    const sheet = document.createElement("canvas");
    sheet.id = "quality-gait-sheet";
    sheet.width = 1020;
    sheet.height = 756;
    const g = sheet.getContext("2d");
    g.fillStyle = "#d3c39b";
    g.fillRect(0, 0, sheet.width, sheet.height);
    g.imageSmoothingEnabled = false;
    for (let i = 0; i < 18; i++) {
      const role = roles[Math.floor(i / 2)],
        sex = i % 2 ? "female" : "male",
        base = frame(role, sex, 0),
        limit = ["Wizard", "Cleric", "Druid"].includes(role) ? 34 : 27;
      for (let j = 0; j < 5; j++) {
        const step = j - 2,
          pose = frame(role, sex, step);
        if (delta(base, pose, limit) !== 0)
          throw Error(`Moving torso or detached hip: ${role} ${sex} ${step}`);
        if (step && delta(base, pose) === 0)
          throw Error(`Missing gait pose: ${role} ${sex}`);
        const b = base.getContext("2d").getImageData(5, limit, 30, 2).data,
          p = pose.getContext("2d").getImageData(5, limit, 30, 2).data;
        for (let row = 0; row < 2; row++) {
          let before = 0,
            after = 0;
          for (let x = 8; x < 22; x++) {
            before += b[(row * 30 + x) * 4 + 3] > 20;
            after += p[(row * 30 + x) * 4 + 3] > 20;
          }
          if (before && !after) throw Error(`Empty hip seam: ${role} ${sex}`);
        }
        const x = (i % 3) * 340 + j * 64 + 8,
          y = Math.floor(i / 3) * 126 + 25;
        g.drawImage(pose, x, y, 64, 70);
        g.fillStyle = "#534a36";
        g.font = "11px monospace";
        g.fillText(String(step), x + 27, y + 85);
      }
      g.font = "12px monospace";
      g.fillText(
        `${role} · ${sex}`,
        (i % 3) * 340 + 9,
        Math.floor(i / 3) * 126 + 17,
      );
      checks.push(`${role} ${sex}`);
    }
    for (const plot of art.worldCropPlots) {
      for (const p of [
        { x: 170, y: 280 },
        { x: 590, y: 355 },
        { x: 1110, y: 600 },
        { x: 120, y: 510 },
      ])
        if (
          plot.x < p.x + 65 &&
          plot.x + plot.w > p.x - 65 &&
          plot.y < p.y + 60 &&
          plot.y + plot.h > p.y - 60
        )
          throw Error("Crop parcel intersects building clearance");
    }
    // Wolf body stays connected to its legs: upper body pixels never shift sideways.
    const wolf = (step) => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      art.drawWolf(c.getContext("2d"), 32, 28, step);
      return c;
    };
    const a = wolf(0).getContext("2d").getImageData(0, 0, 64, 32).data;
    for (const step of [-1, -0.5, 0.5, 1]) {
      const b = wolf(step).getContext("2d").getImageData(0, 0, 64, 32).data;
      if (a.some((v, i) => v !== b[i]))
        throw Error("Wolf torso shifts during stride");
    }
    sheet.style =
      "position:fixed;inset:0;z-index:99999;width:1020px;height:756px";
    document.body.append(sheet);
    return checks;
  });
  assert.equal(review.length, 18);
  await page
    .locator("#quality-gait-sheet")
    .screenshot({ path: "docs/screenshots/quality-walking-poses.png" });
  await page.locator("#quality-gait-sheet").evaluate((e) => e.remove());
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
  };
  let s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  s.location = 13;
  s.position = { x: places[13].x, y: places[13].y };
  s.discovered.push(13);
  await seed(s);
  await page.screenshot({ path: "docs/screenshots/quality-farm.png" });
  // A paused company must not animate its legs or accidentally move its wagon.
  s = fresh();
  s.patrols.forEach((p) => (p.cleared = true));
  s.location = -1;
  s.position = { x: 300, y: 390 };
  await seed(s);
  await page.getByRole("button", { name: "Pause travel", exact: true }).click();
  const before = await page.locator("#map").evaluate((c) => c.toDataURL());
  await page.waitForTimeout(300);
  assert.equal(
    await page.locator("#map").evaluate((c) => c.toDataURL()),
    before,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/screenshots/quality-world-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 90 male/female walking poses across nine classes, fixed hip seams/upper bodies, four connected wolf poses, crop/building clearance, farm view, paused animation and mobile layout; no browser errors.",
  );
} finally {
  await browser.close();
}
