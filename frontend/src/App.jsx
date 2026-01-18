import { useState, useEffect } from 'react';
import Entry from './pages/Entry';
import ContextSelection from './pages/ContextSelection';
import SituationSelection from './pages/SituationSelection';
import PrepCardPage from './pages/PrepCardPage';
import CRPDashboard from './pages/CRPDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('entry');
  const [role, setRole] = useState('');
  const [context, setContext] = useState(null);
  const [situation, setSituation] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => setOffline(false));
    window.addEventListener('offline', () => setOffline(true));
    return () => {
      window.removeEventListener('online', () => setOffline(false));
      window.removeEventListener('offline', () => setOffline(true));
    };
  }, []);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'crp') {
      setCurrentPage('crpDashboard');
    } else {
      setCurrentPage('contextSelection');
    }
  };

  const handleContextSelect = (selectedContext) => {
    setContext(selectedContext);
    setCurrentPage('situationSelection');
  };

  const handleSituationSelect = (selectedSituation) => {
    setSituation(selectedSituation);
    setCurrentPage('prepCard');
  };

  const handleBack = () => {
    if (currentPage === 'prepCard') {
      setCurrentPage('situationSelection');
    } else if (currentPage === 'situationSelection') {
      setCurrentPage('contextSelection');
    } else if (currentPage === 'contextSelection') {
      setCurrentPage('entry');
      setRole('');
      setContext(null);
      setSituation(null);
    }
  };

  const handleResetFlow = () => {
    setCurrentPage('entry');
    setRole('');
    setContext(null);
    setSituation(null);
  };

  return (
    <div className="relative">
      {offline && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 text-center z-50 shadow-lg animate-slide-down flex items-center justify-center gap-3">
          <span className="text-xl animate-bounce">📡</span>
          <span className="font-medium">You're offline - app uses cached data</span>
        </div>
      )}

      {currentPage === 'entry' && <Entry onRoleSelect={handleRoleSelect} />}
      {currentPage === 'contextSelection' && (
        <ContextSelection onContextSelect={handleContextSelect} />
      )}
      {currentPage === 'situationSelection' && context && (
        <SituationSelection context={context} onSituationSelect={handleSituationSelect} onBack={handleBack} />
      )}
      {currentPage === 'prepCard' && context && situation && (
        <PrepCardPage context={context} situation={situation} onBack={handleBack} />
      )}
      {currentPage === 'crpDashboard' && <CRPDashboard />}

      {/* Gorgeous home button */}
      {currentPage !== 'entry' && (
        <button
          onClick={handleResetFlow}
          className="fixed top-4 left-4 group z-40"
          title="Home"
        >
          <div className="relative w-12 h-12 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:bg-gradient-to-br group-hover:from-violet-100 group-hover:to-purple-100 overflow-hidden">
            <span className="relative z-10 group-hover:scale-110 transition-transform">🏠</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/10 rounded-full blur-sm group-hover:w-10 transition-all"></div>
        </button>
      )}
    </div>
  );
}

export default App;