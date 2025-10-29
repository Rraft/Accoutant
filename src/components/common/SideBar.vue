<script>
export default {
  name: "SideBar",

  data() {
    return {
      menuItems: [
        {
          title: '主页',
          path: '/MainPage',
          icon: 'bi bi-house',
          isOpen: false,
        },
        {
          title: '数据管理',
          icon: 'bi bi-database',
          isOpen: false,
          children: [
            {
              title: '分组管理',
              path: '/Database/GroupPage',
              icon: 'bi bi-person-fill',
              isOpen: false,
            },
            {
              title: '用户管理',
              path: '/Database/UserPage',
              icon: 'bi bi-person',
              isOpen: false,
            },
            {
              title: '收据管理',
              path: '/Database/ReceiptPage',
              icon: 'bi bi-briefcase',
              isOpen: false,
            },
          ],
        },
        {
          title: '结算',
          path: '/BillPage',
          icon: 'bi bi-person-bounding-box',
          isOpen: false,
        },
      ],
    }
  },
  methods: {
    /**
     * @description: 迭代子标签
     * @author 13299
     */
    toggleSubMenu(item) {
      if (item.children) {
        item.isOpen = !item.isOpen;
      }
    },

    /**
     * @description: 根据当前页面更新标签的激活样式
     * @author 13299
     */
    isActive(item) {
      return this.$route.path === item.path ||
          (item.children && item.children.some(child => this.$route.path === child.path))
    },
  }
}
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <img src="@/assets/logo.svg" alt="logo"/>
      <span>Accountant</span>
    </div>
    <ul class="menu">
      <li
          v-for="item in menuItems"
          :key="item.path"
          :class="{ 'active': isActive(item) }"
      >
        <router-link
            v-if="!item.children"
            :to="item.path"
            class="menu-item"
        >
          <i class="icon" :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </router-link>

        <div v-else class="submenu-parent" @click="toggleSubMenu(item)">
          <div class="menu-item">
            <i class="icon" :class="item.icon"></i>
            <span>{{ item.title }}</span>
            <i class="arrow" :class="item.isOpen ? 'down' : 'right'"></i>
          </div>
          <transition name="slide">
            <ul v-show="item.isOpen" class="submenu">
              <li
                  v-for="child in item.children"
                  :key="child.path"
                  :class="{ 'active': isActive(child) }"
              >
                <router-link :to="child.path" class="submenu-item">
                  <i class="icon" :class="child.icon"></i>
                  <span>{{ child.title }}</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.icon{
  margin-right: 10px;
}

.sidebar {
  width: 250px;
  height: 100vh;
  background: #2c3e50;
  color: white;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-size: 1.5rem;
}

.menu {
  list-style: none;
  padding: 0;
}

.menu-item, .submenu-item {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.submenu-parent{
  cursor: pointer;
}

.menu-item:hover, .submenu-item:hover {
  background: #34495e;
}

.active .menu-item {
  background: #3498db;
}

.submenu {
  list-style: none;
  padding: 0;
  background: #1a2634;
}

.submenu-item {
  padding-left: 45px;
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s;
}

.down {
  transform: rotate(90deg);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
