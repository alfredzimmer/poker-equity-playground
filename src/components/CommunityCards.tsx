'use client';

import CardPicker from './CardPicker';
import type { Card } from '@/lib/types';

interface CommunityCardsProps {
  cards: (Card | null)[];
  usedCards: (Card | null)[];
  onCardSelect: (index: number, card: Card | null) => void;
}

export default function CommunityCards({ cards, usedCards, onCardSelect }: CommunityCardsProps) {
  const cardLabels = ['Flop 1', 'Flop 2', 'Flop 3', 'Turn', 'River'];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Community Cards
      </h3>
      <div className="flex gap-3 flex-wrap">
        {cards.map((card, index) => (
          <CardPicker
            key={index}
            label={cardLabels[index]}
            selectedCard={card}
            usedCards={usedCards}
            onSelect={(selectedCard) => onCardSelect(index, selectedCard)}
          />
        ))}
      </div>
    </div>
  );
}
