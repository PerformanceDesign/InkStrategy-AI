
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import LoadingScreen from './components/LoadingScreen';
import IdeaCard from './components/IdeaCard';
import IdeaDetail from './components/IdeaDetail';
import CalendarView from './components/CalendarView';
import { analyzeAndGeneratePlan } from './geminiService';
import { UserPreferences, ContentIdea, StudioInfo, Platform } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'onboarding' | 'kanban' | 'calendar'>('onboarding');
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [studio, setStudio] = useState<StudioInfo | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartOnboarding = (p: UserPreferences) => {
    setPrefs(p);
    generatePlan(p);
  };

  const generatePlan = async (p: UserPreferences) => {
    setLoading(true);
    setError(null);
    try {
      const { studio: studioData, ideas: ideaData } = await analyzeAndGeneratePlan(p);
      setStudio(studioData);
      setIdeas(ideaData);
      setView('kanban');
    } catch (e: any) {
      console.error(e);
      const isRateLimit = e?.message?.includes('429');
      setError(isRateLimit 
        ? "API Quota Exceeded. Please wait a minute and try again, or check your API billing status." 
        : "Failed to analyze profile. Please check the link and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const handleDuplicateIdea = (idea: ContentIdea, toPlatform: Platform) => {
    const newIdea = {
      ...idea,
      id: Math.random().toString(36).substr(2, 9),
      platform: toPlatform,
      status: 'Draft',
      scheduledDate: undefined
    };
    setIdeas(prev => [...prev, newIdea as ContentIdea]);
  };

  const handleUpdateIdea = (updated: ContentIdea) => {
    setIdeas(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSelectedIdea(updated);
  };

  const renderKanban = () => {
    const platforms: Platform[] = ['Instagram', 'TikTok', 'Facebook', 'GBP'];
    return (
      <div className="flex space-x-6 overflow-x-auto pb-8 min-h-[70vh] custom-scrollbar">
        {platforms.map(p => (
          <div key={p} className="flex-shrink-0 w-80 bg-slate-900/50 rounded-2xl p-4 flex flex-col border border-slate-800">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold flex items-center space-x-2">
                <span>{p === 'Instagram' ? '📸' : p === 'TikTok' ? '🎵' : p === 'Facebook' ? '👤' : '🏢'}</span>
                <span>{p}</span>
                <span className="ml-2 text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {ideas.filter(i => i.platform === p).length}
                </span>
              </h3>
            </div>
            <div className="space-y-4 flex-1">
              {ideas.filter(i => i.platform === p).map(idea => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  onSelect={setSelectedIdea} 
                  onDelete={handleDeleteIdea}
                  onDuplicate={handleDuplicateIdea}
                />
              ))}
              {ideas.filter(i => i.platform === p).length === 0 && (
                <div className="text-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                  No ideas for {p}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {loading && <LoadingScreen />}
      
      <header className="px-8 py-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">IS</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">INKSTRATEGY AI</h1>
            {studio && <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{studio.name}</p>}
          </div>
        </div>

        {view !== 'onboarding' && (
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              KANBAN
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              CALENDAR
            </button>
          </div>
        )}

        {view !== 'onboarding' && (
          <button 
            onClick={() => setView('onboarding')}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>SETTINGS</span>
          </button>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto p-8">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {view === 'onboarding' && <Onboarding onComplete={handleStartOnboarding} />}
        
        {view === 'kanban' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold mb-2">Content Board</h2>
                <p className="text-slate-400">Drag to reorder or click an idea to expand it with AI.</p>
              </div>
              <button 
                onClick={() => prefs && generatePlan(prefs)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition-all"
              >
                Regenerate Plan
              </button>
            </div>
            {renderKanban()}
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Content Calendar</h2>
                  <p className="text-slate-400">Overview of your scheduled posts for the next 30 days.</p>
                </div>
              </div>
            <CalendarView ideas={ideas} />
          </div>
        )}
      </main>

      {selectedIdea && studio && (
        <IdeaDetail 
          idea={selectedIdea} 
          studio={studio} 
          onClose={() => setSelectedIdea(null)} 
          onUpdate={handleUpdateIdea}
          onDuplicate={handleDuplicateIdea}
        />
      )}
    </div>
  );
};

export default App;
