export type {
  ChannelParticipant,
  ChannelMemberItem,
  ChannelDetail,
  ChannelMessage,
} from "@/stores/use-channel-store";

export interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
}
