export type WorkerStatus = "Available Today" | "Busy" | "Not Available";

export type Worker = {
  name: string;
  skill: string;
  distance: string;
  rating: string;
  reviews: number;
  trust: number;
  jobs: number;
  response: string;
  status: WorkerStatus;
  serviceRadius: 5 | 10 | 15 | 20;
  distanceKm: number;
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

export const workers: Worker[] = [
  {
    name: "Rajesh Kumar",
    skill: "Electrician",
    distance: "1.2 km away",
    rating: "4.8",
    reviews: 120,
    trust: 92,
    jobs: 320,
    response: "12 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 1.2
  },
  {
    name: "Amit Kumar",
    skill: "Plumber",
    distance: "1.8 km away",
    rating: "4.7",
    reviews: 98,
    trust: 88,
    jobs: 250,
    response: "15 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 1.8
  },
  {
    name: "Sanjay Shah",
    skill: "Mechanic",
    distance: "2.1 km away",
    rating: "4.6",
    reviews: 75,
    trust: 85,
    jobs: 190,
    response: "18 min",
    status: "Busy",
    serviceRadius: 15,
    distanceKm: 2.1
  },
  {
    name: "Vikash Kumar",
    skill: "Painter",
    distance: "2.8 km away",
    rating: "4.5",
    reviews: 60,
    trust: 70,
    jobs: 140,
    response: "25 min",
    status: "Not Available",
    serviceRadius: 5,
    distanceKm: 2.8
  },
  {
    name: "Suraj Kumar",
    skill: "AC Technician",
    distance: "3.2 km away",
    rating: "4.8",
    reviews: 110,
    trust: 90,
    jobs: 210,
    response: "14 min",
    status: "Available Today",
    serviceRadius: 15,
    distanceKm: 3.2
  }
];

export const discoveryRules = {
  cityRadius: "10 km",
  townRadius: "15 km",
  workerRadiusOptions: ["5 km", "10 km", "15 km", "20 km"],
  priority: ["Available Today", "Closest distance", "Highest trust score", "Fast response time"]
};

export const topWorkers = [
  { name: "Vikram Singh", skill: "Carpenter", rating: "4.9", reviews: 130, trust: 95 },
  { name: "Yogesh Kumar", skill: "Plumber", rating: "4.8", reviews: 115, trust: 93 },
  { name: "Pawan Kumar", skill: "Painter", rating: "4.8", reviews: 102, trust: 92 },
  { name: "Imran Khan", skill: "Appliance Repair", rating: "4.7", reviews: 99, trust: 90 }
];

export const jobRequest: JobRequest = {
  id: "MH1256",
  service: "Electrician",
  summary: "Switch board repair and wiring issue",
  description: "Switch board repair and wiring issue in my room. Spark sound is coming when fan switch is turned on.",
  area: "Harmu Housing Colony, Ranchi",
  distance: "1.2 km from worker",
  urgency: "Urgent",
  preferredTime: "Today, 4:00 PM",
  photoAvailable: true,
  status: "Review Pending"
};

export const reviewTimeline = [
  { label: "Requested", time: "Today, 10:30 AM", done: true },
  { label: "Worker Reviewing", time: "Waiting for worker response", active: true },
  { label: "Accepted", time: "Contact unlocks after this" },
  { label: "On The Way", time: "Pending" },
  { label: "Completed", time: "Pending" }
];

export const timeline = [
  { label: "Requested", time: "Today, 10:30 AM", done: true },
  { label: "Accepted", time: "Today, 10:32 AM", done: true },
  { label: "On The Way", time: "Today, 10:40 AM", done: true },
  { label: "In Progress", time: "Today, 10:50 AM", active: true },
  { label: "Completed", time: "Pending" },
  { label: "Cancelled", time: "Pending" }
];

export const websiteNotifications = [
  "New job request",
  "Job accepted",
  "Job declined",
  "Need more details",
  "Worker on the way",
  "Job completed"
];

export const whatsappWorkerNotification = [
  "New job request",
  "Service: Electrician",
  "Area: Harmu Housing Colony, Ranchi",
  "Distance: 1.2 km from worker",
  "Problem: Switch board repair and wiring issue",
  "Open request: /worker-request"
];
