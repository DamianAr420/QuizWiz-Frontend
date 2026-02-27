<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ItemType, ItemRarityLabels } from "@/types/shop";

const props = defineProps<{
  item: any;
}>();

const emit = defineEmits(["close", "save"]);
const { t } = useI18n();

const editedItem = ref({ ...props.item });

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
          class="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 max-h-[90vh] overflow-y-auto custom-scroll"
        >
          <h2
            class="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tighter"
          >
            {{
              editedItem.id === 0
                ? t("admin.shop.modal.newTitle")
                : t("admin.shop.modal.editTitle")
            }}
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.title")
              }}</label>
              <input
                v-model="editedItem.title"
                :class="inputClasses"
                type="text"
                :placeholder="t('admin.shop.modal.placeholders.title')"
              />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.description")
              }}</label>
              <textarea
                v-model="editedItem.description"
                :class="inputClasses"
                rows="2"
                :placeholder="t('admin.shop.modal.placeholders.description')"
              ></textarea>
            </div>

            <div>
              <label :class="labelClasses"
                >{{ t("admin.shop.modal.labels.price") }} (WIZ)</label
              >
              <input
                v-model.number="editedItem.price"
                :class="inputClasses"
                type="number"
              />
            </div>

            <div>
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.level")
              }}</label>
              <input
                v-model.number="editedItem.requiredLevel"
                :class="inputClasses"
                type="number"
              />
            </div>

            <div>
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.type")
              }}</label>
              <select v-model.number="editedItem.type" :class="inputClasses">
                <option :value="ItemType.AvatarFrame">
                  {{ t("shop.types.frame") }}
                </option>
                <option :value="ItemType.Background">
                  {{ t("shop.types.background") }}
                </option>
                <option :value="ItemType.Badge">
                  {{ t("shop.types.badge") }}
                </option>
                <option :value="ItemType.Ticket">
                  {{ t("shop.types.ticket") }}
                </option>
              </select>
            </div>

            <div>
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.rarity")
              }}</label>
              <select v-model.number="editedItem.rarity" :class="inputClasses">
                <option
                  v-for="(label, value) in ItemRarityLabels"
                  :key="value"
                  :value="Number(value)"
                >
                  {{ t(`shop.rarity.${label.toLowerCase()}`) }}
                </option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.image")
              }}</label>
              <input
                v-model="editedItem.imageUrl"
                :class="inputClasses"
                type="text"
                placeholder="preset:name / https://..."
              />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClasses">{{
                t("admin.shop.modal.labels.stock")
              }}</label>
              <input
                v-model.number="editedItem.stockQuantity"
                :class="inputClasses"
                type="number"
                :placeholder="t('admin.shop.modal.placeholders.unlimited')"
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
              @click="emit('save', editedItem)"
              class="flex-1 px-4 py-4 font-black bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all uppercase text-xs tracking-widest"
            >
              {{ t("common.confirm") }}
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
  transform: scale(0.9);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
