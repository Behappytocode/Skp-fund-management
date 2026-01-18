
import React, { useMemo } from 'react';
import { AppState, User } from '../../types';
import { History, Wallet } from 'lucide-react';

interface MemberHistoryProps {
  state: AppState;
  user: User;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const MemberHistory: React.FC<MemberHistoryProps> = ({ state, user }) => {
  const myDeposits = useMemo(() => state.deposits.filter(d => d.memberId === user.id), [state, user]);
  const totalDeposited = myDeposits.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Deposit History</h1>
        <p className="text-slate-500 text-sm">Review your contribution records.</p>
      </header>

      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-2xl"><Wallet className="w-6 h-6" /></div>
        <div>
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Total Contribution</p>
          <h2 className="text-2xl font-black">{formatCurrency(totalDeposited)}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
            <History className="text-indigo-600 w-4 h-4" /> All Deposits
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {myDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(d.amount)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(d.paymentDate).toLocaleDateString()}</p>
                    {d.description && <p className="text-[10px] text-slate-500 italic mt-0.5">{d.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {d.receiptImage && (
                      <button onClick={() => window.open(d.receiptImage)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">View Receipt</button>
                    )}
                  </td>
                </tr>
              ))}
              {myDeposits.length === 0 && (
                <tr>
                  <td className="px-6 py-20 text-center text-slate-400 italic text-sm">No deposits logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberHistory;
