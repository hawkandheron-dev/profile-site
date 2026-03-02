/**
 * Header button for the issue creator — visible to contributors and admins.
 */
import { useState } from 'react';
import { IssueCreatorModal } from './IssueCreatorModal.jsx';

export function IssueCreatorButton({ isContributor, isAdmin, getToken, clerkUserId, appId, getPageContext }) {
  const [open, setOpen] = useState(false);

  if (!isContributor && !isAdmin) return null;

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen(true)}
        title="Submit feedback, report an issue, or suggest a correction"
      >
        Submit Feedback
      </button>
      {open && (
        <IssueCreatorModal
          isOpen
          onClose={() => setOpen(false)}
          getToken={getToken}
          clerkUserId={clerkUserId}
          appId={appId}
          getPageContext={getPageContext}
        />
      )}
    </>
  );
}
