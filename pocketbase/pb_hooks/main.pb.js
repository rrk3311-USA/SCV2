// Redirect root (/) to admin UI (/_/)
routerAdd("GET", "/", (e) => {
  return e.redirect(302, "/_/")
})

// Admin Extras - AI Agent & Documents & Ads (inside PB admin flow)
routerAdd("GET", "/admin-extras", (e) => {
  const base = e.request().url().split("/admin-extras")[0] || ""
  return e.html(200, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Agent & Documents – Success Chemistry</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; min-height: 100vh; color: #e2e8f0; }
    .container { max-width: 900px; margin: 0 auto; padding: 32px 20px; }
    .back { margin-bottom: 24px; }
    .back a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; }
    .back a:hover { color: #00d4ff; }
    h1 { font-size: 1.75rem; margin-bottom: 8px; color: #fff; }
    .sub { color: #94a3b8; font-size: 0.95rem; margin-bottom: 32px; }
    section { margin-bottom: 32px; }
    h2 { font-size: 1.25rem; margin-bottom: 16px; color: #7c3aed; display: flex; align-items: center; gap: 8px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .card h3 { font-size: 1rem; margin-bottom: 8px; color: #00d4ff; }
    .card p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; }
    .card a { color: #7c3aed; text-decoration: none; }
    .card a:hover { text-decoration: underline; }
    ul { font-size: 0.9rem; color: #94a3b8; padding-left: 20px; line-height: 1.8; }
    code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
    .mascot { width: 80px; height: 80px; margin-bottom: 12px; display: block; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .mascot { animation: float 3s ease-in-out infinite; }
  </style>
</head>
<body>
  <div class="container">
    <div class="back"><a href="/_/">← Back to PocketBase Admin</a> &nbsp;|&nbsp; <a href="/docs">Docs</a></div>
    <img src="https://pocketbase.io/images/logo.svg" alt="PocketBase Gopher" class="mascot">
    <h1>AI Agent & Documents</h1>
    <p class="sub">Success Chemistry – features available from this backend</p>

    <section>
      <h2>🤖 AI Agent (Anthropic / Claude)</h2>
      <div class="card">
        <h3>Commerce Manager (Claude 3.5 Sonnet)</h3>
        <p>Chat, tasks, ad copy, product analysis. Runs as a separate app (Commerce Manager), not inside PocketBase.</p>
        <p>Repo: <code>commerce-manager/</code> → run <code>npm run dev</code> or deploy to Fly. Endpoints: <code>/api/agent/chat</code>, <code>/api/agent/task</code>.</p>
      </div>
      <div class="card">
        <h3>Admin API AI stub</h3>
        <p>Public admin dashboard can call <code>POST /api/ai/ask</code> on the Success Chemistry Admin API (OpenAI stub).</p>
        <p><a href="https://success-chemistry-pb.fly.dev" target="_blank" rel="noopener">success-chemistry-pb.fly.dev</a></p>
      </div>
      <ul>
        <li>PocketBase collections used by Commerce Manager when running: <code>agent_conversations</code>, <code>agent_insights</code>, <code>agent_config</code> (see commerce-manager migrations).</li>
      </ul>
    </section>

    <section>
      <h2>📄 Documents & Ads</h2>
      <div class="card">
        <h3>PocketBase Admin (this app)</h3>
        <p>Products, orders, customers. Optional: automation_tasks, activity_log, agent_config for Commerce Manager.</p>
        <p><a href="/_/">Open PB Admin</a></p>
      </div>
      <div class="card">
        <h3>Ad copy & content</h3>
        <p>Commerce Manager agent generates ad copy and product content. Run Commerce Manager and use <code>/api/agent/chat</code> or <code>/api/agent/task</code>.</p>
      </div>
      <div class="card">
        <h3>Blog & repo docs</h3>
        <p>AI-optimized blog and project docs (e.g. CDP_AGENTIC_MANAGED.md, FLEET_MANAGER_README.md) live in the repo and on the main site.</p>
      </div>
      <ul>
        <li>Admin API (orders, PayPal, ShipStation): <a href="https://success-chemistry-pb.fly.dev" target="_blank" rel="noopener">success-chemistry-pb.fly.dev</a></li>
      </ul>
    </section>

    <section>
      <h2>📋 Scrum / Project Management</h2>
      <div class="card">
        <h3>Current sprint & backlog</h3>
        <p>Track sprints and backlog in GitHub Issues/Projects (success007 repo) or your preferred tool (Jira, Linear, Notion).</p>
      </div>
      <div class="card">
        <h3>Quick links</h3>
        <p><a href="https://github.com" target="_blank" rel="noopener">GitHub Issues / Projects</a> · <a href="https://linear.app" target="_blank" rel="noopener">Linear</a> · <a href="https://www.atlassian.com/software/jira" target="_blank" rel="noopener">Jira</a></p>
      </div>
    </section>

    <section>
      <h2>🔮 Other features (planned)</h2>
      <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 16px;">From the first mention – planned for later. Full list is in the public admin under <strong>Future Upgrades</strong>.</p>
      <div class="card">
        <h3>Email Marketing Integration</h3>
        <p>Connect with email marketing platforms for automated campaigns.</p>
      </div>
      <div class="card">
        <h3>Advanced Analytics</h3>
        <p>Enhanced reporting and customer behavior insights.</p>
      </div>
      <div class="card">
        <h3>Inventory Management</h3>
        <p>Real-time stock tracking and low inventory alerts.</p>
      </div>
      <div class="card">
        <h3>Product Content Downloads (eBooks / Brochures)</h3>
        <p>Downloadable product brochures and eBooks; email capture, PDF generation, download tracking.</p>
      </div>
      <p style="font-size: 0.85rem; color: #64748b; margin-top: 12px;">Public admin → Future Upgrades tab has full details and status.</p>
    </section>
    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #64748b; font-size: 0.85rem;">
      <p>Success Chemistry · Powered by <a href="https://pocketbase.io" target="_blank" rel="noopener" style="color: #7c3aed;">PocketBase</a></p>
      <p style="margin-top: 8px; font-size: 0.75rem;">Gopher from <a href="https://github.com/marcusolsson/gophers" target="_blank" rel="noopener" style="color: #475569;">marcusolsson/gophers</a></p>
    </div>
  </div>
</body>
</html>`)
})

// Docs Portal - serves the documentation landing page
routerAdd("GET", "/docs", (e) => {
  return e.html(200, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Success Chemistry - PocketBase Docs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
    }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 50px; }
    .mascot {
      width: 150px; height: 150px; margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .header h1 {
      font-size: 2.5rem; margin-bottom: 10px;
      background: linear-gradient(90deg, #00d4ff, #7c3aed);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .header p { color: #94a3b8; font-size: 1.1rem; }
    .admin-link {
      display: inline-block; margin-top: 20px; padding: 12px 30px;
      background: linear-gradient(90deg, #7c3aed, #00d4ff);
      color: #fff; text-decoration: none; border-radius: 30px; font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .admin-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
    }
    .docs-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-top: 40px;
    }
    .doc-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; padding: 25px;
      transition: transform 0.2s, background 0.2s;
      text-decoration: none; color: inherit;
    }
    .doc-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.1); }
    .doc-card .icon { font-size: 2rem; margin-bottom: 15px; }
    .doc-card h3 { font-size: 1.2rem; margin-bottom: 10px; color: #fff; }
    .doc-card p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
    .doc-card .tag {
      display: inline-block; margin-top: 15px; padding: 4px 12px;
      background: rgba(124, 58, 237, 0.3); border-radius: 20px;
      font-size: 0.75rem; color: #c4b5fd;
    }
    .quick-links { margin-top: 50px; text-align: center; }
    .quick-links h2 { font-size: 1.5rem; margin-bottom: 20px; color: #e2e8f0; }
    .quick-links a {
      display: inline-block; margin: 5px; padding: 8px 20px;
      background: rgba(255, 255, 255, 0.1); border-radius: 20px;
      color: #94a3b8; text-decoration: none; font-size: 0.9rem;
      transition: background 0.2s, color 0.2s;
    }
    .quick-links a:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
    .footer { margin-top: 60px; text-align: center; color: #64748b; font-size: 0.85rem; }
    .footer a { color: #7c3aed; text-decoration: none; }
    .gopher-credit { margin-top: 10px; font-size: 0.75rem; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://pocketbase.io/images/logo.svg" alt="PocketBase Gopher" class="mascot">
      <h1>Success Chemistry Docs</h1>
      <p>PocketBase Backend Documentation Portal</p>
      <a href="/_/" class="admin-link">Open Admin Dashboard</a>
      <a href="/admin-extras" class="admin-link" style="margin-left: 10px; background: rgba(124, 58, 237, 0.8);">AI Agent & Documents</a>
    </div>
    <div class="docs-grid">
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/README.md" class="doc-card" target="_blank">
        <div class="icon">🚀</div>
        <h3>Getting Started</h3>
        <p>Quick start guide for PocketBase setup, download, and first run.</p>
        <span class="tag">Start Here</span>
      </a>
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/COLLECTIONS_SETUP.md" class="doc-card" target="_blank">
        <div class="icon">🗃️</div>
        <h3>Collections Setup</h3>
        <p>Database schema for products, orders, and customers collections.</p>
        <span class="tag">Database</span>
      </a>
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/SHIPSTATION_INTEGRATION.md" class="doc-card" target="_blank">
        <div class="icon">📦</div>
        <h3>ShipStation Integration</h3>
        <p>Custom Store flow for 3PL fulfillment without WooCommerce.</p>
        <span class="tag">Fulfillment</span>
      </a>
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/USER_MANAGEMENT.md" class="doc-card" target="_blank">
        <div class="icon">👥</div>
        <h3>User Management</h3>
        <p>Adding admins and users, permissions, OAuth, password resets.</p>
        <span class="tag">Users</span>
      </a>
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/SCRIPTS_LIBRARY.md" class="doc-card" target="_blank">
        <div class="icon">⚡</div>
        <h3>Scripts Library</h3>
        <p>Ready-to-use JavaScript: Google Ads, OpenAI, PayPal, AI Agent.</p>
        <span class="tag">Code</span>
      </a>
      <a href="https://github.com/your-repo/success007/blob/main/pocketbase/QUICKSTART.md" class="doc-card" target="_blank">
        <div class="icon">📋</div>
        <h3>Quick Reference</h3>
        <p>Cheat sheet for common PocketBase operations and API calls.</p>
        <span class="tag">Reference</span>
      </a>
    </div>
    <div class="quick-links">
      <h2>External Resources</h2>
      <a href="https://pocketbase.io/docs/" target="_blank">📚 Official Docs</a>
      <a href="https://github.com/pocketbase/pocketbase" target="_blank">💻 GitHub</a>
      <a href="https://github.com/pocketbase/js-sdk" target="_blank">📦 JS SDK</a>
      <a href="https://github.com/pocketbase/pocketbase/discussions" target="_blank">💬 Community</a>
      <a href="/admin-extras">🤖 AI Agent & Documents</a>
    </div>
    <div class="footer">
      <p>Success Chemistry © 2026 | Powered by <a href="https://pocketbase.io" target="_blank">PocketBase</a></p>
      <p class="gopher-credit">Gopher artwork from <a href="https://github.com/marcusolsson/gophers" target="_blank">marcusolsson/gophers</a></p>
    </div>
  </div>
</body>
</html>`)
})
