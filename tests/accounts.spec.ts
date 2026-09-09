import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("demo roles share order updates while customers see only their own orders", async ({
  page,
}) => {
  await page.goto("/account");
  await page.getByRole("link", { name: /Explore admin/ }).click();
  await page.getByRole("button", { name: "Manage order NF-1047" }).click();
  const order = page.getByRole("dialog", { name: "Order NF-1047" });
  await order
    .getByRole("combobox", { name: "Order status", exact: true })
    .selectOption("Delivered");
  await order.getByRole("button", { name: "Save order status" }).click();
  await expect(page.getByRole("status")).toContainText("updated to delivered");
  await page.getByRole("link", { name: "Switch account" }).click();
  await page.getByRole("link", { name: /Explore customer/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Welcome back, Alex.",
  );
  await expect(page.locator(".account-order-card")).toContainText("Delivered");
  await page
    .getByRole("navigation", { name: "Customer sections" })
    .getByRole("button", { name: /My orders/ })
    .click();
  await expect(page.locator(".account-order-card")).toHaveCount(3);
  await expect(page.locator(".account-order-card")).not.toContainText([
    "NF-1048",
    "NF-1046",
    "NF-1045",
  ]);
  await expect(
    page.getByRole("button", { name: "Inventory", exact: true }),
  ).toHaveCount(0);
  await page
    .locator(".account-order-card")
    .first()
    .getByRole("button", { name: "View order" })
    .click();
  await expect(page.getByRole("dialog").getByRole("combobox")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".account-order-card")).toContainText("Dispatched");
});

test("wishlist, addresses and preferences can be explored without real accounts", async ({
  page,
}) => {
  await page.goto("/account/customer");
  const nav = page.getByRole("navigation", { name: "Customer sections" });
  await nav.getByRole("button", { name: /Wishlist/ }).click();
  await expect(page.locator(".account-wishlist-item")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Remove Structured Overshirt from wishlist" })
    .click();
  await expect(page.locator(".account-wishlist-item")).toHaveCount(3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".account-wishlist-item")).toHaveCount(4);
  await nav.getByRole("button", { name: "Addresses", exact: true }).click();
  await page.getByRole("button", { name: "Add address", exact: true }).click();
  const address = page.getByRole("dialog", { name: "Add address" });
  await address.getByLabel("Address label").fill("Workshop");
  await address
    .getByLabel("Address line 1", { exact: true })
    .fill("6 Example Row");
  await address.getByLabel("City", { exact: true }).fill("London");
  await address.getByLabel("Postcode").fill("E2 8AA");
  await address.getByRole("button", { name: "Save address" }).click();
  await expect(page.locator(".account-address-card")).toHaveCount(3);
  const workshop = page
    .locator(".account-address-card")
    .filter({ hasText: "Workshop" });
  await workshop.getByRole("button", { name: "Make default" }).click();
  await expect(workshop).toContainText("Default delivery");
  await nav.getByRole("button", { name: "Account details" }).click();
  await page.getByLabel("Full name", { exact: true }).fill("Alex Example");
  await page.getByLabel("Back-in-stock updates", { exact: false }).check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".account-identity")).toContainText("Alex Example");
  await nav.getByRole("button", { name: "Overview", exact: true }).click();
  await nav.getByRole("button", { name: "Account details" }).click();
  await expect(
    page.getByLabel("Back-in-stock updates", { exact: false }),
  ).toBeChecked();
});

test("admin stock edits update the preview and order filters export matching rows", async ({
  page,
}) => {
  await page.goto("/account/admin");
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  await nav.getByRole("button", { name: "Inventory", exact: true }).click();
  await page
    .getByRole("button", { name: "Adjust stock for Heavyweight Box Tee" })
    .click();
  const stock = page.getByRole("dialog", { name: "Adjust stock" });
  const quantity = stock.getByRole("spinbutton", {
    name: "Stock for Black / M",
    exact: true,
  });
  await expect(quantity).toHaveValue("4");
  await quantity.fill("-1");
  await stock.getByRole("button", { name: "Save stock levels" }).click();
  await expect(stock).toBeVisible();
  await quantity.fill("14");
  await stock.getByRole("button", { name: "Save stock levels" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Stock updated for Heavyweight Box Tee",
  );
  await page
    .getByRole("button", { name: "Adjust stock for Heavyweight Box Tee" })
    .click();
  await expect(
    stock.getByRole("spinbutton", { name: "Stock for Black / M", exact: true }),
  ).toHaveValue("14");
  await page.keyboard.press("Escape");
  await nav.getByRole("button", { name: /Orders/ }).click();
  await page.getByLabel("Order status filter").selectOption("Processing");
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByLabel("Search orders").fill("Sam");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("NF-1048");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export orders" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("demo-orders.csv");
  await expect(page.getByRole("status")).toContainText(
    "1 demo orders exported",
  );
  await page.getByLabel("Search orders").fill("no-such-person");
  await expect(
    page.getByRole("heading", { name: "No matching orders." }),
  ).toBeVisible();
});

test("demo accounts stay usable across screen sizes and pass accessibility checks", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/account", "/account/customer", "/account/admin"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBeTruthy();
    }
  }
  for (const route of ["/account", "/account/customer", "/account/admin"]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((issue) => ({
        id: issue.id,
        targets: issue.nodes.map((node) => node.target),
      })),
      route,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page
    .getByRole("combobox", { name: "Account section" })
    .selectOption("inventory");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Adjust stock for Heavyweight Box Tee" })
    .click();
  // Measure contrast after the drawer's entrance animation has finished.
  await page
    .getByRole("dialog", { name: "Adjust stock" })
    .evaluate(async (dialog) => {
      await Promise.all(
        dialog.getAnimations().map((animation) => animation.finished),
      );
    });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((issue) => ({
      id: issue.id,
      nodes: issue.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  ).toEqual([]);
});
