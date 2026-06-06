type NominatimAddress = {
  neighbourhood?: string;
  suburb?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  district?: string;
  county?: string;
  state?: string;
};

type NominatimResponse = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: NominatimAddress;
};

export type LocationSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
};

function labelFromAddress(item: NominatimResponse) {
  const address = item.address;
  if (!address) return item.display_name?.split(",").slice(0, 3).join(", ").trim() || "";

  const area = address.neighbourhood || address.suburb || address.hamlet || address.village || address.town || address.city;
  const district = address.district || address.county;
  return [area, district, address.state].filter(Boolean).join(", ");
}

export async function resolveAreaName(latitude: number, longitude: number) {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "14",
      addressdetails: "1"
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    if (!response.ok) return "Current location saved";

    const data = (await response.json()) as NominatimResponse;
    const address = data.address;
    if (!address) return "Current location saved";

    const area = address.neighbourhood || address.suburb || address.village || address.town || address.city || address.county;
    const state = address.state;

    return [area, state].filter(Boolean).join(", ") || "Current location saved";
  } catch {
    return "Current location saved";
  }
}

export async function searchAreaSuggestions(query: string) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      q: cleanQuery,
      countrycodes: "in",
      addressdetails: "1",
      limit: "7"
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    if (!response.ok) return [];

    const data = (await response.json()) as NominatimResponse[];
    const seen = new Set<string>();
    return data.reduce<LocationSuggestion[]>((suggestions, item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      const label = labelFromAddress(item);
      if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude) || seen.has(label)) return suggestions;
      seen.add(label);
      suggestions.push({ label, latitude, longitude });
      return suggestions;
    }, []);
  } catch {
    return [];
  }
}
