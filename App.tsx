
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Participant } from './types.ts';
import RegistrationForm from './components/RegistrationForm.tsx';
import TicketSuccess from './components/TicketSuccess.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { fetchParticipants, saveParticipant, updateParticipantCheckIn, verifyAdminCredentials } from './services/supabaseService.ts';
import { Shield, Lock, X, LogIn, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.REGISTRATION);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [lastRegistered, setLastRegistered] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);

  // Load participants from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchParticipants();
    setParticipants(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegistrationComplete = async (newParticipant: Participant) => {
    const success = await saveParticipant(newParticipant);
    if (success) {
      setParticipants(prev => [newParticipant, ...prev]);
      setLastRegistered(newParticipant);
      setCurrentView(AppView.TICKET_SUCCESS);
    } else {
      alert("Une erreur est survenue lors de l'enregistrement en base de données. Veuillez réessayer.");
    }
  };

  const handleCheckIn = async (ticketId: string) => {
    const success = await updateParticipantCheckIn(ticketId);
    if (success) {
      // Mettre à jour l'état local pour éviter un re-fetch complet
      setParticipants(prev => prev.map(p => 
        p.ticketId === ticketId 
          ? { ...p, checkedIn: true, checkedInAt: new Date().toISOString() } 
          : p
      ));
      return true;
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError(false);
    
    try {
      const isValid = await verifyAdminCredentials(loginForm.user, loginForm.pass);
      
      if (isValid) {
        setIsLoggedIn(true);
        setShowLogin(false);
        setCurrentView(AppView.ADMIN);
      } else {
        setLoginError(true);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setLoginError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(AppView.REGISTRATION);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-gold/20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView(AppView.REGISTRATION)}
          >
            <div className="relative">
              <Shield className="text-brand-navy w-10 h-10 group-hover:scale-105 transition-transform" />
              <Shield className="text-brand-gold w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
            </div>
            <div className="border-l-2 border-slate-100 pl-4 flex flex-col justify-center">
              <h1 className="font-brand text-2xl tracking-tight leading-none font-black flex flex-col">
                <span className="text-brand-navy">Assirou</span>
                <span className="text-brand-gold -mt-1">Sécurité</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Sync DB...</span>
              </div>
            )}
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">
              Portail Officiel d'Accréditation
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 bg-white">
        <div className="w-full max-w-4xl px-6">
          {currentView === AppView.REGISTRATION && (
            <RegistrationForm onComplete={handleRegistrationComplete} />
          )}
          
          {currentView === AppView.TICKET_SUCCESS && lastRegistered && (
            <TicketSuccess 
              participant={lastRegistered} 
              onNewRegistration={() => setCurrentView(AppView.REGISTRATION)} 
            />
          )}

          {currentView === AppView.ADMIN && isLoggedIn && (
            <AdminDashboard 
              participants={participants} 
              onCheckIn={handleCheckIn} 
              onLogout={handleLogout} 
            />
          )}
        </div>
      </main>

      <footer className="py-10 border-t border-slate-50 text-center relative group">
        <div className="flex flex-col items-center gap-1 opacity-60">
          <p className="text-brand-navy text-[11px] uppercase tracking-[0.2em] font-black">
            Assirou Sécurité
          </p>
          <p className="text-slate-300 text-[9px] uppercase tracking-widest font-medium">
            Excellence & Vigilance • Dakar, Sénégal
          </p>
        </div>
        
        <button 
          onClick={() => {
            if (isLoggedIn) setCurrentView(AppView.ADMIN);
            else setShowLogin(true);
          }}
          className="absolute bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:text-brand-gold hover:bg-slate-50 transition-professional"
          title="Accès Administration"
        >
          <Lock size={14} />
        </button>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy flex items-center gap-2">
                <Lock size={16} /> Authentification Admin
              </h3>
              <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-brand-navy">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identifiant</label>
                <input 
                  type="text" 
                  value={loginForm.user}
                  onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
                  className="form-input focus:ring-brand-gold" 
                  placeholder="Login"
                  disabled={isAuthenticating}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mot de passe</label>
                <input 
                  type="password" 
                  value={loginForm.pass}
                  onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
                  className="form-input focus:ring-brand-gold"
                  placeholder="••••••••"
                  disabled={isAuthenticating}
                />
              </div>
              
              {loginError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide text-center">Identifiants incorrects</p>
              )}
              
              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-brand-navy text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-navyDark transition-professional mt-4 disabled:opacity-50"
              >
                {isAuthenticating ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                {isAuthenticating ? 'Vérification...' : 'Accéder au Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
