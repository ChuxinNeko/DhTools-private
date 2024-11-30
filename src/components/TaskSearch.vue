<template>
    <div class="task-search">
      <a-input
        v-model="searchQuery"
        placeholder="搜索任务（支持模糊搜索）"
        @input="handleSearch"
      />
      <div class="task-list">
        <!-- 列表组件，展示当前页面的任务 -->
        <a-list
          :data-source="currentPageTasks"
          :render-item="renderTask"
          bordered
        />
      </div>
      <a-pagination
        v-if="filteredTasks.length > 0"
        :total="filteredTasks.length"
        :page-size="pageSize"
        :current="currentPage"
        @change="handlePageChange"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from "vue";
  import pinyin from "pinyin-match";
  
  // 接收父组件传递的任务数据
  const props = defineProps({
    tasks: {
      type: Array,
      required: true,
    },
  });
  
  const emit = defineEmits(["selectTask"]);
  
  const searchQuery = ref("");  // 存储搜索框的值
  const filteredTasks = ref([]);  // 存储过滤后的任务列表
  const currentPage = ref(1);  // 当前页码
  const pageSize = ref(10);  // 每页任务数
  
  // 监听任务数据和搜索关键字的变化
  watch(
    () => [props.tasks, searchQuery.value],
    () => filterTasks()
  );
  
  // 过滤任务（模糊查询）
  const filterTasks = () => {
    const query = searchQuery.value.trim();
    if (!query) {
      filteredTasks.value = props.tasks;
    } else {
      filteredTasks.value = props.tasks.filter((task) => {
        const text = task.label || "";
        return (
          text.includes(query) || // 中文匹配
          pinyin.match(text, query) // 拼音匹配
        );
      });
    }
    currentPage.value = 1;  // 重置到第一页
  };
  
  // 当前页的任务
  const currentPageTasks = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredTasks.value.slice(startIndex, startIndex + pageSize.value);
  });
  
  const renderTask = (task) => {
    return {
      component: 'a-list-item', // 指定要渲染的组件
      props: {
        key: task.value,  // 每个任务的唯一标识
        onClick: () => emit("selectTask", task),  // 点击任务时触发 selectTask 事件
      },
      children: [task.label],  // 任务的名称
    };
  };
  
  const handlePageChange = (page) => {
    currentPage.value = page;  // 处理分页切换
  };
  
  const handleSearch = () => {
    filterTasks();  // 搜索框输入事件，重新过滤任务
  };
  </script>
  
  <style scoped>
  .task-search {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .task-list {
    max-height: 400px;
    overflow-y: auto;
  }
  </style>
  