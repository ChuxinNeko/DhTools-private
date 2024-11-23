<template>
  <a-modal
    v-model:visible="visible"
    title="梦乡公益服远程指令生成器-使用须知"
    :maskClosable="false"
    :closable="false"
    :width="isMobile ? '90%' : '500px'"
    :top="isMobile ? '20px' : '60px'"
  >
    <div>
      <p>本项目为独立开源项目，本站仅用于梦乡公益服</p>
      <p>项目不会以任何形式收费，也不会作为任何付费服务器的赠送品，拼多多等电商均为倒卖。</p>
      <p>您在阅读后勾选下方注意事项并点击确定方可开始使用：</p>
      <a-checkbox v-model="checkbox1">
        <span :style="{ color: checkboxTextColor }">我已知晓梦乡服务器和本指令生成器都是免费的，且绝不会以任何形式进行收费。</span>
      </a-checkbox>
      <br />
      <a-checkbox v-model="checkbox2">
        <span :style="{ color: checkboxTextColor }">当我付费得到本项目并遇到问题时，我会主动询问卖家而不是用颐指气使且蛮横的态度来质问开发者。</span>
      </a-checkbox>
      <br />
      <a-checkbox v-model="checkbox3">
        <span :style="{ color: checkboxTextColor }">本站对接的是梦乡公益服，其他服务器请勿询问任何本站的使用问题，谢谢合作！</span>
      </a-checkbox>
    </div>
    <template #footer>
      <!-- 3日内不再提醒-->
      <a-checkbox v-if="showNoShowCheckbox" v-model="checkboxIsNoShow">三日内不再提醒</a-checkbox>
      <!-- cxfm -->
      <a-button type="primary" :disabled="countdown > 0" @click="handleOk">
        {{ countdown > 0 ? `确定 (${countdown}s)` : "确定" }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

const visible = ref(false); // 初始化为 false，页面加载时判断是否显示对话框
const checkbox1 = ref(false);
const checkbox2 = ref(false);
const checkbox3 = ref(false);
const checkboxIsNoShow = ref(false); // 三日不再提醒
const showNoShowCheckbox = ref(false);

const isMobile = computed(() => window.innerWidth < 768);
const checkboxTextColor = computed(() => checkbox1.value && checkbox2.value && checkbox3.value ? 'green' : 'red');

// 倒计时状态
const countdown = ref(5); // 设置倒计时为 5 秒

// 群链接数组
const groupLinks = [
  "https://qm.qq.com/q/a1qDFAGN3O", "https://qm.qq.com/q/jNrna23Qr0", "https://qm.qq.com/q/rJD0ikUUWk", "https://qm.qq.com/q/x81EKFu2OW", "https://qm.qq.com/q/eHclKGip2M",
  "https://qm.qq.com/q/NxnCj3M2I0", "https://qm.qq.com/q/WC6NhUA2oE", "https://qm.qq.com/q/hzZiBo36jC", "https://qm.qq.com/q/tG7Wxe1JiU", "https://qm.qq.com/q/tSEkTfMV5m",
  "https://qm.qq.com/q/NZgBTRtocO", "https://qm.qq.com/q/lPK5dFBeUM", "https://qm.qq.com/q/YR1EiqKjYY", "https://qm.qq.com/q/kBNvfWIPhm", "https://qm.qq.com/q/gGAWeEogVM"
];

// 随机选择链接
const getRandomGroupLink = () => groupLinks[Math.floor(Math.random() * groupLinks.length)];

onMounted(() => {
  const noShowTimestamp = localStorage.getItem("IsNoShow");
  const currentTime = new Date().getTime();

  if (!noShowTimestamp || currentTime > Number(noShowTimestamp)) {
    visible.value = true;

    // 启动倒计时
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        showNoShowCheckbox.value = true; // 倒计时结束显示“三日内不再提醒”复选框
      }
    }, 1000);
  }
});

const handleOk = () => {
  if (!checkbox1.value || !checkbox2.value || !checkbox3.value) {
    Message.error('请仔细阅读注意事项并勾选所有选项。');
    return;
  }
  const randomLink = getRandomGroupLink();
  window.open(randomLink, "_blank");

  if (checkboxIsNoShow.value) {
    const threeDaysLater = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("IsNoShow", String(threeDaysLater));
  }

  visible.value = false;
};
</script>

  <style scoped>
  a-modal {
    width: 90%;
    max-width: 500px;
  }
  
  a-checkbox {
    display: block;
    margin: 10px 0;
  }
  
  a-button {
    margin-top: 10px;
  }
  </style>
  