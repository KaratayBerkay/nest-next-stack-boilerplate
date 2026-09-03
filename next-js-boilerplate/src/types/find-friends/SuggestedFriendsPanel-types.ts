// Deliberately no `email`: suggested candidates are strangers to the caller
// and the backend blanks the field (PII). Don't re-add it.
export interface SuggestedUser {
  id: string;
  name?: string;
  avatarUrl?: string;
  mutualFriends: number;
}
