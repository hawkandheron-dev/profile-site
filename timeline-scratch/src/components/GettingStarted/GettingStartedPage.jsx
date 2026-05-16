/**
 * Getting Started page for invited contributors.
 *
 * Shows a welcome banner, a tour CTA, and an "All contributions" list of
 * App_Issues submissions across the contributor pool (with status +
 * discussion thread).
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
import { fetchMyIssues, fetchSubmittersByIds } from '../../services/issueService.js';
import './GettingStarted.css';

export function GettingStartedPage({
  getToken,
  clerkUserId,
  displayName,
  email,
  role,
  isSignedIn = false,
  isContributor = false,
  isAdmin: isAdminProp,
  appId = 'ch-timeline',
  getPageContext,
  aggregateAcrossApps = false,
}) {
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitterNameById, setSubmitterNameById] = useState({});

  const [modalOpen, setModalOpen] = useState(false);

  // Prefer the prop when provided; fall back to role string for direct callers.
  const isAdmin = typeof isAdminProp === 'boolean' ? isAdminProp : role === 'admin';
  const canWrite = isContributor || isAdmin;

  const contributionsRef = useRef(null);

  // Always-mounted feedback button so [data-tour="issue-create-btn"] exists
  // as a tour target even before the tour opens the modal.
  const tourButtonRef = useRef(null);

  const loadIssues = useCallback(async () => {
    // RLS only returns rows to contributors/admins. Skip the fetch for
    // anyone else so we don't surface a token error or an empty-because-
    // forbidden state — the page renders a placeholder instead.
    if (!getToken || !canWrite) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyIssues(aggregateAcrossApps ? undefined : appId, getToken);
      setIssues(list);
    } catch (err) {
      setError(err.message || 'Failed to load contributions.');
    } finally {
      setLoading(false);
    }
  }, [getToken, appId, canWrite, aggregateAcrossApps]);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  // Fetch display names for submitters that aren't the current user.
  useEffect(() => {
    if (!issues || issues.length === 0 || !getToken) return;
    const ids = [...new Set(issues.map(i => i.submitted_by).filter(id => id && id !== clerkUserId))];
    if (ids.length === 0) { setSubmitterNameById({}); return; }
    let cancelled = false;
    fetchSubmittersByIds(ids, getToken)
      .then(map => { if (!cancelled) setSubmitterNameById(map); })
      .catch(() => { /* non-fatal — row will omit the "by X" */ });
    return () => { cancelled = true; };
  }, [issues, clerkUserId, getToken]);

  const handleIssueUpdated = useCallback((issueId, patch) => {
    setIssues(prev => prev?.map(i => i.issue_id === issueId ? { ...i, ...patch } : i));
  }, []);

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
      <WelcomeHeader
        displayName={displayName}
        email={email}
        role={role}
        isSignedIn={isSignedIn}
        isContributor={isContributor}
        isAdmin={isAdmin}
        siteWide={aggregateAcrossApps}
      />

      {canWrite && <TourCta onStart={tour.start} completedAt={tour.completedAt} />}

      {/* Always render the button so the [data-tour="issue-create-btn"] anchor
          exists; disable it for non-contributors and swap the hint. */}
      <div className="gs-feedback-button-row">
        <button
          ref={tourButtonRef}
          type="button"
          className="btn btn-accent"
          onClick={() => { if (canWrite) setModalOpen(true); }}
          disabled={!canWrite}
          aria-disabled={!canWrite}
          data-tour="issue-create-btn"
        >
          Submit Feedback
        </button>
        <span className="gs-feedback-button-hint">
          {canWrite
            ? 'Click any time to open the feedback form.'
            : 'Submitting feedback is reserved for contributors invited by the Windhover team.'}
        </span>
      </div>

      <div ref={contributionsRef}>
        {canWrite ? (
          <ContributionList
            issues={issues}
            loading={loading}
            error={error}
            onSubmitNew={() => setModalOpen(true)}
            clerkUserId={clerkUserId}
            getToken={getToken}
            isAdmin={isAdmin}
            submitterNameById={submitterNameById}
            onIssueUpdated={handleIssueUpdated}
            groupBySection={aggregateAcrossApps}
          />
        ) : (
          <section className="gs-contributions">
            <div className="gs-contributions-header">
              <h2>All contributions</h2>
            </div>
            <div className="gs-contributions-empty">
              <p>
                {isSignedIn
                  ? 'Contributors invited by the Windhover team can see and discuss feedback here.'
                  : 'Sign in as a contributor to see and discuss feedback here.'}
              </p>
            </div>
          </section>
        )}
      </div>

      {modalOpen && canWrite && (
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
