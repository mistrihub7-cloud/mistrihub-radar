type NominatimAddress = {
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
};

type NominatimResponse = {
  address?: NominatimAddress;
};

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
