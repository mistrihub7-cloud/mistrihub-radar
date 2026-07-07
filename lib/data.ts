export type WorkerStatus = "Available Today" | "Busy" | "Not Available";

export type Worker = {
  id: string;
  name: string;
  skill: string;
  location: string;
  city: string;
  distance: string;
  rating: string;
  reviews: number;
  trust: number;
  jobs: number;
  response: string;
  experience?: string;
  status: WorkerStatus;
  serviceRadius: 5 | 10 | 15 | 20;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  profilePhoto?: string;
};

export type JobRequest = {
  id: string;
  service: string;
  summary: string;
  description: string;
  area: string;
  distance: string;
  urgency: "Normal" | "Urgent";
  preferredTime: string;
  photoAvailable: boolean;
  status: "Review Pending" | "Accepted" | "Declined" | "Need More Details";
};

export const categories = [
  { name: "Electrical Expert", tone: "text-amber-500", bg: "bg-amber-50", icon: "bolt" },
  { name: "Plumbing Expert", tone: "text-blue-600", bg: "bg-blue-50", icon: "tap" },
  { name: "Auto Mechanic", tone: "text-red-500", bg: "bg-red-50", icon: "tool" },
  { name: "Painting Professional", tone: "text-violet-600", bg: "bg-violet-50", icon: "paint" },
  { name: "AC Service Technician", tone: "text-sky-600", bg: "bg-sky-50", icon: "snow" },
  { name: "Woodwork Expert", tone: "text-orange-600", bg: "bg-orange-50", icon: "hammer" },
  { name: "Support Assistant", tone: "text-emerald-600", bg: "bg-emerald-50", icon: "worker" },
  { name: "Home Cleaning Expert", tone: "text-cyan-600", bg: "bg-cyan-50", icon: "broom" },
  { name: "Driver & Car Service", tone: "text-blue-700", bg: "bg-blue-50", icon: "car" },
  { name: "Construction Mason", tone: "text-stone-600", bg: "bg-stone-100", icon: "mason" },
  { name: "Welding Expert", tone: "text-yellow-600", bg: "bg-yellow-50", icon: "weld" },
  { name: "RO Water Technician", tone: "text-indigo-600", bg: "bg-indigo-50", icon: "water" },
  { name: "CCTV Security Technician", tone: "text-slate-700", bg: "bg-slate-100", icon: "camera" },
  { name: "Tile & Marble Expert", tone: "text-teal-600", bg: "bg-teal-50", icon: "tiles" }
];

// Clean slate: no bundled worker records. New workers should come from Supabase registration.
export const workers: Worker[] = [];

export const discoveryRules = {
  cityRadius: "10 km",
  townRadius: "15 km",
  workerRadiusOptions: ["5 km", "10 km", "15 km", "20 km"],
  priority: ["Available Today", "Closest distance", "Highest trust score", "Fast response time"]
};

export const topWorkers: Worker[] = [];
