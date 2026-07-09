export interface ProfileSectionProps {
  user: {
    name?: string;
    email: string;
    avatarUrl?: string;
    tier?: string;
  };
  logout: () => void;
  lang: string;
}
