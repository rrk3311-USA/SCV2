# User Management Guide

How to add and manage users in the PocketBase admin dashboard.

## Quick Access

- **Local**: http://localhost:8090/_/
- **Production**: https://success-chemistry-pb.fly.dev/_/

## User Types in PocketBase

PocketBase has two types of users:

### 1. Admin Users
- **Full access** to admin dashboard (`/_/`)
- Can manage collections, settings, and all data
- Can create/edit/delete any records
- Can manage other admins
- **Use for**: Internal team members, developers

### 2. Regular Users (Collection: `users`)
- **No admin access** (cannot access `/_/`)
- Can only access data via API (with proper auth rules)
- Can authenticate via email/password or OAuth
- **Use for**: Customers, app users, restricted access

---

## Adding Admin Users

### Method 1: Via Admin UI (Recommended)

1. **Login to Admin Dashboard**:
   - Local: http://localhost:8090/_/
   - Production: https://success-chemistry-pb.fly.dev/_/

2. **Navigate to Admins**:
   - Click **Settings** (gear icon) in left sidebar
   - Click **Admins** tab

3. **Create New Admin**:
   - Click **New admin** button
   - Enter:
     - **Email**: admin@successchemistry.com
     - **Password**: (strong password)
   - Click **Create**

4. **Done!** The new admin can now login at `/_/`

### Method 2: Via Command Line (First Admin Only)

If you don't have any admin accounts yet:

```bash
cd pocketbase
./pocketbase admin create admin@successchemistry.com your-password
```

This creates the first admin account so you can login to the UI.

### Method 3: Via API (Programmatic)

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// Login as existing admin first
await pb.admins.authWithPassword('admin@example.com', 'password');

// Create new admin
await pb.admins.create({
  email: 'newadmin@example.com',
  password: 'securepassword',
  passwordConfirm: 'securepassword'
});
```

---

## Adding Regular Users

Regular users are stored in the `users` collection (not admins). They can login to your app but **cannot** access the admin dashboard.

### Method 1: Via Admin UI

1. **Login to Admin Dashboard**: http://localhost:8090/_/

2. **Navigate to Users Collection**:
   - Click **Collections** in left sidebar
   - Click **users** collection

3. **Create New User**:
   - Click **New record** button
   - Enter:
     - **Email**: customer@example.com
     - **Password**: (password)
     - **Name**: John Doe (if you have a name field)
     - Any other custom fields
   - Click **Create**

4. **Email Verification** (optional):
   - By default, users are created with `verified: false`
   - To verify manually: Edit user → Check **verified** → Save
   - Or send verification email: Click **Send verification email**

### Method 2: Self-Registration (Frontend)

Allow users to register themselves from your site:

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// User registers
await pb.collection('users').create({
  email: 'customer@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  name: 'John Doe',
  // Add any custom fields you've added to users collection
});

// Send verification email (optional)
await pb.collection('users').requestVerification('customer@example.com');
```

### Method 3: Via API (Programmatic)

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// Login as admin first
await pb.admins.authWithPassword('admin@example.com', 'password');

// Create user
await pb.collection('users').create({
  email: 'customer@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  verified: true, // Skip email verification
  name: 'John Doe'
});
```

---

## User Authentication

### Email/Password Login

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// User login
const authData = await pb.collection('users').authWithPassword(
  'customer@example.com',
  'password123'
);

console.log(authData.token); // JWT token
console.log(authData.record); // User record
```

### OAuth2 Login (Google, Facebook, etc.)

1. **Enable OAuth in Admin UI**:
   - Settings → Auth providers
   - Enable Google, Facebook, etc.
   - Enter Client ID and Secret

2. **Frontend login**:
   ```javascript
   // Redirect to OAuth provider
   const authData = await pb.collection('users').authWithOAuth2({
     provider: 'google'
   });
   ```

---

## Managing User Permissions

### Collection Rules (API Access)

By default, users can only access their own data. You can customize this in the admin UI:

1. **Go to Collections** → **users**
2. **Click API Rules** tab
3. **Set rules**:
   - **List/Search**: `@request.auth.id != ""`
   - **View**: `@request.auth.id = id`
   - **Create**: (empty for public registration, or add rules)
   - **Update**: `@request.auth.id = id`
   - **Delete**: `@request.auth.id = id`

### Example: Allow users to view their own orders

1. **Go to Collections** → **orders**
2. **API Rules** → **List/Search**:
   ```
   @request.auth.id != "" && customerEmail = @request.auth.email
   ```
3. **API Rules** → **View**:
   ```
   @request.auth.id != "" && customerEmail = @request.auth.email
   ```

Now users can only see orders with their email address.

---

## Custom User Fields

You can add custom fields to the `users` collection:

1. **Go to Collections** → **users**
2. **Click Fields** tab
3. **Add field**:
   - **Name**: `phone`
   - **Type**: Text
   - **Required**: No
4. **Save**

Now users can have a phone number:

```javascript
await pb.collection('users').create({
  email: 'customer@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  phone: '+1-555-0100' // Custom field
});
```

---

## Password Reset

### Via Admin UI

1. **Go to Collections** → **users**
2. **Find user** → Click to edit
3. **Change password**:
   - Enter new password
   - Confirm password
   - Click **Save**

### Via API (Self-Service)

```javascript
// User requests password reset
await pb.collection('users').requestPasswordReset('customer@example.com');

// User receives email with token
// User submits new password with token
await pb.collection('users').confirmPasswordReset(
  'TOKEN_FROM_EMAIL',
  'newpassword123',
  'newpassword123'
);
```

---

## Deleting Users

### Via Admin UI

1. **Go to Collections** → **users**
2. **Find user** → Click to edit
3. **Click Delete** button
4. **Confirm deletion**

### Via API

```javascript
// Login as admin first
await pb.admins.authWithPassword('admin@example.com', 'password');

// Delete user
await pb.collection('users').delete('USER_ID');
```

---

## Viewing User Activity

### Recent Users

1. **Go to Collections** → **users**
2. **Sort by**: `created` (descending)
3. See newest users first

### User Orders

1. **Go to Collections** → **orders**
2. **Filter by email**:
   - Click **Filter** button
   - Add filter: `customerEmail = "customer@example.com"`
   - Click **Apply**

---

## Admin Roles (Future)

PocketBase doesn't have built-in admin roles (all admins have full access). If you need role-based access:

1. **Create a custom `admins` collection** (separate from built-in admins)
2. **Add fields**:
   - `email` (Email)
   - `password` (Password)
   - `role` (Select: super_admin, manager, viewer)
3. **Use API rules** to restrict access based on role

---

## Security Best Practices

### For Admins

- **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
- **Enable 2FA** (if available in your PocketBase version)
- **Limit admin accounts** (only give admin access to trusted team members)
- **Use separate accounts** (don't share admin credentials)

### For Users

- **Require email verification** (Settings → Mail settings)
- **Set password requirements** (Settings → Auth settings)
- **Enable rate limiting** (Settings → Application → Rate limiter)
- **Use HTTPS in production** (Fly.io/Railway provide this automatically)

---

## Troubleshooting

### Can't login to admin dashboard

1. **Check URL**: Should be `/_/` (with trailing slash)
2. **Check credentials**: Email and password must match exactly
3. **Reset admin password**:
   ```bash
   cd pocketbase
   ./pocketbase admin update admin@example.com newpassword
   ```

### User can't login

1. **Check email verification**: User may need to verify email first
2. **Check password**: Case-sensitive
3. **Check collection rules**: Make sure auth is enabled for users collection

### User can't access data via API

1. **Check API rules**: Collections → [collection] → API Rules
2. **Check authentication**: User must be logged in (`@request.auth.id != ""`)
3. **Check permissions**: Rules must allow the action

---

## Environment Variables

For automated admin creation (e.g., in CI/CD):

```bash
# .env
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your-secure-password
```

Then in your startup script:

```bash
# Create admin if not exists
./pocketbase admin create $PB_ADMIN_EMAIL $PB_ADMIN_PASSWORD 2>/dev/null || true
./pocketbase serve
```

---

## Related Documentation

- [PocketBase Collections Setup](./COLLECTIONS_SETUP.md) - Database schema
- [PocketBase README](./README.md) - Quick start guide
- [PocketBase Auth Docs](https://pocketbase.io/docs/authentication/) - Official auth docs
- [PocketBase API Rules](https://pocketbase.io/docs/api-rules-and-filters/) - Permission rules

---

## Quick Reference

| Task | Method |
|------|--------|
| Add admin | Settings → Admins → New admin |
| Add user | Collections → users → New record |
| Reset password | Collections → users → Edit user → Change password |
| Delete user | Collections → users → Edit user → Delete |
| View user orders | Collections → orders → Filter by `customerEmail` |
| Change permissions | Collections → [collection] → API Rules |
| Enable OAuth | Settings → Auth providers |
