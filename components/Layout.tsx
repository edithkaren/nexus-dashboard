
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types.ts';
import { authService } from '../services/authService.ts';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive(to) 
          ? 'bg-indigo-800 text-white' 
          : 'text-indigo-100 hover:bg-white/5'
      }`}
    >
      <i className={`fas ${icon} ${isActive(to) ? 'text-indigo-300' : 'text-indigo-400'}`}></i>
      <span className={isActive(to) ? 'font-medium' : ''}>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-900 text-white">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <i className="fas fa-cube text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">NEXUS</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem to="/dashboard" icon="fa-th-large" label="Dashboard" />
          <NavItem to="/dashboard" icon="fa-tasks" label="My Tasks" />
          <NavItem to="#" icon="fa-chart-line" label="Analytics" />
          <NavItem to="#" icon="fa-users" label="Team" />
          <NavItem to="#" icon="fa-cog" label="Settings" />
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-500" alt="Profile" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-500"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg text-sm transition-all outline-none text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <i className="far fa-bell text-xl"></i>
            </button>
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <i className="far fa-envelope text-xl"></i>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="md:hidden">
                <img src={user.avatar} className="w-8 h-8 rounded-full" alt="Profile" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
           <aside className="w-64 h-full bg-indigo-900 text-white" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 flex items-center justify-between">
               <span className="text-xl font-bold">NEXUS</span>
               <button onClick={() => setIsMobileMenuOpen(false)}><i className="fas fa-times"></i></button>
             </div>
             <nav className="px-4 py-4 space-y-1">
                <NavItem to="/dashboard" icon="fa-th-large" label="Dashboard" />
                <NavItem to="/dashboard" icon="fa-tasks" label="My Tasks" />
             </nav>
           </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;
