/**
 * Interactive DOM walkthrough.
 *
 * Renders an SVG overlay with a spotlight cut-out around the current step's
 * target element plus a popover anchored to it. Next/Prev/Skip controls,
 * keyboard shortcuts. If a target isn't mounted yet (e.g. modal mid-mount),
 * polls briefly before centering the popover.
 *
 * Each step: {
 *   id:      string,
 *   target:  string | () => Element | null,    // CSS selector or resolver
 *   title:   string,
 *   body:    string | ReactNode,
 *   placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto',
 *   onEnter?: ({ next, prev, complete, skip, setIndex }) => void,
 *   onExit?:  () => void,
 * }
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './DomTour.css';

const SPOTLIGHT_PAD = 8;
const SPOTLIGHT_RADIUS = 10;
const POPOVER_OFFSET = 14;
const POPOVER_WIDTH = 320;
const POPOVER_MAX_HEIGHT = 260;
const TARGET_POLL_INTERVAL = 80;
const TARGET_POLL_ATTEMPTS = 20; // ~1.6s

function resolveTarget(target) {
  if (!target) return null;
  if (typeof target === 'function') return target() || null;
  try { return document.querySelector(target); } catch { return null; }
}

function pickPlacement(rect, viewport, desired) {
  if (desired && desired !== 'auto') return desired;
  const space = {
    top: rect.top,
    bottom: viewport.height - rect.bottom,
    left: rect.left,
    right: viewport.width - rect.right,
  };
  // Prefer bottom, then top, then right, then left — whichever has room
  if (space.bottom >= POPOVER_MAX_HEIGHT + POPOVER_OFFSET) return 'bottom';
  if (space.top >= POPOVER_MAX_HEIGHT + POPOVER_OFFSET) return 'top';
  if (space.right >= POPOVER_WIDTH + POPOVER_OFFSET) return 'right';
  if (space.left >= POPOVER_WIDTH + POPOVER_OFFSET) return 'left';
  return 'bottom';
}

function computePopoverPosition(rect, placement, viewport) {
  let top = 0;
  let left = 0;
  switch (placement) {
    case 'top':
      top = rect.top - POPOVER_OFFSET;
      left = rect.left + rect.width / 2;
      break;
    case 'bottom':
      top = rect.bottom + POPOVER_OFFSET;
      left = rect.left + rect.width / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2;
      left = rect.left - POPOVER_OFFSET;
      break;
    case 'right':
      top = rect.top + rect.height / 2;
      left = rect.right + POPOVER_OFFSET;
      break;
    default:
      top = rect.bottom + POPOVER_OFFSET;
      left = rect.left + rect.width / 2;
  }
  // Clamp so popover stays on-screen
  const halfW = POPOVER_WIDTH / 2;
  const minLeft = halfW + 12;
  const maxLeft = viewport.width - halfW - 12;
  if (placement === 'top' || placement === 'bottom') {
    left = Math.max(minLeft, Math.min(maxLeft, left));
  }
  const minTop = 12;
  const maxTop = viewport.height - 12;
  top = Math.max(minTop, Math.min(maxTop, top));
  return { top, left };
}

export function DomTour({ steps, active, onComplete, onSkip, onStepChange, stepIndex = 0, onNext, onPrev }) {
  const [targetRect, setTargetRect] = useState(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));
  const pollRef = useRef(null);
  const prevStepRef = useRef(-1);
  const exitedStepRef = useRef(-1);

  const currentStep = steps?.[stepIndex] || null;
  const totalSteps = steps?.length || 0;
  const isLast = stepIndex >= totalSteps - 1;

  // Fire onEnter / onExit around transitions
  useEffect(() => {
    if (!active || !currentStep) return;
    if (prevStepRef.current === stepIndex) return;

    // Exit the previous step if any
    const prevStep = prevStepRef.current >= 0 ? steps[prevStepRef.current] : null;
    if (prevStep && exitedStepRef.current !== prevStepRef.current) {
      try { prevStep.onExit?.(); } catch (err) { console.warn('DomTour onExit failed:', err); }
      exitedStepRef.current = prevStepRef.current;
    }

    prevStepRef.current = stepIndex;
    onStepChange?.(stepIndex);

    // Enter the new step
    try {
      currentStep.onEnter?.({
        setIndex: () => {},
      });
    } catch (err) { console.warn('DomTour onEnter failed:', err); }
  }, [active, stepIndex, currentStep, steps, onStepChange]);

  // When tour goes inactive, fire onExit for the last step
  useEffect(() => {
    if (active) return;
    if (prevStepRef.current >= 0 && exitedStepRef.current !== prevStepRef.current) {
      const step = steps?.[prevStepRef.current];
      try { step?.onExit?.(); } catch (err) { console.warn('DomTour onExit failed:', err); }
      exitedStepRef.current = prevStepRef.current;
    }
    if (!active) {
      prevStepRef.current = -1;
      exitedStepRef.current = -1;
    }
  }, [active, steps]);

  // Measure target rect (with polling fallback)
  const measure = useCallback(() => {
    if (!active || !currentStep) return;
    const el = resolveTarget(currentStep.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      return true;
    }
    return false;
  }, [active, currentStep]);

  useLayoutEffect(() => {
    if (!active || !currentStep) {
      setTargetRect(null);
      return undefined;
    }

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    let attempts = 0;
    const found = measure();
    if (!found) {
      pollRef.current = setInterval(() => {
        attempts += 1;
        const ok = measure();
        if (ok || attempts >= TARGET_POLL_ATTEMPTS) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          if (!ok) setTargetRect(null);
        }
      }, TARGET_POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [active, currentStep, measure]);

  // Reposition on resize / scroll / layout shifts
  useEffect(() => {
    if (!active) return undefined;
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      measure();
    };
    const onScroll = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      ro.disconnect();
    };
  }, [active, measure]);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
    } else {
      onNext?.();
    }
  }, [isLast, onNext, onComplete]);

  const handlePrev = useCallback(() => { onPrev?.(); }, [onPrev]);
  const handleSkip = useCallback(() => { onSkip?.(); }, [onSkip]);

  // Keyboard
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); handleSkip(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, handleNext, handlePrev, handleSkip]);

  const placement = useMemo(() => {
    if (!targetRect) return 'bottom';
    return pickPlacement(targetRect, viewport, currentStep?.placement);
  }, [targetRect, viewport, currentStep]);

  const popoverPos = useMemo(() => {
    if (!targetRect) {
      return { top: viewport.height / 2, left: viewport.width / 2, centered: true };
    }
    const p = computePopoverPosition(targetRect, placement, viewport);
    return { ...p, centered: false };
  }, [targetRect, placement, viewport]);

  if (!active || !currentStep) return null;

  const spotlight = targetRect ? {
    x: targetRect.left - SPOTLIGHT_PAD,
    y: targetRect.top - SPOTLIGHT_PAD,
    w: targetRect.width + SPOTLIGHT_PAD * 2,
    h: targetRect.height + SPOTLIGHT_PAD * 2,
  } : null;

  // Popover transform origin based on placement
  const popoverTransform = popoverPos.centered
    ? 'translate(-50%, -50%)'
    : placement === 'top'
      ? 'translate(-50%, -100%)'
      : placement === 'bottom'
        ? 'translate(-50%, 0)'
        : placement === 'left'
          ? 'translate(-100%, -50%)'
          : 'translate(0, -50%)';

  return (
    <div className="dom-tour-root" role="dialog" aria-modal="true">
      <svg className="dom-tour-overlay" width={viewport.width} height={viewport.height}>
        <defs>
          <mask id="dom-tour-mask">
            <rect x="0" y="0" width={viewport.width} height={viewport.height} fill="white" />
            {spotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.w}
                height={spotlight.h}
                rx={SPOTLIGHT_RADIUS}
                ry={SPOTLIGHT_RADIUS}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={viewport.width}
          height={viewport.height}
          fill="rgba(0, 0, 0, 0.45)"
          mask="url(#dom-tour-mask)"
        />
        {spotlight && (
          <rect
            className="dom-tour-ring"
            x={spotlight.x}
            y={spotlight.y}
            width={spotlight.w}
            height={spotlight.h}
            rx={SPOTLIGHT_RADIUS}
            ry={SPOTLIGHT_RADIUS}
          />
        )}
      </svg>

      <div
        className={`dom-tour-popover dom-tour-placement-${placement}${popoverPos.centered ? ' dom-tour-centered' : ''}`}
        style={{
          top: popoverPos.top,
          left: popoverPos.left,
          width: POPOVER_WIDTH,
          maxHeight: POPOVER_MAX_HEIGHT,
          transform: popoverTransform,
        }}
      >
        <div className="dom-tour-step-count">
          Step {stepIndex + 1} of {totalSteps}
        </div>
        {currentStep.title && <h3 className="dom-tour-title">{currentStep.title}</h3>}
        <div className="dom-tour-body">{currentStep.body}</div>
        <div className="dom-tour-actions">
          <button type="button" className="dom-tour-skip" onClick={handleSkip}>Skip</button>
          <div className="dom-tour-nav">
            <button
              type="button"
              className="dom-tour-btn"
              onClick={handlePrev}
              disabled={stepIndex === 0}
            >
              Back
            </button>
            <button
              type="button"
              className="dom-tour-btn dom-tour-btn-primary"
              onClick={handleNext}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
