export interface ReceivedFriendRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    initials: string;
  }
}

export interface SentFriendRequest {
  id: string;
  addressee: {
    id: string;
    name: string;
    initials: string;
  }
}

export interface FriendSuggestion {
  id: string;
  name: string;
  initials: string;
  mutualFriends: number;
}

export interface NetworkSidebarProps {
  receivedRequests?: ReceivedFriendRequest[];
  sentRequests?: SentFriendRequest[];
  suggestions?: FriendSuggestion[];
}

export interface FriendRequestsCardProps {
  receivedRequests?: ReceivedFriendRequest[];
  sentRequests?: SentFriendRequest[];
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