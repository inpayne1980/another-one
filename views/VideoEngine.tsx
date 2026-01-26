
import React, { useState, useRef, useEffect } from 'react';
import { getClipSuggestions } from '../services/geminiService';
import { PromoData, ClipSuggestion, Link } from '../types';

const VideoEngine: React.FC = () => {
  const [url, setUrl] = useState('');
  const [script, setScript] = useState('');
  const [images, setImages] = useState<{data: string, mimeType: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ClipSuggestion[]>([]);
  const [selectedClip, setSelectedClip] = useState<ClipSuggestion | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
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
      if (results.length > 0) setSelectedClip(results[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      targetUrl,
      platforms: ['youtube_shorts', 'tiktok', 'instagram_reels'],
      status: 'published'
    };

    // Add to specific promos collection
    const updatedPromos = [newPromo, ...promos];
    setPromos(updatedPromos);
    localStorage.setItem('lp_promos', JSON.stringify(updatedPromos));

    // ALSO: Create a corresponding entry in the main links collection so it shows in Dashboard/Appearance
    const savedLinks = localStorage.getItem('lp_links');
    const links: Link[] = savedLinks ? JSON.parse(savedLinks) : [];
    
    const newLink: Link = {
      id: promoId, // Share the same ID to link them easily
      title: selectedClip.caption,
      url: targetUrl,
      active: true,
      clicks: 0,
      type: 'standard',
      isHeroVideo: true,
      isFeatured: true
    };

    localStorage.setItem('lp_links', JSON.stringify([newLink, ...links]));

    // Reset form
    setUrl('');
    setSuggestions([]);
    setSelectedClip(null);
    setTargetUrl('');
    setImages([]);
    setScript('');
    
    alert("Campaign launched! Video is now live on your profile.");
  };

  const deletePromo = (id: string) => {
    const updatedPromos = promos.filter(p => p.id !== id);
    setPromos(updatedPromos);
    
    // Also remove from links
    const savedLinks = localStorage.getItem('lp_links');
    if (savedLinks) {
      const links: Link[] = JSON.parse(savedLinks);
      localStorage.setItem('lp_links', JSON.stringify(links.filter(l => l.id !== id)));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Smart Video Engine</h1>
          <p className="text-slate-500 font-medium mt-2">AI-powered viral clip extraction & shoppable integration.</p>
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
              placeholder="Paste transcript or key takeaways for higher AI conversion accuracy..."
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
          {loading ? 'AI Analyzing Multimodal Assets...' : 'Generate Shoppable Clips'}
        </button>

        {suggestions.length > 0 && (
          <div className="pt-8 border-t border-slate-100 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
               Select Winning Segment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((clip) => (
                <div 
                  key={clip.id} 
                  onClick={() => setSelectedClip(clip)}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <p className="text-xs font-black text-indigo-600 uppercase mb-2">{clip.start}s - {clip.end}s</p>
                  <p className="font-bold text-sm mb-2 leading-tight">"{clip.caption}"</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{clip.reasoning}</p>
                </div>
              ))}
            </div>

            {selectedClip && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300 p-6 bg-slate-50 rounded-3xl">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Step 3: Shoppable Destination URL</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yourstore.com/viral-product"
                    className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm font-medium"
                  />
                  <button onClick={handlePublish} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">Launch Campaign</button>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">The promo will be pinned to your links and cross-posted to socials.</p>
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
                  <img src={`https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <i className="fa-solid fa-play text-white text-[10px]"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate mb-1">{p.caption}</p>
                  <p className="text-xs font-bold text-indigo-600 truncate underline decoration-indigo-200">{p.targetUrl}</p>
                  <div className="flex gap-2 mt-3">
                    {p.platforms.map(plt => <span key={plt} className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">{plt.split('_')[0]}</span>)}
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
