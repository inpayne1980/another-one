
import React from 'react';
import { NavLink } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  username: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, username }) => {
  const navItems = [
    { icon: 'fa-link', label: 'Links', path: '/' },
    { icon: 'fa-video', label: 'Smart Promos', path: '/video-engine' },
    { icon: 'fa-palette', label: 'Appearance', path: '/appearance' },
    { icon: 'fa-chart-line', label: 'Analytics', path: '/analytics' },
    { icon: 'fa-gear', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col fixed h-full hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">vendo.bio</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Your Live Link</p>
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <span className="text-sm font-semibold truncate text-indigo-600">vendo.bio/{username}</span>
            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
              <i className="fa-solid fa-copy"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`
            }
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
