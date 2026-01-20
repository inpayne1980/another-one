
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
      themeId: 'classic-dark',
      backgroundType: 'theme',
      backgroundColor: '#4f46e5',
      backgroundImage: '',
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
      <div className="flex-1 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Custom Themes</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Pro Feature</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setProfile({ ...profile, themeId: theme.id, backgroundType: 'theme' })}
                className={`p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden h-40 flex flex-col justify-end group shadow-sm ${
                  profile.themeId === theme.id && profile.backgroundType === 'theme' ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-white hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-24 ${theme.background}`}></div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="font-bold text-gray-900">{theme.name}</span>
                  <div className="flex gap-1">
                    <div className={`w-4 h-4 rounded-full ${theme.buttonColor}`}></div>
                    <div className={`w-4 h-4 rounded-full bg-indigo-500 opacity-20`}></div>
                  </div>
                </div>
                {profile.themeId === theme.id && profile.backgroundType === 'theme' && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg scale-110">
                    <i className="fa-solid fa-check text-xs"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Custom Background</h2>
              <p className="text-xs text-gray-400 mt-1">Override theme background with your own style.</p>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            {['theme', 'color', 'image'].map((type) => (
              <button
                key={type}
                onClick={() => setProfile({ ...profile, backgroundType: type as any })}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${
                  profile.backgroundType === type 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {profile.backgroundType === 'color' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Background Color</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={profile.backgroundColor}
                  onChange={(e) => setProfile({...profile, backgroundColor: e.target.value})}
                  className="w-14 h-14 rounded-xl overflow-hidden border-none cursor-pointer"
                />
                <input 
                  type="text"
                  value={profile.backgroundColor}
                  onChange={(e) => setProfile({...profile, backgroundColor: e.target.value})}
                  placeholder="#000000"
                  className="flex-1 bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-mono"
                />
              </div>
            </div>
          )}

          {profile.backgroundType === 'image' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Background Image URL</label>
              <input 
                type="text"
                value={profile.backgroundImage}
                onChange={(e) => setProfile({...profile, backgroundImage: e.target.value})}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm"
              />
              <p className="text-[10px] text-gray-400 italic">Pro Tip: Use high-quality vertical images for the best mobile experience.</p>
            </div>
          )}
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Social Connections</h2>
              <p className="text-xs text-gray-400 mt-1">Add your handles to display brand icons on your profile.</p>
            </div>
          </div>
          <div className="space-y-6">
            {['instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'linkedin'].map((platform) => {
              const handle = (profile.socials as any)[platform] || '';
              return (
                <div key={platform} className="group">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-gray-50 ${handle ? 'border-indigo-100 bg-white shadow-sm' : 'border-transparent'}`}>
                      <img 
                        src={getPlatformFavicon(platform)} 
                        alt={platform} 
                        className={`w-7 h-7 object-contain transition-transform duration-500 ${handle ? 'scale-110 rotate-3' : 'grayscale opacity-40 hover:grayscale-0'}`}
                      />
                    </div>
                    
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-gray-300 font-black text-sm">@</span>
                      </div>
                      <input
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} username`}
                        value={handle}
                        onChange={(e) => setProfile({
                          ...profile,
                          socials: { ...profile.socials, [platform]: e.target.value }
                        })}
                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-10 pr-4 outline-none transition-all text-sm font-bold ${
                          handle 
                            ? 'border-indigo-50 bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50' 
                            : 'border-transparent focus:bg-white focus:border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="lg:w-[350px]">
        <PreviewFrame profile={profile} links={links} />
      </div>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-short { animation: bounce-short 2s infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top-2 { animation-name: slide-in-from-top; }
      `}</style>
    </div>
  );
};

export default Appearance;
