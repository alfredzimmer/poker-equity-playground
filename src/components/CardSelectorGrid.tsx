'use client';

import type { Card, Suit, Rank } from '@/lib/types';
import { SUITS, RANKS } from '@/lib/deck';

interface CardSelectorGridProps {
  usedCards: (Card | null)[];
  onCardSelect: (card: Card) => void;
}

export default function CardSelectorGrid({ usedCards, onCardSelect }: CardSelectorGridProps) {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  const suitColors: Record<Suit, string> = {
    hearts: 'text-red-600',
    diamonds: 'text-red-600',
    clubs: 'text-gray-900 dark:text-white',
    spades: 'text-gray-900 dark:text-white'
  };

  const isCardUsed = (rank: Rank, suit: Suit) => {
    return usedCards.some(card => 
      card && card.rank === rank && card.suit === suit
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="space-y-2">
        {SUITS.map(suit => (
          <div key={suit} className="flex gap-1.5 justify-center">
            {RANKS.map(rank => {
              const used = isCardUsed(rank, suit);
              
              return (
                <button
                  key={`${rank}-${suit}`}
                  type="button"
                  onClick={() => !used && onCardSelect({ rank, suit })}
                  disabled={used}
                  className={`
                    w-12 h-16 text-xs font-bold rounded border-2 transition-all
                    ${used ? 
                      'opacity-30 cursor-not-allowed bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 
                      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-md hover:scale-105 cursor-pointer'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-xs ${!used ? suitColors[suit] : 'text-gray-400'}`}>
                      {rank}
                    </span>
                    <span className={`text-3xl leading-none ${!used ? suitColors[suit] : 'text-gray-400'}`}>
                      {suitSymbols[suit]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
