
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, User, UserRole, UserStatus, Deposit, Loan, LoanRequest, Installment } from './types';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import DepositManager from './components/Management/DepositManager';
import LoanManager from './components/Management/LoanManager';
import MemberRequests from './components/Management/MemberRequests';
import MemberHistory from './components/Member/MemberHistory';
import MemberLoans from './components/Member/MemberLoans';
import MemberCircle from './components/Member/MemberCircle';
import DeveloperProfile from './components/Developer/DeveloperProfile';
import UserProfile from './components/Profile/UserProfile';

// Robust environment variable access for Vite/Vercel
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (process.env as any)?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (process.env as any)?.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase only if keys exist
const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Data Mapping Helpers
const mapDeposit = (d: any): Deposit => ({
  id: d.id,
  memberId: d.member_id,
  memberName: d.member_name,
  amount: Number(d.amount),
  // Fix: changed payment_date to paymentDate to match Deposit interface defined in types.ts
  paymentDate: d.payment_date,
  entryDate: d.entry_date,
  receiptImage: d.receipt_image,
  notes: d.notes,
  description: d.description
});

const mapLoan = (l: any): Loan => ({
  id: l.id,
  memberId: l.member_id,
  memberName: l.member_name,
  totalAmount: Number(l.total_amount),
  recoverableAmount: Number(l.recoverable_amount || 0),
  waiverAmount: Number(l.waiver_amount || 0),
  term: l.term,
  installments: l.installments,
  issuedDate: l.issued_date,
  status: l.status as 'ACTIVE' | 'COMPLETED'
});

const mapLoanRequest = (r: any): LoanRequest => ({
  id: r.id,
  memberId: r.member_id,
  memberName: r.member_name,
  amount: Number(r.amount),
  term: r.term,
  requestDate: r.request_date,
  status: r.status as 'PENDING' | 'APPROVED' | 'REJECTED'
});

const INITIAL_STATE: AppState = {
  users: [],
  deposits: [],
  loans: [],
  loanRequests: [],
  currentUser: null
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    try {
      const [uRes, dRes, lRes, rRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('deposits').select('*').order('entry_date', { ascending: false }),
        supabase.from('loans').select('*').order('issued_date', { ascending: false }),
        supabase.from('loan_requests').select('*').order('request_date', { ascending: false })
      ]);

      setState(prev => ({
        ...prev,
        users: (uRes.data || []) as User[],
        deposits: (dRes.data || []).map(mapDeposit),
        loans: (lRes.data || []).map(mapLoan),
        loanRequests: (rRes.data || []).map(mapLoanRequest)
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      fetchData();
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    const saved = localStorage.getItem('fund_app_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setState(prev => ({ ...prev, currentUser: user }));
      } catch (e) {
        localStorage.removeItem('fund_app_session');
      }
    }
  }, []);

  const login = (email: string, role: UserRole) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (!user) return { success: false, message: 'User not found. Ensure role matches.' };
    if (user.status === UserStatus.PENDING) return { success: false, message: 'Account pending approval.' };
    if (user.status === UserStatus.REJECTED) return { success: false, message: 'Account rejected.' };

    setState(prev => ({ ...prev, currentUser: user }));
    localStorage.setItem('fund_app_session', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    localStorage.removeItem('fund_app_session');
  };

  const signup = async (name: string, email: string, role: UserRole) => {
    if (!supabase) return false;
    const status = role === UserRole.ADMIN ? UserStatus.APPROVED : UserStatus.PENDING;
    const { error } = await supabase.from('users').insert([{
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role,
      status,
      balance: 0
    }]);
    return !error;
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!state.currentUser || !supabase) return;
    await supabase.from('users').update(userData).eq('id', state.currentUser.id);
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    if (!supabase) return;
    await supabase.from('users').update({ status }).eq('id', userId);
  };

  const addDeposit = async (deposit: Omit<Deposit, 'id' | 'entryDate'>) => {
    if (!supabase) return;
    await supabase.from('deposits').insert([{
      id: `dep-${Date.now()}`,
      member_id: deposit.memberId,
      member_name: deposit.memberName,
      amount: deposit.amount,
      payment_date: deposit.paymentDate,
      description: deposit.description,
      notes: deposit.notes,
      receipt_image: deposit.receiptImage
    }]);
  };

  const updateDeposit = async (d: Deposit) => {
    if (!supabase) return;
    await supabase.from('deposits').update({
      amount: d.amount,
      payment_date: d.paymentDate,
      description: d.description,
      notes: d.notes,
      // Fix: Access receiptImage property instead of receipt_image which is not in the interface
      receipt_image: d.receiptImage
    }).eq('id', d.id);
  };

  const deleteDeposit = async (id: string) => {
    if (!supabase) return;
    await supabase.from('deposits').delete().eq('id', id);
  };

  const addLoanRequest = async (amount: number, term: number) => {
    if (!state.currentUser || !supabase) return;
    await supabase.from('loan_requests').insert([{
      id: `req-${Date.now()}`,
      member_id: state.currentUser.id,
      member_name: state.currentUser.name,
      amount,
      term,
      status: 'PENDING'
    }]);
  };

  const updateLoanRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!supabase) return;
    const request = state.loanRequests.find(r => r.id === requestId);
    if (!request) return;

    if (status === 'APPROVED') {
      const recoverableAmount = request.amount * 0.7;
      const waiverAmount = request.amount * 0.3;
      const monthlyAmount = recoverableAmount / request.term;
      
      const installments: Installment[] = Array.from({ length: request.term }).map((_, i) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          id: `inst-${Date.now()}-${i}`,
          amount: Number(monthlyAmount.toFixed(2)),
          dueDate: dueDate.toISOString(),
          status: 'PENDING'
        };
      });

      await supabase.from('loans').insert([{
        id: `loan-${Date.now()}`,
        member_id: request.memberId,
        member_name: request.memberName,
        total_amount: request.amount,
        recoverable_amount: recoverableAmount,
        waiver_amount: waiverAmount,
        term: request.term,
        installments,
        status: 'ACTIVE'
      }]);
    }
    await supabase.from('loan_requests').update({ status }).eq('id', requestId);
  };

  const payInstallment = async (loanId: string, installmentId: string) => {
    if (!supabase) return;
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedInstallments = loan.installments.map(inst => 
      inst.id === installmentId ? { ...inst, status: 'PAID', paidDate: new Date().toISOString() } : inst
    );
    const allPaid = updatedInstallments.every(i => i.status === 'PAID');
    
    await supabase.from('loans').update({ 
      installments: updatedInstallments, 
      status: allPaid ? 'COMPLETED' : 'ACTIVE' 
    }).eq('id', loanId);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Configuration Required</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Please add your <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your Vercel Environment Variables.
          </p>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 p-3 rounded-xl">Missing database keys</div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Connecting to Supabase...</p>
      </div>
    </div>
  );

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={state.currentUser ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/signup" element={state.currentUser ? <Navigate to="/" /> : <Signup onSignup={signup} />} />
        
        <Route path="/" element={state.currentUser ? <Layout state={state} onLogout={logout} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard state={state} />} />
          <Route path="developer" element={<DeveloperProfile state={state} />} />
          <Route path="profile" element={<UserProfile user={state.currentUser!} onUpdate={updateUserProfile} />} />
          
          {isAdmin ? (
            <>
              <Route path="deposits" element={<DepositManager state={state} onAdd={addDeposit} onUpdate={updateDeposit} onDelete={deleteDeposit} />} />
              <Route path="loans" element={<LoanManager state={state} onAdd={() => {}} onUpdate={() => {}} onDelete={() => {}} onPay={payInstallment} onBackup={() => {}} onRestore={() => {}} />} />
              <Route path="requests" element={<MemberRequests state={state} onUpdateStatus={updateUserStatus} onUpdateLoanRequest={updateLoanRequestStatus} />} />
            </>
          ) : (
            <>
              <Route path="my-loans" element={<MemberLoans state={state} user={state.currentUser!} onLoanRequest={addLoanRequest} />} />
              <Route path="circle" element={<MemberCircle state={state} />} />
              <Route path="my-history" element={<MemberHistory state={state} user={state.currentUser!} />} />
            </>
          )}
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
