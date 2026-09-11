import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function fillRequired(page: Page) {
  await page
    .getByLabel("Business name", { exact: true })
    .fill("High Street Boutique");
  await page.getByLabel("Your name", { exact: true }).fill("Alex");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("alex@example.com");
  await page
    .getByLabel("What do you sell?", { exact: true })
    .fill("Clothing and accessories");
}

test("business CTAs lead to their own enquiry flow and the demo routes resolve", async ({
  page,
  request,
}) => {
  await page.goto("/for-business");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Take your shop online.",
  );
  await expect(
    page.getByRole("link", { name: "Get my store online", exact: true }),
  ).toHaveAttribute("href", "/for-business/start?intent=store");
  await expect(
    page.getByRole("link", { name: "See a working store", exact: true }),
  ).toHaveAttribute("href", "/shop");
  expect(await page.locator('a[href="/contact"]').count()).toBe(0);
  const hrefs = await page
    .locator("a")
    .evaluateAll((links) => [
      ...new Set(
        links
          .map((link) => link.getAttribute("href"))
          .filter((href): href is string => Boolean(href)),
      ),
    ]);
  for (const href of hrefs) {
    if (href.startsWith("#")) {
      await expect(page.locator(href)).toHaveCount(1);
      continue;
    }
    if (href.startsWith("/"))
      expect((await request.get(href)).status(), href).toBe(200);
  }
  await page
    .getByRole("link", {
      name: "Show me what my store could look like",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/for-business\/start\?intent=preview/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Let’s picture",
  );
});

test("draft form validates, retains optional details and never implies delivery", async ({
  page,
}) => {
  await page.goto("/for-business/start?intent=preview");
  await page
    .getByRole("button", { name: "Prepare my enquiry", exact: true })
    .click();
  await expect(page.locator(".biz-form-error")).toContainText("highlighted");
  await expect(page.getByLabel("Business name", { exact: true })).toBeFocused();
  await fillRequired(page);
  await page.getByLabel("New online store", { exact: true }).check();
  await page
    .getByText("A little more about your business (optional)", { exact: true })
    .click();
  await page.getByLabel("Website", { exact: true }).fill("myshop.co.uk");
  await page
    .getByLabel("Approximate number of products", { exact: true })
    .selectOption("26–100");
  await page.getByLabel("Phone number", { exact: true }).fill("12");
  await page
    .getByRole("button", { name: "Prepare my enquiry", exact: true })
    .click();
  await expect(page.getByLabel("Phone number", { exact: true })).toBeFocused();
  await page.getByLabel("Phone number", { exact: true }).fill("07123 456789");
  await page
    .getByRole("button", { name: "Prepare my enquiry", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your enquiry is ready. Not sent yet." }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your enquiry draft", { exact: true }),
  ).toContainText("https://myshop.co.uk/");
  await expect(
    page.getByLabel("Your enquiry draft", { exact: true }),
  ).toContainText("Request: preview");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my enquiry" }).click();
  expect((await download).suggestedFilename()).toBe("my-store-enquiry.txt");
  const violations = (await new AxeBuilder({ page }).analyze()).violations;
  expect(violations).toEqual([]);
  await page.getByRole("button", { name: "Edit my details" }).click();
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "High Street Boutique",
  );
  await expect(page.getByLabel("Website", { exact: true })).toHaveValue(
    "myshop.co.uk",
  );
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((value) =>
        value.includes("alex@example.com"),
      ),
    ),
  ).toBe(false);
});

test("pricing distinguishes a showcase and carries the chosen model into the enquiry", async ({
  page,
}) => {
  await page.goto("/for-business");
  await expect(page.locator(".biz-price-card--showcase")).toContainText("£399");
  await expect(page.locator(".biz-price-card--showcase")).toContainText(
    "no online payment",
  );
  await expect(page.locator(".biz-price-card--managed-store")).toContainText(
    "Setup quoted separately",
  );
  await page
    .getByRole("link", { name: "Ask about a showcase", exact: true })
    .click();
  await expect(page).toHaveURL(/intent=consultation&plan=showcase/);
  await expect(
    page.getByLabel("Product showcase", { exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("New online store", { exact: true }),
  ).not.toBeChecked();
  await fillRequired(page);
  await page
    .getByRole("button", { name: "Prepare my enquiry", exact: true })
    .click();
  await expect(
    page.getByLabel("Your enquiry draft", { exact: true }),
  ).toContainText("Help with: Product showcase");
});

for (const width of [320, 390, 768, 1440]) {
  test(`business pages are accessible and fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/for-business", "/for-business/start"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(
        (await new AxeBuilder({ page }).analyze()).violations,
        route,
      ).toEqual([]);
      if (route.endsWith("start")) {
        await page
          .getByText("A little more about your business (optional)", {
            exact: true,
          })
          .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      } else {
        await page.locator(".biz-price-detail summary").click();
        await expect(page.locator(".biz-price-detail")).toContainText(
          "not a guarantee of revenue",
        );
        await page.locator(".biz-dashboard-disclosure summary").click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        const summary = page
          .locator("summary")
          .filter({ hasText: "Do I need technical knowledge?" });
        await summary.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator(".biz-faq details[open]")).toContainText(
          "No. I handle the setup",
        );
      }
    }
  });
}
