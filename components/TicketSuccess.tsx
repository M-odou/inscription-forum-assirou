
import React, { useRef, useState, useEffect } from 'react';
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
  const [qrBase64, setQrBase64] = useState<string | null>(null);

  // Conversion en Base64 pour éviter tout problème CORS lors de la génération PDF
  useEffect(() => {
    const fetchQrAsBase64 = async () => {
      try {
        const response = await fetch(`${QR_URL}${participant.ticketId}`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("QR Load Error:", error);
      }
    };
    fetchQrAsBase64();
  }, [participant.ticketId]);

  const handleDownloadPDF = async () => {
    if (!badgeRef.current || !qrBase64) return;
    
    setIsGenerating(true);
    try {
      // Pause pour stabiliser le rendu
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('badge-capture-box');
          if (el) el.style.display = 'block';
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Pass_Assirou_${participant.lastName}_${participant.firstName}`.replace(/\s+/g, '_');
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Fail:", error);
      alert("Erreur de génération. Utilisation de l'impression système...");
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-professional pb-24 print:pb-0">
      <div className="text-center print:hidden">
        <div className="inline-flex p-4 bg-brand-goldSoft rounded-full mb-6">
          <CheckCircle2 size={40} className="text-brand-gold" />
        </div>
        <h2 className="font-brand text-4xl text-brand-navy mb-2 tracking-tight">Accréditation Confirmée</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Assirou Sécurité 2026</p>
      </div>

      <div className="border-l-4 border-brand-gold pl-8 py-4 bg-brand-goldSoft/30 rounded-r-2xl print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-brand-gold" />
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em]">Bienvenue</p>
        </div>
        <p className="text-lg font-brand text-brand-navy leading-relaxed italic">
          "{participant.welcomeMessage}"
        </p>
      </div>

      <div className="flex justify-center">
        <div 
          ref={badgeRef}
          id="badge-capture-box"
          className="relative w-full max-w-[380px] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_30px_70px_rgba(0,33,87,0.12)] border border-slate-100 print:shadow-none"
        >
          <div className="h-4 bg-brand-navy relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold skew-x-[30deg] translate-x-4"></div>
          </div>

          <div className="p-10">
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-50">
              <div>
                <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">ID PASS</h4>
                <p className="font-mono text-sm font-bold text-brand-navy tracking-widest">{participant.ticketId}</p>
              </div>
              <div className="text-right">
                <h4 className="text-[9px] font-black text-brand-navy uppercase">Assirou</h4>
                <p className="text-[9px] font-black text-brand-gold uppercase">Sécurité</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-10">
                <div className="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm min-w-[176px] min-h-[176px] flex items-center justify-center">
                  {!qrBase64 ? (
                    <Loader2 className="animate-spin text-slate-200" size={32} />
                  ) : (
                    <img src={qrBase64} alt="QR" className="w-44 h-44 rounded-xl block" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-3 w-full">
                <h3 className="text-3xl font-brand text-brand-navy uppercase tracking-tight font-black leading-none">
                  {participant.firstName}<br/>
                  <span className="text-brand-gold">{participant.lastName}</span>
                </h3>
                
                <div className="px-4 py-1 bg-brand-navy/5 rounded-full inline-block">
                  <p className="text-[9px] font-bold text-brand-navy uppercase tracking-widest">{participant.jobTitle || 'Délégué'}</p>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{participant.company || 'Indépendant'}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy">05 MARS 2026 • CSC THIAROYE SUR MER</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <ShieldCheck size={16} className="text-brand-gold" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">ACCÈS SÉCURISÉ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating || !qrBase64}
          className="bg-brand-navy text-white py-5 px-12 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-navyDark transition-professional shadow-xl disabled:opacity-50 w-full max-w-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Génération...</span>
            </>
          ) : (
            <>
              <Download size={20} /> 
              <span>Télécharger mon Pass (PDF)</span>
            </>
          )}
        </button>

        <button onClick={onNewRegistration} className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-brand-gold transition-colors">
          Nouvelle Inscription
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          #root > div > header, #root > div > footer, .print\\:hidden { display: none !important; }
          #badge-capture-box { box-shadow: none !important; border: 1px solid #eee !important; margin: 0 auto !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketSuccess;
