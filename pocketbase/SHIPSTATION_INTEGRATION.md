# ShipStation Custom Store Integration

Your supplier can use PocketBase (no WooCommerce) via the ShipStation Custom Store flow.

## Overview

This integration allows your 3PL supplier (ShipStation, Zoho On-Demand Fulfillment, or any compatible fulfillment service) to:
- **Pull orders** from PocketBase automatically
- **Post shipment notifications** back when orders ship
- **Update tracking numbers** in your PocketBase orders

**No WooCommerce required** - Orders go directly from your site → PocketBase → Supplier.

## How It Works

| Step | Who | Action |
|------|-----|--------|
| 1 | Customer | Pays via PayPal on your site |
| 2 | Your site | Creates order in **PocketBase** via API |
| 3 | Supplier | **PULLS** orders via GET from your ShipStation endpoint |
| 4 | Supplier | Ships order, creates shipping label |
| 5 | Supplier | **POSTS** ShipNotice XML to your endpoint |
| 6 | Your endpoint | Updates PocketBase order with tracking, status=shipped |

## Quick Setup

### 1. Environment Variables

Add these to your `.env` file (or Vercel/Railway environment):

```bash
# ShipStation Custom Store credentials (supplier uses these)
SHIPSTATION_STORE_USER=your_store_username
SHIPSTATION_STORE_PASSWORD=your_store_password

# PocketBase connection (where orders are stored)
PB_URL=https://success-chemistry-pb.fly.dev
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your_admin_password
```

### 2. Deploy the API Endpoint

The endpoint is at `api/shipstation-custom-store.js`. Deploy it to:
- **Vercel**: `https://your-site.vercel.app/api/shipstation`
- **Railway**: `https://your-api.railway.app/api/shipstation`
- **Local dev**: `http://localhost:3001/api/shipstation`

### 3. Give Credentials to Your Supplier

Share with your fulfillment provider:
- **URL**: `https://your-api-host.com/api/shipstation`
- **Username**: Same as `SHIPSTATION_STORE_USER`
- **Password**: Same as `SHIPSTATION_STORE_PASSWORD`

They'll enter these when adding your Custom Store in ShipStation.

## Supplier Configuration (ShipStation)

Your supplier should:

1. **ShipStation** → Account Settings → Selling Channels → **Connect Store or Marketplace**
2. Choose **Custom Store**
3. Enter:
   - **URL to custom XML page**: `https://your-api-host.com/api/shipstation`
   - **Username**: `SHIPSTATION_STORE_USER` (from your .env)
   - **Password**: `SHIPSTATION_STORE_PASSWORD` (from your .env)
4. **Status mapping**:
   - Unpaid Status: `pending`
   - Paid Status: `paid,processing`
   - Shipped Status: `shipped`
   - Cancelled Status: `cancelled`
   - On-Hold Status: (leave empty)

## How Orders Are Created

When a customer completes checkout on your site:

1. **PayPal payment succeeds**
2. Your frontend calls `POST /api/orders` with:

```javascript
{
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1-555-0100",
  "items": [
    {
      "sku": "10777-810",
      "name": "Liver Cleanse",
      "quantity": 2,
      "price": 29.99,
      "image": "https://..."
    }
  ],
  "total": 69.98,
  "subtotal": 59.98,
  "tax": 5.00,
  "shipping": 5.00,
  "shippingAddress": {
    "address_line_1": "123 Main St",
    "address_line_2": "Apt 4B",
    "admin_area_2": "San Francisco",
    "admin_area_1": "CA",
    "postal_code": "94102",
    "country_code": "US"
  },
  "paymentId": "PAYPAL-123456",
  "paymentMethod": "paypal"
}
```

3. The API creates an order in PocketBase with:
   - `orderNumber`: Auto-generated as `SC-{timestamp}` (e.g. `SC-1738456789`)
   - `status`: `paid` (ready for fulfillment)
   - All customer and item details

## GET Request (Export Orders)

ShipStation periodically calls:

```
GET /api/shipstation?action=export&start_date=01/23/2024 00:00&end_date=01/23/2024 23:59&page=1
```

**Response**: XML with `<Orders>` containing:
- Order number, date, status
- Customer name, email, phone
- Shipping address
- Items (SKU, name, quantity, price, image URL)
- Totals (subtotal, tax, shipping, total)

**Example XML response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Orders pages="1">
  <Order>
    <OrderNumber>SC-1738456789</OrderNumber>
    <OrderDate>01/23/2024 14:30</OrderDate>
    <OrderStatus>paid</OrderStatus>
    <CustomerEmail>customer@example.com</CustomerEmail>
    <ShipTo>
      <Name>John Doe</Name>
      <Address1>123 Main St</Address1>
      <City>San Francisco</City>
      <State>CA</State>
      <PostalCode>94102</PostalCode>
      <Country>US</Country>
      <Phone>+1-555-0100</Phone>
    </ShipTo>
    <Items>
      <Item>
        <SKU>10777-810</SKU>
        <Name>Liver Cleanse</Name>
        <Quantity>2</Quantity>
        <UnitPrice>29.99</UnitPrice>
        <ImageUrl>https://...</ImageUrl>
      </Item>
    </Items>
    <OrderTotal>69.98</OrderTotal>
  </Order>
</Orders>
```

## POST Request (Ship Notification)

When your supplier creates a shipping label, ShipStation POSTs XML with `<ShipNotice>`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ShipNotice>
  <OrderNumber>SC-1738456789</OrderNumber>
  <OrderID>SC-1738456789</OrderID>
  <Carrier>USPS</Carrier>
  <Service>Priority Mail</Service>
  <TrackingNumber>9400111899223344556677</TrackingNumber>
  <ShipDate>01/24/2024</ShipDate>
  <ShippingCost>8.50</ShippingCost>
  <Recipient>
    <Name>John Doe</Name>
    <Address1>123 Main St</Address1>
    <City>San Francisco</City>
    <State>CA</State>
    <PostalCode>94102</PostalCode>
    <Country>US</Country>
  </Recipient>
  <Items>
    <Item>
      <SKU>10777-810</SKU>
      <Quantity>2</Quantity>
    </Item>
  </Items>
</ShipNotice>
```

**Your endpoint automatically updates PocketBase**:
- Sets `trackingNumber`: `9400111899223344556677`
- Sets `status`: `shipped`
- Adds `notes`: `Shipped via USPS Priority Mail on 01/24/2024`

## Testing Locally

1. **Start your API server**:
   ```bash
   node local-server.js
   # Or: node admin-api-server.js
   ```

2. **Test GET (export orders)**:
   ```bash
   curl -u your_store_username:your_store_password \
     "http://localhost:3001/api/shipstation?action=export&start_date=01/01/2024%2000:00&end_date=12/31/2024%2023:59&page=1"
   ```

3. **Test POST (ship notification)**:
   ```bash
   curl -u your_store_username:your_store_password \
     -X POST http://localhost:3001/api/shipstation \
     -H "Content-Type: application/xml" \
     -d '<?xml version="1.0"?>
   <ShipNotice>
     <OrderNumber>SC-1738456789</OrderNumber>
     <TrackingNumber>TEST123456789</TrackingNumber>
     <Carrier>USPS</Carrier>
     <Service>Priority Mail</Service>
     <ShipDate>01/24/2024</ShipDate>
   </ShipNotice>'
   ```

4. **Check PocketBase**:
   - Open http://localhost:8090/_/
   - Go to **orders** collection
   - Verify the order has `trackingNumber` and `status: shipped`

## Zoho On-Demand Fulfillment

If your supplier uses **Zoho On-Demand Fulfillment** instead of ShipStation, they may use a compatible XML format. The endpoint supports the ShipStation Custom Store spec.

**Zoho setup**:
1. Zoho On-Demand Fulfillment → Integrations → Custom Website
2. Enter the same URL and credentials
3. Map statuses (same as ShipStation)

Check [Zoho's integration docs](https://ondemandfulfillment.zohodesk.com/portal/en/kb/articles/custom-website-integration-instructions) for any differences.

## Order Statuses

| Status | Meaning | Who Sets It |
|--------|---------|-------------|
| `pending` | Payment not yet confirmed | Your site (initial) |
| `paid` | Payment confirmed, ready to ship | Your site (after PayPal) |
| `processing` | Supplier is preparing shipment | Supplier (optional) |
| `shipped` | Shipped, tracking available | Supplier (via POST) |
| `delivered` | Delivered to customer | Supplier or tracking webhook |
| `cancelled` | Order cancelled | Your admin or customer |

## Troubleshooting

### Orders not appearing in ShipStation

1. **Check credentials**: Username/password must match exactly
2. **Check date range**: ShipStation queries by order creation date
3. **Check order status**: Only `paid` and `processing` orders are exported
4. **Test the endpoint**:
   ```bash
   curl -u username:password "https://your-api.com/api/shipstation?action=export&start_date=01/01/2024%2000:00&end_date=12/31/2024%2023:59&page=1"
   ```

### Tracking not updating

1. **Check POST is being received**: Add logging to `api/shipstation-custom-store.js`
2. **Check XML format**: Must match ShipStation spec
3. **Check orderNumber**: Must match exactly (case-sensitive)
4. **Check PocketBase permissions**: API must have write access to orders

### Authentication errors

1. **Verify .env variables**: `SHIPSTATION_STORE_USER` and `SHIPSTATION_STORE_PASSWORD`
2. **Check Basic Auth header**: Should be `Basic base64(username:password)`
3. **Test with curl**:
   ```bash
   curl -v -u username:password https://your-api.com/api/shipstation?action=export
   ```

## Security Notes

- **Use HTTPS in production** (Vercel/Railway provide this automatically)
- **Use strong passwords** for `SHIPSTATION_STORE_PASSWORD`
- **Don't commit .env** to git (it's in .gitignore)
- **Rotate credentials periodically** (update in both .env and ShipStation)

## References

- [ShipStation Custom Store Development Guide](https://help.shipstation.com/hc/en-us/articles/360025856192-Custom-Store-Development-Guide)
- [Zoho On-Demand Fulfillment Integration](https://ondemandfulfillment.zohodesk.com/portal/en/kb/articles/custom-website-integration-instructions)
- [PocketBase API Docs](https://pocketbase.io/docs/api-records/)

## Related Files

- `api/shipstation-custom-store.js` - The endpoint implementation
- `docs/SHIPSTATION_CUSTOM_STORE.md` - Original documentation
- `pocketbase/COLLECTIONS_SETUP.md` - Order collection schema
