<template>
    <div class="content-wrapper">
      <!-- 验证部分 -->
      <div v-if="!isAuthenticated" class="auth-container">
        <div class="auth-box">
          <h2>访问验证</h2>
          <a-input
            v-model="password"
            type="password"
            placeholder="请输入访问密码"
            @keyup.enter="authenticate"
          />
          <a-button type="primary" @click="authenticate" :loading="loading">
            验证
          </a-button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
      </div>
  
      <!-- 主内容区域 -->
      <template v-else>
        <div class="search-container">
          <a-input-search
            v-model="uid"
            placeholder="请输入UID"
            enter-button="确定"
            @search="fetchData"
          />
        </div>
        <div class="table-container">
          <a-table 
            :columns="columns" 
            :data="tableData" 
            row-key="Id"
            :scroll="{ x: '100%' }"
            :pagination="{
              pageSize: 12,
              total: tableData.length,
              showTotal: true,
              showJumper: true,
              size: 'small'
            }"
          />
        </div>
      </template>
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
  const loading = ref(false);
  
  // 正确的密码
  const correctPassword = 'cxfm250';
  
  // 表格列配置
  const columns = reactive([
    { 
      title: '序号', 
      dataIndex: 'Id', 
      width: 70,
      fixed: 'left'
    },
    { 
      title: '账户', 
      dataIndex: 'Account', 
      width: 120 
    },
    { 
      title: '昵称', 
      dataIndex: 'Name', 
      width: 120 
    },
    { 
      title: 'UID', 
      dataIndex: 'SendUid', 
      width: 120 
    },
    { 
      title: '内容', 
      dataIndex: 'Message',
      width: 200,
      ellipsis: true,
      tooltip: true,
      render: ({ record }) => {
        return h('div', { class: 'message-cell' }, record.Message);
      }
    }
  ]);
  
  const authenticate = async () => {
    if (!password.value) {
      errorMessage.value = '请输入密码';
      return;
    }
  
    loading.value = true;
    try {
      // 模拟验证延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (password.value === correctPassword) {
        isAuthenticated.value = true;
        errorMessage.value = '';
        // 验证成功后加载数据
        fetchData();
      } else {
        errorMessage.value = '密码错误，请重试';
      }
    } finally {
      loading.value = false;
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
  .content-wrapper {
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }
  
  .auth-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 100%;
    max-width: 400px;
  }
  
  .auth-box h2 {
    margin-bottom: 24px;
    color: #333;
  }
  
  .auth-box .a-input {
    margin-bottom: 16px;
  }
  
  .auth-box .a-button {
    margin-top: 16px;
    width: 120px;
  }
  
  .error-message {
    color: #f5222d;
    margin-top: 16px;
    font-size: 14px;
  }
  
  .search-container {
    margin-bottom: 20px;
  }
  
  .search-container :deep(.arco-input-search) {
    width: 100%;
    max-width: 300px;
  }
  
  .table-container {
    flex: 1;
    position: relative;
    margin-bottom: 20px;
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 768px) {
    .content-wrapper {
      padding: 10px;
    }
    
    .table-container {
      margin-bottom: 10px;
    }
    
    /* 移动端表格样式优化 */
    :deep(.arco-table-cell) {
      padding: 8px !important;
    }
    
    :deep(.message-cell) {
      max-height: 60px;
      overflow-y: auto;
      white-space: normal;
      word-break: break-all;
      line-height: 1.4;
      font-size: 14px;
    }
    
    /* 优化分页器在移动端的显示 */
    :deep(.arco-pagination) {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
  }
  </style>
  