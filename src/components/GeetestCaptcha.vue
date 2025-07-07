<template>
  <!-- The captcha is now in 'bind' mode and will appear as a modal, so no container is needed. -->
  <!-- We can show a loading state if needed. -->
  <div v-if="!captchaReady" style="display: none;">正在加载验证码...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// The initGeetest function is loaded from an external script in login.vue,
// so we need to declare it to satisfy TypeScript.
declare const initGeetest: any;

const props = defineProps<{
  onSuccess: (result: any) => void;
}>();

const captchaObj = ref<any>(null);
const captchaReady = ref(false);

const loadCaptcha = () => {
  // Fetches Geetest configuration from the backend.
  axios.get('https://dreamplace.cn/api/get_geetest.php', { withCredentials: true })
    .then((res) => {
      const { data } = res;
      // Initialize Geetest with product set to 'bind'.
      // 'bind' mode allows us to trigger the verification popup programmatically.
      initGeetest(
        {
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha || false,
          product: 'bind', // Use 'bind' mode to trigger verification on demand.
        },
        (captcha: any) => {
          captchaObj.value = captcha;

          // Listen for when the captcha is ready to be displayed.
          captcha.onReady(() => {
            captchaReady.value = true;
          });

          // Listen for successful verification.
          captcha.onSuccess(() => {
            const result = captcha.getValidate();
            if (result) {
              // Call the parent component's success handler.
              props.onSuccess(result);
            }
          });

          captcha.onError((error: any) => {
            console.error('Geetest captcha error:', error);
          });
        }
      );
    }).catch((error) => {
      console.error('加载验证码失败', error);
    });
};

/**
 * Triggers the Geetest verification modal.
 * This method is exposed to the parent component.
 */
const startVerification = () => {
  if (captchaObj.value && captchaReady.value) {
    captchaObj.value.verify();
  } else {
    // This could happen if the user clicks before the captcha is loaded.
    // A message could be displayed to the user.
    console.error('Captcha is not ready.');
  }
};

onMounted(() => {
  loadCaptcha();
});

// Expose the startVerification method so the parent component can call it.
defineExpose({
  startVerification,
});
</script>
  