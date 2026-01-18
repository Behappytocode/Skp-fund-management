
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserRole, UserStatus, AppState } from '../../types';
import { 
  LayoutDashboard, 
  Wallet, 
  HandCoins, 
  History, 
  LogOut, 
  Handshake,
  UserCheck,
  Users,
  Code
} from 'lucide-react';

interface LayoutProps {
  state: AppState;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ state, onLogout }) => {
  const location = useLocation();
  const user = state.currentUser!;
  const isAdmin = user.role === UserRole.ADMIN;

  const pendingMemberCount = state.users.filter(u => u.status === UserStatus.PENDING).length;
  const pendingLoanCount = state.loanRequests?.filter(r => r.status === 'PENDING').length || 0;
  const totalPending = pendingMemberCount + pendingLoanCount;

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/', roles: [UserRole.ADMIN, UserRole.MEMBER] },
    { label: 'Deposits', icon: Wallet, path: '/deposits', roles: [UserRole.ADMIN] },
    { label: 'Loans', icon: isAdmin ? HandCoins : HandCoins, path: isAdmin ? '/loans' : '/my-loans', roles: [UserRole.ADMIN, UserRole.MEMBER] },
    { label: 'Inbox', icon: UserCheck, path: '/requests', roles: [UserRole.ADMIN], badge: totalPending },
    { label: 'Circle', icon: Users, path: '/circle', roles: [UserRole.MEMBER] },
    { label: 'Dev', icon: Code, path: '/developer', roles: [UserRole.ADMIN, UserRole.MEMBER] },
    { label: 'History', icon: History, path: '/my-history', roles: [UserRole.MEMBER] },
  ].filter(item => item.roles.includes(user.role));

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Handshake className="w-8 h-8 text-indigo-600" />
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">SKP Fund Management</h1>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] -mt-0.5">Fellowship that Stands in Crisis</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="flex items-center gap-3 group transition-all">
            <div className="hidden sm:flex flex-col items-end group-hover:opacity-70 transition-opacity">
              <span className="text-xs font-bold text-slate-900">{user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase font-medium leading-none">{user.designation || user.role}</span>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-indigo-400 shadow-sm flex items-center justify-center transition-all">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 font-black text-xs">{user.name.charAt(0)}</div>
              )}
            </div>
          </Link>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-2 py-3 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 min-w-[56px] transition-all relative ${
              isActive(item.path) 
                ? 'text-indigo-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${isActive(item.path) ? 'bg-indigo-50' : ''}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-0 right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[1.1rem] text-center border-2 border-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;