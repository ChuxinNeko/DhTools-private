<template>
    <div class="container">
      <!-- 始终显示的 Signup 组件 -->
      <Signup />
  
      <!-- 根据 localStorage 中是否存在 email 来决定是否显示 Opinion 组件 -->
      <Opinion v-if="isEmailStored" />
    </div>
  </template>
  
  <script setup>
  import Signup from '@/components/Signup.vue';
  import Opinion from '@/components/opinion.vue';
  
  // 检查 localStorage 中是否有 email
  const isEmailStored = localStorage.getItem('email') !== null;
  </script>
  
  <style scoped>
  .container {
    width: 100%;
    max-width: 1000px;  /* 最大宽度 */
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }

  .signup, .opinion {
    width: 100%;
    max-width: 100px; 
    margin-bottom: 1px; 
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
  }
  

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }
  
    .signup, .opinion {
      padding: 15px;
    }
  }
  </style>
  