export interface LeaderboardMessages {
  [key: string]: string;
}

export interface PagesWithLeaderboardMessages {
  leaderboard: LeaderboardMessages;
}
