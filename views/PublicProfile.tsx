
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile, Link, THEMES, PromoData } from '../types';

const getFaviconUrl = (url: string) => {
  try {
    if (!url || url === 'https://' || url === 'http://') return null;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname;
    if (!domain || domain.length < 4) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
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

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('lp_profile');
    const savedLinks = localStorage.getItem('lp_links');
    const savedPromos = localStorage.getItem('lp_promos');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedLinks) setLinks(JSON.parse(savedLinks).filter((l: Link) => l.active));
    if (savedPromos) setPromos(JSON.parse(savedPromos));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [username]);

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  const theme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

  const SocialHub = () => {
    const activeSocials = Object.entries(profile.socials).filter(([_, h]) => typeof h === 'string' && h.trim() !== '');
    if (activeSocials.length === 0) return null;

    if (profile.socialsDisplay === 'buttons') {
      return (
        <div className="w-full max-w-[480px] space-y-3 mb-12 px-4">
          {activeSocials.map(([platform, handle]) => (
            <a 
              key={platform}
              href={`https://${platform === 'twitter' ? 'x' : platform}.com/${handle}`}
              target="_blank" rel="noopener noreferrer"
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 border border-white/10 ${theme.buttonColor} ${theme.buttonTextColor}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner p-2">
                  <img src={getPlatformFavicon(platform)} alt={platform} className="w-full h-full object-contain" />
                </div>
                <span className="capitalize text-lg">{platform === 'twitter' ? 'X' : platform}</span>
              </div>
              <i className="fa-solid fa-arrow-right text-sm opacity-30"></i>
            </a>
          ))}
        </div>
      );
    }

    return (
      <div className={`flex flex-wrap justify-center gap-6 mb-12 px-4 ${profile.socialsPosition === 'bottom' ? 'mt-16' : ''}`}>
        {activeSocials.map(([platform, handle]) => (
          <a 
            key={platform} 
            href={`https://${platform === 'twitter' ? 'x' : platform}.com/${handle}`}
            target="_blank" rel="noopener noreferrer"
            className={`${theme.textColor} transition-all transform hover:scale-110 flex flex-col items-center gap-2 group`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all overflow-hidden p-3">
              <img 
                src={getPlatformFavicon(platform)} 
                alt={platform} 
                className="w-full h-full object-contain drop-shadow-md" 
              />
            </div>
          </a>
        ))}
      </div>
    );
  };

  const bgStyle: React.CSSProperties = profile.backgroundType === 'color' 
    ? { backgroundColor: profile.backgroundColor } 
    : profile.backgroundType === 'image' 
    ? { 
        backgroundImage: `url(${profile.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        filter: `${profile.backgroundGrayscale ? 'grayscale(1)' : ''} blur(${profile.backgroundBlur || 0}px)`,
      } 
    : {};

  return (
    <div className={`min-h-screen w-full relative font-sans overflow-x-hidden pb-20 ${theme.background}`}>
      <div className="fixed inset-0 w-full z-0 transition-all duration-1000" style={bgStyle} />
      {profile.backgroundType === 'image' && (
        <div className="fixed inset-0 z-[1] bg-black/30 pointer-events-none" style={{ opacity: Math.max(0.1, profile.backgroundOpacity || 0.3) }} />
      )}

      <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto px-6 pt-20">
        
        <div className="text-center mb-10 w-full">
          <div className="relative inline-block mb-6">
            <img 
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              className="w-28 h-28 rounded-[2.5rem] border-4 border-white/30 shadow-2xl mx-auto object-cover transform hover:rotate-3 transition-transform" 
              alt="Avatar"
            />
            {profile.isPro && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-xl border-2 border-white/20">
                <i className="fa-solid fa-crown text-[10px]"></i>
              </div>
            )}
          </div>
          <h1 className={`text-3xl font-black mb-3 tracking-tight ${theme.textColor}`}>
            {profile.displayName || `@${profile.username}`}
          </h1>
          <p className={`text-sm font-medium opacity-80 max-w-xs mx-auto leading-relaxed px-4 ${theme.textColor}`}>
            {profile.bio}
          </p>
        </div>

        {profile.socialsPosition === 'top' && <SocialHub />}

        {/* Video Promos Grid - High impact section */}
        {promos.length > 0 && (
          <div className="w-full space-y-8 mb-8">
            {promos.map(promo => (
              <div key={promo.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                <div className="aspect-[9/16] relative bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${promo.videoId}?start=${promo.clipStart}&end=${promo.clipEnd}&autoplay=0&mute=1&modestbranding=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-8 text-center space-y-6">
                   <p className="text-xl font-black text-slate-900 leading-tight">"{promo.caption}"</p>
                   <a 
                    href={promo.targetUrl}
                    target="_blank"
                    className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
                   >
                    Shop Featured Items
                   </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full space-y-4 px-2">
          {links.map((link) => {
             const favicon = getFaviconUrl(link.url);
             if (link.type === 'newsletter') {
               return (
                 <div key={link.id} className={`w-full p-8 rounded-[2rem] shadow-xl border border-white/10 ${theme.buttonColor} ${theme.buttonTextColor}`}>
                    <h3 className="text-xl font-black mb-4 text-center">{link.title}</h3>
                    {subscribed ? (
                      <div className="text-center font-bold text-green-400 py-2">Success! You're on the list. ✨</div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="space-y-3">
                        <input 
                          type="email" required placeholder="Email Address"
                          className={`w-full rounded-xl px-5 py-3.5 font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all ${theme.inputBg}`}
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg">JOIN NOW</button>
                      </form>
                    )}
                 </div>
               );
             }

             return (
              <a
                key={link.id}
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                target="_blank" rel="noopener noreferrer"
                className={`group w-full py-5 px-6 rounded-[2rem] flex items-center justify-between font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 border border-white/10 ${theme.buttonColor} ${theme.buttonTextColor} ${link.isFeatured ? 'ring-2 ring-white/40' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm p-1.5">
                    {favicon ? (
                      <img src={favicon} className="w-full h-full object-contain rounded-md" alt="" />
                    ) : (
                      <i className={`fa-solid ${link.type === 'shop' ? 'fa-bag-shopping' : 'fa-link'} text-slate-400`}></i>
                    )}
                  </div>
                  <span className="text-lg truncate">{link.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {link.price && <span className="text-xs bg-black/10 px-3 py-1 rounded-full">{link.price}</span>}
                  <i className="fa-solid fa-chevron-right text-xs opacity-20 group-hover:opacity-100 transition-all"></i>
                </div>
              </a>
             );
          })}
        </div>

        {profile.socialsPosition === 'bottom' && <SocialHub />}

        <div className="mt-20 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
          <div className={`text-[9px] font-black tracking-[0.4em] uppercase ${theme.textColor}`}>Powered by</div>
          <div className="flex items-center gap-2">
             <div className="bg-indigo-600 p-1.5 rounded-lg">
                <i className="fa-solid fa-bolt text-white text-xs"></i>
             </div>
             <span className={`text-xl font-black tracking-tighter ${theme.textColor}`}>vendo.bio</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
