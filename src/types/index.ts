interface ITrip {
    uid: string;
    owner_id: string;
    title?: string ;
    description?: string ;
    start_date?: string;
    end_date?: string;
    visibility?: 'Public' | 'Private';
    invite_token?: string ;
}

interface IActivity {
    uid: string;
    trip_id: string;
    title: string;
    description?: string;
    date: string;
    start_time?: string;
    end_time?: string;
    category: number;
    location?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    cost?: number;
    currency?: string;
    assigned_to?: string;
    status?: number;
    notes?: string;
}

enum ActivityCategory {
    Accommodation = 'Accommodation', // Lưu trú
    Transportation = 'Transportation',   // Vận chuyển
    Food = 'Food', // Ẩm thực
    Activity = 'Activity', // Hoạt động
    Shopping = 'Shopping', // Mua sắm
    Other = 'Other'
}