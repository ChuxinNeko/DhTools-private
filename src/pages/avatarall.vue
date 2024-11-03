<template>
    <div>
      <!-- 顶部的单选框选择部分 -->
      <a-space direction="vertical" size="large">
        <a-radio-group v-model="selectedOption">
          <a-radio value="getrole">获得角色</a-radio>
          <a-radio value="avatar">角色行迹</a-radio>
          <a-radio value="rankuser">角色星魂</a-radio>
          <a-radio value="level">角色等级</a-radio>
        </a-radio-group>
      </a-space>
  
      <!-- 根据选项渲染不同的组件 -->
      <div class="component-display">
        <component :is="currentComponent" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // 直接导入各组件
  import GetRole from './getrole.vue';
  import Avatar from './avatar.vue';
  import RankUser from './rankuser.vue';
  import Level from './leveluser.vue';
  
  // 定义选项值
  const selectedOption = ref('getrole');
  
  // 直接使用导入的组件对象
  const currentComponent = computed(() => {
    switch (selectedOption.value) {
      case 'getrole':
        return GetRole;
      case 'avatar':
        return Avatar;
      case 'rankuser':
        return RankUser;
      case 'level':
        return Level;
      default:
        return null;
    }
  });
  </script>
  
  <style scoped>
  .component-display {
    margin-top: 20px;
  }
  </style>
  