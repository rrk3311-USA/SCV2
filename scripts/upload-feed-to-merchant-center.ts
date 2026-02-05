#!/usr/bin/env npx tsx
/**
 * Build the Google Shopping feed XML and upload it to Merchant Center via SFTP.
 * Use this when "scheduled fetch" URL is not available (e.g. 404) or for manual uploads.
 *
 * Prerequisites:
 * 1. In Merchant Center: Data sources → SFTP and Google Cloud Storage → Create password.
 * 2. Set env: GOOGLE_MERCHANT_CENTER_SFTP_PASSWORD=<that password>
 *
 * Run from SCV2: npm run upload-merchant-feed
 * Or: npx tsx scripts/upload-feed-to-merchant-center.ts
 */

import * as fs from "fs";
import * as path from "path";
import SftpClient from "ssh2-sftp-client";

// Run from project root so path aliases resolve when we load the lib
const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const password = process.env.GOOGLE_MERCHANT_CENTER_SFTP_PASSWORD;
  if (!password || !password.trim()) {
    console.error("Set GOOGLE_MERCHANT_CENTER_SFTP_PASSWORD (create password in Merchant Center → Data sources → SFTP).");
    process.exit(1);
  }

  // Dynamic import so path aliases (@/) resolve via tsconfig from project root
  const { buildGoogleShoppingFeedXml } = await import("../src/lib/google-shopping-feed");
  const xml = buildGoogleShoppingFeedXml();

  const filename = "google-shopping-feed.xml";
  const localPath = path.join(projectRoot, filename);

  fs.writeFileSync(localPath, xml, "utf8");
  console.log(`Wrote ${filename} (${(xml.length / 1024).toFixed(1)} KB). Uploading via SFTP...`);

  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: "partnerupload.google.com",
      port: 19321,
      username: "mc-sftp-118364265",
      password: password.trim(),
      readyTimeout: 15000,
    });
    await sftp.put(localPath, filename);
    console.log(`Uploaded ${filename} to Merchant Center SFTP.`);
  } catch (err) {
    console.error("SFTP upload failed:", err);
    process.exit(1);
  } finally {
    await sftp.end();
    try {
      fs.unlinkSync(localPath);
    } catch {
      // ignore
    }
  }
}

main();
