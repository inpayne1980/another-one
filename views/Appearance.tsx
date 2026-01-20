
import React, { useState, useEffect } from 'react';
import { THEMES, UserProfile, Link } from '../types';
import PreviewFrame from '../components/PreviewFrame';

const Appearance: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lp_profile');
    return saved ? JSON.parse(saved) : {
      username: 'creative_mind',
      displayName: 'Alex Smith',
      bio: 'Digital artist creating experiences.',
      avatarUrl: 'https://picsum.photos/200',
      themeId: 'classic-dark',
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
    <div className="flex gap-10">
      <div className="flex-1 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Choose a Theme</h2>
          <div className="grid grid-cols-2 gap-6">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setProfile({ ...profile, themeId: theme.id })}
                className={`p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden h-40 flex flex-col justify-end group shadow-sm ${
                  profile.themeId === theme.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-white hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-24 ${theme.background}`}></div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="font-bold text-gray-900">{theme.name}</span>
                  <div className="flex gap-1">
                    <div className={`w-4 h-4 rounded-full ${theme.buttonColor}`}></div>
                    <div className={`w-4 h-4 rounded-full bg-indigo-500`}></div>
                  </div>
                </div>
                {profile.themeId === theme.id && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1.5 rounded-full">
                    <i className="fa-solid fa-check text-xs"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Social Handles</h2>
          <div className="space-y-4">
            {['twitter', 'instagram', 'youtube', 'linkedin'].map((platform) => (
              <div key={platform} className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500">
                  <i className={`fa-brands fa-${platform} text-xl`}></i>
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                  <input
                    placeholder={`Your ${platform} username`}
                    value={(profile.socials as any)[platform] || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      socials: { ...profile.socials, [platform]: e.target.value }
                    })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <PreviewFrame profile={profile} links={links} />
    </div>
  );
};

export default Appearance;
