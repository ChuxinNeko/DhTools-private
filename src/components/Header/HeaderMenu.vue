<template>
  <div class="header-menu">
    <a-button @click="handleClick" shape="round">
      <icon-list />
    </a-button>
    <a-button
      v-for="(button, index) in buttons"
      :key="index"
      :type="selectedButton === index ? 'primary' : 'secondary'"
      shape="round"
      @click="navigateTo(button.route)"
    >
      <component :is="button.icon" style="margin-right: 8px;" />
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
          <component :is="button.icon" style="margin-right: 8px;" />
          {{ button.label }}
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IconUser,
  IconHome,
  IconSettings,
  IconTrophy,
  IconStar,
  IconArchive,
  IconUserGroup,
  IconCommon,
  IconHeart,
  IconCloud,
  IconCommand,
  IconMessage,
  IconCodeBlock,
} from '@arco-design/web-vue/es/icon';


const router = useRouter();
const route = useRoute();

const visible = ref(false); // 控制抽屉的显示与隐藏
const buttons = [
  { label: '登录', route: '/', icon: IconUser },
  { label: '常用', route: '/commuse', icon: IconHome },
  { label: '自定义遗器', route: '/holyrelic', icon: IconSettings },
  { label: '毕业遗器', route: '/holyrelic2', icon: IconTrophy },
  { label: '光锥', route: '/weapon', icon: IconStar },
  { label: '物品', route: '/thing', icon: IconArchive },
  { label: '角色', route: '/avatarall', icon: IconUserGroup },
  { label: '场景', route: '/scene', icon: IconCommon },
  { label: '任务', route: '/mission', icon: IconCodeBlock },
  { label: '男娘广场', route: '/moraxlover', icon: IconHeart },
  { label: '服务器状态', route: '/information', icon: IconCloud },
  { label: '预设快捷指令', route: '/other', icon: IconCommand },
  { label: '反馈', route: '/feedback', icon: IconMessage },
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
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 10px;
  height: 50px;
  gap: 20px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:root[data-theme='dark'] .header-menu {
  background-color: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-menu::-webkit-scrollbar {
  height: 3px;
}

.header-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.header-menu::-webkit-scrollbar-track {
  background-color: transparent;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>