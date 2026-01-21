
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile, Link, THEMES } from '../types';

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

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealedNsfw, setRevealedNsfw] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedProfile = localStorage.getItem('lp_profile');
    const savedLinks = localStorage.getItem('lp_links');
    
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
    }
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks).filter((l: Link) => l.active));
    }
  }, [username]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(scrolled / maxScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [profile]);

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-pulse">
        <div className="bg-indigo-600 p-3 rounded-2xl inline-block mb-4">
          <i className="fa-solid fa-bolt text-white text-3xl"></i>
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Pulse...</p>
      </div>
    </div>
  );

  const theme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
  const heroLinks = links.filter(l => l.isHeroVideo);
  const standardLinks = links.filter(l => !l.isHeroVideo);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const toggleNsfw = (id: string) => {
    setRevealedNsfw(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parallaxTransform = profile.backgroundParallax 
    ? `translateY(${-scrollProgress * 5}%)` 
    : 'none';

  const bgStyle: React.CSSProperties = profile.backgroundType === 'color' 
    ? { backgroundColor: profile.backgroundColor } 
    : profile.backgroundType === 'image' 
    ? { 
        backgroundImage: `url(${profile.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        height: profile.backgroundParallax ? '115vh' : '100vh',
        top: profile.backgroundParallax ? '-5vh' : '0',
        filter: `${profile.backgroundGrayscale ? 'grayscale(1)' : ''} blur(${profile.backgroundBlur || 0}px)`,
        transform: parallaxTransform,
        willChange: 'transform'
      } 
    : {};

  const bgClassName = profile.backgroundType === 'theme' ? theme.background : '';

  const SocialHub = () => {
    const activeSocials = Object.entries(profile.socials).filter(([_, h]) => !!h);
    if (activeSocials.length === 0) return null;

    if (profile.socialsDisplay === 'buttons') {
      return (
        <div className="w-full max-w-sm space-y-3 mb-10 mt-2">
          {activeSocials.map(([platform, handle]) => (
            <a 
              key={platform}
              href={`https://${platform === 'twitter' ? 'x' : platform}.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-5 px-8 rounded-2xl flex items-center justify-center gap-4 text-lg font-black backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95 ${theme.buttonColor} ${theme.buttonTextColor} opacity-90`}
            >
              <i className={`fa-brands fa-${platform === 'twitter' ? 'x-twitter' : platform} text-xl`}></i>
              <span className="capitalize">{platform}</span>
            </a>
          ))}
        </div>
      );
    }

    return (
      <div className={`mt-4 mb-12 flex flex-wrap justify-center gap-8 ${profile.socialsPosition === 'bottom' ? 'mt-20' : ''}`}>
        {activeSocials.map(([platform, handle]) => {
          const iconClass = platform === 'twitter' ? 'fa-brands fa-x-twitter' : `fa-brands fa-${platform}`;
          return (
            <a 
              key={platform} 
              href={`https://${platform === 'twitter' ? 'x' : platform}.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.textColor} opacity-60 hover:opacity-100 transition-all transform hover:scale-125 hover:-translate-y-2 drop-shadow-xl`}
            >
              <i className={`${iconClass} text-5xl md:text-6xl`}></i>
            </a>
          )
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div 
        className={`fixed inset-0 w-full transition-all duration-1000 ease-out z-0 ${bgClassName}`} 
        style={bgStyle}
      />
      
      {profile.backgroundType === 'image' && (
        <div 
          className="fixed inset-0 transition-opacity duration-1000 z-[1] pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${profile.backgroundOpacity || 0})` }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center p-6 sm:p-12">
        <style>{`
          @keyframes pulse-custom {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }
          .animate-featured { animation: pulse-custom 2s infinite ease-in-out; }
          .backdrop-glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        `}</style>

        <div className="max-w-[680px] w-full flex flex-col items-center">
          <div className="mt-12 mb-6 text-center">
            <img 
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              alt="Avatar" 
              className="w-28 h-28 rounded-full border-4 border-white/30 object-cover shadow-2xl hover:rotate-3 transition-transform duration-500 mx-auto mb-4"
            />
            <h1 className={`text-4xl font-black mb-2 tracking-tight drop-shadow-lg ${theme.textColor}`}>
              @{profile.username}
            </h1>
            <p className={`text-center mb-6 text-lg opacity-90 max-w-sm font-semibold leading-relaxed drop-shadow-lg ${theme.textColor}`}>
              {profile.bio}
            </p>
          </div>

          {profile.socialsPosition === 'top' && <SocialHub />}

          {heroLinks.length > 0 && (
            <div className={`w-full grid gap-8 mb-12 ${heroLinks.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {heroLinks.map(link => {
                const ytId = getYouTubeId(link.url);
                const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80`;
                const isRevealed = revealedNsfw[link.id];
                const showBlur = link.isNSFW && !isRevealed;

                return (
                  <div 
                    key={link.id}
                    className={`group relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] ${heroLinks.length === 1 ? 'md:max-w-xl mx-auto w-full' : ''}`}
                  >
                    <img 
                      src={thumb} 
                      alt={link.title} 
                      className={`w-full h-full object-cover transition-all duration-1000 ${showBlur ? 'blur-[40px] grayscale brightness-50' : 'group-hover:scale-110'}`} 
                    />
                    
                    {showBlur ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/20">
                         <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-4 shadow-lg uppercase tracking-widest flex items-center gap-2">
                           <i className="fa-solid fa-triangle-exclamation"></i> Sensitive Content
                         </div>
                         <h3 className="text-white font-bold text-lg mb-6 text-center drop-shadow-lg">This content may be sensitive.</h3>
                         <button 
                          onClick={() => toggleNsfw(link.id)}
                          className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm shadow-2xl hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2"
                         >
                           <i className="fa-solid fa-eye"></i> Show Content
                         </button>
                      </div>
                    ) : (
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-center"
                      >
                         <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white/40 transition-all mx-auto">
                            <i className="fa-solid fa-play text-white text-xl ml-1"></i>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                           <h3 className="text-white font-black text-2xl text-center drop-shadow-2xl">{link.title}</h3>
                           {link.isNSFW && (
                             <span className="text-[10px] text-white/60 font-black uppercase tracking-widest flex items-center gap-1">
                               <i className="fa-solid fa-eye text-[8px]"></i> Unlocked NSFW Content
                             </span>
                           )}
                         </div>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="w-full space-y-6">
            {standardLinks.map((link) => {
              if (link.type === 'newsletter') {
                return (
                  <div key={link.id} className={`w-full p-8 ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} shadow-2xl backdrop-blur-xl border border-white/20`}>
                    <h3 className="text-center font-black text-xl mb-6 flex items-center justify-center gap-3">
                      <i className="fa-solid fa-envelope-open-text"></i> {link.title}
                    </h3>
                    {subscribed ? (
                      <div className="text-center animate-bounce text-green-400 font-black py-4">Welcome to the inner circle! ✨</div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="flex gap-3">
                        <input 
                          type="email" 
                          required 
                          placeholder="Drop your email..." 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-black/10 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/50 text-base border border-white/10 font-bold"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-lg active:scale-95">JOIN</button>
                      </form>
                    )}
                  </div>
                );
              }

              const favicon = getFaviconUrl(link.url);

              return (
                <a 
                  key={link.id} 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block w-full py-6 px-10 flex items-center justify-between text-2xl font-black shadow-2xl transform transition-all hover:scale-[1.04] active:scale-[0.98] ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} backdrop-blur-xl border border-white/10 ${link.isFeatured ? 'animate-featured ring-4 ring-white/30' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    {link.type === 'shop' && <i className="fa-solid fa-shopping-bag opacity-70"></i>}
                    {link.type === 'tip' && <i className="fa-solid fa-bolt-lightning opacity-70"></i>}
                    {link.type === 'standard' && favicon && (
                      <img 
                        src={favicon} 
                        className="w-7 h-7 object-contain rounded-lg shadow-sm" 
                        alt=""
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    {link.type === 'standard' && !favicon && <i className="fa-solid fa-share-nodes opacity-70"></i>}
                    <span className="tracking-tight">{link.title}</span>
                  </div>
                  {link.price && <span className="bg-black/10 px-4 py-1 rounded-xl text-sm font-black tracking-widest uppercase">{link.price}</span>}
                  {!link.price && <i className="fa-solid fa-chevron-right text-xs opacity-20 group-hover:opacity-100 transition-opacity"></i>}
                </a>
              );
            })}
          </div>

          {profile.socialsPosition === 'bottom' && <SocialHub />}

          <footer className="mt-32 pb-16 flex flex-col items-center gap-6">
            <div className={`flex items-center gap-3 font-black text-3xl tracking-tighter opacity-40 ${theme.textColor}`}>
              <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
                <i className="fa-solid fa-bolt"></i>
              </div>
              vendo.bio
            </div>
            {profile.isPro && (
              <div className="text-xs font-black uppercase tracking-[0.5em] opacity-30 text-white animate-pulse">VERIFIED CREATOR</div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
