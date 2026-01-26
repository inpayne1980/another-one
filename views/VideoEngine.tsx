
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
  const [previewThumbnails, setPreviewThumbnails] = useState<Record<string, string>>({});
  const [thumbnailText, setThumbnailText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Modal state
  const [activeKitPromo, setActiveKitPromo] = useState<PromoData | null>(null);
  const [kitPlatform, setKitPlatform] = useState<PlatformStatus['name']>('tiktok');

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
      const results = await getClipSuggestions(url, script || "Creator sharing expertise.", images);
      setSuggestions(results);
      if (results.length > 0) {
        setSelectedClip(results[0]);
        setThumbnailText(results[0].viralTitle.split(' ').slice(0, 3).join(' '));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async () => {
    if (!selectedClip) return;
    setThumbnailLoading(true);
    try {
      const [thumb169, thumb916] = await Promise.all([
        generateViralThumbnail(
          `${selectedClip.viralTitle}. ${selectedClip.caption}`,
          thumbnailText,
          "16:9"
        ),
        generateViralThumbnail(
          `${selectedClip.viralTitle}. ${selectedClip.caption}`,
          thumbnailText,
          "9:16"
        )
      ]);
      
      const newThumbs: Record<string, string> = {};
      if (thumb169) newThumbs['16:9'] = thumb169;
      if (thumb916) newThumbs['9:16'] = thumb916;
      
      setPreviewThumbnails(newThumbs);
    } catch (err) {
      console.error(err);
    } finally {
      setThumbnailLoading(false);
    }
  };

  const handlePublish = async () => {
    const videoId = extractVideoId(url);
    if (!selectedClip || !targetUrl || !videoId) return;

    setIsPublishing(true);
    try {
      // Platform Definitions
      const platformConfigs: { name: PlatformStatus['name'], aspect: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }[] = [
        { name: 'tiktok', aspect: '9:16' },
        { name: 'instagram', aspect: '9:16' },
        { name: 'youtube_shorts', aspect: '9:16' },
        { name: 'facebook', aspect: '4:3' },
        { name: 'twitter', aspect: '16:9' }
      ];

      // Generate all platform thumbnails in parallel for true "Smart Promo" speed
      const thumbResults = await Promise.all(
        platformConfigs.map(async (config) => {
          // If we already have the specific aspect ratio generated in preview, use it to save time/quota
          if (previewThumbnails[config.aspect]) {
             return { name: config.name, url: previewThumbnails[config.aspect] };
          }
          const thumb = await generateViralThumbnail(
            `${config.name} optimized: ${selectedClip.viralTitle}. ${selectedClip.caption}`,
            thumbnailText,
            config.aspect as any
          );
          return { name: config.name, url: thumb };
        })
      );

      const platformThumbs: Record<string, string> = {};
      thumbResults.forEach(res => {
        if (res.url) platformThumbs[res.name] = res.url;
      });

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
        thumbnailUrl: platformThumbs['twitter'] || platformThumbs['facebook'] || previewThumbnails['16:9'],
        platformThumbnails: platformThumbs,
        targetUrl,
        platforms: platformConfigs.map(c => ({ name: c.name, status: 'draft' })),
        status: 'published',
        createdAt: new Date().toISOString()
      };

      setPromos([newPromo, ...promos]);

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
        thumbnailUrl: previewThumbnails['16:9'] || platformThumbs['twitter'],
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
      setPreviewThumbnails({});
      setThumbnailText('');
      
      alert("Multi-platform campaign launched with unique assets for every network!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate all assets. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const deletePromo = (id: string) => {
    if (!window.confirm("Delete this campaign?")) return;
    setPromos(promos.filter(p => p.id !== id));
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
      case 'facebook': return <i className="fa-brands fa-facebook-f"></i>;
      default: return <i className="fa-solid fa-share-nodes"></i>;
    }
  };

  const getPlatformAspect = (platform: string) => {
    if (['tiktok', 'instagram', 'youtube_shorts'].includes(platform)) return 'aspect-[9/16]';
    if (['facebook'].includes(platform)) return 'aspect-[4/3]';
    return 'aspect-video';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Smart Video Engine</h1>
          <p className="text-slate-500 font-medium mt-2">AI-powered viral clip extraction with unique platform assets.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
          <i className="fa-solid fa-bolt mr-2"></i> Pro Feature
        </div>
      </header>

      {/* Input Stage */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Step 1: Content Source</label>
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
            <h4 className="font-bold text-slate-900">Context & Key Points</h4>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="What makes this video special?"
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
          {loading ? 'Analyzing Scene Dynamics...' : 'Generate Viral Package'}
        </button>

        {suggestions.length > 0 && (
          <div className="pt-8 border-t border-slate-100 space-y-8">
            <h3 className="text-xl font-bold">Select Winning Segment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((clip) => (
                <div 
                  key={clip.id} 
                  onClick={() => { setSelectedClip(clip); setPreviewThumbnails({}); }}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100'}`}
                >
                  <p className="text-xs font-black text-indigo-600 uppercase mb-2">{clip.start}s - {clip.end}s</p>
                  <p className="font-bold text-sm mb-2">"{clip.caption}"</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 italic">"{clip.reasoning}"</p>
                </div>
              ))}
            </div>

            {selectedClip && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                  <div className="space-y-6 lg:col-span-1">
                    <h4 className="text-xs font-black uppercase text-indigo-600">Viral Strategy</h4>
                    <p className="text-lg font-black text-slate-900 leading-tight bg-white p-4 rounded-xl border border-slate-100">{selectedClip.viralTitle}</p>
                    <div className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                      {selectedClip.viralDescription}
                    </div>

                    <div className="space-y-4">
                      <input 
                        value={thumbnailText}
                        onChange={(e) => setThumbnailText(e.target.value)}
                        placeholder="Global Overlay Text"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm"
                      />
                      <button 
                        onClick={generateThumbnails}
                        disabled={thumbnailLoading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-indigo-700 transition-all"
                      >
                        {thumbnailLoading ? 'Painting Multi-Aspect...' : 'Generate Dual Previews'}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-xs font-black uppercase text-indigo-600">Platform Identity (16:9 & 9:16)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {/* 16:9 Preview */}
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feed / Desktop (16:9)</p>
                          <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200">
                            {previewThumbnails['16:9'] ? (
                              <img src={previewThumbnails['16:9']} className="w-full h-full object-cover" alt="16:9 Preview" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <i className={`fa-solid ${thumbnailLoading ? 'fa-spinner fa-spin' : 'fa-image'} text-2xl`}></i>
                                <span className="text-[8px] font-black uppercase">Pending</span>
                              </div>
                            )}
                          </div>
                       </div>
                       
                       {/* 9:16 Preview */}
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reels / TikTok (9:16)</p>
                          <div className="aspect-[9/16] h-48 bg-slate-200 rounded-2xl overflow-hidden relative mx-auto shadow-inner border border-slate-200">
                            {previewThumbnails['9:16'] ? (
                              <img src={previewThumbnails['9:16']} className="w-full h-full object-cover" alt="9:16 Preview" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <i className={`fa-solid ${thumbnailLoading ? 'fa-spinner fa-spin' : 'fa-image'} text-2xl`}></i>
                                <span className="text-[8px] font-black uppercase">Pending</span>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-6 shadow-sm">
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign Target</label>
                    <input
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="Destination URL (e.g. Shop, Affiliate Link)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handlePublish} 
                    disabled={isPublishing}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                    {isPublishing ? 'Deploying Unique Platform Assets...' : 'Deploy Smart Multi-Platform Campaign'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Command Center */}
      <section className="space-y-8 pt-10">
        <h2 className="text-3xl font-black text-slate-900">Social Command Center</h2>

        {promos.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-300">
             <i className="fa-solid fa-tower-broadcast text-5xl mb-4 opacity-20"></i>
             <p className="font-black uppercase tracking-widest text-xs">Awaiting first viral launch</p>
          </div>
        ) : promos.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg">
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="w-full xl:w-64 shrink-0">
                <div className="aspect-[9/16] bg-slate-900 rounded-[2rem] overflow-hidden relative border border-slate-100 shadow-xl">
                   <img 
                    src={p.platformThumbnails?.tiktok || p.thumbnailUrl || `https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} 
                    className="w-full h-full object-cover opacity-70" 
                    alt="Promo"
                   />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                     <i className="fa-solid fa-play text-white text-3xl opacity-50"></i>
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                      <p className="text-[8px] font-black text-white uppercase tracking-widest">Master Format</p>
                   </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black text-slate-900 truncate max-w-md">{p.viralTitle || p.caption}</h3>
                     <button onClick={() => deletePromo(p.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2">
                       <i className="fa-solid fa-trash-can"></i>
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">SEGMENT: {p.clipStart}S-{p.clipEnd}S</span>
                    <a href={p.targetUrl} target="_blank" className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">{p.targetUrl.replace('https://','')}</a>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50">"{p.viralDescription}"</p>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Unique Distribution Hubs</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {p.platforms.map(platform => (
                      <button 
                        key={platform.name}
                        onClick={() => { setActiveKitPromo(p); setKitPlatform(platform.name); }}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                          activeKitPromo?.id === p.id && kitPlatform === platform.name 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        <div className="text-lg transition-transform group-hover:scale-110">
                          <PlatformIcon name={platform.name} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight">{platform.name.replace('_', ' ')}</span>
                        <div className={`text-[7px] px-2 py-0.5 rounded-full font-black ${
                          platform.status === 'published' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {platform.status.toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Unique Content Kit Modal */}
      {activeKitPromo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setActiveKitPromo(null)}></div>
           <div className="relative bg-white w-full max-w-5xl max-h-full overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Social Distribution Kit</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1">Platform-Specific AI Unique Assets</p>
                 </div>
                 <button onClick={() => setActiveKitPromo(null)} className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all">
                   <i className="fa-solid fa-xmark text-slate-400"></i>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar">
                 <div className="flex flex-wrap gap-2 mb-8 bg-slate-100/50 p-2 rounded-2xl border border-slate-200 max-w-fit mx-auto">
                    {activeKitPromo.platforms.map(pl => (
                      <button 
                        key={pl.name}
                        onClick={() => setKitPlatform(pl.name)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          kitPlatform === pl.name ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'hover:bg-white text-slate-400'
                        }`}
                      >
                        <PlatformIcon name={pl.name} />
                        {pl.name.replace('_', ' ')}
                      </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-6">
                       <div className="bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl relative border-[12px] border-slate-900 ring-1 ring-slate-100/10">
                          <div className={`relative w-full ${getPlatformAspect(kitPlatform)} transition-all duration-700 overflow-hidden bg-black`}>
                             <img 
                              src={activeKitPromo.platformThumbnails?.[kitPlatform] || activeKitPromo.thumbnailUrl || `https://img.youtube.com/vi/${activeKitPromo.videoId}/hqdefault.jpg`} 
                              className="w-full h-full object-cover transition-all duration-1000 animate-in fade-in" 
                              alt="Platform Thumbnail" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                             <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                               <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Target: {kitPlatform.replace('_',' ')}</span>
                               </div>
                               <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl">
                                  <i className="fa-solid fa-play text-white text-xs"></i>
                               </div>
                             </div>
                             <div className="absolute top-8 left-8">
                                <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black text-white/60 uppercase tracking-widest">Unique AI Asset</span>
                             </div>
                          </div>
                       </div>
                       <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all">
                         <i className="fa-solid fa-download mr-3"></i> Download Asset Bundle
                       </button>
                    </div>

                    <div className="space-y-10">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Specific Headline</label>
                             <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded">Optimized for CTR</span>
                          </div>
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl leading-tight relative group hover:bg-white transition-colors">
                            {activeKitPromo.viralTitle}
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralTitle)} className="absolute top-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"><i className="fa-solid fa-copy"></i></button>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing Copy & Tags</label>
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto relative group hover:bg-white transition-colors no-scrollbar shadow-inner">
                            {activeKitPromo.viralDescription}
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralDescription)} className="absolute top-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"><i className="fa-solid fa-copy"></i></button>
                          </div>
                       </div>

                       <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6 shadow-sm">
                          <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest flex items-center gap-2">
                             <i className="fa-solid fa-lightbulb"></i>
                             Distribution Intel
                          </h4>
                          <div className="space-y-5">
                             {kitPlatform === 'facebook' ? (
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"><i className="fa-brands fa-facebook-f text-indigo-600 text-xs"></i></div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Facebook favors **4:3 aspect ratios** in the News Feed. Post this unique thumbnail with the optimized copy into 3 target Groups to bypass the algorithmic throttle.</p>
                               </div>
                             ) : kitPlatform === 'tiktok' ? (
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"><i className="fa-brands fa-tiktok text-slate-900 text-xs"></i></div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">TikTok's **9:16 vertical format** is extremely sensitive to lighting. This AI asset uses high-contrast gradients to ensure you stop the scroll within the first 0.5s.</p>
                               </div>
                             ) : (
                               <div className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"><i className="fa-solid fa-bolt text-indigo-600 text-xs"></i></div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Cross-platform synchronization is key. Every link in this copy points back to your Vendo bio, ensuring you capture 100% of the traffic spillover from this specific network.</p>
                               </div>
                             )}
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
