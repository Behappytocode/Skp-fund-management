import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
 * Replit Database Interface
 * This implementation assumes a simple Express/Node proxy on Replit to access the DB.
 * For production sync, we store the entire state as one JSON blob for simplicity in a small circle.
 */
const DB_KEY = 'skp_fund_state_v1';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<number>(0);

  // Load state from Replit Database
  const loadState = useCallback(async () => {
    try {
      const response = await fetch(`/api/db?key=${DB_KEY}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setState(prev => ({
            ...data,
            currentUser: prev.currentUser // Preserve local login session
          }));
        }
      }
    } catch (error) {
      console.error('Replit DB Load Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save state to Replit Database
  const saveState = useCallback(async (newState: AppState) => {
    setIsSyncing(true);
    try {
      // Don't save the currentUser to the cloud database
      const dataToSave = { ...newState, currentUser: null };
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: DB_KEY, value: dataToSave })
      });
      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Replit DB Save Error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial load and Polling for sync across devices (every 5 seconds)
  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [loadState]);

  // Handle User Auth locally with cloud backup
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
        const parsed = JSON.parse(savedUser);
        setState(prev => ({ ...prev, currentUser: parsed }));
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
    const newUser: User = { 
      id: `usr-${Date.now()}`, 
      name, 
      email, 
      role, 
      status, 
      balance: 0 
    };
    
    const newState = { ...state, users: [...state.users, newUser] };
    setState(newState);
    await saveState(newState);
    return true;
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!state.currentUser) return;
    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser?.id ? { ...u, ...userData } : u
    );
    const newState = { 
      ...state, 
      users: updatedUsers,
      currentUser: { ...state.currentUser, ...userData }
    };
    setState(newState);
    await saveState(newState);
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    const updatedUsers = state.users.map(u => u.id === userId ? { ...u, status } : u);
    const newState = { ...state, users: updatedUsers };
    setState(newState);
    await saveState(newState);
  };

  const addDeposit = async (deposit: Omit<Deposit, 'id' | 'entryDate'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: `dep-${Date.now()}`,
      entryDate: new Date().toISOString()
    };
    const newState = { ...state, deposits: [newDeposit, ...state.deposits] };
    setState(newState);
    await saveState(newState);
  };

  const updateDeposit = async (updatedDeposit: Deposit) => {
    const updatedDeposits = state.deposits.map(d => d.id === updatedDeposit.id ? updatedDeposit : d);
    const newState = { ...state, deposits: updatedDeposits };
    setState(newState);
    await saveState(newState);
  };

  const deleteDeposit = async (id: string) => {
    const newState = { ...state, deposits: state.deposits.filter(d => d.id !== id) };
    setState(newState);
    await saveState(newState);
  };

  const addLoanRequest = async (amount: number, term: number) => {
    if (!state.currentUser) return;
    const newRequest: LoanRequest = {
      id: `req-${Date.now()}`,
      memberId: state.currentUser.id,
      memberName: state.currentUser.name,
      amount,
      term,
      requestDate: new Date().toISOString(),
      status: 'PENDING'
    };
    const newState = { ...state, loanRequests: [newRequest, ...(state.loanRequests || [])] };
    setState(newState);
    await saveState(newState);
  };

  const updateLoanRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const request = state.loanRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'PENDING') return;

    let updatedLoans = [...state.loans];

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

      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        memberId: request.memberId,
        memberName: request.memberName,
        totalAmount: request.amount,
        recoverableAmount: recoverableAmount,
        waiverAmount: waiverAmount,
        term: request.term,
        installments,
        issuedDate: new Date().toISOString(),
        status: 'ACTIVE'
      };
      updatedLoans = [newLoan, ...updatedLoans];
    }

    const updatedRequests = state.loanRequests.map(r => r.id === requestId ? { ...r, status } : r);
    const newState = { ...state, loanRequests: updatedRequests, loans: updatedLoans };
    setState(newState);
    await saveState(newState);
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

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      memberId: loanData.memberId,
      memberName: member.name,
      totalAmount: loanData.amount,
      recoverableAmount: recoverableAmount,
      waiverAmount: waiverAmount,
      term: loanData.term,
      installments,
      issuedDate: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const newState = { ...state, loans: [newLoan, ...state.loans] };
    setState(newState);
    await saveState(newState);
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

    const updatedLoans = state.loans.map(l => l.id === loanId ? {
      ...l,
      totalAmount: loanData.amount,
      recoverableAmount,
      waiverAmount,
      term: loanData.term,
      installments
    } : l);

    const newState = { ...state, loans: updatedLoans };
    setState(newState);
    await saveState(newState);
  };

  const deleteLoan = async (id: string) => {
    const newState = { ...state, loans: state.loans.filter(l => l.id !== id) };
    setState(newState);
    await saveState(newState);
  };

  const payInstallment = async (loanId: string, installmentId: string) => {
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedInstallments = loan.installments.map(inst => 
      inst.id === installmentId ? { ...inst, status: 'PAID' as const, paidDate: new Date().toISOString() } : inst
    );
    const allPaid = updatedInstallments.every(i => i.status === 'PAID');
    
    const updatedLoans = state.loans.map(l => l.id === loanId ? {
      ...l,
      installments: updatedInstallments,
      status: allPaid ? 'COMPLETED' : 'ACTIVE'
    } : l);

    const newState = { ...state, loans: updatedLoans };
    setState(newState);
    await saveState(newState);
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
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const restoredState = JSON.parse(e.target?.result as string);
        setState({ ...restoredState, currentUser: state.currentUser });
        await saveState(restoredState);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Replit Cloud...</p>
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
          <Route index element={
            <div className="relative">
              {isSyncing && (
                <div className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Syncing...</span>
                </div>
              )}
              <Dashboard state={state} />
            </div>
          } />
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