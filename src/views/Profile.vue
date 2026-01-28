<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import ConfirmModal from "@/components/Modals/Confirm.vue";

const { t } = useI18n();
const userStore = useUserStore();

const isEditing = ref(false);
const isDeleteModalOpen = ref(false);
const message = ref({ type: "", text: "" });
const form = ref({ displayName: "" });

onMounted(async () => {
  await userStore.fetchProfile();
  if (userStore.profile) {
    form.value.displayName = userStore.profile.displayName;
  }
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const handleUpdate = async () => {
  message.value = { type: "", text: "" };
  try {
    await userStore.updateProfile(form.value.displayName);
    isEditing.value = false;
    message.value = { type: "success", text: t("profile.updateSuccess") };
  } catch (error: any) {
    message.value = {
      type: "error",
      text: userStore.error || t("profile.updateError"),
    };
  }
};

const handleDeleteAccount = async () => {
  try {
    await userStore.deleteAccount();
  } catch (error: any) {
    isDeleteModalOpen.value = false;
    message.value = {
      type: "error",
      text: userStore.error || "Błąd podczas usuwania konta",
    };
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 sm:py-12">
    <div
      class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8"
    >
      <div class="bg-indigo-700 h-24 sm:h-32 w-full"></div>

      <div class="px-5 sm:px-8 pb-8">
        <div
          class="relative flex flex-col xs:flex-row justify-between items-start xs:items-end -mt-10 sm:-mt-12 mb-6 sm:mb-8 gap-4"
        >
          <div
            class="bg-slate-200 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl sm:text-4xl shadow-sm"
          >
            🧙‍♂️
          </div>
          <button
            @click="isEditing = !isEditing"
            class="self-end xs:self-auto px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
            :class="
              isEditing
                ? 'bg-slate-100 text-slate-600'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            "
          >
            {{ isEditing ? t("common.cancel") : t("profile.editBtn") }}
          </button>
        </div>

        <header class="mb-6 sm:mb-8">
          <h1
            class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight"
          >
            {{ t("profile.title") }}
          </h1>
          <p class="text-sm sm:text-base text-slate-500">
            {{ t("profile.subtitle") }}
          </p>
        </header>

        <Transition name="slide-up">
          <div
            v-if="message.text"
            :class="
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-red-50 text-red-600 border-red-100'
            "
            class="mb-6 p-4 rounded-xl border font-medium text-sm flex items-center gap-2"
          >
            <span>{{ message.type === "success" ? "✅" : "❌" }}</span>
            {{ message.text }}
          </div>
        </Transition>

        <div
          v-if="userStore.loading && !userStore.profile"
          class="py-12 text-center text-slate-400"
        >
          <div
            class="animate-spin inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full mb-2"
          ></div>
          <p>{{ t("auth.loading") }}...</p>
        </div>

        <div v-else class="grid gap-6">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400 uppercase ml-1">{{
              t("auth.email")
            }}</label>
            <div
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 select-none text-sm sm:text-base"
            >
              {{ userStore.profile?.email }}
            </div>
          </div>

          <form @submit.prevent="handleUpdate" class="space-y-6">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-400 uppercase ml-1">{{
                t("auth.displayName")
              }}</label>
              <input
                v-model="form.displayName"
                :disabled="!isEditing || userStore.loading"
                type="text"
                class="w-full px-4 py-3 border rounded-xl outline-none transition-all text-sm sm:text-base"
                :class="
                  isEditing
                    ? 'bg-white border-indigo-200 focus:ring-2 focus:ring-indigo-500 shadow-sm'
                    : 'bg-slate-50 border-slate-100 text-slate-700'
                "
              />
            </div>

            <div
              class="pt-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <span
                class="text-xs text-slate-400 italic text-center sm:text-left"
              >
                {{ t("profile.memberSince") }}:
                {{ formatDate(userStore.profile?.createdAt) }}
              </span>

              <button
                v-if="isEditing"
                type="submit"
                :disabled="userStore.loading"
                class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-200"
              >
                {{ userStore.loading ? t("auth.loading") : t("common.save") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
      class="bg-red-50 rounded-3xl p-6 sm:p-8 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div class="text-center md:text-left">
        <h4 class="text-red-800 font-black text-lg">
          {{ t("profile.dangerZone") }}
        </h4>
        <p class="text-red-600/70 text-sm max-w-md">
          {{ t("profile.deleteDesc") }}
        </p>
      </div>
      <button
        @click="isDeleteModalOpen = true"
        class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-200 active:scale-95 cursor-pointer whitespace-nowrap"
      >
        {{ t("profile.deleteBtn") }}
      </button>
    </div>

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      :title="t('profile.deleteConfirmTitle')"
      :description="t('profile.deleteConfirmDesc')"
      :confirm-text="t('profile.deleteBtn')"
      priority="High"
      :loading="userStore.loading"
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteAccount"
    />
  </div>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
