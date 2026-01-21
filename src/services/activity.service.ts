import axiosInstance from './axios.config';

interface Activity {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  location?: {
    lng: number;
    lat: number;
    address?: string;
  };
  startTime?: string;
  endTime?: string;
  category?: string;
  status?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateActivityDto {
  tripId: string;
  title: string;
  description?: string;
  location?: {
    lng: number;
    lat: number;
    address?: string;
  };
  startTime?: string;
  endTime?: string;
  category?: string;
  status?: string;
  order?: number;
}

type UpdateActivityDto = Partial<Omit<CreateActivityDto, 'tripId'>>;

class ActivityService {
  private endpoint = '/activities';

  /**
   * Lấy danh sách activities theo trip
   */
  async getActivitiesByTrip(tripId: string): Promise<Activity[]> {
    return axiosInstance.get(`${this.endpoint}/trip/${tripId}`);
  }

  /**
   * Lấy chi tiết activity
   */
  async getActivityById(id: string): Promise<Activity> {
    return axiosInstance.get(`${this.endpoint}/${id}`);
  }

  /**
   * Tạo activity mới
   */
  async createActivity(data: CreateActivityDto): Promise<Activity> {
    return axiosInstance.post(this.endpoint, data);
  }

  /**
   * Cập nhật activity
   */
  async updateActivity(id: string, data: UpdateActivityDto): Promise<Activity> {
    return axiosInstance.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Xóa activity
   */
  async deleteActivity(id: string): Promise<void> {
    return axiosInstance.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Cập nhật thứ tự các activities
   */
  async reorderActivities(tripId: string, activityIds: string[]): Promise<void> {
    return axiosInstance.put(`${this.endpoint}/trip/${tripId}/reorder`, {
      activityIds,
    });
  }

  /**
   * Cập nhật status của activity
   */
  async updateActivityStatus(id: string, status: string): Promise<Activity> {
    return axiosInstance.patch(`${this.endpoint}/${id}/status`, { status });
  }
}

export const activityService = new ActivityService();
export type { Activity, CreateActivityDto, UpdateActivityDto };
