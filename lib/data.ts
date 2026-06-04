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
  { name: "Electrician", tone: "text-amber-500", bg: "bg-amber-50", icon: "bolt" },
  { name: "Plumber", tone: "text-blue-600", bg: "bg-blue-50", icon: "tap" },
  { name: "Mechanic", tone: "text-red-500", bg: "bg-red-50", icon: "tool" },
  { name: "Painter", tone: "text-violet-600", bg: "bg-violet-50", icon: "paint" },
  { name: "AC Repair", tone: "text-sky-600", bg: "bg-sky-50", icon: "snow" },
  { name: "Carpenter", tone: "text-orange-600", bg: "bg-orange-50", icon: "hammer" },
  { name: "Labour", tone: "text-emerald-600", bg: "bg-emerald-50", icon: "worker" },
  { name: "Appliance Repair", tone: "text-rose-600", bg: "bg-rose-50", icon: "plug" },
  { name: "Home Cleaning", tone: "text-cyan-600", bg: "bg-cyan-50", icon: "broom" },
  { name: "Pest Control", tone: "text-lime-700", bg: "bg-lime-50", icon: "bug" },
  { name: "Mason", tone: "text-stone-600", bg: "bg-stone-100", icon: "mason" },
  { name: "Welder", tone: "text-yellow-600", bg: "bg-yellow-50", icon: "weld" },
  { name: "RO Service", tone: "text-indigo-600", bg: "bg-indigo-50", icon: "water" },
  { name: "CCTV", tone: "text-slate-700", bg: "bg-slate-100", icon: "camera" },
  { name: "Tile / Marble", tone: "text-teal-600", bg: "bg-teal-50", icon: "tiles" },
  { name: "Gardener", tone: "text-green-600", bg: "bg-green-50", icon: "leaf" }
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
