#!/usr/bin/env node
/**
 * Google Merchant Center – manage data sources & products via Merchant API v1.
 * Uses REST endpoints directly at https://merchantapi.googleapis.com/
 *
 * Usage:
 *   node scripts/merchant-center-setup.js list              – list existing data sources
 *   node scripts/merchant-center-setup.js create-us         – create US supplemental scheduled-fetch feed
 *   node scripts/merchant-center-setup.js fetch <dsId>      – trigger immediate fetch for a data source
 *   node scripts/merchant-center-setup.js delete <dsId>     – delete a data source
 *   node scripts/merchant-center-setup.js products          – list products (first 25)
 *   node scripts/merchant-center-setup.js cleanup           – delete all 0-product File/SFTP data sources
 *
 * Requires: google-merchant-sa.json in project root
 */

const { google } = require("googleapis");
const path = require("path");
const https = require("https");

const MERCHANT_ID = "118364265";
const ACCOUNT = `accounts/${MERCHANT_ID}`;
const SA_KEY_PATH = path.resolve(__dirname, "..", "google-merchant-sa.json");
const BASE = "https://merchantapi.googleapis.com";

const FEED_URL_US = "https://www.successchemistry.com/feeds/google-shopping-us";

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  return tokenRes.token || tokenRes.res?.data?.access_token;
}

/** Generic fetch helper for Merchant API REST calls */
async function apiCall(method, urlPath, body) {
  const token = await getAccessToken();
  const url = `${BASE}${urlPath}`;

  return new Promise((resolve, reject) => {
    const opts = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(url, opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── List data sources ─────────────────────────────────────────────────────────
async function listDataSources() {
  console.log(`\nListing data sources for ${ACCOUNT}...\n`);

  try {
    const res = await apiCall("GET", `/datasources/v1/${ACCOUNT}/dataSources`);
    const sources = res.dataSources || [];

    if (sources.length === 0) {
      console.log("No data sources found.");
      return;
    }

    for (const ds of sources) {
      const id = ds.dataSourceId || ds.name?.split("/").pop();
      console.log(`ID: ${id}`);
      console.log(`  Name (resource): ${ds.name}`);
      console.log(`  Display name:    ${ds.displayName}`);
      console.log(`  Input:           ${ds.input}`);
      if (ds.primaryProductDataSource) {
        const p = ds.primaryProductDataSource;
        console.log(`  Type:            PRIMARY`);
        console.log(`  Countries:       ${JSON.stringify(p.countries)}`);
        console.log(`  Feed label:      ${p.feedLabel || "(none)"}`);
        console.log(`  Language:        ${p.contentLanguage}`);
      }
      if (ds.supplementalProductDataSource) {
        const s = ds.supplementalProductDataSource;
        console.log(`  Type:            SUPPLEMENTAL`);
        console.log(`  Feed label:      ${s.feedLabel || "(none)"}`);
        console.log(`  Language:        ${s.contentLanguage}`);
      }
      if (ds.fileInput) {
        const fi = ds.fileInput;
        console.log(`  File input type: ${fi.fileInputType}`);
        console.log(`  File name:       ${fi.fileName || "(none)"}`);
        if (fi.fetchSettings) {
          console.log(`  Fetch URI:       ${fi.fetchSettings.fetchUri || "(none)"}`);
          console.log(`  Fetch enabled:   ${fi.fetchSettings.enabled}`);
          console.log(`  Frequency:       ${fi.fetchSettings.frequency}`);
        }
      }
      console.log("");
    }
    console.log(`Total: ${sources.length} data sources`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ── Create US supplemental feed with scheduled fetch ──────────────────────────
async function createUSDataSource() {
  console.log(`\nCreating US supplemental data source...\n`);

  const body = {
    displayName: "USA Supplemental Feed",
    supplementalProductDataSource: {
      feedLabel: "US",
      contentLanguage: "en",
    },
    fileInput: {
      fetchSettings: {
        enabled: true,
        fetchUri: FEED_URL_US,
        frequency: "FREQUENCY_DAILY",
        timeOfDay: { hours: 6, minutes: 0 },
        timeZone: "America/Los_Angeles",
      },
    },
  };

  try {
    const res = await apiCall("POST", `/datasources/v1/${ACCOUNT}/dataSources`, body);
    console.log("Created data source:");
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ── Trigger immediate fetch ───────────────────────────────────────────────────
async function fetchDataSource(dsId) {
  console.log(`\nTriggering fetch for data source ${dsId}...\n`);

  try {
    await apiCall("POST", `/datasources/v1/${ACCOUNT}/dataSources/${dsId}:fetch`, {});
    console.log(`Fetch triggered for data source ${dsId}.`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ── Delete a data source ──────────────────────────────────────────────────────
async function deleteDataSource(dsId) {
  console.log(`\nDeleting data source ${dsId}...\n`);

  try {
    await apiCall("DELETE", `/datasources/v1/${ACCOUNT}/dataSources/${dsId}`);
    console.log(`Deleted data source ${dsId}.`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ── List products ─────────────────────────────────────────────────────────────
async function listProducts() {
  console.log(`\nListing products for ${ACCOUNT}...\n`);

  try {
    const res = await apiCall("GET", `/products/v1/${ACCOUNT}/products?pageSize=25`);
    const products = res.products || [];

    if (products.length === 0) {
      console.log("No products found.");
      return;
    }

    for (const p of products) {
      const attrs = p.attributes || {};
      console.log(`${attrs.offerId || "?"} | ${(attrs.title || "").substring(0, 60)} | ${attrs.price?.amountMicros ? "$" + (attrs.price.amountMicros / 1e6).toFixed(2) : "?"} | ${attrs.availability || "?"}`);
    }
    console.log(`\n(${products.length} shown)`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const cmd = process.argv[2];

  switch (cmd) {
    case "list":
      await listDataSources();
      break;
    case "create-us":
      await createUSDataSource();
      break;
    case "fetch": {
      const dsId = process.argv[3];
      if (!dsId) { console.error("Usage: ... fetch <dataSourceId>"); process.exit(1); }
      await fetchDataSource(dsId);
      break;
    }
    case "delete": {
      const dsId = process.argv[3];
      if (!dsId) { console.error("Usage: ... delete <dataSourceId>"); process.exit(1); }
      await deleteDataSource(dsId);
      break;
    }
    case "products":
      await listProducts();
      break;
    default:
      console.log("Usage:");
      console.log("  node scripts/merchant-center-setup.js list              – list data sources");
      console.log("  node scripts/merchant-center-setup.js create-us         – create US supplemental feed");
      console.log("  node scripts/merchant-center-setup.js fetch <dsId>      – trigger immediate fetch");
      console.log("  node scripts/merchant-center-setup.js delete <dsId>     – delete a data source");
      console.log("  node scripts/merchant-center-setup.js products          – list products");
      break;
  }
}

main();
