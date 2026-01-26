
export type LinkType = 'standard' | 'shop' | 'tip' | 'newsletter' | 'video';

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
  isNSFW?: boolean;
  thumbnailUrl?: string;
  viralDescription?: string;
}

export interface ClipSuggestion {
  id: string;
  start: number;
  end: number;
  caption: string;
  viralTitle: string;
  viralDescription: string;
  reasoning: string;
}

export interface PlatformStatus {
  name: 'tiktok' | 'instagram' | 'youtube_shorts' | 'twitter' | 'threads';
  status: 'draft' | 'scheduled' | 'published';
  publishedAt?: string;
}

export interface PromoData {
  id: string;
  youtubeUrl: string;
  videoId: string;
  clipStart: number;
  clipEnd: number;
  caption: string;
  viralTitle: string;
  viralDescription: string;
  thumbnailUrl?: string;
  targetUrl: string;
  platforms: PlatformStatus[];
  status: 'published' | 'draft' | 'publishing';
  createdAt: string;
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
  backgroundParallax?: boolean;
  socialsDisplay: 'icons' | 'buttons';
  socialsPosition: 'top' | 'bottom';
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
  inputBg: string;
  cardStyle: 'solid' | 'glass' | 'outline';
}

export const THEMES: Theme[] = [
  {
    id: 'glass-dark',
    name: 'Midnight Glass',
    background: 'bg-zinc-950',
    buttonColor: 'bg-white/10 backdrop-blur-xl border border-white/20',
    buttonTextColor: 'text-white',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-[1.5rem]',
    secondaryColor: 'text-zinc-400',
    inputBg: 'bg-white/5 text-white',
    cardStyle: 'glass'
  },
  {
    id: 'premium-gold',
    name: 'Executive',
    background: 'bg-slate-900',
    buttonColor: 'bg-[#EAB308]',
    buttonTextColor: 'text-slate-950',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-none',
    secondaryColor: 'text-amber-200/60',
    inputBg: 'bg-slate-800 text-white',
    cardStyle: 'solid'
  },
  {
    id: 'minimal-white',
    name: 'Pure Canvas',
    background: 'bg-white',
    buttonColor: 'bg-white border-2 border-slate-200 shadow-sm',
    buttonTextColor: 'text-slate-900',
    textColor: 'text-slate-950',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-2xl',
    secondaryColor: 'text-slate-500',
    inputBg: 'bg-slate-50 text-slate-900',
    cardStyle: 'outline'
  },
  {
    id: 'neon-vibe',
    name: 'Cyberpunk',
    background: 'bg-[#050505]',
    buttonColor: 'bg-transparent border-2 border-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    buttonTextColor: 'text-[#22d3ee]',
    textColor: 'text-white',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-full',
    secondaryColor: 'text-cyan-200/50',
    inputBg: 'bg-cyan-950/20 text-white',
    cardStyle: 'outline'
  },
  {
    id: 'soft-pastel',
    name: 'Cotton Candy',
    background: 'bg-gradient-to-br from-pink-50 to-indigo-50',
    buttonColor: 'bg-white/80 backdrop-blur-sm border border-white shadow-md',
    buttonTextColor: 'text-indigo-900',
    textColor: 'text-indigo-950',
    fontFamily: 'font-sans',
    buttonRadius: 'rounded-[2rem]',
    secondaryColor: 'text-indigo-400',
    inputBg: 'bg-white text-indigo-900',
    cardStyle: 'glass'
  }
];
