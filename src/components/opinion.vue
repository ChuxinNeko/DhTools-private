<template>
  <div class="feedback-card">
    <a-card :style="{ width: '360px' }" title="反馈提交" class="feedback-card-content">
      <a-form :model="form" ref="formRef" label-width="80px">
        <!-- UID输入框 -->
        <a-form-item label="UID">
          <a-input v-model="form.uid" placeholder="请输入UID"></a-input>
        </a-form-item>

        <!-- 反馈文本输入框 -->
        <a-form-item label="反馈内容">
          <a-textarea v-model="form.text" placeholder="请输入您的反馈" rows="4"></a-textarea>
        </a-form-item>

        <!-- 提交按钮 -->
        <a-form-item>
          <a-button type="primary" @click="handleSubmit">提交反馈</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

export default {
  name: 'FeedbackCard',
  setup() {
    // 表单数据
    const form = ref({
      uid: '', // UID
      text: '' // 反馈内容
    });

    // 引用表单
    const formRef = ref();

    // 当组件挂载时，读取 localStorage 中的 UID
    onMounted(() => {
      const storedUid = localStorage.getItem('uid');
      if (storedUid) {
        form.value.uid = storedUid;
      }
    });

    // 提交表单
    const handleSubmit = async () => {
      if (!form.value.text) {
        Message.error('反馈内容不能为空');
        return;
      }

      // 获取邮箱值
      const email = localStorage.getItem('email');

      // 构造请求数据
      const payload = {
        email: email || '',
        uid: form.value.uid,
        text: form.value.text
      };

      try {
        const response = await fetch('https://notice.cialloo.site/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          Message.success('反馈提交成功');
          form.value.text = ''; // 清空文本框
        } else {
          Message.error('反馈提交失败');
        }
      } catch (error) {
        Message.error('网络错误，请稍后重试');
      }
    };

    return {
      form,
      formRef,
      handleSubmit
    };
  }
};
</script>

<style scoped>

</style>
