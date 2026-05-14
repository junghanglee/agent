# Gate 8: Admin Role Permission Enforcement

Date: 2026-05-14 KST

## Status

Completed locally and verified.

## Goal

- Split admin permissions by role.
- Hide restricted menus for `ADMIN`.
- Keep `/admin/admin-users` and `/admin/settings` for `SUPER_ADMIN` only.
- Add page/API-level permission checks.

## Implemented

- Added shared permission definitions:
  - `web/lib/admin-permissions.ts`
  - `AdminRole`
  - `AdminPermission`
  - `ADMIN_ROLE_PERMISSIONS`
- Updated server auth helpers:
  - `hasAdminPermission`
  - `requireAdminPagePermission(permission)`
  - `requireSuperAdminSession()`
  - `assertAdminApiSession(permission?)`
  - `requireAdminApiSession(permission?)`
- Added admin route permission map:
  - `web/lib/admin-routes.ts`
  - `getAdminRoutePermission(pathname)`
- Added client-side route guard:
  - `web/components/admin/admin-page-guard.tsx`
- Updated admin layout/sidebar:
  - Sidebar receives admin role and filters menu items.
  - Client route guard redirects unauthorized role access to `/admin`.
- Added/updated server page permission checks for:
  - Dashboard
  - Customers
  - Products
  - Releases
  - Licenses
  - Settings
  - Admin users
- Added/updated API permission checks for:
  - Admin users
  - Admin user activity
  - Products
  - Releases
  - Install codes
  - Licenses
  - Overview
- Updated server actions for admin-user create/update to require super-admin permission.

## Permission policy

`SUPER_ADMIN`:

- All admin permissions.

`ADMIN`:

- Dashboard
- Customers
- Products
- Releases
- Licenses
- Payments
- Tokens
- LLM Pool
- Monitoring
- Skills
- Support
- Community

Restricted to `SUPER_ADMIN` only:

- Admin account management
- System settings

## Verification

Run from `projects/ai-linker-platform/web`:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three passed locally on 2026-05-14.

## Notes

- Permission constants were split out of `admin-auth.ts` into `admin-permissions.ts` because client components must not import server-only `next/headers` dependencies.
- The client guard is a UX layer only. Server pages and APIs still enforce permission checks.
