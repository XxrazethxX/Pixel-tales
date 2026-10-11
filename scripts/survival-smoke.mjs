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
  });
  const errors = [];
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
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  const s = fresh();
  s.location = -1;
  s.position = { x: 600, y: 480 };
  s.gold = 400;
  s.inventory = { ore: 40, wood: 60, herbs: 20, medicine: 1, pelts: 0 };
  s.food = 40;
  s.party[0].hp = 3;
  await seed(s);
  await click("Make camp");
  assert.equal((await state()).campOpen, true);
  assert.ok(
    (await page.locator("#panel").textContent()).includes("Sleeping tents"),
  );
  const paused = (await state()).timeOfDay;
  await page.waitForTimeout(350);
  assert.equal((await state()).timeOfDay, paused);
  for (const name of [
    "Sleeping tents",
    "Cookpot",
    "Portable forge",
    "Watch post",
    "Medicine tent",
  ])
    await click(`Build ${name}`);
  await click("Upgrade Sleeping tents");
  assert.equal((await state()).campUpgrades.tents, 2);
  assert.equal((await state()).timeOfDay, paused + 12);
  await click("Rest until dawn");
  assert.equal((await state()).day, 2);
  assert.equal((await state()).timeOfDay, 8);
  assert.equal((await state()).party[0].hp, 28);
  await click("View camp");
  await page.screenshot({ path: "/tmp/pixel-camp-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-camp-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await click("Return to camp menu");
  await click("Break camp");
  assert.equal((await state()).campOpen, false);
  await page.reload();
  assert.equal((await state()).campUpgrades.forge, 1);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const light = async (hour) => {
    const fixture = fresh();
    fixture.location = -1;
    fixture.position = { x: 600, y: 480 };
    fixture.timeOfDay = hour;
    await seed(fixture);
    await page.waitForTimeout(120);
    assert.ok(
      (await page.locator("#clock-label").textContent()).includes(
        hour === 12 ? "Daylight" : "Night",
      ),
    );
    const brightness = await page.evaluate(() => {
      const canvas = document.querySelector("#map");
      const ctx = canvas.getContext("2d");
      const data = ctx.getImageData(500, 500, 100, 100).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4)
        sum += data[i] + data[i + 1] + data[i + 2];
      return sum / (data.length / 4);
    });
    await page.screenshot({
      path: `/tmp/pixel-${hour === 12 ? "day" : "night"}.png`,
    });
    return brightness;
  };
  const day = await light(12),
    night = await light(21);
  assert.ok(night < day * 0.85, `night=${night} day=${day}`);
  const hungry = fresh();
  hungry.location = -1;
  hungry.position = { x: 600, y: 480 };
  hungry.food = 0;
  hungry.timeOfDay = 23.98;
  hungry.party[0].hp = 2;
  await seed(hungry);
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem("pixel-tales")).day === 2,
  );
  assert.equal((await state()).hungerDays, 1);
  assert.equal((await state()).party[0].dead, true);
  assert.equal(await page.locator("#survival-warning").isVisible(), true);
  await click("Company");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("Died of starvation"),
  );
  await page.reload();
  assert.equal((await state()).party[0].dead, true);
  const wolves = fresh();
  wolves.location = -1;
  const pack = wolves.patrols.find((p) => p.id === "pine-wolves");
  wolves.position = { x: pack.x, y: pack.y };
  await seed(wolves);
  await click("Confront Pinewatch wolf pack");
  assert.ok((await state()).battle.enemies.every((e) => e.kind === "wolf"));
  await page.screenshot({ path: "/tmp/pixel-wolves.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: expandable camp, paused planning, timed construction, dawn recovery, portable upgrades and reload, mobile layout, clock and darker night lighting, starvation warning and permanent death, and roaming wolf combat; no JS errors.",
  );
} finally {
  await browser.close();
}
