<template>
  <div class="scroll-notice" v-if="message">
    <div class="notice-wrapper">
      <span class="notice-message">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const message = ref<string>('');

async function fetchNotice() {
  try {
    const response = await fetch('https://api.starxe.top/note');
    if (!response.ok) throw new Error('Failed to fetch the notice');
    const data = await response.json();
    message.value = data.message || '暂无公告';
  } catch (error) {
    message.value = '公告加载失败，请稍后重试';
    console.error(error);
  }
}

onMounted(fetchNotice);
</script>

<style scoped>

</style>
