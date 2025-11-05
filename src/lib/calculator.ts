import { evalHand } from './pokerEvaluator';
import type { Card, Player, OddsResult } from './types';
import { createDeck, cardToPokerEvaluatorString, shuffleArray, cardsEqual } from './deck';

interface SimulationResult {
  wins: number[];
  ties: number[];
}

export function calculateOdds(
  players: Player[],
  communityCards: (Card | null)[],
  simulations = 10000
): OddsResult[] {
  // Filter out players with incomplete hands
  const validPlayers = players.filter(p => p.cards[0] && p.cards[1]);
  
  if (validPlayers.length < 2) {
    return players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      winPercentage: 0,
      tiePercentage: 0
    }));
  }

  // Get all cards currently in use
  const usedCards: Card[] = [];
  for (const player of validPlayers) {
    if (player.cards[0]) usedCards.push(player.cards[0]);
    if (player.cards[1]) usedCards.push(player.cards[1]);
  }
  for (const card of communityCards) {
    if (card) usedCards.push(card);
  }

  // Run Monte Carlo simulation
  const result = runSimulation(validPlayers, communityCards, usedCards, simulations);

  // Calculate percentages
  return validPlayers.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    winPercentage: (result.wins[index] / simulations) * 100,
    tiePercentage: (result.ties[index] / simulations) * 100
  }));
}

function runSimulation(
  players: Player[],
  communityCards: (Card | null)[],
  usedCards: Card[],
  simulations: number
): SimulationResult {
  const wins = new Array(players.length).fill(0);
  const ties = new Array(players.length).fill(0);

  // Create available deck
  const fullDeck = createDeck();
  const availableDeck = fullDeck.filter(card => 
    !usedCards.some(used => cardsEqual(card, used))
  );

  for (let sim = 0; sim < simulations; sim++) {
    const shuffled = shuffleArray(availableDeck);
    
    // Complete the community cards
    const finalCommunity: Card[] = [];
    let deckIndex = 0;
    
    for (let i = 0; i < 5; i++) {
      if (communityCards[i]) {
        finalCommunity.push(communityCards[i]!);
      } else {
        finalCommunity.push(shuffled[deckIndex++]);
      }
    }

    // Evaluate each player's hand
    const handStrengths = players.map(player => {
      try {
        const playerCards = [
          cardToPokerEvaluatorString(player.cards[0]!),
          cardToPokerEvaluatorString(player.cards[1]!)
        ];
        const communityCardsStr = finalCommunity.map(cardToPokerEvaluatorString);
        const allCards = [...playerCards, ...communityCardsStr];
        
        return evalHand(allCards);
      } catch (e) {
        return { value: 10000, rank: -1, name: 'High Card' as const, cards: [] }; // Worst possible hand
      }
    });

    // Find winner(s) - lower value is better in poker-evaluator
    const bestValue = Math.min(...handStrengths.map(h => h.value));
    const winners = handStrengths
      .map((h, i) => ({ strength: h.value, index: i }))
      .filter(h => h.strength === bestValue);

    if (winners.length === 1) {
      wins[winners[0].index]++;
    } else {
      // It's a tie
      for (const winner of winners) {
        ties[winner.index]++;
      }
    }
  }

  return { wins, ties };
}
