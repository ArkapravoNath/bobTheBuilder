import type { RoomType } from '@bob/shared-schemas';

/** Warm editorial palette — matches reference images (no blue). */
export const ROOM_PALETTE: Record<RoomType, { fill: string; stroke: string; label: string; icon: string }> = {
  living:   { fill: '#F5EDD8', stroke: '#C4A882', label: 'Living Room',   icon: '🛋️' },
  bedroom:  { fill: '#EDE8E0', stroke: '#A89880', label: 'Bedroom',       icon: '🛏️' },
  kitchen:  { fill: '#FDF0DC', stroke: '#C8A85A', label: 'Kitchen',       icon: '🍳' },
  bathroom: { fill: '#EAF0EA', stroke: '#8CAE8C', label: 'Bathroom',      icon: '🚿' },
  dining:   { fill: '#F8EEE2', stroke: '#B89A6A', label: 'Dining Room',   icon: '🍽️' },
  utility:  { fill: '#EBEBEA', stroke: '#9A9490', label: 'Utility',       icon: '🔧' },
  garage:   { fill: '#E8E6E4', stroke: '#8A8480', label: 'Garage',        icon: '🚗' },
  balcony:  { fill: '#E8F0E8', stroke: '#7A9E8A', label: 'Balcony',       icon: '🌿' },
  custom:   { fill: '#F0EAE4', stroke: '#A08878', label: 'Custom Room',   icon: '✏️' },
};

export const HANDLE_SIZE = 10; // resize handle size in canvas units
export const MIN_ROOM_W  = 60; // minimum room width in canvas units (5 ft)
export const MIN_ROOM_H  = 60; // minimum room height in canvas units (5 ft)
