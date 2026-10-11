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
  const fixture = fresh();
  fixture.gold = 240;
  fixture.renown = 5;
  fixture.knowledge = 9;
  fixture.inventory.ore = 20;
  fixture.inventory.wood = 8;
  fixture.party[0].weapon = 2;
  await seed(fixture);
  await click("Visit Blacksmith");
  await click("Buy Road sword · 32 crowns");
  await click("Buy Padded vest · 28 crowns");
  assert.equal((await state()).gear.length, 2);
  await click("Equipment");
  await click("Equip Road sword");
  await click("Equip Padded vest");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("ATK 11 · Armor 1"),
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Sell Road sword · 12 crowns", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel("Equipment companion").selectOption("1");
  await click("Transfer Padded vest");
  let s = await state();
  assert.equal(s.party[0].equipment.armor, null);
  assert.equal(s.party[1].equipment.armor, 2);
  await page.getByLabel("Equipment companion").selectOption("2");
  assert.equal(
    await page
      .getByRole("button", { name: "Transfer Road sword", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel("Equipment companion").selectOption("1");
  await click("Unequip Padded vest");
  await click("Sell Padded vest · 11 crowns");
  assert.equal((await state()).gear.length, 1);
  await click("Research");
  for (const name of ["Tempered steel", "Armorer's craft"]) {
    await page
      .locator(".card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) })
      .getByRole("button", { name: "Research", exact: true })
      .click();
  }
  assert.ok((await state()).research.includes("armorer"));
  await click("Workshop");
  await click("Craft Tempered sword");
  s = await state();
  assert.equal(s.inventory.ore, 15);
  assert.equal(s.inventory.wood, 6);
  assert.equal(s.party[0].professionXP, 2);
  await click("Equipment");
  await page.getByLabel("Equipment companion").selectOption("0");
  await click("Equip Tempered sword");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("ATK 14 · Armor 0"),
  );
  await click("Sell Road sword · 12 crowns");
  assert.equal((await state()).gold, 203);
  await click("Enter Greyhaven");
  await click("Visit The Crooked Lantern");
  await click("Recruit companion");
  await click("Back to village");
  await click("Visit Blacksmith");
  await click("Buy Short bow · 32 crowns");
  await click("Equipment");
  await page.getByLabel("Equipment companion").selectOption("2");
  await click("Equip Short bow");
  await page.getByLabel("Equipment companion").selectOption("4");
  await click("Transfer Short bow");
  s = await state();
  assert.equal(s.party[2].equipment.weapon, null);
  assert.equal(s.party[4].equipment.weapon, 4);
  assert.equal(s.gear.length, 2);
  await click("Enter Greyhaven");
  await click("Visit Contract board");
  await page
    .getByRole("button", { name: "Accept contract", exact: true })
    .first()
    .click();
  s = await state();
  s.position = { x: places[1].x, y: places[1].y };
  s.location = 1;
  s.trail = [{ ...s.position }];
  await seed(s);
  await click("Engage raiders");
  await click("Equipment");
  assert.equal(
    await page
      .getByRole("button", { name: "Equip Tempered sword", exact: true })
      .isDisabled(),
    true,
  );
  await click("Close panel");
  await click("Retreat · lose 15 crowns");
  await page.reload();
  await page.waitForSelector("#tabs button");
  s = await state();
  assert.equal(s.party[0].equipment.weapon, 3);
  assert.equal(s.party[4].equipment.weapon, 4);
  await click("Equipment");
  await page.getByLabel("Equipment companion").selectOption("4");
  await page.screenshot({
    path: "/tmp/pixel-tales-equipment-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/pixel-tales-equipment-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await click("New company");
  await click("Equipment");
  assert.ok(
    (await page.locator("#panel").textContent()).includes("No spare gear yet"),
  );
  assert.equal((await state()).party.length, 4);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: buying, equipping, transferring, class restrictions, selling, research and fine crafting, combat restrictions, reload persistence, mobile inventory, and new-company reset; no JS errors.",
  );
} finally {
  await browser.close();
}
