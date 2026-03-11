import { createApp } from "vue";
import "@/style.css";
import "@/components/shop/shopItems.css";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import i18n from "@/i18n";
import { SpeedInsights } from "@vercel/speed-insights/vue";

const app = createApp(App);
app.component("SpeedInsights", SpeedInsights);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount("#app");
