
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { Handshake, Mail, User, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SignupProps {
  onSignup: (name: string, email: string, role: UserRole) => boolean;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.MEMBER });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onSignup(formData.name, formData.email, formData.role);
    if (success) {
      alert('Account created! Please log in.');
      navigate('/login');
    } else {
      setError('Email already exists or registration failed.');
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
              <label className="block text-sm font-bold text-slate-700 mb-2">I am registering as...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: UserRole.MEMBER})}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${formData.role === UserRole.MEMBER ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  Regular Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${formData.role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  Fund Manager
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              Create My Account <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already a member? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;