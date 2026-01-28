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

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      if (isLoginMode.value) {
        identifierInput.value?.focus();
      } else {
        displayNameInput.value?.focus();
      }
    } else {
      resetForm();
    }
  },
);

const resetForm = () => {
  errorMessage.value = "";
  showPassword.value = false;
  form.value = { displayName: "", email: "", password: "" };
};

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
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          @click="emit('close')"
        ></div>

        <div
          class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          <div class="p-8">
            <header class="text-center mb-6">
              <h2 class="text-3xl font-black text-slate-800 tracking-tight">
                {{ isLoginMode ? t("auth.welcome") : t("auth.join") }}
              </h2>
            </header>

            <Transition name="slide-up">
              <div
                v-if="errorMessage"
                class="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium"
              >
                {{ errorMessage }}
              </div>
            </Transition>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div v-if="!isLoginMode">
                <label
                  class="block text-sm font-semibold text-slate-700 mb-1 ml-1"
                  >{{ t("auth.displayName") }}</label
                >
                <input
                  ref="displayNameInput"
                  v-model="form.displayName"
                  type="text"
                  required
                  autocomplete="username"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-slate-700 mb-1 ml-1"
                >
                  {{ isLoginMode ? "Email lub Nazwa" : t("auth.email") }}
                </label>
                <input
                  ref="identifierInput"
                  v-model="form.email"
                  :type="isLoginMode ? 'text' : 'email'"
                  required
                  :autocomplete="isLoginMode ? 'username' : 'email'"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  :placeholder="
                    isLoginMode ? 'Twój email lub nick' : 'twoj@email.com'
                  "
                />
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-slate-700 mb-1 ml-1"
                  >{{ t("auth.password") }}</label
                >
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    :autocomplete="
                      isLoginMode ? 'current-password' : 'new-password'
                    "
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  >
                    {{ showPassword ? "👁️‍🗨️" : "👁️" }}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                :disabled="authStore.loading"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-200"
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
                class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
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
