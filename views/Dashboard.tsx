
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

const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\\w\/|embed\/|watch\\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('lp_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Visit My Portfolio', url: 'https://example.com', active: true, clicks: 120, type: 'standard', origin: 'manual' },
      { id: '2', title: 'Check Out My New Video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', active: true, clicks: 840, type: 'video', isHeroVideo: true, isNSFW: false, origin: 'manual' }
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
  
  // History Toggling
  const [showPromoHistory, setShowPromoHistory] = useState(true);

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
      title: type === 'shop' ? 'Featured Product' : type === 'tip' ? 'Support My Work' : type === 'video' ? 'Watch Video' : 'New Link',
      url: 'https://',
      active: true,
      clicks: 0,
      type: type,
      price: type === 'shop' ? '$19.99' : undefined,
      isNSFW: false,
      isHeroVideo: type === 'video',
      origin: 'manual'
    };
    setLinks([newLink, ...links]);
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
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

  const filteredLinks = links.filter(l => {
    if (!showPromoHistory && l.origin === 'promo') return false;
    return true;
  });

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: 'standard', label: 'Link', icon: 'fa-link', color: 'bg-indigo-600' },
            { id: 'shop', label: 'Shop', icon: 'fa-cart-shopping', color: 'bg-emerald-600' },
            { id: 'video', label: 'Video', icon: 'fa-clapperboard', color: 'bg-amber-600' },
            { id: 'newsletter', label: 'Email', icon: 'fa-envelope', color: 'bg-violet-600' },
            { id: 'tip', label: 'Support', icon: 'fa-heart', color: 'bg-rose-600' }
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => addLink(btn.id as LinkType)}
              className={`${btn.color} text-white py-4 rounded-[1.5rem] font-bold shadow-lg hover:-translate-y-1 active:scale-95 transition-all flex flex-col items-center justify-center gap-2`}
            >
              <i className={`fa-solid ${btn.icon} text-xl`}></i>
              <span className="text-[10px] uppercase tracking-widest font-black">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Link History Toggle */}
        <div className="flex items-center justify-between px-2 pt-4">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Link Ecosystem</h3>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Show Promo History</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showPromoHistory} onChange={(e) => setShowPromoHistory(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
           </div>
        </div>

        {/* Links Editor */}
        <div className="space-y-4">
          {filteredLinks.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
               <p className="text-slate-400 font-medium italic">No links found for current filter.</p>
            </div>
          ) : filteredLinks.map((link, index) => {
            const ytId = extractYouTubeId(link.url);
            return (
              <div 
                key={link.id} 
                className={`bg-white p-6 rounded-[2rem] border-2 flex gap-6 group transition-all relative ${
                  link.isHeroVideo ? 'border-amber-100 bg-amber-50/20 shadow-inner' : 'border-slate-100 hover:border-indigo-100'
                }`}
              >
                {link.origin === 'promo' && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-lg z-10">
                    <i className="fa-solid fa-sparkles mr-1"></i> Promo Origin
                  </div>
                )}

                <div className="flex flex-col items-center justify-center gap-3">
                  <button onClick={() => moveLink(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"><i className="fa-solid fa-chevron-up text-xl"></i></button>
                  <button onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"><i className="fa-solid fa-chevron-down text-xl"></i></button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`${link.type === 'video' ? 'bg-amber-600' : link.type === 'shop' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0`}>
                        <i className={`fa-solid ${link.type === 'video' ? 'fa-video' : link.type === 'shop' ? 'fa-cart-shopping' : 'fa-link'} mr-1`}></i> {link.type}
                      </div>
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
                        title="AI Rewrite"
                      >
                        <i className={`fa-solid ${rewritingId === link.id ? 'fa-spinner fa-spin' : 'fa-sparkles'}`}></i>
                      </button>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                      <input type="checkbox" checked={link.active} onChange={(e) => updateLink(link.id, { active: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-white/50 border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        {getFaviconUrl(link.url) ? <img src={getFaviconUrl(link.url)!} className="w-5 h-5" alt="" /> : <i className="fa-solid fa-link text-slate-400"></i>}
                      </div>
                      <input 
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        className="bg-transparent text-sm font-bold text-slate-800 outline-none w-full"
                        placeholder="Destination URL (YouTube, Vimeo, etc.)"
                      />
                    </div>

                    {link.isHeroVideo && ytId && (
                      <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden group/hero border border-amber-200/50 shadow-inner">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=0&mute=1&controls=0`}
                          className={`w-full h-full pointer-events-none transition-all ${link.isNSFW ? 'blur-2xl opacity-40 scale-110' : 'opacity-100'}`}
                          title="Preview"
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-white uppercase tracking-widest bg-amber-600 px-3 py-1.5 rounded-lg shadow-lg">Hero Window Active</span>
                               {link.isNSFW && <span className="text-[10px] font-black text-white uppercase tracking-widest bg-red-600 px-3 py-1.5 rounded-lg shadow-lg">NSFW Protect</span>}
                             </div>
                             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                               <i className="fa-solid fa-play text-white text-xs"></i>
                             </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                     <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-2 text-indigo-600"><i className="fa-solid fa-chart-simple"></i> {link.clicks} clicks</span>
                        
                        <button 
                          onClick={() => updateLink(link.id, { isHeroVideo: !link.isHeroVideo })} 
                          className={`flex items-center gap-2 transition-all p-2 rounded-xl ${link.isHeroVideo ? 'text-amber-600 bg-amber-50' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                          title="Toggle Hero Window Embed"
                        >
                          <i className={`fa-solid ${link.isHeroVideo ? 'fa-window-maximize' : 'fa-rectangle-list'}`}></i>
                          {link.isHeroVideo ? 'Hero Window On' : 'Display as Button'}
                        </button>

                        <button 
                          onClick={() => updateLink(link.id, { isNSFW: !link.isNSFW })} 
                          className={`flex items-center gap-2 transition-colors p-2 rounded-xl ${link.isNSFW ? 'text-red-500 bg-red-50' : 'hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                          <i className={`fa-solid ${link.isNSFW ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          {link.isNSFW ? 'NSFW Active' : 'Mark NSFW'}
                        </button>

                        <button onClick={() => removeLink(link.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-auto p-2"><i className="fa-solid fa-trash-can"></i> Delete</button>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:w-[360px] hidden lg:block">
        <PreviewFrame profile={profile} links={links} />
      </div>
    </div>
  );
};

export default Dashboard;
