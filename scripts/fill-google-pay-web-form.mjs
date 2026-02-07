#!/usr/bin/env node
/**
 * Fills the Google Pay Business Console "Add web integration" form.
 * Run: npx playwright run scripts/fill-google-pay-web-form.mjs
 * (First time: npx playwright install chromium)
 *
 * You must be logged into Google. The script opens the form, fills Website URL
 * and selects Gateway, then leaves the browser open for you to upload screenshots and submit.
 */
import { chromium } from "playwright";

const ADD_URL = "https://pay.google.com/business/console/payment/web/BCR2DN5T5367NUIC/add";
const WEBSITE_URL = "https://www.successchemistry.com";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  console.log("Opening form...");
  await page.goto(ADD_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

  const isSignIn = await page.getByText("Sign in", { exact: true }).first().isVisible().catch(() => false);
  if (isSignIn) {
    console.log("Sign in to Google in the browser, then press Enter here...");
    await new Promise((r) => process.stdin.once("data", r));
  }

  await page.waitForTimeout(2000);

  // Website URL: first visible text input
  const inputs = await page.locator('input[type="text"], input[type="url"]').all();
  for (const input of inputs) {
    const visible = await input.isVisible().catch(() => false);
    if (visible) {
      await input.fill(WEBSITE_URL);
      console.log("Filled Website URL:", WEBSITE_URL);
      break;
    }
  }

  // Integration type: click label or dropdown then choose Gateway
  const dropdownLabel = page.getByText("Integration type", { exact: false }).first();
  await dropdownLabel.click().catch(() => {});
  await page.waitForTimeout(800);
  const gateway = page.getByText("Gateway", { exact: true }).first();
  await gateway.click();
  console.log("Selected: Gateway");

  console.log("Done. Upload screenshots and click Submit for approval. Close the browser when done.");
  await page.waitForTimeout(300000);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
