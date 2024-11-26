<template>
  <div class="header-menu">
    <a-button  @click="handleClick" shape="round">
      <icon-list />
    </a-button>
    <a-button
      v-for="(button, index) in buttons"
      :key="index"
      :type="selectedButton === index ? 'primary' : 'secondary'"
      shape="round"
      @click="navigateTo(button.route)"
    >
      {{ button.label }}
    </a-button>

    <a-drawer :width="340" :visible="visible" @ok="handleOk" @cancel="handleCancel" unmountOnClose>
      <template #title>
        小初心菜单栏
      </template>
      <div class="drawer-content">
        <a-button
          v-for="(button, index) in buttons"
          :key="index"
          block
          @click="navigateTo(button.route); handleOk()"
        >
          {{ button.label }}
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const visible = ref(false); // 控制抽屉的显示与隐藏
const buttons = [
  { label: '登录', route: '/' },
  { label: '常用', route: '/commuse' },
  { label: '自定义遗器', route: '/holyrelic' },
  { label: '毕业遗器', route: '/holyrelic2' },
  { label: '光锥', route: '/weapon' },
  { label: '物品', route: '/thing' },
  { label: '角色', route: '/avatarall' },
  { label: '场景', route: '/scene' },
  { label: '任务', route: '/mission' },
  { label: 'Morax广场', route: '/moraxlover' },
  { label: '服务器状态', route: '/information' },
  { label: '预设快捷指令', route: '/other' },
];

const selectedButton = ref(buttons.findIndex(button => button.route === route.path));

const navigateTo = (route) => {
  router.push(route);
};

const handleClick = () => {
  visible.value = true; // 打开抽屉
};

const handleOk = () => {
  visible.value = false; // 关闭抽屉
};

const handleCancel = () => {
  visible.value = false; // 关闭抽屉
};

// 监听路由变化，更新选中按钮状态
watchEffect(() => {
  selectedButton.value = buttons.findIndex(button => button.route === route.path);
});
</script>

<style scoped>
.header-menu {
  display: flex;
  overflow-x: auto; /* 允许横向滚动 */
  overflow-y: hidden; /* 隐藏纵向滚动条 */
  white-space: nowrap; /* 防止换行 */
  padding: 10px; /* 添加一些内边距 */
  height: 50px; /* 设置一个固定的高度，避免出现纵向滚动条 */
  gap: 20px;
}

.drawer-content {
  display: flex;
  flex-direction: column; /* 竖向排列按钮 */
  gap: 10px; /* 每个按钮之间的间距 */
}
</style>
