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
      @ok="handleSubmit"
      width="auto"
    >
      <a-input
        v-model="form.title"
        placeholder="请输入外显标题"
        class="input-field"
        :status="formErrors.title ? 'error' : ''"
      />
      <a-input
        v-model="form.author"
        placeholder="请输入昵称"
        class="input-field"
        :status="formErrors.author ? 'error' : ''"
      />
      <a-input
        v-model="form.value"
        placeholder="请输入指令"
        class="input-field"
        :status="formErrors.value ? 'error' : ''"
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
      },
      formErrors: {
        title: false,
        author: false,
        value: false,
      },
    };
  },
  computed: {
    filteredCommands() {
      return this.commands.filter((command) => command.process);
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
        const response = await axios.get('http://154.64.249.226:31000/cmd');
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
        const res = await axios.post(`${process.env.VITE_API_BASE_URL}/api/submit`, {
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
      const { title, author, value, description } = this.form;
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

      // 提交请求
      try {
        const res = await axios.post('http://154.64.249.226:31000/uploadcmd', {
          title,
          value,
          author,
          description,
        });
        if (res.data.code === 0) {
          Message.success('命令添加成功，审核通过即可显示');
          this.showDialog = false;
          this.form = { title: '', author: '', value: '', description: '' };
          this.fetchCommands();
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        Message.error(`命令添加失败: ${err.message}`);
      }
    },
  },
  mounted() {
    this.fetchCommands();
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
