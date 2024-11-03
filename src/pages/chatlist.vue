<template>
    <div class="content-wrapper">
      <!-- 验证窗口 -->
      <div v-if="!isAuthenticated" class="auth-overlay">
        <h3>我们需要确认你不是初心浮梦</h3>
        <a-input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          style="width: 300px; margin-bottom: 20px"
        />
        <a-button type="primary" @click="authenticate">确定</a-button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
  
      <!-- 主内容区域，仅在通过验证后显示 -->
      <div v-if="isAuthenticated">
        <a-input-search
          v-model="uid"
          placeholder="请输入UID"
          enter-button="确定"
          @search="fetchData"
          style="width: 300px; margin-bottom: 20px"
        />
        <a-table :columns="columns" :data="tableData" row-key="Id" />
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { reactive, ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import axios from 'axios';
  
  const uid = ref('');
  const tableData = ref([]);
  const password = ref(''); // 绑定密码输入框的值
  const isAuthenticated = ref(false); // 用于追踪用户是否已通过验证
  const errorMessage = ref('');
  
  // 正确的密码
  const correctPassword = 'cxfm250';
  
  // 表格列配置
  const columns = reactive([
    { title: '序号', dataIndex: 'Id' },
    { title: '账户', dataIndex: 'Account' },
    { title: '昵称', dataIndex: 'Name' },
    { title: 'UID', dataIndex: 'SendUid' },
    { title: '内容', dataIndex: 'Message' }
  ]);
  
  // 验证密码的方法
  const authenticate = () => {
    if (password.value === correctPassword) {
      isAuthenticated.value = true;
      errorMessage.value = '';
      // 验证通过后加载数据
      fetchData();
    } else {
      errorMessage.value = '密码错误，请重试';
    }
  };
  
  // 获取数据的方法
  const fetchData = async () => {
    try {
      const url = uid.value
        ? `https://api.starxe.top/chatlist?uid=${uid.value}&page=1`
        : 'https://api.starxe.top/chatlist?count=2000&page=1';
  
      const response = await axios.get(url);
      if (response.data.retcode === 0) {
        tableData.value = response.data.data;
      } else {
        Message.error('数据加载失败: ' + response.data.message);
      }
    } catch (error) {
      Message.error('请求失败，请检查网络连接');
    }
  };
  </script>
  
  <style scoped>
  /* 内容区域的容器样式 */
  .content-wrapper {
    position: relative; /* 设置相对定位，使遮罩仅限于内容区域 */
    padding: 20px; /* 根据页面布局需求调整 */
  }
  
  /* 遮罩层样式，覆盖内容区域 */
  .auth-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* 半透明背景 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 10;
  }
  
  .error-message {
    color: red;
    margin-top: 10px;
  }
  </style>
  