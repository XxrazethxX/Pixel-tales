// Existing gameplay checks now enter through the same title menu as players.
export async function enterGame(page) {
  await page.getByRole("button", { name: "Continue", exact: true }).waitFor();
  if (
    await page
      .getByRole("button", { name: "Continue", exact: true })
      .isEnabled()
  ) {
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  } else {
    await page
      .getByRole("button", { name: "New Company", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Begin adventure", exact: true })
      .click();
  }
}
export async function exploreSite(page) {
  const stash = page.getByRole("button", {
    name: "Enter Forgotten Stash",
    exact: true,
  });
  if (await stash.count()) {
    await stash.click();
    await page.getByRole("button", { name: "Search 4,2", exact: true }).click();
    for (const value of ["2", "4", "1"]) {
      await page.getByRole("slider", { name: "Lockpick dial" }).fill(value);
      await page
        .getByRole("button", { name: "Test tension", exact: true })
        .click();
    }
    await page.getByRole("button", { name: "Leave site", exact: true }).click();
  } else
    await page
      .getByRole("button", {
        name: "Explore · knowledge & materials",
        exact: true,
      })
      .click();
}

// Existing playthroughs acknowledge the new report before continuing their flow.
export async function dismissReports(page) {
  const button = page.getByRole("button", {
    name: "Continue adventure",
    exact: true,
  });
  if (await button.isVisible()) await button.click();
}
export async function gameClick(page, name) {
  if (name !== "Continue adventure") await dismissReports(page);
  const visible = page.getByRole("button", { name, exact: true });
  const target = (await visible.count())
    ? visible.first()
    : page
        .getByRole("button", { name, exact: true, includeHidden: true })
        .first();
  if ((await target.count()) && !(await target.isVisible())) {
    const category = await target.evaluate(
      (el) => el.closest("[data-camp-category]")?.dataset.campCategory,
    );
    if (category)
      await page.getByRole("button", { name: category, exact: true }).click();
    await target.evaluate((el) => {
      for (let p = el.parentElement; p; p = p.parentElement)
        if (p.tagName === "DETAILS") p.open = true;
    });
  }
  await target.click();
}
export async function openDetails(page, label) {
  await dismissReports(page);
  const summary = page.locator("summary").filter({ hasText: label }).first();
  if ((await summary.count()) && !(await summary.isVisible())) {
    const category = await summary.evaluate(
      (el) => el.closest("[data-camp-category]")?.dataset.campCategory,
    );
    if (category)
      await page.getByRole("button", { name: category, exact: true }).click();
    await summary.evaluate((el) => {
      for (let p = el.parentElement.parentElement; p; p = p.parentElement)
        if (p.tagName === "DETAILS") p.open = true;
    });
  }
  if (!(await summary.evaluate((el) => el.parentElement.open)))
    await summary.click();
}
