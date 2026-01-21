interface Location {
  lng: number;
  lat: number;
  address?: string;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

interface MapboxResponse {
  features: SearchResult[];
}

class LocationService {
  private accessToken: string;
  private baseURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor() {
    this.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Tìm kiếm địa điểm theo query
   */
  async searchPlaces(query: string, options?: {
    language?: string;
    limit?: number;
    proximity?: string;
  }): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const {
      language = 'vi',
      limit = 5,
      proximity = '106.7,10.776' // Default: HCM City
    } = options || {};

    try {
      const response = await fetch(
        `${this.baseURL}/${encodeURIComponent(query)}.json?` +
        `access_token=${this.accessToken}&` +
        `language=${language}&` +
        `limit=${limit}&` +
        `proximity=${proximity}`
      );

      if (!response.ok) {
        throw new Error('Failed to search places');
      }

      const data: MapboxResponse = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Reverse geocoding - Lấy địa chỉ từ tọa độ
   */
  async reverseGeocode(lng: number, lat: number, language = 'vi'): Promise<Location> {
    try {
      const response = await fetch(
        `${this.baseURL}/${lng},${lat}.json?` +
        `access_token=${this.accessToken}&` +
        `language=${language}`
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      const data: MapboxResponse = await response.json();
      const address = data.features[0]?.place_name || '';

      return { lng, lat, address };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return { lng, lat };
    }
  }

  /**
   * Lấy thông tin chi tiết địa điểm
   */
  async getPlaceDetails(placeId: string): Promise<SearchResult | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/${placeId}.json?` +
        `access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to get place details');
      }

      const data: MapboxResponse = await response.json();
      return data.features[0] || null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
export type { Location, SearchResult };
