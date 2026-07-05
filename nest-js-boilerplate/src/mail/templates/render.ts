function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;padding:24px 16px">
    <tr>
      <td style="text-align:center;padding-bottom:24px">
        <h1 style="color:#333;font-size:20px;margin:0">Boilers</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;border-radius:8px;padding:32px 24px;color:#333;font-size:14px;line-height:1.6">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding-top:24px;color:#999;font-size:12px">
        <p style="margin:0">Boilers — the full-stack starter</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return fallback;
}

const templates: Record<
  string,
  (vars: Record<string, unknown>) => {
    subject: string;
    html: string;
    text: string;
  }
> = {
  'email-verification': (vars) => {
    const url = str(vars.url);
    const name = str(vars.name, '');
    const greeting = name ? 'Hi ' + escape(name) + ',' : 'Hi,';
    return {
      subject: 'Confirm your email',
      html: layout(
        '<p>' +
          greeting +
          '</p>' +
          '<p>Thanks for registering! Click the button below to confirm your email address:</p>' +
          '<p style="text-align:center;margin:24px 0">' +
          '<a href="' +
          escape(url) +
          '" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Confirm Email</a>' +
          '</p>' +
          '<p>Or copy this link into your browser:</p>' +
          '<p style="word-break:break-all;font-size:12px;color:#666">' +
          escape(url) +
          '</p>' +
          "<p>If you didn't create an account, you can ignore this email.</p>",
      ),
      text: 'Confirm your email: ' + url,
    };
  },

  'welcome-social': (vars) => {
    const username = str(vars.username);
    const url = str(vars.url);
    const name = str(vars.name, '');
    const greeting = name ? 'Hi ' + escape(name) + ',' : 'Hi,';
    const provider = str(vars.provider, 'social login');
    return {
      subject: 'Welcome! Set your password',
      html: layout(
        '<p>' +
          greeting +
          '</p>' +
          '<p>Welcome to Boilers! Your account has been created via ' +
          escape(provider) +
          '.</p>' +
          '<p>Your username is: <strong>' +
          escape(username) +
          '</strong></p>' +
          "<p>Click the button below to set a password for your account (you'll need it for direct login):</p>" +
          '<p style="text-align:center;margin:24px 0">' +
          '<a href="' +
          escape(url) +
          '" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Set Password</a>' +
          '</p>' +
          '<p>Or copy this link into your browser:</p>' +
          '<p style="word-break:break-all;font-size:12px;color:#666">' +
          escape(url) +
          '</p>' +
          "<p>If you didn't create this account, you can ignore this email.</p>",
      ),
      text:
        'Welcome to Boilers! Your username is: ' +
        username +
        '. Set your password here: ' +
        url,
    };
  },

  'password-reset': (vars) => {
    const url = str(vars.url);
    return {
      subject: 'Reset your password',
      html: layout(
        '<p>Hi,</p>' +
          '<p>We received a request to reset your password. Click the button below to set a new one:</p>' +
          '<p style="text-align:center;margin:24px 0">' +
          '<a href="' +
          escape(url) +
          '" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Reset Password</a>' +
          '</p>' +
          '<p>Or copy this link into your browser:</p>' +
          '<p style="word-break:break-all;font-size:12px;color:#666">' +
          escape(url) +
          '</p>' +
          "<p>This link expires in 24 hours. If you didn't request a password reset, you can ignore this email.</p>",
      ),
      text: 'Reset your password: ' + url,
    };
  },
};

export function renderTemplate(
  template: string,
  variables: Record<string, unknown>,
): { subject: string; html: string; text: string } {
  const renderer = templates[template];
  if (!renderer) {
    return {
      subject: '',
      html: '',
      text: '',
    };
  }
  return renderer(variables);
}
