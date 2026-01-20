
import React, { useState, useEffect } from 'react';
import { Link, UserProfile, LinkType } from '../types';
import PreviewFrame from '../components/PreviewFrame';
import { optimizeBio, suggestLinks } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('lp_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Visit My Portfolio', url: 'https://example.com', active: true, clicks: 120, type: 'standard' },
      { id: '2', title: 'Buy My New E-Book', url: 'https://gumroad.com', active: true, clicks: 450, type: 'shop', price: '$19.99', isFeatured: true }
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
      socials: { twitter: 'alex_tweets', instagram: 'alex_visuals' }
    };
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('lp_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('lp_profile', JSON.stringify(profile));
  }, [profile]);

  const addLink = (type: LinkType = 'standard') => {
    const newLink: Link = {
      id: Date.now().toString(),
      title: type === 'shop' ? 'Product Name' : type === 'tip' ? 'Buy me a coffee' : 'New Link',
      url: 'https://',
      active: true,
      clicks: 0,
      type: type,
      price: type === 'shop' ? '$9.99' : undefined
    };
    setLinks([newLink, ...links]);
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
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

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-8">
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
              <input 
                value={profile.displayName}
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                className="text-2xl font-bold block w-full outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 -ml-2"
                placeholder="Display Name"
              />
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
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => addLink('standard')}
            className="flex-1 min-w-[140px] bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-link"></i> Add Link
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

        {/* Links List */}
        <div className="space-y-4">
          {links.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <i className="fa-solid fa-link-slash text-4xl text-gray-200 mb-4 block"></i>
              <p className="text-gray-400 font-medium">No links yet. Start by adding one above!</p>
            </div>
          )}
          {links.map((link) => (
            <div key={link.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-4 group hover:border-indigo-200 transition-all">
              <div className="flex flex-col items-center justify-center text-gray-300 px-2">
                <i className="fa-solid fa-grip-vertical cursor-move"></i>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    {link.type === 'shop' && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Shop</span>}
                    {link.type === 'newsletter' && <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Newsletter</span>}
                    {link.type === 'tip' && <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Tip</span>}
                    <input 
                      value={link.title}
                      onChange={(e) => updateLink(link.id, { title: e.target.value })}
                      className="font-bold text-gray-800 text-lg w-full outline-none focus:text-indigo-600"
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
                  <div className="flex-1 flex items-center gap-2 text-gray-400 w-full">
                    <i className="fa-solid fa-link text-xs"></i>
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
                      Featured
                    </button>
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
    </div>
  );
};

export default Dashboard;
