<template>
  <a-form :model="form" :style="{ width: '100%', maxWidth: '600px', margin: '0 auto' }" @submit="handleSubmit">
    <!-- 邮箱输入框 -->
    <a-form-item field="email" label="邮箱">
      <a-input
        v-model="form.email"
        placeholder="请输入您的QQ邮箱"
        @input="validateEmail"
      />
      <span>@qq.com</span>
      <span v-if="emailError" style="color: red;">{{ emailError }}</span>
    </a-form-item>

    <!-- 发送验证码按钮 -->
    <a-form-item>
      <a-button :disabled="isButtonDisabled" @click="sendVerificationCode">
        {{ buttonText }}
      </a-button>
    </a-form-item>

    <!-- 验证码输入框 -->
    <a-form-item field="verificationCode" label="验证码">
      <a-input
        v-model="form.verificationCode"
        placeholder="请输入验证码"
      />
    </a-form-item>

    <!-- 密码输入框 -->
    <a-form-item field="password" label="密码">
      <a-input-password
        v-model="form.password"
        placeholder="请输入密码"
      />
    </a-form-item>

    <!-- 确认密码输入框 -->
    <a-form-item field="confirmPassword" label="确认密码">
      <a-input-password
        v-model="form.confirmPassword"
        placeholder="确认密码"
        :on-blur="checkPasswordMatch"
      />
      <span v-if="passwordError" style="color: red;">{{ passwordError }}</span>
    </a-form-item>

    <!-- 提交按钮 -->
    <a-form-item>
      <a-button type="primary" html-type="submit">提交</a-button>
    </a-form-item>

    <!-- 返回登录按钮 -->
    <a-form-item>
      <a-button @click="goBackToLogin" style="margin-top: 10px;">返回登录</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { Message } from '@arco-design/web-vue'; // 引入 Message 组件
import { useRouter } from 'vue-router'; // 引入 vue-router

export default {
  setup() {
    const router = useRouter(); // 获取路由对象
    const form = reactive({
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
    });

    const emailError = ref('');
    const passwordError = ref('');
    const isEmailValid = ref(false);
    const verificationCodeSent = ref('');
    const isButtonDisabled = ref(false); // 控制按钮是否禁用
    const buttonText = ref('发送验证码'); // 按钮的文本内容
    const countdown = ref(0); // 倒计时秒数
    const countdownInterval = ref(null); // 保存倒计时的定时器

    // 校验邮箱格式
    const validateEmail = () => {
      if (!form.email.trim()) {
        emailError.value = '请输入邮箱地址';
        isEmailValid.value = false;
      } else {
        emailError.value = '';
        isEmailValid.value = true;
      }
    };

    // 校验密码是否匹配
    const checkPasswordMatch = () => {
      if (form.password !== form.confirmPassword) {
        passwordError.value = '密码不一致';
      } else {
        passwordError.value = '';
      }
    };

    // 发送验证码
    const sendVerificationCode = async () => {
      if (isEmailValid.value && form.email) {
        // 启动倒计时并禁用按钮
        startCountdown();

        // 显示正在发送验证码的 loading 提示
        Message.loading('正在发送验证码...', 0);

        try {
          const fullEmail = form.email + '@qq.com';
          const response = await fetch('https://mail.cialloo.site/mail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: fullEmail }),
          });

          const data = await response.json();

          if (response.ok) {
            verificationCodeSent.value = data.verification_code;
            Message.success('验证码发送成功！');
          } else {
            Message.error(data.error || '发送验证码失败');
            clearInterval(countdownInterval.value); // 停止倒计时
            isButtonDisabled.value = false; // 启用按钮
            buttonText.value = '发送验证码'; // 恢复按钮文字
          }
        } catch (error) {
          Message.error('发送验证码时出错');
          clearInterval(countdownInterval.value); // 停止倒计时
          isButtonDisabled.value = false; // 启用按钮
          buttonText.value = '发送验证码'; // 恢复按钮文字
        }
      } else {
        Message.error('请输入有效的邮箱地址');
      }
    };

    // 启动倒计时
    const startCountdown = () => {
      isButtonDisabled.value = true; // 禁用按钮
      buttonText.value = `${countdown.value}秒后重发`;

      countdown.value = 120; // 初始化为120秒
      // 保存倒计时的状态
      localStorage.setItem('countdown', countdown.value);

      // 使用 setInterval 每秒更新倒计时
      countdownInterval.value = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value -= 1;
          buttonText.value = `${countdown.value}秒后重发`;
        } else {
          clearInterval(countdownInterval.value); // 清除定时器
          isButtonDisabled.value = false; // 启用按钮
          buttonText.value = '发送验证码'; // 恢复按钮文字
        }
      }, 1000); // 每1000毫秒（即1秒）更新一次
    };

    // 页面加载时恢复倒计时状态
    onMounted(() => {
      const savedCountdown = localStorage.getItem('countdown');
      if (savedCountdown && savedCountdown > 0) {
        countdown.value = savedCountdown;
        // 如果倒计时还有剩余，恢复倒计时状态（不自动开始倒计时）
      }
    });

    // 页面卸载时清除定时器
    onBeforeUnmount(() => {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
      }
    });

    // 提交表单
    const handleSubmit = async () => {
      if (form.password !== form.confirmPassword) {
        passwordError.value = '密码不一致';
        return;
      }

      if (form.verificationCode !== verificationCodeSent.value) {
        Message.error('验证码不正确');
        return;
      }

      try {
        const response = await fetch('https://notice.cialloo.site/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email + '@qq.com',
            password: form.password,
            verificationCode: form.verificationCode,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          Message.success(data.message || '表单提交成功！');
        } else {
          Message.error(data.message || '提交表单失败');
        }
      } catch (error) {
        Message.error('提交表单时出错');
      }
    };

    // 返回登录
    const goBackToLogin = () => {
      router.push('/feedback');
    };

    return {
      form,
      emailError,
      passwordError,
      isEmailValid,
      validateEmail,
      checkPasswordMatch,
      sendVerificationCode,
      handleSubmit,
      verificationCodeSent,
      isButtonDisabled,
      buttonText,
      countdown,
      goBackToLogin,
    };
  },
};
</script>

<style scoped>
a-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
