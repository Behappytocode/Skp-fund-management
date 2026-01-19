import React, { useMemo, useState } from 'react';
import { AppState } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieIcon,
  CircleDollarSign,
  Users,
  Sparkles,
  Loader2
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

interface DashboardProps {
  state: AppState;
}

const formatCurrency = (val: number) => `Rs. ${Math.round(val).toLocaleString()}`;

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [insight, setInsight] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const totalDeposits = state.deposits.reduce((acc, d) => acc + d.amount, 0);
    const totalIssued = state.loans.reduce((acc, l) => acc + l.totalAmount, 0);
    const totalWaivers = state.loans.reduce((acc, l) => acc + l.waiverAmount, 0);
    const totalRecoveries = state.loans.reduce((acc, l) => {
      const paid = l.installments.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
      return acc + paid;
    }, 0);
    const currentBalance = totalDeposits - totalIssued + totalRecoveries;

    return {
      totalDeposits,
      totalIssued,
      totalWaivers,
      totalRecoveries,
      currentBalance,
      totalMembers: state.users.length
    };
  }, [state]);

  // AI Auditor using Gemini to provide financial health summary
  const generateInsight = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these community fund statistics:
          - Balance: ${stats.currentBalance}
          - Total Deposits: ${stats.totalDeposits}
          - Total Loans: ${stats.totalIssued}
          - Recoveries: ${stats.totalRecoveries}
          - Waivers: ${stats.totalWaivers}
          - Member Count: ${stats.totalMembers}
          
          Provide a professional 2-sentence financial health audit summary.`,
      });
      setInsight(response.text || "No insights generated.");
    } catch (err) {
      console.error('Gemini API Error:', err);
      setInsight("Unable to generate AI audit at this time.");
    } finally {
      setIsGenerating(false);
    }
  };

  const memberChartData = useMemo(() => {
    return state.users.map(u => {
      const userDeposits = state.deposits
        .filter(d => d.memberId === u.id)
        .reduce((sum, d) => sum + d.amount, 0);
      return { name: u.name, deposits: Math.round(userDeposits) };
    }).filter(m => m.deposits > 0);
  }, [state]);

  const loanRatioData = [
    { name: 'Recoveries', value: Math.round(stats.totalRecoveries) },
    { name: 'Waivers (30%)', value: Math.round(stats.totalWaivers) },
    { name: 'Outstanding', value: Math.round(stats.totalIssued - stats.totalRecoveries - stats.totalWaivers) }
  ].filter(d => d.value > 0);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <div className={`p-3 rounded-2xl ${color} mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-xl font-black mt-1 text-slate-900">{formatCurrency(value)}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Portfolio Status</h1>
        <p className="text-slate-500 text-sm mt-0.5">Automated fund tracking & audit overview.</p>
      </header>

      {/* AI Fund Auditor Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-indigo-200">Gemini Fund Auditor</h3>
            </div>
            <button 
              onClick={generateInsight}
              disabled={isGenerating}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analyze Fund'}
            </button>
          </div>
          {insight ? (
            <p className="text-indigo-100 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500 font-medium">
              {insight}
            </p>
          ) : (
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Click analyze for real-time financial health audit...</p>
          )}
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Balance" value={stats.currentBalance} icon={CircleDollarSign} color="bg-indigo-600" />
        <StatCard title="Total Deposits" value={stats.totalDeposits} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Total Loans" value={stats.totalIssued} icon={ArrowUpRight} color="bg-amber-500" />
        <StatCard title="Recoveries" value={stats.totalRecoveries} icon={ArrowDownRight} color="bg-blue-500" />
      </div>

      {/* Waiver Audit Summary */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-slate-200/50">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold">Waiver Audit Summary</h3>
          <p className="text-slate-400 text-xs mt-1">Total non-recoverable portion (30% Rule)</p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">Total Members</p>
            <p className="text-2xl font-black">{stats.totalMembers}</p>
          </div>
          <div className="text-center">
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.1em]">Waiver Total</p>
            <p className="text-2xl font-black text-amber-400">{formatCurrency(stats.totalWaivers)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Users className="text-indigo-600 w-5 h-5" /> Member Contributions
          </h2>
          <div className="h-64 w-full">
            {memberChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                  />
                  <Bar dataKey="deposits" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No deposits logged yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <PieIcon className="text-amber-500 w-5 h-5" /> Portfolio Mix
          </h2>
          <div className="h-64 w-full">
            {loanRatioData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanRatioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {loanRatioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No loan distributions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;