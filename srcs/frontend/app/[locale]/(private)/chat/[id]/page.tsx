import { ConversationClient } from "./ConversationClient";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ConversationClient conversationId={id} />;
}
