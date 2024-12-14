<template>
  <div>
    <div :style="{ height: '20px' }"></div>
    <a-alert closable>
  如果使用遇到异常，<a href="https://status.cialloo.site/status/cxfm" target="_blank" style="color: #1890ff;">点击这里</a>查看服务状态。
</a-alert>
    <a-form :model="form" class="form-container" @submit="handleSubmit">
      <a-form-item field="keyType" label="Key Type">
        <a-input v-model="form.keyType" placeholder="请输入Key Type..." />
      </a-form-item>
      <a-form-item field="uid" label="UID">
        <a-input v-model="form.uid" placeholder="请输入玩家UID..." />
      </a-form-item>
      
      <a-form-item>
        <a-button type="primary" shape="round" @click="sendVerificationCode" :disabled="!captchaVerified">
          发送验证码
        </a-button>
      </a-form-item>
      
      <a-form-item field="verificationCode" label="验证码">
        <a-input v-model="form.verificationCode" placeholder="请输入验证码..." />
      </a-form-item>

      <!-- 极验验证码组件 -->
      <a-form-item>
        <GeetestCaptcha :onSuccess="handleCaptchaSuccess" :key="captchaKey" />
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import axios from 'axios';
import GeetestCaptcha from '@/components/GeetestCaptcha.vue';

const API_BASE_URL = import.meta.env.VITE_DHWT_API_SERVER;

Const 形式=反应的({
  KeyType:'PEM',
  UID:'',
  verificationCode:''
});

Const ResponseData=裁判('');
Const ShowMessage=裁判(假的);
Const messageType=ref<'成功'|'信息'|'警告'|'错误'>('信息');
Const 消息=裁判('');
Const 验证代码=新的map<string，{ 代码：string；到期：number}>();
Const verification_CODE_EXPIRY=5*60*1000;// 验证码有效期5分钟

Const captchaVerified=裁判(假的);// 标记验证码是否通过
Const captchaKey=裁判(0);// 用于触发验证码重新加载

Const generateRandomCode=()=>{
  返回数学。地板(10000+数学。随机()*90000).toString();// 生成5位数字
};

Const sendVerificationCode=异步 ()=>{
  Const UID=表格。UID;
  如果 (！UID) {
消息。误差('请填写UID。');
    返回;
  }

  Const GeneratedCode=generateRandomCode();
  Const 到期=日期。现在()+VERIFICATION_CODE_EXPIRY；
  
验证代码。设置(UID，{ 代码：GeneratedCode，到期 });

  Const 命令='邮件管理员1365_TITLE梦乡指令器验证码_内容您的验证码是喵：${GeneratedCode}.本验证码只对应梦乡星铁服有效，若您游玩的星铁左下角没有显示“梦乡“，对此您也用不了我们的指令器。 请勿外泄验证码以免对您造成不必要的损失。 本指令是免费的，如果你是花钱得到的本指令跟包体，请立即退款加举报。 `;

  尝试 {
    等候Axios。邮件(`${API_BASE_URL}/api/Submit',{
      KeyType：窗体。KeyType,
      UID：uid，
      命令：命令
    });
消息。成功(`验证码发送成功，有效期为5分钟。 `);
控制台。日志('UID：${UID},验证码过期时间:${新的日期(到期).toLocaleTimeString()}`);
  } 赶上 (犯错) {
    让 ErrorMessage='验证码发送失败';

    如果 (Axios。isAxiosError(犯错)) {
      Const ResponseData=err.响应?.数据 作为 { 消息？：字符串};
ErrorMessage=ResponseData？。消息||errorMessage；
    }

消息。误差(`验证码发送失败：${ErrorMessage}`);
控制台。误差(犯错);
  }
};

Const handleReset=()=>{
形式。KeyType="PEM";
形式。UID=“”;
形式。verificationCode=“”;
响应数据。价值=“”;
ShowMessage。价值=假的;
messageType。价值='信息';
消息。价值=“”;
};

Const handleSubmit=(数据:{ 值：记录<string，any>；错误：记录<string，any>|未定义})=>{
  Const { 值 }=数据；

  Const UID=值。UID;
  Const inputCode=值。verificationCode;

  //验证UID和验证码
  Const 储存=verificationCodes。得到(UID);
  如果 (储存) {
    如果 (储存。代码===输入代码和日期。现在()<已存储。到期) {
响应数据。价值='验证成功';
ShowMessage。价值=正确;
messageType。价值='成功';
消息。价值='验证成功';
消息。成功('验证成功');
      
      //验证成功，将UID存入缓存
localStorage。setitem('uid'，uid);
控制台。日志('存储的UID：'，localStorage。getitem('uid'));
    } 其他 {
消息。误差('验证码错误或已过期，请重新输入。 ');
    }
  } 其他 {
消息。误差('UID不存在或验证码未生成.');
  }
};

Const handleCaptchaSuccess=(结果：任意)=>{
  // 极验验证成功时，将 captchaVerified 标记为 true
  captchaVerified.value = true;
  console.log('人机验证成功', result);
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
