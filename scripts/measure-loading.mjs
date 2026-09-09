import { chromium } from "@playwright/test";

// Run against a production server. Each route receives an empty browser cache.
const origin = process.argv[2] || "http://localhost:3001";
const browser = await chromium.launch();
const routes = [
  "/",
  "/shop",
  "/account",
  "/account/customer",
  "/account/admin",
  "/product/heavyweight-box-tee",
];
try {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    try {
      const page = await context.newPage();
      await page.goto(new URL(route, origin).href, {
        waitUntil: "networkidle",
      });
      const measurements = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        const kib = (bytes) => Math.round((bytes / 1024) * 10) / 10;
        const sum = (entries) =>
          kib(
            entries.reduce((total, entry) => total + entry.encodedBodySize, 0),
          );
        const scripts = resources.filter(
          (entry) => entry.initiatorType === "script",
        );
        const images = resources.filter((entry) =>
          /\/_next\/image/.test(entry.name),
        );
        return {
          documentKiB: kib(nav.decodedBodySize),
          documentTransferKiB: kib(nav.encodedBodySize),
          scriptKiB: sum(scripts),
          scriptRequests: scripts.length,
          imageKiB: sum(images),
          imageRequests: images.length,
          resourceKiB: sum(resources),
        };
      });
      console.log(JSON.stringify({ route, ...measurements }));
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
