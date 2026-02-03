// Single-backend API: health, orders, PayPal, ShipStation (all on PocketBase)

function getApiConfig(app) {
  try {
    return app.findFirstRecordByFilter("api_config", "id != ''");
  } catch (err) {
    return null;
  }
}

function base64Encode(str) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let out = "";
  let i = 0;
  const len = str.length;
  while (i < len) {
    const a = str.charCodeAt(i++);
    const b = i < len ? str.charCodeAt(i++) : 0;
    const c = i < len ? str.charCodeAt(i++) : 0;
    const n = (a << 16) | (b << 8) | c;
    out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + (i > len + 1 ? "=" : chars[(n >> 6) & 63]) + (i > len ? "=" : chars[n & 63]);
  }
  return out;
}

function wrapCdata(str) {
  if (str == null || str === "") return "";
  return "<![CDATA[" + String(str).replace(/\]\]>/g, "]]]]><![CDATA[>") + "]]>";
}

// --- Health ---
routerAdd("GET", "/api/health", (e) => {
  return e.json(200, { status: "ok", timestamp: new Date().toISOString() });
});

// --- Root API info ---
routerAdd("GET", "/api", (e) => {
  return e.json(200, {
    name: "Success Chemistry API",
    status: "ok",
    endpoints: {
      health: "GET /api/health",
      orders: "GET/POST /api/orders",
      shipstation: "GET/POST /api/shipstation",
      paypal: "POST /api/paypal/orders"
    }
  });
});

// --- GET /api/orders (list from PocketBase) ---
routerAdd("GET", "/api/orders", (e) => {
  const limit = Math.min(parseInt(e.request.url().query().get("limit") || "50"), 1000);
  const page = parseInt(e.request.url().query().get("page") || "1");
  const offset = (page - 1) * limit;
  const records = e.app.findRecordsByFilter("orders", "", "-created", limit, offset);
  const total = e.app.countRecords("orders", "");
  const orders = records.map((r) => ({
    id: r.id,
    order_number: r.get("orderNumber"),
    customer_name: r.get("customerName"),
    customer_email: r.get("customerEmail"),
    created_at: r.get("created"),
    total: r.get("total"),
    status: r.get("status"),
    items: r.get("items"),
    shipping_address: r.get("shippingAddress")
  }));
  return e.json(200, { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});

// --- POST /api/orders (create order in PocketBase) ---
routerAdd("POST", "/api/orders", (e) => {
  const raw = toString(e.request.body);
  let body = {};
  try {
    body = JSON.parse(raw || "{}");
  } catch (err) {
    throw new BadRequestError("Invalid JSON body");
  }
  const isTest = body.isTest === true;
  const orderNumber = isTest ? "TEST-SC-" + Date.now() : (body.orderNumber || "SC-" + Date.now());
  const addr = body.shippingAddress || body.address || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const collection = e.app.findCollectionByNameOrId("orders");
  const record = new Record(collection);
  record.set("orderNumber", orderNumber);
  record.set("customerEmail", body.customerEmail || body.email || "");
  record.set("customerName", body.customerName || body.customer_name || "");
  record.set("customerPhone", body.customerPhone || body.phone || "");
  record.set("items", items.map((i) => ({
    sku: i.sku || i.product_sku,
    name: i.name || i.product_name || "Product",
    quantity: i.quantity || 1,
    price: i.price || i.unit_price || 0,
    image: i.image || "",
    upc: i.upc || i.gtin
  })));
  record.set("total", parseFloat(body.total || 0));
  record.set("subtotal", parseFloat(body.subtotal || body.total || 0));
  record.set("tax", parseFloat(body.tax || 0));
  record.set("shipping", parseFloat(body.shipping || 0));
  record.set("status", "paid");
  record.set("paymentMethod", body.paymentMethod || "paypal");
  record.set("paymentId", body.paymentId || body.id || "");
  record.set("shippingAddress", {
    address_line_1: addr.address_line_1 || addr.street || addr.address1,
    address_line_2: addr.address_line_2 || addr.street2 || addr.address2,
    admin_area_1: addr.admin_area_1 || addr.state,
    admin_area_2: addr.admin_area_2 || addr.city,
    postal_code: addr.postal_code || addr.zip,
    country_code: (addr.country_code || addr.country || "US").substring(0, 2)
  });
  record.set("notes", body.notes || "");
  e.app.save(record);
  return e.json(200, { success: true, id: record.id, orderNumber });
});

// --- PayPal: get token and create/capture (uses api_config) ---
routerAdd("POST", "/api/paypal/orders", (e) => {
  const cfg = getApiConfig(e.app);
  if (!cfg || !cfg.get("paypal_client_id") || !cfg.get("paypal_client_secret")) {
    return e.json(500, { error: "PayPal not configured. Add api_config record with paypal_client_id and paypal_client_secret in PB admin." });
  }
  const mode = (cfg.get("paypal_mode") || "live").toLowerCase();
  const base = mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const auth = base64Encode(cfg.get("paypal_client_id") + ":" + cfg.get("paypal_client_secret"));
  const raw = toString(e.request.body);
  let body = {};
  try {
    body = JSON.parse(raw || "{}");
  } catch (err) {
    return e.json(400, { error: "Invalid JSON" });
  }
  const tokenRes = $http.send({
    url: base + "/v1/oauth2/token",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Basic " + auth },
    body: "grant_type=client_credentials"
  });
  if (tokenRes.statusCode !== 200) {
    return e.json(502, { error: "PayPal auth failed" });
  }
  const tokenData = JSON.parse(tokenRes.raw);
  const token = tokenData.access_token;
  const payload = body.purchase_units ? { intent: body.intent || "CAPTURE", purchase_units: body.purchase_units } : {
    intent: "CAPTURE",
    purchase_units: [{ amount: { currency_code: body.currency_code || "USD", value: String(body.amount || "0.00") } }]
  };
  const orderRes = $http.send({
    url: base + "/v2/checkout/orders",
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify(payload)
  });
  const orderJson = JSON.parse(orderRes.raw);
  if (orderRes.statusCode >= 400) {
    return e.json(orderRes.statusCode, { success: false, error: orderJson.message || orderJson.details?.[0]?.description || "PayPal error" });
  }
  return e.json(200, { success: true, order: { id: orderJson.id } });
});

routerAdd("POST", "/api/paypal/orders/{id}/pay", (e) => {
  const id = e.request.pathValue("id");
  const cfg = getApiConfig(e.app);
  if (!cfg || !cfg.get("paypal_client_id") || !cfg.get("paypal_client_secret")) {
    return e.json(500, { error: "PayPal not configured." });
  }
  const mode = (cfg.get("paypal_mode") || "live").toLowerCase();
  const base = mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const auth = base64Encode(cfg.get("paypal_client_id") + ":" + cfg.get("paypal_client_secret"));
  const tokenRes = $http.send({
    url: base + "/v1/oauth2/token",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Basic " + auth },
    body: "grant_type=client_credentials"
  });
  if (tokenRes.statusCode !== 200) {
    return e.json(502, { error: "PayPal auth failed" });
  }
  const tokenData = JSON.parse(tokenRes.raw);
  const token = tokenData.access_token;
  const captureRes = $http.send({
    url: base + "/v2/checkout/orders/" + id + "/capture",
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: "{}"
  });
  const captureJson = JSON.parse(captureRes.raw);
  if (captureRes.statusCode >= 400) {
    return e.json(captureRes.statusCode, { success: false, error: captureJson.message || captureJson.details?.[0]?.description || "PayPal capture failed" });
  }
  return e.json(200, { success: true, details: captureJson });
});

// --- ShipStation: Basic Auth helper ---
function checkShipStationAuth(e) {
  const cfg = getApiConfig(e.app);
  if (!cfg || !cfg.get("shipstation_user") || !cfg.get("shipstation_password")) {
    return false;
  }
  const auth = e.request.header().get("Authorization");
  if (!auth || auth.indexOf("Basic ") !== 0) return false;
  const b64 = auth.slice(6);
  let decoded = "";
  try {
    decoded = atob(b64);
  } catch (err) {
    return false;
  }
  const parts = decoded.split(":");
  const user = parts[0] || "";
  const pass = parts.slice(1).join(":");
  return user === cfg.get("shipstation_user") && pass === cfg.get("shipstation_password");
}

function orderToXml(order) {
  const addr = order.shippingAddress || {};
  const shipTo = {
    name: order.customerName || "Customer",
    address1: addr.address_line_1 || addr.street || "",
    address2: addr.address_line_2 || addr.street2 || "",
    city: addr.admin_area_2 || addr.city || "",
    state: addr.admin_area_1 || addr.state || "",
    postalCode: addr.postal_code || addr.zip || "",
    country: (addr.country_code || addr.country || "US").substring(0, 2)
  };
  const fmt = (d) => {
    if (!d) return "";
    const x = new Date(d);
    const m = x.getMonth() + 1;
    const day = x.getDate();
    const h = x.getHours();
    const min = x.getMinutes();
    return m + "/" + day + "/" + x.getFullYear() + " " + h + ":" + (min < 10 ? "0" : "") + min;
  };
  let itemsXml = "";
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    const sku = item.sku || (item.name ? item.name.substring(0, 50) : "SKU");
    const name = item.name || "Product";
    const qty = parseInt(item.quantity || 1);
    const price = parseFloat(item.price || 0);
    itemsXml += "<Item><SKU>" + wrapCdata(sku) + "</SKU><Name>" + wrapCdata(name) + "</Name><Weight>8</Weight><WeightUnits>Ounces</WeightUnits><Quantity>" + qty + "</Quantity><UnitPrice>" + price.toFixed(2) + "</UnitPrice></Item>";
  }
  return "<Order><OrderID>" + wrapCdata(order.id) + "</OrderID><OrderNumber>" + wrapCdata(order.orderNumber) + "</OrderNumber><OrderDate>" + fmt(order.created) + "</OrderDate><OrderStatus>" + wrapCdata(order.status || "paid") + "</OrderStatus><LastModified>" + fmt(order.updated) + "</LastModified><ShippingMethod></ShippingMethod><PaymentMethod>paypal</PaymentMethod><CurrencyCode>USD</CurrencyCode><OrderTotal>" + parseFloat(order.total || 0).toFixed(2) + "</OrderTotal><TaxAmount>0.00</TaxAmount><ShippingAmount>0.00</ShippingAmount><CustomerNotes></CustomerNotes><InternalNotes></InternalNotes><Gift>false</Gift><GiftMessage></GiftMessage><CustomField1></CustomField1><CustomField2></CustomField2><CustomField3></CustomField3><Customer><CustomerCode>" + wrapCdata(order.customerEmail) + "</CustomerCode><BillTo><Name>" + wrapCdata(shipTo.name) + "</Name><Company></Company><Phone></Phone><Email>" + wrapCdata(order.customerEmail) + "</Email></BillTo><ShipTo><Name>" + wrapCdata(shipTo.name) + "</Name><Company></Company><Address1>" + wrapCdata(shipTo.address1) + "</Address1><Address2>" + wrapCdata(shipTo.address2) + "</Address2><City>" + wrapCdata(shipTo.city) + "</City><State>" + wrapCdata(shipTo.state) + "</State><PostalCode>" + wrapCdata(shipTo.postalCode) + "</PostalCode><Country>" + wrapCdata(shipTo.country) + "</Country><Phone></Phone></ShipTo></Customer><Items>" + itemsXml + "</Items></Order>";
}

// --- GET /api/shipstation (export orders XML) ---
routerAdd("GET", "/api/shipstation", (e) => {
  if (!checkShipStationAuth(e)) {
    e.response.header().set("WWW-Authenticate", 'Basic realm="ShipStation Custom Store"');
    return e.string(401, "Unauthorized");
  }
  const action = e.request.url().query().get("action");
  const startDate = e.request.url().query().get("start_date");
  const endDate = e.request.url().query().get("end_date");
  const page = parseInt(e.request.url().query().get("page") || "1");
  if (action !== "export" || !startDate || !endDate) {
    return e.string(400, '<?xml version="1.0"?><Error>Missing action=export, start_date, or end_date</Error>');
  }
  const start = startDate.replace(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/, "$3-$1-$2T$4:$5:00");
  const end = endDate.replace(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/, "$3-$1-$2T$4:$5:59");
  const filter = 'updated >= "' + start + '" && updated <= "' + end + '"';
  const records = e.app.findRecordsByFilter("orders", filter, "-updated", 100, (page - 1) * 100);
  const realOrders = records.filter((r) => !String(r.get("orderNumber") || "").startsWith("TEST-"));
  const orders = realOrders.map((r) => ({
    id: r.id,
    orderNumber: r.get("orderNumber"),
    customerName: r.get("customerName"),
    customerEmail: r.get("customerEmail"),
    created: r.get("created"),
    updated: r.get("updated"),
    total: r.get("total"),
    status: r.get("status"),
    items: r.get("items"),
    shippingAddress: r.get("shippingAddress")
  }));
  const ordersXml = orders.map((o) => orderToXml(o)).join("");
  const xml = '<?xml version="1.0" encoding="utf-8"?><Orders pages="1">' + ordersXml + "</Orders>";
  e.response.header().set("Content-Type", "application/xml; charset=utf-8");
  return e.string(200, xml);
});

// --- POST /api/shipstation (ShipNotice - update order with tracking) ---
routerAdd("POST", "/api/shipstation", (e) => {
  if (!checkShipStationAuth(e)) {
    e.response.header().set("WWW-Authenticate", 'Basic realm="ShipStation Custom Store"');
    return e.string(401, "Unauthorized");
  }
  const raw = toString(e.request.body);
  if (!raw || raw.indexOf("ShipNotice") === -1) {
    return e.string(400, '<?xml version="1.0"?><Error>Invalid ShipNotice XML</Error>');
  }
  const orderNumMatch = raw.match(/<OrderNumber>([^<]*)<\/OrderNumber>/i);
  const trackMatch = raw.match(/<TrackingNumber>([^<]*)<\/TrackingNumber>/i);
  const carrierMatch = raw.match(/<Carrier>([^<]*)<\/Carrier>/i);
  const shipDateMatch = raw.match(/<ShipDate>([^<]*)<\/ShipDate>/i);
  const orderNumber = orderNumMatch ? orderNumMatch[1].trim() : "";
  if (!orderNumber) {
    return e.string(400, '<?xml version="1.0"?><Error>Missing OrderNumber in ShipNotice</Error>');
  }
  let record;
  try {
    record = e.app.findFirstRecordByFilter("orders", "orderNumber = {:orderNumber}", { orderNumber });
  } catch (err) {
    return e.string(404, '<?xml version="1.0"?><Error>Order not found</Error>');
  }
  record.set("trackingNumber", trackMatch ? trackMatch[1].trim() : record.get("trackingNumber"));
  record.set("status", "shipped");
  const extra = (carrierMatch ? " Carrier: " + carrierMatch[1].trim() : "") + (shipDateMatch ? " Shipped: " + shipDateMatch[1].trim() : "");
  record.set("notes", (record.get("notes") || "") + extra);
  e.app.save(record);
  return e.string(200, "OK");
});
