<template>
  <div class="iframe-container">
    <!-- Notification Trigger Button -->
    
    <!-- iframe for external content -->
    <iframe
      ref="iframe"
      src="https://dreamplace.cn/readme.html"
      frameborder="0"
      scrolling="auto"
      allowfullscreen
      class="iframe-content"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
import { Notification } from '@arco-design/web-vue';

export default defineComponent({
  setup() {
    const iframe = ref<HTMLIFrameElement | null>(null);
    let notificationInstance: any = null;

    const adjustIframeHeight = () => {
      if (iframe.value) {
        iframe.value.style.height = window.innerHeight + 'px';
      }
    };

    const openNotification = () => {
      notificationInstance = Notification.info({
        title: '提示',
        content: '使用其他功能点击左侧菜单栏切换即可',
        closable: true,
        duration: 0, // The notification will not auto-close initially
        position: 'topRight'
      });

      // Set a timeout to automatically close the notification after 5 seconds
      setTimeout(() => {
        if (notificationInstance && notificationInstance.destroy) {
          notificationInstance.destroy();
        }
      }, 500);
    };

    onMounted(() => {
      window.addEventListener('resize', adjustIframeHeight);
      adjustIframeHeight(); // Adjust height on mount
      openNotification(); // Show notification when the page loads
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', adjustIframeHeight);
    });

    return {
      iframe,
      openNotification
    };
  }
});
</script>

<style scoped>
.iframe-container {
  position: relative;
  width: 86vw;
  height: 100vh;
  overflow: hidden;
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
}

/* Position the notification button in the top-right corner */
.notification-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}
</style>
