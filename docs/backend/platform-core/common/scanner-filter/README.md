# common/scanner-filter (backend)

**Source:** [`nest-js-boilerplate/src/common/scanner-filter/`](../../../../../nest-js-boilerplate/src/common/scanner-filter/) ·
**Category:** [Platform / Core → common](../README.md)

An Express-level middleware (registered in
[`main.ts`](../../../../../nest-js-boilerplate/src/main.ts) **before** the rest of the global
chain) that answers well-known vulnerability-scanner probes with a bare `404 Not Found` so they
never reach helmet/cookies/compression/guards/router — or the structured request logs. Added after
observing ~300 probes/day from cloud-hosted scanners in `backend-logs`.

[`scanner-filter.middleware.ts`](../../../../../nest-js-boilerplate/src/common/scanner-filter/scanner-filter.middleware.ts)
matches deliberately conservative shapes only:

- root-level script probes: `/*.php` (+ `php7`/`phtml`/`asp(x)`/`jsp(x)`/`cgi`)
- scanner directories: `wp-admin`/`wp-content`/`wp-includes`/`wordpress`, `phpmyadmin` variants,
  `vendor/phpunit`
- dotfile probes: `/.env*`, `/.git*` (literal leading dot required — `/environment` never matches)

Nested paths (e.g. an uploaded file that happens to be named `something.php`) never match — only
first-segment probes and the known directories. Every pattern shape is covered in
[`scanner-filter.middleware.spec.ts`](../../../../../nest-js-boilerplate/src/common/scanner-filter/scanner-filter.middleware.spec.ts),
each taken from a live log sample (2026-08-28).
