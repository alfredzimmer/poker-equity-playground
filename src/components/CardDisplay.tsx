'use client';

import type { Card, Suit, Rank } from '@/lib/types';
import { SUITS, RANKS } from '@/lib/deck';

interface CardDisplayProps {
  card: Card | null;
  onClick?: () => void;
  isSelectable?: boolean;
}

export default function CardDisplay({ card, onClick, isSelectable = false }: CardDisplayProps) {
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

  if (!card) {
    return (
      <button
        onClick={onClick}
        disabled={!isSelectable}
        className={`
          w-24 h-36 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 
          rounded-lg flex items-center justify-center
          ${isSelectable ? 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'}
          transition-colors
        `}
      >
        <span className="text-5xl text-gray-400">?</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-24 h-36 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 
        rounded-lg flex flex-col items-center justify-center
        ${onClick ? 'hover:border-red-500 hover:shadow-md cursor-pointer' : 'cursor-default'}
        transition-all
      `}
    >
      <span className="text-sm text-gray-500 dark:text-gray-400">{card.rank}</span>
      <span className={`text-5xl ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </span>
    </button>
  );
}
