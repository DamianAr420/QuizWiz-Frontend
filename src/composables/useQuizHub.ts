import { onUnmounted, ref } from "vue";
import type { GameState, NewQuestionData } from "@/types/quiz";
import { signalRService } from "@/services/signalrService";
import type { GameFinishedData, PlayerReward } from "@/types/reward";

interface ExtendedGameState extends GameState {
  currentIndex: number;
  answeredPlayerIds: number[];
  rewards: Record<string, PlayerReward>;
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
  });

  const initHub = async (lobbyId: string) => {
    currentLobbyId.value = lobbyId.toLowerCase();
    isFinished.value = false;

    signalRService.off("NewQuestion");
    signalRService.off("ReconnectedToGame");
    signalRService.off("PlayerSubmitted");
    signalRService.off("GameFinished");

    signalRService.on("NewQuestion", (data: NewQuestionData) => {
      console.log("Otrzymano nowe pytanie z serwera:", data);
      gameState.value.isStarted = true;
      gameState.value.currentQuestion = data.text;
      gameState.value.answers = data.answers;
      gameState.value.endTime = data.endTime;
      gameState.value.currentIndex = data.currentIndex;
      gameState.value.hasAnswered = false;
      gameState.value.answeredPlayerIds = [];
    });

    signalRService.on("ReconnectedToGame", (data: any) => {
      gameState.value.isStarted = true;
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
      gameState.value.isStarted = false;
      gameState.value.rewards = data.rewards;
      isFinished.value = true;
      console.log(data.rewards);
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
    console.log("Wysyłanie odpowiedzi:", answer);

    try {
      await signalRService.invoke(
        "SubmitAnswer",
        currentLobbyId.value,
        gameState.value.currentIndex,
        answer,
      );
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
  });

  return { gameState, isFinished, initHub, submitAnswer };
}
