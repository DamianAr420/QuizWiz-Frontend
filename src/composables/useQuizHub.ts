import { onUnmounted, ref } from "vue";
import type { GameState, NewQuestionData } from "@/types/quiz";
import { signalRService } from "@/services/signalrService";
import type { GameFinishedData, PlayerReward } from "@/types/reward";

interface ExtendedGameState extends GameState {
  currentIndex: number;
  answeredPlayerIds: Array<string | number>;
  rewards: Record<string, PlayerReward>;
  correctAnswer: string | null;
  isRevealingAnswer: boolean;
}

interface ReconnectedGame {
  isStarted: boolean;
  questionText: string;
  answers: string[];
  currentIndex: number;
  endTime: string;
  scores: Record<string, number>;
  answeredPlayerIds: Array<string | number>;
}

export function useQuizHub() {
  const currentLobbyId = ref<string>("");
  const isFinished = ref<boolean>(false);

  const gameState = ref<ExtendedGameState>({
    isStarted: false,
    currentQuestion: null,
    answers: [],
    endTime: null,
    scores: {},
    hasAnswered: false,
    currentIndex: 0,
    answeredPlayerIds: [],
    rewards: {},
    correctAnswer: null,
    isRevealingAnswer: false,
  });

  const initHub = async (lobbyId: string) => {
    currentLobbyId.value = lobbyId.toLowerCase();
    isFinished.value = false;

    signalRService.off("NewQuestion");
    signalRService.off("ReconnectedToGame");
    signalRService.off("PlayerSubmitted");
    signalRService.off("GameFinished");
    signalRService.off("RevealAnswer");

    signalRService.on("NewQuestion", (data: NewQuestionData) => {
      gameState.value.isStarted = true;
      gameState.value.currentQuestion = data.text;
      gameState.value.answers = data.answers;
      gameState.value.endTime = data.endTime;
      gameState.value.currentIndex = data.currentIndex;
      gameState.value.hasAnswered = false;
      gameState.value.answeredPlayerIds = [];
      gameState.value.correctAnswer = null;
      gameState.value.isRevealingAnswer = false;
    });

    signalRService.on("ReconnectedToGame", (data: ReconnectedGame) => {
      gameState.value.isStarted = data.isStarted ?? true;
      gameState.value.currentQuestion = data.questionText;
      gameState.value.answers = data.answers;
      gameState.value.endTime = data.endTime;
      gameState.value.scores = data.scores;
      gameState.value.currentIndex = data.currentIndex;
      gameState.value.answeredPlayerIds = data.answeredPlayerIds || [];
    });

    signalRService.on("PlayerSubmitted", (userId: number) => {
      if (!gameState.value.answeredPlayerIds.includes(userId)) {
        gameState.value.answeredPlayerIds.push(userId);
      }
    });

    signalRService.on("GameFinished", (data: GameFinishedData) => {
      gameState.value.scores = data.scores;
      gameState.value.rewards = data.rewards;

      gameState.value.currentQuestion = null;
      gameState.value.answers = [];
      gameState.value.correctAnswer = null;
      gameState.value.hasAnswered = false;
      gameState.value.isRevealingAnswer = false;

      gameState.value.isStarted = false;
      isFinished.value = true;
    });

    signalRService.on("RevealAnswer", (data: { correctAnswer: string }) => {
      gameState.value.correctAnswer = data.correctAnswer;
      gameState.value.isRevealingAnswer = true;
    });

    if (!signalRService.isConnected) {
      await signalRService.startConnection();
    }

    try {
      await signalRService.invoke("JoinLobbyGroup", currentLobbyId.value);
    } catch (err) {
      console.error("Błąd JoinLobbyGroup:", err);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (gameState.value.hasAnswered) return;

    gameState.value.hasAnswered = true;

    try {
      await signalRService.invoke("SubmitAnswer", currentLobbyId.value, answer);
    } catch (err) {
      console.error("Błąd sieciowy, przywracanie możliwości kliknięcia:", err);
      gameState.value.hasAnswered = false;
    }
  };

  onUnmounted(() => {
    signalRService.off("NewQuestion");
    signalRService.off("GameFinished");
    signalRService.off("ReconnectedToGame");
    signalRService.off("PlayerSubmitted");
    signalRService.off("RevealAnswer");
  });

  return { gameState, isFinished, initHub, submitAnswer };
}
