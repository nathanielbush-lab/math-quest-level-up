// One consistent set of drawn icons, so the app looks the same on Mac and Windows
// (emoji are drawn differently on each). Emoji stay for the fun stuff: avatars and badges.
import type { TopicFamily } from "../content/types";

type Name =
  | "compass" | "flame" | "snow" | "star" | "bolt" | "book" | "flag" | "bulb" | "chat" | "trophy"
  | "map" | "home" | "bag" | "x" | "check" | "clipboard" | "apple" | "help" | "target" | "lock"
  | "calendar" | "speaker" | "calc" | "arrow" | "sparkle"
  | `fam-${TopicFamily}`;

const STROKE: Partial<Record<Name, string>> = {
  compass: "M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM15.5 8.5l-2.1 4.9-4.9 2.1 2.1-4.9z",
  snow: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2",
  bolt: "M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
  flag: "M5 22V4h12l-2.5 4.5L17 13H5",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.8 10.6c.8.7 1.3 1.6 1.3 2.4h5c0-.8.5-1.7 1.3-2.4A6 6 0 0 0 12 3z",
  chat: "M4 5h16v11H9l-5 4zM9 10.5h6",
  trophy: "M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8 21h8M9 17h6v4H9z",
  map: "M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20",
  home: "M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5",
  bag: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  x: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5 10 17 19 7",
  clipboard: "M8 3h8v3H8zM6 5H5v16h14V5h-1M9 11h6M9 15h4",
  apple: "M12 7c-2-2-7-1.5-7 4 0 4.5 3 9 5 9 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 5-4.5 5-9 0-5.5-5-6-7-4zM12 7c0-2 1-3.5 3-4",
  help: "M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01",
  target: "M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12h.01",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5",
  speaker: "M4 9.5h4L13 5v14l-5-4.5H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11",
  calc: "M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  "fam-algebra": "M4 7c2 0 3 1 4 3l3 6c1 2 2 3 4 3M14 7c-2 0-3 2-4 4s-2 4-5 5M17 9h4M19 7v4",
  "fam-functions": "M3 21h18M3 21V3M5 18c3-1 4-9 7-9s3 6 5 6 2-6 3-9",
  "fam-geometry": "M12 3 21 8v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8",
  "fam-stats": "M4 21V3M4 21h17M8 17v-5M12 17V8M16 17v-8M20 17v-3",
  "fam-trig": "M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3.5-4 5-3M2 12h20",
  "fam-number": "M3 13l3 0 3 7 4-16h8M14 11l5 6M19 11l-5 6",
};

export function Icon({ name, size = 20, className, title }: { name: Name; size?: number; className?: string; title?: string }) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };
  if (name === "flame") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={`icon icon-flame ${className ?? ""}`} {...a11y}>
        <path d="M12 2.5c1.2 4.2 5.8 5.6 5.8 11a5.8 5.8 0 0 1-11.6 0c0-3.4 2.2-4.6 2.4-7.8 1.3 1.1 2.3 2.4 3 4.3.6-2.6.6-5 .4-7.5z" fill="var(--flame, #FF8A3D)" stroke="var(--flame-edge, #E2621B)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={`icon icon-star ${className ?? ""}`} {...a11y}>
        <path d="M12 2.8 14.7 8.6 21 9.3 16.3 13.6 17.6 19.9 12 16.7 6.4 19.9 7.7 13.6 3 9.3 9.3 8.6z" fill="var(--star, #FFC531)" stroke="var(--star-edge, #E5A000)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className={`icon ${className ?? ""}`} {...a11y}>
      <path d={STROKE[name]} />
    </svg>
  );
}

export function FamilyIcon({ family, size = 20 }: { family: TopicFamily; size?: number }) {
  return <Icon name={`fam-${family}`} size={size} />;
}
