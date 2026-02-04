<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close"]);

const { t } = useI18n();
const authStore = useAuthStore();
const isLoginMode = ref(true);
const errorMessage = ref("");
const showPassword = ref(false);

const displayNameInput = ref<HTMLInputElement | null>(null);
const identifierInput = ref<HTMLInputElement | null>(null);

const form = ref({
  displayName: "",
  email: "",
  password: "",
});

const resetForm = () => {
  errorMessage.value = "";
  showPassword.value = false;
  form.value = { displayName: "", email: "", password: "" };
};

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
      await nextTick();
      if (isLoginMode.value) {
        identifierInput.value?.focus();
      } else {
        displayNameInput.value?.focus();
      }
    } else {
      document.body.style.overflow = "";
      resetForm();
    }
  },
  { immediate: true },
);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  resetForm();
};

const handleSubmit = async () => {
  errorMessage.value = "";
  try {
    if (isLoginMode.value) {
      await authStore.login(form.value.email, form.value.password);
    } else {
      await authStore.register(
        form.value.displayName,
        form.value.email,
        form.value.password,
      );
    }
    emit("close");
  } catch (err: any) {
    errorMessage.value = err;
  }
};

// Klasy Tailwind v4 z obsługą Dark Mode
const inputClasses =
  "w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-transparent peer";

const labelClasses =
  "absolute left-4 top-4 text-slate-400 pointer-events-none transition-all duration-200 origin-left peer-focus:-translate-y-10 peer-focus:scale-90 peer-focus:text-green-600 dark:peer-focus:text-green-400 peer-focus:font-bold peer-[:not(:placeholder-shown)]:-translate-y-10 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:text-green-600 dark:peer-[:not(:placeholder-shown)]:text-green-400 peer-[:not(:placeholder-shown)]:font-bold";
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
          @click="emit('close')"
        ></div>

        <div
          class="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          <div class="p-6 sm:p-8">
            <header class="text-center mb-10">
              <h2
                class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
              >
                {{ isLoginMode ? t("auth.welcome") : t("auth.join") }}
              </h2>
            </header>

            <Transition name="slide-up">
              <div
                v-if="errorMessage"
                class="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium"
              >
                {{ errorMessage }}
              </div>
            </Transition>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div v-if="!isLoginMode" class="relative">
                <input
                  ref="displayNameInput"
                  v-model="form.displayName"
                  type="text"
                  name="username"
                  autocomplete="username"
                  required
                  placeholder=" "
                  :class="inputClasses"
                />
                <label :class="labelClasses">{{ t("auth.displayName") }}</label>
              </div>

              <div class="relative">
                <input
                  ref="identifierInput"
                  v-model="form.email"
                  :type="isLoginMode ? 'text' : 'email'"
                  :name="isLoginMode ? 'username' : 'email'"
                  :autocomplete="isLoginMode ? 'username' : 'email'"
                  required
                  placeholder=" "
                  :class="inputClasses"
                />
                <label :class="labelClasses">
                  {{
                    isLoginMode
                      ? t("auth.placeholders.identifier")
                      : t("auth.placeholders.email")
                  }}
                </label>
              </div>

              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder=" "
                  :class="[inputClasses, 'pr-12']"
                />
                <label :class="labelClasses">{{
                  t("auth.placeholders.password")
                }}</label>
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:text-green-500 transition-colors z-10"
                >
                  {{ showPassword ? "👁️‍🗨️" : "👁️" }}
                </button>
              </div>

              <button
                type="submit"
                :disabled="authStore.loading"
                class="w-full bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-green-200 dark:shadow-none mt-4"
              >
                {{
                  authStore.loading
                    ? t("auth.loading")
                    : isLoginMode
                      ? t("auth.submitLogin")
                      : t("auth.submitRegister")
                }}
              </button>
            </form>

            <footer class="mt-8 text-center">
              <button
                @click="toggleMode"
                class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {{ isLoginMode ? t("auth.noAccount") : t("auth.hasAccount") }}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-up-enter-active {
  transition: all 0.2s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
