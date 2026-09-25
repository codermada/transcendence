export type { ChannelListItem } from "@/stores/use-channel-store";

export interface AvailableUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}
