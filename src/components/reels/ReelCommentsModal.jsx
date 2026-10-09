import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, Trash2, Heart, MessageCircle, Sparkles, Loader2, User } from 'lucide-react';
import { fetchReelComments, addReelComment, deleteReelComment } from '../../redux/slices/reelsSlice';
import { toast } from 'sonner';

export const ReelCommentsModal = ({
  isOpen,
  onClose,
  reelId,
  reelTitle,
  currentUser,
  onRequireAuth,
}) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const commentsEndRef = useRef(null);

  const commentsData = useSelector(
    (state) => state.reels.commentsMap[reelId] || { comments: [], loading: false, error: null }
  );

  const comments = commentsData.comments || [];
  const isLoading = commentsData.loading;

  useEffect(() => {
    if (isOpen && reelId) {
      dispatch(fetchReelComments({ reelId, page: 1, limit: 50 }));
    }
  }, [dispatch, isOpen, reelId]);

  if (!isOpen) return null;

  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!currentUser) {
      toast.error('Please login to leave a comment! ✨');
      onRequireAuth?.();
      return;
    }

    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await dispatch(
        addReelComment({ reelId, text: commentText.trim() })
      ).unwrap();
      setCommentText('');
      toast.success('Comment posted! 💬');
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.msg || 'Could not post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setCommentText((prev) => prev + emoji);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingId(commentId);
      await dispatch(deleteReelComment({ reelId, commentId })).unwrap();
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.msg || 'Could not delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Instagram-style Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#1F1215] text-[#FAF6F0] rounded-t-3xl sm:rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-8 duration-200">
        {/* Header Handle / Grabber for mobile */}
        <div className="flex sm:hidden justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#2A0C0E]/90">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-royal text-base sm:text-lg font-bold text-[#FFFDF9]">
              Comments ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[260px] max-h-[420px]">
          {isLoading && comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/60 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              <span className="text-xs">Loading reactions &amp; comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 text-white/60">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">No comments yet</p>
              <p className="text-xs text-white/50 max-w-xs">
                Be the first bride or henna lover to share your thoughts on this design!
              </p>
            </div>
          ) : (
            comments.map((c, idx) => {
              const commenter = c.userId || {};
              const isOwnComment =
                currentUserId &&
                (commenter._id === currentUserId ||
                  commenter.id === currentUserId ||
                  c.userId === currentUserId ||
                  commenter._id === 'me');

              const commenterName = commenter.name || 'Mehndi Admirer';
              const commenterInitial = commenterName.charAt(0).toUpperCase();

              return (
                <div
                  key={c._id || idx}
                  className="flex items-start justify-between gap-3 group animate-in fade-in duration-200"
                >
                  {/* Left Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {commenter.profileImage ? (
                      <img
                        src={commenter.profileImage}
                        alt={commenterName}
                        className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8A3324] to-[#4A151B] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs flex items-center justify-center">
                        {commenterInitial}
                      </div>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {commenterName}
                      </span>
                      {commenter.name?.includes('Admin') && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                          Artist
                        </span>
                      )}
                      <span className="text-[10px] text-white/40">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-white/90 mt-0.5 break-words leading-relaxed">
                      {c.text}
                    </p>
                  </div>

                  {/* Actions (Delete if own) */}
                  {isOwnComment && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      disabled={deletingId === c._id}
                      className="p-1.5 text-white/30 hover:text-red-400 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete comment"
                    >
                      {deletingId === c._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#170C0E] flex items-center justify-around">
          {['❤️', '😍', '🔥', '✨', '👑', '🙌', '🌸'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 active:scale-95 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input Footer */}
        <form
          onSubmit={handleAddComment}
          className="p-3 sm:p-4 border-t border-white/10 bg-[#250E12] flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>

          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              currentUser
                ? 'Add a comment or ask about this mehndi...'
                : 'Login to leave a comment...'
            }
            className="flex-1 bg-black/40 border border-[#D4AF37]/30 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E2C45E] text-[#2A0C0E] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2A0C0E]" />
            ) : (
              <Send className="w-4 h-4 text-[#2A0C0E]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
