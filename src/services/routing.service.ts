interface RoutePoint {
  longitude: number;
  latitude: number;
}

interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: number[][];
      type: string;
    };
    duration: number; // seconds
    distance: number; // meters
    legs: Array<{
      duration: number;
      distance: number;
      steps: Array<{
        duration: number;
        distance: number;
        geometry: {
          coordinates: number[][];
          type: string;
        };
        name: string;
        maneuver: {
          type: string;
          instruction: string;
          location: number[];
        };
      }>;
    }>;
  }>;
  waypoints: Array<{
    name: string;
    location: number[];
  }>;
}

interface RouteOptions {
  profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  language?: string;
  geometries?: 'geojson' | 'polyline' | 'polyline6';
  overview?: 'full' | 'simplified' | 'false';
  steps?: boolean;
  alternatives?: boolean;
}

class RoutingService {
  private accessToken: string;
  private baseURL = 'https://api.mapbox.com/directions/v5/mapbox';

  constructor() {
    this.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Tính toán route giữa nhiều điểm
   */
  async getRoute(
    points: RoutePoint[],
    options?: RouteOptions
  ): Promise<RouteResponse | null> {
    if (points.length < 2) {
      console.error('Need at least 2 points for routing');
      return null;
    }

    const {
      profile = 'driving',
      language = 'vi',
      geometries = 'geojson',
      overview = 'full',
      steps = true,
      alternatives = false,
    } = options || {};

    // Format coordinates: "lng,lat;lng,lat;..."
    const coordinates = points
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(';');

    try {
      const response = await fetch(
        `${this.baseURL}/${profile}/${coordinates}?` +
        `access_token=${this.accessToken}&` +
        `geometries=${geometries}&` +
        `overview=${overview}&` +
        `steps=${steps}&` +
        `language=${language}&` +
        `alternatives=${alternatives}`
      );

      if (!response.ok) {
        throw new Error('Failed to get route');
      }

      const data: RouteResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  /**
   * Tính toán route từ danh sách activities (đã sắp xếp theo thời gian)
   */
  async getRouteFromActivities(
    activities: IActivity[],
    options?: RouteOptions
  ): Promise<RouteResponse | null> {
    // Lọc activities có tọa độ hợp lệ
    const validActivities = activities.filter(
      (act) =>
        act.latitude != null &&
        act.longitude != null &&
        !isNaN(act.latitude) &&
        !isNaN(act.longitude)
    );

    if (validActivities.length < 2) {
      console.error('Need at least 2 activities with valid coordinates');
      return null;
    }

    // Sắp xếp theo start_time
    const sortedActivities = [...validActivities].sort((a, b) => {
      const timeA = a.start_time || '00:00';
      const timeB = b.start_time || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Chuyển đổi thành RoutePoint
    const points: RoutePoint[] = sortedActivities.map((act) => ({
      longitude: act.longitude!,
      latitude: act.latitude!,
    }));

    return this.getRoute(points, options);
  }

  /**
   * Tính khoảng cách và thời gian di chuyển giữa 2 điểm
   */
  async getDistanceAndDuration(
    from: RoutePoint,
    to: RoutePoint,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{ distance: number; duration: number } | null> {
    const route = await this.getRoute([from, to], {
      profile,
      steps: false,
      overview: 'simplified',
    });

    if (!route || !route.routes || route.routes.length === 0) {
      return null;
    }

    return {
      distance: route.routes[0].distance,
      duration: route.routes[0].duration,
    };
  }

  /**
   * Format duration từ seconds sang readable string
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format distance từ meters sang readable string
   */
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  }
}

export const routingService = new RoutingService();
export type { RoutePoint, RouteResponse, RouteOptions };
