export type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
  status?: string;
  role: string;
  tier?: string;
  sessionId?: string;
};
