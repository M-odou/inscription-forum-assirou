
import React, { useState } from 'react';
import { RegistrationFormData, Participant } from '../types.ts';
import { ASSIROU_SERVICES, ASSIROU_FORMATIONS, REFERRAL_SOURCES } from '../constants.ts';
import { generateWelcomeMessage } from '../services/geminiService.ts';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check, MapPin, Calendar, Clock } from 'lucide-react';

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
    industry: '',
    interestType: 'none',
    selectedOfferings: [],
    opinion: '',
    referralForum: [],
    referralAssirou: []
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // VALIDATION TÉLÉPHONE : Chiffres uniquement
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      if (onlyNums.length <= 12) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .trim()
      .match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  };

  const validateStep = () => {
    if (step === 1) {
      return (
        formData.firstName.trim().length >= 2 && 
        formData.lastName.trim().length >= 2 && 
        formData.phone.trim().length >= 7 &&
        validateEmail(formData.email)
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
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
      }, 500);
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
      alert("Une erreur technique est survenue. Veuillez vérifier votre connexion.");
    }
  };

  const steps = [
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Intérêts' },
    { id: 3, label: 'Sources' }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-professional">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-brand text-3xl font-black text-brand-navy tracking-tight uppercase">Assirou</span>
          <span className="font-brand text-3xl font-black text-brand-gold tracking-tight uppercase">Sécurité</span>
        </div>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Accréditation Officielle 2026</h2>
        
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-6 bg-slate-50 border border-slate-100 rounded-full inline-flex">
          <div className="flex items-center gap-2 text-brand-navy">
            <Calendar size={14} className="text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-wider">05 Mars 2026</span>
          </div>
          <div className="flex items-center gap-2 text-brand-navy">
            <Clock size={14} className="text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-wider">09h00</span>
          </div>
          <div className="flex items-center gap-2 text-brand-navy">
            <MapPin size={14} className="text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-wider">CSC Thiaroye Sur Mer</span>
          </div>
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
              <p className="text-[11px] text-slate-400 mt-1">Tous les champs avec * sont obligatoires</p>
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
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" placeholder="Ex: Moussa" required />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Nom *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" placeholder="Ex: Diop" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-text">E-mail Professionnel *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={`form-input ${formData.email && !validateEmail(formData.email) ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="contact@organisation.sn" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Numéro de téléphone *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-gold border-r border-slate-200 pr-2">+221</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="form-input pl-16 font-mono tracking-wider" 
                    placeholder="77 000 00 00" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-text">Organisation</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" placeholder="Nom de l'entreprise" />
              </div>
              <div className="space-y-1.5">
                <label className="label-text">Secteur d'activité</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="form-input" placeholder="Ex: Mines, Banque, Port..." />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-professional">
            <div className="border-l-4 border-brand-gold pl-4 py-1">
              <h3 className="text-base font-semibold text-brand-navy uppercase tracking-tight">Intérêts & Vision</h3>
            </div>

            <div className="space-y-4">
              <label className="label-text text-brand-navy">Qu'est-ce qui vous intéresse chez Assirou ?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'services', label: 'Services' },
                  { id: 'formations', label: 'Formations' },
                  { id: 'none', label: 'Découverte' }
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
                  Sélectionnez vos besoins
                </p>
                <div className="space-y-3">
                  {(formData.interestType === 'services' ? ASSIROU_SERVICES : ASSIROU_FORMATIONS).map((item) => (
                    <label key={item} className="flex items-start gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('selectedOfferings', item)}
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 rounded border flex items-center justify-center transition-professional ${
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
              <label className="label-text">Votre avis sur le thème</label>
              <p className="text-[9px] text-slate-400 italic mb-2">"La sécurité privée dans les grands événements culturels et sportifs"</p>
              <textarea 
                name="opinion" 
                value={formData.opinion} 
                onChange={handleChange} 
                rows={3}
                className="form-input resize-none"
                placeholder="Votre message ou recommandation..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-professional">
            <div className="border-l-4 border-brand-gold pl-4 py-1">
              <h3 className="text-base font-semibold text-brand-navy uppercase tracking-tight">Canaux de communication</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Comment avez-vous connu le forum ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {REFERRAL_SOURCES.map(source => (
                    <label key={`forum-${source}`} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('referralForum', source)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-professional ${
                          formData.referralForum.includes(source) ? 'bg-brand-navy border-brand-navy' : 'border-slate-200'
                        }`}
                      >
                        {formData.referralForum.includes(source) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-600">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Connaissance d'Assirou Sécurité ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {REFERRAL_SOURCES.map(source => (
                    <label key={`assirou-${source}`} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => handleCheckboxChange('referralAssirou', source)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-professional ${
                          formData.referralAssirou.includes(source) ? 'bg-brand-gold border-brand-gold' : 'border-slate-200'
                        }`}
                      >
                        {formData.referralAssirou.includes(source) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-600">{source}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <div className="inline-flex p-4 bg-brand-goldSoft rounded-full mb-4">
                <Sparkles size={24} className="text-brand-gold" />
              </div>
              <p className="text-[10px] text-slate-300 uppercase font-bold tracking-[0.2em]">Finalisation du badge d'accès</p>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="text-slate-400 hover:text-brand-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ArrowLeft size={14} /> Retour
            </button>
          ) : <div />}
          
          <button 
            type="button"
            disabled={!validateStep() || isSubmitting}
            onClick={step === 3 ? handleSubmit : nextStep}
            className="bg-brand-navy text-white px-10 py-4 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-brand-navyDark disabled:opacity-30 shadow-lg"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
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
