
import React, { useState } from 'react';
import { UserPreferences, Platform, ContentFormat, ContentPillar } from '../types';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    gbpLink: '',
    platforms: ['Instagram', 'TikTok'],
    frequencyPerWeek: 3,
    formats: ['Reels', 'Single Image'],
    pillars: ['Educational', 'Artist Spotlight'],
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

  const availablePillars: ContentPillar[] = [
    'Funny', 'Educational', 'Informational', 'Sales',
    'Behind the Scenes', 'Artist Spotlight', 'Client Stories', 'Studio Vibe'
  ];

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 glass rounded-3xl shadow-2xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Step {step} of 3</span>
          <div className="flex space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${step >= i ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Studio Identity</h2>
          <p className="text-slate-400">Paste your Google Business Profile link to help us analyze your studio's unique style and reputation.</p>
          <div>
            <label className="block text-sm font-medium mb-2">Google Business Link</label>
            <input 
              type="text" 
              placeholder="https://maps.app.goo.gl/..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={prefs.gbpLink}
              onChange={e => setPrefs({...prefs, gbpLink: e.target.value})}
            />
          </div>
          <button 
            disabled={!prefs.gbpLink}
            onClick={nextStep}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Social Strategy</h2>
          
          <div>
            <label className="block text-sm font-medium mb-3">Platforms you use:</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Instagram', 'TikTok', 'Facebook', 'GBP'] as Platform[]).map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all ${prefs.platforms.includes(p) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">How often can you post per week?</label>
            <input 
              type="range" min="1" max="7" 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              value={prefs.frequencyPerWeek}
              onChange={e => setPrefs({...prefs, frequencyPerWeek: parseInt(e.target.value)})}
            />
            <div className="text-center mt-2 text-indigo-400 font-bold">{prefs.frequencyPerWeek} days / week</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Content Pillars (Select up to 4):</label>
            <div className="flex flex-wrap gap-2">
              {availablePillars.map(pillar => (
                <button
                  key={pillar}
                  onClick={() => togglePillar(pillar)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${prefs.pillars.includes(pillar) ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Formats you're comfortable with:</label>
            <div className="flex flex-wrap gap-2">
              {(['Reels', 'Single Image', 'Carousels', 'Stories', 'Videos', 'Short-form videos'] as ContentFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => toggleFormat(f)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-all ${prefs.formats.includes(f) ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button onClick={prevStep} className="flex-1 bg-slate-800 text-white py-4 rounded-xl">Back</button>
            <button onClick={nextStep} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">The Team</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team Size</label>
              <input 
                type="number" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                value={prefs.teamSize}
                onChange={e => setPrefs({...prefs, teamSize: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Social Experience</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                value={prefs.experienceLevel}
                onChange={e => setPrefs({...prefs, experienceLevel: e.target.value as any})}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Who does what? (Roles)</label>
            <textarea 
              rows={3}
              placeholder="e.g. Manager takes photos, Artists write captions..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={prefs.teamRoles}
              onChange={e => setPrefs({...prefs, teamRoles: e.target.value})}
            />
          </div>

          <div className="flex space-x-4">
            <button onClick={prevStep} className="flex-1 bg-slate-800 text-white py-4 rounded-xl">Back</button>
            <button 
              onClick={() => onComplete(prefs)} 
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20"
            >
              Generate 30-Day Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
