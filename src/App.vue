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
    title="梦乡公益服远程指令生成器-使用须知" 
    :maskClosable="false"
    :closable="false"
    :width="isMobile ? '90%' : '500px'"
    :top="isMobile ? '20px' : '60px'"
  >
    <div>
      <p>本项目为独立开源项目，项目地址:<a href="https://github.com/lctoolsweb/DanhengWebTools" target="_blank">DanhengWebTools</a>。</p>
      <p>项目不会以任何形式收费，也不会作为任何付费服务器的赠送品，拼多多等电商均为倒卖。</p>
      <p>您在阅读后勾选下方注意事项并点击确定方可开始使用：</p>
      <a-checkbox v-model="checkbox1">
        <span :style="{ color: checkboxTextColor }">我已知晓梦乡服务器和本指令生成器都是免费的，且绝不会以任何形式进行收费。</span>
      </a-checkbox>
      <br />
      <a-checkbox v-model="checkbox2">
        <span :style="{ color: checkboxTextColor }">当我付费得到本项目并遇到问题时，我会主动询问卖家而不是用颐指气使且蛮横的态度来质问开发者。</span>
      </a-checkbox>
      <br />
      <a-checkbox v-model="checkbox3">
        <span :style="{ color: checkboxTextColor }">本站对接的是梦乡公益服，其他服务器请勿询问任何本站的使用问题，谢谢合作！</span>
      </a-checkbox>
    </div>
    <template #footer>
      <!-- 是否三日内隐藏选项 -->
      <a-checkbox v-model="checkboxIsNoShow">三日内不再提醒</a-checkbox>
      <!-- 确定按钮，点击后关闭对话框 -->
      <a-button type="primary" :disabled="IsDisabledEnter" @click="handleOk">确定</a-button>
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
import Cookies from 'js-cookie';

const appStore = useAppStore();
const apptheme = ref();
const visible = ref(false); // 初始化为 false，页面加载时判断是否显示对话框
const checkbox1 = ref(false);
const checkbox2 = ref(false);
const checkbox3 = ref(false);
const checkboxIsNoShow = ref(false); // 三日不再提醒
const IsDisabledEnter = ref(true); // 禁用确定按钮5秒

// 计算属性：检测是否为移动端
const isMobile = computed(() => {
  return window.innerWidth < 768; // 根据屏幕宽度判断
});
const checkboxTextColor = computed(() => {
  return checkbox1.value && checkbox2.value && checkbox3.value ? 'green' : 'red';
});

// 群链接数组
const groupLinks = [
  "https://qm.qq.com/q/a1qDFAGN3O", "https://qm.qq.com/q/jNrna23Qr0", "https://qm.qq.com/q/rJD0ikUUWk", "https://qm.qq.com/q/x81EKFu2OW", "https://qm.qq.com/q/eHclKGip2M",
  "https://qm.qq.com/q/NxnCj3M2I0", "https://qm.qq.com/q/WC6NhUA2oE", "https://qm.qq.com/q/hzZiBo36jC", "https://qm.qq.com/q/tG7Wxe1JiU", "https://qm.qq.com/q/tSEkTfMV5m",
  "https://qm.qq.com/q/NZgBTRtocO", "https://qm.qq.com/q/lPK5dFBeUM", "https://qm.qq.com/q/YR1EiqKjYY", "https://qm.qq.com/q/kBNvfWIPhm", "https://qm.qq.com/q/gGAWeEogVM"
];

// 选择随机链接
const getRandomGroupLink = () => {
  const randomIndex = Math.floor(Math.random() * groupLinks.length);
  return groupLinks[randomIndex];
};

// 判断弹窗显示逻辑
onMounted(() => {
  const IsNoShow = Cookies.get("IsNoShow");
  if (!IsNoShow) {
    visible.value = true;
    // 启动5秒计时器
    setTimeout(() => {
      IsDisabledEnter.value = false;
    }, 5000);
  }

  const WSS = localStorage.getItem("WSS");
  if (WSS) {
    appStore.socketConnect(WSS);
  }
});

// 确认按钮操作
const handleOk = () => {
  if (!checkbox1.value || !checkbox2.value || !checkbox3.value) {
    Message.error('请仔细阅读注意事项并勾选所有选项。');
    return;
  }
  const randomLink = getRandomGroupLink(); // 随机拿一个加群链接
  window.open(randomLink, "_blank");

  // 如果勾选了不在弹出，进行Cookie设置
  if (checkboxIsNoShow.value) {
    Cookies.set("IsNoShow", "true", { expires: 3 });
  }

  visible.value = false; // 确保只有点击确定按钮后关闭对话框
};

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
