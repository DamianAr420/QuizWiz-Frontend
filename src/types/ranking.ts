export type RankingType =
  | "experience"
  | "points"
  | "correctanswers"
  | "accuracy"
  | "quizzescompleted";

export interface RankingEntry {
  id: number;
  displayName?: string;
  DisplayName?: string;
  experience?: number;
  level?: number;
  points?: number;
  correctAnswers?: number;
  accuracy?: number;
  completed?: number;
  cloudinaryPublicId?: string;
  CloudinaryPublicId?: string;
}
