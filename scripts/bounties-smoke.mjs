import { enterGame } from "./smoke-menu.mjs";
import assert from "node:assert/strict";
import {
  fresh,
  places,
  namedAdversaries,
  acceptBounty,
  startBattle,
} from "../src/game.js";
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
    await enterGame(page);
    await page.waitForSelector("#tabs button");
  };
  const arrive = (s, i) => {
    s.location = i;
    s.position = { x: places[i].x, y: places[i].y };
    return s;
  };
  const tile = async (x, y) => {
    const p = await page.locator("#map").evaluate(
      (c, { x, y }) => {
        const r = c.getBoundingClientRect();
        return {
          x:
            r.x +
            (136 + x * 62 - Number(c.dataset.viewX)) * Number(c.dataset.scale),
          y:
            r.y +
            (28 + y * 60 - Number(c.dataset.viewY)) * Number(c.dataset.scale),
        };
      },
      { x, y },
    );
    await page.mouse.click(p.x, p.y);
  };
  const fight = (id) => {
    const s = fresh(),
      b = namedAdversaries.find((b) => b.id === id);
    s.renown = b.minRenown;
    arrive(s, b.issuer);
    assert.equal(acceptBounty(s, id), true);
    arrive(s, b.target);
    assert.equal(startBattle(s), true);
    return s;
  };
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3000/");
  await enterGame(page);
  const s = fresh();
  s.renown = 5;
  await seed(s);
  await click("Visit Contract board");
  await click("Accept bounty: Rook the Tollkeeper");
  assert.equal((await state()).contract.bossId, "rook");
  const mission = await state();
  arrive(mission, 2);
  await seed(mission);
  await click("Challenge Rook the Tollkeeper");
  assert.equal((await state()).battle.enemies[0].name, "Rook the Tollkeeper");
  await page.screenshot({ path: "/tmp/pixel-bounty-rook.png" });
  const win = await state();
  win.battle.enemies.forEach((e) => (e.hp = 0));
  Object.assign(win.battle.enemies[0], { hp: 1, x: 2, y: 1, armor: 0 });
  await seed(win);
  await tile(2, 1);
  assert.ok((await state()).bounties.rook);
  assert.equal((await state()).contract, null);
  const done = await state();
  arrive(done, 0);
  await seed(done);
  await click("Visit Contract board");
  assert.equal(
    await page
      .getByRole("button", {
        name: "Rook the Tollkeeper defeated",
        exact: true,
      })
      .isDisabled(),
    true,
  );
  await page.reload();
  await enterGame(page);
  assert.ok((await state()).bounties.rook);
  await seed(fight("ashfang"));
  assert.equal(
    (await state()).battle.enemies.filter((e) => e.kind === "wolf").length,
    4,
  );
  const fire = fight("maela");
  fire.battle.layoutId = "forest-edge";
  fire.battle.units.forEach((u, i) => {
    if (i) fire.party[i].hp = 0;
  });
  Object.assign(fire.battle.units[0], { x: 3, y: 3 });
  fire.party[0].armor = 100;
  fire.battle.enemies.forEach((e, i) => {
    if (i) e.hp = 0;
  });
  Object.assign(fire.battle.enemies[0], { x: 6, y: 3, damage: 1 });
  await seed(fire);
  await click("End round 1");
  assert.ok((await state()).battle.danger);
  assert.match(await page.locator("#objective").textContent(), /FIRE INCOMING/);
  const marked = await state();
  await page.reload();
  await enterGame(page);
  assert.ok((await state()).battle.danger);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/pixel-bounty-fire-mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(150);
  await tile(1, 3);
  assert.equal((await state()).battle.units[0].x, 1);
  await click("End round 2");
  const interrupted = structuredClone(marked);
  interrupted.battle.enemies[0].stun = 1;
  await seed(interrupted);
  assert.doesNotMatch(
    await page.locator("#objective").textContent(),
    /FIRE INCOMING/,
  );
  await click("End round 2");
  assert.equal((await state()).battle.danger, null);
  const abandoned = await state();
  abandoned.battle = null;
  arrive(abandoned, 6);
  await seed(abandoned);
  await click("Visit Contract board");
  await click("Abandon bounty");
  assert.equal((await state()).contract, null);
  assert.deepEqual(errors, []);
  console.log(
    "Bounty browser smoke passed: board acceptance, challenge, unique victory, persistence, pack composition, fire warning, movement, interruption, mobile layout and abandonment.",
  );
} finally {
  await browser.close();
}
