
import React, { useMemo, useState } from 'react';
import { AppState, User } from '../../types';
import { CreditCard, CheckCircle2, AlertCircle, Plus, ChevronRight, Clock, HandCoins } from 'lucide-react';

interface MemberLoansProps {
  state: AppState;
  user: User;
  onLoanRequest: (amount: number, term: number) => void;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const MemberLoans: React.FC<MemberLoansProps> = ({ state, user, onLoanRequest }) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(6);

  const myLoans = useMemo(() => state.loans.filter(l => l.memberId === user.id), [state, user]);
  const myRequests = useMemo(() => state.loanRequests?.filter(r => r.memberId === user.id) || [], [state, user]);
  
  const activeLoan = myLoans.find(l => l.status === 'ACTIVE');
  const remainingDebt = activeLoan 
    ? activeLoan.recoverableAmount - activeLoan.installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onLoanRequest(parseFloat(amount), term);
    setShowModal(false);
    setAmount('');
    setTerm(6);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Loan Portal</h1>
          <p className="text-slate-500 text-sm">Emergency fund requests & repayment details.</p>
        </div>
        {!activeLoan && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Request Loan
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><CreditCard className="w-6 h-6" /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pending Debt</p>
            <h2 className="text-2xl font-black text-slate-900">{formatCurrency(remainingDebt)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          {activeLoan ? (
            <>
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Next Due</p>
                <h2 className="text-xl font-black text-slate-900">
                  {formatCurrency(activeLoan.installments.find(i => i.status === 'PENDING')?.amount || 0)}
                </h2>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status</p>
                <h2 className="text-xl font-black text-emerald-600 italic">No Active Dues</h2>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
              <Clock className="text-amber-500 w-4 h-4" /> Loan Applications
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {myRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(r.amount)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{r.term} Months • {new Date(r.requestDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                        r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                        r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myRequests.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-400 italic text-sm">No recent applications.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
            <HandCoins className="text-amber-500 w-4 h-4" /> Repayment Plan
          </h3>
          {activeLoan ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Debt</p>
                  <p className="text-lg font-black">{formatCurrency(activeLoan.recoverableAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Grant (30%)</p>
                  <p className="text-lg font-black text-emerald-500">{formatCurrency(activeLoan.waiverAmount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {activeLoan.installments.map((inst, i) => (
                  <div key={inst.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${inst.status === 'PAID' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Inst. {i + 1}</p>
                      <p className={`text-xs font-black ${inst.status === 'PAID' ? 'text-emerald-700' : 'text-slate-700'}`}>{formatCurrency(inst.amount)}</p>
                    </div>
                    {inst.status === 'PAID' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-300">
              <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
              <p className="italic text-xs font-bold uppercase tracking-widest">No active loans</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">Request Loan</h2>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (Rs.)</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Term (Months)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTerm(m)}
                      className={`py-3 rounded-2xl text-xs font-black transition-all ${
                        term === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold text-center leading-relaxed italic">
                  * Loans are subject to 70/30 rule (70% recovery, 30% grant).
                </p>
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2">
                Submit Request <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberLoans;
