import { createRouter, createWebHistory } from 'vue-router';
import MainPage from "@/components/views/MainPage.vue";
import UserPage from "@/components/views/UserPage.vue";
import GroupPage from "@/components/views/GroupPage.vue";
import BillPage from "@/components/views/BillPage.vue";
import ReceiptPage from "@/components/views/ReceiptPage.vue";

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
        title: 'Database',
        children: [
            {
                path: "/Database/GroupPage",
                name: "GroupPage",
                component: GroupPage,
            },
            {
                path: "/Database/UserPage",
                name: "UserPage",
                component: UserPage,
            },
            {
                path: "/Database/ReceiptPage",
                name: "ReceiptPage",
                component: ReceiptPage,
            },
        ],
    },
    {
        path: "/BillPage",
        name: "BillPage",
        component: BillPage,
    },
]

// 创建并导出路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
