
import React, { useState } from 'react';
import { ContentIdea, Platform, StudioInfo } from '../types';
import { expandIdeaContent, generateBlogPost } from '../geminiService';

interface IdeaDetailProps {
  idea: ContentIdea;
  studio: StudioInfo;
  onUpdate: (updatedIdea: ContentIdea) => void;
  onClose: () => void;
  onDuplicate: (idea: ContentIdea, platform: Platform) => void;
}

const IdeaDetail: React.FC<IdeaDetailProps> = ({ idea, studio, onUpdate, onClose, onDuplicate }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'social' | 'blog'>('social');

  const handleExpand = async () => {
    setLoading(true);
    try {
      const result = await expandIdeaContent(idea, studio);
      onUpdate({ ...idea, expandedContent: result, status: 'Expanded' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlog = async () => {
    setLoading(true);
    try {
      const result = await generateBlogPost(idea, studio);
      onUpdate({ ...idea, blogPost: result });
      setActiveTab('blog');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setSchedule = (date: string) => {
    onUpdate({ ...idea, scheduledDate: date, status: 'Scheduled' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold">{idea.title}</h2>
            <p className="text-sm text-slate-400">{idea.platform} • {idea.format}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex space-x-6 mb-8">
            <div className="flex-1 space-y-4">
              <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Base Concept</label>
              <div className="p-4 bg-slate-900 rounded-xl text-slate-300">{idea.description}</div>
              
              <div className="flex space-x-2">
                {['Facebook', 'Instagram', 'TikTok', 'GBP'].map((p) => (
                  idea.platform !== p && (
                    <button 
                      key={p}
                      onClick={() => onDuplicate(idea, p as Platform)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-xs rounded-full transition-colors"
                    >
                      Copy to {p}
                    </button>
                  )
                ))}
              </div>
            </div>

            <div className="w-64 space-y-4">
              <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Schedule</label>
              <input 
                type="date" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                value={idea.scheduledDate || ''}
                onChange={(e) => setSchedule(e.target.value)}
              />
              <button 
                onClick={handleExpand}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
              >
                {loading ? 'Thinking...' : 'Expand Content'}
              </button>
              <button 
                onClick={handleGenerateBlog}
                disabled={loading}
                className="w-full border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white py-3 rounded-xl font-bold transition-all"
              >
                Create Blog Post
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
             <div className="flex space-x-8 mb-6 border-b border-slate-700">
                <button 
                  onClick={() => setActiveTab('social')}
                  className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'social' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
                >
                  Social Content
                </button>
                <button 
                  onClick={() => setActiveTab('blog')}
                  className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'blog' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
                >
                  Blog Article
                </button>
             </div>

             <div className="min-h-[200px] prose prose-invert max-w-none">
                {activeTab === 'social' ? (
                  idea.expandedContent ? (
                    <div className="whitespace-pre-wrap bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-inner">
                      {idea.expandedContent}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                      Click "Expand Content" to generate hooks, captions, and visual instructions.
                    </div>
                  )
                ) : (
                  idea.blogPost ? (
                    <div className="whitespace-pre-wrap bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-inner">
                      {idea.blogPost}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                      Click "Create Blog Post" to generate a full SEO-friendly article.
                    </div>
                  )
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
