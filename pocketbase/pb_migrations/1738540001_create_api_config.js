// API config for PayPal and ShipStation (single backend)
// One record: store PayPal client id/secret and ShipStation Basic Auth in PB admin

migrate((db) => {
  const apiConfig = new Collection({
    name: 'api_config',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    schema: [
      { name: 'paypal_client_id', type: 'text', required: false },
      { name: 'paypal_client_secret', type: 'text', required: false },
      { name: 'paypal_mode', type: 'text', required: false }, // sandbox | live
      { name: 'shipstation_user', type: 'text', required: false },
      { name: 'shipstation_password', type: 'text', required: false }
    ]
  });
  return db.save(apiConfig);
}, (db) => {
  const c = db.findCollectionByNameOrId('api_config');
  if (c) db.delete(c);
});
