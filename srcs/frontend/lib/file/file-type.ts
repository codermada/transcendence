export enum FileType {
	IMAGE,
	VIDEO,
	AUDIO,
	OTHER,
}

export function getFileTypeFromUrl(url: string): FileType {
	if (/\.(jpe?g|png|gif|webp|svg|avif)($|\?)/i.test(url)){
		return FileType.IMAGE;
	} else if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(url)) {
		return FileType.VIDEO;
	} else if (/\.(mp3|wav|ogg|m4a|aac)($|\?)/i.test(url)) {
		return FileType.AUDIO;
	}
	return FileType.OTHER;
}
