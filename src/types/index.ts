export type SeatType = 'standard' | 'vip' | 'economy' | 'aisle' | 'blocked';

export type SeatStatus = 'available' | 'sold';

export interface BookedInfo {
  buyerName: string;
  buyerPhone: string;
  bookingId: string;
  bookedAt: string;
}

export interface Seat {
  id: string; // e.g. "r1-c4"
  row: number; // 1-based index
  col: number; // 1-based index
  rowLabel: string; // "A", "B", "C" etc.
  seatNumber: number; // progressive seat number in row (excluding aisles)
  type: SeatType;
  price: number; // in Tomans
  status: SeatStatus;
  bookedBy?: BookedInfo;
}

export interface SeatMap {
  rows: number;
  cols: number;
  seats: Seat[];
  vipPrice: number;
  standardPrice: number;
  economyPrice: number;
}

export interface Screening {
  id: string;
  titleFa: string;
  titleEn: string;
  tagline: string;
  genre: string;
  city: string; // "تهران" | "شیراز" | "اصفهان" | "مشهد" | "تبریز"
  venueName: string;
  venueAddress: string;
  date: string;
  time: string;
  duration: string;
  ageRating: string;
  language: string;
  posterUrl: string;
  bannerUrl: string;
  synopsis: string;
  featured: boolean;
  seatMap: SeatMap;
  createdAt: string;
}

export interface BookingSeatDetail {
  seatId: string;
  rowLabel: string;
  seatNumber: number;
  type: SeatType;
  price: number;
}

export interface Booking {
  id: string; // e.g. "ORB-739102"
  screeningId: string;
  movieTitleFa: string;
  movieTitleEn: string;
  city: string;
  venueName: string;
  venueAddress: string;
  date: string;
  time: string;
  buyerName: string;
  buyerPhone: string;
  seatIds: string[];
  seatDetails: BookingSeatDetail[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  paymentRef: string;
}

export interface VenueTemplate {
  id: string;
  name: string;
  rows: number;
  cols: number;
  vipPrice: number;
  standardPrice: number;
  economyPrice: number;
  seats: Array<{
    id: string;
    row: number;
    col: number;
    rowLabel: string;
    seatNumber: number;
    type: SeatType;
    price: number;
  }>;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface SiteSettings {
  logoUrl?: string;
  brandName: string;
  brandSubtitle: string;
  brandTagline: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutVision?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactInstagram?: string;
  contactTelegram?: string;
}

export interface SupportTicket {
  id: string; // e.g. "TCK-849102"
  name: string;
  phone: string;
  ticketId?: string; // اختیاری: آیدی بلیت خریده شده
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface DatabaseSchema {
  screenings: Screening[];
  bookings: Booking[];
  venueTemplates: VenueTemplate[];
  admins: AdminUser[];
  settings: SiteSettings;
  tickets?: SupportTicket[];
}
