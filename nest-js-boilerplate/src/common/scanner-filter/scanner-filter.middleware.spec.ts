import type { Request, Response } from 'express';
import {
  isScannerPath,
  scannerFilterMiddleware,
} from './scanner-filter.middleware';

describe('isScannerPath', () => {
  // Every shape below was observed live in backend-logs on 2026-08-28.
  it.each([
    '/shiny.php',
    '/1.php',
    '//aa.php',
    '/this_is_a_new_hello_world.php',
    '/index.PHP',
    '/probe.php7',
    '/login.asp',
    '/cmd.jsp',
    '/test.cgi',
    '/wp-content/plugins/hellopress/wp_filemanager.php',
    '/wp-admin',
    '/wp-includes/x.js',
    '/wordpress/',
    '/phpmyadmin/index.php',
    '/PMA/',
    '/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php',
    '/.env',
    '/.env.bak',
    '/.git/config',
  ])('blocks %s', (path) => {
    expect(isScannerPath(path)).toBe(true);
  });

  it.each([
    '/',
    '/graphql',
    '/api/friends',
    '/rtc/webhook/livekit',
    '/uploads/report.pdf',
    '/favicon.ico',
    // Nested file paths are deliberately allowed — an uploaded file named
    // something.php must stay downloadable.
    '/files/legacy/archive.php',
    // Dot-prefix required: plain words that merely start like the dotfiles
    // are legitimate route material.
    '/environment',
    '/gitlab',
    '/.well-known/security.txt',
  ])('allows %s', (path) => {
    expect(isScannerPath(path)).toBe(false);
  });
});

describe('scannerFilterMiddleware', () => {
  function run(path: string) {
    const req = { method: 'GET', path } as Request;
    // Asserted on directly (not via the Response-typed object) so the
    // unbound-method lint rule doesn't fire on Express's method types.
    const status = jest.fn().mockReturnThis();
    const type = jest.fn().mockReturnThis();
    const send = jest.fn().mockReturnThis();
    const res = { status, type, send } as unknown as Response;
    const next = jest.fn();
    scannerFilterMiddleware(req, res, next);
    return { status, send, next };
  }

  it('answers a scanner probe with a bare 404 and never calls next()', () => {
    const { status, send, next } = run('/wp-content/plugins/x.php');
    expect(status).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith('Not Found');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes normal requests through untouched', () => {
    const { status, next } = run('/api/friends');
    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });
});
