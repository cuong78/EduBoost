import { useState, useEffect, useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";

/**
 * GuidedTour — wrapper cho react-joyride
 *
 * Props:
 *  - steps: array of Joyride step objects
 *  - tourKey: string — unique key lưu trong localStorage để track đã xem chưa
 *  - run (optional): boolean — force run
 *  - onFinish (optional): callback khi kết thúc tour
 */
const TOOLTIP_STYLES = {
  options: {
    arrowColor: "#ffffff",
    backgroundColor: "#ffffff",
    overlayColor: "rgba(15, 23, 42, 0.55)",
    primaryColor: "#6366f1",
    textColor: "#1e293b",
    zIndex: 10000,
    width: 380,
  },
  tooltip: {
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(99,102,241,0.1)",
    padding: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  tooltipContainer: {
    textAlign: "left",
  },
  tooltipTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "6px",
  },
  tooltipContent: {
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#475569",
    padding: "4px 0",
  },
  buttonNext: {
    backgroundColor: "#6366f1",
    borderRadius: "10px",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
  },
  buttonBack: {
    color: "#6366f1",
    fontSize: "0.9rem",
    fontWeight: 600,
    marginRight: "8px",
    fontFamily: "'Inter', sans-serif",
  },
  buttonSkip: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontFamily: "'Inter', sans-serif",
  },
  buttonClose: {
    width: "28px",
    height: "28px",
  },
  spotlight: {
    borderRadius: "12px",
    boxShadow: "0 0 0 4px rgba(99,102,241,0.2), 0 0 20px rgba(99,102,241,0.1)",
  },
  beacon: {
    display: "none",
  },
};

const GuidedTour = ({ steps, tourKey, run: forcedRun, onFinish }) => {
  const storageKey = `eduboost_tour_${tourKey}`;
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (forcedRun === true) {
      setRun(true);
      setStepIndex(0);
      return;
    }
    // Auto-run if never seen
    const seen = localStorage.getItem(storageKey);
    if (!seen && steps && steps.length > 0) {
      // Small delay so elements are rendered
      const timer = setTimeout(() => setRun(true), 600);
      return () => clearTimeout(timer);
    }
  }, [forcedRun, storageKey, steps]);

  const handleCallback = useCallback(
    (data) => {
      const { status, action, index, type } = data;

      if (type === "step:after") {
        setStepIndex(index + (action === "prev" ? -1 : 1));
      }

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        setRun(false);
        localStorage.setItem(storageKey, "true");
        if (onFinish) onFinish();
      }
    },
    [storageKey, onFinish]
  );

  if (!steps || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      scrollOffset={120}
      disableOverlayClose={false}
      callback={handleCallback}
      styles={TOOLTIP_STYLES}
      locale={{
        back: "← Trước",
        close: "Đóng",
        last: "Hoàn tất ✓",
        next: "Tiếp theo →",
        open: "Mở",
        skip: "Bỏ qua",
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: { transition: "opacity 0.3s ease, transform 0.3s ease" },
        },
      }}
    />
  );
};

export default GuidedTour;
