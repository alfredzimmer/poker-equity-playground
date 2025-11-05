import type { Card, Suit, Rank } from '@/lib/types';
import { SUITS, RANKS } from '@/lib/deck';

interface CardSelectorProps {
  selectedCard: Card | null;
  usedCards: (Card | null)[];
  onSelect: (card: Card | null) => void;
  label: string;
}

export default function CardSelector({ selectedCard, usedCards, onSelect, label }: CardSelectorProps) {
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

  const isCardSelected = (rank: Rank, suit: Suit) => {
    return selectedCard?.rank === rank && selectedCard?.suit === suit;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedCard ? (
            <span className={`text-2xl font-bold ${suitColors[selectedCard.suit]}`}>
              {selectedCard.rank}{suitSymbols[selectedCard.suit]}
            </span>
          ) : (
            <span className="text-gray-500">Select a card</span>
          )}
        </button>
        
        <div className="absolute z-10 mt-1 w-full max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hidden group-hover:block">
          <div className="p-2">
            {SUITS.map(suit => (
              <div key={suit} className="mb-2">
                <div className="grid grid-cols-13 gap-1">
                  {RANKS.map(rank => {
                    const used = isCardUsed(rank, suit);
                    const selected = isCardSelected(rank, suit);
                    
                    return (
                      <button
                        key={`${rank}-${suit}`}
                        type="button"
                        onClick={() => !used && onSelect({ rank, suit })}
                        disabled={used}
                        className={`
                          p-2 text-center text-sm font-bold rounded transition-colors
                          ${used ? 'opacity-30 cursor-not-allowed bg-gray-200 dark:bg-gray-700' : 
                            selected ? 'bg-blue-500 text-white' :
                            'bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          ${!used && !selected ? suitColors[suit] : ''}
                        `}
                      >
                        {rank}{suitSymbols[suit]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
