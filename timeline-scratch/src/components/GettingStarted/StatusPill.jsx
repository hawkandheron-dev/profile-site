/**
 * Status pill for an App_Issues row. Five values defined by the
 * contributor workflow.
 */
import './GettingStarted.css';

const LABELS = {
  submitted:        'Submitted',
  in_review:        'In Review',
  on_roadmap:       'On Roadmap',
  implemented:      'Implemented',
  not_going_to_do:  'Not Going To Do',
};

export function StatusPill({ status }) {
  const label = LABELS[status] || status;
  const cls = `gs-status-pill gs-status-${status || 'unknown'}`;
  return <span className={cls}>{label}</span>;
}

export const STATUS_LABELS = LABELS;
