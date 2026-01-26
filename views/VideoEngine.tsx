
import React, { useState, useRef, useEffect } from 'react';
import { getClipSuggestions, generateViralThumbnail } from '../services/geminiService';
import { PromoData, ClipSuggestion, Link, PlatformStatus, UserProfile } from '../types';
import PreviewFrame from '../components/PreviewFrame';

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
  
  // Local state for Preview synchronization
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

  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('lp_links');
    return saved ? JSON.parse(saved) : [];
  });

  // Platform selection for initial deployment
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube_shorts', 'twitter', 'facebook']);

  // Modal state
  const [activeKitPromo, setActiveKitPromo] = useState<PromoData | null>(null);
  const [kitPlatform, setKitPlatform] = useState<PlatformStatus['name']>('tiktok');

  const [promos, setPromos] = useState<PromoData[]>(() => {
    try {
      const saved = localStorage.getItem('lp_promos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse promos from storage", e);
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('lp_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('lp_links', JSON.stringify(links));
  }, [links]);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\\w\/|embed\/|watch\\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setSuggestions([]);
    setSelectedClip(null);
    setPreviewThumbnails({});
    try {
      const results = await getClipSuggestions(url, script || "Creator sharing expertise.", images);
      if (Array.isArray(results)) {
        setSuggestions(results);
        if (results.length > 0) {
          setSelectedClip(results[0]);
          const words = results[0].viralTitle?.split(' ') || [];
          setThumbnailText(words.slice(0, 3).join(' '));
        }
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async () => {
    if (!selectedClip) return;
    setThumbnailLoading(true);
    try {
      const [thumb169, thumb916] = await Promise.all([
        generateViralThumbnail(`${selectedClip.viralTitle}. ${selectedClip.caption}`, thumbnailText, "16:9"),
        generateViralThumbnail(`${selectedClip.viralTitle}. ${selectedClip.caption}`, thumbnailText, "9:16")
      ]);
      
      const newThumbs: Record<string, string> = {};
      if (thumb169) newThumbs['16:9'] = thumb169;
      if (thumb916) newThumbs['9:16'] = thumb916;
      setPreviewThumbnails(newThumbs);
    } catch (err) {
      console.error("Preview generation failed:", err);
    } finally {
      setThumbnailLoading(false);
    }
  };

  const handlePublish = async () => {
    const videoId = extractVideoId(url);
    if (!selectedClip || !targetUrl || !videoId) return;

    setIsPublishing(true);
    try {
      const platformConfigs: { name: PlatformStatus['name'], aspect: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }[] = [
        { name: 'tiktok', aspect: '9:16' },
        { name: 'instagram', aspect: '9:16' },
        { name: 'youtube_shorts', aspect: '9:16' },
        { name: 'facebook', aspect: '4:3' },
        { name: 'twitter', aspect: '16:9' }
      ];

      const targetConfigs = platformConfigs.filter(c => selectedPlatforms.includes(c.name));

      const thumbResults = await Promise.all(
        targetConfigs.map(async (config) => {
          if (previewThumbnails[config.aspect]) {
             return { name: config.name, url: previewThumbnails[config.aspect] };
          }
          try {
            const thumb = await generateViralThumbnail(
              `${config.name} social optimization: ${selectedClip.viralTitle}`,
              thumbnailText,
              config.aspect as any
            );
            return { name: config.name, url: thumb };
          } catch {
            return { name: config.name, url: undefined };
          }
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
        thumbnailUrl: previewThumbnails['16:9'] || platformThumbs['twitter'] || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        platformThumbnails: platformThumbs,
        targetUrl,
        platforms: platformConfigs.map(c => ({ 
          name: c.name, 
          status: selectedPlatforms.includes(c.name) ? 'published' : 'draft' 
        })),
        status: 'published',
        createdAt: new Date().toISOString()
      };

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
        viralDescription: selectedClip.viralDescription,
        origin: 'promo'
      };

      setPromos(prev => [newPromo, ...prev]);
      setLinks(prev => [newLink, ...prev]);

      // Reset UI state
      setUrl('');
      setSuggestions([]);
      setSelectedClip(null);
      setTargetUrl('');
      setImages([]);
      setScript('');
      setIsNSFW(false);
      setPreviewThumbnails({});
      setThumbnailText('');
      
      alert("Success! Your campaign is live and the link has been added to your profile preview.");
    } catch (err) {
      console.error("Campaign deployment error:", err);
      alert("Campaign deployment encountered an error. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeploySingle = async (promoId: string, platformName: PlatformStatus['name']) => {
    const promo = promos.find(p => p.id === promoId);
    if (!promo) return;

    setPromos(prev => prev.map(p => 
      p.id === promoId ? { 
        ...p, 
        platforms: p.platforms.map(pl => pl.name === platformName ? { ...pl, status: 'publishing' } : pl) 
      } : p
    ));

    try {
      const config = [
        { name: 'tiktok', aspect: '9:16' },
        { name: 'instagram', aspect: '9:16' },
        { name: 'youtube_shorts', aspect: '9:16' },
        { name: 'facebook', aspect: '4:3' },
        { name: 'twitter', aspect: '16:9' }
      ].find(c => c.name === platformName);

      const thumb = await generateViralThumbnail(
        `${platformName} optimized: ${promo.viralTitle}`,
        promo.viralTitle.split(' ').slice(0, 3).join(' '),
        (config?.aspect || "16:9") as any
      );

      setPromos(prev => prev.map(p => 
        p.id === promoId ? { 
          ...p, 
          platformThumbnails: { ...p.platformThumbnails, [platformName]: thumb || '' },
          platforms: p.platforms.map(pl => pl.name === platformName ? { ...pl, status: 'published', publishedAt: new Date().toISOString() } : pl) 
        } : p
      ));

      alert(`Successfully deployed to ${platformName.replace('_', ' ')}!`);
    } catch (e) {
      console.error(e);
      setPromos(prev => prev.map(p => 
        p.id === promoId ? { 
          ...p, 
          platforms: p.platforms.map(pl => pl.name === platformName ? { ...pl, status: 'draft' } : pl) 
        } : p
      ));
    }
  };

  const handleDeployAllForPromo = async (promoId: string) => {
    const promo = promos.find(p => p.id === promoId);
    if (!promo) return;
    
    const draftPlatforms = promo.platforms.filter(pl => pl.status === 'draft').map(pl => pl.name);
    if (draftPlatforms.length === 0) {
      alert("All platforms already published!");
      return;
    }

    for (const pl of draftPlatforms) {
      await handleDeploySingle(promoId, pl as PlatformStatus['name']);
    }
  };

  const deletePromo = (id: string) => {
    if (!window.confirm("Delete this campaign?")) return;
    setPromos(prev => prev.filter(p => p.id !== id));
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const togglePlatformSelection = (name: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
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

  const PLATFORMS: PlatformStatus['name'][] = ['tiktok', 'instagram', 'youtube_shorts', 'twitter', 'facebook'];

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-10 animate-in fade-in duration-500 pb-20">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Smart Video Engine</h1>
            <p className="text-slate-500 font-medium mt-2">AI-powered viral clip extraction with live profile preview.</p>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
            <i className="fa-solid fa-bolt mr-2"></i> Pro Feature
          </div>
        </header>

        {/* Generation Stage */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Step 1: Content Source</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube link here..."
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-medium text-lg shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-indigo-900">Visual Hints</h4>
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
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {images.length === 0 && <p className="text-[10px] text-indigo-300 italic">No reference images added.</p>}
                {images.map((img, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                    <img src={img.data} className="w-full h-full object-cover" />
                    <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg text-[8px]"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
              <h4 className="font-bold text-slate-900">Scene Context</h4>
              <textarea 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="What's the main hook of this video?"
                className="w-full h-24 p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none resize-none shadow-inner"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {loading ? 'Finding Viral Moments...' : 'Extract Viral Highlights'}
          </button>

          {suggestions.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-8 animate-in slide-in-from-top-4 duration-500">
              <h3 className="text-xl font-bold">Recommended Viral Hooks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((clip) => (
                  <div 
                    key={clip.id} 
                    onClick={() => { setSelectedClip(clip); setPreviewThumbnails({}); }}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase">{clip.start}s - {clip.end}s</span>
                    </div>
                    <p className="font-black text-sm mb-2 leading-tight">"{clip.caption}"</p>
                    <p className="text-[10px] text-slate-500 italic line-clamp-2">"{clip.reasoning}"</p>
                  </div>
                ))}
              </div>

              {selectedClip && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                    <div className="lg:col-span-1 space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Viral Configuration</h4>
                      <div className="space-y-4">
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Headline</p>
                            <p className="font-black text-slate-900 leading-tight">{selectedClip.viralTitle}</p>
                         </div>
                         <input 
                          value={thumbnailText}
                          onChange={(e) => setThumbnailText(e.target.value)}
                          placeholder="Overlay Text"
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100"
                         />
                         <button 
                          onClick={generateThumbnails}
                          disabled={thumbnailLoading}
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                         >
                           {thumbnailLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
                           {thumbnailLoading ? 'Painting...' : 'Generate Previews'}
                         </button>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Asset Preview Logic</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase text-center">Standard (16:9)</p>
                            <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative shadow-inner border-2 border-slate-100">
                              {previewThumbnails['16:9'] ? (
                                <img src={previewThumbnails['16:9']} className="w-full h-full object-cover animate-in fade-in" alt="16:9" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                  <i className={`fa-solid ${thumbnailLoading ? 'fa-spinner fa-spin' : 'fa-image'} text-2xl`}></i>
                                </div>
                              )}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase text-center">Mobile (9:16)</p>
                            <div className="aspect-[9/16] h-48 bg-slate-200 rounded-2xl overflow-hidden relative mx-auto shadow-inner border-2 border-slate-100">
                              {previewThumbnails['9:16'] ? (
                                <img src={previewThumbnails['9:16']} className="w-full h-full object-cover animate-in fade-in" alt="9:16" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                  <i className={`fa-solid ${thumbnailLoading ? 'fa-spinner fa-spin' : 'fa-image'} text-2xl`}></i>
                                </div>
                              )}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6 shadow-xl border-t-4 border-t-indigo-600">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Deployment Platforms</label>
                      <div className="flex flex-wrap gap-3">
                        {PLATFORMS.map(p => (
                          <button
                            key={p}
                            onClick={() => togglePlatformSelection(p)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${
                              selectedPlatforms.includes(p) 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                : 'bg-white border-slate-200 text-slate-400 grayscale hover:grayscale-0'
                            }`}
                          >
                            <PlatformIcon name={p} />
                            {p.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monetization URL</label>
                      <input
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://your-shop.com/product"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-700 focus:bg-white transition-all"
                      />
                    </div>
                    <button 
                      onClick={handlePublish} 
                      disabled={isPublishing || selectedPlatforms.length === 0}
                      className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-tower-broadcast"></i>}
                      {isPublishing ? 'Orchestrating Campaign...' : 'Deploy To Selected Platforms'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Social Command Center List (History) */}
        <section className="space-y-8 pt-12">
          <div className="flex items-center justify-between">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Social Command Center</h2>
             <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">
               <i className="fa-solid fa-clock-rotate-left"></i> History ({promos.length})
             </div>
          </div>
          
          {promos.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300">
               <i className="fa-solid fa-hashtag text-6xl mb-6 opacity-10"></i>
               <p className="font-black uppercase tracking-[0.2em] text-xs">Ready for your first campaign</p>
            </div>
          ) : promos.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl group">
              <div className="flex flex-col xl:flex-row gap-8">
                <div className="w-full xl:w-64 shrink-0">
                  <div className="aspect-[9/16] bg-slate-900 rounded-[2rem] overflow-hidden relative border border-slate-100 shadow-lg group-hover:scale-[1.02] transition-transform">
                     <img 
                      src={p.platformThumbnails?.tiktok || p.thumbnailUrl || `https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} 
                      className="w-full h-full object-cover opacity-60" 
                      alt="Promo"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                         <i className="fa-solid fa-play text-white text-lg"></i>
                       </div>
                     </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black text-slate-900 truncate max-w-md">{p.viralTitle || "Viral Clip"}</h3>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeployAllForPromo(p.id)}
                            className="text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase"
                          >
                            Deploy All
                          </button>
                          <button onClick={() => deletePromo(p.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash"></i></button>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">CLIP: {p.clipStart}S-{p.clipEnd}S</span>
                      <a href={p.targetUrl} target="_blank" className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">{p.targetUrl?.replace('https://','')}</a>
                    </div>
                    <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50/50 p-4 rounded-xl">"{p.viralDescription || p.caption}"</p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Threads</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {p.platforms?.map(platform => {
                        const isPublishing = platform.status === 'publishing';
                        const isPublished = platform.status === 'published';
                        
                        return (
                          <button 
                            key={platform.name}
                            disabled={isPublishing}
                            onClick={() => {
                              if (!isPublished) handleDeploySingle(p.id, platform.name);
                              else { setActiveKitPromo(p); setKitPlatform(platform.name); }
                            }}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                              isPublished 
                                ? 'border-indigo-100 bg-indigo-50 text-indigo-600' 
                                : isPublishing 
                                  ? 'border-amber-100 bg-amber-50 text-amber-600 animate-pulse'
                                  : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-indigo-200'
                            }`}
                          >
                            <div className="text-lg"><PlatformIcon name={platform.name} /></div>
                            <span className="text-[8px] font-black uppercase">{platform.name?.replace('_', ' ')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Side Preview Window */}
      <div className="lg:w-[360px] hidden lg:block">
        <div className="sticky top-10 flex flex-col items-center gap-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            Live Profile Preview
          </div>
          <PreviewFrame profile={profile} links={links} />
        </div>
      </div>

      {/* Distribution Modal */}
      {activeKitPromo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setActiveKitPromo(null)}></div>
           <div className="relative bg-white w-full max-w-5xl max-h-full overflow-hidden rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Asset Distribution Kit</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-1">Multi-Aspect AI Optimization</p>
                 </div>
                 <button onClick={() => setActiveKitPromo(null)} className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-slate-400"></i>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar">
                 <div className="flex flex-wrap gap-2 mb-8 bg-slate-100/50 p-2 rounded-2xl border border-slate-200 mx-auto max-w-fit">
                    {activeKitPromo.platforms?.map(pl => (
                      <button 
                        key={pl.name}
                        onClick={() => setKitPlatform(pl.name)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          kitPlatform === pl.name ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white text-slate-400'
                        }`}
                      >
                        <PlatformIcon name={pl.name} />
                        {pl.name?.replace('_', ' ')}
                      </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-6">
                       <div className="bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl relative border-[12px] border-slate-900 ring-1 ring-slate-200/10">
                          <div className={`relative w-full ${getPlatformAspect(kitPlatform)} transition-all duration-700 overflow-hidden`}>
                             <img 
                              src={activeKitPromo.platformThumbnails?.[kitPlatform] || activeKitPromo.thumbnailUrl || `https://img.youtube.com/vi/${activeKitPromo.videoId}/hqdefault.jpg`} 
                              className="w-full h-full object-cover transition-all duration-500 animate-in fade-in" 
                              alt="Platform Thumbnail" 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                             <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                               <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform: {kitPlatform.toUpperCase()}</span>
                               </div>
                               <i className="fa-solid fa-clapperboard text-white/40"></i>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                             Download Master
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(activeKitPromo.targetUrl || '')}
                            className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                          >
                             <i className="fa-solid fa-link"></i>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized Headline</label>
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl leading-tight relative group">
                            {activeKitPromo.viralTitle || activeKitPromo.caption}
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralTitle || '')} className="absolute top-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"><i className="fa-solid fa-copy"></i></button>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Specific Copy</label>
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto relative group shadow-inner">
                            {activeKitPromo.viralDescription || activeKitPromo.caption}
                            <button onClick={() => navigator.clipboard.writeText(activeKitPromo.viralDescription || '')} className="absolute top-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"><i className="fa-solid fa-copy"></i></button>
                          </div>
                       </div>

                       <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4 shadow-sm">
                          <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-robot"></i> AI Intel</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                             {kitPlatform === 'facebook' 
                               ? 'Facebook News Feed prioritizes 4:3 and Square assets. Post this unique thumbnail to Community Groups for a 5x higher CTR.' 
                               : 'This asset is optimized for vertical scroll patterns. Ensure your bio link is the first item in the caption.'}
                          </p>
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
