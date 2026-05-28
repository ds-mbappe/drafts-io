import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useToast } from 'heroui-native';

import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/stores/auth.store';
import { DraftDetail, Comment } from '../types';

interface UseDraftDetailOptions {
  id: string;
  t: (key: string) => string;
  router: { back: () => void };
  openComments: () => void;
}

interface UseDraftDetailReturn {
  draft: DraftDetail | null;
  comments: Comment[];
  loading: boolean;
  commentText: string;
  setCommentText: (v: string) => void;
  submittingComment: boolean;
  publishing: boolean;
  isOwner: boolean;
  isDraft: boolean;
  toggleLike: () => void;
  toggleBookmark: () => void;
  handlePublish: () => void;
  handleDelete: () => void;
  submitComment: () => void;
}

export function useDraftDetail({
  id,
  t,
  router,
  openComments,
}: UseDraftDetailOptions): UseDraftDetailReturn {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Derived
  const isOwner = !!currentUser && draft?.authorId === currentUser.id;
  const isDraft = draft?.private ?? true;

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [draftRes, commentsRes] = await Promise.all([
        api.get(`/drafts/${id}`),
        api.get('/comments', { params: { draftId: id } }),
      ]);
      setDraft(draftRes.data);
      setComments(commentsRes.data.comments ?? []);
    } catch {
      // swallow — show nothing rather than crash
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleLike = useCallback(async () => {
    if (!draft) return;
    const next = !draft.hasLiked;
    setDraft((d) => d ? { ...d, hasLiked: next, _count: { ...d._count, likes: d._count.likes + (next ? 1 : -1) } } : d);
    try {
      await api.post(`/drafts/${draft.id}/toggle_like`);
      if (next) {
        toast.show({ variant: 'success', label: t('draft.likedToast') });
      } else {
        toast.show({ variant: 'default', label: t('draft.dislikedToast') });
      }
    } catch {
      setDraft((d) => d ? { ...d, hasLiked: !next, _count: { ...d._count, likes: d._count.likes + (next ? -1 : 1) } } : d);
    }
  }, [draft, t, toast]);

  const toggleBookmark = useCallback(async () => {
    if (!draft) return;
    const next = !draft.hasBookmarked;
    setDraft((d) => d ? { ...d, hasBookmarked: next } : d);
    try {
      await api.post(`/bookmarks/${draft.id}/toggle`);
      if (next) {
        toast.show({ variant: 'success', label: t('draft.bookmarkedToast') });
      } else {
        toast.show({ variant: 'default', label: t('draft.unbookmarkedToast') });
      }
    } catch {
      setDraft((d) => d ? { ...d, hasBookmarked: !next } : d);
    }
  }, [draft, t, toast]);

  const handlePublish = useCallback(async () => {
    if (!draft) return;
    Alert.alert(t('draft.publish'), t('draft.publishConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('draft.publish'),
        onPress: async () => {
          try {
            setPublishing(true);
            await api.put(`/drafts/${draft.id}`, { private: false });
            setDraft((d) => d ? { ...d, private: false } : d);
            toast.show({ variant: 'success', label: t('draft.published') });
          } catch {
            Alert.alert(t('common.error'));
          } finally {
            setPublishing(false);
          }
        },
      },
    ]);
  }, [draft, t, toast]);

  const handleDelete = useCallback(async () => {
    if (!draft) return;
    Alert.alert(t('draft.deleteDraft'), t('draft.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/drafts/${draft.id}`);
            router.back();
          } catch {
            Alert.alert(t('common.error'));
          }
        },
      },
    ]);
  }, [draft, t, router]);

  const submitComment = useCallback(async () => {
    if (!draft || !commentText.trim()) return;
    const text = commentText.trim();
    setSubmittingComment(true);
    try {
      const { data } = await api.post('/comments', {
        draftId: draft.id,
        text,
        from: 0,
        to: 0,
      });
      setComments((prev) => [...prev, data.comment]);
      setDraft((d) => d ? { ...d, _count: { ...d._count, Comment: d._count.Comment + 1 } } : d);
      setCommentText('');
      toast.show({ variant: 'success', label: t('comments.commentAdded') });
    } catch {
      toast.show({ variant: 'danger', label: t('comments.failedToSave') });
    } finally {
      setSubmittingComment(false);
    }
  }, [draft, commentText, t, toast]);

  return {
    draft,
    comments,
    loading,
    commentText,
    setCommentText,
    submittingComment,
    publishing,
    isOwner,
    isDraft,
    toggleLike,
    toggleBookmark,
    handlePublish,
    handleDelete,
    submitComment,
  };
}
