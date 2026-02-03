// Edit button component - shows "Edit in PocketBase" for admins
// Add this to your product pages

import { useState, useEffect } from 'react';

export default function EditButton({ productId, productSlug }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const PB_URL = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

  useEffect(() => {
    // Check if user is admin (you can implement your own auth check)
    const adminToken = localStorage.getItem('pb_admin_token');
    setIsAdmin(!!adminToken);
  }, []);

  if (!isAdmin) return null;

  const editUrl = `${PB_URL}/_/#/collections/products/records/${productId}`;
  const liveUrl = window.location.href;

  return (
    <div className="edit-toolbar" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
        Admin Mode
      </span>
      <a 
        href={editUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'white',
          color: '#667eea',
          padding: '8px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        ✏️ Edit in PocketBase
      </a>
      <button
        onClick={() => {
          // Refresh the page to see changes
          window.location.reload();
        }}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        🔄 Refresh
      </button>
    </div>
  );
}
