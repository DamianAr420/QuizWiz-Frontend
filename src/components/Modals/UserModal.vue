<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { User } from "@/types/user";

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits(["close", "save"]);
const { t } = useI18n();

const editedUser = ref({ ...props.user });

const inputClasses =
  "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-bold";
const labelClasses =
  "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          @click="emit('close')"
        ></div>

        <div
          class="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8"
        >
          <h2
            class="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tighter"
          >
            {{ t("admin.users.modal.title") }}
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.users.modal.labels.displayName")
              }}</label>
              <input
                v-model="editedUser.displayName"
                :class="inputClasses"
                type="text"
              />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.users.modal.labels.email")
              }}</label>
              <input
                v-model="editedUser.email"
                :class="inputClasses"
                type="email"
              />
            </div>

            <div>
              <label :class="labelClasses">{{
                t("admin.users.modal.labels.role")
              }}</label>
              <select v-model="editedUser.role" :class="inputClasses">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label :class="labelClasses">{{
                t("admin.users.modal.labels.levelCalculated")
              }}</label>
              <div
                class="px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-slate-500 dark:text-slate-400 font-black"
              >
                LVL {{ Math.floor(editedUser.experience / 1000) + 1 }}
              </div>
            </div>

            <div>
              <label :class="labelClasses"
                >{{ t("admin.users.modal.labels.points") }} (WizCoins)</label
              >
              <input
                v-model.number="editedUser.points"
                :class="inputClasses"
                type="number"
              />
            </div>

            <div>
              <label :class="labelClasses"
                >{{ t("admin.users.modal.labels.experience") }} (XP)</label
              >
              <input
                v-model.number="editedUser.experience"
                :class="inputClasses"
                type="number"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-10">
            <button
              @click="emit('close')"
              class="flex-1 px-4 py-4 font-black text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors uppercase text-xs tracking-widest"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              @click="emit('save', editedUser)"
              class="flex-1 px-4 py-4 font-black bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all uppercase text-xs tracking-widest"
            >
              {{ t("common.save") }}
            </button>
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
  transform: translateY(20px);
}
</style>
