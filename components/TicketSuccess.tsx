
import React, { useRef, useState } from 'react';
import { Participant } from '../types';
import { Download, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=";

interface Props {
  participant: Participant;
  onNewRegistration: () => void;
}

const TicketSuccess: React.FC<Props> = ({ participant, onNewRegistration }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!badgeRef.current) return;
    
    setIsGenerating(true);
    try {
      // Capturer le badge en haute résolution
      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // Haute qualité
        useCORS: true, // Crucial pour le QR code
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150] // Format badge personnalisé
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Téléchargement effectif du fichier
      pdf.save(`Badge_Assirou_2026_${participant.lastName}_${participant.firstName}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      // Fallback sur l'impression si le script échoue
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-professional pb-24 print:pb-0 print:m-0 print:max-w-none">
      <div className="text-center print:hidden">
        <div className="inline-flex p-4 bg-brand-goldSoft rounded-full mb-6">
          <CheckCircle2 size={40} className="text-brand-gold" />
        </div>
        <h2 className="font-brand text-4xl text-brand-navy mb-2">Inscription Confirmée</h2>
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
            Forum des Métiers de la Sécurité Privée au Sénégal
          </p>
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.15em]">
            05 mars 2026 • CSC Thiaroye Sur mer • 9H - 17H
          </p>
        </div>
      </div>

      {/* Message IA */}
      <div className="border-l-4 border-brand-gold pl-8 py-4 bg-brand-goldSoft/30 rounded-r-2xl print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-brand-gold" />
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em]">Message du Directoire</p>
        </div>
        <p className="text-lg font-brand text-brand-navy leading-relaxed italic">
          "{participant.welcomeMessage}"
        </p>
      </div>

      {/* LUXURY BADGE DESIGN */}
      <div className="print:m-0 flex justify-center">
        <div 
          ref={badgeRef}
          className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-[0_30px_70px_rgba(0,33,87,0.12)] border border-slate-100 print:shadow-none print:border-none"
        >
          {/* Top Metallic Bar */}
          <div className="h-4 bg-brand-navy relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold skew-x-[30deg] translate-x-4"></div>
          </div>

          <div className="p-10">
            {/* Badge Identity Header */}
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-50">
              <div>
                <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">ID ACCRÉDITATION</h4>
                <p className="font-mono text-sm font-bold text-brand-navy tracking-widest">{participant.ticketId}</p>
              </div>
              <div className="text-right">
                <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">FORUM 2026</h4>
                <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">SÉCURITÉ PRIVÉE</p>
              </div>
            </div>

            {/* Core Content */}
            <div className="flex flex-col items-center">
              <div className="relative mb-10">
                <div className="relative p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
                  <img 
                    src={`${QR_URL}${participant.ticketId}`} 
                    alt="QR Code" 
                    crossOrigin="anonymous"
                    className="w-44 h-44 rounded-xl"
                  />
                </div>
              </div>

              <div className="text-center space-y-3 w-full">
                <h3 className="text-3xl font-brand text-brand-navy uppercase tracking-tight font-black leading-none">
                  {participant.firstName}<br/>
                  <span className="text-brand-gold">{participant.lastName}</span>
                </h3>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="px-4 py-1 bg-brand-navy/5 rounded-full inline-block">
                    <p className="text-[9px] font-bold text-brand-navy uppercase tracking-[0.2em]">{participant.jobTitle || 'Délégué Officiel'}</p>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-2">{participant.company || 'Indépendant'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy">05 MARS 2026 • CSC THIAROYE SUR MER</p>
                <p className="text-[8px] font-bold text-brand-gold uppercase tracking-widest mt-1">DAKAR, SÉNÉGAL • 09H00 - 17H00</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-brand-gold" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">ACCÈS SÉCURISÉ</span>
                </div>
                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-right">
                  <span>ASSIROU</span><br/>
                  <span>SÉCURITÉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-6 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-brand-navy text-white py-5 px-12 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-navyDark transition-professional shadow-xl hover:shadow-brand-navy/20 w-full max-w-sm group disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Génération du PDF...</span>
            </>
          ) : (
            <>
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> 
              <span>Télécharger mon Pass (PDF)</span>
            </>
          )}
        </button>

        <button 
          onClick={onNewRegistration} 
          className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-brand-gold transition-professional flex items-center justify-center gap-4 group"
        >
          <div className="w-8 h-px bg-slate-200 group-hover:w-12 transition-all"></div>
          Nouvelle Inscription
          <div className="w-8 h-px bg-slate-200 group-hover:w-12 transition-all"></div>
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          #root > div > header, #root > div > footer, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketSuccess;
