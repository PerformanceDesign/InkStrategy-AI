
import React from 'react';
import { ContentIdea } from '../types';

interface CalendarViewProps {
  ideas: ContentIdea[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ ideas }) => {
  const daysInMonth = 30; // Mock for a 30-day view
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getPostsForDay = (day: number) => {
    return ideas.filter(idea => {
      if (!idea.scheduledDate) return false;
      const d = new Date(idea.scheduledDate).getDate();
      return d === day;
    });
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <div key={day} className="bg-slate-900 p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          {day}
        </div>
      ))}
      {days.map(day => {
        const posts = getPostsForDay(day);
        return (
          <div key={day} className="bg-slate-800 min-h-[120px] p-2 hover:bg-slate-750 transition-colors">
            <span className="text-xs font-bold text-slate-500">{day}</span>
            <div className="mt-2 space-y-1">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                    post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-300' :
                    post.platform === 'TikTok' ? 'bg-slate-400/20 text-slate-300' :
                    post.platform === 'Facebook' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}
                >
                  {post.platform}: {post.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarView;
