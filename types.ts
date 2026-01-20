
export type LinkType = 'standard' | 'shop' | 'tip' | 'newsletter';

export interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  type: LinkType;
  price?: string; // For Shop
  isFeatured?: boolean; // Pulse effect
  scheduleStart?: string;
  scheduleEnd?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  isPro: boolean;
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  fontFamily: string;
  buttonRadius: string;
  secondaryColor: string;
}

export const THEMES: Theme[] = [
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    background: 'bg-zinc-900',
    buttonColor: 'bg-white',
    buttonTextColor: 'text-zinc-900',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-full',
    secondaryColor: 'text-zinc-400'
  },
  {
    id: 'soft-ocean',
    name: 'Soft Ocean',
    background: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    buttonColor: 'bg-white/20',
    buttonTextColor: 'text-white',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-lg',
    secondaryColor: 'text-blue-100'
  },
  {
    id: 'minimal-white',
    name: 'Minimalist',
    background: 'bg-white',
    buttonColor: 'bg-zinc-800',
    buttonTextColor: 'text-white',
    textColor: 'text-zinc-800',
    fontFamily: 'font-mono',
    buttonRadius: 'rounded-none',
    secondaryColor: 'text-gray-400'
  },
  {
    id: 'sunset-dream',
    name: 'Sunset Dream',
    background: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500',
    buttonColor: 'bg-white/90',
    buttonTextColor: 'text-pink-600',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-2xl',
    secondaryColor: 'text-white/80'
  }
];
