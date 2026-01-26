
import React, { useState, useRef, useEffect } from 'react';
import { getClipSuggestions, generateViralThumbnail } from '../services/geminiService';
import { PromoData, ClipSuggestion, Link, PlatformStatus } from '../types';

const VideoEngine: React.FC = () => {
  const [url, setUrl] = useState('');
  const [script, setScript] = useState('');
  const [images, setImages] = useState<{data: string, mimeType: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ClipSuggestion[]>([]);
  const [selectedClip, setSelectedClip] = useState<ClipSuggestion | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [isNSFW, setIsNSFW] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);
  const [thumbnailText, setThumbnailText] = useState('');
  
  // Modal state for social distribution kit
  const [activeKitPromo, setActiveKitPromo] = useState<PromoData | null>(null);

  const [promos, setPromos] = useState<PromoData[]>(() => {
    const saved = localStorage.getItem('lp_promos');
    return saved ? JSON.parse(saved) : [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('lp_promos', JSON.stringify(promos));
  }, [promos]);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\\w\/|embed\/|watch\\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const results = await getClipSuggestions(url, script || "Creator sharing expertise on the current topic.", images);
      setSuggestions(results);
      if (results.length > 0) {
        setSelectedClip(results[0]);
        setThumbnailText(results[0].viralTitle.split(' ').slice(0, 3).join(' ')); // Default suggested text
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async () => {
    if (!selectedClip) return;
    setThumbnailLoading(true);
    const url = await generateViralThumbnail(
      `${selectedClip.viralTitle}. ${selectedClip.caption}`,
      thumbnailText
    );
    setThumbnailUrl(url);
    setThumbnailLoading(false);
  };

  const handlePublish = () => {
    const videoId = extractVideoId(url);
    if (!selectedClip || !targetUrl || !videoId) return;

    const promoId = Date.now().toString();
    const newPromo: PromoData = {
      id: promoId,
      youtubeUrl: url,
      videoId: videoId,
      clipStart: selectedClip.start,
      clipEnd: selectedClip.end,
      caption: selectedClip.caption,
      viralTitle: selectedClip.viralTitle,
      viralDescription: selectedClip.viralDescription,
      thumbnailUrl: thumbnailUrl,
      targetUrl,
      platforms: [
        { name: 'youtube_shorts', status: 'published' },
        { name: 'tiktok', status: 'draft' },
        { name: 'instagram', status: 'draft' },
        { name: 'twitter', status: 'draft' }
      ],
      status: 'published',
      createdAt: new Date().toISOString()
    };

    const updatedPromos = [newPromo, ...promos];
    setPromos(updatedPromos);
    localStorage.setItem('lp_promos', JSON.stringify(updatedPromos));

    const savedLinks = localStorage.getItem('lp_links');
    const links: Link[] = savedLinks ? JSON.parse(savedLinks) : [];
    
    const newLink: Link = {
      id: promoId,
      title: selectedClip.viralTitle,
      url: targetUrl,
      active: true,
      clicks: 0,
      type: 'video',
      isHeroVideo: true,
      isFeatured: true,
      isNSFW: isNSFW,
      thumbnailUrl: thumbnailUrl,
      viralDescription: selectedClip.viralDescription
    };

    localStorage.setItem('lp_links', JSON.stringify([newLink, ...links]));

    // Reset UI
    setUrl('');
    setSuggestions([]);
    setSelectedClip(null);
    setTargetUrl('');
    setImages([]);
    setScript('');
    setIsNSFW(false);
    setThumbnailUrl(undefined);
    setThumbnailText('');
    
    alert("Campaign launched and added to your Social Command Center!");
  };

  const updatePlatformStatus = (promoId: string, platformName: string, status: 'published' | 'scheduled') => {
    const updated = promos.map(p => {
      if (p.id === promoId) {
        return {
          ...p,
          platforms: p.platforms.map(pl => 
            pl.name === platformName ? { ...pl, status, publishedAt: new Date().toISOString() } : pl
          )
        };
      }
      return p;
    });
    setPromos(updated);
  };

  const deletePromo = (id: string) => {
    if (!window.confirm("Delete this campaign and all associated data?")) return;
    const updatedPromos = promos.filter(p => p.id !== id);
    setPromos(updatedPromos);
    
    const savedLinks = localStorage.getItem('lp_links');
    if (savedLinks) {
      const links: Link[] = JSON.parse(savedLinks);
      localStorage.setItem('lp_links', JSON.stringify(links.filter(l => l.id !== id)));
    }
  };

  const PlatformIcon = ({ name }: { name: string }) => {
    switch (name) {
      case 'tiktok': return <i className="fa-brands fa-tiktok"></i>;
      case 'instagram': return <i className="fa-brands fa-instagram"></i>;
      case 'youtube_shorts': return <i className="fa-brands fa-youtube"></i>;
      case 'twitter': return <i className="fa-brands fa-x-twitter"></i>;
      case 'threads': return <i className="fa-solid fa-at"></i>;
      default: return <i className="fa-solid fa-share-nodes"></i>;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Smart Video Engine</h1>
          <p className="text-slate-500 font-medium mt-2">AI-powered viral clip extraction & complete marketing package.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
          <i className="fa-solid fa-bolt mr-2"></i> Pro Feature
        </div>
      </header>

      {/* Input Stage */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Step 1: Long-form Content URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video link..."
            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-medium text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-indigo-900">Visual Context</h4>
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors uppercase tracking-widest">+ Add Images</button>
            </div>
            <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={(e) => {
              const files = Array.from(e.target.files || []) as File[];
              files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => setImages(prev => [...prev, { data: reader.result as string, mimeType: file.type }]);
                reader.readAsDataURL(file);
              });
            }} />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white">
                  <img src={img.data} className="w-full h-full object-cover" />
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg text-[8px]"><i className="fa-solid fa-xmark"></i></button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
            <h4 className="font-bold text-slate-900">Refinement Script</h4>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Paste transcript or key takeaways..."
              className="w-full h-24 p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !url}
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
          {loading ? 'AI Generating Viral Package...' : 'Analyze Video & Assets'}
        </button>

        {suggestions.length > 0 && (
          <div className="pt-8 border-t border-slate-100 space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
               Select Winning Segment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((clip) => (
                <div 
                  key={clip.id} 
                  onClick={() => { 
                    setSelectedClip(clip); 
                    setThumbnailUrl(undefined);
                    setThumbnailText(clip.viralTitle.split(' ').slice(0, 3).join(' '));
                  }}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <p className="text-xs font-black text-indigo-600 uppercase mb-2">{clip.start}s - {clip.end}s</p>
                  <p className="font-bold text-sm mb-2 leading-tight">"{clip.caption}"</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{clip.reasoning}</p>
                </div>
              ))}
            </div>

            {selectedClip && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">AI Viral Package</h4>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Generated Title</label>
                      <p className="text-lg font-black text-slate-900 leading-tight bg-white p-4 rounded-xl shadow-sm border border-slate-100">{selectedClip.viralTitle}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Keyword-Rich Description</label>
                      <div className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-slate-100 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {selectedClip.viralDescription}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Visual Asset</h4>
                    <div className="aspect-video bg-slate-200 rounded-3xl overflow-hidden relative shadow-inner border border-slate-100 group">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Viral Thumbnail" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                          <i className={`fa-solid ${thumbnailLoading ? 'fa-spinner fa-spin' : 'fa-image'} text-4xl`}></i>
                          <p className="text-[10px] font-bold uppercase tracking-widest">{thumbnailLoading ? 'AI Painting Thumbnail...' : 'No Thumbnail Generated'}</p>
                        </div>
                      )}
                      {thumbnailUrl && (
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => setThumbnailUrl(undefined)} className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">Redraw Thumbnail</button>
                         </div>
                      )}
                    </div>
                    
                    {!thumbnailUrl && (
                      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Overlay Text (Optional)</label>
                          <input 
                            value={thumbnailText}
                            onChange={(e) => setThumbnailText(e.target.value)}
                            placeholder="e.g. MUST WATCH!, MIND BLOWN..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                          />
                        </div>
                        <button 
                          onClick={generateThumbnail}
                          disabled={thumbnailLoading}
                          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                        >
                          {thumbnailLoading ? 'AI Generating...' : 'Generate AI Viral Thumbnail'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-6 shadow-sm">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Step 3: Final Launch Configuration</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="Destination URL (e.g. Affiliate Link)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium"
                    />
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">NSFW Privacy Blur</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isNSFW} onChange={(e) => setIsNSFW(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                  <button onClick={handlePublish} className="w-full mt-4 bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                    <i className="fa-solid fa-paper-plane"></i>
                    Deploy & Add to Command Center
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Command Center / History */}
      <section className="space-y-8 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900">Social Command Center</h2>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest">
            {promos.length} Active Campaigns
          </span>
        </div>

        {promos.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <i className="fa-solid fa-tower-broadcast text-slate-200 text-6xl mb-6"></i>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Waiting for your first viral clip</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {promos.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex flex-col xl:flex-row gap-8">
                  
                  {/* Visual Preview */}
                  <div className="w-full xl:w-72 shrink-0">
                    <div className="aspect-[9/16] bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl border border-slate-100">
                       <img 
                        src={p.thumbnailUrl || `https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} 
                        className="w-full h-full object-cover" 
                        alt="Promo"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                         <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-60">YouTube Source</p>
                         <p className="text-white font-black text-xs truncate">vid: {p.videoId}</p>
                       </div>
                       <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs hover:bg-white/40 transition-colors">
                         <i className="fa-solid fa-play"></i>
                       </button>
                    </div>
                  </div>

                  {/* Campaign Intel */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                           <h3 className="text-2xl font-black text-slate-900 truncate max-w-md">{p.viralTitle || p.caption}</h3>
                        </div>
                        <button onClick={() => deletePromo(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">Clip: {p.clipStart}s-{p.clipEnd}s</span>
                        <a href={p.targetUrl} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1">
                          <i className="fa-solid fa-link"></i> {p.targetUrl.replace('https://', '')}
                        </a>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campaign Description</p>
                         <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 italic">"{p.viralDescription}"</p>
                      </div>
                    </div>

                    {/* Distribution Status */}
                    <div className="mt-8">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Multi-Platform Distribution</p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {p.platforms.map(platform => (
                            <button 
                              key={platform.name}
                              onClick={() => {
                                setActiveKitPromo(p);
                                // Simulation of publishing
                                if (platform.status === 'draft') {
                                  updatePlatformStatus(p.id, platform.name, 'published');
                                }
                              }}
                              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                platform.status === 'published' 
                                  ? 'border-indigo-100 bg-indigo-50 text-indigo-600' 
                                  : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              <div className="text-xl">
                                <PlatformIcon name={platform.name} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                {platform.name.replace('_', ' ')}
                              </span>
                              <div className={`text-[8px] px-2 py-0.5 rounded-full font-black ${
                                platform.status === 'published' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                              }`}>
                                {platform.status.toUpperCase()}
                              </div>
                            </button>
                          ))}
                          <button className="p-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-indigo-200 hover:text-indigo-300 transition-all">
                             <i className="fa-solid fa-plus text-xs"></i>
                             <span className="text-[9px] font-black uppercase tracking-widest">Threads</span>
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Created</span>
                        <span className="text-xs font-bold text-slate-900">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-100"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Reach</span>
                        <span className="text-xs font-bold text-indigo-600">Viral Tier 🔥</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => setActiveKitPromo(p)}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                   >
                    Open Content Kit
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Content Kit Modal Simulation */}
      {activeKitPromo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveKitPromo(null)}></div>
           <div className="relative bg-white w-full max-w-4xl max-h-full overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Social Distribution Kit</h2>
                      <p className="text-slate-500 font-medium">Ready-to-post assets for your campaign.</p>
                    </div>
                    <button onClick={() => setActiveKitPromo(null)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="aspect-[9/16] bg-slate-100 rounded-[2rem] overflow-hidden shadow-inner border border-slate-100">
                          <img src={activeKitPromo.thumbnailUrl || `https://img.youtube.com/vi/${activeKitPromo.videoId}/hqdefault.jpg`} className="w-full h-full object-cover" alt="" />
                       </div>
                       <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-colors">
                         <i className="fa-solid fa-download mr-2"></i> Download HD Asset
                       </button>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Viral Headline</label>
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralTitle)} className="text-[10px] font-black text-indigo-600 hover:underline">Copy</button>
                          </div>
                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg leading-tight">
                            {activeKitPromo.viralTitle}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Optimized Caption</label>
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralDescription)} className="text-[10px] font-black text-indigo-600 hover:underline">Copy</button>
                          </div>
                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {activeKitPromo.viralDescription}
                          </div>
                       </div>

                       <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 space-y-4">
                          <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest">Platform Tips</h4>
                          <div className="space-y-3">
                             <div className="flex gap-3 text-xs">
                               <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm"><i className="fa-brands fa-tiktok text-[10px]"></i></div>
                               <p className="text-slate-600">Post between 6pm-9pm. Use the "Trending Sounds" feature for 3x reach.</p>
                             </div>
                             <div className="flex gap-3 text-xs">
                               <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm"><i className="fa-brands fa-instagram text-[10px]"></i></div>
                               <p className="text-slate-600">Add the Destination URL to your Bio before posting this Reel.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoEngine;
