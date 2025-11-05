// Simplified poker hand evaluator for browser
// Ranks: 2=2, 3=3, ..., T=10, J=11, Q=12, K=13, A=14

export type HandRank = 
  | 'High Card'
  | 'One Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

interface HandResult {
  rank: number; // 0-9, higher is better
  value: number; // Tiebreaker value, lower is better (for compatibility)
  name: HandRank;
  cards: string[];
}

const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const RANK_ORDER = '23456789TJQKA';

function parseCard(card: string): { rank: number; suit: string } {
  return {
    rank: RANK_VALUES[card[0]],
    suit: card[1]
  };
}

function sortByRank(cards: { rank: number; suit: string }[]): { rank: number; suit: string }[] {
  return [...cards].sort((a, b) => b.rank - a.rank);
}

function getRankCounts(cards: { rank: number; suit: string }[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

function isFlush(cards: { rank: number; suit: string }[]): boolean {
  const suits = new Set(cards.map(c => c.suit));
  return suits.size === 1;
}

function isStraight(cards: { rank: number; suit: string }[]): boolean {
  const sorted = sortByRank(cards);
  
  // Check for ace-low straight (A-2-3-4-5)
  if (sorted[0].rank === 14 && sorted[1].rank === 5 && sorted[2].rank === 4 && 
      sorted[3].rank === 3 && sorted[4].rank === 2) {
    return true;
  }
  
  // Check for regular straight
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].rank - sorted[i + 1].rank !== 1) {
      return false;
    }
  }
  return true;
}

function evaluateHand(cards: { rank: number; suit: string }[]): HandResult {
  const sorted = sortByRank(cards);
  const rankCounts = getRankCounts(cards);
  const counts = Array.from(rankCounts.entries()).sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  
  const isFlushHand = isFlush(cards);
  const isStraightHand = isStraight(cards);
  
  // Royal Flush
  if (isFlushHand && isStraightHand && sorted[0].rank === 14 && sorted[1].rank === 13) {
    return {
      rank: 9,
      value: 1,
      name: 'Royal Flush',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Straight Flush
  if (isFlushHand && isStraightHand) {
    const highCard = sorted[1].rank === 5 && sorted[0].rank === 14 ? 5 : sorted[0].rank;
    return {
      rank: 8,
      value: 10 + (14 - highCard),
      name: 'Straight Flush',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Four of a Kind
  if (counts[0][1] === 4) {
    return {
      rank: 7,
      value: 20 + (14 - counts[0][0]) + (14 - counts[1][0]) / 100,
      name: 'Four of a Kind',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Full House
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return {
      rank: 6,
      value: 40 + (14 - counts[0][0]) + (14 - counts[1][0]) / 100,
      name: 'Full House',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Flush
  if (isFlushHand) {
    const tiebreaker = sorted.reduce((acc, card, i) => acc + (14 - card.rank) / Math.pow(100, i + 1), 0);
    return {
      rank: 5,
      value: 60 + tiebreaker,
      name: 'Flush',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Straight
  if (isStraightHand) {
    const highCard = sorted[1].rank === 5 && sorted[0].rank === 14 ? 5 : sorted[0].rank;
    return {
      rank: 4,
      value: 80 + (14 - highCard),
      name: 'Straight',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Three of a Kind
  if (counts[0][1] === 3) {
    const tiebreaker = (14 - counts[0][0]) + (14 - counts[1][0]) / 100 + (14 - counts[2][0]) / 10000;
    return {
      rank: 3,
      value: 100 + tiebreaker,
      name: 'Three of a Kind',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // Two Pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const tiebreaker = (14 - counts[0][0]) + (14 - counts[1][0]) / 100 + (14 - counts[2][0]) / 10000;
    return {
      rank: 2,
      value: 120 + tiebreaker,
      name: 'Two Pair',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // One Pair
  if (counts[0][1] === 2) {
    const tiebreaker = (14 - counts[0][0]) + 
                       (14 - counts[1][0]) / 100 + 
                       (14 - counts[2][0]) / 10000 + 
                       (14 - counts[3][0]) / 1000000;
    return {
      rank: 1,
      value: 140 + tiebreaker,
      name: 'One Pair',
      cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
    };
  }
  
  // High Card
  const tiebreaker = sorted.reduce((acc, card, i) => acc + (14 - card.rank) / Math.pow(100, i + 1), 0);
  return {
    rank: 0,
    value: 160 + tiebreaker,
    name: 'High Card',
    cards: sorted.map((_, i) => cards[i].rank + cards[i].suit)
  };
}

export function evalHand(cards: string[]): HandResult {
  if (cards.length !== 7) {
    throw new Error('Must provide exactly 7 cards');
  }
  
  const parsedCards = cards.map(parseCard);
  
  // Generate all possible 5-card combinations
  const combinations: { rank: number; suit: string }[][] = [];
  
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      for (let k = j + 1; k < 7; k++) {
        for (let l = k + 1; l < 7; l++) {
          for (let m = l + 1; m < 7; m++) {
            combinations.push([
              parsedCards[i],
              parsedCards[j],
              parsedCards[k],
              parsedCards[l],
              parsedCards[m]
            ]);
          }
        }
      }
    }
  }
  
  // Find the best hand
  let bestHand = evaluateHand(combinations[0]);
  
  for (const combo of combinations) {
    const hand = evaluateHand(combo);
    if (hand.rank > bestHand.rank || (hand.rank === bestHand.rank && hand.value < bestHand.value)) {
      bestHand = hand;
    }
  }
  
  return bestHand;
}
