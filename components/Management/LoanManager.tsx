import React, { useState } from 'react';
import { AppState, UserRole, Loan } from '../../types';
import { 
  Plus, Search, ShieldCheck, ChevronRight, 
  Download, Upload, Calculator, Clock, CreditCard,
  Edit3, Trash2, X
} from 'lucide-react';

interface LoanManagerProps {
  state: AppState;
  onAdd: (data: { memberId: string, amount: number, term: number }) => void;
  onUpdate: (id: string, data: { amount: number, term: number }) => void;
  onDelete: (id: string) => void;
  onPay: (loanId: string, installmentId: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const LoanManager: React.FC<LoanManagerProps> = ({ state, onAdd, onUpdate, onDelete, onPay, onBackup, onRestore }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    term: 6
  });

  const handleEdit = (loan: Loan) => {
    setEditingId(loan.id);
    setFormData({
      memberId: loan.memberId,
      amount: loan.totalAmount.toString(),
      term: loan.term
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this loan? Repayment history will be lost.')) {
      onDelete(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount) return;
    
    if (editingId) {
      onUpdate(editingId, {
        amount: parseFloat(formData.amount),
        term: formData.term
      });
    } else {
      onAdd({
        memberId: formData.memberId,
        amount: parseFloat(formData.amount),
        term: formData.term
      });
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ memberId: '', amount: '', term: 6 });
  };

  const filteredLoans = state.loans.filter(l => 
    l.status === activeTab && l.memberName.toLowerCase().includes(search.toLowerCase())
  );

  const calculatePreview = () => {
    const amt = parseFloat(formData.amount) || 0;
    const recoverable = amt * 0.7;
    const waiver = amt * 0.3;
    const monthly = recoverable / formData.term;
    return { recoverable, waiver, monthly };
  };

  const preview = calculatePreview();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Loan Engine</h1>
          <p className="text-slate-500 text-sm">Automated 70/30 split management.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onBackup}
            className="flex-1 sm:flex-none p-3 text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-5 h-5 mx-auto" />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex-[3] sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            New Loan
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem]">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex-1 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Completed
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search member..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLoans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-lg transition-all relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => handleEdit(loan)}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                title="Amend Loan"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(loan.id)}
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                title="Delete Loan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{loan.memberName}</h3>
                  <div className="flex gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      <Clock className="w-3 h-3" /> {new Date(loan.issuedDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      <CreditCard className="w-3 h-3" /> {loan.term} Months
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-0.5 tracking-tighter">Net Debt (70%)</p>
                <p className="text-lg font-black text-indigo-600">{formatCurrency(loan.recoverableAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Installments</h4>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {loan.installments.filter(i => i.status === 'PAID').length} / {loan.term}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {loan.installments.map((inst, idx) => (
                    <button 
                      key={inst.id}
                      disabled={inst.status === 'PAID'}
                      onClick={() => onPay(loan.id, inst.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        inst.status === 'PAID' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 opacity-60' 
                        : 'bg-white border-slate-100 hover:border-indigo-300'
                      }`}
                    >
                      <p className="text-[8px] font-black uppercase mb-0.5">M{idx + 1}</p>
                      <p className="text-[10px] font-black">{Math.round(inst.amount)}</p>
                      {inst.status === 'PAID' ? <ShieldCheck className="w-2.5 h-2.5 mx-auto mt-0.5" /> : <div className="h-2.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>Recovery Progress</span>
                    <span className="text-indigo-600">{Math.round((loan.installments.filter(i => i.status === 'PAID').length / loan.term) * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: `${(loan.installments.filter(i => i.status === 'PAID').length / loan.term) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">Outstanding</p>
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(loan.recoverableAmount - loan.installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-amber-500 font-black uppercase">Waiver (Gift)</p>
                    <p className="text-sm font-black text-amber-500">{formatCurrency(loan.waiverAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLoans.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <Calculator className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest italic">No active records.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">{editingId ? 'Amend Emergency Loan' : 'Issue Emergency Loan'}</h2>
              <button onClick={closeModal} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row">
              <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 border-b md:border-b-0 md:border-r border-slate-100">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center sm:text-left">Member</label>
                  <select 
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    value={formData.memberId}
                    onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                    disabled={!!editingId}
                  >
                    <option value="">Choose Recipient</option>
                    {state.users.filter(u => u.role === UserRole.MEMBER).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center sm:text-left">Total Amount (Rs.)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    placeholder="Enter full amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center sm:text-left">Term (Months)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[6, 8, 10, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData({...formData, term: m})}
                        className={`py-3 rounded-2xl text-xs font-black transition-all ${
                          formData.term === m 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2">
                  {editingId ? 'Update Loan' : 'Verify & Issue'} <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              
              <div className="w-full md:w-64 p-8 bg-slate-50 flex flex-col justify-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recoverable (70%)</p>
                  <p className="text-2xl font-black text-indigo-600">{formatCurrency(preview.recoverable)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Permanent Waiver (30%)</p>
                  <p className="text-2xl font-black text-amber-500">{formatCurrency(preview.waiver)}</p>
                </div>
                <div className="text-center border-t border-slate-200 pt-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Cost</p>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(preview.monthly)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManager;