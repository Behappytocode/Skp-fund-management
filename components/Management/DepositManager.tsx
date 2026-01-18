
import React, { useState } from 'react';
import { AppState, Deposit, UserRole } from '../../types';
import { Plus, Search, Image as ImageIcon, FileText } from 'lucide-react';

interface DepositManagerProps {
  state: AppState;
  onAdd: (deposit: Omit<Deposit, 'id' | 'entryDate'>) => void;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const DepositManager: React.FC<DepositManagerProps> = ({ state, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    receiptImage: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = state.users.find(u => u.id === formData.memberId);
    if (!member || !formData.amount) return;

    onAdd({
      memberId: formData.memberId,
      memberName: member.name,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      description: formData.description,
      notes: formData.notes,
      receiptImage: formData.receiptImage
    });

    setShowModal(false);
    setFormData({ 
      memberId: '', 
      amount: '', 
      paymentDate: new Date().toISOString().split('T')[0], 
      description: '', 
      notes: '', 
      receiptImage: '' 
    });
  };

  const filteredDeposits = state.deposits.filter(d => 
    d.memberName.toLowerCase().includes(search.toLowerCase()) || 
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Contributions</h1>
          <p className="text-slate-500 text-sm">Logged history of monthly deposits.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Log Payment
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by name or description..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member & Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{d.memberName}</div>
                    {d.description && (
                      <div className="text-[11px] text-slate-600 font-medium italic mt-0.5 line-clamp-1">
                        {d.description}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-medium">{new Date(d.paymentDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-sm">{formatCurrency(d.amount)}</td>
                  <td className="px-6 py-4">
                    {d.receiptImage ? (
                      <button 
                        onClick={() => window.open(d.receiptImage)}
                        className="bg-indigo-50 text-indigo-600 p-2 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDeposits.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-400 italic text-sm">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">Log Contribution</h2>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Member</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={formData.memberId}
                  onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                >
                  <option value="">Select Member</option>
                  {state.users.filter(u => u.role === UserRole.MEMBER).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (Rs.)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  rows={2}
                  placeholder="e.g. Monthly contribution for March 2024"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Evidence (Receipt)</label>
                <div className="relative flex items-center justify-center w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-indigo-400 transition-all group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {formData.receiptImage ? (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-5 h-5 text-emerald-500 mb-1" />
                      <span className="text-[10px] text-emerald-600 font-black uppercase">Attached!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Tap to Upload</span>
                    </div>
                  )}
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-2 uppercase tracking-widest">
                Confirm Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositManager;
