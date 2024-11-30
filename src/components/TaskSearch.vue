<template>
    <div class="task-search">
      <a-input
        v-model="searchQuery"
        placeholder="搜索任务（支持模糊搜索）"
        @input="handleSearch"
      />
      <div class="task-list">
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
  
  const props = defineProps({
    tasks: {
      type: Array,
      required: true,
    },
  });
  
  const emit = defineEmits(["selectTask"]);
  
  const searchQuery = ref("");
  const filteredTasks = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  
  // 监听任务数据或搜索关键字的变化
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
    currentPage.value = 1; // 重置到第一页
  };
  
  // 当前页的任务
  const currentPageTasks = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredTasks.value.slice(startIndex, startIndex + pageSize.value);
  });
  
  // 渲染任务
  const renderTask = (task) => (
    <a-list-item
      key={task.value}
      @click={() => emit("selectTask", task)}
    >
      {task.label}
    </a-list-item>
  );
  
  // 处理分页切换
  const handlePageChange = (page) => {
    currentPage.value = page;
  };
  
  // 搜索框输入事件
  const handleSearch = () => {
    filterTasks();
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
  