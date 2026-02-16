
import React, { useMemo, useState } from 'react';
import { Participant } from '../types';
import { Users, UserCheck, Shield, Eye, QrCode, CheckCircle2, UserX, LogOut, X, Download, Briefcase, Info, MessageSquare, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import CheckIn from './CheckIn';

interface Props {
  participants: Participant[];
  onCheckIn: (ticketId: string) => boolean;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ participants, onCheckIn, onDelete, onLogout }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const stats = useMemo(() => {
    const total = participants.length;
    const checkedIn = participants.filter(p => p.checkedIn).length;
    const industryData: Record<string, number> = {};
    participants.forEach(p => {
      industryData[p.industry || 'Non spécifié'] = (industryData[p.industry || 'Non spécifié'] || 0) + 1;
    });
    const chartData = Object.entries(industryData).map(([name, value]) => ({ name, value }));
    return { total, checkedIn, chartData };
  }, [participants]);

  const exportToCSV = () => {
    if (participants.length === 0) return;

    const headers = [
      "Ticket ID", "Prenom", "Nom", "Email", "Telephone", "Entreprise", 
      "Fonction", "Industrie", "Type Interet", "Services/Formations Choisis", 
      "Opinion", "Source Forum", "Source Assirou", "Date Inscription", "Statut Presence"
    ];

    const rows = participants.map(p => [
      p.ticketId,
      p.firstName,
      p.lastName,
      p.email,
      p.phone,
      p.company || "",
      p.jobTitle || "",
      p.industry || "",
      p.interestType,
      `"${p.selectedOfferings.join(" | ")}"`,
      `"${p.opinion.replace(/"/g, '""')}"`,
      `"${p.referralForum.join(" | ")}"`,
      `"${p.referralAssirou.join(" | ")}"`,
      p.registeredAt,
      p.checkedIn ? "Present" : "Absent"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Participants_Assirou_2026_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showScanner) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setShowScanner(false)}
          className="text-slate-400 hover:text-brand-navy text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 transition-colors"
        >
          <UserX size={14} /> Quitter le mode Scanner
        </button>
        <CheckIn participants={participants} onCheckIn={onCheckIn} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-professional max-w-6xl mx-auto pb-24">
      {/* Header with Scanner & Export */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100 pb-10">
        <div className="flex-shrink-0">
          <h2 className="font-brand text-3xl text-brand-navy mb-2">Gestion des Accréditations</h2>
          <p className="text-slate-400 text-sm font-medium">Panneau de contrôle administratif Forum 2026.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 bg-brand-gold text-white rounded-xl hover:bg-brand-goldDark transition-professional shadow-sm hover:shadow-brand-gold/20 flex-1 sm:flex-none h-[48px]"
          >
            <QrCode size={16} /> Mode Scanner
          </button>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-professional shadow-sm flex-1 sm:flex-none h-[48px]"
          >
            <Download size={16} /> Exporter CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Inscrits" value={stats.total} icon={<Users size={18} />} trend="Global" />
        <StatItem label="Présences" value={stats.checkedIn} icon={<UserCheck size={18} />} trend="Temps réel" accent />
        <StatItem label="Sécurité" value="Active" icon={<Shield size={18} />} trend="Système" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">Analyse par Secteur</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical" margin={{ left: -30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} width={120} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
                  {stats.chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#002157' : '#C5A022'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 h-full">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Dernières Entrées</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {participants.filter(p => p.checkedIn).slice(-8).reverse().map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-white last:border-0">
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-brand-navy truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString() : 'Maintenant'}</p>
                  </div>
                  <CheckCircle2 size={14} className="text-green-500" />
                </div>
              ))}
              {participants.filter(p => p.checkedIn).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                  <UserCheck size={32} className="opacity-20 mb-2" />
                  <p className="italic text-xs">Aucune présence validée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Référence Pass</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Participant</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status Accès</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {participants.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-professional group">
                  <td className="px-6 py-5 font-mono text-[10px] text-brand-gold font-bold">{p.ticketId}</td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-brand-navy">{p.firstName} {p.lastName}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{p.company || 'Sans structure'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider ${p.checkedIn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                      {p.checkedIn ? 'Accès Validé' : 'En Attente'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedParticipant(p)}
                        className="p-2.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Voir la fiche complète"
                      >
                        <Eye size={18} />
                      </button>
                      {!p.checkedIn && (
                        <button 
                          onClick={() => onCheckIn(p.ticketId)}
                          className="p-2.5 text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors border border-transparent hover:border-brand-gold/20"
                          title="Valider manuellement"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logout at the bottom */}
      <div className="flex justify-center pt-10 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] px-10 py-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-professional border border-red-100 shadow-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Déconnexion Administrative
        </button>
      </div>

      {/* Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-brand-gold/10 p-2 rounded-lg">
                  <Info size={18} className="text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy">Fiche Participant</h3>
                  <p className="text-[10px] text-brand-gold font-mono font-bold uppercase tracking-widest">{selectedParticipant.ticketId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedParticipant(null)} className="text-slate-400 hover:text-brand-navy bg-white p-2 rounded-full border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-grow custom-scrollbar space-y-10">
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-brand-gold pl-3">
                  <Users size={16} className="text-brand-gold" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identité & Profil</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <DetailField label="Nom Complet" value={`${selectedParticipant.firstName} ${selectedParticipant.lastName}`} />
                  <DetailField label="E-mail" value={selectedParticipant.email} />
                  <DetailField label="Téléphone" value={selectedParticipant.phone} />
                  <DetailField label="Organisation" value={selectedParticipant.company || "Non renseigné"} />
                  <DetailField label="Fonction" value={selectedParticipant.jobTitle || "Non renseigné"} />
                  <DetailField label="Secteur" value={selectedParticipant.industry || "Non renseigné"} />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-brand-navy pl-3">
                  <Briefcase size={16} className="text-brand-navy" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Services & Formations</h4>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-4">
                  <DetailField label="Type d'intérêt" value={selectedParticipant.interestType === 'services' ? 'Services de Sécurité' : selectedParticipant.interestType === 'formations' ? 'Formations Professionnelles' : 'Aucun intérêt spécifique'} />
                  {selectedParticipant.selectedOfferings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Offres sélectionnées</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedParticipant.selectedOfferings.map(offering => (
                          <span key={offering} className="px-3 py-1 bg-brand-navy/5 text-brand-navy text-[10px] font-bold rounded-full border border-brand-navy/10">{offering}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-brand-gold pl-3">
                  <MessageSquare size={16} className="text-brand-gold" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vision & Référencement</h4>
                </div>
                <div className="space-y-6">
                  <div className="bg-brand-goldSoft/30 p-5 rounded-xl border border-brand-gold/10">
                    <p className="text-[9px] font-bold uppercase text-brand-gold tracking-widest mb-2">Opinion sur le thème</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{selectedParticipant.opinion || "Aucune opinion exprimée."}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Découverte Forum</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedParticipant.referralForum.map(s => <span key={s} className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-bold">{s}</span>)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Découverte Assirou</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedParticipant.referralAssirou.map(s => <span key={s} className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-bold">{s}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailField = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{label}</p>
    <p className="text-xs font-bold text-brand-navy">{value}</p>
  </div>
);

const StatItem = ({ label, value, icon, trend, accent }: { label: string, value: string | number, icon: React.ReactNode, trend: string, accent?: boolean }) => (
  <div className={`p-8 rounded-2xl border border-slate-100 flex items-center justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${accent ? 'bg-brand-navy text-white' : 'bg-white text-slate-900 shadow-sm'}`}>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${accent ? 'text-slate-300' : 'text-slate-400'}`}>{label}</p>
      <p className="text-3xl font-bold font-brand">{value}</p>
      <p className={`text-[8px] font-bold uppercase mt-2 tracking-widest ${accent ? 'text-brand-gold' : 'text-slate-300'}`}>{trend}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent ? 'bg-white/10 text-brand-gold' : 'bg-slate-50 text-slate-400'}`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;
