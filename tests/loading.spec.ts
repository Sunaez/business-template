import { test, expect } from "@playwright/test";

test("secondary photos load on hover and search drawers restore keyboard focus", async ({
  page,
}) => {
  await page.goto("/shop");
  const card = page.locator(".product-card").first();
  await expect(card.locator(".product-card__image--secondary")).toHaveCount(0);
  await card.locator(".product-card__image-link").hover();
  await expect(card.locator(".product-card__image--secondary")).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Search products",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const search = page.getByRole("dialog", {
    name: "Find your everyday essentials",
  });
  await expect(search).toBeVisible();
  await search.getByRole("textbox", { name: "Search products" }).fill("hoodie");
  await expect(search.locator(".predictive-product")).toContainText(
    "Core Zip Hoodie",
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("mobile account sections expose order and stock actions without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/account/admin");
  const sections = page.getByRole("combobox", { name: "Account section" });
  for (const section of ["orders", "inventory", "customers"]) {
    await sections.selectOption(section);
    await expect(page.locator(".account-table tbody tr").first()).toBeVisible();
    expect(
      await page
        .locator(".account-table-scroll")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBeTruthy();
  }
  await sections.selectOption("inventory");
  await page
    .getByRole("button", { name: "Adjust stock for Heavyweight Box Tee" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Adjust stock" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Adjust stock for Heavyweight Box Tee" }),
  ).toBeFocused();
  await page.goto("/account/customer");
  await page
    .getByRole("combobox", { name: "Account section" })
    .selectOption("details");
  await expect(page.getByLabel("Email address", { exact: true })).toBeVisible();
});
