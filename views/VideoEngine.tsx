
import React, { useState, useRef, useEffect } from 'react';
import { getClipSuggestions, generateViralThumbnail } from '../services/geminiService';
import { PromoData, ClipSuggestion, Link } from '../types';

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
      platforms: ['youtube_shorts', 'tiktok', 'instagram_reels'],
      status: 'published'
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
      type: 'standard',
      isHeroVideo: true,
      isFeatured: true,
      isNSFW: isNSFW,
      thumbnailUrl: thumbnailUrl,
      viralDescription: selectedClip.viralDescription
    };

    localStorage.setItem('lp_links', JSON.stringify([newLink, ...links]));

    setUrl('');
    setSuggestions([]);
    setSelectedClip(null);
    setTargetUrl('');
    setImages([]);
    setScript('');
    setIsNSFW(false);
    setThumbnailUrl(undefined);
    setThumbnailText('');
    
    alert("Campaign launched with AI-generated viral assets!");
  };

  const deletePromo = (id: string) => {
    const updatedPromos = promos.filter(p => p.id !== id);
    setPromos(updatedPromos);
    
    const savedLinks = localStorage.getItem('lp_links');
    if (savedLinks) {
      const links: Link[] = JSON.parse(savedLinks);
      localStorage.setItem('lp_links', JSON.stringify(links.filter(l => l.id !== id)));
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
                
                {/* Viral Package Display */}
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
                          <p className="text-[8px] text-slate-400 mt-2 font-medium">Tip: Use short, punchy words for better visual impact.</p>
                        </div>
                        <button 
                          onClick={generateThumbnail}
                          disabled={thumbnailLoading}
                          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          {thumbnailLoading ? (
                             <span className="flex items-center justify-center gap-2">
                               <i className="fa-solid fa-circle-notch fa-spin"></i>
                               AI Generating...
                             </span>
                          ) : 'Generate AI Viral Thumbnail'}
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
                      placeholder="Destination URL (e.g. Affiliate/Store Link)"
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
                  <button onClick={handlePublish} className="w-full mt-4 bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <i className="fa-solid fa-paper-plane"></i>
                    Deploy Full Viral Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Campaign History</h2>
        {promos.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <i className="fa-solid fa-clapperboard text-slate-200 text-5xl mb-4"></i>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active video campaigns</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:shadow-md transition-all">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden relative shrink-0 shadow-inner">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <i className="fa-solid fa-play text-white text-[10px]"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate mb-1">{p.viralTitle || p.caption}</p>
                  <p className="text-xs font-bold text-indigo-600 truncate underline decoration-indigo-200">{p.targetUrl}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[8px] font-black bg-indigo-50 text-indigo-400 px-2 py-1 rounded-md uppercase tracking-wider">Campaign Active</span>
                  </div>
                </div>
                <button onClick={() => deletePromo(p.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VideoEngine;
