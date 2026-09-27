export interface UserStats {
  friendsCount: number;
  postsCount: number;
  reactionsCount: number;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  initials: string;
  stats: UserStats;
}

export interface ProfileSidebarProps {
  user: UserProfile;
}

export interface ProfileCardProps {
  user: UserProfile;
}

export interface ProfileStatsProps {
  friendsCount?: number;
  postsCount?: number;
  reactionsCount?: number;
}