/**
 * ShipStation Custom Store Integration
 * Exposes a web endpoint for ShipStation (or compatible 3PL) to:
 * - GET: Pull orders from PocketBase in ShipStation XML format
 * - POST: Receive ShipNotice with tracking, update PocketBase orders
 *
 * See: https://help.shipstation.com/hc/en-us/articles/360025856192-Custom-Store-Development-Guide
 */

const PB_URL = process.env.PB_URL || 'https://success-chemistry-pb.fly.dev';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || '';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || '';
const SHIPSTATION_STORE_USER = process.env.SHIPSTATION_STORE_USER || '';
const SHIPSTATION_STORE_PASSWORD = process.env.SHIPSTATION_STORE_PASSWORD || '';

function escapeCdata(str) {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;');
}

function wrapCdata(str) {
  if (str == null || str === '') return '';
  return `<![CDATA[${String(str).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

async function getPocketBaseAdminToken() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: PB_ADMIN_EMAIL,
      password: PB_ADMIN_PASSWORD
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PocketBase admin auth failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.token;
}

function parseShipStationDate(str) {
  const m = String(str).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (m) return new Date(+m[3], +m[1] - 1, +m[2], +m[4], +m[5], 0);
  return new Date(str);
}

async function fetchOrdersFromPocketBase(startDate, endDate, page = 1, perPage = 100) {
  const token = await getPocketBaseAdminToken();
  const start = parseShipStationDate(startDate).toISOString().slice(0, 19);
  const end = parseShipStationDate(endDate).toISOString().slice(0, 19);
  const filter = `updated >= "${start}" && updated <= "${end}"`;
  const url = `${PB_URL}/api/collections/orders/records?filter=(${encodeURIComponent(filter)})&sort=-updated&page=${page}&perPage=${perPage}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PocketBase orders fetch failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return { items: json.items || [], totalPages: json.totalPages || 1 };
}

function orderToShipStationXml(order) {
  const addr = order.shippingAddress || {};
  const shipTo = {
    name: order.customerName || 'Customer',
    company: addr.company || '',
    address1: addr.address_line_1 || addr.street || addr.address1 || '',
    address2: addr.address_line_2 || addr.street2 || addr.address2 || '',
    city: addr.admin_area_2 || addr.city || '',
    state: addr.admin_area_1 || addr.state || '',
    postalCode: addr.postal_code || addr.zip || '',
    country: (addr.country_code || addr.country || 'US').substring(0, 2),
    phone: order.customerPhone || ''
  };

  const orderDate = order.created ? new Date(order.created) : new Date();
  const lastModified = order.updated ? new Date(order.updated) : orderDate;
  const fmt = (d) => {
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = d.getHours();
    const min = d.getMinutes();
    return `${m}/${day}/${d.getFullYear()} ${h}:${String(min).padStart(2, '0')}`;
  };

  let itemsXml = '';
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    const sku = item.sku || item.name?.substring(0, 50) || 'SKU';
    const name = item.name || 'Product';
    const qty = parseInt(item.quantity || 1);
    const price = parseFloat(item.price || 0);
    const imageUrl = item.image || '';
    const weight = item.weight != null ? item.weight : 8;
    const upc = item.upc || item.gtin || '';
    const adjustment = !!item.adjustment;
    itemsXml += `
      <Item>
        <SKU>${wrapCdata(sku)}</SKU>
        <Name>${wrapCdata(name)}</Name>
        ${imageUrl ? `<ImageUrl>${wrapCdata(imageUrl)}</ImageUrl>` : ''}
        <Weight>${weight}</Weight>
        <WeightUnits>Ounces</WeightUnits>
        <Quantity>${qty}</Quantity>
        <UnitPrice>${price.toFixed(2)}</UnitPrice>
        ${upc ? `<UPC>${wrapCdata(upc)}</UPC>` : ''}
        ${adjustment ? '<Adjustment>true</Adjustment>' : ''}
      </Item>`;
  }

  return `
  <Order>
    <OrderID>${wrapCdata(order.id)}</OrderID>
    <OrderNumber>${wrapCdata(order.orderNumber)}</OrderNumber>
    <OrderDate>${fmt(orderDate)}</OrderDate>
    <OrderStatus>${wrapCdata(order.status || 'paid')}</OrderStatus>
    <LastModified>${fmt(lastModified)}</LastModified>
    <ShippingMethod>${wrapCdata(order.shippingMethod || '')}</ShippingMethod>
    <PaymentMethod>${wrapCdata(order.paymentMethod || 'paypal')}</PaymentMethod>
    <CurrencyCode>USD</CurrencyCode>
    <OrderTotal>${parseFloat(order.total || 0).toFixed(2)}</OrderTotal>
    <TaxAmount>${parseFloat(order.tax || 0).toFixed(2)}</TaxAmount>
    <ShippingAmount>${parseFloat(order.shipping || 0).toFixed(2)}</ShippingAmount>
    <CustomerNotes>${wrapCdata(order.notes || '')}</CustomerNotes>
    <InternalNotes></InternalNotes>
    <Gift>false</Gift>
    <GiftMessage></GiftMessage>
    <CustomField1></CustomField1>
    <CustomField2></CustomField2>
    <CustomField3></CustomField3>
    <Customer>
      <CustomerCode>${wrapCdata(order.customerEmail)}</CustomerCode>
      <BillTo>
        <Name>${wrapCdata(shipTo.name)}</Name>
        <Company>${wrapCdata(shipTo.company)}</Company>
        <Phone>${wrapCdata(shipTo.phone)}</Phone>
        <Email>${wrapCdata(order.customerEmail)}</Email>
      </BillTo>
      <ShipTo>
        <Name>${wrapCdata(shipTo.name)}</Name>
        <Company>${wrapCdata(shipTo.company)}</Company>
        <Address1>${wrapCdata(shipTo.address1)}</Address1>
        <Address2>${wrapCdata(shipTo.address2)}</Address2>
        <City>${wrapCdata(shipTo.city)}</City>
        <State>${wrapCdata(shipTo.state)}</State>
        <PostalCode>${wrapCdata(shipTo.postalCode)}</PostalCode>
        <Country>${wrapCdata(shipTo.country)}</Country>
        <Phone>${wrapCdata(shipTo.phone)}</Phone>
      </ShipTo>
    </Customer>
    <Items>${itemsXml}
    </Items>
  </Order>`;
}

function parseShipNoticeXml(xml) {
  const extract = (tag) => {
    const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i'));
    return m ? m[1].trim() : '';
  };
  return {
    orderNumber: extract('OrderNumber'),
    orderId: extract('OrderID'),
    customerCode: extract('CustomerCode'),
    trackingNumber: extract('TrackingNumber'),
    carrier: extract('Carrier'),
    service: extract('Service'),
    shipDate: extract('ShipDate'),
    shippingCost: extract('ShippingCost')
  };
}

async function updatePocketBaseOrderWithTracking(orderNumber, trackingNumber, carrier, shipDate) {
  const token = await getPocketBaseAdminToken();
  const listRes = await fetch(
    `${PB_URL}/api/collections/orders/records?filter=${encodeURIComponent(`orderNumber="${orderNumber}"`)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) throw new Error(`PocketBase lookup failed: ${listRes.status}`);
  const listJson = await listRes.json();
  const order = listJson.items?.[0];
  if (!order) throw new Error(`Order not found: ${orderNumber}`);

  const updateRes = await fetch(`${PB_URL}/api/collections/orders/records/${order.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      trackingNumber: trackingNumber || order.trackingNumber,
      status: 'shipped',
      notes: (order.notes || '') + (carrier ? `\nCarrier: ${carrier}` : '') + (shipDate ? ` | Shipped: ${shipDate}` : '')
    })
  });
  if (!updateRes.ok) {
    const text = await updateRes.text();
    throw new Error(`PocketBase update failed: ${updateRes.status} ${text}`);
  }
}

export function shipstationBasicAuth(req, res, next) {
  if (!SHIPSTATION_STORE_USER || !SHIPSTATION_STORE_PASSWORD) {
    return res.status(503).set('Content-Type', 'text/xml').send(
      '<?xml version="1.0"?><Error>ShipStation Custom Store not configured. Set SHIPSTATION_STORE_USER and SHIPSTATION_STORE_PASSWORD.</Error>'
    );
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="ShipStation Custom Store"');
    return res.status(401).send('Unauthorized');
  }
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  if (user !== SHIPSTATION_STORE_USER || pass !== SHIPSTATION_STORE_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="ShipStation Custom Store"');
    return res.status(401).send('Unauthorized');
  }
  next();
}

export async function handleShipStationExport(req, res) {
  const action = req.query.action;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;
  const page = parseInt(req.query.page || '1', 10);

  if (action !== 'export' || !startDate || !endDate) {
    return res.status(400).set('Content-Type', 'text/xml').send(
      '<?xml version="1.0"?><Error>Missing action=export, start_date, or end_date</Error>'
    );
  }

  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    return res.status(503).set('Content-Type', 'text/xml').send(
      '<?xml version="1.0"?><Error>PocketBase not configured. Set PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD.</Error>'
    );
  }

  try {
    const { items, totalPages } = await fetchOrdersFromPocketBase(startDate, endDate, page);
    // Exclude TEST- orders (sandbox) – supplier never receives fake test orders
    const realOrders = items.filter((o) => !String(o.orderNumber || '').startsWith('TEST-'));
    const ordersXml = realOrders.map((o) => orderToShipStationXml(o)).join('\n');
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<Orders pages="${totalPages}">${ordersXml}
</Orders>`;
    res.set('Content-Type', 'application/xml; charset=utf-8').send(xml);
  } catch (e) {
    console.error('ShipStation export error:', e);
    res.status(500).set('Content-Type', 'text/xml').send(
      `<?xml version="1.0"?><Error>${escapeCdata(e.message)}</Error>`
    );
  }
}

export async function handleShipStationShipNotify(req, res) {
  const body = req.body;
  const xml = typeof body === 'string' ? body : (body && body.toString ? body.toString() : '');
  if (!xml || !xml.includes('ShipNotice')) {
    return res.status(400).set('Content-Type', 'text/xml').send(
      '<?xml version="1.0"?><Error>Invalid ShipNotice XML</Error>'
    );
  }

  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    return res.status(503).set('Content-Type', 'text/xml').send(
      '<?xml version="1.0"?><Error>PocketBase not configured.</Error>'
    );
  }

  try {
    const notice = parseShipNoticeXml(xml);
    const orderNumber = notice.orderNumber || notice.orderId;
    if (!orderNumber) {
      return res.status(400).set('Content-Type', 'text/xml').send(
        '<?xml version="1.0"?><Error>Missing OrderNumber in ShipNotice</Error>'
      );
    }
    await updatePocketBaseOrderWithTracking(
      orderNumber,
      notice.trackingNumber,
      notice.carrier,
      notice.shipDate
    );
    res.status(200).send('OK');
  } catch (e) {
    console.error('ShipStation shipNotify error:', e);
    res.status(500).set('Content-Type', 'text/xml').send(
      `<?xml version="1.0"?><Error>${escapeCdata(e.message)}</Error>`
    );
  }
}
