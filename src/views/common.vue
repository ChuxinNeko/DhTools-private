<template>
  <div class="query-page">
    <a-input v-model="uid" placeholder="请输入UID" style="width: 300px; margin-right: 10px;" />
    <a-button type="primary" @click="fetchData">确定</a-button>

    <a-table
      v-if="replies.length > 0"
      :columns="columns"
      :data="replies"
      row-key="rpid"
      style="margin-top: 20px;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';

export default defineComponent({
  setup() {
    const uid = ref('');
    const replies = ref([]);
    
    const columns = reactive([
      {
        title: 'rpid',
        dataIndex: 'rpid',
        key: 'rpid',
      },
      {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        
      },
      {
        title: '内容',
        dataIndex: 'message',
        key: 'message',
      }
    ]);

    const fetchData = async () => {
      if (!uid.value) {
        Message.error('请输入UID');
        return;
      }

      try {
        const response = await fetch('https://api.moraxs.cn/v3/getreply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: uid.value }),
        });

        const result = await response.json();

        if (result.code === 0) {
          replies.value = result.data.replies;
        } else {
          Message.error(result.message || '查询失败');
        }
      } catch (error) {
        Message.error('请求失败，请检查网络或稍后再试');
      }
    };

    return {
      uid,
      replies,
      columns,
      fetchData,
    };
  },
});
</script>

<style scoped>
.query-page {
  padding: 20px;
}
</style>
