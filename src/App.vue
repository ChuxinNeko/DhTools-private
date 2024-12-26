<template>
  <ClickEffect />
  <Watermark />
  <HeaderTop class="header-top" />
  <HeaderMenu class="header-menu" />


  <div class="main-content">
    <router-view></router-view>
  </div>
  <Notice />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

import { useAppStore } from './store/modules/app';
import { computed, defineExpose } from 'vue';
import { darkTheme, lightTheme } from 'naive-ui';
import ClickEffect from './components/ClickEffect.vue';
import Watermark from './components/Watermark.vue';
import HeaderTop from './components/Header/HeaderTop.vue';
import HeaderMenu from './components/Header/HeaderMenu.vue';
import Notice from './components/Notice.vue';

const appStore = useAppStore();
const apptheme = computed(() =>
  appStore.theme === 'dark' ? darkTheme : lightTheme
);

defineExpose({ apptheme });


const message = ref('');

onMounted(async () => {
  try {
    
    const randomQuery = `?_=${Date.now()}`;
    const response = await axios.get(`https://api.starxe.top/note${randomQuery}`);
    if (response.data && response.data.message) {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('获取公告失败:', error);
    message.value = '公告获取失败，请稍后再试。';
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: var(--color-bg-1);
  overflow: hidden;
  min-height: 100vh;
  max-width: 100vw;
}

.header-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  overflow: hidden;
  padding: 0 10px;
}

.header-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 999;
  white-space: nowrap;
  padding: 0 10px;
}

.scroll-notice {
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  height: 30px;
  z-index: 998;
  background-color: #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 14px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.scroll-notice marquee {
  width: 100%;
  line-height: 30px;
}

.main-content {
  margin-top: 130px;
  padding: 20px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  #app {
    padding: 10px;
  }

  .header-top {
    height: 70px;
  }

  .header-menu {
    height: 50px;
  }

  .scroll-notice {
    top: 120px;
    height: 35px;
    font-size: 12px;
  }

  .main-content {
    margin-top: 155px;
    padding: 15px;
    max-height: calc(100vh - 155px);
  }
}
</style>
