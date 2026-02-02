migrate((app) => {
  // --- Products (WooCommerce-like with SKU, GTIN, UPC) ---
  const products = new Collection({
    type: "base",
    name: "products",
    listRule: null,
    viewRule: null,
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { type: "text", name: "name", required: true },
      { type: "text", name: "slug", required: true },
      { type: "text", name: "sku", required: true },
      { type: "text", name: "gtin", required: false },
      { type: "text", name: "upc", required: false },
      { type: "number", name: "price", required: true },
      { type: "editor", name: "description", required: false },
      { type: "text", name: "shortDescription", required: false },
      { type: "text", name: "category", required: false },
      { type: "bool", name: "inStock", required: false, defaultValue: true },
      { type: "number", name: "stock", required: false },
      { type: "file", name: "images", required: false, maxSelect: 20, maxSize: 5242880 },
      { type: "json", name: "imagePaths", required: false },
      { type: "text", name: "weight", required: false },
      { type: "text", name: "dimensions", required: false },
      { type: "text", name: "suggestedUse", required: false },
      { type: "text", name: "supplementFacts", required: false },
      { type: "text", name: "ingredients", required: false },
      { type: "json", name: "keySearchTerms", required: false },
      { type: "json", name: "seoTargets", required: false },
      { type: "json", name: "metadata", required: false }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_products_sku ON products (sku)",
      "CREATE UNIQUE INDEX idx_products_slug ON products (slug)",
      "CREATE INDEX idx_products_gtin ON products (gtin)",
      "CREATE INDEX idx_products_upc ON products (upc)",
      "CREATE INDEX idx_products_category ON products (category)"
    ]
  })
  app.save(products)

  // --- Orders ---
  const orders = new Collection({
    type: "base",
    name: "orders",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: "",
    deleteRule: "",
    fields: [
      { type: "text", name: "orderNumber", required: true },
      { type: "email", name: "customerEmail", required: true },
      { type: "text", name: "customerName", required: true },
      { type: "text", name: "customerPhone", required: false },
      { type: "json", name: "items", required: true },
      { type: "number", name: "total", required: true },
      { type: "number", name: "subtotal", required: false },
      { type: "number", name: "tax", required: false },
      { type: "number", name: "shipping", required: false },
      { type: "select", name: "status", required: true, values: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] },
      { type: "select", name: "paymentMethod", required: false, values: ["paypal", "stripe", "cod", "other"] },
      { type: "text", name: "paymentId", required: false },
      { type: "json", name: "shippingAddress", required: false },
      { type: "text", name: "trackingNumber", required: false },
      { type: "text", name: "trackingUrl", required: false },
      { type: "text", name: "notes", required: false }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_orders_orderNumber ON orders (orderNumber)",
      "CREATE INDEX idx_orders_customerEmail ON orders (customerEmail)",
      "CREATE INDEX idx_orders_status ON orders (status)"
    ]
  })
  app.save(orders)

  // --- Customers ---
  const customers = new Collection({
    type: "base",
    name: "customers",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: "",
    deleteRule: "",
    fields: [
      { type: "email", name: "email", required: true },
      { type: "text", name: "name", required: false },
      { type: "text", name: "phone", required: false },
      { type: "number", name: "ordersCount", required: false },
      { type: "number", name: "totalSpent", required: false },
      { type: "json", name: "addresses", required: false },
      { type: "json", name: "metadata", required: false }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_customers_email ON customers (email)"
    ]
  })
  app.save(customers)
}, (app) => {
  const products = app.findCollectionByNameOrId("products")
  if (products) app.delete(products)
  const orders = app.findCollectionByNameOrId("orders")
  if (orders) app.delete(orders)
  const customers = app.findCollectionByNameOrId("customers")
  if (customers) app.delete(customers)
})
