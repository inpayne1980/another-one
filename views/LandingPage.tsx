
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <span className="text-2xl font-black tracking-tighter">vendo.bio</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="px-6 py-2 font-bold hover:text-indigo-600 transition-colors">Login</button>
          <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100">Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
          One Link to <span className="text-indigo-600">Rule Your Brand.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
          The only link-in-bio platform with built-in AI copywriting, e-commerce storefronts, and predictive analytics. 
          Built for creators who mean business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/')} 
            className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
          >
            Start Your Free Page
          </button>
          <div className="flex -space-x-3 items-center">
            {[1, 2, 3, 4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-4 border-white" alt="user" />
            ))}
            <span className="ml-6 text-sm font-bold text-gray-500">Joined by 10,000+ creators</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">AI Copilot</h3>
              <p className="text-gray-500 leading-relaxed">Let Gemini optimize your bio and suggest high-converting links based on your social presence.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <i className="fa-solid fa-cart-shopping text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Storefronts</h3>
              <p className="text-gray-500 leading-relaxed">Sell digital products, merch, or services directly from your link without sending users away.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <i className="fa-solid fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Predictive Analytics</h3>
              <p className="text-gray-500 leading-relaxed">Go beyond simple clicks. See when your audience is most active and where they drop off.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500">Start for free, upgrade when you're ready to scale.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-100 p-10 rounded-3xl bg-white hover:border-indigo-600 transition-all cursor-default">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-4">Starter</h4>
            <div className="text-5xl font-black mb-6">$0<span className="text-lg text-gray-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-10 text-gray-600">
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Unlimited Links</li>
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Basic Analytics</li>
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> 3 Standard Themes</li>
            </ul>
            <button className="w-full py-4 rounded-xl border-2 border-gray-100 font-bold hover:bg-gray-50">Free Forever</button>
          </div>
          <div className="border-4 border-indigo-600 p-10 rounded-3xl bg-white relative">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>
            <h4 className="font-bold text-indigo-600 uppercase tracking-widest text-xs mb-4">Pro</h4>
            <div className="text-5xl font-black mb-6">$9<span className="text-lg text-gray-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-10 text-gray-600">
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Everything in Starter</li>
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> AI Copilot Features</li>
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> E-commerce Integration</li>
              <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Custom Domains</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all">Get Pro Now</button>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-lg">
              <i className="fa-solid fa-bolt text-white text-lg"></i>
            </div>
            <span className="text-xl font-black tracking-tighter">vendo.bio</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
            <a href="#" className="hover:text-white">API</a>
          </div>
          <div className="text-gray-500 text-sm">
            © 2025 vendo.bio Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
