import { renderTemplate } from './render';

describe('renderTemplate', () => {
  it('renders email-verification with url and name', () => {
    const result = renderTemplate('email-verification', {
      url: 'https://example.com/verify?token=abc',
      name: 'Alice',
    });
    expect(result.subject).toBe('Confirm your email');
    expect(result.html).toContain('Hi Alice,');
    expect(result.html).toContain('https://example.com/verify?token=abc');
    expect(result.text).toContain(
      'Confirm your email: https://example.com/verify?token=abc',
    );
  });

  it('renders email-verification without name', () => {
    const result = renderTemplate('email-verification', {
      url: 'https://example.com/verify?token=abc',
    });
    expect(result.html).toContain('Hi,');
  });

  it('renders password-reset template', () => {
    const result = renderTemplate('password-reset', {
      url: 'https://example.com/reset?token=xyz',
    });
    expect(result.subject).toBe('Reset your password');
    expect(result.html).toContain('Reset Password');
    expect(result.html).toContain('https://example.com/reset?token=xyz');
    expect(result.text).toContain(
      'Reset your password: https://example.com/reset?token=xyz',
    );
  });

  it('renders welcome-social with all variables', () => {
    const result = renderTemplate('welcome-social', {
      username: 'alice_42',
      url: 'https://example.com/set-password',
      name: 'Alice',
      provider: 'Google',
    });
    expect(result.subject).toBe('Welcome! Set your password');
    expect(result.html).toContain('Hi Alice,');
    expect(result.html).toContain('alice_42');
    expect(result.html).toContain('Google');
    expect(result.text).toContain('alice_42');
  });

  it('welcome-social works without optional name', () => {
    const result = renderTemplate('welcome-social', {
      username: 'bob_99',
      url: 'https://example.com/set-password',
      provider: 'GitHub',
    });
    expect(result.html).toContain('Hi,');
    expect(result.html).toContain('GitHub');
  });

  it('escapes HTML in user-supplied values', () => {
    const result = renderTemplate('email-verification', {
      url: 'https://example.com/verify?token=abc',
      name: '<script>alert("xss")</script>',
    });
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).not.toContain('<script>');
  });

  it('escapes HTML in the URL', () => {
    const result = renderTemplate('password-reset', {
      url: 'https://example.com/?a=1&b=2',
    });
    expect(result.html).toContain('&amp;');
  });

  it('returns empty strings for unknown template', () => {
    const result = renderTemplate('nonexistent', { url: 'x' });
    expect(result).toEqual({ subject: '', html: '', text: '' });
  });
});
