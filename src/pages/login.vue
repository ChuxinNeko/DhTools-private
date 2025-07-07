<template>
  <div>
    <div :style="{ height: '20px' }"></div>
    <a-alert closable>
  需要先在QQ群内绑定账号才能使用发送验证码等后续功能！
</a-alert>
    <a-form :model="form" class="form-container" @submit="handleSubmit">
      <a-form-item field="keyType" label="Key Type">
        <a-input v-model="form.keyType" placeholder="请输入Key Type..." />
      </a-form-item>
      <a-form-item field="uid" label="UID">
        <a-input v-model="form.uid" placeholder="请输入玩家UID..." />
      </a-form-item>
      
      <a-form-item>
        <a-button type="primary" shape="round" @click="startVerificationProcess">
          发送验证码
        </a-button>
      </a-form-item>
      
      <a-form-item field="verificationCode" label="验证码">
        <a-input v-model="form.verificationCode" placeholder="请输入验证码..." />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" shape="round" size="large" html-type="submit">提交</a-button>
          <a-button type="primary" shape="round" size="large" html-type="reset" @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>

      <a-form-item label="response">
        <a-input v-model="responseData" :disabled="true" />
      </a-form-item>
    </a-form>
    <!-- The Geetest component is now controlled programmatically. -->
    <GeetestCaptcha ref="geetestCaptchaRef" :onSuccess="handleCaptchaSuccess" :key="captchaKey" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import axios from 'axios';
import GeetestCaptcha from '@/components/GeetestCaptcha.vue';

const API_BASE_URL = import.meta.env.VITE_DHWT_API_SERVER;

const form = reactive({
  keyType: 'PEM',
  uid: '',
  verificationCode: ''
});

const responseData = ref('');
const showMessage = ref(false);
const messageType = ref<'success' | 'info' | 'warning' | 'error'>('info');
const message = ref('');
const verificationCodes = new Map<string, { code: string; expiry: number }>(); 
const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000; // 验证码有效期5分钟

const geetestCaptchaRef = ref<InstanceType<typeof GeetestCaptcha> | null>(null);
const captchaKey = ref(0); // Used to force re-render of captcha component if needed.

const generateRandomCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 生成5位数字
};

const startVerificationProcess = () => {
  if (!form.uid) {
    Message.error('请填写 UID。');
    return;
  }
  geetestCaptchaRef.value?.startVerification();
};

const sendVerificationCode = async () => {
  const uid = form.uid;
  if (!uid) {
    Message.error('请填写 UID。');
    return;
  }

  const generatedCode = generateRandomCode();
  const expiry = Date.now() + VERIFICATION_CODE_EXPIRY;
  
  verificationCodes.set(uid, { code: generatedCode, expiry });

  const command = `mail 初心疯魔 1 365 _TITLE 梦乡指令器验证码 _CONTENT 初心疯魔温馨提示:您的验证码是喵：${generatedCode}`;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/submit`, {
      keyType: form.keyType,
      uid: uid,
      command: command
    });

    const backendMessage = response.data?.data?.message || '';
    Message.info(`${backendMessage}本验证码只对梦乡有效，若您游玩的星铁左下角没有显示“梦乡”，则您被骗。`);
    
    console.log(`UID: ${uid}, 验证码过期时间: ${new Date(expiry).toLocaleTimeString()}`);
  } catch (err) {
    let errorMessage = '验证码发送失败';

    if (axios.isAxiosError(err)) {
      const responseData = err.response?.data;
      
      Message.error(`验证码发送失败：${JSON.stringify(responseData)}`);
    } else {
      Message.error('未知错误，请稍后重试。');
    }

    console.error(err);
  }
};


const handleReset = () => {
  form.keyType = "PEM";
  form.uid = "";
  form.verificationCode = "";
  responseData.value = "";
  showMessage.value = false;
  messageType.value = 'info';
  message.value = "";
};

const handleSubmit = (data: { values: Record<string, any>; errors: Record<string, any> | undefined }) => {
  const { values } = data;

  const uid = values.uid;
  const inputCode = values.verificationCode;

  // 验证 UID 和验证码
  const stored = verificationCodes.get(uid);
  if (stored) {
    if (stored.code === inputCode && Date.now() < stored.expiry) {
      responseData.value = '验证成功';
      showMessage.value = true;
      messageType.value = 'success';
      message.value = '验证成功';
      Message.success('验证成功');
      
      // 验证成功，将 UID 存入缓存
      localStorage.setItem('uid', uid);
      console.log('UID stored:', localStorage.getItem('uid'));
    } else {
      Message.error('验证码错误或已过期，请重新输入。');
    }
  } else {
    Message.error('UID 不存在或验证码未生成。');
  }
};

const handleCaptchaSuccess = (result: any) => {
  console.log('人机验证成功', result);
  // After human verification is successful, automatically send the verification code.
  sendVerificationCode();
};

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
</script>

<style lang="less" scoped>
.form-container {
  margin-top: 20px;
  width: 600px;
  margin: auto;
}

a-form-item {
  margin-bottom: 16px;
}

a-input-group {
  display: flex;
  align-items: center;
}

a-input-group > a-input {
  margin-right: 8px;
}

.input-small {
  width: 80px;
}

.input-medium {
  width: 160px;
}

@media screen and (max-width: 768px) {
  .form-container {
    width: 100%;
    padding: 10px;
  }

  a-input-group {
    flex-direction: column;
    align-items: flex-start;
  }

  a-input-group > a-input {
    margin-right: 0;
    margin-bottom: 8px;
    width: 100%;
  }

  .input-small,
  .input-medium {
    width: 100%;
  }

  a-space {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  a-space > .arco-button {
    width: 100%;
    margin-top: 10px;
  }

  a-form-item {
    margin-bottom: 12px;
  }
}
</style>