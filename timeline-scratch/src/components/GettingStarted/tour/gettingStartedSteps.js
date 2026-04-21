/**
 * Step definitions for the Getting Started tour.
 *
 * Factory so callers can wire page-level callbacks (e.g. open the feedback
 * modal on step 2, close it before step 6, scroll to the contributions list).
 *
 * @param {Object} cbs
 * @param {() => void} cbs.requestOpenIssueModal  Programmatically open the issue modal.
 * @param {() => void} cbs.requestCloseIssueModal Close the issue modal.
 * @param {() => void} cbs.scrollToContributions  Scroll the My Contributions section into view.
 */
export function makeGettingStartedSteps({
  requestOpenIssueModal,
  requestCloseIssueModal,
  scrollToContributions,
}) {
  return [
    {
      id: 'feedback-button',
      target: '[data-tour="issue-create-btn"]',
      title: 'Start here: the Submit Feedback button',
      body: (
        'This is your contribution entry point. Anything you notice on the ' +
        'timeline — a typo, a missing figure, a feature wish, a broken link — ' +
        'starts with this button.'
      ),
      placement: 'bottom',
    },
    {
      id: 'issue-type',
      target: '[data-tour="issue-type-pills"]',
      title: 'Pick the kind of feedback',
      body: (
        'Choose the type that fits best. "Data Correction" for facts on the ' +
        'timeline, "Feature Request" for ideas, "Bug" for something broken, ' +
        '"General" for anything else.'
      ),
      placement: 'bottom',
      onEnter: () => { requestOpenIssueModal?.(); },
    },
    {
      id: 'issue-title',
      target: '[data-tour="issue-title-input"]',
      title: 'Give it a short title',
      body: (
        'A descriptive one-liner helps admins triage quickly. ' +
        'E.g. "Augustine\'s date of death is wrong" or "Add filter for Eastern fathers."'
      ),
      placement: 'bottom',
    },
    {
      id: 'issue-description',
      target: '[data-tour="issue-description-textarea"]',
      title: 'Describe it freely',
      body: (
        'Write as much or as little as you need. You can paste links and ' +
        'reference sources. The current page context (what you\'re looking at) ' +
        'is captured automatically.'
      ),
      placement: 'top',
    },
    {
      id: 'issue-submit',
      target: '[data-tour="issue-submit-btn"]',
      title: 'Submit it',
      body: (
        'Your submission lands in the admins\' review queue and appears ' +
        'below under "My contributions" with a status of Submitted.'
      ),
      placement: 'top',
      onExit: () => { requestCloseIssueModal?.(); },
    },
    {
      id: 'my-contributions',
      target: '[data-tour="my-contributions-list"]',
      title: 'Track your contributions',
      body: (
        'Every submission shows up here with its current status. ' +
        'Click a row to see the full description, admin notes, and the ' +
        'discussion thread.'
      ),
      placement: 'top',
      onEnter: () => { scrollToContributions?.(); },
    },
    {
      id: 'status-legend',
      target: '[data-tour="status-pill-legend"]',
      title: 'Five status values',
      body: (
        'Submitted → In Review → On Roadmap → Implemented (or Not Going To Do). ' +
        'Admins move items along and leave notes so you always know where ' +
        'your feedback stands.'
      ),
      placement: 'top',
    },
  ];
}
