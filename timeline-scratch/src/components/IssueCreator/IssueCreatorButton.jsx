/**
 * Header button for the issue creator — visible only to contributors.
 */
import { useState } from 'react';
import { IssueCreatorModal } from './IssueCreatorModal.jsx';

export function IssueCreatorButton({ isContributor, getToken, clerkUserId, appId, getPageContext }) {
  const [open, setOpen] = useState(false);

  if (!isContributor) return null;

  return (
    <>
      <button
        type="button"
        className="btn btn-issue-report"
        onClick={() => setOpen(true)}
        title="Report an issue or suggest a correction"
      >
        Report Issue
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
