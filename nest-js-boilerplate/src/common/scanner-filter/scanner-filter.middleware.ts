import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('ScannerFilter');

// Path shapes seen only from vulnerability scanners (live sample 2026-08-28:
// ~280 root-level *.php + wp-* probes from three cloud IPs in a single day).
// The app has no PHP, WordPress, or dotfile routes, so these are answered
// immediately instead of running the helmet/cookie/compression/guard
// pipeline and landing in the request logs as 404 noise. Deliberately
// conservative: only first-segment file probes and well-known scanner
// directories match — nested paths (e.g. an uploaded file that happens to be
// named something.php) never do.
const SCANNER_PATH_PATTERNS: RegExp[] = [
  // /shiny.php, //aa.php, /index.php7, /login.asp, /cmd.jsp, /test.cgi
  /^\/{1,2}[^/]*\.(php\d?|phtml|asp|aspx|jsp|jspx|cgi)$/i,
  /^\/{1,2}(wp-admin|wp-content|wp-includes|wordpress)(\/|$)/i,
  /^\/{1,2}(phpmyadmin|pma|myadmin|mysqladmin)(\/|$)/i,
  /^\/{1,2}vendor\/phpunit(\/|$)/i,
  // /.env, /.env.bak, /.git/config — but not /environment or /gitlab-style
  // words: the literal dot prefix is required.
  /^\/{1,2}\.(env|git)([./-]|$)/i,
];

export function isScannerPath(path: string): boolean {
  return SCANNER_PATH_PATTERNS.some((re) => re.test(path));
}

/**
 * Express-level middleware registered in main.ts before the rest of the
 * global chain. Answers well-known vulnerability-scanner probes with a bare
 * 404 so they never reach the router, the auth guards, or the structured
 * request logs.
 */
export function scannerFilterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!isScannerPath(req.path)) {
    next();
    return;
  }
  logger.debug(`blocked scanner probe: ${req.method} ${req.path}`);
  res.status(404).type('text/plain').send('Not Found');
}
