<template>
  <div class="login-container">
    <h1>Přihlášení</h1>
    <form class="login-form">
      <n-input
        v-model:value="username"
        placeholder="E-mail"
        class="login-input"
      />
      <n-input
        type="password"
        v-model:value="password"
        placeholder="Heslo"
        class="login-input"
      />
      <a v-if="error">{{ error }}</a>
      <n-button type="primary" class="login-button" @click="handleLogin"
        >Přihlásit se</n-button
      >
    </form>
  </div>
</template>
<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LoginApi, LoginModel } from "../api/openapi/api";
import { store } from "../store/store";
import { Configuration } from "../api/openapi/configuration"; // Import the Configuration class
import { getDefaultApiConfig } from "../utils/utils";
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  useMessage,
  NSelect,
  NSpace,
} from "naive-ui";
export default {
  setup() {
    const router = useRouter();
    const username = ref("");
    const password = ref("");
    const error = ref(""); // This will hold the error message
    const message = useMessage(); // Correctly initialized

    const handleLogin = async () => {
      const loginApi = new LoginApi(getDefaultApiConfig());

      // Construct the LoginModel object
      const loginModel: LoginModel = {
        email: username.value,
        password: password.value,
      };

      try {
        // Pass the loginModel directly to the loginPost method
        const response = await loginApi.loginPost(loginModel);
        localStorage.setItem('authToken', response.data!.token!);
        store.login({ username: username.value});
        localStorage.setItem('role', response.data!.right!.key);
        router.push("/"); // Redirect to home
      } catch (e) {
        // Make sure to catch the error correctly
        console.error("Login failed:", e);
        message.error("Nesprávné přihlašovací údaje!");
        
      }
    };

    return { username, password, handleLogin, error };
  },
};
</script>
<style scoped>
.login-container {
  max-width: 450px; /* Increase the width of the login container */
  margin: 100px auto;
  padding: 40px; /* Increase the padding for more space inside the container */
  border-radius: 10px; /* Slightly more rounded corners */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
}

h1 {
  margin-bottom: 25px; /* More space below the title */
  color: #06732e;
  text-align: center;
  font-size: 2em; /* Larger font size for the title */
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-input {
  margin-bottom: 20px; /* More space between input fields */
}

.login-input .n-input__input {
  font-size: 2.1em; /* Larger font size for input text */
  padding: 15px 20px; /* Larger padding for a taller input field */
}

.login-button {
  margin-top: 20px; /* More space above the button */
  font-size: 1.1em; /* Larger font size for the button text */
  padding: 15px 20px; /* Larger padding for a taller button */
  background-color: #06732e;
  border-color: #06732e;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
}

.login-button:hover {
  background-color: #044e1e;
}
</style>
  