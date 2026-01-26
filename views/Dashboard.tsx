
import React, { useState, useEffect } from 'react';
import { Link, UserProfile, LinkType } from '../types';
import PreviewFrame from '../components/PreviewFrame';
import { optimizeBio, suggestLinks, rewriteLinkTitle } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    if (!domain || domain.length < 4) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('lp_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Visit My Portfolio', url: 'https://example.com', active: true, clicks: 120, type: 'standard' },
      { id: '2', title: 'Check Out My New Video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', active: true, clicks: 840, type: 'standard', isHeroVideo: true }
    ];
  });

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

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [rewritingId, setRewritingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('lp_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('lp_profile', JSON.stringify(profile));
  }, [profile]);

  const handleRewriteTitle = async (id: string, currentTitle: string) => {
    setRewritingId(id);
    const newTitle = await rewriteLinkTitle(currentTitle);
    updateLink(id, { title: newTitle });
    setRewritingId(null);
  };

  const addLink = (type: LinkType = 'standard') => {
    const newLink: Link = {
      id: Date.now().toString(),
      title: type === 'shop' ? 'Featured Product' : type === 'tip' ? 'Support My Work' : 'New Link',
      url: 'https://',
      active: true,
      clicks: 0,
      type: type,
      price: type === 'shop' ? '$19.99' : undefined
    };
    setLinks([newLink, ...links]);
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    // Also cleanup promo data if it's a video
    const promos = JSON.parse(localStorage.getItem('lp_promos') || '[]');
    localStorage.setItem('lp_promos', JSON.stringify(promos.filter((p: any) => p.id !== id)));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLinks.length) {
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      setLinks(newLinks);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-6 animate-in fade-in duration-500">
        
        {/* Profile Command Center */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group shrink-0">
              <img src={profile.avatarUrl} alt="Avatar" className="w-28 h-28 rounded-3xl object-cover ring-4 ring-slate-50 group-hover:opacity-90 transition-all shadow-xl" />
              <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <i className="fa-solid fa-camera"></i>
                <input type="file" className="hidden" />
              </label>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between">
                <input 
                  value={profile.displayName}
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  className="text-3xl font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                  placeholder="Your Name"
                />
              </div>
              <div className="relative">
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full text-slate-700 font-medium text-base h-24 resize-none bg-slate-50 border border-slate-200 rounded-3xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                  placeholder="Share your story..."
                />
                <button 
                  onClick={async () => {
                    setIsOptimizing(true);
                    const newBio = await optimizeBio(profile.bio, profile.displayName);
                    setProfile({...profile, bio: newBio});
                    setIsOptimizing(false);
                  }}
                  disabled={isOptimizing}
                  className="absolute bottom-4 right-4 bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <i className={`fa-solid ${isOptimizing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                  {isOptimizing ? 'Refining...' : 'AI Rewrite Bio'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'standard', label: 'Link', icon: 'fa-link', color: 'bg-indigo-600' },
            { id: 'shop', label: 'Shop', icon: 'fa-cart-shopping', color: 'bg-emerald-600' },
            { id: 'newsletter', label: 'Email', icon: 'fa-envelope', color: 'bg-violet-600' },
            { id: 'tip', label: 'Support', icon: 'fa-heart', color: 'bg-rose-600' }
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => addLink(btn.id as LinkType)}
              className={`${btn.color} text-white py-4 rounded-[1.5rem] font-bold shadow-lg hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3`}
            >
              <i className={`fa-solid ${btn.icon}`}></i>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Links Editor */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <div 
              key={link.id} 
              className={`bg-white p-6 rounded-[2rem] border-2 flex gap-6 group transition-all ${
                link.isHeroVideo ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <button onClick={() => moveLink(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"><i className="fa-solid fa-chevron-up text-xl"></i></button>
                <button onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"><i className="fa-solid fa-chevron-down text-xl"></i></button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    {link.isHeroVideo && (
                      <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">
                        <i className="fa-solid fa-video mr-1"></i> Video
                      </div>
                    )}
                    <input 
                      value={link.title}
                      onChange={(e) => updateLink(link.id, { title: e.target.value })}
                      className="text-xl font-black text-slate-900 bg-transparent border-none focus:ring-0 w-full"
                      placeholder="Title"
                    />
                    <button 
                      onClick={() => handleRewriteTitle(link.id, link.title)}
                      disabled={rewritingId === link.id}
                      className="text-indigo-600 p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="AI Rewrite for higher CTR"
                    >
                      <i className={`fa-solid ${rewritingId === link.id ? 'fa-spinner fa-spin' : 'fa-sparkles'}`}></i>
                    </button>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-110">
                    <input type="checkbox" checked={link.active} onChange={(e) => updateLink(link.id, { active: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-3 bg-white/50 border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {getFaviconUrl(link.url) ? <img src={getFaviconUrl(link.url)!} className="w-5 h-5" alt="" /> : <i className="fa-solid fa-link text-slate-400"></i>}
                    </div>
                    <input 
                      value={link.url}
                      onChange={(e) => updateLink(link.id, { url: e.target.value })}
                      className="bg-transparent text-sm font-bold text-slate-800 outline-none w-full"
                      placeholder="Destination URL"
                    />
                  </div>
                  {link.type === 'shop' && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">
                      <i className="fa-solid fa-tag text-emerald-600"></i>
                      <input 
                        value={link.price}
                        onChange={(e) => updateLink(link.id, { price: e.target.value })}
                        className="bg-transparent text-sm font-black text-emerald-900 outline-none w-16"
                        placeholder="$0.00"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-2 text-indigo-600"><i className="fa-solid fa-chart-simple"></i> {link.clicks} clicks</span>
                      <button onClick={() => updateLink(link.id, { isFeatured: !link.isFeatured })} className={`${link.isFeatured ? 'text-amber-500' : 'hover:text-slate-900'} transition-colors flex items-center gap-2`}><i className="fa-solid fa-star"></i> {link.isFeatured ? 'Featured' : 'Highlight'}</button>
                      <button onClick={() => removeLink(link.id)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i> Delete</button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-[360px] hidden lg:block">
        <PreviewFrame profile={profile} links={links} />
      </div>
    </div>
  );
};

export default Dashboard;
