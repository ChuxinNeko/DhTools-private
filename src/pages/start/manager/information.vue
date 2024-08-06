<template>
  <div>
    <!-- 服务器状态页面 -->
    <a-card v-if="!hasError" bordered>
      <template #title>
        <div class="card-title">
          <span>服务器状态</span>
          <a-progress
            size="mini"
            status="warning"
            :percent="countdownPercent"
            style="margin-left: 20px; width: 100px;"
          />
        </div>
      </template>
      <a-row :gutter="16">
        <a-col :span="24">
          <div class="status-info">
            <div class="info-section">
              <a-progress
                type="circle"
                :percent="cpuUsagePercent"
                :style="{ width: '100px' }"
                :color="{
                  '0%': 'rgb(var(--primary-6))',
                  '100%': 'rgb(var(--success-6))',
                }"
                :format="percent => `${(percent * 100).toFixed(0)}%`"
              />
              <p><strong>CPU 使用率：</strong>{{ (cpuUsagePercent * 100).toFixed(0) }}%</p>
              <p><strong>CPU 型号：</strong>{{ serverInfo.cpuModel }}</p>
              <p><strong>系统版本：</strong>{{ serverInfo.systemVersion }}</p>
            </div>
            <div class="info-section">
              <a-progress
                type="circle"
                :percent="memoryUsagePercent"
                :style="{ width: '100px' }"
                :color="{
                  '0%': 'rgb(var(--primary-6))',
                  '100%': 'rgb(var(--success-6))',
                }"
                :format="percent => `${(percent * 100).toFixed(0)}%`"
              />
              <p><strong>内存使用率：</strong>{{ (memoryUsagePercent * 100).toFixed(0) }}%</p>
              <p><strong>最大内存：</strong>{{ serverInfo.maxMemory }} MB</p>
              <p><strong>已用内存：</strong>{{ serverInfo.usedMemory }} MB</p>
              <p><strong>程序使用内存：</strong>{{ serverInfo.programUsedMemory }} MB</p>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 错误页面 -->
    <a-result v-if="hasError" status="error" title="获取服务器状态失败">
      <template #icon>
        <IconFaceFrownFill />
      </template>
      <template #subtitle>{{ errorMessage }}</template>

      <template #extra>
        <a-button type="primary" @click="refresh">Refresh</a-button>
      </template>
      <a-typography style="background: var(--color-fill-2); padding: 24px;">
        <a-typography-paragraph>Try:</a-typography-paragraph>
        <ul>
          <li>检查您的网络</li>
          <li>将上方报错信息反馈给服务器管理员</li>
        </ul>
      </a-typography>
    </a-result>

    <!-- 实时日志卡片 -->
    <a-card v-if="!hasError" title="API实例控制台" bordered style="margin-top: 20px;">
      <div class="log-container" v-html="formattedLogs"></div>

      <!-- 密码验证 -->
      <div v-if="!isAuthenticated" class="password-input">
        <a-input-password v-model="password" placeholder="输入密码" style="width: 100%; margin-right: 10px;" />
        <a-button type="primary" @click="authenticate">确定</a-button>
      </div>

      <!-- 命令输入框 -->
      <div v-if="isAuthenticated" class="command-input">
        <a-input 
          v-model="commandInput" 
          placeholder="输入命令然后按下Enter键" 
          @keydown.enter="sendCommand" 
          style="width: 100%;" 
        />
      </div>
    </a-card>
  </div>
</template>
<script>
import axios from 'axios';
import { Message } from '@arco-design/web-vue';
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { IconFaceFrownFill } from '@arco-design/web-vue/es/icon';
import AnsiToHtml from 'ansi-to-html';

export default {
  name: 'ServerStatus',
  components: {
    IconFaceFrownFill,
  },
  setup() {
    const serverInfo = ref({});
    const intervalId = ref(null);
    const countdownPercent = ref(1);
    const countdownIntervalId = ref(null);
    const hasError = ref(false);
    const errorMessage = ref('');
    const logs = ref([]);
    const commandInput = ref('');
    const password = ref('');
    const isAuthenticated = ref(false);
    const socket = ref(null);

    const ansiToHtml = new AnsiToHtml();

    const cpuUsagePercent = computed(() => {
      return serverInfo.value.cpuUsage ? Number((serverInfo.value.cpuUsage / 100).toFixed(2)) : 0;
    });

    const memoryUsagePercent = computed(() => {
      return serverInfo.value.maxMemory && serverInfo.value.usedMemory
        ? Number((serverInfo.value.usedMemory / serverInfo.value.maxMemory).toFixed(2))
        : 0;
    });

    const fetchServerInfo = async () => {
      try {
        const apiServer = import.meta.env.VITE_DHWT_API_SERVER;
        const serverResponse = await axios.get(`${apiServer}/api/status`, {
          timeout: 15000 
        });

        if (serverResponse.data.code === 0) {
          serverInfo.value = serverResponse.data.data;
          hasError.value = false;
        } else {
          throw new Error('获取服务器信息失败');
        }
      } catch (error) {
        hasError.value = true;
        errorMessage.value = error.toJSON ? JSON.stringify(error.toJSON()) : error.message;
        Message.error(error.message || '请求失败');
      }
    };

    const startCountdown = () => {
      let countdown = 10;
      countdownPercent.value = 1;
      countdownIntervalId.value = setInterval(() => {
        countdown -= 1;
        countdownPercent.value = countdown / 10;
        if (countdown <= 0) {
          countdown = 10;
        }
      }, 1000);
    };

    const refresh = () => {
      hasError.value = false;
      errorMessage.value = '';
      fetchServerInfo();
    };

    const authenticate = () => {
      if (password.value === 'admin1234') {
        isAuthenticated.value = true;
        password.value = ''; // Clear the password field
        socket.value = initWebSocket();
      } else {
        Message.warning('密码错误');
      }
    };

    const initWebSocket = () => {
      const wsUrl = 'wss://api.starxe.top/logs';
      
      const socketInstance = new WebSocket(wsUrl);

      socketInstance.onmessage = (event) => {
        const logMessage = event.data;
        logs.value.push(logMessage);

        // 保持日志数量不超过一定数量，例如100条
        if (logs.value.length > 100) {
          logs.value.shift();
        }
      };

      socketInstance.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      socketInstance.onclose = () => {
        console.log('WebSocket connection closed.');
      };

      return socketInstance;
    };

    const formattedLogs = computed(() => {
      // 使用 ansi-to-html 库将 ANSI 转义码转换为 HTML
      return logs.value.map(log => ansiToHtml.toHtml(log)).join('<br/>');
    });

    const sendCommand = () => {
      if (commandInput.value.trim()) {
        const commandMessage = commandInput.value.trim();
        socket.value.send(commandMessage);
        commandInput.value = ''; // 清空输入框

        // 使用 nextTick 确保 DOM 更新后再滚动
        nextTick(() => {
          const logContainer = document.querySelector('.log-container');
          if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
          }
        });
      } else {
        Message.warning('请输入命令');
      }
    };

    onMounted(() => {
      fetchServerInfo();
      intervalId.value = setInterval(fetchServerInfo, 10000);
      startCountdown();
    });

    onBeforeUnmount(() => {
      clearInterval(intervalId.value);
      clearInterval(countdownIntervalId.value);
      if (socket.value) {
        socket.value.close();
      }
    });

    return {
      serverInfo,
      cpuUsagePercent,
      memoryUsagePercent,
      countdownPercent,
      hasError,
      errorMessage,
      refresh,
      formattedLogs,
      commandInput,
      sendCommand,
      password,
      isAuthenticated,
      authenticate
    };
  }
};
</script>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
}

.card-title span {
  font-size: 16px;
  font-weight: 500;
}

.a-progress {
  margin-left: 20px;
  width: 100px;
}

.a-progress .ant-progress-circle-inner {
  background-color: #f5f5f5;
}

.a-progress .ant-progress-circle-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.status-info {
  display: flex;
  flex-direction: row; /* 横向排列 */
  
  justify-content: center
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px; /* 增加横向间距 */
}

/* 默认样式：竖屏适配 */
.log-container {
  max-height: 300px;
  height: 300px; 
  max-width: 250px;  /* 设置最大宽度 */
  width: 250px;      /* 初始宽度与最大宽度相同 */
  overflow: auto;    /* 同时启用横向和纵向滚动条 */
  box-sizing: border-box; /* 确保内边距和边框不会超出设置的宽度 */
  padding: 10px;    /* 添加内边距以提供更好的显示效果 */
  white-space: nowrap; /* 防止长内容自动换行 */
}

/* 横屏适配 */
@media (orientation: landscape) {
  .log-container {
    max-height: 300px;
    height: 300px; /* 设置最大高度 */
    max-width: 1000px; /* 设置最大宽度 */
    width: 1000px;     /* 初始宽度与最大宽度相同 */
    overflow: auto;    /* 同时启用横向和纵向滚动条 */
    box-sizing: border-box; /* 确保内边距和边框不会超出设置的宽度 */
    padding: 10px;    /* 添加内边距以提供更好的显示效果 */
    white-space: nowrap;
  }
}

.error-message {
  color: #f5222d;
}

.command-input {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.password-input {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.a-input {
  width: 100%;
}
</style>
