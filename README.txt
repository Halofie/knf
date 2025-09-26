Files changed on 2025-09-26 (full list):

- public/js/admin.js
	Purpose: normalize fetch usage, attach X-CSRF-Token automatically for non-GET requests, set Accept for JSON, and improve error handling / fallback messages in the admin UI.

- home.html
	Purpose: minor front-end link and asset path fixes (login links -> login/login.php, asset path corrections, CTA changed to an anchor).

- login/login.html (deleted)
	Purpose: removed outdated static login page (replaced by PHP login form that includes CSRF token).

- login/login.php (added)
	Purpose: server-rendered login page that injects a per-session CSRF token into a hidden field and posts to `knft/authenticate.php`.

- knft/authenticate.php
	Purpose: login handler updated to validate CSRF token, rotate/set per-session CSRF token after successful login, and adjust redirect targets to `login.php`.

- knft/header.php
	Purpose: small cleanup and safer session_start() handling; preserved original CORS behavior for development.

- knft/auth_check.php (new)
	Purpose: reusable guard included by admin endpoints to enforce admin session and verify CSRF tokens on state-changing requests (returns 403 JSON on failure).

- knft/deleteUoM.php
- knft/deleteCategory.php
- knft/deleteProduct.php
- knft/deleteSupplier.php
- knft/deleteCustomer.php
- knft/editTrayStatus.php
	Purpose (for each): these toggle-style endpoints now include a human-facing JSON `message` on success so the admin UI displays consistent feedback (e.g. "UoM status updated.").

- Files updated to include `require_once 'auth_check.php'` to enforce session+CSRF guard (examples):
	knft/deleteRoute.php
	knft/deleteWeek.php
	knft/editCategory.php
	knft/editCustomer.php
	knft/editFarmerRank.php
	knft/editFulfillment.php
	knft/editMessage.php
	knft/editProducts.php
	knft/editRoutes.php
	knft/editSupplier.php
	knft/editUoM.php
	knft/editUserLock.php
	knft/editWeek.php
	knft/getCategory.php
	knft/getCustomer.php
	knft/getDashboardStats.php
	knft/getFarmerProdMatching.php
	knft/getFarmerRank.php
	knft/getOrderFullfill.php
	knft/getProduct.php
	knft/getRoutes.php
	knft/getSupplier.php
	knft/getTrayStatus.php
	knft/getUoM.php
	knft/getUserLock.php
	knft/getWeek.php
	knft/loadTempInventory.php
	knft/logout.php
	knft/printorder.php
	knft/removeQuantity.php
	knft/submitCategory.php
	knft/submitCustomer.php
	knft/submitCustomerAcc.php
	knft/submitINV.php
	knft/submitNote.php
	knft/submitOrder.php
	knft/submitProduct.php
	knft/submitRoute.php
	knft/submitSupplier.php
	knft/submitSupplierAcc.php
	knft/submitUoM.php
	knft/submitWeek.php
	knft/submitfinalorder.php
	knft/transferFile.php
	knft/trunc_temp.php
	knft/updateTrayNumber.php
	knft/weekly_invoice_report.php
	knft/weekly_report.php

	Purpose: these files were updated to include the `auth_check.php` guard (session + CSRF verification) so protected admin endpoints require a logged-in admin and a valid CSRF token for state-changing requests.

Verification performed today:
- Ran PHP syntax checks (`php -l`) on the main toggle endpoints edited (no syntax errors reported).
- Confirmed `admin/adminfr.php` exposes `window.CSRF_TOKEN` for the admin UI to consume.

Notes / next steps (optional):
- I can expand this list into a one-line changelog entry for each file with the exact diff hunk if you want the README to be exhaustively precise.
- I can run an end-to-end smoke test against a running dev server to verify UI messages are shown (needs server running).

End of 2025-09-26 changelog.
