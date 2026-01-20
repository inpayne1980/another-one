
import React, { useEffect, useState } from 'react';
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

  const bgStyle: React.CSSProperties = profile.backgroundType === 'color' 
    ? { backgroundColor: profile.backgroundColor } 
    : profile.backgroundType === 'image' 
    ? { backgroundImage: `url(${profile.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } 
    : {};

  const bgClassName = profile.backgroundType === 'theme' ? theme.background : '';

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 sm:p-12 transition-colors duration-1000 ${bgClassName}`} style={bgStyle}>
      <style>{`
        @keyframes pulse-custom {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .animate-featured { animation: pulse-custom 2s infinite ease-in-out; }
      `}</style>

      <div className="max-w-[680px] w-full flex flex-col items-center">
        {/* Profile Header */}
        <div className="mt-12 mb-6">
          <img 
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
            alt="Avatar" 
            className="w-28 h-28 rounded-full border-4 border-white/30 object-cover shadow-2xl hover:rotate-3 transition-transform"
          />
        </div>
        
        <h1 className={`text-3xl font-black mb-2 tracking-tight ${theme.textColor}`}>
          @{profile.username}
        </h1>
        
        <p className={`text-center mb-12 text-lg opacity-90 max-w-sm font-medium leading-relaxed ${theme.textColor}`}>
          {profile.bio}
        </p>

        {/* Hero Windows Grid */}
        {heroLinks.length > 0 && (
          <div className={`w-full grid gap-6 mb-10 ${heroLinks.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {heroLinks.map(link => {
              const ytId = getYouTubeId(link.url);
              const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80`;
              return (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] ${heroLinks.length === 1 ? 'md:max-w-xl mx-auto w-full' : ''}`}
                >
                  <img src={thumb} alt={link.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                     <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all mx-auto">
                        <i className="fa-solid fa-play text-white text-xl ml-1"></i>
                     </div>
                     <h3 className="text-white font-black text-xl text-center drop-shadow-lg">{link.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Standard Links List */}
        <div className="w-full space-y-5">
          {standardLinks.map((link) => {
            if (link.type === 'newsletter') {
              return (
                <div key={link.id} className={`w-full p-6 ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} shadow-xl backdrop-blur-lg`}>
                  <h3 className="text-center font-black mb-4 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-envelope"></i> {link.title}
                  </h3>
                  {subscribed ? (
                    <p className="text-center text-sm font-bold text-green-500 py-2">Thanks for subscribing! ✨</p>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                      <input 
                        type="email" 
                        required 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm border border-black/10"
                      />
                      <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all">Join</button>
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
                className={`group block w-full py-5 px-8 flex items-center justify-between text-xl font-black shadow-xl transform transition-all hover:scale-[1.03] active:scale-[0.98] ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} backdrop-blur-md ${link.isFeatured ? 'animate-featured ring-2 ring-white/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {link.type === 'shop' && <i className="fa-solid fa-bag-shopping opacity-60"></i>}
                  {link.type === 'tip' && <i className="fa-solid fa-mug-hot opacity-60"></i>}
                  {link.type === 'standard' && favicon && (
                    <img 
                      src={favicon} 
                      className="w-6 h-6 object-contain rounded-md" 
                      alt=""
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  {link.type === 'standard' && !favicon && <i className="fa-solid fa-link opacity-60 text-lg"></i>}
                  <span>{link.title}</span>
                </div>
                {link.price && <span className="bg-black/10 px-3 py-1 rounded-lg text-sm font-black">{link.price}</span>}
                {!link.price && <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-30 group-hover:opacity-100 transition-opacity"></i>}
              </a>
            );
          })}
        </div>

        {/* Social Icons */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {Object.entries(profile.socials).map(([platform, handle]) => {
            if (!handle) return null;
            const iconClass = platform === 'twitter' ? 'fa-brands fa-x-twitter' : `fa-brands fa-${platform}`;
            return (
              <a 
                key={platform} 
                href={`https://${platform === 'twitter' ? 'x' : platform}.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.textColor} opacity-60 hover:opacity-100 transition-all transform hover:scale-125 hover:-translate-y-1`}
              >
                <i className={`${iconClass} text-4xl`}></i>
              </a>
            )
          })}
        </div>

        {/* Brand Footer */}
        <footer className="mt-24 pb-12 flex flex-col items-center gap-4">
          <div className={`flex items-center gap-2 font-black text-2xl tracking-tighter opacity-40 ${theme.textColor}`}>
            <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-sm">
              <i className="fa-solid fa-bolt"></i>
            </div>
            LinkPulse
          </div>
          {profile.isPro && (
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-white">Verified Creator</div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default PublicProfile;
