
import React from 'react';
import { ContentIdea, Platform } from '../types';

interface IdeaCardProps {
  idea: ContentIdea;
  onSelect: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
  onDuplicate: (idea: ContentIdea, toPlatform: Platform) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect, onDelete, onDuplicate }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ideaId', idea.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm group hover:border-indigo-500 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
          {idea.format}
        </span>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            title="Duplicate to same platform"
            onClick={(e) => { e.stopPropagation(); onDuplicate(idea, idea.platform); }} 
            className="p-1 hover:text-indigo-400 text-slate-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }} 
            className="p-1 hover:text-red-400 text-slate-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
      
      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{idea.title}</h3>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{idea.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex space-x-2">
          {idea.status === 'Expanded' && (
            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded">Expanded</span>
          )}
          {idea.scheduledDate && (
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 rounded">📅 {new Date(idea.scheduledDate).toLocaleDateString()}</span>
          )}
        </div>
        <button 
          onClick={() => onSelect(idea)}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center"
        >
          Details
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default IdeaCard;
