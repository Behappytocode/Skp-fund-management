
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../../types';
import { Camera, Save, User as UserIcon, Mail, ShieldCheck, Briefcase } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [designation, setDesignation] = useState(user.designation || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      designation: designation || undefined,
      avatar: avatar || undefined
    });
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm">Update your personal identity in the circle.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 p-8 sm:p-12 border border-slate-100">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div 
                onClick={handleAvatarClick}
                className="w-40 h-40 rounded-[3rem] bg-slate-50 border-4 border-slate-100 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all duration-300 shadow-inner flex items-center justify-center"
              >
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-3 rounded-2xl text-white shadow-lg border-4 border-white">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tap image to change photo</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email (Read-Only)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  disabled
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed opacity-60 font-medium text-slate-500"
                  value={user.email}
                />
              </div>
            </div>

            {user.role === UserRole.ADMIN && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Professional Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Developer"
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
