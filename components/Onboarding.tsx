
import React, { useState } from 'react';
import { UserPreferences, Platform, ContentFormat, ContentPillar, LanguagePreference } from '../types';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
  onCancel?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    gbpLink: '',
    platforms: ['Instagram', 'TikTok'],
    frequencyPerWeek: 3,
    formats: ['Reels', 'Single Image'],
    pillars: ['Educational', 'Artist Spotlight'],
    languagePreference: 'English',
    teamSize: 1,
    experienceLevel: 'Beginner',
    teamRoles: 'Owner does everything'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const togglePlatform = (p: Platform) => {
    setPrefs(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(x => x !== p) 
        : [...prev.platforms, p]
    }));
  };

  const toggleFormat = (f: ContentFormat) => {
    setPrefs(prev => ({
      ...prev,
      formats: prev.formats.includes(f) 
        ? prev.formats.filter(x => x !== f) 
        : [...prev.formats, f]
    }));
  };

  const togglePillar = (pillar: ContentPillar) => {
    setPrefs(prev => {
      const isSelected = prev.pillars.includes(pillar);
      if (isSelected) {
        return { ...prev, pillars: prev.pillars.filter(p => p !== pillar) };
      } else {
        if (prev.pillars.length >= 4) return prev;
        return { ...prev, pillars: [...prev.pillars, pillar] };
      }
    });
  };

  const steps = [
    { id: 1, title: 'Identity' },
    { id: 2, title: 'Strategy' },
    { id: 3, title: 'Team & Language' }
  ];

  const availablePillars: ContentPillar[] = [
    'Funny', 'Educational', 'Informational', 'Sales',
    'Behind the Scenes', 'Artist Spotlight', 'Client Stories', 'Studio Vibe'
  ];

  const availableFormats: ContentFormat[] = [
    'Reels', 'Single Image', 'Carousels', 'Stories', 'Videos', 'Short-form videos'
  ];

  return (
    <div className="max-w-3xl mx-auto my-12 p-10 glass rounded-[2rem] shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute -top-2 -right-2 p-2 text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        <div className="mb-12">
          <nav className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${step >= s.id ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {s.id}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${step >= s.id ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-px w-16 mb-6 transition-colors ${step > s.id ? 'bg-indigo-600' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-3">Studio Identity</h2>
              <p className="text-slate-400 text-lg">We'll analyze your location and reviews to tailor the content.</p>
            </div>
            
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <label className="block text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Google Business Profile Link</label>
              <input 
                type="text" 
                placeholder="https://maps.app.goo.gl/..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder-slate-600"
                value={prefs.gbpLink}
                onChange={e => setPrefs({...prefs, gbpLink: e.target.value})}
              />
              <p className="mt-3 text-xs text-slate-500 flex items-center">
                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Copy the "Share" link from Google Maps for your studio.
              </p>
            </div>

            <button 
              disabled={!prefs.gbpLink}
              onClick={nextStep}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 text-lg flex items-center justify-center space-x-2"
            >
              <span>Analyze Studio Profile</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-3">Social Strategy</h2>
              <p className="text-slate-400">Define where and how often you want to show up.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest">Platforms</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Instagram', 'TikTok', 'Facebook', 'GBP'] as Platform[]).map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-5 py-3 rounded-xl border flex items-center justify-between transition-all ${prefs.platforms.includes(p) ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                    >
                      <span className="font-bold">{p}</span>
                      {prefs.platforms.includes(p) && <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Post Frequency</label>
                  <input 
                    type="range" min="1" max="7" 
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={prefs.frequencyPerWeek}
                    onChange={e => setPrefs({...prefs, frequencyPerWeek: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[10px] text-slate-500 font-bold">1 DAY</span>
                    <span className="text-sm text-indigo-400 font-black">{prefs.frequencyPerWeek} DAYS / WEEK</span>
                    <span className="text-[10px] text-slate-500 font-bold">7 DAYS</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Content Pillars (Max 4)</label>
                  <div className="flex flex-wrap gap-2">
                    {availablePillars.map(pillar => (
                      <button
                        key={pillar}
                        onClick={() => togglePillar(pillar)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all ${prefs.pillars.includes(pillar) ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                      >
                        {pillar}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Comfortable Formats</label>
                  <div className="flex flex-wrap gap-2">
                    {availableFormats.map(f => (
                      <button
                        key={f}
                        onClick={() => toggleFormat(f)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all ${prefs.formats.includes(f) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={prevStep} 
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 border border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span>Back</span>
              </button>
              <button 
                onClick={nextStep} 
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Next Step</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-3">Final Details</h2>
              <p className="text-slate-400">Language and team resources.</p>
            </div>
            
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-6">Target Language</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Local', 'English', 'Both'] as LanguagePreference[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setPrefs({...prefs, languagePreference: l})}
                    className={`p-4 rounded-xl border text-center transition-all ${prefs.languagePreference === l ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                  >
                    <div className="text-xl mb-1">{l === 'Local' ? '📍' : l === 'English' ? '🇬🇧' : '🌍'}</div>
                    <div className="font-bold text-[9px] uppercase tracking-widest">{l === 'Both' ? 'Bilingual' : l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Team Size</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={prefs.teamSize}
                  onChange={e => setPrefs({...prefs, teamSize: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Social Experience</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={prefs.experienceLevel}
                  onChange={e => setPrefs({...prefs, experienceLevel: e.target.value as any})}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 <span>Back</span>
              </button>
              <button 
                onClick={() => onComplete(prefs)} 
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/30 tracking-wide uppercase"
              >
                Launch Strategy 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
