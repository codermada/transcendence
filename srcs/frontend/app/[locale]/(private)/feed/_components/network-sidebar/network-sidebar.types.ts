export interface FriendRequest {
  id: string;
  name: string;
  initials: string;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  initials: string;
  mutualFriends: number;
}

export interface NetworkSidebarProps {
  receivedRequests?: FriendRequest[];
  sentRequests?: FriendRequest[];
  suggestions?: FriendSuggestion[];
}

export interface FriendRequestsCardProps {
  receivedRequests?: FriendRequest[];
  sentRequests?: FriendRequest[];
}

export interface FriendSuggestionsCardProps {
  suggestions?: FriendSuggestion[];
}

export interface ReceivedRequestProps {
  type: "received";
  name: string;
  initials: string;
}

export interface SentRequestProps {
  type: "sent";
  name: string;
  initials: string;
}

export type FriendRequestItemProps = ReceivedRequestProps | SentRequestProps;

export interface FriendSuggestionItemProps {
  name: string;
  initials: string;
  mutualFriends: number;
}