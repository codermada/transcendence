"use client";

import { FileType, getFileTypeFromUrl } from "@/lib/file/file-type";
import { ChatMessageImage } from "./media/ChatMessageImage";
import { ChatMessageVideo } from "./media/ChatMessageVideo";
import { ChatMessageAudio } from "./media/ChatMessageAudio";
import { ChatMessageGenericFile } from "./media/ChatMessageGenericFile";

export interface ChatMessageMediaProps {
	mediaUrls?: string[];
	isMe?: boolean;
}

export function ChatMessageMedia({ mediaUrls, isMe }: ChatMessageMediaProps) {
	if (!mediaUrls || mediaUrls.length === 0) {
		return null;
	}

	return (
		<>
			<div className="mt-2 space-y-2">
				{mediaUrls.map((url) => {
					const fileType = getFileTypeFromUrl(url);
					if (fileType === FileType.IMAGE) {
						return <ChatMessageImage url={url} key={url} />;
					} else if (fileType === FileType.VIDEO) {
						return <ChatMessageVideo url={url} key={url} />;
					} else if (fileType === FileType.AUDIO) {
						return <ChatMessageAudio url={url} isMe={isMe} key={url} />;
					}
					return <ChatMessageGenericFile url={url} isMe={isMe} key={url} />;
				})}
			</div>
		</>
	)
}
