import { useCallback, useEffect, useState } from 'react';
import { fetchIssueComments } from '../../services/issueService.js';
import { CommentComposer } from './CommentComposer.jsx';
import './GettingStarted.css';

function formatTimestamp(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Flat comment stream for one issue. Lazy-loads on first expand.
 * Author names are shown as "You" for self and "Windhover team" for others
 * to avoid a public-read carve-out on the users table.
 */
export function CommentThread({ issueId, clerkUserId, getToken }) {
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchIssueComments(issueId, getToken);
      setComments(list);
    } catch (err) {
      setError(err.message || 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [issueId, getToken]);

  useEffect(() => { load(); }, [load]);

  const handlePosted = useCallback((created) => {
    setComments(prev => ([...(prev || []), created]));
  }, []);

  return (
    <div className="gs-comment-thread">
      <div className="gs-comment-thread-header">Discussion</div>

      {loading && !comments && (
        <div className="gs-comment-loading">Loading comments…</div>
      )}
      {error && <div className="gs-comment-error">{error}</div>}

      {comments && comments.length === 0 && !loading && (
        <div className="gs-comment-empty">
          No comments yet. Start the conversation below.
        </div>
      )}

      {comments && comments.length > 0 && (
        <ul className="gs-comment-list">
          {comments.map(c => {
            const isSelf = c.author_clerk_user_id === clerkUserId;
            return (
              <li key={c.comment_id} className={`gs-comment${isSelf ? ' gs-comment-self' : ''}`}>
                <div className="gs-comment-meta">
                  <span className="gs-comment-author">
                    {isSelf ? 'You' : 'Windhover team'}
                  </span>
                  <span className="gs-comment-time">{formatTimestamp(c.created_at)}</span>
                </div>
                <div className="gs-comment-body">{c.body}</div>
              </li>
            );
          })}
        </ul>
      )}

      <CommentComposer
        issueId={issueId}
        clerkUserId={clerkUserId}
        getToken={getToken}
        onPosted={handlePosted}
      />
    </div>
  );
}
