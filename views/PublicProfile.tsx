
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile, Link, THEMES } from '../types';

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} flex flex-col items-center p-6 sm:p-12 transition-colors duration-1000`}>
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

        {/* Links Grid */}
        <div className="w-full space-y-5">
          {links.map((link) => {
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
          {Object.entries(profile.socials).map(([platform, handle]) => (
            handle && (
              <a 
                key={platform} 
                href={`https://${platform}.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.textColor} opacity-60 hover:opacity-100 transition-all transform hover:scale-125 hover:-translate-y-1`}
              >
                <i className={`fa-brands fa-${platform} text-4xl`}></i>
              </a>
            )
          ))}
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
