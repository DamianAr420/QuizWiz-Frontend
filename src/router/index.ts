import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Home from "@/views/Home.vue";
import Profile from "@/views/Profile.vue";
import Leaderboard from "@/views/Leaderboard.vue";
import QuizList from "@/views/QuizList.vue";
import QuizDetail from "@/views/QuizDetail.vue";
import QuizPlay from "@/views/QuizPlay.vue";
import QuizForm from "@/views/QuizForm.vue";
import Shop from "@/views/Shop.vue";
import AdminPanel from "@/views/AdminPanel.vue";
import Friends from "@/views/Friends.vue";
// @ts-ignore
import LobbyBrowser from "@/views/LobbyBrowser.vue";
// @ts-ignore
import LobbyCreator from "@/views/LobbyCreator.vue";
// @ts-ignore
import LobbyRoom from "@/views/LobbyRoom.vue";
import MultiplayerGame from "@/views/MultiplayerGame.vue";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/leaderboard",
    name: "leaderboard",
    component: Leaderboard,
  },
  {
    path: "/quiz",
    name: "quiz-list",
    component: QuizList,
  },
  {
    path: "/quiz/create",
    name: "quiz-create",
    component: QuizForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/quiz/edit/:id",
    name: "quiz-edit",
    component: QuizForm,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/quiz/:id",
    name: "quiz-detail",
    component: QuizDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/quiz/:id/play",
    name: "quiz-play",
    component: QuizPlay,
    props: true,
    meta: { requiresAuth: true, hideHexBg: true },
  },
  {
    path: "/shop",
    name: "shop",
    component: Shop,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/friends",
    name: "friends",
    component: Friends,
    meta: { requiresAuth: true },
  },
  {
    path: "/multiplayer",
    name: "lobby-browser",
    component: LobbyBrowser,
    meta: { requiresAuth: true },
  },
  {
    path: "/multiplayer/create",
    name: "lobby-create",
    component: LobbyCreator,
    meta: { requiresAuth: true },
  },
  {
    path: "/multiplayer/lobby/:id",
    name: "lobby-room",
    component: LobbyRoom,
    props: true,
    meta: { requiresAuth: true, hideHexBg: true },
  },
  {
    path: "/play/:id",
    name: "multiplayer-play",
    component: MultiplayerGame,
    props: true,
    meta: { requiresAuth: true, hideHexBg: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const chatStore = useChatStore();

  chatStore.openChats = [];
  chatStore.isFriendsListOpen = false;

  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.user?.role === "Admin";

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next("/quiz");
  } else {
    next();
  }
});

export default router;
