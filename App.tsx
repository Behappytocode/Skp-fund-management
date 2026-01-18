import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, User, UserRole, UserStatus, Deposit, Loan, LoanRequest } from './types.ts';
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

const INITIAL_DATA: AppState = {
  users: [
    { 
      id: '1', 
      name: 'Abubakar', 
      email: 'admin@fund.com', 
      role: UserRole.ADMIN, 
      status: UserStatus.APPROVED, 
      balance: 0,
      designation: 'Full Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop'
    }
  ],
  deposits: [],
  loans: [],
  loanRequests: [],
  currentUser: null
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fund_app_state');
    if (saved) {
      try {
        return JSON.parse(saved) as AppState;
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('fund_app_state', JSON.stringify(state));
  }, [state]);

  const login = (email: string, role: UserRole) => {
    const user = state.users.find(u => u.email === email && u.role === role);
    if (!user) return { success: false, message: 'Invalid credentials.' };
    
    if (user.status === UserStatus.PENDING) {
      return { success: false, message: 'Your account is pending admin approval.' };
    }
    if (user.status === UserStatus.REJECTED) {
      return { success: false, message: 'Your access request was declined.' };
    }

    setState(prev => ({ ...prev, currentUser: user }));
    return { success: true };
  };

  const logout = () => setState(prev => ({ ...prev, currentUser: null }));

  const signup = (name: string, email: string, role: UserRole) => {
    if (state.users.some(u => u.email === email)) return false;
    const status = role === UserRole.ADMIN ? UserStatus.APPROVED : UserStatus.PENDING;
    const newUser: User = { id: Date.now().toString(), name, email, role, status, balance: 0 };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    return true;
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (!state.currentUser) return;
    setState(prev => {
      const updatedUsers = prev.users.map(u => 
        u.id === prev.currentUser?.id ? { ...u, ...userData } : u
      );
      const updatedCurrentUser = { ...prev.currentUser, ...userData } as User;
      return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
    });
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status } : u)
    }));
  };

  const addDeposit = (deposit: Omit<Deposit, 'id' | 'entryDate'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: Date.now().toString(),
      entryDate: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      deposits: [newDeposit, ...prev.deposits]
    }));
  };

  const addLoanRequest = (amount: number, term: number) => {
    if (!state.currentUser) return;
    const newRequest: LoanRequest = {
      id: Date.now().toString(),
      memberId: state.currentUser.id,
      memberName: state.currentUser.name,
      amount,
      term,
      requestDate: new Date().toISOString(),
      status: 'PENDING'
    };
    setState(prev => ({
      ...prev,
      loanRequests: [newRequest, ...prev.loanRequests]
    }));
  };

  const updateLoanRequestStatus = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setState(prev => {
      const request = prev.loanRequests.find(r => r.id === requestId);
      if (!request || request.status !== 'PENDING') return prev;

      let newLoans = [...prev.loans];
      if (status === 'APPROVED') {
        const recoverableAmount = request.amount * 0.7;
        const waiverAmount = request.amount * 0.3;
        const monthlyAmount = recoverableAmount / request.term;
        
        const installments = Array.from({ length: request.term }).map((_, i) => {
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
          id: Date.now().toString(),
          memberId: request.memberId,
          memberName: request.memberName,
          totalAmount: request.amount,
          recoverableAmount,
          waiverAmount,
          term: request.term,
          installments,
          issuedDate: new Date().toISOString(),
          status: 'ACTIVE'
        };
        newLoans = [newLoan, ...newLoans];
      }

      return {
        ...prev,
        loans: newLoans,
        loanRequests: prev.loanRequests.map(r => r.id === requestId ? { ...r, status } : r)
      };
    });
  };

  const addLoan = (loanData: { memberId: string, amount: number, term: number }) => {
    const member = state.users.find(u => u.id === loanData.memberId);
    if (!member) return;

    const recoverableAmount = loanData.amount * 0.7;
    const waiverAmount = loanData.amount * 0.3;
    const monthlyAmount = recoverableAmount / loanData.term;
    
    const installments = Array.from({ length: loanData.term }).map((_, i) => {
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
      id: Date.now().toString(),
      memberId: loanData.memberId,
      memberName: member.name,
      totalAmount: loanData.amount,
      recoverableAmount,
      waiverAmount,
      term: loanData.term,
      installments,
      issuedDate: new Date().toISOString(),
      status: 'ACTIVE'
    };

    setState(prev => ({
      ...prev,
      loans: [newLoan, ...prev.loans]
    }));
  };

  const payInstallment = (loanId: string, installmentId: string) => {
    setState(prev => {
      const updatedLoans = prev.loans.map(loan => {
        if (loan.id === loanId) {
          const updatedInstallments = loan.installments.map(inst => 
            inst.id === installmentId ? { ...inst, status: 'PAID' as const, paidDate: new Date().toISOString() } : inst
          );
          const allPaid = updatedInstallments.every(i => i.status === 'PAID');
          return { ...loan, installments: updatedInstallments, status: allPaid ? 'COMPLETED' as const : 'ACTIVE' as const };
        }
        return loan;
      });
      return { ...prev, loans: updatedLoans };
    });
  };

  const backupData = () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency_fund_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const restoreData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setState(data);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

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
              <Route path="deposits" element={<DepositManager state={state} onAdd={addDeposit} />} />
              <Route path="loans" element={<LoanManager state={state} onAdd={addLoan} onPay={payInstallment} onBackup={backupData} onRestore={restoreData} />} />
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