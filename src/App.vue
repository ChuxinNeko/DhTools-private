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
import { useAppStore } from './store/modules/app';
import { ref, watch, defineExpose } from 'vue';
import { darkTheme, lightTheme } from 'naive-ui';
import ClickEffect from './components/ClickEffect.vue';
import Watermark from './components/Watermark.vue';
import HeaderTop from './components/Header/HeaderTop.vue';
import HeaderMenu from './components/Header/HeaderMenu.vue';
import Notice from './components/Notice.vue';  

const appStore = useAppStore();
const apptheme = ref();


watch(
  () => appStore.theme,
  () => {
    apptheme.value = appStore.theme === 'dark' ? darkTheme : lightTheme;
  },
  { immediate: true }
);


defineExpose({ apptheme });
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

.main-content {
  margin-top: 100px;
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

  .main-content {
    margin-top: 120px;
    padding: 15px;
    max-height: calc(100vh - 120px);
  }
}
</style>
