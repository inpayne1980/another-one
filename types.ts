
export type LinkType = 'standard' | 'shop' | 'tip' | 'newsletter';

export interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  type: LinkType;
  price?: string;
  isFeatured?: boolean;
  isHeroVideo?: boolean;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  isPro: boolean;
  backgroundType: 'theme' | 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundBlur?: number;
  backgroundOpacity?: number;
  backgroundGrayscale?: boolean;
  backgroundParallax?: boolean; // New: Toggle for the motion parallax effect
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
    facebook?: string;
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
    id: 'neon-night',
    name: 'Neon Night',
    background: 'bg-black',
    buttonColor: 'bg-transparent border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
    buttonTextColor: 'text-fuchsia-500',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-xl',
    secondaryColor: 'text-fuchsia-300'
  },
  {
    id: 'pastel-garden',
    name: 'Pastel Garden',
    background: 'bg-gradient-to-tr from-emerald-100 to-teal-200',
    buttonColor: 'bg-white shadow-sm',
    buttonTextColor: 'text-emerald-800',
    textColor: 'text-emerald-900',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-3xl',
    secondaryColor: 'text-emerald-600'
  }
];
