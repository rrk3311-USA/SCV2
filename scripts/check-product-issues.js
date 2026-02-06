#!/usr/bin/env node
const { google } = require("googleapis");
const path = require("path");
const https = require("https");

const SA_KEY_PATH = path.resolve(__dirname, "..", "google-merchant-sa.json");

async function getToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  return t.token || t.res?.data?.access_token;
}

function api(token, method, urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request("https://merchantapi.googleapis.com" + urlPath, {
      method,
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

  // Fetch all products
  let allProducts = [];
  let pageToken = "";
  do {
    const url = "/products/v1/accounts/118364265/products?pageSize=100" + (pageToken ? "&pageToken=" + pageToken : "");
    const data = await api(token, "GET", url);
    allProducts.push(...(data.products || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  console.log("Total products:", allProducts.length);
  console.log("");

  const issueCounts = {};
  const disapprovedUS = [];
  const approvedUS = [];
  const otherUS = [];

  for (const p of allProducts) {
    const statuses = p.productStatus?.destinationStatuses || [];
    const shopping = statuses.find((s) => s.reportingContext === "SHOPPING_ADS") || {};
    const free = statuses.find((s) => s.reportingContext === "FREE_LISTINGS") || {};

    const approvedShopping = (shopping.approvedCountries || []).includes("US");
    const disapprovedShopping = (shopping.disapprovedCountries || []).includes("US");
    const approvedFree = (free.approvedCountries || []).includes("US");
    const disapprovedFree = (free.disapprovedCountries || []).includes("US");

    if (disapprovedShopping || disapprovedFree) {
      disapprovedUS.push(p.offerId);
    } else if (approvedShopping || approvedFree) {
      approvedUS.push(p.offerId);
    } else {
      otherUS.push(p.offerId);
    }

    for (const issue of p.productStatus?.itemLevelIssues || []) {
      const countries = issue.applicableCountries || [];
      if (countries.includes("US") || countries.length === 0) {
        const key = issue.code + " | " + issue.severity + " | " + (issue.attribute || "") + " | " + (issue.description || "").substring(0, 80);
        issueCounts[key] = (issueCounts[key] || 0) + 1;
      }
    }
  }

  console.log("=== US STATUS ===");
  console.log("Approved (Shopping or Free):", approvedUS.length);
  console.log("Disapproved:", disapprovedUS.length);
  console.log("Other (limited/pending):", otherUS.length);
  console.log("");

  if (disapprovedUS.length > 0) {
    console.log("Disapproved product IDs:", disapprovedUS.join(", "));
    console.log("");
  }

  console.log("=== ALL US ISSUES (sorted by count) ===");
  const sorted = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sorted) {
    console.log(count + "x | " + key);
  }

  // Show full detail for first disapproved product
  if (disapprovedUS.length > 0) {
    console.log("");
    console.log("=== SAMPLE DISAPPROVED PRODUCT DETAIL ===");
    const sample = allProducts.find((p) => p.offerId === disapprovedUS[0]);
    console.log("Product:", sample.offerId);
    console.log("Name:", sample.name);
    console.log("DataSource:", sample.dataSource);
    const issues = (sample.productStatus?.itemLevelIssues || []).filter((i) => i.severity === "DISAPPROVED");
    issues.forEach((i) => {
      console.log("  DISAPPROVED:", i.code, "|", i.attribute || "(no attr)", "|", (i.description || "").substring(0, 120), "| countries:", JSON.stringify(i.applicableCountries));
    });
  }
})();
