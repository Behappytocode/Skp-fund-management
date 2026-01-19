
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AppState, User, UserRole, UserStatus, Deposit, Loan, LoanRequest, Installment } from './types.ts';
import Login from './components/Auth/Login.tsx';
import Signup from './components/Auth/Signup.tsx';
import Layout from './components/Layout/Layout.tsx';
import Dashboard from './components/Dashboard/Dashboard.tsx';
import DepositManager from './components/Management/DepositManager.tsx';
import LoanManager from './components/Management/LoanManager.tsx';
import MemberRequests from './components/Management/MemberRequests.tsx';
import MemberHistory from './components/Member/MemberHistory.tsx';
import MemberLoans from './components/Member/MemberLoans.tsx';
import MemberCircle from './components/Member/MemberCircle.tsx';
import DeveloperProfile from './components/Developer/DeveloperProfile.tsx';
import UserProfile from './components/Profile/UserProfile.tsx';

/**
 * Access environment variables via process.env as per platform guidelines. 
 * On Vercel, ensure these are added in Project Settings > Environment Variables.
 */
// Fix: Use process.env instead of import.meta.env to resolve TypeScript property access errors
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
// Fix: Use process.env instead of import.meta.env to resolve TypeScript property access errors
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. App may not function correctly.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data Mapping Helpers (SQL snake_case to JS camelCase)
const mapDeposit = (d: any): Deposit => ({
  id: d.id,
  memberId: d.member_id,
  memberName: d.member_name,
  amount: Number(d.amount),
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
  recoverableAmount: Number(l.recoverable_amount),
  waiverAmount: Number(l.waiver_amount),
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
    if (!SUPABASE_URL) {
      setLoading(false);
      return;
    }
    try {
      const [
        { data: users },
        { data: deposits },
        { data: loans },
        { data: loanRequests }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('deposits').select('*').order('entry_date', { ascending: false }),
        supabase.from('loans').select('*').order('issued_date', { ascending: false }),
        supabase.from('loan_requests').select('*').order('request_date', { ascending: false })
      ]);

      setState(prev => ({
        ...prev,
        users: (users || []) as User[],
        deposits: (deposits || []).map(mapDeposit),
        loans: (loans || []).map(mapLoan),
        loanRequests: (loanRequests || []).map(mapLoanRequest)
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (!SUPABASE_URL) return;

    const channels = [
      supabase.channel('users-all').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData).subscribe(),
      supabase.channel('deposits-all').on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, fetchData).subscribe(),
      supabase.channel('loans-all').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData).subscribe(),
      supabase.channel('requests-all').on('postgres_changes', { event: '*', schema: 'public', table: 'loan_requests' }, fetchData).subscribe(),
    ];

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [fetchData]);

  const login = (email: string, role: UserRole) => {
    const user = state.users.find(u => u.email === email && u.role === role);
    if (!user) return { success: false, message: 'Invalid credentials.' };
    if (user.status === UserStatus.PENDING) return { success: false, message: 'Your account is pending approval.' };
    if (user.status === UserStatus.REJECTED) return { success: false, message: 'Your access request was declined.' };

    setState(prev => ({ ...prev, currentUser: user }));
    localStorage.setItem('fund_app_session', JSON.stringify(user));
    return { success: true };
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('fund_app_session');
    if (savedUser) {
      try {
        setState(prev => ({ ...prev, currentUser: JSON.parse(savedUser) }));
      } catch (e) {
        localStorage.removeItem('fund_app_session');
      }
    }
  }, []);

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    localStorage.removeItem('fund_app_session');
  };

  const signup = async (name: string, email: string, role: UserRole) => {
    if (state.users.some(u => u.email === email)) return false;
    const status = role === UserRole.ADMIN ? UserStatus.APPROVED : UserStatus.PENDING;
    const newUser: User = { id: Date.now().toString(), name, email, role, status, balance: 0 };
    const { error } = await supabase.from('users').insert([newUser]);
    return !error;
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!state.currentUser) return;
    const { error } = await supabase.from('users').update(userData).eq('id', state.currentUser.id);
    if (!error) {
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, ...userData } : null
      }));
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    await supabase.from('users').update({ status }).eq('id', userId);
  };

  const addDeposit = async (deposit: Omit<Deposit, 'id' | 'entryDate'>) => {
    const dbDeposit = {
      id: Date.now().toString(),
      member_id: deposit.memberId,
      member_name: deposit.memberName,
      amount: deposit.amount,
      payment_date: deposit.paymentDate,
      description: deposit.description,
      notes: deposit.notes,
      receipt_image: deposit.receiptImage,
      entry_date: new Date().toISOString()
    };
    await supabase.from('deposits').insert([dbDeposit]);
  };

  const updateDeposit = async (updatedDeposit: Deposit) => {
    const dbDeposit = {
      member_id: updatedDeposit.memberId,
      member_name: updatedDeposit.memberName,
      amount: updatedDeposit.amount,
      payment_date: updatedDeposit.paymentDate,
      description: updatedDeposit.description,
      notes: updatedDeposit.notes,
      receipt_image: updatedDeposit.receiptImage
    };
    await supabase.from('deposits').update(dbDeposit).eq('id', updatedDeposit.id);
  };

  const deleteDeposit = async (id: string) => {
    await supabase.from('deposits').delete().eq('id', id);
  };

  const addLoanRequest = async (amount: number, term: number) => {
    if (!state.currentUser) return;
    const dbRequest = {
      id: Date.now().toString(),
      member_id: state.currentUser.id,
      member_name: state.currentUser.name,
      amount,
      term,
      request_date: new Date().toISOString(),
      status: 'PENDING'
    };
    await supabase.from('loan_requests').insert([dbRequest]);
  };

  const updateLoanRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const request = state.loanRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'PENDING') return;

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
          status: 'PENDING' as const
        };
      });

      const dbLoan = {
        id: Date.now().toString(),
        member_id: request.memberId,
        member_name: request.memberName,
        total_amount: request.amount,
        recoverable_amount: recoverableAmount,
        waiver_amount: waiverAmount,
        term: request.term,
        installments,
        issued_date: new Date().toISOString(),
        status: 'ACTIVE'
      };

      await supabase.from('loans').insert([dbLoan]);
    }

    await supabase.from('loan_requests').update({ status }).eq('id', requestId);
  };

  const addLoan = async (loanData: { memberId: string, amount: number, term: number }) => {
    const member = state.users.find(u => u.id === loanData.memberId);
    if (!member) return;

    const recoverableAmount = loanData.amount * 0.7;
    const waiverAmount = loanData.amount * 0.3;
    const monthlyAmount = recoverableAmount / loanData.term;
    
    const installments: Installment[] = Array.from({ length: loanData.term }).map((_, i) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        id: `inst-${Date.now()}-${i}`,
        amount: Number(monthlyAmount.toFixed(2)),
        dueDate: dueDate.toISOString(),
        status: 'PENDING' as const
      };
    });

    const dbLoan = {
      id: Date.now().toString(),
      member_id: loanData.memberId,
      member_name: member.name,
      total_amount: loanData.amount,
      recoverable_amount: recoverableAmount,
      waiver_amount: waiverAmount,
      term: loanData.term,
      installments,
      issued_date: new Date().toISOString(),
      status: 'ACTIVE'
    };

    await supabase.from('loans').insert([dbLoan]);
  };

  const updateLoan = async (loanId: string, loanData: { amount: number, term: number }) => {
    const existingLoan = state.loans.find(l => l.id === loanId);
    if (!existingLoan) return;

    const recoverableAmount = loanData.amount * 0.7;
    const waiverAmount = loanData.amount * 0.3;
    const monthlyAmount = recoverableAmount / loanData.term;

    const installments: Installment[] = Array.from({ length: loanData.term }).map((_, i) => {
      const dueDate = new Date(existingLoan.issuedDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        id: `inst-${Date.now()}-${i}`,
        amount: Number(monthlyAmount.toFixed(2)),
        dueDate: dueDate.toISOString(),
        status: 'PENDING' as const
      };
    });

    await supabase.from('loans').update({
      total_amount: loanData.amount,
      recoverable_amount: recoverableAmount,
      waiver_amount: waiverAmount,
      term: loanData.term,
      installments
    }).eq('id', loanId);
  };

  const deleteLoan = async (id: string) => {
    await supabase.from('loans').delete().eq('id', id);
  };

  const payInstallment = async (loanId: string, installmentId: string) => {
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedInstallments = loan.installments.map(inst => 
      inst.id === installmentId ? { ...inst, status: 'PAID' as const, paidDate: new Date().toISOString() } : inst
    );
    const allPaid = updatedInstallments.every(i => i.status === 'PAID');
    
    await supabase.from('loans').update({ 
      installments: updatedInstallments, 
      status: allPaid ? 'COMPLETED' : 'ACTIVE' 
    }).eq('id', loanId);
  };

  const backupData = () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skp_fund_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const restoreData = async (file: File) => {
    alert('For security, bulk restore is handled via the Supabase Dashboard SQL editor.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Fellowship Data...</p>
        </div>
      </div>
    );
  }

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
              <Route path="deposits" element={
                <DepositManager 
                  state={state} 
                  onAdd={addDeposit} 
                  onUpdate={updateDeposit}
                  onDelete={deleteDeposit}
                />
              } />
              <Route path="loans" element={
                <LoanManager 
                  state={state} 
                  onAdd={addLoan} 
                  onUpdate={updateLoan}
                  onDelete={deleteLoan}
                  onPay={payInstallment} 
                  onBackup={backupData} 
                  onRestore={restoreData} 
                />
              } />
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
