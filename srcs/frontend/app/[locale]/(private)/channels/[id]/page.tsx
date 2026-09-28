import { ChannelConversationClient } from "./ChannelConversationClient";

export default async function ChannelConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChannelConversationClient channelId={id} />;
}
