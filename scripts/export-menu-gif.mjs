// Optional art export: requires Playwright, Chromium and FFmpeg.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const temporary = await mkdtemp(join(tmpdir(), "pixel-menu-gif-"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3002/");
  await page.waitForFunction(() => document.querySelector("#menu-scene").dataset.animating === "true");
  await page.evaluate(() => document.fonts.ready);
  const panel = page.locator("#menu-content");
  const bounds = await panel.boundingBox();
  const image = join(temporary, "menu-panel.png");
  await panel.screenshot({ path: image });
  const filter = `[0:v][1:v]overlay=${Math.round(bounds.x)}:${Math.round(bounds.y)}:shortest=1,scale=1280:720:flags=lanczos,fps=24,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`;
  const output = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", "assets/main-menu-loop.mp4", "-loop", "1", "-i", image, "-filter_complex", filter, "-t", "8", "-loop", "0", "docs/screenshots/main-menu-animation.gif"], { stdio: "inherit" });
  if (output.status !== 0) throw new Error("GIF export failed");
  console.log("Exported the full animated menu, including its real title and controls.");
} finally {
  await browser.close();
  await rm(temporary, { recursive: true, force: true });
}
