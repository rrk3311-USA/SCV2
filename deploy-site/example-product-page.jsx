// Example: How to use live PocketBase data in your product page
// Replace your current product page with this pattern

import { getProductBySlug, formatProduct } from './product-loader.js';
import EditButton from './components/EditButton.jsx';

export default function ProductPage({ product }) {
  if (!product) {
    return <div>Product not found</div>;
  }

  const formattedProduct = formatProduct(product);

  return (
    <div className="product-page">
      {/* Product content */}
      <div className="product-container">
        <div className="product-images">
          <img src={formattedProduct.imageUrl} alt={product.name} />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          
          {/* This description comes LIVE from PocketBase */}
          <div 
            className="product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          <div className="product-price">
            ${product.price}
          </div>

          <button className="add-to-cart">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Admin edit button (only shows for logged-in admins) */}
      <EditButton 
        productId={product.id} 
        productSlug={product.slug} 
      />
    </div>
  );
}

// Server-side: Fetch product data from PocketBase
export async function getServerSideProps({ params }) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product }
  };
}

// OR if using static generation with revalidation:
export async function getStaticProps({ params }) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product },
    revalidate: 60 // Revalidate every 60 seconds
  };
}
