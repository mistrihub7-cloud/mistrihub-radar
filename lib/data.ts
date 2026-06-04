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
  { name: "Electrician", tone: "text-amber-500", icon: "bolt" },
  { name: "Plumber", tone: "text-blue-600", icon: "tap" },
  { name: "Mechanic", tone: "text-red-500", icon: "tool" },
  { name: "Painter", tone: "text-violet-600", icon: "paint" },
  { name: "AC Repair", tone: "text-sky-600", icon: "snow" },
  { name: "Carpenter", tone: "text-orange-600", icon: "hammer" },
  { name: "Labour", tone: "text-emerald-600", icon: "worker" },
  { name: "Appliance Repair", tone: "text-rose-600", icon: "plug" }
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
