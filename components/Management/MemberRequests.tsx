
import React, { useState } from 'react';
import { AppState, UserStatus, UserRole, LoanRequest } from '../../types';
import { Check, X, Clock, Mail, User as UserIcon, HandCoins, UserPlus } from 'lucide-react';

interface MemberRequestsProps {
  state: AppState;
  onUpdateStatus: (userId: string, status: UserStatus) => void;
  onUpdateLoanRequest: (requestId: string, status: 'APPROVED' | 'REJECTED') => void;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const MemberRequests: React.FC<MemberRequestsProps> = ({ state, onUpdateStatus, onUpdateLoanRequest }) => {
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'LOANS'>('MEMBERS');
  const pendingUsers = state.users.filter(u => u.status === UserStatus.PENDING);
  const pendingLoans = state.loanRequests?.filter(r => r.status === 'PENDING') || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Inbox</h1>
        <p className="text-slate-500 text-sm">Review applications and fund requests.</p>
      </header>

      <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem]">
        <button 
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'MEMBERS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Signups ({pendingUsers.length})
        </button>
        <button 
          onClick={() => setActiveTab('LOANS')}
          className={`flex-1 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'LOANS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <HandCoins className="w-3.5 h-3.5" /> Loan Req ({pendingLoans.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'MEMBERS' ? (
          <>
            {pendingUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-slate-900 truncate">{u.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase truncate">
                      <Mail className="w-3 h-3" /> {u.email}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdateStatus(u.id, UserStatus.APPROVED)}
                    className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onUpdateStatus(u.id, UserStatus.REJECTED)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && <EmptyState text="No pending signup requests." />}
          </>
        ) : (
          <>
            {pendingLoans.map((r) => (
              <div key={r.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <HandCoins className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-slate-900 truncate">{r.memberName}</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(r.requestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-indigo-600">{formatCurrency(r.amount)}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">/ {r.term} Months</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdateLoanRequest(r.id, 'APPROVED')}
                    className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Authorize
                  </button>
                  <button
                    onClick={() => onUpdateLoanRequest(r.id, 'REJECTED')}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingLoans.length === 0 && <EmptyState text="No pending loan applications." />}
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Historical Log</h2>
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Final Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'MEMBERS' ? (
                  // Fixed UserStatus.PEND typo to UserStatus.PENDING below
                  state.users.filter(u => u.status !== UserStatus.PENDING && u.email !== 'admin@fund.com').map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{u.role}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                          u.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  (state.loanRequests || []).filter(r => r.status !== 'PENDING').map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{r.memberName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{formatCurrency(r.amount)} ({r.term}M)</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                          r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm">
    <Clock className="w-12 h-12 mb-3 opacity-20" />
    <p className="text-xs font-black uppercase tracking-widest italic">{text}</p>
  </div>
);

export default MemberRequests;
