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
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-center z-50">
          📡 You're offline - app uses cached data
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

      {/* Home button in top-left (visible after entry) */}
      {currentPage !== 'entry' && (
        <button
          onClick={handleResetFlow}
          className="fixed top-4 left-4 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 z-40"
          title="Home"
        >
          🏠
        </button>
      )}
    </div>
  );
}

export default App;