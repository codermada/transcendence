import type { Message } from "@/stores/use-chat-store";

export interface SendChatMessageDto {
  receiverId: string;
  content?: string;
  files?: File[];
}

const API_URL = "/nest";

export const chatService = {
  async sendMessage(
    dto: SendChatMessageDto,
    onProgress?: (progress: number) => void
  ): Promise<Message> {
    const formData = new FormData();
    formData.append("receiverId", dto.receiverId);

    if (dto.content) {
      formData.append("content", dto.content);
    }

    if (dto.files && dto.files.length > 0) {
      dto.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/chat/messages`, true);
      xhr.withCredentials = true;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        let responseData: { message?: string } = {};
        try {
          responseData = JSON.parse(xhr.responseText) as { message?: string };
        } catch {
          responseData = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseData as unknown as Message);
        } else {
          reject(
            new Error(
              responseData.message || "Message not sended"
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error on message sending"));
      };

      xhr.send(formData);
    });
  },
};
