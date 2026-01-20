
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
      backgroundBlur: 0,
      backgroundOpacity: 0.4,
      backgroundGrayscale: false,
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
      <div className="flex-1 space-y-8 animate-in fade-in duration-500">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Visual Themes</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Pro Engine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setProfile({ ...profile, themeId: theme.id, backgroundType: 'theme' })}
                className={`p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden h-32 flex flex-col justify-end group shadow-sm ${
                  profile.themeId === theme.id && profile.backgroundType === 'theme' ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-white hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-16 ${theme.background}`}></div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="font-bold text-gray-900 text-sm">{theme.name}</span>
                </div>
                {profile.themeId === theme.id && profile.backgroundType === 'theme' && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                    <i className="fa-solid fa-check text-[8px]"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">HD Background Engine</h2>
              <p className="text-xs text-gray-400 mt-1">High-quality images and GIFs for tablets & desktop.</p>
            </div>
          </div>
          
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-8">
            {['theme', 'color', 'image'].map((type) => (
              <button
                key={type}
                onClick={() => setProfile({ ...profile, backgroundType: type as any })}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  profile.backgroundType === type 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {profile.backgroundType === 'color' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Solid Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={profile.backgroundColor}
                    onChange={(e) => setProfile({...profile, backgroundColor: e.target.value})}
                    className="w-14 h-14 rounded-2xl overflow-hidden border-none cursor-pointer shadow-inner"
                  />
                  <input 
                    type="text"
                    value={profile.backgroundColor}
                    onChange={(e) => setProfile({...profile, backgroundColor: e.target.value})}
                    placeholder="#4F46E5"
                    className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {profile.backgroundType === 'image' && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Image or GIF URL</label>
                  <input 
                    type="text"
                    value={profile.backgroundImage}
                    onChange={(e) => setProfile({...profile, backgroundImage: e.target.value})}
                    placeholder="https://images.unsplash.com/... or .gif"
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium shadow-sm"
                  />
                  <p className="text-[10px] text-gray-400 font-bold italic">PRO TIP: Use high-quality vertical 4K images or loops for tablet users.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Soft Focus (Blur)</label>
                       <span className="text-xs font-bold text-indigo-600">{profile.backgroundBlur || 0}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" step="1"
                      value={profile.backgroundBlur || 0}
                      onChange={(e) => setProfile({...profile, backgroundBlur: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Overlay Dim</label>
                       <span className="text-xs font-bold text-indigo-600">{Math.round((profile.backgroundOpacity || 0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.9" step="0.05"
                      value={profile.backgroundOpacity || 0}
                      onChange={(e) => setProfile({...profile, backgroundOpacity: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                         <i className="fa-solid fa-moon text-indigo-600"></i>
                      </div>
                      <span className="text-sm font-bold text-gray-700">Monochrome Filter</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.backgroundGrayscale || false} 
                        onChange={(e) => setProfile({...profile, backgroundGrayscale: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Social Identity</h2>
              <p className="text-xs text-gray-400 mt-1">Connect your handles to show verified brand icons.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'linkedin'].map((platform) => {
              const handle = (profile.socials as any)[platform] || '';
              return (
                <div key={platform} className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${handle ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                    <img 
                      src={getPlatformFavicon(platform)} 
                      alt={platform} 
                      className={`w-4 h-4 object-contain ${handle ? '' : 'grayscale opacity-30'}`}
                    />
                  </div>
                  <input
                    placeholder={`${platform}`}
                    value={handle}
                    onChange={(e) => setProfile({
                      ...profile,
                      socials: { ...profile.socials, [platform]: e.target.value }
                    })}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all text-xs font-bold"
                  />
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
