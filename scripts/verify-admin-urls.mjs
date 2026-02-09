#!/usr/bin/env node
/**
 * Verify admin URLs (local + Directus). Run from SCV2: node scripts/verify-admin-urls.mjs
 * Exits 1 if any required check fails so CI or you can "test until it works".
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const path = join(root, ".env.local");
  try {
    const raw = readFileSync(path, "utf-8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
    return env;
  } catch {
    return {};
  }
}

async function fetchOk(url, opts = {}) {
  try {
    const res = await fetch(url, { redirect: "manual", ...opts });
    return { ok: res.ok, status: res.status, redirect: res.headers.get("location") };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function main() {
  const env = loadEnv();
  const onlineOnly = process.argv.includes("--online-only");
  const directusUrl = (process.env.DIRECTUS_URL || env.DIRECTUS_URL || env.NEXT_PUBLIC_DIRECTUS_URL || "").replace(/\/$/, "");
  const base = "http://localhost:8000";

  console.log("--- Admin URL checks ---\n");

  let failed = 0;

  // 1) Local SCV2 /admin (skip if --online-only)
  if (!onlineOnly) {
    const localAdmin = await fetchOk(`${base}/admin`);
    if (localAdmin.redirect && localAdmin.redirect.startsWith("http")) {
      console.log("✓ Local /admin redirects to:", localAdmin.redirect);
    } else if (localAdmin.status === 200) {
      console.log("✓ Local /admin returns 200 (no redirect; DIRECTUS_URL may be unset)");
    } else {
      console.log("✗ Local /admin failed:", localAdmin.status || localAdmin.error, "(run: npm run dev, or use --online-only to skip)");
      failed++;
    }
  } else {
    console.log("⊘ Skipping local check (--online-only)");
  }

  // 2) Directus URL (online)
  if (!directusUrl) {
    console.log("\n✗ DIRECTUS_URL not set. Set in .env.local or: DIRECTUS_URL=https://your-directus.fly.dev node scripts/verify-admin-urls.mjs --online-only");
    failed++;
  } else {
    const health = await fetchOk(`${directusUrl}/server/health`);
    if (health.ok || health.status === 200) {
      console.log("\n✓ Directus health OK:", directusUrl);
    } else {
      console.log("\n✗ Directus unreachable:", directusUrl, "— status:", health.status || health.error);
      failed++;
    }
    const rootPage = await fetchOk(directusUrl);
    if (rootPage.ok || rootPage.status === 200) {
      console.log("✓ Directus root returns 200");
    } else {
      console.log("✗ Directus root failed:", rootPage.status || rootPage.error);
      failed++;
    }
  }

  console.log("\n--- Done ---");
  if (failed > 0) {
    console.log("Some checks failed. Fix the above and run again.");
    process.exit(1);
  }
  console.log("Admin URLs verified.");
}

main();
