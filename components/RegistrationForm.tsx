
import React, { useState } from 'react';
import { RegistrationFormData, Participant } from '../types.ts';
import { INDUSTRIES, ASSIROU_SERVICES, ASSIROU_FORMATIONS, REFERRAL_SOURCES } from '../constants.ts';
import { generateWelcomeMessage } from '../services/geminiService.ts';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';

interface Props {
  onComplete: (participant: Participant) => void;
}

const RegistrationForm: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    salutation: 'M.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: INDUSTRIES[0],
    interestType: 'none',
    selectedOfferings: [],
    opinion: '',
    referralForum: [],
    referralAssirou: []
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (name: 'selectedOfferings' | 'referralForum' | 'referralAssirou', value: string) => {
    setFormData(prev => {
      const current = prev[name];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.firstName.trim() && 
             formData.lastName.trim() && 
             formData.phone.trim() &&
             formData.email.trim();
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const ticketId = `AS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const welcomeMsg = await generateWelcomeMessage(
      formData.salutation,
      `${formData.firstName} ${formData.lastName}`, 
      formData.company || "Indépendant"
    );

    const newParticipant: Participant = {
      ...formData,
      id: crypto.randomUUID(),
      ticketId,
      registeredAt: new Date().toISOString(),
      welcomeMessage: welcomeMsg,
      checkedIn: false
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete(newParticipant);
    }, 1200);
  };

  const steps = [
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Intérêts' },
    { id: 3, label: 'Sources' }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-professional">
      <div className="mb-10 text-center">
        <h2 className="font-brand text-3xl text-brand-navy mb-2 tracking-tight">Accréditation Officielle</h2>
        <div className="w-8 h-1 bg-brand-gold mx-auto mb-4 rounded-full"></div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
          Forum des Métiers de la Sécurité Privée au Sénégal
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.15em]">
            05 mars 2026 • Lieu : CSC Thiaroye Sur mer
          </p>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">
            Heure : 9H - 17H
          </p>
        </div>
      </div>

      <div className="mb-12 px-4">
        <div className="flex items-center justify-between w-full relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-0 -translate-y-1/2"></div>
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center group bg-white px-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-professional ${
                step === s.id 
                ? 'border-brand-gold bg-brand-goldSoft text-brand-gold' 
                : step > s.id 
                ? 'bg-brand-gold border-brand-gold text-white' 
                : 'bg-white border-slate-100 text-slate-300'
              }`}>
                {step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
              </div>
              <span className={`mt-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-professional ${
                step === s.id ? 'text-brand-gold' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-8 md:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        {step === 1 && (
          <div className="space-y-6 animate-professional">
            <div className="border-l-4 border-brand-gold pl-4 py-1 mb-8">
              <h3 className="text-base font-semibold text-brand-navy uppercase tracking-tight">Profil du Participant</h3>
              <p className="text-[11px] text-slate-400 mt-1">Les champs avec * sont obligatoires</p>
            </div>

            <div className="space-y-4">
              <label className="label-text">Civilité *</label>
              <div className="flex gap-4">
                {['M.', 'Mme'].map((sal) => (
                  <label key={sal} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="salutation" 
                      value={sal} 
                      checked={formData.salutation === sal}
                      onChange={handleChange}
                      className="w-4 h-4 accent-brand-gold"
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest ${formData.salutation === sal ? 'text-brand-gold' : 'text-slate-400'}`}>
                      {sal === 'M.' ? 'Monsieur' : 'Madame'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-text">Prénom *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" placeholder="Ex: Moussa" />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Nom *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" placeholder="Ex: Diop" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-text">Numéro de téléphone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+221 ..." />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="email@exemple.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-text">Organisation (Optionnel)</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" placeholder="Structure" />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Fonction (Optionnel)</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="form-input" placeholder="Poste" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-professional">
            <div className="border-l-4 border-brand-gold pl-4 py-1">
              <h3 className="text-base font-semibold text-brand-navy uppercase tracking-tight">Services & Formations</h3>
              <p className="text-[11px] text-slate-400 mt-1">Personnalisez votre intérêt pour Assirou</p>
            </div>

            <div className="space-y-4">
              <label className="label-text text-brand-navy">Intéressé par nos offres ?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'services', label: 'Services' },
                  { id: 'formations', label: 'Formations' },
                  { id: 'none', label: 'Pas maintenant' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, interestType: opt.id as any, selectedOfferings: [] })}
                    className={`py-3 px-2 rounded border text-[10px] font-bold uppercase tracking-wider transition-professional ${
                      formData.interestType === opt.id 
                      ? 'border-brand-gold bg-brand-goldSoft text-brand-gold' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.interestType !== 'none' && (
              <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-lg animate-professional">
                <p className="text-[10px] font-bold uppercase text-brand-navy tracking-widest mb-3">
                  {formData.interestType === 'services' ? 'Services Assirou' : 'Formations Assirou'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(formData.interestType === 'services' ? ASSIROU_SERVICES : ASSIROU_FORMATIONS).map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('selectedOfferings', item)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-professional ${
                          formData.selectedOfferings.includes(item) ? 'bg-brand-gold border-brand-gold' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {formData.selectedOfferings.includes(item) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-xs text-slate-600 font-medium group-hover:text-brand-navy transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="label-text">Votre opinion sur le thème du Forum</label>
              <p className="text-[9px] text-slate-400 italic mb-2">"La sécurité privée dans les grands événements culturels et sportifs"</p>
              <textarea 
                name="opinion" 
                value={formData.opinion} 
                onChange={handleChange} 
                rows={4}
                className="form-input resize-none focus:ring-1 focus:ring-brand-gold"
                placeholder="Exprimez votre vision sur ce thème..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-professional">
            <div className="border-l-4 border-brand-gold pl-4 py-1">
              <h3 className="text-base font-semibold text-brand-navy uppercase tracking-tight">Canaux de Découverte</h3>
              <p className="text-[11px] text-slate-400 mt-1">Aidez-nous à mieux comprendre votre parcours</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.15em]">Connaissance du forum ?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REFERRAL_SOURCES.map(source => (
                    <label key={`forum-${source}`} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('referralForum', source)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-professional ${
                          formData.referralForum.includes(source) ? 'bg-brand-navy border-brand-navy' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        {formData.referralForum.includes(source) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 group-hover:text-brand-navy">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.15em]">Connaissance d'Assirou ?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REFERRAL_SOURCES.map(source => (
                    <label key={`assirou-${source}`} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('referralAssirou', source)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-professional ${
                          formData.referralAssirou.includes(source) ? 'bg-brand-gold border-brand-gold' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        {formData.referralAssirou.includes(source) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 group-hover:text-brand-gold">{source}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 text-center space-y-4">
              <div className="inline-flex p-4 bg-brand-goldSoft rounded-full">
                <Sparkles size={24} className="text-brand-gold" />
              </div>
              <p className="text-[10px] text-slate-300 uppercase font-bold tracking-[0.25em]">
                Confirmation de l'Accréditation
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
          {step > 1 ? (
            <button 
              type="button"
              onClick={prevStep} 
              className="text-slate-400 hover:text-brand-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-professional"
            >
              <ArrowLeft size={14} /> Retour
            </button>
          ) : <div />}
          
          <button 
            type="button"
            disabled={!validateStep() || isSubmitting}
            onClick={step === 3 ? handleSubmit : nextStep}
            className="bg-brand-navy text-white px-10 py-4 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-brand-navyDark disabled:opacity-30 disabled:cursor-not-allowed transition-professional shadow-lg hover:shadow-brand-navy/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <span>{step === 3 ? 'Générer mon Pass' : 'Suivant'}</span>
                {step < 3 && <ArrowRight size={16} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
