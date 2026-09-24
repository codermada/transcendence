"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { Comment } from "../feed-section.types"
import {
  commentService,
} from "../../../_services/PostCommentService";
import { useTranslations } from "next-intl";

import { CommentsHeader } from "./CommentsHeader";
import { CommentsList } from "./CommentsList";
import { CommentComposer } from "./CommentComposer";

interface CommentsModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentsModal({
  postId,
  open,
  onOpenChange,
}: CommentsModalProps) {
  const t = useTranslations("Comments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    loadComments();
  }, [open, postId]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  const loadComments = async () => {
    try {
      setIsLoading(true);

      const data = await commentService.getComments(postId);

      setComments(data);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("selectImage"));
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(t("imageTooLarge"));
      return;
    }

    setSelectedImage(file);
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedImage) {
      toast.error(t("emptyComment"));
      return;
    }

    try {
      setIsSubmitting(true);

      const newComment = await commentService.createComment({
        content: trimmedContent,
        image: selectedImage,
      }, postId);

      setComments((current) => [...current, newComment]);

      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);

      toast.success(t("added"));
    } catch {
      toast.error(t("addError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (comment: Comment) => {
    if (likingCommentId) return;

    try {
      setLikingCommentId(comment.id);

      const result = await commentService.toggleLike(comment.id);

      setComments((current) =>
        current.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                isLikedByCurrentUser: result.liked,
                likesCount: result.likesCount,
              }
            : item,
        ),
      );
    } catch {
      toast.error(t("likeError"));
    } finally {
      setLikingCommentId(null);
    }
  };

  if (!open) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-title"
        className="
          flex
          h-[90vh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-2xl
          bg-white
          shadow-xl
          dark:bg-zinc-950
          sm:h-[80vh]
          sm:max-w-lg
          sm:rounded-2xl
          md:max-w-xl
        "
      >
        <CommentsHeader onClose={() => onOpenChange(false)} />

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-4
          "
        >
          <CommentsList
            comments={comments}
            isLoading={isLoading}
            likingCommentId={likingCommentId}
            onToggleLike={handleToggleLike}
          />
          
        </div>

        <CommentComposer
          content={content}
          setContent={setContent}
          selectedImage={selectedImage}
          previewUrl={previewUrl}
          isSubmitting={isSubmitting}
          inputRef={inputRef}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

