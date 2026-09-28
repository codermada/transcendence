import type { AvailableUser } from "../_components/channel-list.types";
import type {
  ChannelDetail,
  ChannelListItem,
  ChannelMessage,
} from "@/stores/use-channel-store";

export type { AvailableUser, ChannelListItem, ChannelDetail, ChannelMessage };

export async function fetchAvailableUsers(): Promise<AvailableUser[]> {
  const res = await fetch("/nest/channels/available-users", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load available users.");
  }
  return res.json();
}

export async function fetchMyChannels(): Promise<ChannelListItem[]> {
  const res = await fetch("/nest/channels/my", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load channels.");
  }
  return res.json();
}

export async function createChannel(data: {
  title: string;
  description: string;
  membersIds?: string[];
}): Promise<ChannelDetail> {
  const res = await fetch("/nest/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create channel.");
  }
  return res.json();
}

export async function fetchChannelDetails(channelId: string): Promise<ChannelDetail> {
  const res = await fetch(`/nest/channels/${channelId}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load channel details.");
  }
  return res.json();
}

export async function fetchChannelMessages(channelId: string): Promise<ChannelMessage[]> {
  const res = await fetch(`/nest/channels/${channelId}/messages`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load messages.");
  }
  return res.json();
}

export async function sendChannelMessage(
  channelId: string,
  content: string,
  files: File[],
): Promise<ChannelMessage> {
  const formData = new FormData();
  if (content.trim()) {
    formData.append("content", content.trim());
  }
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`/nest/channels/${channelId}/messages`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send message.");
  }
  return res.json();
}

export async function addMemberToChannel(channelId: string, memberId: string): Promise<void> {
  const res = await fetch(`/nest/channels/${channelId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ memberId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to add member.");
  }
}

export async function kickMemberFromChannel(channelId: string, targetUserId: string): Promise<void> {
  const res = await fetch(`/nest/channels/${channelId}/members/${targetUserId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to kick member.");
  }
}

export async function updateMemberRole(
  channelId: string,
  targetUserId: string,
  role: "ADMIN" | "MEMBER",
): Promise<void> {
  const res = await fetch(`/nest/channels/${channelId}/members/${targetUserId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update role.");
  }
}

export async function leaveChannel(channelId: string): Promise<void> {
  const res = await fetch(`/nest/channels/${channelId}/leave`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to leave channel.");
  }
}

export async function deleteChannel(channelId: string): Promise<void> {
  const res = await fetch(`/nest/channels/${channelId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete channel.");
  }
}

export async function markChannelAsSeen(channelId: string): Promise<void> {
  await fetch(`/nest/channels/${channelId}/seen`, {
    method: "POST",
    credentials: "include",
  });
}

export async function updateChannel(
  channelId: string,
  data: {
    title?: string;
    description?: string;
    file?: File | null;
  },
): Promise<ChannelDetail> {
  const formData = new FormData();
  if (data.title !== undefined) {
    formData.append("title", data.title.trim());
  }
  if (data.description !== undefined) {
    formData.append("description", data.description.trim());
  }
  if (data.file) {
    formData.append("file", data.file);
  }

  const res = await fetch(`/nest/channels/${channelId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update channel.");
  }
  return res.json();
}
