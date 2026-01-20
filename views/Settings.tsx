
import React, { useState } from 'react';
import { UserProfile } from '../types';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lp_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [message, setMessage] = useState('');

  if (!profile) return <div>Loading...</div>;

  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('lp_profile', JSON.stringify(newProfile));
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all your profile data and links? This cannot be undone.')) {
      localStorage.removeItem('lp_links');
      localStorage.removeItem('lp_profile');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      profile,
      links: JSON.parse(localStorage.getItem('lp_links') || '[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkpulse_backup_${profile.username}.json`;
    a.click();
  };

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-gray-900">Account Settings</h2>
      
      {message && (
        <div className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-circle-check"></i>
          {message}
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Username</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold">linkpulse.me/</span>
                <input 
                  value={profile.username}
                  onChange={(e) => updateProfile({ username: e.target.value })}
                  className="flex-1 bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Account Type</label>
              <div className={`p-4 rounded-2xl flex items-center justify-between ${profile.isPro ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.isPro ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <i className="fa-solid fa-crown"></i>
                   </div>
                   <div>
                      <p className="font-bold">{profile.isPro ? 'LinkPulse PRO' : 'Free Starter'}</p>
                      <p className="text-xs text-gray-500">{profile.isPro ? 'All features unlocked' : 'Limited features'}</p>
                   </div>
                </div>
                <button 
                  onClick={() => updateProfile({ isPro: !profile.isPro })}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${profile.isPro ? 'bg-white text-indigo-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg'}`}
                >
                  {profile.isPro ? 'Manage Billing' : 'Upgrade to PRO'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Data Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={exportData}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 px-6 py-4 rounded-2xl font-bold transition-colors"
            >
              <i className="fa-solid fa-download"></i>
              Export My Data
            </button>
            <button 
              onClick={clearData}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-6 py-4 rounded-2xl font-bold transition-colors"
            >
              <i className="fa-solid fa-trash-can"></i>
              Delete All Data
            </button>
          </div>
        </section>
      </div>

      <div className="text-center pt-8">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">LinkPulse SaaS v1.2.4-stable</p>
      </div>
    </div>
  );
};

export default Settings;
