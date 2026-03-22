import { defineStore } from "pinia";

export interface Booking {
  id: string;
  location_id: string;
  location_name: string;
  date_from: string;
  date_to: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  total_price: number;
  guests: number;
  created_at: string;
}

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

function loadBookings(): Booking[] {
  if (import.meta.server) return [];
  try {
    const raw = localStorage.getItem("dk_bookings");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]) {
  if (import.meta.server) return;
  localStorage.setItem("dk_bookings", JSON.stringify(bookings));
}

export const useBookingsStore = defineStore("bookings", {
  state: (): BookingsState => ({
    bookings: [],
    loading: false,
    error: null,
  }),

  actions: {
    fetchBookings() {
      this.bookings = loadBookings();
    },

    createBooking(params: {
      location_id: string;
      location_name: string;
      date_from: string;
      date_to: string;
      price_per_night: number;
      guests: number;
    }) {
      const from = new Date(params.date_from);
      const to = new Date(params.date_to);
      const nights = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));

      const booking: Booking = {
        id: generateId(),
        location_id: params.location_id,
        location_name: params.location_name,
        date_from: params.date_from,
        date_to: params.date_to,
        status: "pending",
        total_price: params.price_per_night * nights,
        guests: params.guests,
        created_at: new Date().toISOString(),
      };

      this.bookings.unshift(booking);
      saveBookings(this.bookings);

      // Simulate host confirmation after 3 seconds
      setTimeout(() => {
        const idx = this.bookings.findIndex((b) => b.id === booking.id);
        if (idx !== -1 && this.bookings[idx]!.status === "pending") {
          this.bookings[idx]!.status = "confirmed";
          saveBookings(this.bookings);
        }
      }, 3000);

      return booking;
    },

    cancelBooking(id: string) {
      const idx = this.bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        this.bookings[idx]!.status = "cancelled";
        saveBookings(this.bookings);
      }
    },

    getBookingsForLocation(locationId: string): Booking[] {
      return this.bookings.filter((b) => b.location_id === locationId);
    },
  },
});
