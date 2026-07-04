export function displayName(user: {
  name?: string | null;
  email?: string | null;
}): string {
  return user.name?.trim() || user.email || 'Unknown';
}
