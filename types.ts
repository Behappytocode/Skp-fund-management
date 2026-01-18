
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  avatar?: string;
  designation?: string;
}

export interface Deposit {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  entryDate: string;
  receiptImage?: string;
  notes?: string;
  description?: string;
}

export interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID';
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  totalAmount: number;
  recoverableAmount: number; // 70%
  waiverAmount: number;      // 30%
  term: number;              // months
  installments: Installment[];
  issuedDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface LoanRequest {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  term: number;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AppState {
  users: User[];
  deposits: Deposit[];
  loans: Loan[];
  loanRequests: LoanRequest[];
  currentUser: User | null;
}
