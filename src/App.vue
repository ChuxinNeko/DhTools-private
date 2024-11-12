<template>
  <!-- 主页面内容 -->
  <ClickEffect />
  <Watermark />
  <HeaderTop class="header-top" />
  <HeaderMenu class="header-menu" />

  <div class="main-content">
    <router-view></router-view>
  </div>

  <!-- 对话框内容 -->
  <a-modal 
    v-model:visible="visible" 
    title="使用须知" 
    :maskClosable="false"
    :closable="false"
    :width="isMobile ? '90%' : '500px'"
    :top="isMobile ? '20px' : '60px'"
  >
    <div>
      <p>本指令生成器为独立项目，不会以任何形式收费，也不会作为任何付费服务器的附赠品。出现在拼多多闲鱼等平台的均为倒卖！</p>
      <p>勾选下方注意事项并点击确定方可开始使用：</p>
      <a-checkbox v-model="checkbox1">
        <span :style="{ color: checkboxTextColor }">我已知晓梦乡服务器和本指令生成器都是免费的。</span>
      </a-checkbox>
      <br />
      <a-checkbox v-model="checkbox2">
        <span :style="{ color: checkboxTextColor }">当我付费得到本项目并遇到问题时，我会主动询问卖家而不是询问开发者。</span>
      </a-checkbox>
    </div>
    <template #footer>
      <!-- 取消按钮失效 -->
      <a-button @click="joingroup" >加入群聊</a-button>
      <!-- 确定按钮，点击后关闭对话框 -->
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { useAppStore } from './store/modules/app';
import { ref, watch, onMounted, computed, defineExpose } from 'vue';
import { darkTheme, lightTheme } from 'naive-ui';
import ClickEffect from './components/ClickEffect.vue';
import Watermark from './components/Watermark.vue';
import HeaderTop from './components/Header/HeaderTop.vue';
import HeaderMenu from './components/Header/HeaderMenu.vue';
import { Message } from '@arco-design/web-vue';

const appStore = useAppStore();
const apptheme = ref();
const visible = ref(true); // 初始化为 true，页面加载时显示对话框
const checkbox1 = ref(false);
const checkbox2 = ref(false);

// 计算属性：检测是否为移动端
const isMobile = computed(() => {
  return window.innerWidth < 768; // 根据屏幕宽度判断
});
const checkboxTextColor = computed(() => {
  return checkbox1.value && checkbox2.value ? 'green' : 'red';
});

// 显式暴露给模板
defineExpose({ isMobile });

watch(
  () => appStore.theme,
  () => {
    const theme: string = appStore.theme;
    if (theme === 'dark') {
      apptheme.value = darkTheme;
    } else {
      apptheme.value = lightTheme;
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  const WSS = localStorage.getItem("WSS");
  if (WSS) {
    appStore.socketConnect(WSS);
  }
});

const handleOk = () => {
  if (!checkbox1.value || !checkbox2.value) {
    Message.error('请仔细阅读注意事项并勾选所有选项。');
    return;
  }
  visible.value = false; // 确保只有点击确定按钮后关闭对话框
};
const joingroup = () => {
  window.open(
    "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=JI5ZPpenP8i1e8fJj4zHDcgoJdYlaPyE&authKey=Od2ihJ5JGRd6vu5PVc1t%2Buiu0Uwov2O1JRYJmbYozcROGxQrrlZojHk40jMrEhyR&noverify=0&group_code=859381480",
    "_blank"
  );
};

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
  /* 添加响应式样式 */
  max-width: 100vw; /* 限制宽度为视口宽度 */
}

.header-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  overflow: hidden;
  /* 添加响应式样式 */
  padding: 0 10px; /* 在移动端添加左右内边距 */
}

.header-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 999;
  white-space: nowrap;
  /* 添加响应式样式 */
  padding: 0 10px; /* 在移动端添加左右内边距 */
}

.main-content {
  margin-top: 100px;
  padding: 20px;
  /* 添加响应式样式 */
}

/* 移动端样式 */
@media (max-width: 768px) {
  #app {
    padding: 10px; /* 在移动端增加内边距 */
  }

  .header-top {
    height: 70px; /* 移动端增加高度 */
  }

  .header-menu {
    height: 50px; /* 移动端增加高度 */
  }

  .main-content {
    margin-top: 120px; /* 移动端顶部间距 */
    padding: 15px; /* 移动端减少内边距 */
    max-height: calc(100vh - 120px); /* 限制纵向高度以避免溢出 */
  }
}
</style>

