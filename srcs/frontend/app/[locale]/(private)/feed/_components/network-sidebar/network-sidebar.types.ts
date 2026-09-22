export interface ReceivedFriendRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    initials: string;
  };
}

export interface SentFriendRequest {
  id: string;
  addressee: {
    id: string;
    name: string;
    initials: string;
  };
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
  onAcceptRequest?: (requestId: string) => Promise<void> | void;
  onDeclineRequest?: (requestId: string) => Promise<void> | void;
  onCancelRequest?: (requestId: string) => Promise<void> | void;
}

export interface FriendRequestsCardProps {
  receivedRequests?: ReceivedFriendRequest[];
  sentRequests?: SentFriendRequest[];
  onAcceptRequest?: (requestId: string) => Promise<void> | void;
  onDeclineRequest?: (requestId: string) => Promise<void> | void;
  onCancelRequest?: (requestId: string) => Promise<void> | void;
}

export interface FriendSuggestionsCardProps {
  suggestions?: FriendSuggestion[];
}

export interface ReceivedRequestProps {
  type: "received";
  requestId: string;
  name: string;
  initials: string;
  onAccept?: (requestId: string) => Promise<void> | void;
  onDecline?: (requestId: string) => Promise<void> | void;
}

export interface SentRequestProps {
  type: "sent";
  requestId: string;
  name: string;
  initials: string;
  onCancel?: (requestId: string) => Promise<void> | void;
}

export type FriendRequestItemProps = ReceivedRequestProps | SentRequestProps;

export interface FriendSuggestionItemProps {
  name: string;
  initials: string;
  mutualFriends: number;
}