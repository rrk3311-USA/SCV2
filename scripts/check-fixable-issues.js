#!/usr/bin/env node
const { google } = require("googleapis");
const path = require("path");
const https = require("https");

const SA_KEY_PATH = path.resolve(__dirname, "..", "google-merchant-sa.json");

async function getToken() {
  const auth = new google.auth.GoogleAuth({ keyFile: SA_KEY_PATH, scopes: ["https://www.googleapis.com/auth/content"] });
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  return t.token || t.res?.data?.access_token;
}

function api(token, urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request("https://merchantapi.googleapis.com" + urlPath, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  const token = await getToken();

  let allProducts = [];
  let pageToken = "";
  do {
    const data = await api(token, "/products/v1/accounts/118364265/products?pageSize=100" + (pageToken ? "&pageToken=" + pageToken : ""));
    allProducts.push(...(data.products || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  // 1. Landing page errors
  console.log("=== LANDING PAGE ERRORS (product page unavailable) ===");
  const landingPageErrors = [];
  for (const p of allProducts) {
    const issues = p.productStatus?.itemLevelIssues || [];
    const hasLPError = issues.some((i) => i.code === "landing_page_error" && i.severity === "DISAPPROVED");
    if (hasLPError) {
      landingPageErrors.push(p.offerId);
    }
  }
  console.log("Count:", landingPageErrors.length);
  console.log("Product IDs:", landingPageErrors.join(", "));
  console.log("");

  // 2. Invalid GTINs
  console.log("=== INVALID GTIN ===");
  for (const p of allProducts) {
    const issues = p.productStatus?.itemLevelIssues || [];
    const hasGTIN = issues.some((i) => i.code === "invalid_upc");
    if (hasGTIN) {
      // Get the custom attributes to find GTIN value
      const gtinAttr = (p.customAttributes || []).find((a) => a.name === "gtin");
      console.log(p.offerId, "| gtin:", gtinAttr?.value || "(not in custom attrs)");
    }
  }
  console.log("");

  // 3. Image issues
  console.log("=== IMAGE ISSUES (broken/unsupported) ===");
  const imageIssueProducts = new Set();
  for (const p of allProducts) {
    const issues = p.productStatus?.itemLevelIssues || [];
    const hasImageIssue = issues.some((i) => (i.code === "image_link_internal_error_fallback" || i.code === "image_link_broken_fallback") && (i.applicableCountries || []).includes("US"));
    if (hasImageIssue) imageIssueProducts.add(p.offerId);
  }
  console.log("Count:", imageIssueProducts.size);
  console.log("Product IDs:", [...imageIssueProducts].join(", "));
  console.log("");

  // 4. Check channel — are products local or online?
  console.log("=== PRODUCT CHANNEL CHECK ===");
  const channels = {};
  for (const p of allProducts) {
    const ch = p.channel || "unknown";
    channels[ch] = (channels[ch] || 0) + 1;
    // Check name format: online~en~US~ vs local~en~US~
    if (p.name && p.name.includes("local~")) {
      channels["local_in_name"] = (channels["local_in_name"] || 0) + 1;
    }
  }
  console.log(JSON.stringify(channels, null, 2));
  console.log("");

  // 5. Show 3 sample product names to check URL format
  console.log("=== SAMPLE PRODUCT NAMES (to check channel) ===");
  for (const p of allProducts.slice(0, 6)) {
    console.log(p.offerId, "|", p.name);
  }
})();
