import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Entry({ onRoleSelect }) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-teal-600">TeachPivot</h1>
          <p className="text-xs text-gray-500">Prep smarter, pivot faster</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLanguageChange(i18n.language === 'en' ? 'es' : 'en')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
          >
            {i18n.language === 'en' ? 'EN' : 'ES'}
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition text-lg">
            ⚙️
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-12">I am a...</h2>
        
        <div className="w-full max-w-sm space-y-4">
          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="w-full flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition duration-200 group"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl group-hover:bg-teal-200 transition">
              🎓
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">Teacher</h3>
              <p className="text-sm text-gray-600">Prepare for your next class</p>
            </div>
          </button>

          {/* CRP Card */}
          <button
            onClick={() => handleRoleSelect('crp')}
            className="w-full flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition duration-200 group"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl group-hover:bg-orange-200 transition">
              📋
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">CRP / ARP</h3>
              <p className="text-sm text-gray-600">View teacher insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}