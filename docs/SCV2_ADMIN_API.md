# SCV2 frontend ↔ Success Chemistry Admin API

**SCV2** is the Next.js storefront. It should talk to the **Success Chemistry Admin API** for cart orders and PayPal.

## API base URL

- **Production**: `https://success-chemistry-pb.fly.dev` (single PocketBase backend)
- **Local dev**: `http://localhost:8090` (when running PocketBase locally)

## Env (SCV2)

In SCV2 `.env.local`:

```env
# Admin API (orders + PayPal). Omit or use localhost for local dev.
NEXT_PUBLIC_ADMIN_API_URL=https://success-chemistry-pb.fly.dev
```

## Usage in SCV2

1. **Single helper** (e.g. `src/lib/api.ts`):

   ```ts
   export function getAdminApiBase(): string {
     if (typeof window !== "undefined") {
       return process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://success-chemistry-pb.fly.dev";
     }
     return process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://success-chemistry-pb.fly.dev";
   }
   ```

2. **PayPal**  
   Create order: `POST getAdminApiBase() + '/api/paypal/orders'`  
   Capture: `POST getAdminApiBase() + '/api/paypal/orders/' + orderID + '/pay'`

3. **Save order to PocketBase after payment**  
   `POST getAdminApiBase() + '/api/orders'` with body:  
   `{ orderNumber, paypalOrderID, amount, currency, items, shippingAddress, isTest?: true }`  
   Use `isTest: true` when using PayPal sandbox so orders are prefixed with `TEST-` and excluded from ShipStation export.

## Endpoints (reference)

| Purpose        | Method | Path                    |
|----------------|--------|-------------------------|
| Health         | GET    | `/api/health`           |
| Create order   | POST   | `/api/orders`           |
| PayPal create  | POST   | `/api/paypal/orders`    |
| PayPal capture | POST   | `/api/paypal/orders/:id/pay` |
| ShipStation    | GET/POST | `/api/shipstation`   |

See [ADMIN_API_DEPLOY.md](./ADMIN_API_DEPLOY.md) for deploy and secrets.
