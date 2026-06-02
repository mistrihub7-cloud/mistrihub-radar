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
  phone?: string;
  whatsapp?: string;
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
    id: "bddaa62a-727a-45b4-b7e5-ca5b3c2f5e7f",
    name: "Rafik Alam",
    skill: "Electrician",
    location: "lalganj",
    city: "lalganj",
    distance: "1.0 km away",
    rating: "5.0",
    reviews: 1,
    trust: 95,
    jobs: 24,
    response: "10 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 1,
    phone: "7061645989",
    whatsapp: "7061645989"
  },
  {
    id: "b67fd0ae-fbf7-4166-af50-ace6da6fafc6",
    name: "Mohammad Imran",
    skill: "Electrician",
    location: "Singhiya Chaksale",
    city: "Lalganj",
    distance: "1.8 km away",
    rating: "5.0",
    reviews: 1,
    trust: 94,
    jobs: 22,
    response: "12 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 1.8,
    phone: "7070608650",
    whatsapp: "7070608650"
  },
  {
    id: "2fff6aa8-d6e9-49b0-abce-c5b9edf0cc2b",
    name: "Md samir",
    skill: "Electrician",
    location: "Lalganj vaishali",
    city: "Bihar",
    distance: "2.2 km away",
    rating: "5.0",
    reviews: 2,
    trust: 96,
    jobs: 38,
    response: "11 min",
    status: "Available Today",
    serviceRadius: 15,
    distanceKm: 2.2,
    phone: "+918092501054",
    whatsapp: "+918092501054"
  },
  {
    id: "0c0f30ae-6f40-448d-b8d5-c9ba774330b9",
    name: "Sazzad Sahab",
    skill: "Painter",
    location: "Lalganj Block",
    city: "lalganj",
    distance: "2.5 km away",
    rating: "5.0",
    reviews: 1,
    trust: 93,
    jobs: 20,
    response: "14 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 2.5,
    phone: "9546772928",
    whatsapp: "9546772928"
  },
  {
    id: "a52c2f12-2e0e-4c7a-8cf2-9045f6caeaf7",
    name: "Driver's Service",
    skill: "Driver",
    location: "Pragati nagar, Sipara",
    city: "Patna",
    distance: "36 km away",
    rating: "5.0",
    reviews: 2,
    trust: 92,
    jobs: 42,
    response: "18 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 36,
    phone: "8002905364",
    whatsapp: "8002905364"
  },
  {
    id: "1af51730-8f73-4117-86a8-cefa080d0180",
    name: "Manzar Alam",
    skill: "Driver",
    location: "Ataullah pur",
    city: "Lalganj",
    distance: "3.1 km away",
    rating: "5.0",
    reviews: 4,
    trust: 98,
    jobs: 70,
    response: "9 min",
    status: "Available Today",
    serviceRadius: 15,
    distanceKm: 3.1,
    phone: "9983593695",
    whatsapp: "9983593695"
  },
  {
    id: "28a7c785-736c-4d30-9355-be56f5d07aac",
    name: "Neasar Ahmad",
    skill: "Mechanic",
    location: "hajipur dak bangla road",
    city: "hajipur",
    distance: "24 km away",
    rating: "5.0",
    reviews: 1,
    trust: 91,
    jobs: 18,
    response: "22 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 24,
    phone: "9934403734",
    whatsapp: "9934403734"
  },
  {
    id: "93ba4b38-cf31-4cd1-ad6a-743d42a96fbf",
    name: "Abid Alam",
    skill: "AC Repair",
    location: "Saidpur",
    city: "Hajipur",
    distance: "26 km away",
    rating: "5.0",
    reviews: 2,
    trust: 93,
    jobs: 36,
    response: "20 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 26,
    phone: "89697 03158",
    whatsapp: "89697 03158"
  },
  {
    id: "f430b8ee-63d6-4a08-822c-117127dd3c93",
    name: "Zakir Hussain",
    skill: "Mason / Plaster",
    location: "Saidpur",
    city: "Hajipur",
    distance: "26 km away",
    rating: "5.0",
    reviews: 1,
    trust: 90,
    jobs: 19,
    response: "24 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 26,
    phone: "8092376075",
    whatsapp: "8092376075"
  },
  {
    id: "15d809c4-807b-4988-9afc-90cf8e5487a8",
    name: "Naushad Alam",
    skill: "Electrician",
    location: "Singhiya Chakshala",
    city: "Lalganj",
    distance: "1.9 km away",
    rating: "5.0",
    reviews: 1,
    trust: 94,
    jobs: 21,
    response: "13 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 1.9,
    phone: "9097251309",
    whatsapp: "9097251309"
  },
  {
    id: "709bbd03-2529-4239-81da-10f162ecc32a",
    name: "Ganesh Sharma",
    skill: "Carpenter",
    location: "Ataullahpur",
    city: "Lalganj",
    distance: "3.0 km away",
    rating: "5.0",
    reviews: 1,
    trust: 92,
    jobs: 20,
    response: "16 min",
    status: "Available Today",
    serviceRadius: 10,
    distanceKm: 3,
    phone: "8051226435",
    whatsapp: "8051226435"
  },
  {
    id: "914f4199-9fc0-461f-acab-1f12651f2dc2",
    name: "Sajid Rex",
    skill: "AC Repair",
    location: "Muzafferpur",
    city: "Muzafferpur",
    distance: "42 km away",
    rating: "5.0",
    reviews: 1,
    trust: 89,
    jobs: 18,
    response: "28 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 42,
    phone: "9102125356",
    whatsapp: "9102125356"
  },
  {
    id: "f7f79812-73b8-4c49-9321-a87e0691792d",
    name: "T.M AC Rent Repair",
    skill: "AC Repair",
    location: "Malviya Nagar",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9315988719",
    whatsapp: "9315988719"
  },
  {
    id: "db55e49e-138f-4c7e-aba8-d554e28c9df3",
    name: "Kuldeep Plumber",
    skill: "Plumber",
    location: "Greater Kailash",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9971046928",
    whatsapp: "9971046928"
  },
  {
    id: "f5be4723-d990-4473-b3ae-28b95a852b75",
    name: "kapas hera",
    skill: "Plumber",
    location: "delhi",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9958190834",
    whatsapp: "9958190834"
  },
  {
    id: "ba16e136-78a9-4a2a-9c36-b0c62151bc1c",
    name: "Plumber Wallah",
    skill: "Plumber",
    location: "Jagdeo Path, Khajpura",
    city: "Patna",
    distance: "38 km away",
    rating: "0.0",
    reviews: 0,
    trust: 72,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 38,
    phone: "97980 40975",
    whatsapp: "97980 40975"
  },
  {
    id: "99209bfc-6d3d-4828-bd52-751ea2fa4066",
    name: "awdesh electrician",
    skill: "Electrician",
    location: "sagarpur",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9810723669",
    whatsapp: "9810723669"
  },
  {
    id: "9380032c-3a77-4db1-bc4d-a4c7f7b01583",
    name: "Devender Plumber",
    skill: "Plumber",
    location: "Malviya Nagar",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9313770041",
    whatsapp: "9313770041"
  },
  {
    id: "963bf63c-d3cb-44d5-9264-bb29db1bc0dd",
    name: "Prasad Driver",
    skill: "Driver",
    location: "Exhibition Rd, Golambar",
    city: "Patna",
    distance: "36 km away",
    rating: "0.0",
    reviews: 0,
    trust: 72,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 36,
    phone: "99554 94661",
    whatsapp: "99554 94661"
  },
  {
    id: "eb056cab-7e9c-420b-a440-c30b841019a2",
    name: "Mukesh electrician",
    skill: "Electrician",
    location: "Patel Nagar",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "9891887705",
    whatsapp: "9891887705"
  },
  {
    id: "afbf375b-fac6-47bb-b37a-03b5680b0a11",
    name: "Amit Plumber",
    skill: "Plumber",
    location: "Mandawali",
    city: "Delhi",
    distance: "950 km away",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "30 min",
    status: "Available Today",
    serviceRadius: 20,
    distanceKm: 950,
    phone: "8882991645",
    whatsapp: "8882991645"
  }
];

export const discoveryRules = {
  cityRadius: "10 km",
  townRadius: "15 km",
  workerRadiusOptions: ["5 km", "10 km", "15 km", "20 km"],
  priority: ["Available Today", "Closest distance", "Highest trust score", "Fast response time"]
};

export const topWorkers = workers
  .filter((worker) => worker.trust >= 92)
  .slice(0, 4)
  .map((worker) => ({
    name: worker.name,
    skill: worker.skill,
    rating: worker.rating,
    reviews: worker.reviews,
    trust: worker.trust
  }));

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
