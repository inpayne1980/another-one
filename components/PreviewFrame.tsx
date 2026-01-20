
import React, { useEffect, useState } from 'react';
import { UserProfile, Link, THEMES } from '../types';

interface PreviewFrameProps {
  profile: UserProfile;
  links: Link[];
}

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    if (!domain || domain.length < 4) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const PreviewFrame: React.FC<PreviewFrameProps> = ({ profile, links }) => {
  const theme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
  const activeLinks = links.filter(l => l.active);
  const heroLinks = activeLinks.filter(l => l.isHeroVideo);
  const standardLinks = activeLinks.filter(l => !l.isHeroVideo);
  const [localScroll, setLocalScroll] = useState(0);

  // Simple simulation of parallax in preview when items are many
  const bgStyle: React.CSSProperties = profile.backgroundType === 'color' 
    ? { backgroundColor: profile.backgroundColor } 
    : profile.backgroundType === 'image' 
    ? { 
        backgroundImage: `url(${profile.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        filter: `${profile.backgroundGrayscale ? 'grayscale(1)' : ''} blur(${profile.backgroundBlur || 0}px)`,
        height: profile.backgroundParallax ? '110%' : '100%',
        top: profile.backgroundParallax ? '-5%' : '0'
      } 
    : {};

  const bgClassName = profile.backgroundType === 'theme' ? theme.background : '';

  return (
    <div className="sticky top-10">
      <div className="relative mx-auto border-gray-800 bg-gray-800 border-[12px] rounded-[3rem] h-[650px] w-[320px] shadow-2xl overflow-hidden">
        {/* Phone UI elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-30"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full z-30"></div>
        
        {/* Actual Content Container */}
        <div className="relative w-full h-full rounded-[2.4rem] overflow-hidden flex flex-col">
          
          {/* Background Layer */}
          <div 
            className={`absolute inset-0 transition-all duration-700 ${bgClassName}`}
            style={bgStyle}
          />
          
          {/* HD Overlay Layer */}
          {profile.backgroundType === 'image' && (
            <div 
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none z-[1]"
              style={{ backgroundColor: `rgba(0,0,0,${profile.backgroundOpacity || 0})` }}
            />
          )}

          {/* Content Layer */}
          <div 
            className="relative z-10 w-full h-full overflow-y-auto p-6 flex flex-col items-center text-center scrollbar-hide"
            onScroll={(e) => {
              const el = e.currentTarget;
              const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
              setLocalScroll(progress);
            }}
          >
            <style>{`
              @keyframes pulse-soft {
                0% { transform: scale(1); }
                50% { transform: scale(1.03); box-shadow: 0 0 20px rgba(255,255,255,0.4); }
                100% { transform: scale(1); }
              }
              .featured-pulse { animation: pulse-soft 2s infinite ease-in-out; }
              .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="mt-10 mb-4">
              <img 
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover shadow-2xl"
              />
            </div>
            
            <h2 className={`font-black text-xl mb-1 drop-shadow-sm ${theme.textColor}`}>@{profile.username}</h2>
            <p className={`text-sm opacity-80 mb-6 px-4 leading-relaxed font-medium drop-shadow-sm ${theme.textColor}`}>{profile.bio}</p>

            {/* Hero Windows */}
            {heroLinks.length > 0 && (
              <div className="w-full space-y-4 mb-6">
                {heroLinks.map(link => {
                  const ytId = getYouTubeId(link.url);
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60`;
                  return (
                    <div 
                      key={link.id} 
                      className={`group w-full aspect-video rounded-[1.5rem] overflow-hidden relative shadow-2xl border-2 border-white/20 transition-transform active:scale-95`}
                    >
                      <img 
                        src={thumb} 
                        alt={link.title} 
                        className={`w-full h-full object-cover transition-all duration-500 ${link.isNSFW ? 'blur-xl grayscale' : ''}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                        {link.isNSFW ? (
                          <div className="flex flex-col items-center">
                            <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full mb-1 uppercase tracking-tighter">NSFW Warning</div>
                            <i className="fa-solid fa-eye-slash text-white text-lg mb-1 opacity-50"></i>
                            <span className="text-white font-black text-[9px] uppercase tracking-wider">Sensitive Content</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 border border-white/30 group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-play text-white text-xs ml-1"></i>
                            </div>
                            <span className="text-white font-black text-[10px] uppercase tracking-wider truncate w-full">{link.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Standard Links */}
            <div className="w-full space-y-3">
              {standardLinks.map(link => (
                <div 
                  key={link.id} 
                  className={`group w-full py-4 px-5 ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} text-sm font-black shadow-lg transition-all cursor-pointer flex items-center justify-between relative overflow-hidden backdrop-blur-md ${link.isFeatured ? 'featured-pulse ring-2 ring-white/50' : 'hover:scale-[1.02]'}`}
                >
                  <div className="flex items-center gap-3">
                    {link.type === 'shop' ? (
                      <i className="fa-solid fa-cart-shopping opacity-70"></i>
                    ) : link.type === 'newsletter' ? (
                      <i className="fa-solid fa-envelope opacity-70"></i>
                    ) : link.type === 'tip' ? (
                      <i className="fa-solid fa-heart opacity-70"></i>
                    ) : getFaviconUrl(link.url) ? (
                      <img 
                        src={getFaviconUrl(link.url)!} 
                        className="w-4 h-4 object-contain rounded-sm" 
                        alt=""
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <i className="fa-solid fa-link opacity-70"></i>
                    )}
                    <span className="truncate max-w-[150px]">{link.title}</span>
                  </div>
                  {link.price && <span className="bg-black/10 px-2 py-1 rounded text-[10px] font-bold">{link.price}</span>}
                </div>
              ))}
            </div>

            <div className="mt-10 mb-6 flex gap-4 flex-wrap justify-center">
              {Object.entries(profile.socials).map(([platform, handle]) => {
                if (!handle) return null;
                const iconClass = platform === 'twitter' ? 'fa-brands fa-x-twitter' : `fa-brands fa-${platform}`;
                return (
                  <div key={platform} className={`${theme.textColor} opacity-60 hover:opacity-100 transition-opacity drop-shadow-md`}>
                    <i className={`${iconClass} text-xl`}></i>
                  </div>
                )
              })}
            </div>
            
            <div className={`mt-auto pt-8 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40 ${theme.textColor}`}>
               <i className="fa-solid fa-bolt text-xs"></i>
               vendo.bio PRO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewFrame;
