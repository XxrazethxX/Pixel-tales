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
