/**
 * Medusa JS SDK client. When no backend is configured, list() fails and store uses TOP_12.
 */
import Medusa from "@medusajs/js-sdk";

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";

export const sdk = new Medusa({ baseUrl });
