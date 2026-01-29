import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Home from "@/views/Home.vue";
import Profile from "@/views/Profile.vue";
import Leaderboard from "@/views/Leaderboard.vue";
import QuizList from "@/views/QuizList.vue";
import CreateQuiz from "@/views/CreateQuiz.vue";
import QuizPlay from "@/views/QuizPlay.vue";
import { useAuthStore } from "@/stores/auth";

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
    component: CreateQuiz,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/quiz/:id",
    name: "quiz-play",
    component: QuizPlay,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

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
