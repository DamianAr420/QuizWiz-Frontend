export interface PlayerReward {
  experience: number;
  points: number;
  isWinner: boolean;
  correctAnswers: number;
}

export interface GameFinishedData {
  scores: Record<string, number>;
  winners: number[];
  rewards: Record<string, PlayerReward>;
}
