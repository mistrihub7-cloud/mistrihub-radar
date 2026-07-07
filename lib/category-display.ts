export function categoryNameParts(name?: string | null) {
  return professionalCategoryName(name)
    .split(/\s*\/\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function cleanCategoryName(name?: string | null) {
  return categoryNameParts(name).join(" ");
}

export function professionalCategoryName(name?: string | null) {
  const cleanName = (name || "Professional").trim();
  const map: Record<string, string> = {
    Worker: "Professional",
    Workers: "Professionals",
    Electrician: "Electrical Expert",
    Plumber: "Plumbing Expert",
    Mechanic: "Auto Mechanic",
    Painter: "Painting Professional",
    "AC Repair": "AC Service Technician",
    "AC Service Expert": "AC Service Technician",
    "A/C Service Technician": "AC Service Technician",
    Carpenter: "Woodwork Expert",
    Labour: "Skilled Professional",
    Helper: "Support Assistant",
    "Labour / Helper": "Support Assistant",
    "Labour Helper": "Support Assistant",
    "Home Cleaning": "Home Cleaning Expert",
    Driver: "Driver & Car Service",
    "Driver / Car Booking": "Driver & Car Service",
    "Driver Car Booking": "Driver & Car Service",
    Mason: "Construction Mason",
    Welder: "Welding Expert",
    "RO Service": "RO Water Technician",
    CCTV: "CCTV Security Technician",
    "CCTV Security Expert": "CCTV Security Technician",
    "Tile / Marble": "Tile & Marble Expert",
    "Tile Marble": "Tile & Marble Expert"
  };
  return map[cleanName] || cleanName;
}
