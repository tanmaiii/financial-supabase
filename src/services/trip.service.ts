import axiosInstance from './axios.config';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateTripDto {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
}

type UpdateTripDto = Partial<CreateTripDto>;

class TripService {
  private endpoint = '/trips';

  /**
   * Lấy danh sách trips
   */
  async getTrips(): Promise<Trip[]> {
    return axiosInstance.get(this.endpoint);
  }

  /**
   * Lấy chi tiết trip
   */
  async getTripById(id: string): Promise<Trip> {
    return axiosInstance.get(`${this.endpoint}/${id}`);
  }

  /**
   * Tạo trip mới
   */
  async createTrip(data: CreateTripDto): Promise<Trip> {
    return axiosInstance.post(this.endpoint, data);
  }

  /**
   * Cập nhật trip
   */
  async updateTrip(id: string, data: UpdateTripDto): Promise<Trip> {
    return axiosInstance.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Xóa trip
   */
  async deleteTrip(id: string): Promise<void> {
    return axiosInstance.delete(`${this.endpoint}/${id}`);
  }
}

export const tripService = new TripService();
export type { Trip, CreateTripDto, UpdateTripDto };
