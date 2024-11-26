<template>
    <div>
      <div v-show="!captchaReady">正在加载验证码...</div>
      <div ref="captchaContainer" v-show="captchaReady"></div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'GeetestCaptcha',
    props: {
      onSuccess: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        captchaObj: null,
        captchaReady: false,
      };
    },
    mounted() {
      this.loadCaptcha();
    },
    methods: {
      loadCaptcha() {
        axios.get('https://dreamplace.cn/api/get_geetest.php').then((res) => {
          const data = res.data;
          initGeetest(
            {
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: data.new_captcha || false, // 默认值为 false
              product: 'popup', // 验证码形式，可根据需要修改为 'float' 或 'embed'
              width: '100%',
            },
            (captchaObj) => {
              this.captchaObj = captchaObj;
              this.captchaReady = true;
              captchaObj.appendTo(this.$refs.captchaContainer);
  
              captchaObj.onReady(() => {
                // 验证码准备就绪
              });
  
              captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (!result) {
                  return;
                }
                // 将验证结果传递给父组件
                this.onSuccess(result);
              });
            }
          );
        }).catch((error) => {
          console.error('加载验证码失败', error);
        });
      },
    },
  };
  </script>
  