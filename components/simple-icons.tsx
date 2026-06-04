type IconProps = {
  name: string;
  className?: string;
};

const paths: Record<string, string> = {
  logo: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3.2 6 3.3v6.9l-6 3.3-6-3.3V8.5l6-3.3Zm-2.4 4.4h4.8v6.8h-2.2v-4.5h-.4l-1.7 4.5H7.8l1.8-6.8Z",
  location: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z",
  bell: "M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Zm-8 4h4a2 2 0 0 1-4 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  filter: "M4 5h16l-6 7v5l-4 2v-7L4 5Z",
  star: "m12 2 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17l-5.9 3.1 1.2-6.5L2.5 8.9 9.1 8 12 2Z",
  bolt: "M13 2 4 13h7l-1 9 9-12h-7l1-8Z",
  tap: "M8 7h8M12 7V4m-4 7h8v8H8v-8Zm-2 3H4m16 0h-2",
  tool: "M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.8 2.8-3-3 2.8-2.8Z",
  paint: "M4 4h12a2 2 0 0 1 2 2v3H4V4Zm10 5v5a3 3 0 0 1-3 3H9v3H7v-5h4a1 1 0 0 0 1-1V9h2Z",
  snow: "M12 2v20M4 6l16 12M20 6 4 18M7 4l10 16M17 4 7 20",
  hammer: "M14 4 20 10l-2 2-6-6 2-2ZM4 20l8-8 2 2-8 8H4v-2Z",
  worker: "M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4Zm-6 8h12v9H6v-9Z",
  plug: "M8 2v6m8-6v6m-9 0h10v4a5 5 0 0 1-4 4.9V22h-2v-5.1A5 5 0 0 1 7 12V8Z",
  home: "M3 11 12 3l9 8v9h-6v-6H9v6H3v-9Z",
  plus: "M12 5v14M5 12h14",
  jobs: "M6 4h12v16H6V4Zm3 4h6M9 12h6M9 16h4",
  user: "M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-8 9a8 8 0 0 1 16 0",
  phone: "M6.6 2h4l1 5-2.4 1.6a12 12 0 0 0 6.2 6.2L17 12.4l5 1v4a3 3 0 0 1-3.3 3A18.4 18.4 0 0 1 3.6 5.3 3 3 0 0 1 6.6 2Z",
  shield: "M12 2 5 5v6c0 5 3.3 8.8 7 10 3.7-1.2 7-5 7-10V5l-7-3Z",
  check: "m5 12 4 4L19 6",
  calendar: "M7 3v4m10-4v4M4 8h16v12H4V8Z",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4 2 1-2 4-2-.5a8 8 0 0 1-2 1.2L15.5 20h-7L8 17.7a8 8 0 0 1-2-1.2L4 17l-2-4 2-1a8 8 0 0 1 0-2L2 9l2-4 2 .5A8 8 0 0 1 8 4.3L8.5 2h7l.5 2.3a8 8 0 0 1 2 1.2l2-.5 2 4-2 1a8 8 0 0 1 0 2Z",
  broom: "M15 3 21 9M14 4l6 6-8 8-6-6 8-8ZM4 14l6 6M3 21h8",
  bug: "M8 7a4 4 0 0 1 8 0v1H8V7Zm-1 5h10v5a5 5 0 0 1-10 0v-5Zm-4 1h4m10 0h4M4 18h3m10 0h3M9 4 7 2m8 2 2-2",
  mason: "M4 16h16v4H4v-4Zm2-6h16v4H6v-4ZM2 4h16v4H2V4Z",
  weld: "M4 20l7-7m2-2 7-7M14 4l6 6M7 17l-3 3m10-10 3 3m-6-1 2 2",
  water: "M12 2s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Zm-3 12a3 3 0 0 0 5 2",
  camera: "M4 7h4l2-3h4l2 3h4v12H4V7Zm8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  tiles: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z",
  leaf: "M20 4C10 4 5 9 5 16a4 4 0 0 0 4 4c7 0 11-6 11-16ZM5 20c3-6 8-9 15-16"
};

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d={paths[name] ?? paths.logo} />
    </svg>
  );
}
