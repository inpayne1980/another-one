
import React from 'react';
import { UserProfile, Link, THEMES } from '../types';

interface PreviewFrameProps {
  profile: UserProfile;
  links: Link[];
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ profile, links }) => {
  const theme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

  return (
    <div className="sticky top-10">
      <div className="relative mx-auto border-gray-800 bg-gray-800 border-[12px] rounded-[3rem] h-[650px] w-[320px] shadow-2xl overflow-hidden">
        {/* Phone UI elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700 rounded-full z-20"></div>
        
        <div className={`rounded-[2.4rem] overflow-y-auto w-full h-full ${theme.background} flex flex-col items-center p-6 text-center scrollbar-hide`}>
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
              className="w-20 h-20 rounded-full border-4 border-white/30 object-cover shadow-lg"
            />
          </div>
          
          <h2 className={`font-black text-xl mb-1 ${theme.textColor}`}>@{profile.username}</h2>
          <p className={`text-sm opacity-80 mb-8 px-4 leading-relaxed ${theme.textColor}`}>{profile.bio}</p>

          <div className="w-full space-y-4">
            {links.filter(l => l.active).map(link => (
              <div 
                key={link.id} 
                className={`group w-full py-4 px-5 ${theme.buttonColor} ${theme.buttonTextColor} ${theme.buttonRadius} text-sm font-black shadow-md transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${link.isFeatured ? 'featured-pulse ring-2 ring-white/50' : 'hover:scale-[1.02]'}`}
              >
                <div className="flex items-center gap-3">
                  {link.type === 'shop' && <i className="fa-solid fa-cart-shopping opacity-70"></i>}
                  {link.type === 'newsletter' && <i className="fa-solid fa-envelope opacity-70"></i>}
                  {link.type === 'tip' && <i className="fa-solid fa-heart opacity-70"></i>}
                  <span className="truncate max-w-[150px]">{link.title}</span>
                </div>
                {link.price && <span className="bg-black/10 px-2 py-1 rounded text-[10px] font-bold">{link.price}</span>}
                {!link.price && <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>}
              </div>
            ))}
          </div>

          <div className="mt-10 mb-6 flex gap-5">
            {Object.entries(profile.socials).map(([platform, handle]) => (
              handle && (
                <div key={platform} className={`${theme.textColor} opacity-60 hover:opacity-100 transition-opacity`}>
                  <i className={`fa-brands fa-${platform} text-2xl`}></i>
                </div>
              )
            ))}
          </div>
          
          <div className={`mt-auto pt-8 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${theme.textColor}`}>
             <i className="fa-solid fa-bolt text-xs"></i>
             LinkPulse
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewFrame;
