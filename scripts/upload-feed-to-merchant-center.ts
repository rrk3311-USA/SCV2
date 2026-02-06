#!/usr/bin/env npx tsx
/**
 * Build the Google Shopping feed XML files and upload them to Merchant Center via SFTP.
 *
 * Uploads TWO feeds:
 *  1. google-shopping-feed.xml          – International (primary data source)
 *  2. google-shopping-feed-us.xml       – USA supplemental (shipping + feed_label)
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

const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const password = process.env.GOOGLE_MERCHANT_CENTER_SFTP_PASSWORD;
  if (!password || !password.trim()) {
    console.error("Set GOOGLE_MERCHANT_CENTER_SFTP_PASSWORD (create password in Merchant Center → Data sources → SFTP).");
    process.exit(1);
  }

  // Dynamic import so path aliases (@/) resolve via tsconfig from project root
  const { buildGoogleShoppingFeedXml, buildGoogleShoppingFeedXmlUS } = await import("../src/lib/google-shopping-feed");

  const feeds = [
    { builder: buildGoogleShoppingFeedXml, filename: "google-shopping-feed.xml", label: "International" },
    { builder: buildGoogleShoppingFeedXmlUS, filename: "google-shopping-feed-us.xml", label: "USA" },
  ];

  const localPaths: string[] = [];

  for (const feed of feeds) {
    const xml = feed.builder();
    const localPath = path.join(projectRoot, feed.filename);
    fs.writeFileSync(localPath, xml, "utf8");
    localPaths.push(localPath);
    console.log(`Wrote ${feed.filename} [${feed.label}] (${(xml.length / 1024).toFixed(1)} KB)`);
  }

  console.log("Uploading via SFTP...");
  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: "partnerupload.google.com",
      port: 19321,
      username: "mc-sftp-118364265",
      password: password.trim(),
      readyTimeout: 15000,
    });

    for (const feed of feeds) {
      const localPath = path.join(projectRoot, feed.filename);
      await sftp.put(localPath, feed.filename);
      console.log(`Uploaded ${feed.filename} [${feed.label}] to Merchant Center SFTP.`);
    }
  } catch (err) {
    console.error("SFTP upload failed:", err);
    process.exit(1);
  } finally {
    await sftp.end();
    for (const lp of localPaths) {
      try { fs.unlinkSync(lp); } catch { /* ignore */ }
    }
  }
}

main();
