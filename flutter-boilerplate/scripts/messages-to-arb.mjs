import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_MESSAGES_ROOT = join(__dirname, '..', '..', 'next-js-boilerplate', 'messages');
const FLUTTER_L10N_DIR = join(__dirname, '..', 'lib', 'l10n');

function camelCase(str) {
  return str.replace(/[-_/](.)/g, (_, c) => c.toUpperCase());
}

function pascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}${pascalCase(key)}` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'string') {
          result[`${path}${i}`] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value, path));
    } else if (typeof value === 'string') {
      result[path] = value;
    }
  }
  return result;
}

function extractPlaceholders(value) {
  const placeholders = {};
  const regex = /\{(\w+)\}/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    placeholders[match[1]] = {};
  }
  return Object.keys(placeholders).length > 0 ? placeholders : null;
}

function readNamespaceMessages(localeDir) {
  const namespaces = {};
  const entries = readdirSync(localeDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nsDir = join(localeDir, entry.name);
      const msgFile = join(nsDir, 'messages.json');
      if (existsSync(msgFile)) {
        const raw = JSON.parse(readFileSync(msgFile, 'utf-8'));
        const prefix = camelCase(entry.name);
        Object.assign(namespaces, flatten(raw, prefix));
      }
      const subEntries = readdirSync(nsDir, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isDirectory()) {
          const subDir = join(nsDir, sub.name);
          const subMsgFile = join(subDir, 'messages.json');
          if (existsSync(subMsgFile)) {
            const raw = JSON.parse(readFileSync(subMsgFile, 'utf-8'));
            const prefix = camelCase(`${entry.name}/${sub.name}`);
            Object.assign(namespaces, flatten(raw, prefix));
          }
        }
      }
    }
  }
  return namespaces;
}

function toArb(messages) {
  const arb = {};
  const placeholderKeys = new Set();
  for (const [key, value] of Object.entries(messages)) {
    arb[key] = value;
    const placeholders = extractPlaceholders(value);
    if (placeholders) {
      placeholderKeys.add(key);
    }
  }
  for (const key of placeholderKeys) {
    const placeholders = {};
    const value = messages[key];
    const regex = /\{(\w+)\}/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
      placeholders[match[1]] = {};
    }
    arb[`@${key}`] = { placeholders };
  }
  return arb;
}

function validateKeyMatch(enKeys, trKeys) {
  const enSet = new Set(enKeys);
  const trSet = new Set(trKeys);
  const missingInTr = [...enSet].filter(k => !trSet.has(k));
  const missingInEn = [...trSet].filter(k => !enSet.has(k));
  if (missingInTr.length > 0 || missingInEn.length > 0) {
    const errors = [];
    if (missingInTr.length > 0) {
      errors.push(`Keys missing in tr (${missingInTr.length}):\n  ${missingInTr.join('\n  ')}`);
    }
    if (missingInEn.length > 0) {
      errors.push(`Keys missing in en (${missingInEn.length}):\n  ${missingInEn.join('\n  ')}`);
    }
    throw new Error(`Key mismatch between en and tr:\n${errors.join('\n')}`);
  }
}

function main() {
  const enDir = join(WEB_MESSAGES_ROOT, 'en');
  const trDir = join(WEB_MESSAGES_ROOT, 'tr');

  console.log('Reading en messages...');
  const enMessages = readNamespaceMessages(enDir);
  console.log(`  Found ${Object.keys(enMessages).length} keys`);

  console.log('Reading tr messages...');
  const trMessages = readNamespaceMessages(trDir);
  console.log(`  Found ${Object.keys(trMessages).length} keys`);

  console.log('Validating key match...');
  validateKeyMatch(Object.keys(enMessages), Object.keys(trMessages));
  console.log('  ✅ en and tr keys match');

  const enArb = toArb(enMessages);
  const trArb = toArb(trMessages);

  const enPath = join(FLUTTER_L10N_DIR, 'app_en.arb');
  const trPath = join(FLUTTER_L10N_DIR, 'app_tr.arb');

  writeFileSync(enPath, JSON.stringify(enArb, null, 2) + '\n');
  console.log(`  Wrote ${Object.keys(enArb).length} entries → ${enPath}`);

  writeFileSync(trPath, JSON.stringify(trArb, null, 2) + '\n');
  console.log(`  Wrote ${Object.keys(trArb).length} entries → ${trPath}`);

  console.log('\n✅ Done. Run `flutter gen-l10n` to regenerate Dart bindings.');
}

main();
