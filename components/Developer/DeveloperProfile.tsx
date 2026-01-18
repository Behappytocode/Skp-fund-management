
import React from 'react';
import { AppState } from '../../types';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink,
  Heart,
  Code
} from 'lucide-react';

interface DeveloperProfileProps {
  state: AppState;
}

const DeveloperProfile: React.FC<DeveloperProfileProps> = ({ state }) => {
  const dev = state.users.find(u => u.name === 'Abubakar');
  
  const techStack = [
    "REACT 19",
    "NODE.JS",
    "TYPESCRIPT",
    "TAILWIND CSS",
    "GEMINI AI",
    "RECHARTS"
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Profile Header Section */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        {/* Banner */}
        <div className="h-32 bg-indigo-600 relative flex items-center justify-end px-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex justify-center items-center pointer-events-none">
            <Code className="w-64 h-64 -rotate-12" />
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 blur-2xl absolute top-4 right-10"></div>
          <div className="w-24 h-24 rounded-full bg-white/5 blur-3xl absolute -bottom-10 left-20"></div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-12 -mt-16 flex flex-col items-center">
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-[6px] border-[#90B542] overflow-hidden bg-white shadow-xl relative z-10">
              <img 
                src={dev?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop'} 
                alt="Abubakar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="mt-8 text-center space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Abubakar</h1>
            <p className="text-[#90B542] font-black uppercase tracking-[0.25em] text-sm">Full Stack Developer</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 mt-10">
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:admin@fund.com" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all">
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Bio Text */}
          <div className="mt-12 max-w-xl text-center space-y-6">
            <p className="text-slate-600 leading-relaxed font-medium">
              I'm Abubakar, the developer behind this Fund Manager platform. I am a Full Stack Developer dedicated to building robust, scalable applications that simplify community management and financial coordination.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              With deep expertise in React and the MERN stack, I've designed this system to provide maximum transparency with a mobile-first philosophy.
            </p>
          </div>

          {/* Tech Stack Chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-10">
            {techStack.map((tech) => (
              <span 
                key={tech} 
                className="bg-[#1C212E] text-white px-5 py-2.5 rounded-full text-[11px] font-black tracking-widest"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA Card */}
      <div className="bg-[#111827] rounded-[3rem] p-10 md:p-14 text-white text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Open for opportunities</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Have a project in mind?</h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Contact me for custom web development, UI/UX optimization, or full-stack software architecture.
        </p>
        <div className="pt-6">
          <button className="bg-[#90B542] hover:bg-[#7a9a38] text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 mx-auto transition-all shadow-xl shadow-[#90B542]/20">
            Contact Abubakar <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;
