import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { create, NButton, NDataTable, NDialog, NInput, NTag } from 'naive-ui';

const naive = create({
  components: [NButton, NDataTable, NDialog, NInput, NTag]
});

const app = createApp(App);

app.use(naive);
app.use(router);
app.mount('#app');
