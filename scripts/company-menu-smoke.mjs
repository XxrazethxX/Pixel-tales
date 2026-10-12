import assert from "node:assert/strict";
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
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:3001/");
  assert.equal(
    await page
      .getByRole("button", { name: "Continue", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(await state(), null);
  assert.equal(await page.evaluate(async () => {
    const image = new Image();
    image.src = new URL("assets/main-menu-camp.png", location.href).href;
    await image.decode();
    return image.naturalWidth > 1000;
  }), true);
  await page.getByRole("button", { name: "Credits", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.match(await page.locator("#menu-content h2").textContent(), /Credits/);
  await click("Back");
  await page.screenshot({ path: "/tmp/pixel-title-desktop.png" });
  await click("Credits");
  assert.match(await page.locator("#menu-content").textContent(), /original AI-generated/);
  await click("Back");
  await click("Quit");
  assert.match(await page.locator("#menu-content").textContent(), /close this browser tab/);
  await click("Return to menu");
  await click("New Company");
  await page
    .getByLabel("Company name", { exact: true })
    .fill("The Silver Foxes");
  await page.getByLabel("Company banner", { exact: true }).selectOption("wine");
  await page
    .getByLabel("Starting background", { exact: true })
    .selectOption("veterans");
  await page.getByLabel("Founder 1 name", { exact: true }).fill("Rowan");
  await page
    .getByLabel("Founder 1 class", { exact: true })
    .selectOption("Archer");
  await page
    .getByLabel("Founder 1 profession", { exact: true })
    .selectOption("Herbalist");
  await page
    .getByLabel("Founder 1 trait", { exact: true })
    .selectOption("mercenary");
  await page
    .getByLabel("Founder 3 trait", { exact: true })
    .selectOption("hearty");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByLabel("Founder 1 name", { exact: true })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/pixel-creator-mobile.png" });
  await click("Begin adventure");
  let s = await state();
  assert.equal(s.companyName, "The Silver Foxes");
  assert.equal(s.banner, "wine");
  assert.equal(s.gold, 70);
  assert.equal(s.renown, 5);
  assert.equal(s.party[0].name, "Rowan");
  assert.equal(s.party[0].role, "Archer");
  assert.equal(s.party[0].damage, 7);
  assert.equal(s.party[0].level, 2);
  assert.equal(s.party[2].max, 32);
  await click("Main menu");
  const paused = await state();
  await page.waitForTimeout(1200);
  assert.deepEqual(await state(), paused);
  await click("Load Game");
  await click("Save to slot 1");
  assert.equal(
    await page
      .getByRole("button", { name: "Load slot 1", exact: true })
      .isEnabled(),
    true,
  );
  await click("Back");
  await click("Settings");
  await page.getByLabel("Larger interface text", { exact: true }).check();
  await page.getByLabel("Reduced motion", { exact: true }).check();
  await page.getByLabel("Longer exploration days", { exact: true }).check();
  await click("Back");
  await click("New Company");
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Cancelled Company");
  await click("Cancel");
  assert.equal((await state()).companyName, "The Silver Foxes");
  await click("New Company");
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Trading Company");
  await page
    .getByLabel("Starting background", { exact: true })
    .selectOption("traders");
  page.once("dialog", (d) => d.dismiss());
  await click("Begin adventure");
  assert.equal((await state()).companyName, "The Silver Foxes");
  page.once("dialog", (d) => d.accept());
  await click("Begin adventure");
  assert.equal((await state()).gold, 180);
  await click("Main menu");
  await click("Load Game");
  page.once("dialog", (d) => d.accept());
  await click("Load slot 1");
  assert.equal((await state()).companyName, "The Silver Foxes");
  await page.reload();
  assert.equal(
    await page
      .getByRole("button", { name: "Continue", exact: true })
      .isEnabled(),
    true,
  );
  const before = await state();
  await page.waitForTimeout(300);
  assert.deepEqual(await state(), before);
  await click("Continue");
  assert.equal((await state()).party[0].name, "Rowan");
  assert.equal(
    await page.evaluate(() => document.body.classList.contains("large-text")),
    true,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await click("Main menu");
  await page.screenshot({ path: "/tmp/pixel-title-mobile.png" });
  const unavailable = await browser.newPage();
  unavailable.on("pageerror", (e) => errors.push(e.message));
  await unavailable.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    }),
  );
  await unavailable.goto(process.env.GAME_URL || "http://127.0.0.1:3001/");
  await unavailable
    .getByRole("button", { name: "New Company", exact: true })
    .click();
  await unavailable
    .getByRole("button", { name: "Begin adventure", exact: true })
    .click();
  await unavailable
    .getByRole("button", { name: "Main menu", exact: true })
    .click();
  assert.equal(
    await unavailable
      .getByRole("button", { name: "Continue", exact: true })
      .isEnabled(),
    true,
  );
  await unavailable.getByRole("button", { name: "Load Game", exact: true }).click();
  await unavailable
    .getByRole("button", { name: "Save to slot 1", exact: true })
    .click();
  assert.match(
    await unavailable.locator("#menu-message").textContent(),
    /not saved/,
  );
  await unavailable.getByRole("button", { name: "Back", exact: true }).click();
  await unavailable
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  const corrupt = await browser.newPage();
  corrupt.on("pageerror", (e) => errors.push(e.message));
  await corrupt.goto(process.env.GAME_URL || "http://127.0.0.1:3001/");
  await corrupt.evaluate(() =>
    localStorage.setItem("pixel-tales", JSON.stringify({ invalid: true })),
  );
  await corrupt.reload();
  assert.equal(
    await corrupt
      .getByRole("button", { name: "Continue", exact: true })
      .isDisabled(),
    true,
  );
  assert.deepEqual(
    await corrupt.evaluate(() =>
      JSON.parse(localStorage.getItem("pixel-tales")),
    ),
    { invalid: true },
  );
  assert.deepEqual(errors, []);
  console.log(
    "Company menu browser smoke passed: fresh title, customization, real origin/trait effects, paused menus, manual saves, cancellation, new-company replacement, slot loading, Continue, persisted settings and mobile layout.",
  );
} finally {
  await browser.close();
}
