
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
  const [lastNonOnboardingView, setLastNonOnboardingView] = useState<'kanban' | 'calendar'>('kanban');
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [studio, setStudio] = useState<StudioInfo | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleStartOnboarding = (p: UserPreferences) => {
    setPrefs(p);
    generatePlan(p);
  };

  const handleCancelOnboarding = () => {
    if (studio && ideas.length > 0) {
      setView(lastNonOnboardingView);
    }
  };

  const generatePlan = async (p: UserPreferences) => {
    setLoading(true);
    setError(null);
    try {
      const { studio: studioData, ideas: ideaData } = await analyzeAndGeneratePlan(p);
      setStudio(studioData);
      setIdeas(ideaData);
      setView('kanban');
      setLastNonOnboardingView('kanban');
    } catch (e: any) {
      console.error(e);
      const isRateLimit = e?.message?.includes('429');
      setError(isRateLimit 
        ? "API Quota Exceeded. Please wait a minute and try again." 
        : "Failed to analyze profile. Please check the link and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const handleDuplicateIdea = (idea: ContentIdea, toPlatform: Platform) => {
    const newIdea: ContentIdea = {
      ...idea,
      id: Math.random().toString(36).substr(2, 9),
      platform: toPlatform,
      status: 'Draft',
      scheduledDate: undefined,
      expandedContent: idea.expandedContent,
      blogPost: idea.blogPost
    };
    setIdeas(prev => [...prev, newIdea]);
    setNotification(`Idea copied to ${toPlatform}!`);
  };

  const handleUpdateIdea = (updated: ContentIdea) => {
    setIdeas(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSelectedIdea(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPlatform: Platform) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData('ideaId');
    if (!ideaId) return;
    
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, platform: targetPlatform } : idea
    ));
  };

  const renderKanban = () => {
    const platforms: Platform[] = ['Instagram', 'TikTok', 'Facebook', 'GBP'];
    return (
      <div className="flex flex-row overflow-x-auto gap-6 pb-12 min-h-[75vh] custom-scrollbar snap-x">
        {platforms.map(p => (
          <div 
            key={p} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, p)}
            className="flex flex-col bg-slate-900/50 rounded-2xl p-5 border border-slate-800 transition-colors hover:bg-slate-900/70 min-w-[320px] max-w-[400px] flex-1 snap-start"
          >
            <div className="flex items-center justify-between mb-5 px-1">
              <h3 className="font-black uppercase tracking-widest text-sm flex items-center space-x-3">
                <span className="text-xl">{p === 'Instagram' ? '📸' : p === 'TikTok' ? '🎵' : p === 'Facebook' ? '👤' : '🏢'}</span>
                <span>{p}</span>
                <span className="ml-2 text-[10px] bg-slate-800 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {ideas.filter(i => i.platform === p).length}
                </span>
              </h3>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
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
                <div className="text-center py-16 text-slate-700 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <p className="text-xs font-bold uppercase tracking-widest">No Ideas Yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0a0f1c]">
      {loading && <LoadingScreen />}
      
      {notification && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm tracking-widest animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300 uppercase">
          {notification}
        </div>
      )}

      <header className="px-10 py-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-indigo-600/30 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">IS</div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
              <span>Home</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-indigo-400">{view === 'onboarding' ? 'Onboarding' : view === 'kanban' ? 'Content Board' : 'Calendar'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter">INKSTRATEGY AI</h1>
          </div>
        </div>

        {view !== 'onboarding' && (
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setView('kanban'); setLastNonOnboardingView('kanban'); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${view === 'kanban' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              KANBAN
            </button>
            <button 
              onClick={() => { setView('calendar'); setLastNonOnboardingView('calendar'); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              CALENDAR
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {studio && (
            <div className="hidden md:block text-right mr-4 border-r border-slate-800 pr-4 max-w-xs">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">{studio.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{studio.vibe}</p>
            </div>
          )}
          {view !== 'onboarding' && (
            <button 
              onClick={() => setView('onboarding')}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700 shadow-lg"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-10 py-10 overflow-hidden">
        {error && (
          <div className="mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-sm flex items-center justify-between shadow-lg backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] mb-0.5">Alert</p>
                <p className="font-bold">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {view === 'onboarding' && (
          <Onboarding 
            onComplete={handleStartOnboarding} 
            onCancel={studio ? handleCancelOnboarding : undefined} 
          />
        )}
        
        {view === 'kanban' && (
          <div className="space-y-10 animate-in fade-in duration-700 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">Content Board</h2>
                <p className="text-slate-500 max-w-2xl font-medium">Map out your presence across platforms. Swipe or scroll horizontally to see all channels.</p>
              </div>
              <button 
                onClick={() => prefs && generatePlan(prefs)}
                className="bg-slate-900/50 hover:bg-indigo-600 text-slate-300 hover:text-white px-8 py-4 rounded-2xl text-xs font-black tracking-widest border border-slate-800 hover:border-indigo-500 transition-all shadow-xl uppercase"
              >
                Refresh Strategy
              </button>
            </div>
            {renderKanban()}
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">Content Calendar</h2>
                  <p className="text-slate-500 font-medium">Master your schedule for the next 30 days.</p>
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
