"use client";

import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  isPending?: boolean;
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

// Helper functions for comment manipulation
function countAllComments(comments: Comment[]): number {
  let count = comments.length;
  comments.forEach((c) => {
    if (c.replies) count += countAllComments(c.replies);
  });
  return count;
}

function replaceCommentById(
  comments: Comment[],
  id: string,
  replacement: Comment
): Comment[] {
  return comments.map((c) => {
    if (c.id === id) return replacement;
    if (c.replies) {
      return {
        ...c,
        replies: replaceCommentById(c.replies, id, replacement),
      };
    }
    return c;
  });
}

function removeComment(comments: Comment[], id: string): Comment[] {
  return comments.filter((c) => {
    if (c.id === id) return false;
    if (c.replies) {
      c.replies = removeComment(c.replies, id);
    }
    return true;
  });
}

function addReplyToComments(
  comments: Comment[],
  parentId: string,
  reply: Comment
): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return {
        ...c,
        replies: [reply, ...(c.replies || [])],
      };
    }
    if (c.replies) {
      return {
        ...c,
        replies: addReplyToComments(c.replies, parentId, reply),
      };
    }
    return c;
  });
}

function updateCommentById(
  comments: Comment[],
  id: string,
  updater: (c: Comment) => Comment
): Comment[] {
  return comments.map((c) => {
    if (c.id === id) return updater(c);
    if (c.replies) {
      return {
        ...c,
        replies: updateCommentById(c.replies, id, updater),
      };
    }
    return c;
  });
}

function toggleLikeInComments(comments: Comment[], id: string): Comment[] {
  return updateCommentById(comments, id, (c) => ({
    ...c,
    isLiked: !c.isLiked,
    likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
  }));
}

function toggleSinglePinnedComment(comments: Comment[], id: string): Comment[] {
  return comments.map((c) => {
    if (c.id === id) {
      return { ...c, isPinned: !c.isPinned };
    }
    if (c.isPinned) {
      return { ...c, isPinned: false };
    }
    if (c.replies) {
      return {
        ...c,
        replies: toggleSinglePinnedComment(c.replies, id),
      };
    }
    return c;
  });
}

function setSinglePinnedComment(comments: Comment[], id: string): Comment[] {
  return comments.map((c) => {
    if (c.id === id) {
      return { ...c, isPinned: true };
    }
    if (c.isPinned) {
      return { ...c, isPinned: false };
    }
    if (c.replies) {
      return {
        ...c,
        replies: setSinglePinnedComment(c.replies, id),
      };
    }
    return c;
  });
}

function clearPinnedComment(comments: Comment[], id: string): Comment[] {
  return updateCommentById(comments, id, (c) => ({ ...c, isPinned: false }));
}

function CommentItem({
  comment,
  projectOwnerId,
  currentUserId,
  onReply,
  onDelete,
  onPin,
  onLike,
  hasPinnedComment,
  depth = 0,
}: {
  comment: Comment;
  projectOwnerId: string;
  currentUserId?: string;
  onReply: (parentId: string, userName: string) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string) => void;
  onLike: (commentId: string) => void;
  hasPinnedComment: boolean;
  depth?: number;
}) {
  const isOwner = currentUserId === projectOwnerId;
  const isAuthor = currentUserId === comment.userId;
  const canDelete = isAuthor || isOwner;
  const canPin = isOwner && (comment.isPinned || !hasPinnedComment);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  useEffect(() => {
    setIsLiked(comment.isLiked);
    setLikeCount(comment.likeCount);
  }, [comment.isLiked, comment.likeCount]);

  return (
    <div
      className={`${
        depth > 0 ? "ml-8" : ""
      } py-3 border-b border-border last:border-0`}
    >
      <div className="flex gap-2 sm:gap-3">
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
          <AvatarImage src={comment.user.avatarUrl || undefined} />
          <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white text-xs">
            {comment.user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  {comment.user.name || "Anonymous"}
                </span>
                {comment.isPinned && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-1.5 py-0 h-4"
                  >
                    <Pin className="h-2.5 w-2.5 mr-0.5" />
                    Pinned
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
            {(canDelete || canPin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -mt-1"
                    disabled={comment.isPending}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPin && (
                    <DropdownMenuItem onClick={() => onPin(comment.id)}>
                      <Pin className="mr-2 h-4 w-4" />
                      {comment.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-sm mt-1 wrap-break-word">{comment.content}</p>

          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs gap-1 ${
                isLiked
                  ? "text-red-600 hover:text-red-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onLike(comment.id)}
              disabled={!currentUserId || comment.isPending}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`}
              />
              {likeCount > 0 && likeCount}
            </Button>
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() =>
                  onReply(comment.id, comment.user.name || "Anonymous")
                }
                disabled={!currentUserId || comment.isPending}
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </Button>
            )}
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
              hasPinnedComment={hasPinnedComment}
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
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  const queryClient = useQueryClient();
  
  // Debounce timers for comment like mutations
  const likeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingLikesRef = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  // Fetch comments with React Query
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      const comments = data.comments || [];
      const total =
        typeof data.count === "number" ? data.count : countAllComments(comments);
      onCommentCountChangeRef.current?.(total);
      return comments;
    },
    enabled: isOpen,
    staleTime: 10 * 1000, // 10 seconds
  });

  const comments = commentsData || [];

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: {
      projectId: string;
      content: string;
      parentId?: string;
    }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          ...data,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post comment");
      }
      return res.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["comments", projectId] });
      const previous = queryClient.getQueryData(["comments", projectId]);
      
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const tempComment: Comment = {
        id: tempId,
        projectId: variables.projectId,
        userId: currentUserId || "",
        content: variables.content,
        parentId: variables.parentId || null,
        isPinned: false,
        likeCount: 0,
        isLiked: false,
        isPending: true,
        createdAt: now,
        updatedAt: now,
        user: {
          id: currentUserId || "",
          name: "You",
          avatarUrl: null,
        },
        replies: [],
      };

      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) => {
        if (variables.parentId) {
          return addReplyToComments(old, variables.parentId, tempComment);
        }
        return [tempComment, ...old];
      });

      return { previous, tempId };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["comments", projectId], context?.previous);
      toast.error(err.message || "Failed to post comment");
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        replaceCommentById(old, context?.tempId || "", data.comment)
      );
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] });
      toast.success("Comment posted!");
    },
  });

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    addCommentMutation.mutate({
      projectId,
      content: newComment.trim(),
      parentId: replyTo?.id,
    });

    setNewComment("");
    setReplyTo(null);
  };

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          commentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", projectId] });
      const previous = queryClient.getQueryData(["comments", projectId]);
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        removeComment(old, commentId)
      );
      return { previous };
    },
    onError: (err, commentId, context) => {
      queryClient.setQueryData(["comments", projectId], context?.previous);
      toast.error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId] });
      toast.success("Comment deleted");
    },
  });

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  // Pin comment mutation
  const pinCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pin",
          commentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to pin");
      return res.json();
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", projectId] });
      const previous = queryClient.getQueryData(["comments", projectId]);
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        toggleSinglePinnedComment(old, commentId)
      );
      return { previous };
    },
    onError: (err, commentId, context) => {
      queryClient.setQueryData(["comments", projectId], context?.previous);
      toast.error("Failed to pin comment");
    },
    onSuccess: (data, commentId) => {
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        data.isPinned
          ? setSinglePinnedComment(old, commentId)
          : clearPinnedComment(old, commentId)
      );
      toast.success(data.isPinned ? "Comment pinned" : "Comment unpinned");
    },
  });

  const handlePinComment = (commentId: string) => {
    pinCommentMutation.mutate(commentId);
  };

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "like",
          commentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onSuccess: (data, commentId) => {
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        updateCommentById(old, commentId, (c) => ({
          ...c,
          isLiked: data.liked,
          likeCount: data.likeCount,
        }))
      );
      pendingLikesRef.current.delete(commentId);
    },
    onError: (err, commentId) => {
      // Revert optimistic update
      queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
        toggleLikeInComments(old, commentId)
      );
      pendingLikesRef.current.delete(commentId);
      toast.error("Failed to like comment");
    },
  });

  const handleLikeComment = (commentId: string) => {
    if (!currentUserId) return;

    // Clear existing timer for this comment
    const existingTimer = likeTimersRef.current.get(commentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Instant optimistic UI update
    queryClient.setQueryData(["comments", projectId], (old: Comment[] = []) =>
      toggleLikeInComments(old, commentId)
    );

    // Debounce the actual API call (300ms)
    const timer = setTimeout(() => {
      if (!pendingLikesRef.current.get(commentId)) {
        pendingLikesRef.current.set(commentId, true);
        likeCommentMutation.mutate(commentId);
      }
      likeTimersRef.current.delete(commentId);
    }, 300);

    likeTimersRef.current.set(commentId, timer);
  };

  const handleReply = (parentId: string, userName: string) => {
    setReplyTo({ id: parentId, name: userName });
  };

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Cleanup timers on close
  useEffect(() => {
    if (!isOpen) {
      likeTimersRef.current.forEach((timer) => clearTimeout(timer));
      likeTimersRef.current.clear();
    }
  }, [isOpen]);

  const hasPinned = comments.some(
    (c: Comment) => c.isPinned || c.replies?.some((r: Comment) => r.isPinned)
  );

  const commentsContent = (
    <>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div>
          {comments.map((comment: Comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectOwnerId={projectOwnerId}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDeleteComment}
              onPin={handlePinComment}
              onLike={handleLikeComment}
              hasPinnedComment={hasPinned}
            />
          ))}
        </div>
      )}
    </>
  );

  const inputSection = currentUserId && (
    <div className="border-t border-border p-4 shrink-0">
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Reply className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Replying to{" "}
              <span className="font-semibold text-foreground">
                {replyTo.name}
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setReplyTo(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-sm">
        <Input
          ref={textareaRef}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendComment();
            }
          }}
          disabled={addCommentMutation.isPending}
          className="border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button
          size="icon"
          onClick={handleSendComment}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className="h-9 w-9 rounded-full shrink-0 bg-blue-600 hover:bg-blue-700"
        >
          {addCommentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  // Mobile: Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="px-4 border-b border-border">
            <SheetTitle>Comments</SheetTitle>
            <SheetDescription className="truncate">
              {projectTitle}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 h-[calc(85vh-180px)]">
            {commentsContent}
          </div>
          {inputSection}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="truncate">
            {projectTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(80vh-180px)]">
          {commentsContent}
        </div>
        {inputSection}
      </DialogContent>
    </Dialog>
  );
}
