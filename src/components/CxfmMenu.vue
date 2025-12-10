<template>
    <a-drawer
      v-model:visible="drawerVisible"  <!-- 控制抽屉的显示和隐藏 -->
      title="菜单"
      placement="left"  <!-- 抽屉位置，默认为从左侧弹出 -->
      :width="320"  <!-- 控制抽屉的宽度 -->
      @close="onClose"  <!-- 抽屉关闭时触发的事件 -->
    >
      <div class="drawer-content">
        <a-button
          v-for="(button, index) in buttons"
          :key="index"
          block
          @click="navigateTo(button.route); onClose()"
        >
          {{ button.label }}
        </a-button>
      </div>
    </a-drawer>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Drawer, Button } from '@arco-design/web-vue';  // 导入 Arco Design 组件
  
  const router = useRouter();
  const drawerVisible = ref(false);  // 控制抽屉的显隐
  
  const buttons = [
    { label: '登录', route: '/' },
    { label: '自定义遗器', route: '/holyrelic' },
    { label: '毕业遗器', route: '/holyrelic2' },
    { label: '光锥', route: '/weapon' },
    { label: '物品', route: '/thing' },
    { label: '角色', route: '/avatarall' },
    { label: '任务', route: '/mission' },
    { label: '男娘广场', route: '/moraxlover' },
    { label: '服务器状态', route: '/information' },
    { label: '预设快捷指令', route: '/other' },
  ];
  
  const navigateTo = (route) => {
    router.push(route); // 路由跳转
  };
  
  const onClose = () => {
    drawerVisible.value = false;  // 关闭抽屉
  };
  
  const openDrawer = () => {
    drawerVisible.value = true;  // 打开抽屉
  };
  
  defineEmits(['close']);  // 声明关闭事件
  </script>
  
  <style scoped>
  .drawer-content {
    display: flex;
    flex-direction: column; /* 竖向排列按钮 */
    gap: 10px; /* 每个按钮之间的间距 */
  }
  
  a-button {
    margin-bottom: 10px;
  }
  </style>
  