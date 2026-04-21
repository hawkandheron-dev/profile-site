import { useCallback, useState } from 'react';
import { addIssueComment } from '../../services/issueService.js';
import './GettingStarted.css';

export function CommentComposer({ issueId, clerkUserId, getToken, onPosted }) {
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const handlePost = useCallback(async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const created = await addIssueComment(issueId, body, clerkUserId, getToken);
      setBody('');
      onPosted?.(created);
    } catch (err) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  }, [body, issueId, clerkUserId, getToken, onPosted]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="gs-comment-composer">
      <textarea
        className="gs-comment-textarea"
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a comment… (Cmd/Ctrl+Enter to post)"
        rows={3}
      />
      {error && <div className="gs-comment-error">{error}</div>}
      <div className="gs-comment-composer-actions">
        <button
          type="button"
          className="btn btn-accent"
          onClick={handlePost}
          disabled={posting || !body.trim()}
        >
          {posting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </div>
  );
}
