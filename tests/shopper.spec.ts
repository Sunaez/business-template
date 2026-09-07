import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function chooseTee(page: Page) {
  await page.goto("/product/heavyweight-box-tee");
  await page.getByRole("button", { name: "Size: M", exact: true }).click();
}

test("stock is enforced, the bag survives refresh, and items can be removed", async ({
  page,
}) => {
  await chooseTee(page);
  await expect(
    page.getByRole("button", { name: /Size: L.*unavailable/ }),
  ).toBeDisabled();
  await expect(page.locator(".product-stock")).toContainText("Only 4 left");
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Increase quantity", exact: true })
      .click();
  await expect(
    page.getByRole("button", { name: "Increase quantity", exact: true }),
  ).toBeDisabled();
  await page.locator(".product-add-button:visible").click();
  const drawer = page.getByRole("dialog", {
    name: "Your bag (4)",
    exact: true,
  });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".cart-summary-row")).toContainText("£136");
  await drawer
    .getByRole("link", { name: "View your bag", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cart$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your bag (4)", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cart-page__items .cart-line")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Remove Heavyweight Box Tee from bag",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your next everyday essential is waiting.",
    }),
  ).toBeVisible();
});

test("variant price overrides carry through demo checkout and confirmation", async ({
  page,
}) => {
  await page.goto("/product/studio-canvas-tote");
  await page
    .getByRole("button", { name: "Pack size: Pair", exact: true })
    .click();
  await expect(page.locator(".product-detail__price:visible")).toContainText(
    "£42",
  );
  await page.getByRole("button", { name: "Buy now", exact: false }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page
    .getByLabel("Email address", { exact: true })
    .fill("shopper@example.com");
  await page.getByLabel("Full name", { exact: true }).fill("Alex Example");
  await page.getByLabel("Address", { exact: true }).fill("42 Demo Street");
  await page.getByLabel("City", { exact: true }).fill("London");
  await page.getByLabel("Postcode", { exact: true }).fill("SW1A 1AA");
  await page.getByRole("radio", { name: /Express delivery/ }).check();
  await expect(
    page.locator(".checkout-summary .cart-summary-total"),
  ).toContainText("£49.95");
  await page
    .getByRole("button", { name: "Place demo order", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your demo order is saved." }),
  ).toBeVisible();
  await expect(page.locator(".order-confirmation__details")).toContainText(
    "£49.95",
  );
  await expect(
    page.getByText("Amount charged: £0", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your demo order is saved." }),
  ).toBeVisible();
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", {
      name: "Your next everyday essential is waiting.",
    }),
  ).toBeVisible();
});

test("filters, sorting, and search operate on the actual catalogue", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(page.locator(".catalog-toolbar__count")).toHaveText("12 pieces");
  await page.getByLabel("Sort by", { exact: true }).selectOption("price-asc");
  await expect(page.locator(".product-card h3").first()).toHaveText(
    "Studio Canvas Tote",
  );
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Find your pieces" });
  await drawer.getByLabel("In stock", { exact: true }).check();
  await drawer.getByLabel("To", { exact: true }).fill("35");
  await drawer.getByRole("button", { name: /Show \d+ pieces/ }).click();
  await expect(page.locator(".catalog-toolbar__count")).toHaveText("4 pieces");
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator(".catalog-toolbar__count")).toHaveText("12 pieces");
  await page.goto("/search?q=hoodie");
  await expect(page.locator(".product-card h3")).toHaveText([
    "Core Zip Hoodie",
  ]);
  await page.goto("/search?q=nonexistentxyz");
  await expect(
    page.getByRole("heading", { name: "A fresh start?", exact: true }),
  ).toBeVisible();
});

test("mobile menu, filters, gallery and sticky purchase controls work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Explore", exact: true });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Shop all", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const filters = page.getByRole("dialog", { name: "Find your pieces" });
  await filters.getByLabel("Black", { exact: true }).check();
  await filters.getByRole("button", { name: /Show/ }).click();
  await expect(
    page.getByRole("button", { name: "Remove Colour: Black filter" }),
  ).toBeVisible();
  await page.goto("/product/heavyweight-box-tee");
  await page
    .locator(".product-mobile-purchase")
    .getByRole("button", { name: "Select size" })
    .click();
  await expect(
    page.getByRole("button", { name: "Size: M", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Size: M", exact: true }).click();
  await page
    .getByRole("button", { name: "Next product image", exact: true })
    .click();
  await expect(page.locator(".product-gallery__counter")).toHaveText("02 / 03");
  await page
    .locator(".product-mobile-purchase")
    .getByRole("button", { name: "Add to bag" })
    .click();
  const cart = page.getByRole("dialog", { name: "Your bag (1)" });
  await expect(cart).toBeVisible();
  await cart.getByRole("link", { name: "Checkout", exact: true }).click();
  await expect(page.getByLabel("Email address", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("recently viewed products follow browsing history", async ({ page }) => {
  await page.goto("/product/heavyweight-box-tee");
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("storefront:demo-brand:recent:v1"),
      ),
    )
    .toContain("box-tee");
  await page.goto("/product/core-zip-hoodie");
  await expect(page.locator(".recently-viewed .product-card h3")).toHaveText([
    "Heavyweight Box Tee",
  ]);
});

test("unavailable releases cannot be purchased and malformed cart data is discarded", async ({
  page,
}) => {
  await page.goto("/product/transit-jacket");
  await expect(page.locator(".product-add-button:visible")).toBeDisabled();
  await expect(page.locator(".product-add-button:visible")).toHaveText(
    /Coming soon/,
  );
  await page.evaluate(() =>
    localStorage.setItem(
      "storefront:demo-brand:cart:v1",
      JSON.stringify([
        { productId: "box-tee", variantId: "box-tee-black-l", quantity: 2 },
        { productId: "foreign", variantId: "fake", quantity: 1 },
      ]),
    ),
  );
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", {
      name: "Your next everyday essential is waiting.",
    }),
  ).toBeVisible();
});

test("core layouts fit phone, tablet and desktop widths", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/shop",
      "/product/heavyweight-box-tee",
      "/contact",
      "/size-guide",
    ]) {
      await page.goto(path);
      await expect(page.locator("main")).toHaveCount(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${path} at ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
  }
});

test("essential routes and local product imagery are present", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/shop",
    "/collections/new-arrivals",
    "/product/heavyweight-box-tee",
    "/search",
    "/cart",
    "/checkout",
    "/order-confirmation",
    "/account",
    "/about",
    "/contact",
    "/size-guide",
    "/shipping-returns",
    "/privacy",
    "/terms",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("home, product and mobile drawer pass automated accessibility checks", async ({
  page,
}) => {
  for (const path of ["/", "/product/heavyweight-box-tee", "/contact"]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Explore", exact: true }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
});

test("alternate colour photography and keyboard gallery navigation work", async ({
  page,
}) => {
  await chooseTee(page);
  await page
    .getByRole("button", { name: "Colour: White", exact: true })
    .click();
  await expect(page.locator(".product-gallery__counter:visible")).toHaveText(
    "03 / 03",
  );
  const gallery = page.getByRole("region", {
    name: "Heavyweight Box Tee image gallery",
  });
  await gallery.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".product-gallery__counter:visible")).toHaveText(
    "02 / 03",
  );
});
