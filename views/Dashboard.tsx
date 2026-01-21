
import React, { useState, useEffect } from 'react';
import { Link, UserProfile, LinkType } from '../types';
import PreviewFrame from '../components/PreviewFrame';
import { optimizeBio, suggestLinks } from '../services/geminiService';
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

const SOCIAL_PRESETS = [
  { name: 'Instagram', icon: 'fa-instagram', color: 'hover:text-pink-600', url: 'instagram.com/' },
  { name: 'TikTok', icon: 'fa-tiktok', color: 'hover:text-black', url: 'tiktok.com/@' },
  { name: 'YouTube', icon: 'fa-youtube', color: 'hover:text-red-600', url: 'youtube.com/@' },
  { name: 'Facebook', icon: 'fa-facebook', color: 'hover:text-blue-600', url: 'facebook.com/' },
  { name: 'Twitter', icon: 'fa-x-twitter', color: 'hover:text-zinc-800', url: 'twitter.com/' },
  { name: 'LinkedIn', icon: 'fa-linkedin', color: 'hover:text-blue-700', url: 'linkedin.com/in/' },
];

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
      themeId: 'classic-dark',
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
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lp_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('lp_profile', JSON.stringify(profile));
  }, [profile]);

  const addLink = (type: LinkType = 'standard', preset?: { name: string, url: string }) => {
    const newLink: Link = {
      id: Date.now().toString(),
      title: preset ? preset.name : (type === 'shop' ? 'Product Name' : type === 'tip' ? 'Buy me a coffee' : 'New Link'),
      url: preset ? `https://${preset.url}` : 'https://',
      active: true,
      clicks: 0,
      type: type,
      price: type === 'shop' ? '$9.99' : undefined
    };
    setLinks([newLink, ...links]);
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    if (updates.isHeroVideo) {
      const heroCount = links.filter(l => l.isHeroVideo && l.id !== id).length;
      if (heroCount >= 3) {
        alert("You can only have up to 3 Hero Windows.");
        return;
      }
    }
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLinks.length) {
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      setLinks(newLinks);
    }
  };

  const shareUrl = `${window.location.origin}/#/p/${profile.username}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const handleOptimizeBio = async () => {
    setIsOptimizing(true);
    const newBio = await optimizeBio(profile.bio, profile.displayName);
    setProfile({ ...profile, bio: newBio });
    setIsOptimizing(false);
  };

  const handleAISuggestions = async () => {
    setIsOptimizing(true);
    const suggestions = await suggestLinks(profile.bio);
    const newLinks: Link[] = suggestions.map((s, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      title: s.title,
      url: s.placeholderUrl,
      active: true,
      clicks: 0,
      type: s.type as LinkType
    }));
    setLinks([...newLinks, ...links]);
    setIsOptimizing(false);
  };

  const downloadQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`;
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendo-bio-${profile.username}-qr.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
             <h2 className="text-xl font-black text-gray-800">Your Live Pulse</h2>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="group relative flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-indigo-600 transition-all hover:shadow-md"
          >
            <i className="fa-solid fa-share-nodes"></i>
            Share Page
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 group-hover:opacity-80 transition-opacity" 
              />
              <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white">
                <i className="fa-solid fa-camera text-xl"></i>
                <input type="file" className="hidden" />
              </label>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2">
                 <input 
                  value={profile.displayName}
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  className="text-2xl font-bold block w-full outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 -ml-2"
                  placeholder="Display Name"
                />
                {profile.isPro && <i className="fa-solid fa-circle-check text-indigo-600 text-lg"></i>}
              </div>
              <div className="relative mt-2">
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full text-gray-600 text-sm h-16 resize-none bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Tell your story..."
                />
                <button 
                  onClick={handleOptimizeBio}
                  disabled={isOptimizing}
                  className="absolute bottom-3 right-3 text-indigo-600 bg-white shadow-sm border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold hover:bg-indigo-50 transition-all flex items-center gap-2"
                >
                  <i className={`fa-solid ${isOptimizing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                  {isOptimizing ? 'Optimizing...' : 'AI Enhance Bio'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Link Creators */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => addLink('standard')}
              className="flex-1 min-w-[140px] bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Add Link
            </button>
            <button 
              onClick={() => addLink('shop')}
              className="flex-1 min-w-[140px] bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-cart-shopping"></i> Add Shop
            </button>
            <button 
              onClick={() => addLink('newsletter')}
              className="flex-1 min-w-[140px] bg-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-envelope"></i> Newsletter
            </button>
            <button 
              onClick={handleAISuggestions}
              disabled={isOptimizing}
              className="flex-1 min-w-[140px] bg-white border border-gray-100 py-3 rounded-2xl font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-wand-sparkles"></i> AI Suggest
            </button>
          </div>

          {/* Quick Add Presets */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Social Links</span>
               <button 
                onClick={() => navigate('/appearance')}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
               >
                 Connect More Socials →
               </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {SOCIAL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => addLink('standard', { name: preset.name, url: preset.url })}
                  className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-400 transition-all hover:scale-110 hover:bg-white hover:shadow-md ${preset.color}`}
                  title={`Quick Add ${preset.name}`}
                >
                  <i className={`fa-brands ${preset.icon} text-lg`}></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {links.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-link-slash text-2xl text-gray-200"></i>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No links yet. Start by adding one above!</p>
            </div>
          )}
          {links.map((link, index) => (
            <div key={link.id} className={`bg-white p-5 rounded-3xl shadow-sm border transition-all flex gap-4 group ${link.isHeroVideo ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
              <div className="flex flex-col items-center justify-center gap-2 px-2">
                <button 
                  onClick={() => moveLink(index, 'up')} 
                  disabled={index === 0}
                  className="text-gray-300 hover:text-indigo-400 disabled:opacity-30 p-1"
                >
                  <i className="fa-solid fa-caret-up text-xl"></i>
                </button>
                <button 
                  onClick={() => moveLink(index, 'down')} 
                  disabled={index === links.length - 1}
                  className="text-gray-300 hover:text-indigo-400 disabled:opacity-30 p-1"
                >
                  <i className="fa-solid fa-caret-down text-xl"></i>
                </button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    {link.type === 'shop' && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Shop</span>}
                    {link.type === 'newsletter' && <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Newsletter</span>}
                    {link.isHeroVideo && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"><i className="fa-solid fa-video mr-1"></i> Hero</span>}
                    <input 
                      value={link.title}
                      onChange={(e) => updateLink(link.id, { title: e.target.value })}
                      className="font-bold text-gray-800 text-lg w-full outline-none focus:text-indigo-600 transition-colors"
                      placeholder="Title"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={link.active} 
                        onChange={(e) => updateLink(link.id, { active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 flex items-center gap-3 text-gray-400 w-full">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                      {getFaviconUrl(link.url) ? (
                        <img 
                          src={getFaviconUrl(link.url)!} 
                          alt="favicon" 
                          className="w-5 h-5 object-contain"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <i className="fa-solid fa-link text-xs"></i>
                      )}
                    </div>
                    <input 
                      value={link.url}
                      onChange={(e) => updateLink(link.id, { url: e.target.value })}
                      className="text-sm w-full outline-none bg-transparent"
                      placeholder="Destination URL"
                    />
                  </div>
                  {link.type === 'shop' && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl">
                      <i className="fa-solid fa-tag text-xs text-gray-400"></i>
                      <input 
                        value={link.price}
                        onChange={(e) => updateLink(link.id, { price: e.target.value })}
                        className="text-xs font-bold w-16 bg-transparent outline-none"
                        placeholder="Price"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-chart-simple"></i>
                      {link.clicks} clicks
                    </span>
                    <button 
                      onClick={() => updateLink(link.id, { isFeatured: !link.isFeatured })}
                      className={`flex items-center gap-1 transition-colors ${link.isFeatured ? 'text-indigo-600' : 'hover:text-gray-600'}`}
                    >
                      <i className="fa-solid fa-star"></i>
                      Feature
                    </button>
                    <button 
                      onClick={() => updateLink(link.id, { isHeroVideo: !link.isHeroVideo })}
                      className={`flex items-center gap-1 transition-colors ${link.isHeroVideo ? 'text-indigo-600' : 'hover:text-gray-600'}`}
                    >
                      <i className="fa-solid fa-video"></i>
                      Hero Window
                    </button>
                    {link.isHeroVideo && (
                      <button 
                        onClick={() => updateLink(link.id, { isNSFW: !link.isNSFW })}
                        className={`flex items-center gap-1 transition-colors ${link.isNSFW ? 'text-red-500' : 'hover:text-gray-600'}`}
                      >
                        <i className={`fa-solid ${link.isNSFW ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        NSFW
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => removeLink(link.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-[350px]">
        <PreviewFrame profile={profile} links={links} />
      </div>

      {/* Share & QR Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="flex justify-between items-start mb-6">
                 <div className="text-left">
                    <h3 className="text-2xl font-black text-gray-900">Share your Vendo</h3>
                    <p className="text-gray-400 text-sm font-medium">Grow your audience everywhere.</p>
                 </div>
                 <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-gray-400"></i>
                 </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] mb-8 flex flex-col items-center gap-6 border border-gray-100">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:scale-105">
                   <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`} 
                    alt="QR Code" 
                    className="w-40 h-40"
                   />
                </div>
                <button 
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                >
                  <i className="fa-solid fa-download"></i>
                  Download high-res QR
                </button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-2 rounded-2xl">
                    <span className="flex-1 text-left px-4 font-bold text-sm text-gray-600 truncate">{shareUrl}</span>
                    <button 
                      onClick={copyUrl}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <i className={`fa-solid ${showCopyToast ? 'fa-check' : 'fa-copy'}`}></i>
                      {showCopyToast ? 'Copied!' : 'Copy'}
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: 'fa-twitter', label: 'Twitter', color: 'bg-[#1DA1F2]', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` },
                      { icon: 'fa-whatsapp', label: 'WhatsApp', color: 'bg-[#25D366]', url: `whatsapp://send?text=${encodeURIComponent(shareUrl)}` },
                      { icon: 'fa-linkedin-in', label: 'LinkedIn', color: 'bg-[#0077B5]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
                      { icon: 'fa-facebook-f', label: 'Facebook', color: 'bg-[#4267B2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` }
                    ].map((btn) => (
                      <a 
                        key={btn.label}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${btn.color} text-white w-full h-12 flex items-center justify-center rounded-2xl hover:scale-110 transition-transform shadow-md`}
                      >
                        <i className={`fa-brands ${btn.icon} text-lg`}></i>
                      </a>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom { from { transform: translateY(1rem); } to { transform: translateY(0); } }
        @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom; }
        .zoom-in-95 { animation-name: zoom-in; }
      `}</style>
    </div>
  );
};

export default Dashboard;
