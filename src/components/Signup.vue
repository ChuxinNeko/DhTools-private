<template>
  <div class="login-container">
    <!-- 如果email存在，显示简洁卡片 -->
    <a-card v-if="email" :style="{ width: '360px' }">
      <div slot="title" class="card-header">
        <span>{{ email }}</span>
        <a-button type="text" @click="logout">注销</a-button>
      </div>
      <div>欢迎回来！</div>
    </a-card>

    <!-- 如果email不存在，显示登录卡片 -->
    <a-card v-else :style="{ width: '360px' }" title="登录">
      <a-input v-model="form.email" placeholder="请输入邮箱" style="margin-bottom: 12px;" />
      <a-input-password v-model="form.password" placeholder="请输入密码" style="margin-bottom: 12px;" />
      
      <!-- 极验验证码组件 -->
      <a-form-item>
        <GeetestCaptcha :onSuccess="handleCaptchaSuccess" :key="captchaKey" />
      </a-form-item>

      <a-button type="primary" block @click="login" :disabled="!captchaVerified" long>登录</a-button>

      <!-- 注册账号文字超链接 -->
      <div class="register-link">
        <a @click="goToRegister" style="color: #1890ff; cursor: pointer;">注册账号</a>
      </div>
    </a-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import axios from 'axios';
import GeetestCaptcha from '@/components/GeetestCaptcha.vue';  // 引入极验验证码组件
import { useRouter } from 'vue-router';  // 引入 Vue Router

export default {
  name: 'Login',
  setup() {
    const form = ref({
      email: '',
      password: ''
    });
    const email = ref(localStorage.getItem('email')); // 从 localStorage 获取 email
    const captchaVerified = ref(false);  // 标记验证码是否验证通过
    const captchaKey = ref(0);  // 用于重新加载验证码
    const router = useRouter();  // 使用 Vue Router

    // 极验验证码验证成功后的回调函数
    const handleCaptchaSuccess = (result) => {
      captchaVerified.value = true;
      console.log('人机验证成功', result);
    };

    // 登录函数
    const login = async () => {
      if (!captchaVerified.value) {
        Message.error('请完成验证码验证');
        return;
      }

      try {
        const response = await axios.post('https://notice.cialloo.site/login', {
          email: form.value.email,
          password: form.value.password
        });

        // 登录成功
        if (response.data.code === 0) {
          localStorage.setItem('email', form.value.email); // 保存 email 到 localStorage
          email.value = form.value.email; // 更新显示的 email
          Message.success('登录成功');
        } else if (response.data.code === -2) {
          // 邮箱未找到
          Message.error('邮箱未找到，请检查您的邮箱地址');
        } else if (response.data.code === -1) {
          // 密码错误
          Message.error('密码错误，请重新输入');
        } else {
          // 其他错误
          Message.error(response.data.message || '登录失败');
        }
      } catch (error) {
        Message.error('网络错误，请稍后再试');
      }
    };

    // 注销函数
    const logout = () => {
      localStorage.removeItem('email'); // 清除 localStorage 中的 email
      email.value = null; // 清除当前组件的 email 状态
      Message.success('已注销');
    };

    // 跳转到注册页面
    const goToRegister = () => {
      router.push('/register');  // 使用 Vue Router 跳转到注册页面
    };

    // 组件挂载时检查 localStorage 中是否有 email
    onMounted(() => {
      if (email.value) {
        Message.success('欢迎回来！');
      }

      // 动态加载极验的 SDK
      const script = document.createElement('script');
      script.src = 'https://static.geetest.com/static/tools/gt.js';
      script.onload = () => {
        console.log('极验SDK初始化成功');
      };
      script.onerror = () => {
        console.error('极验SDK初始化失败');
      };
      document.head.appendChild(script);
    });

    return {
      form,
      email,
      login,
      logout,
      captchaVerified,
      captchaKey,
      handleCaptchaSuccess,
      goToRegister
    };
  }
};
</script>


