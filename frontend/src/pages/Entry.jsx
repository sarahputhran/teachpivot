import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Entry({ onRoleSelect }) {
  const { t } = useTranslation();

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
  };

  useEffect(() => {
    // Check if animation has played this session
    const hasPlayed = sessionStorage.getItem('teachpivot_intro_played');
    if (!hasPlayed) {
      setTimeout(() => {
        sessionStorage.setItem('teachpivot_intro_played', 'true');
      }, 1500);
    }
  }, []);

  const hasPlayed = sessionStorage.getItem('teachpivot_intro_played');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-teal-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob w-96 h-96 bg-gradient-to-r from-pink-300 to-purple-400 top-0 -left-48 opacity-40"></div>
      <div className="blob w-80 h-80 bg-gradient-to-r from-teal-300 to-cyan-400 bottom-20 -right-40 opacity-40" style={{ animationDelay: '-3s' }}></div>
      <div className="blob w-64 h-64 bg-gradient-to-r from-yellow-200 to-orange-300 top-1/3 right-1/4 opacity-30" style={{ animationDelay: '-5s' }}></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6">
        <div className="flex items-center gap-3 animate-pivot-entrance origin-center" style={{ animationDuration: '4s' }}>
          {/* Logo Removed per user request */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient-teal drop-shadow-sm">
              TeachPivot
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium ml-1">Prep smarter, pivot faster</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 sm:px-6 py-12">
        <div className="animate-slide-down w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 text-center">
            I am a<span className="text-gradient">...</span>
          </h2>
          <p className="text-gray-500 text-center mb-8 sm:mb-12 text-base sm:text-lg">Choose your role to get started</p>
        </div>

        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="stagger-item w-full group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-teal-400 shadow-xl hover:shadow-2xl hover:shadow-teal-200 transition-all duration-500 card-hover"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-5 p-6">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-teal-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 icon-float">
                🎓
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors">Teacher</h3>
                <p className="text-gray-500 mt-1">Prepare for your next class</p>
              </div>
              <div className="text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-2xl">
                →
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-teal-400 to-emerald-500 group-hover:w-full transition-all duration-500"></div>
          </button>

          {/* CRP Card */}
          <button
            onClick={() => handleRoleSelect('crp')}
            className="stagger-item w-full group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-orange-400 shadow-xl hover:shadow-2xl hover:shadow-orange-200 transition-all duration-500 card-hover"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-5 p-6">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-orange-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 icon-float" style={{ animationDelay: '-1.5s' }}>
                📋
              </div>
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors">CRP / ARP</h3>
                <p className="text-gray-500 mt-1">View teacher insights</p>
              </div>
              <div className="text-orange-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-2xl">
                →
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-400 to-pink-500 group-hover:w-full transition-all duration-500"></div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}