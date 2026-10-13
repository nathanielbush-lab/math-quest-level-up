import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** The coach's mark: a small rounded badge with a spark, used where Math Quest had its owl. */
export function CoachMark({ size = 34 }: { size?: number }) {
  return (
    <span className="coach-mark" style={{ width: size, height: size }} aria-hidden="true">
      <Icon name="bolt" size={Math.round(size * 0.55)} />
    </span>
  );
}

/** A hint or tip in a speech-bubble style card. */
export function CoachSays({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`coach-says ${className ?? ""}`}>
      <CoachMark />
      <div className="bubble">{children}</div>
    </div>
  );
}
