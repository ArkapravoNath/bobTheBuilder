/** Single source of truth for inline StyleSheet colours. */
export const C = {
  // Backgrounds
  bg:         '#F5F2EC',
  surface:    '#FFFFFF',
  raised:     '#FDFCF9',
  border:     '#E5E0D8',

  // Text
  ink:        '#1C1917',
  inkAlt:     '#2A2825',
  secondary:  '#4A4744',
  muted:      '#8A857C',
  placeholder:'#C4C0BA',

  // Primary CTA — dark charcoal (matches references)
  cta:        '#1C1917',
  ctaPress:   '#2A2825',
  ctaText:    '#FFFFFF',

  // Teak accent (links, selected borders, key highlights)
  teak:       '#A06A3A',
  teakDark:   '#6B4226',
  teakLight:  '#F5E8D4',
  teakBorder: '#D4AA7E',

  // Status
  success:    '#2D7A4F',
  error:      '#C0392B',
  warning:    '#D97706',

  // Room fills (warm, editorial)
  roomLiving:  { fill: '#F5EDD8', stroke: '#C4A882' },
  roomBedroom: { fill: '#EDE8E0', stroke: '#A89880' },
  roomKitchen: { fill: '#FDF0DC', stroke: '#C8A85A' },
  roomBath:    { fill: '#EAF0EA', stroke: '#8CAE8C' },
  roomDining:  { fill: '#F8EEE2', stroke: '#B89A6A' },
  roomUtility: { fill: '#EBEBEA', stroke: '#9A9490' },
  roomGarage:  { fill: '#E8E6E4', stroke: '#8A8480' },
  roomBalcony: { fill: '#E8F0E8', stroke: '#7A9E8A' },
  roomCustom:  { fill: '#F0EAE4', stroke: '#A08878' },
} as const;
