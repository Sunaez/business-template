import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Merchant XML parses and its variant links preselect the advertised offer", async ({
  page,
  request,
}) => {
  const response = await request.get("/feeds/google.xml?preview=1");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  await page.goto("/");
  const parsed = await page.evaluate(
    (xml) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      const items = [...doc.getElementsByTagName("item")];
      return {
        errors: doc.getElementsByTagName("parsererror").length,
        count: items.length,
        white: items
          .find((item) => item.textContent?.includes("variant=box-tee-white-m"))
          ?.getElementsByTagNameNS("http://base.google.com/ns/1.0", "link")[0]
          ?.textContent,
      };
    },
    await response.text(),
  );
  expect(parsed.errors).toBe(0);
  expect(parsed.count).toBeGreaterThan(100);
  expect(parsed.white).toBeTruthy();
  await page.goto(parsed.white!);
  await expect(
    page.getByRole("button", { name: "Colour: White", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Size: M", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator(".product-gallery__track img").first(),
  ).toHaveAttribute("src", /tee-white/);
  await expect(page.locator(".product-add-button:visible")).toBeEnabled();
  await page.goto("/product/heavyweight-box-tee?variant=box-tee-black-l");
  await expect(
    page.getByRole("button", { name: /Size: L.*unavailable/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".product-add-button:visible")).toBeDisabled();
  await expect(page.locator(".product-add-button:visible")).toContainText(
    "Out of stock",
  );
  await page.goto("/product/studio-canvas-tote?variant=canvas-tote-chalk-pair");
  await expect(page.locator(".product-detail__price:visible")).toContainText(
    "£42",
  );
  await expect(
    page.getByRole("button", { name: "Pack size: Pair", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("business features replace the story and remain accessible on mobile", async ({
  page,
  request,
}) => {
  const oldPage = await request.get("/about", { maxRedirects: 0 });
  expect(oldPage.status()).toBe(308);
  expect(oldPage.headers().location).toBe("/for-business");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/for-business");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Take your shop online.",
    );
    await expect(page.locator(".biz-plan-grid article")).toHaveCount(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page
    .getByRole("link", { name: "Get my store online", exact: true })
    .click();
  await expect(page).toHaveURL(/\/for-business\/start\?intent=store$/);
  await expect(page.getByLabel("Business name", { exact: true })).toHaveCount(
    1,
  );
  await page.goto("/");
  await expect(page.locator(".business-feature__item")).toHaveCount(3);
  await page.locator(".business-feature__cta:visible").click();
  await expect(page).toHaveURL(/\/for-business$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({
    path: "test-results/business-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/business-desktop.png",
    fullPage: true,
  });
});
