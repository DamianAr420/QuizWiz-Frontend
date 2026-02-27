<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useAdminStore } from "@/stores/admin";
import { ItemType } from "@/types/shop";
import { useCloudinary } from "@/composables/useCloudinary";
import ShopItemCard from "@/components/Cards/ShopItemCard.vue";
import UserModal from "@/components/Modals/UserModal.vue";
import ShopItemModal from "@/components/Modals/ShopItemModal.vue";
import QuizPreviewModal from "@/components/Modals/QuizPreviewModal.vue";
import ConfirmModal from "@/components/Modals/Confirm.vue";

const { t } = useI18n();
const adminStore = useAdminStore();
const { getAvatarUrl } = useCloudinary();

type AdminTab = "users" | "shop" | "verifications";
const activeTab = ref<AdminTab>("users");

const isUserModalOpen = ref(false);
const isShopModalOpen = ref(false);
const isPreviewModalOpen = ref(false);

const confirmState = reactive({
  isOpen: false,
  title: "",
  description: "",
  confirmText: "",
  priority: "Low" as "High" | "Medium" | "Low",
  onConfirm: () => {},
  loading: false,
});

const selectedUser = ref<any>(null);
const selectedItem = ref<any>(null);
const selectedQuiz = ref<any>(null);

onMounted(async () => {
  await Promise.all([
    adminStore.fetchUsers(),
    adminStore.fetchShopItems(),
    adminStore.fetchPendingQuizzes(),
  ]);
});

const requestConfirm = (options: {
  title: string;
  description: string;
  confirmText: string;
  priority: "High" | "Medium" | "Low";
  action: () => Promise<void>;
}) => {
  confirmState.title = options.title;
  confirmState.description = options.description;
  confirmState.confirmText = options.confirmText;
  confirmState.priority = options.priority;
  confirmState.onConfirm = async () => {
    confirmState.loading = true;
    await options.action();
    confirmState.loading = false;
    confirmState.isOpen = false;
  };
  confirmState.isOpen = true;
};

const openUserEdit = (user: any) => {
  selectedUser.value = { ...user };
  isUserModalOpen.value = true;
};

const handleUserSave = async (updatedData: any) => {
  await adminStore.updateUser(updatedData.id, updatedData);
  isUserModalOpen.value = false;
};

const openItemEdit = (item: any = null) => {
  selectedItem.value = item
    ? { ...item }
    : {
        id: 0,
        title: "",
        description: "",
        price: 0,
        type: ItemType.AvatarFrame,
        rarity: 0,
        requiredLevel: 1,
      };
  isShopModalOpen.value = true;
};

const handleItemSave = async (itemData: any) => {
  await adminStore.saveShopItem(itemData);
  isShopModalOpen.value = false;
};

const openQuizPreview = (quiz: any) => {
  selectedQuiz.value = quiz;
  isPreviewModalOpen.value = true;
};

const handleVerify = (id: number) => {
  requestConfirm({
    title: t("admin.verifications.confirm.verifyTitle"),
    description: t("admin.verifications.confirm.verifyDesc"),
    confirmText: t("admin.verifications.actions.verify"),
    priority: "Low",
    action: () => adminStore.verifyQuiz(id),
  });
};

const handleReject = (id: number) => {
  requestConfirm({
    title: t("admin.verifications.confirm.rejectTitle"),
    description: t("admin.verifications.confirm.rejectDesc"),
    confirmText: t("admin.verifications.actions.reject"),
    priority: "Medium", // Medium, bo tylko cofamy do edycji, nie usuwamy na stałe
    action: () => adminStore.rejectQuiz(id),
  });
};

const handleDeleteItem = (id: number) => {
  requestConfirm({
    title: t("admin.shop.confirm.deleteTitle"),
    description: t("admin.shop.confirm.deleteDesc"),
    confirmText: t("common.delete"),
    priority: "High",
    action: () => adminStore.deleteShopItem(id),
  });
};
</script>

<template>
  <div class="p-4 sm:p-10 transition-colors duration-300">
    <div class="max-w-6xl mx-auto">
      <header
        class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1
            class="text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter uppercase"
          >
            {{ t("admin.title") }}
            <span class="text-green-600">{{ t("admin.subtitle") }}</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">
            {{ t("admin.version") }}
          </p>
        </div>
        <div class="flex gap-2">
          <div
            class="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              {{ t("admin.stats.activeUsers") }}
            </p>
            <p class="text-xl font-black dark:text-white">
              {{ adminStore.users.length }}
            </p>
          </div>
        </div>
      </header>

      <nav
        class="flex gap-2 mb-8 bg-white dark:bg-slate-900 p-2 rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <button
          v-for="tab in ['users', 'shop', 'verifications'] as AdminTab[]"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'flex-1 px-4 py-4 rounded-3xl font-black transition-all duration-300 uppercase text-xs tracking-widest flex items-center justify-center gap-2',
            activeTab === tab
              ? 'bg-green-600 text-white shadow-xl shadow-green-600/20'
              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
        >
          {{ t(`admin.tabs.${tab}`) }}
          <span
            v-if="tab === 'verifications' && adminStore.pendingCount > 0"
            class="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse"
          >
            {{ adminStore.pendingCount }}
          </span>
        </button>
      </nav>

      <main v-if="!adminStore.loading">
        <section
          v-if="activeTab === 'users'"
          class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th
                  class="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest"
                >
                  {{ t("admin.users.table.user") }}
                </th>
                <th
                  class="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center"
                >
                  {{ t("admin.users.table.role") }}
                </th>
                <th
                  class="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center"
                >
                  {{ t("admin.users.table.lvlPoints") }}
                </th>
                <th
                  class="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right"
                >
                  {{ t("admin.users.table.actions") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in adminStore.users"
                :key="user.id"
                class="border-t border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <img
                      v-if="user.cloudinaryPublicId"
                      :src="
                        getAvatarUrl(user.cloudinaryPublicId, 200) ?? undefined
                      "
                      class="w-12 h-12 rounded-2xl object-cover border-2 border-green-500/20"
                    />
                    <div
                      v-else
                      class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-400"
                    >
                      ?
                    </div>
                    <div>
                      <div
                        class="font-black text-slate-800 dark:text-slate-100 text-lg leading-tight"
                      >
                        {{ user.displayName }}
                      </div>
                      <div class="text-sm text-slate-400 font-medium">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-center">
                  <span
                    :class="[
                      'px-3 py-1 rounded-lg text-[10px] font-black uppercase',
                      user.role === 'Admin'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="p-6 text-center">
                  <div class="font-black text-slate-700 dark:text-slate-300">
                    LVL {{ user.level }}
                  </div>
                  <div class="text-xs font-bold text-green-600">
                    {{ user.points }} WIZ
                  </div>
                </td>
                <td class="p-6 text-right">
                  <button
                    @click="openUserEdit(user)"
                    class="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-green-600 hover:text-white transition-all"
                  >
                    {{ t("admin.users.edit") }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeTab === 'shop'" class="space-y-6">
          <div class="flex justify-between items-center px-4">
            <h2
              class="text-xl font-black dark:text-white uppercase tracking-tight"
            >
              {{ t("admin.shop.sectionTitle") }}
            </h2>
            <button
              @click="openItemEdit()"
              class="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-green-600/20"
            >
              {{ t("admin.shop.addItem") }}
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShopItemCard
              v-for="item in adminStore.shopItems"
              :key="item.id"
              :item="item"
              admin-mode
              @edit="openItemEdit"
              @delete="handleDeleteItem"
            />
          </div>
        </section>

        <section v-if="activeTab === 'verifications'" class="space-y-4">
          <div
            v-if="adminStore.pendingQuizzes.length === 0"
            class="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
          >
            <div
              class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl mb-4"
            >
              ✅
            </div>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white">
              {{ t("admin.verifications.empty") }}
            </h3>
            <p class="text-slate-500 font-medium">
              {{ t("admin.verifications.emptyDesc") }}
            </p>
          </div>

          <div
            v-for="quiz in adminStore.pendingQuizzes"
            :key="quiz.id"
            class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <span
                  class="bg-amber-100 text-amber-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter animate-pulse"
                  >{{ t("admin.verifications.status") }}</span
                >
                <h3
                  class="text-2xl font-black text-slate-800 dark:text-white leading-tight"
                >
                  {{ quiz.title }}
                </h3>
              </div>
              <p class="text-slate-500 font-medium flex items-center gap-2">
                <span class="font-bold text-slate-800 dark:text-slate-300"
                  >@{{ quiz.authorId }}</span
                >
                <span class="text-slate-300">•</span>
                <span>{{
                  t("admin.verifications.details", {
                    count: quiz.questions?.length || 0,
                    time: quiz.timeLimitSeconds,
                  })
                }}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-3 w-full lg:w-auto">
              <button
                @click="openQuizPreview(quiz)"
                class="flex-1 lg:flex-none px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
              >
                {{ t("admin.verifications.actions.preview") }}
              </button>
              <button
                @click="handleReject(quiz.id)"
                class="flex-1 lg:flex-none px-8 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs tracking-widest"
              >
                {{ t("admin.verifications.actions.reject") }}
              </button>
              <button
                @click="handleVerify(quiz.id)"
                class="flex-1 lg:flex-none px-10 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all uppercase text-xs tracking-widest"
              >
                {{ t("admin.verifications.actions.verify") }}
              </button>
            </div>
          </div>
        </section>
      </main>

      <div v-else class="flex flex-col items-center justify-center py-40">
        <div
          class="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="font-black text-slate-400 uppercase tracking-widest">
          {{ t("admin.stats.syncing") }}
        </p>
      </div>

      <UserModal
        v-if="isUserModalOpen"
        :user="selectedUser"
        @close="isUserModalOpen = false"
        @save="handleUserSave"
      />
      <ShopItemModal
        v-if="isShopModalOpen"
        :item="selectedItem"
        @close="isShopModalOpen = false"
        @save="handleItemSave"
      />
      <QuizPreviewModal
        v-if="isPreviewModalOpen"
        :quiz="selectedQuiz"
        @close="isPreviewModalOpen = false"
      />

      <ConfirmModal
        :is-open="confirmState.isOpen"
        :title="confirmState.title"
        :description="confirmState.description"
        :confirm-text="confirmState.confirmText"
        :priority="confirmState.priority"
        :loading="confirmState.loading"
        @confirm="confirmState.onConfirm"
        @close="confirmState.isOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
main {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

table {
  border-spacing: 0;
  width: 100%;
}
th {
  white-space: nowrap;
}
button:focus {
  outline: none;
}
</style>
