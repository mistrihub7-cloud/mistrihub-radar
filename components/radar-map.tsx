import { workers } from "@/lib/data";

export function RadarMap() {
  const positions = [
    "left-[18%] top-[18%]",
    "left-[58%] top-[30%]",
    "left-[72%] top-[58%]",
    "left-[36%] top-[70%]"
  ];

  return (
    <div className="map-panel relative rounded-2xl border border-slate-200">
      <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-brand-600 shadow-card">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      {positions.map((pos, index) => (
        <span className={`radar-pin ${pos}`} key={pos}>
          <span className={workers[index].status === "Available" ? "worker-avatar !h-9 !w-9 !rounded-xl" : "worker-avatar busy !h-9 !w-9 !rounded-xl"} />
        </span>
      ))}
    </div>
  );
}
