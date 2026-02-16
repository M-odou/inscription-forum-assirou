
import React, { useState } from 'react';
import { Participant } from '../types';
import { QrCode, Loader2, CheckCircle2, ShieldOff, Search } from 'lucide-react';

interface Props {
  participants: Participant[];
  onCheckIn: (ticketId: string) => boolean;
}

const CheckIn: React.FC<Props> = ({ participants, onCheckIn }) => {
  const [ticketInput, setTicketInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeP, setActiveP] = useState<Participant | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = ticketInput.trim().toUpperCase();
    if (!cleanId) return;
    setIsProcessing(true);
    setStatus('idle');
    
    setTimeout(() => {
      const found = participants.find(p => p.ticketId === cleanId);
      const success = onCheckIn(cleanId);
      if (success && found) {
        setStatus('success');
        setActiveP(found);
      } else {
        setStatus('error');
      }
      setIsProcessing(false);
      setTicketInput('');
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto space-y-12 animate-professional">
      <div className="text-center">
        <h2 className="font-brand text-3xl text-brand-navy mb-2 tracking-tight">Point de Contrôle</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">Vérification des Accréditations 2026</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-lg p-8 md:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        {status === 'idle' ? (
          <div className="space-y-10">
            <div className="aspect-square bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-brand-gold hover:border-brand-gold transition-professional cursor-pointer group">
              <QrCode size={48} className="opacity-40 group-hover:opacity-100 transition-professional" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Activer le Lecteur Optique</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="label-text">Référence du Pass</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                    placeholder="AS-2026-XXXX"
                    className="form-input font-mono font-bold text-center tracking-widest uppercase pl-10"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                    <Search size={16} />
                  </div>
                </div>
              </div>
              <button 
                disabled={!ticketInput.trim() || isProcessing}
                className="w-full bg-brand-navy text-white py-4 rounded-md font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-navyDark transition-professional"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Valider l\'Entrée'}
              </button>
            </form>
          </div>
        ) : status === 'success' ? (
          <div className="text-center space-y-8 animate-professional">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <div>
               <h3 className="text-xl font-brand text-brand-navy mb-1">{activeP?.firstName} {activeP?.lastName}</h3>
               <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em]">Accréditation Validée</p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 text-left rounded">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Structure Officielle</p>
              <p className="text-xs font-bold text-slate-700">{activeP?.company}</p>
            </div>
            <button onClick={() => setStatus('idle')} className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-professional">Nouveau Contrôle</button>
          </div>
        ) : (
          <div className="text-center space-y-8 animate-professional">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldOff size={32} />
            </div>
            <div>
              <h3 className="text-xl font-brand text-brand-navy mb-1">Accès Refusé</h3>
              <p className="text-red-600 text-[10px] font-bold uppercase tracking-[0.3em]">Identifiant Non Reconnu</p>
            </div>
            <p className="text-[11px] text-slate-400 font-medium px-4">Le pass présenté ne correspond à aucune donnée d'accréditation valide dans notre périmètre de sécurité.</p>
            <button onClick={() => setStatus('idle')} className="w-full bg-brand-navy text-white py-3.5 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-brand-navyDark transition-professional">Réessayer</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
