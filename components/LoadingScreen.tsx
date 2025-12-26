
import React, { useState, useEffect } from 'react';

const messages = [
  "Sterilizing the needles...",
  "Sketching your content plan...",
  "Analyzing your studio's vibe...",
  "Checking Google reviews for inspiration...",
  "Mixing the perfect ink for your brand...",
  "Stenciling your 30-day strategy...",
  "Preparing the piercing station...",
  "Polishing your social media presence..."
];

const LoadingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 bg-opacity-95 backdrop-blur-md">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-purple-500 border-b-transparent rounded-full animate-spin-slow"></div>
        <div className="absolute inset-8 border-4 border-pink-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
        {messages[msgIndex]}
      </h2>
      <p className="text-slate-400">Our AI is hard at work building your strategy.</p>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
