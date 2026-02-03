// Add "View Live" links to products in PocketBase admin
// Shows a button to view the product on your live site

onRecordViewRequest((e) => {
  const record = e.record
  
  // Add custom field with link to live site
  if (record.collection().name === 'products') {
    const liveUrl = `https://successchemistry.com/product/${record.getString('slug')}`
    
    // This will show in the admin UI
    record.set('_liveUrl', liveUrl)
  }
}, 'products')

// Log when products are updated
onRecordAfterUpdateRequest((e) => {
  const record = e.record
  
  console.log(`✏️ Product updated: ${record.getString('name')} (${record.getString('sku')})`)
  console.log(`   View live: https://successchemistry.com/product/${record.getString('slug')}`)
  
  // Optional: Clear cache or trigger rebuild
  // You could call your site's revalidation endpoint here
}, 'products')
