/**
 * Getting Started page for invited contributors.
 *
 * Shows a welcome banner, a tour CTA, and a "My contributions" list of the
 * user's App_Issues submissions (with status + discussion thread).
 *
 * Renders its own IssueCreatorModal (wired through a local openSignal so the
 * DomTour can open it programmatically on step 2). The header's global
 * IssueCreatorButton is hidden on this page to avoid two instances competing.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IssueCreatorModal } from '../IssueCreator/IssueCreatorModal.jsx';
import { WelcomeHeader } from './WelcomeHeader.jsx';
import { TourCta } from './TourCta.jsx';
import { ContributionList } from './ContributionList.jsx';
import { DomTour } from './tour/DomTour.jsx';
import { useDomTour } from './tour/useDomTour.js';
import { makeGettingStartedSteps } from './tour/gettingStartedSteps.js';
import { fetchMyIssues } from '../../services/issueService.js';
import './GettingStarted.css';

export function GettingStartedPage({
  getToken,
  clerkUserId,
  displayName,
  email,
  role,
  appId = 'ch-timeline',
  getPageContext,
}) {
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const contributionsRef = useRef(null);

  // Always-mounted feedback button so [data-tour="issue-create-btn"] exists
  // as a tour target even before the tour opens the modal.
  const tourButtonRef = useRef(null);

  const loadIssues = useCallback(async () => {
    if (!getToken) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyIssues(appId, getToken);
      setIssues(list);
    } catch (err) {
      setError(err.message || 'Failed to load your submissions.');
    } finally {
      setLoading(false);
    }
  }, [getToken, appId]);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  const requestOpenIssueModal = useCallback(() => { setModalOpen(true); }, []);
  const requestCloseIssueModal = useCallback(() => { setModalOpen(false); }, []);
  const scrollToContributions = useCallback(() => {
    contributionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const steps = useMemo(
    () => makeGettingStartedSteps({
      requestOpenIssueModal,
      requestCloseIssueModal,
      scrollToContributions,
    }),
    [requestOpenIssueModal, requestCloseIssueModal, scrollToContributions],
  );

  const tour = useDomTour(steps.length);

  const handleTourComplete = useCallback(() => {
    tour.complete();
    setModalOpen(false);
  }, [tour]);

  const handleTourSkip = useCallback(() => {
    tour.skip();
    setModalOpen(false);
  }, [tour]);

  const handleIssueSubmitted = useCallback(() => {
    loadIssues();
  }, [loadIssues]);

  return (
    <div className="gs-page">
      <WelcomeHeader displayName={displayName} email={email} role={role} />

      <TourCta onStart={tour.start} completedAt={tour.completedAt} />

      {/* Dedicated feedback button for the tour to anchor on. Also the
          primary call-to-action on this page for opening the modal. */}
      <div className="gs-feedback-button-row">
        <button
          ref={tourButtonRef}
          type="button"
          className="btn btn-accent"
          onClick={() => setModalOpen(true)}
          data-tour="issue-create-btn"
        >
          Submit Feedback
        </button>
        <span className="gs-feedback-button-hint">
          Click any time to open the feedback form.
        </span>
      </div>

      <div ref={contributionsRef}>
        <ContributionList
          issues={issues}
          loading={loading}
          error={error}
          onSubmitNew={() => setModalOpen(true)}
          clerkUserId={clerkUserId}
          getToken={getToken}
        />
      </div>

      {modalOpen && (
        <IssueCreatorModal
          isOpen
          onClose={() => setModalOpen(false)}
          getToken={getToken}
          clerkUserId={clerkUserId}
          appId={appId}
          getPageContext={getPageContext}
          onSubmitted={handleIssueSubmitted}
        />
      )}

      <DomTour
        steps={steps}
        active={tour.active}
        stepIndex={tour.stepIndex}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={handleTourSkip}
        onComplete={handleTourComplete}
      />
    </div>
  );
}
