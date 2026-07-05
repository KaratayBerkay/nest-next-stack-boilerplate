import { renderTemplate } from './render';

describe('renderTemplate', () => {
  describe('unknown template', () => {
    it('returns empty strings for an unknown template name', () => {
      expect(renderTemplate('nonexistent', {})).toEqual({
        subject: '',
        html: '',
        text: '',
      });
    });
  });

  describe('email-verification', () => {
    const url = 'https://example.com/verify?token=abc123';

    it('renders subject, link, and text', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: 'Alice',
      });
      expect(result.subject).toBe('Confirm your email');
      expect(result.html).toContain(url);
      expect(result.html).toContain('Confirm Email');
      expect(result.text).toBe(`Confirm your email: ${url}`);
    });

    it('greets by name when provided', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: 'Bob',
      });
      expect(result.html).toContain('Hi Bob,');
    });

    it('uses generic greeting when name is empty', () => {
      const result = renderTemplate('email-verification', { url });
      expect(result.html).toContain('Hi,');
    });

    it('HTML-escapes name containing angle brackets', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: '<script>alert(1)</script>',
      });
      expect(result.html).toContain('&lt;script&gt;');
      expect(result.html).not.toContain('<script>');
    });

    it('HTML-escapes URL containing ampersands', () => {
      const evilUrl = 'https://example.com?a=1&b=2';
      const result = renderTemplate('email-verification', {
        url: evilUrl,
      });
      expect(result.html).toContain('a=1&amp;b=2');
    });

    it('wraps output in a full HTML layout', () => {
      const result = renderTemplate('email-verification', { url });
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('Boilers');
    });
  });

  describe('welcome-social', () => {
    const url = 'https://example.com/set-password?token=xyz';
    const username = 'janedoe';

    it('renders subject, username, link, and text', () => {
      const result = renderTemplate('welcome-social', {
        url,
        username,
        name: 'Jane',
        provider: 'Google',
      });
      expect(result.subject).toBe('Welcome! Set your password');
      expect(result.html).toContain(`<strong>${username}</strong>`);
      expect(result.html).toContain(url);
      expect(result.html).toContain('Google');
      expect(result.text).toContain(username);
      expect(result.text).toContain(url);
    });

    it('greets by name when provided', () => {
      const result = renderTemplate('welcome-social', { url, username });
      expect(result.html).toContain('Hi,');
    });

    it('uses generic greeting when name is empty', () => {
      const result = renderTemplate('welcome-social', { url, username });
      expect(result.html).toContain('Hi,');
    });

    it('defaults provider to "social login"', () => {
      const result = renderTemplate('welcome-social', { url, username });
      expect(result.html).toContain('social login');
    });

    it('HTML-escapes username', () => {
      const result = renderTemplate('welcome-social', {
        url,
        username: '<b>bad</b>',
      });
      expect(result.html).toContain('&lt;b&gt;bad&lt;/b&gt;');
      expect(result.html).not.toContain('<b>bad</b>');
    });

    it('HTML-escapes provider name', () => {
      const result = renderTemplate('welcome-social', {
        url,
        username,
        provider: '<img onerror=alert(1)>',
      });
      expect(result.html).toContain('&lt;img');
    });
  });

  describe('password-reset', () => {
    const url = 'https://example.com/reset?token=def456';

    it('renders subject, link, and text', () => {
      const result = renderTemplate('password-reset', { url });
      expect(result.subject).toBe('Reset your password');
      expect(result.html).toContain(url);
      expect(result.html).toContain('Reset Password');
      expect(result.text).toBe(`Reset your password: ${url}`);
    });

    it('includes 24-hour expiry notice', () => {
      const result = renderTemplate('password-reset', { url });
      expect(result.html).toContain('24 hours');
    });

    it('HTML-escapes URL', () => {
      const evilUrl = 'https://example.com?a=1&b=2';
      const result = renderTemplate('password-reset', { url: evilUrl });
      expect(result.html).toContain('a=1&amp;b=2');
    });
  });

  describe('str helper edge cases', () => {
    const url = 'https://example.com';

    it('coerces number to string', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: 12345,
      });
      expect(result.html).toContain('12345');
    });

    it('coerces boolean to string', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: true,
      });
      expect(result.html).toContain('true');
    });

    it('returns fallback for undefined', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: undefined,
      });
      expect(result.html).toContain('Hi,');
    });

    it('returns fallback for null', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: null,
      });
      expect(result.html).toContain('Hi,');
    });

    it('returns fallback for object', () => {
      const result = renderTemplate('email-verification', {
        url,
        name: { foo: 'bar' },
      });
      expect(result.html).toContain('Hi,');
    });
  });
});
