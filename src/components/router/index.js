import { createRouter, createWebHistory } from 'vue-router';
import MainPage from "@/components/views/MainPage.vue";
import ResultPage from "@/components/views/ResultPage.vue";

// 合并路由配置
const routes = [
    {
        path: "/",
        redirect: "/MainPage",  // 默认重定向到主页面
    },
    {
        path: "/MainPage",
        name: "MainPage",
        component: MainPage,
    },
    {
        path: "/ResultPage",
        name: "ResultPage",
        component: ResultPage,
    }
]

// 创建并导出路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
