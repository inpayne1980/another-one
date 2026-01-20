
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', views: 400, clicks: 240 },
  { name: 'Tue', views: 300, clicks: 139 },
  { name: 'Wed', views: 200, clicks: 980 },
  { name: 'Thu', views: 278, clicks: 390 },
  { name: 'Fri', views: 189, clicks: 480 },
  { name: 'Sat', views: 239, clicks: 380 },
  { name: 'Sun', views: 349, clicks: 430 },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Views</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">2,451</h3>
          <span className="text-green-500 text-xs font-bold flex items-center gap-1 mt-2">
            <i className="fa-solid fa-arrow-up"></i>
            12% vs last week
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Clicks</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">1,084</h3>
          <span className="text-green-500 text-xs font-bold flex items-center gap-1 mt-2">
            <i className="fa-solid fa-arrow-up"></i>
            8% vs last week
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Average CTR</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">44.2%</h3>
          <span className="text-red-500 text-xs font-bold flex items-center gap-1 mt-2">
            <i className="fa-solid fa-arrow-down"></i>
            2% vs last week
          </span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-8 text-gray-800">Traffic Overview</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="clicks" fill="#c7d2fe" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Top Performing Links</h2>
        <div className="space-y-4">
          {[
            { label: 'YouTube Latest', clicks: 450, change: '+15%' },
            { label: 'Portfolio Website', clicks: 320, change: '+5%' },
            { label: 'Newsletter Signup', clicks: 214, change: '-2%' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="font-semibold text-gray-700">{item.label}</span>
              <div className="flex items-center gap-6">
                <span className="font-bold text-gray-900">{item.clicks} clicks</span>
                <span className={`text-xs font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
