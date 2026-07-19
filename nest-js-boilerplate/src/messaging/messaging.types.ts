export interface RoomMember {
  socketId: string;
  userId: string;
  name: string;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] || '?').toUpperCase();
}
