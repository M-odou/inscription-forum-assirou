
import React, { useRef, useState, useEffect } from 'react';
import { Participant } from '../types';
import { Download, ShieldCheck, CheckCircle2, Sparkles, Loader2, MapPin, Calendar, Clock } from 'lucide-react';
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
      // Temps de pause pour garantir le rendu des polices et images
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(badgeRef.current, {
        scale: 3, // Haute résolution pour impression
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [105, 148] // Format A6 standard pour badges
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Pass_Assirou_${participant.lastName}_${participant.firstName}`.replace(/\s+/g, '_');
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Fail:", error);
      alert("Une erreur est survenue lors de la génération. Veuillez réessayer.");
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
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Forum Assirou Sécurité 2026</p>
      </div>

      <div className="border-l-4 border-brand-gold pl-8 py-4 bg-brand-goldSoft/30 rounded-r-2xl print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-brand-gold" />
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em]">Message de Bienvenue</p>
        </div>
        <p className="text-lg font-brand text-brand-navy leading-relaxed italic">
          "{participant.welcomeMessage}"
        </p>
      </div>

      {/* Badge container - optimized for A6 aspect ratio (105x148mm) */}
      <div className="flex justify-center">
        <div 
          ref={badgeRef}
          className="relative w-[380px] h-[540px] overflow-hidden bg-white shadow-[0_30px_70px_rgba(0,33,87,0.12)] border border-slate-100 flex flex-col print:shadow-none"
          style={{ borderRadius: '1.5rem' }}
        >
          {/* Header Bar */}
          <div className="h-6 bg-brand-navy w-full relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold skew-x-[45deg] translate-x-12"></div>
          </div>

          <div className="p-8 flex-grow flex flex-col">
            {/* Top Identity & Logo */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Accréditation n°</h4>
                <p className="font-mono text-sm font-bold text-brand-navy tracking-widest">{participant.ticketId}</p>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-brand text-lg font-black text-brand-navy leading-none uppercase">Assirou</span>
                  <span className="font-brand text-lg font-black text-brand-gold leading-none uppercase">Sécurité</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex-grow flex flex-col items-center justify-center -mt-4">
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-gold/5 rounded-[2.5rem] scale-95 group-hover:scale-100 transition-transform duration-500"></div>
                <div className="relative p-5 rounded-[2rem] bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center">
                  {!qrBase64 ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Loader2 className="animate-spin text-slate-200" size={32} />
                    </div>
                  ) : (
                    <img src={qrBase64} alt="QR" className="w-48 h-48 block" />
                  )}
                </div>
              </div>

              {/* Participant Info */}
              <div className="mt-10 text-center space-y-4 w-full px-4">
                <div className="space-y-1">
                  <h3 className="text-3xl font-brand text-brand-navy uppercase tracking-tight font-black leading-none break-words">
                    {participant.firstName}
                  </h3>
                  <h3 className="text-3xl font-brand text-brand-gold uppercase tracking-tight font-black leading-none break-words">
                    {participant.lastName}
                  </h3>
                </div>
                
                <div className="inline-block px-5 py-1.5 bg-brand-navy text-white rounded-full max-w-full">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] truncate">
                    {participant.company || 'Délégué Officiel'}
                  </p>
                </div>
                
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest border-t border-slate-50 pt-3 truncate">
                  {participant.jobTitle || 'Invité Spécial'}
                </p>
              </div>
            </div>

            {/* Footer Event Details */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-brand-gold" />
                  <span className="text-[9px] font-black text-brand-navy uppercase">05 Mars 2026</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Clock size={12} className="text-brand-gold" />
                  <span className="text-[9px] font-black text-brand-navy uppercase">09h00</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 justify-center">
                  <MapPin size={12} className="text-brand-gold" />
                  <span className="text-[9px] font-black text-brand-navy uppercase">CSC Thiaroye Sur Mer</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl">
                <ShieldCheck size={14} className="text-brand-gold" />
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">Accès VIP Sécurisé</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="h-2 bg-brand-gold w-full"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-6 print:hidden">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating || !qrBase64}
          className="bg-brand-navy text-white py-5 px-12 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-navyDark transition-professional shadow-xl disabled:opacity-50 w-full max-w-sm active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Génération du PDF...</span>
            </>
          ) : (
            <>
              <Download size={20} /> 
              <span>Télécharger mon Pass (A6)</span>
            </>
          )}
        </button>

        <button onClick={onNewRegistration} className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-brand-gold transition-colors">
          Retour à l'accueil
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          #root > div > header, #root > div > footer, .print\\:hidden { display: none !important; }
          div[ref="badgeRef"] { 
            box-shadow: none !important; 
            border: 1px solid #eee !important; 
            margin: 0 auto !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketSuccess;
