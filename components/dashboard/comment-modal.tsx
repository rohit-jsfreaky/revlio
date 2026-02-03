"use client";

import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  X,
  Send,
  Pin,
  Trash2,
  Reply,
  MoreVertical,
  Loader2,
  MessageCircle,
  ChevronDown,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CommentUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  parentId: string | null;
  isPinned: boolean;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  projectOwnerId: string;
  currentUserId?: string;
  onCommentCountChange?: (count: number) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function CommentItem({
  comment,
  projectOwnerId,
  currentUserId,
  onReply,
  onDelete,
  onPin,
  onLike,
  depth = 0,
}: {
  comment: Comment;
  projectOwnerId: string;
  currentUserId?: string;
  onReply: (parentId: string, userName: string) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string) => void;
  onLike: (commentId: string) => void;
  depth?: number;
}) {
  const isOwner = currentUserId === projectOwnerId;
  const isAuthor = currentUserId === comment.userId;
  const canDelete = isAuthor || isOwner;
  const canPin = isOwner;
  const maxDepth = 2;

  return (
    <div
      className={`${depth > 0 ? "ml-8 sm:ml-12 border-l-2 border-border pl-3 sm:pl-4" : ""}`}
    >
      <div className="py-3">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
            <AvatarImage src={comment.user.avatarUrl || undefined} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
              {comment.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {comment.user.name || "Anonymous"}
              </span>
              {comment.userId === projectOwnerId && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  Author
                </Badge>
              )}
              {comment.isPinned && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 gap-1"
                >
                  <Pin className="h-2.5 w-2.5" />
                  Pinned
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {currentUserId && (
                <button
                  onClick={() => onLike(comment.id)}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    comment.isLiked
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${comment.isLiked ? "fill-current" : ""}`}
                  />
                  {comment.likeCount > 0 && (
                    <span className="text-xs">{comment.likeCount}</span>
                  )}
                </button>
              )}
              {depth < maxDepth && currentUserId && (
                <button
                  onClick={() =>
                    onReply(comment.id, comment.user.name || "Anonymous")
                  }
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}
              {(canDelete || canPin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground p-1 -m-1">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {canPin && (
                      <DropdownMenuItem onClick={() => onPin(comment.id)}>
                        <Pin className="mr-2 h-4 w-4" />
                        {comment.isPinned ? "Unpin" : "Pin"} Comment
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(comment.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectOwnerId={projectOwnerId}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              onPin={onPin}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  projectOwnerId,
  currentUserId,
  onCommentCountChange,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  const likeRequestRef = useRef<Record<string, number>>({});

  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  // Load comments
  useEffect(() => {
    if (!isOpen) return;

    async function loadComments() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/comments?projectId=${projectId}`);
        const data = await res.json();
        const nextComments = data.comments || [];
        setComments(nextComments);
        const total =
          typeof data.count === "number"
            ? data.count
            : countAllComments(nextComments);
        onCommentCountChangeRef.current?.(total);
      } catch (error) {
        console.error("Failed to load comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    }

    loadComments();
  }, [isOpen, projectId]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Handle escape key and body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          projectId,
          content: newComment.trim(),
          parentId: replyTo?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const data = await res.json();

      // Add to local state
      if (replyTo) {
        const nextComments = addReplyToComments(
          comments,
          replyTo.id,
          data.comment
        );
        setComments(nextComments);
        onCommentCountChangeRef.current?.(countAllComments(nextComments));
      } else {
        const nextComments = [data.comment, ...comments];
        setComments(nextComments);
        onCommentCountChangeRef.current?.(countAllComments(nextComments));
      }

      setNewComment("");
      setReplyTo(null);
      toast.success("Comment posted!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          commentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Remove from local state
      setComments((prev) => {
        const next = removeComment(prev, commentId);
        onCommentCountChangeRef.current?.(countAllComments(next));
        return next;
      });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handlePinComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pin",
          commentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to pin");

      const data = await res.json();

      // Update local state
      setComments((prev) =>
        updateCommentById(prev, commentId, (c) => ({
          ...c,
          isPinned: data.isPinned,
        }))
      );

      toast.success(data.isPinned ? "Comment pinned" : "Comment unpinned");
    } catch {
      toast.error("Failed to pin comment");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return;

    setComments((prev) => toggleLikeInComments(prev, commentId));

    const requestId = (likeRequestRef.current[commentId] || 0) + 1;
    likeRequestRef.current[commentId] = requestId;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "like",
          commentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to like");

      const data = await res.json();

      if (likeRequestRef.current[commentId] !== requestId) return;

      setComments((prev) =>
        updateCommentById(prev, commentId, (c) => ({
          ...c,
          isLiked: data.liked,
          likeCount: data.likeCount,
        }))
      );
    } catch {
      if (likeRequestRef.current[commentId] === requestId) {
        setComments((prev) => toggleLikeInComments(prev, commentId));
      }
      toast.error("Failed to like comment");
    }
  };

  const handleReply = (parentId: string, userName: string) => {
    setReplyTo({ id: parentId, name: userName });
  };

  if (!isOpen) return null;

  // Helper functions
  function addReplyToComments(
    comments: Comment[],
    parentId: string,
    reply: Comment
  ): Comment[] {
    return comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: addReplyToComments(c.replies, parentId, reply),
        };
      }
      return c;
    });
  }

  function removeComment(comments: Comment[], id: string): Comment[] {
    return comments
      .filter((c) => c.id !== id)
      .map((c) => ({
        ...c,
        replies: c.replies ? removeComment(c.replies, id) : [],
      }));
  }

  function updateCommentById(
    comments: Comment[],
    id: string,
    updater: (comment: Comment) => Comment
  ): Comment[] {
    return comments.map((c) => {
      if (c.id === id) return updater(c);
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: updateCommentById(c.replies, id, updater) };
      }
      return c;
    });
  }

  function toggleLikeInComments(comments: Comment[], id: string): Comment[] {
    return updateCommentById(comments, id, (c) => {
      const nextLiked = !c.isLiked;
      const nextCount = nextLiked ? c.likeCount + 1 : c.likeCount - 1;
      return {
        ...c,
        isLiked: nextLiked,
        likeCount: Math.max(0, nextCount),
      };
    });
  }

  function countAllComments(comments: Comment[]): number {
    return comments.reduce(
      (count, c) => count + 1 + countAllComments(c.replies || []),
      0
    );
  }

  const totalCount = countAllComments(comments);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`fixed z-50 bg-background flex flex-col ${
          isMobile
            ? "inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh] animate-in slide-in-from-bottom duration-300"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[80vh] max-h-175 rounded-2xl animate-in zoom-in-95 fade-in duration-200"
        }`}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <h2 className="font-semibold truncate">Comments</h2>
            <Badge variant="secondary" className="shrink-0">
              {totalCount}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Project title */}
        <div className="px-4 py-2 bg-muted/50 border-b border-border shrink-0">
          <p className="text-sm text-muted-foreground truncate">
            On: <span className="text-foreground">{projectTitle}</span>
          </p>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  projectOwnerId={projectOwnerId}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                  onPin={handlePinComment}
                  onLike={handleLikeComment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyTo && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex items-center justify-between shrink-0">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Replying to <span className="font-medium">{replyTo.name}</span>
            </p>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Comment input */}
        <div className="p-4 border-t border-border shrink-0 bg-background">
          {currentUserId ? (
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                placeholder={
                  replyTo ? `Reply to ${replyTo.name}...` : "Write a comment..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-11 max-h-30 resize-none rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSendComment}
                disabled={!newComment.trim() || isSending}
                className="shrink-0 h-11 w-11 rounded-full"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              Sign in to comment
            </p>
          )}
        </div>
      </div>
    </>
  );
}
