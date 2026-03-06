import React from 'react';
import { CardData } from '../services/gemini';

interface CardPreviewProps {
  card: CardData;
  index: number;
  total: number;
  id: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card, index, total, id }) => {
  return (
    <div
      id={id}
      className="w-[1080px] h-[1440px] bg-[#09090B] flex flex-col font-sans text-white shrink-0 box-border relative overflow-hidden"
    >
      {/* Premium Dark Header */}
      <div className="flex items-center justify-between px-16 pt-16 pb-8 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-6">
          <div className="w-6 h-16 bg-gradient-to-b from-red-500 to-orange-500 rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
          <span className="text-[44px] font-black tracking-[0.15em] text-white uppercase">Tech Insights</span>
        </div>
        <div className="text-[40px] text-zinc-700 font-bold tracking-widest font-mono">{index}/{total}</div>
      </div>

      {/* Body */}
      <div className="flex-1 px-16 py-12 flex flex-col gap-10 overflow-hidden">
        {card.layout === 'image_top' && card.imageUrl && (
          <div className="w-full h-[480px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-zinc-900 relative">
            <img 
              src={card.imageUrl} 
              alt="Illustration" 
              className="w-full h-full object-cover opacity-90" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(card.title)}/1080/800`;
              }}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[32px]"></div>
          </div>
        )}

        <h1 className="text-[68px] font-black leading-[1.25] tracking-tight text-white shrink-0">
          {card.title}
        </h1>

        <div
          className="text-[38px] leading-[1.8] text-zinc-300 whitespace-pre-wrap font-normal flex-1 overflow-hidden"
          dangerouslySetInnerHTML={{ 
            __html: card.content
              .replace(/<b>/g, '<b class="text-white font-bold">')
              .replace(/<u>/g, '<u class="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black no-underline">') 
          }}
        />

        {card.layout === 'image_bottom' && card.imageUrl && (
          <div className="w-full h-[480px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 mt-auto shrink-0 bg-zinc-900 relative">
            <img 
              src={card.imageUrl} 
              alt="Illustration" 
              className="w-full h-full object-cover opacity-90" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(card.title)}/1080/800`;
              }}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[32px]"></div>
          </div>
        )}
      </div>

      {/* Premium Dark Footer */}
      <div className="px-16 pb-16 pt-8 flex justify-between items-center shrink-0 border-t border-white/10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">AI</div>
          <span className="text-[32px] font-bold text-zinc-500 tracking-wide">@巴顿带你看AI大事</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-600">
          <span className="text-[28px] font-medium tracking-widest uppercase">Swipe</span>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  );
};
