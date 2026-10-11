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
