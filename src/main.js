import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./assets/Animation.css";
import { createApp } from 'vue';
import App from './App.vue';
import axios from "axios";
import router from "@/components/router/index.js";


const app = createApp(App);
app.config.globalProperties.$baseUrl = import.meta.env.VITE_APP_BASEURL;
app.config.globalProperties.$axios = axios;
app.use(router);
app.mount("#app");
