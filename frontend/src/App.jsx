import { useState, useEffect } from 'react';
import Entry from './pages/Entry';
import ContextSelection from './pages/ContextSelection';
import SituationSelection from './pages/SituationSelection';
import PrepCardPage from './pages/PrepCardPage';
import PrepHistoryPage from './pages/PrepHistoryPage';
import CRPDashboard from './pages/CRPDashboard';
import { setUserRole } from './api';
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

    // Handle browser back button (Phase D requirement: "Browser back does not break state")
    const handlePopState = (event) => {
      // Logic to sync browser back with internal state
      if (currentPage === 'prepCard') {
        setCurrentPage('situationSelection');
      } else if (currentPage === 'situationSelection') {
        setCurrentPage('contextSelection');
      } else if (currentPage === 'prepHistory') {
        setCurrentPage('entry');
      } else if (currentPage === 'contextSelection') {
        setCurrentPage('entry');
        setRole('');
        setUserRole(null);
        setContext(null);
        setSituation(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push state when page changes so back button has something to pop
    if (currentPage !== 'entry') {
      window.history.pushState({ page: currentPage }, '', `/${currentPage}`);
    }

    return () => {
      window.removeEventListener('online', () => setOffline(false));
      window.removeEventListener('offline', () => setOffline(true));
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPage]);

  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === 'crp') {
      const code = prompt("Enter CRP Access Code:");
      // Simple hardcoded check for prototype as requested
      if (code !== 'crp12345') {
        alert("Access Denied");
        return;
      }
    }

    setRole(selectedRole);
    // Inject role into API layer for backend authorization
    setUserRole(selectedRole);
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

  const handleNavigateToCard = (selectedContext, selectedSituation) => {
    setContext(selectedContext);
    setSituation(selectedSituation);
    setCurrentPage('prepCard');
  };

  const handleBack = () => {
    // Manually triggering back logic same as popstate
    if (currentPage === 'prepCard') {
      setCurrentPage('situationSelection');
    } else if (currentPage === 'situationSelection') {
      setCurrentPage('contextSelection');
    } else if (currentPage === 'prepHistory') {
      // If we came from a card via "View Card Again", this might need more logic,
      // but for now returning to entry (Teacher Home) is safe default
      if (role === 'teacher') {
        setCurrentPage('contextSelection');
      } else {
        setCurrentPage('entry');
      }
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
    setUserRole(null); // Clear role from API layer
    setContext(null);
    setSituation(null);
    // Clear history stack visual
    window.history.pushState(null, '', '/');
  };

  return (
    <div className="relative">
      {currentPage === 'entry' && <Entry onRoleSelect={handleRoleSelect} />}
      {currentPage === 'contextSelection' && (
        <ContextSelection
          onContextSelect={handleContextSelect}
          onHistory={() => setCurrentPage('prepHistory')}
          onBack={handleBack}
          onHome={handleResetFlow}
        />
      )}
      {currentPage === 'situationSelection' && context && (
        <SituationSelection
          context={context}
          onSituationSelect={handleSituationSelect}
          onBack={handleBack}
          onHome={handleResetFlow}
        />
      )}
      {currentPage === 'prepCard' && context && situation && (
        <PrepCardPage
          context={context}
          situation={situation}
          onBack={handleBack}
          onHome={handleResetFlow}
          onViewHistory={() => setCurrentPage('prepHistory')}
        />
      )}
      {currentPage === 'prepHistory' && (
        <PrepHistoryPage
          onBack={() => {
            // Smart back: if context is set, go there, else home
            if (context) setCurrentPage('contextSelection');
            else setCurrentPage('entry');
          }}
          onNavigateToCard={handleNavigateToCard}
          onHome={handleResetFlow}
        />
      )}
      {currentPage === 'crpDashboard' && <CRPDashboard onHome={handleResetFlow} />}

      {/* Gorgeous home button - REMOVED per user feedback (overlap/clutter) */}
      {/* Navigation is now handled by explicit back/home buttons on pages */}
    </div>
  );
}

export default App;