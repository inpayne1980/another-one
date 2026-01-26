
import React, { useState, useEffect } from 'react';
import { THEMES, UserProfile, Link } from '../types';
import PreviewFrame from '../components/PreviewFrame';

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

const Appearance: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lp_profile');
    return saved ? JSON.parse(saved) : {
      username: 'creative_mind',
      displayName: 'Alex Smith',
      bio: 'Digital artist creating experiences.',
      avatarUrl: 'https://picsum.photos/200',
      themeId: 'glass-dark',
      isPro: true,
      backgroundType: 'theme',
      backgroundColor: '#4f46e5',
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOpacity: 0.4,
      backgroundGrayscale: false,
      backgroundParallax: true,
      socialsDisplay: 'icons',
      socialsPosition: 'bottom',
      socials: { twitter: 'alex_tweets', instagram: 'alex_visuals' }
    };
  });

  const [links] = useState<Link[]>(() => {
    const saved = localStorage.getItem('lp_links');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lp_profile', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-10 animate-in fade-in duration-500 pb-20">
        
        {/* Visual Themes Engine */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Visual Themes</h2>
              <p className="text-sm text-gray-400 mt-1">Transform your entire profile with a single tap.</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl">
              <i className="fa-solid fa-wand-magic-sparkles text-indigo-600 text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Pro Styles</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setProfile({ ...profile, themeId: theme.id, backgroundType: 'theme' })}
                className={`group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
                  profile.themeId === theme.id && profile.backgroundType === 'theme' 
                    ? 'ring-[6px] ring-indigo-600 ring-offset-4' 
                    : 'hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                {/* Theme Preview Mockup */}
                <div className={`absolute inset-0 ${theme.background} p-4 flex flex-col items-center gap-2`}>
                  {/* Mini Profile Mockup */}
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/10 mb-2 flex items-center justify-center">
                    <i className={`fa-solid fa-user text-[10px] ${theme.textColor} opacity-40`}></i>
                  </div>
                  <div className={`w-14 h-1.5 opacity-40 rounded-full ${theme.textColor} bg-current`} />
                  <div className={`w-10 h-1 opacity-20 rounded-full ${theme.textColor} bg-current mb-4`} />
                  
                  {/* Mini Link Mockups */}
                  <div className="w-full space-y-2 mt-2">
                    {[1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className={`w-full h-5 ${theme.buttonRadius} ${theme.buttonColor} border border-white/5 flex items-center px-2`}
                      >
                         <div className={`w-1/2 h-[2px] opacity-30 rounded-full ${theme.buttonTextColor} bg-current`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Overlay */}
                <div className={`absolute inset-x-0 bottom-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 flex flex-col items-center transition-all ${
                  profile.themeId === theme.id ? 'translate-y-0' : 'translate-y-1 group-hover:translate-y-0'
                }`}>
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">{theme.name}</span>
                  {profile.themeId === theme.id && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-indigo-600">
                      <i className="fa-solid fa-circle-check"></i> Current
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Social Hub Styling */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <div className="mb-8">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Social Hub Controls</h2>
              <p className="text-xs text-gray-400 mt-1">Configure the placement and style of your brand icons.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-gray-400">Vertical Position</label>
                 <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'top', label: 'Top' },
                      { id: 'bottom', label: 'Bottom' }
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setProfile({ ...profile, socialsPosition: pos.id as any })}
                        className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                          profile.socialsPosition === pos.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-gray-400">Icon Presentation</label>
                 <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'icons', label: 'Classic' },
                      { id: 'buttons', label: 'Full Width' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setProfile({ ...profile, socialsDisplay: style.id as any })}
                        className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                          profile.socialsDisplay === style.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Brand Connectivity */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="mb-8">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Social Accounts</h2>
            <p className="text-xs text-gray-400 mt-1">We automatically fetch high-res logos for these platforms.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'linkedin'].map((platform) => {
              const handle = (profile.socials as any)[platform] || '';
              return (
                <div key={platform} className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${handle ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'}`}>
                    <img 
                      src={getPlatformFavicon(platform)} 
                      alt={platform} 
                      className={`w-4 h-4 object-contain ${handle ? '' : 'grayscale opacity-30 group-hover:opacity-60'}`}
                    />
                  </div>
                  <input
                    placeholder={`${platform} @username`}
                    value={handle}
                    onChange={(e) => setProfile({
                      ...profile,
                      socials: { ...profile.socials, [platform]: e.target.value }
                    })}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-bold placeholder:text-gray-300"
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="lg:w-[350px] shrink-0">
        <PreviewFrame profile={profile} links={links} />
      </div>
    </div>
  );
};

export default Appearance;
