
import React from 'react';
import { AppState, UserRole, UserStatus } from '../../types';
import { Users, Mail, User as UserIcon, ShieldCheck, Code } from 'lucide-react';

interface MemberCircleProps {
  state: AppState;
}

const MemberCircle: React.FC<MemberCircleProps> = ({ state }) => {
  const members = state.users.filter(u => u.status === UserStatus.APPROVED);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Circle Members</h1>
        <p className="text-slate-500 text-sm">Active community members and staff.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((u) => (
          <div 
            key={u.id} 
            className={`bg-white rounded-[2.5rem] p-6 border transition-all hover:shadow-xl group relative overflow-hidden ${
              u.name === 'Abubakar' ? 'border-indigo-400 shadow-indigo-100 shadow-2xl' : 'border-slate-200 shadow-sm'
            }`}
          >
            {u.name === 'Abubakar' && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] z-10">
                Main Developer
              </div>
            )}
            
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 overflow-hidden transition-transform group-hover:scale-105 duration-500 ${
                  u.name === 'Abubakar' ? 'border-indigo-100 bg-indigo-50' : 'border-slate-100 bg-slate-50'
                }`}>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                  ) : u.role === UserRole.ADMIN ? (
                    <ShieldCheck className="w-10 h-10 text-amber-500" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                {u.name === 'Abubakar' && (
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-xl text-white border-4 border-white shadow-lg">
                    <Code className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">{u.name}</h3>
                {u.designation ? (
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">{u.designation}</p>
                ) : (
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{u.role}</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl w-full justify-center">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{u.email}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberCircle;
