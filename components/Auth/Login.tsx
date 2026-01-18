
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { Handshake, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (email: string, role: UserRole) => { success: boolean, message?: string };
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(email, role);
    if (!result.success) {
      setError(result.message || 'Invalid credentials or role selection.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-6">
            <Handshake className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SKP Fund Management</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Fellowship that Stands in Crisis</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Access Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.MEMBER)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${role === UserRole.MEMBER ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  Circle Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${role === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  Fund Manager
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className={`p-4 rounded-2xl text-sm font-bold text-center ${
                error.includes('pending') ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {error}
              </div>
            )}

            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200">
              Sign In to Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              New to the circle? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Join Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;