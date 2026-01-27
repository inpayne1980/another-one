
import React, { useState } from 'react';
import { UserProfile, Link, THEMES, PromoData } from '../types';

interface PreviewFrameProps {
  profile: UserProfile;
  links: Link[];
  promos?: PromoData[]; // Made promos an explicit prop for synchronization
}

const getFaviconUrl = (url: string) => {
  try {
    if (!url || typeof url !== 'string' || url === 'https://' || url === 'http://') return null;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname;
    if (!domain || domain.length < 4) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
};

const extractYouTubeId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\\w\/|embed\/|watch\\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
};

const getPlatformFavicon = (platform: string) => {
  const domainMap: Record<string, string> = {
    twitter: 'x.com',
    instagram: 'instagram.com',
    youtube: 'youtube.com',
    linkedin: 'linkedin.com',
    tiktok: 'tiktok.com',
    facebook: 'facebook.com'
  };
  return `https://www.google.com/s2/favicons?domain=${domainMap[platform] || platform + '.com'}&sz=128`;
};

const PreviewFrame: React.FC<PreviewFrameProps> = ({ profile, links = [], promos = [] }) => {
  const theme = THEMES.find(t => t.id === profile?.themeId) || THEMES[0];
  const [copied, setCopied] = useState(false);
  
  // Use passed promos prop, fallback to localStorage ONLY if not provided
  // Fixed: Changed Array.isArray(safePromos) to Array.isArray(promos) to avoid using the variable before declaration.
  const safePromos = Array.isArray(promos) && promos.length > 0 
    ? promos 
    : (() => {
        try {
          const stored = localStorage.getItem('lp_promos');
          return stored ? JSON.parse(stored) : [];
        } catch { return []; }
      })();

  const activeHeroLinks = links.filter(l => l && l.active && l.isHeroVideo);
  const activeLinks = links.filter(l => l && l.active && !l.isHeroVideo);

  const bgStyle: React.CSSProperties = profile?.backgroundType === 'color' 
    ? { backgroundColor: profile.backgroundColor } 
    : profile?.backgroundType === 'image' 
    ? { 
        backgroundImage: `url(${profile.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        filter: `${profile.backgroundGrayscale ? 'grayscale(1)' : ''} blur(${profile.backgroundBlur || 0}px)`,
        height: '100%',
      } 
    : {};

  const handleShare = () => {
    const url = `${window.location.origin}/#/p/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SocialHub = () => {
    if (!profile?.socials) return null;
    const activeSocials = Object.entries(profile.socials).filter(([_, h]) => typeof h === 'string' && h.trim() !== '');
    if (activeSocials.length === 0) return null;

    if (profile.socialsDisplay === 'buttons') {
      return (
        <div className="w-full space-y-2 mb-4">
          {activeSocials.map(([platform]) => (
            <div key={platform} className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-between gap-3 text-[10px] font-black shadow-lg border border-white/10 ${theme.buttonColor} ${theme.buttonTextColor}`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center p-1">
                  <img src={getPlatformFavicon(platform)} className="w-full h-full object-contain" alt="" />
                </div>
                <span className="capitalize">{platform}</span>
              </div>
              <i className="fa-solid fa-arrow-right opacity-30 text-[8px]"></i>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {activeSocials.map(([platform]) => (
          <div key={platform} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2.5 shadow-lg">
            <img src={getPlatformFavicon(platform)} alt={platform} className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="sticky top-10 flex flex-col items-center">
      <div className="relative border-slate-900 bg-slate-900 border-[10px] rounded-[3rem] h-[640px] w-[300px] shadow-2xl overflow-hidden ring-4 ring-slate-100/50 group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-40"></div>
        
        {/* Share Button Overlay */}
        <button 
          onClick={handleShare}
          className="absolute top-8 right-6 z-[60] w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl hover:bg-white hover:text-indigo-600 transition-all active:scale-95 group/share"
        >
          <i className={`fa-solid ${copied ? 'fa-check' : 'fa-arrow-up-from-bracket'} text-sm`}></i>
          {copied && (
            <div className="absolute top-12 right-0 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
              Link Copied!
            </div>
          )}
        </button>

        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
          <div className={`absolute inset-0 transition-all duration-700 ${profile?.backgroundType === 'theme' ? theme.background : ''}`} style={bgStyle} />
          {profile?.backgroundType === 'image' && (
            <div className="absolute inset-0 pointer-events-none z-[1] bg-black/30" style={{ opacity: profile.backgroundOpacity || 0.3 }} />
          )}

          <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar p-6 text-center flex flex-col items-center">
            <div className="mt-10 mb-4">
              <img 
                src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
                className="w-20 h-20 rounded-[1.8rem] border-2 border-white/30 object-cover shadow-2xl"
                alt=""
              />
            </div>
            
            <h2 className={`font-black text-base mb-1 tracking-tight ${theme.textColor}`}>
              {profile?.displayName || `@${profile?.username || 'user'}`}
            </h2>
            <p className={`text-[10px] opacity-80 mb-6 font-bold leading-tight max-w-[180px] ${theme.textColor}`}>
              {profile?.bio}
            </p>

            {profile?.socialsPosition === 'top' && <SocialHub />}

            {activeHeroLinks.length > 0 && (
              <div className="w-full space-y-4 mb-6">
                {activeHeroLinks.map(link => {
                  const promo = Array.isArray(safePromos) ? safePromos.find(p => p && p.id === link.id) : null;
                  const ytId = extractYouTubeId(link.url);
                  if (!ytId && !promo) return null;
                  const vId = promo ? promo.videoId : ytId;

                  return (
                    <div key={link.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-white/10 relative transition-all animate-in slide-in-from-bottom-2">
                      <div className="aspect-video relative bg-zinc-900">
                        <img src={`https://img.youtube.com/vi/${vId}/hqdefault.jpg`} className={`absolute inset-0 w-full h-full object-cover ${link.isNSFW ? 'blur-xl opacity-20 scale-110' : 'opacity-40'}`} alt="" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                             <i className={`fa-solid ${link.isNSFW ? 'fa-eye-slash' : 'fa-play'} text-white text-[10px]`}></i>
                           </div>
                           {link.isNSFW && (
                             <span className="text-[7px] font-black text-white/60 tracking-widest uppercase">NSFW PROTECTED</span>
                           )}
                        </div>
                      </div>
                      <div className="p-3 text-center bg-white">
                         <p className="text-[9px] font-black text-slate-900 truncate leading-none mb-1">
                           {promo ? (promo.viralTitle || promo.caption) : link.title}
                         </p>
                         <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Featured Content</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="w-full space-y-3">
              {activeLinks.map(link => {
                const favicon = getFaviconUrl(link.url);
                return (
                  <div 
                    key={link.id} 
                    className={`relative w-full py-3.5 px-4 ${theme.buttonRadius} flex items-center justify-between text-[11px] font-black shadow-lg border border-white/10 ${theme.buttonColor} ${theme.buttonTextColor} ${link.isFeatured ? 'ring-2 ring-white/40' : ''}`}
                  >
                    <div className={`flex items-center gap-3 truncate ${link.isNSFW ? 'blur-[2px] opacity-50' : ''}`}>
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 p-1 shadow-sm">
                        {favicon ? (
                          <img src={favicon} className="w-full h-full object-contain" alt="" />
                        ) : (
                          <i className={`fa-solid ${link.type === 'shop' ? 'fa-bag-shopping' : link.type === 'video' ? 'fa-play' : 'fa-link'} text-slate-300`}></i>
                        )}
                      </div>
                      <span className="truncate">{link.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {link.isNSFW && <i className="fa-solid fa-eye-slash text-red-400 text-[10px]"></i>}
                      {link.price && <span className="text-[9px] bg-black/10 px-2 py-0.5 rounded-md">{link.price}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {profile?.socialsPosition === 'bottom' && <SocialHub />}

            <div className={`mt-auto pt-10 text-[9px] font-black tracking-[0.2em] opacity-30 ${theme.textColor}`}>VENDO.BIO PRO</div>
          </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PreviewFrame;
