# ShipStation Custom Store Integration

Your supplier (ShipStation or compatible 3PL like Zoho On-Demand Fulfillment) can pull orders from PocketBase and post shipment notifications back.

## How It Works

| Step | Who | Action |
|------|-----|--------|
| 1 | Customer | Pays via PayPal on your site |
| 2 | Your site | Creates order in **PocketBase** |
| 3 | Supplier | **PULLS** orders via GET from your endpoint |
| 4 | Supplier | Ships order, creates label |
| 5 | Supplier | **POSTS** ShipNotice to your endpoint |
| 6 | Your endpoint | Updates PocketBase order with tracking, status=shipped |

## Endpoint URL

When deployed (e.g. on Vercel or your API host):

```
https://your-api-host.com/api/shipstation
```

For local dev:

```
http://localhost:3001/api/shipstation
```

## Authentication

ShipStation (or your supplier) calls your endpoint with **Basic HTTP Auth**:
- Username: `SHIPSTATION_STORE_USER` (from your .env)
- Password: `SHIPSTATION_STORE_PASSWORD` (from your .env)

You set these in `.env`. Your supplier enters the same credentials when adding your Custom Store in ShipStation.

## Environment Variables

```bash
# ShipStation Custom Store (supplier uses these when connecting)
SHIPSTATION_STORE_USER=your_store_username
SHIPSTATION_STORE_PASSWORD=your_store_password

# PocketBase (orders live here)
PB_URL=https://success-chemistry-pb.fly.dev
PB_ADMIN_EMAIL=your_admin@email.com
PB_ADMIN_PASSWORD=your_admin_password
```

## Supplier Configuration (ShipStation)

1. **ShipStation** → Account Settings → Selling Channels → Connect Store or Marketplace
2. Choose **Custom Store**
3. **URL to custom XML page**: `https://your-api-host.com/api/shipstation`
4. **Username** / **Password**: Same as `SHIPSTATION_STORE_USER` and `SHIPSTATION_STORE_PASSWORD`
5. **Status mapping**:
   - Unpaid Status: `pending`
   - Paid Status: `paid,processing`
   - Shipped Status: `shipped`
   - Cancelled Status: `cancelled`
   - On-Hold Status: (leave empty if not used)

## GET Request (Export Orders)

ShipStation calls:
```
GET /api/shipstation?action=export&start_date=01/23/2024 00:00&end_date=01/23/2024 23:59&page=1
```

Response: XML with `<Orders>` containing order data (customer, items, address, etc.).

## POST Request (Ship Notification)

When a label is created, ShipStation POSTs XML with `<ShipNotice>` containing:
- OrderNumber, OrderID
- TrackingNumber, Carrier, Service
- ShipDate, ShippingCost
- Recipient address
- Items (SKU, Quantity)

Your endpoint updates the PocketBase order with:
- `trackingNumber`
- `status: "shipped"`
- `notes` (carrier, ship date)

## Order Flow on Your Site

1. **Checkout** → Create order in PocketBase via `POST /api/orders`:
   - After PayPal success, call `POST /api/orders` (same host as PayPal API, e.g. localhost:3001 or your API host)
   - Body: `{ customerEmail, customerName, customerPhone, items, total, shipping, tax, shippingAddress, paymentId, paymentMethod }`
   - `shippingAddress`: `address_line_1`, `admin_area_1` (state), `admin_area_2` (city), `postal_code`, `country_code`
   - The endpoint sets `orderNumber` to `SC-{timestamp}` if not provided
   - Cart should call this in addition to (or instead of) WooCommerce sync

2. **Items format** in PocketBase order `items`:
   ```json
   [
     { "sku": "10777-810", "name": "Liver Cleanse", "quantity": 2, "price": 29.99, "image": "https://..." },
     ...
   ]
   ```

## Sandbox / Test Orders

When `config.js` has `SANDBOX_MODE: true` (PayPal sandbox):
- Orders are saved to PocketBase with `orderNumber = "TEST-SC-{timestamp}"`
- The ShipStation GET export **excludes** all orders whose `orderNumber` starts with `TEST-`
- **Result**: Your supplier never receives fake test orders; only real (live) orders are pulled

When you switch to live (`SANDBOX_MODE: false`), orders use normal `SC-{timestamp}` or PayPal order ID and are included in the export.

## Zoho On-Demand Fulfillment

If your supplier uses Zoho On-Demand Fulfillment, they may use the same or a compatible XML format. The endpoint supports the ShipStation Custom Store spec; check their docs for any differences.

## References

- [ShipStation Custom Store Development Guide](https://help.shipstation.com/hc/en-us/articles/360025856192-Custom-Store-Development-Guide)
- [Zoho On-Demand Fulfillment Integration](https://ondemandfulfillment.zohodesk.com/portal/en/kb/articles/custom-website-integration-instructions)
