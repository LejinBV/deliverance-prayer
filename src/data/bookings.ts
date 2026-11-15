// Book Now items. The live list is bookings.json in the deliverance-prayer-content GitHub repo;
// this built-in copy is only used until it downloads (or when offline on first launch).
// A link left empty shows "Coming soon" instead of opening.

// Icons you can use in bookings.json ("icon": "...")
export const BOOKING_ICONS = ['mass', 'retreat', 'schedule', 'calendar', 'phone', 'whatsapp', 'email', 'location', 'link'] as const;
export type BookingIcon = (typeof BOOKING_ICONS)[number];

export type Booking = { id: string; title: string; icon: BookingIcon; url: string };

// The Book Now tab stays hidden until bookings.json says "showTab": true
export const SHOW_BOOK_TAB_DEFAULT = false;

export const BOOKINGS: Booking[] = [
  { id: 'gregorian-mass', title: 'Book the Gregorian Mass', icon: 'mass', url: '' },
  { id: 'retreat', title: 'Book the Retreat', icon: 'retreat', url: '' },
  { id: 'jsrc-schedules', title: 'JSRC Schedules', icon: 'schedule', url: '' },
];
