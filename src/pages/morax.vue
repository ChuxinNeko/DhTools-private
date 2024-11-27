<template>
  <div class="container">
    <a-row class="card-container" justify="center" align="stretch">
      <!-- 第一个卡片 -->
      <a-col :span="24" :lg="12" class="card-col">
        <a-card :bordered="false" class="card">
          <template #title>
            可执行命令列表
            <a-button
              shape="circle"
              type="primary"
              @click="showDialog = true"
              class="add-command-button">
              +
            </a-button>
          </template>
          <a-space direction="vertical" size="medium">
            <a-button
              v-for="item in paginatedCommands"
              :key="item.id"
              type="primary"
              @click="selectCommand(item)"
            >
              {{ item.title }}
            </a-button>
          </a-space>
          <div class="pagination-container">
            <a-pagination
              :current="currentPage"
              :page-size="pageSize"
              :total="filteredCommands.length"
              @change="onPageChange"
            />
          </div>
        </a-card>
      </a-col>

      <!-- 第二个卡片 -->
      <a-col :span="24" :lg="12" class="card-col">
        <a-card title="命令详情" :bordered="false" class="card">
          <div v-if="selectedCommand">
            <p><strong>标题:</strong> {{ selectedCommand.title }}</p>
            <p><strong>ID:</strong> {{ selectedCommand.id }}</p>
            <p><strong>指令:</strong> {{ selectedCommand.value }}</p>
            <p><strong>上传者:</strong> {{ selectedCommand.author }}</p>
            <p><strong>描述:</strong> {{ selectedCommand.description || '无描述' }}</p>
          </div>
          <div v-else>
            <p>请选择一个命令以查看详情。</p>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 弹出框 -->
    <a-modal
      v-model:visible="showDialog"
      title="新增命令"
      ok-text="确定"
      cancel-text="取消"
      :ok-button-props="{ loading: submitLoading }"
      @ok="handleSubmit"
      width="auto"
    >
      <!-- 表单字段 -->
      <a-input
        v-model="form.title"
        placeholder="请输入外显标题"
        class="input-field"
        :status="formErrors.title ? 'error' : ''"
        :help="formErrors.title ? '标题不能为空' : ''"
      />
      <a-input
        v-model="form.author"
        placeholder="请输入昵称"
        class="input-field"
        :status="formErrors.author ? 'error' : ''"
        :help="formErrors.title ? '昵称不能为空' : ''"
      />
      <a-input
        v-model="form.value"
        placeholder="请输入指令"
        class="input-field"
        :status="formErrors.value ? 'error' : ''"
        :help="formErrors.title ? '指令不能为空' : ''"
      />
      <a-input
        v-model="form.description"
        placeholder="请输入描述（可选）"
        class="input-field"
      />
    </a-modal>

    <!-- 底部按钮 -->
    <div class="button-container">
      <a-button type="default" @click="copyToClipboard" style="margin-right: 8px">复制</a-button>
      <a-button type="primary" @click="executeCommand">执行</a-button>
    </div>
  </div>
</template>

<script>
import { Message } from '@arco-design/web-vue';
import axios from 'axios';

export default {
  data() {
    return {
      commands: [],
      selectedCommand: null,
      currentPage: 1,
      pageSize: 8,
      showDialog: false,
      form: {
        title: '',
        author: '',
        value: '',
        description: '',
        geetest_challenge: '',
        geetest_validate: '',
        geetest_seccode: '',
      },
      formErrors: {
        title: false,
        author: false,
        value: false,
      },
      submitLoading: false,
      captchaKey: 0,
      geetestLoaded: false,
      geetestCaptchaObj: null,
    };
  },
  computed: {
    filteredCommands() {
      return this.commands;
    },
    paginatedCommands() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCommands.slice(start, end);
    },
  },
  methods: {
    async fetchCommands() {
      try {
        const response = await axios.get('https://dreamplace.cn/api/return.php');
        this.commands = response.data;
      } catch (error) {
        Message.error('获取命令列表失败');
        console.error(error);
      }
    },
    selectCommand(command) {
      this.selectedCommand = command;
    },
    copyToClipboard() {
      if (this.selectedCommand) {
        navigator.clipboard.writeText(this.selectedCommand.value).then(
          () => Message.success('复制成功'),
          (err) => Message.error('复制失败')
        );
      } else {
        Message.info('请先选择一个命令');
      }
    },
    async executeCommand() {
      if (!this.selectedCommand) {
        Message.info('请先选择一个命令');
        return;
      }

      const uid = localStorage.getItem('uid');
      if (!uid) {
        Message.info('用户未登录，请先前往“远程”页面执行一次命令，然后重试');
        return;
      }

      try {
        const res = await axios.post(`${process.env.VITE_API_SERVER}/api/submit`, {
          keyType: 'PEM',
          uid: uid,
          command: this.selectedCommand.value,
        });

        if (res.data.code !== 0) {
          throw new Error('命令提交失败: ' + res.data.message);
        }

        Message.success(`命令提交成功：${res.data.data.message}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '请求失败';
        Message.error(errorMessage);
        console.error(err);
      }
    },
    onPageChange(page) {
      this.currentPage = page;
    },
    async handleSubmit() {
      const { title, author, value } = this.form;
      // 表单校验
      this.formErrors = {
        title: !title,
        author: !author,
        value: !value,
      };
      if (!title || !author || !value) {
        Message.error('请填写所有必填项');
        return;
      }

      // 显示验证码
      this.showCaptcha();
    },
    async showCaptcha() {
      if (!this.geetestLoaded) {
        Message.error('验证码加载失败，请稍后重试');
        return;
      }

      try {
        const res = await axios.get('https://dreamplace.cn/api/get_geetest.php', { withCredentials: true });
        const data = res.data;

        initGeetest(
          {
            gt: data.gt,
            challenge: data.challenge,
            offline: !data.success,
            new_captcha: data.new_captcha || false,
            product: 'popup',
            width: '100%',
          },
          (captchaObj) => {
            this.geetestCaptchaObj = captchaObj;
            captchaObj.onError(() => {
              console.error('验证码初始化失败，请检查服务器配置或极验服务状态');
            });
            captchaObj.onReady(() => {
              console.error('验证码就绪');
              captchaObj.verify(); // 显示验证码弹窗
            });

            captchaObj.onSuccess(() => {
              const result = captchaObj.getValidate();
              if (!result) {
                return;
              }
              this.form.geetest_challenge = result.geetest_challenge;
              this.form.geetest_validate = result.geetest_validate;
              this.form.geetest_seccode = result.geetest_seccode;

              this.submitForm(); // 验证成功后提交表单
            });

            captchaObj.onError(() => {
              Message.error('验证码加载失败，请重试');
            });
          }
        );
      } catch (error) {
        console.error('加载验证码失败', error);
        Message.error('加载验证码失败，请稍后重试');
      }
    },
    async submitForm() {
      this.submitLoading = true;

      try {
        const res = await axios.post('https://dreamplace.cn/api/upload.php', {
          title: this.form.title,
          value: this.form.value,
          author: this.form.author,
          description: this.form.description,
          geetest_challenge: this.form.geetest_challenge,
          geetest_validate: this.form.geetest_validate,
          geetest_seccode: this.form.geetest_seccode,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (res.data.code === 0) {
          Message.success('命令添加成功，审核通过即可显示');
          this.showDialog = false;
          // 重置表单
          this.form = {
            title: '',
            author: '',
            value: '',
            description: '',
            geetest_challenge: '',
            geetest_validate: '',
            geetest_seccode: '',
          };
          this.formErrors = {
            title: false,
            author: false,
            value: false,
          };
          this.captchaKey += 1;
          this.fetchCommands();
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        Message.error(`命令添加失败: ${err.message}`);
        console.error(err);
      } finally {
        this.submitLoading = false;
      }
    },
  },
  mounted() {
    this.fetchCommands();

    // 动态加载极验的 SDK
    const script = document.createElement('script');
    script.src = 'https://static.geetest.com/static/tools/gt.js';
    script.onload = () => {
      console.log('极验SDK初始化成功');
      this.geetestLoaded = true;
    };
    script.onerror = () => {
      console.error('极验SDK初始化失败');
    };
    document.head.appendChild(script);
  },
};
</script>

<style scoped>
.add-command-button {
  margin-left: 8px;
}

.input-field {
  margin-bottom: 16px;
}

.input-field .arco-input-error {
  border-color: #f5222d;
}

.input-field .arco-input-error:focus {
  box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
}

.pagination-container {
  margin-top: 16px;
  text-align: center;
}

.button-container {
  text-align: center;
  margin-top: 16px;
}
@media (max-width: 768px) {
  .card-container {
    flex-direction: column;
  }
}
</style>
