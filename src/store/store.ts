import { reactive } from 'vue';

export const store = reactive({
  user: JSON.parse(localStorage.getItem('user')),

  login(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  },
});