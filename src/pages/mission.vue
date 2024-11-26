<template>
  <div>
    <!-- 任务操作选择框 -->
    <div class="commuse-item">
      <div class="text-slate-900 dark:text-slate-100">任务操作:</div>
      <div class="select-container">
        <a-select v-model="taskAction" placeholder="请选择任务操作" @change="handleTaskActionChange">
          <a-option value="complete">完成或跳过任务</a-option>
          <a-option value="reaccept">重新接取任务</a-option>
        </a-select>
      </div>
    </div>

    <!-- 完成任务表单 -->
    <div v-if="taskAction === 'complete'">
      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100">任务类型:</div>
        <div class="select-container">
          <a-select v-model="selectedType" placeholder="请选择类型">
            <a-option v-for="(type, index) in typeOptions" :key="index" :value="type">
              {{ type }}
            </a-option>
          </a-select>
        </div>
      </div>

      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100">主任务:</div>
        <div class="select-container">
          <a-select v-model="selectedMainMission" placeholder="请选择主任务" :disabled="!selectedType">
            <a-option v-for="(mission, index) in mainMissionOptions" :key="index" :value="mission.value">
              {{ mission.label }}
            </a-option>
          </a-select>
        </div>
      </div>

      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100">子任务:</div>
        <div class="select-container">
          <a-select v-model="selectedSubMission" placeholder="请选择子任务" :disabled="!selectedMainMission">
            <a-option v-for="(subMission, index) in subMissionOptions" :key="index" :value="subMission.value">
              {{ subMission.label }}
            </a-option>
          </a-select>
        </div>
      </div>

      <div class="button-group">
        <a-button type="primary" shape="round" size="large" @click="submitCommand('main')">完成主任务</a-button>
        <a-button type="primary" shape="round" size="large" @click="submitCommand('sub')">完成子任务</a-button>
      </div>
    </div>

    <!-- 重新接取任务表单 -->
    <div v-if="taskAction === 'reaccept'">
      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100">任务类型:</div>
        <div class="select-container">
          <a-select v-model="selectedReacceptType" placeholder="请选择类型">
            <a-option v-for="(type, index) in reacceptTypeOptions" :key="index" :value="type">
              {{ type }}
            </a-option>
          </a-select>
        </div>
      </div>

      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100">主任务:</div>
        <div class="select-container">
          <a-select v-model="selectedReacceptMission" placeholder="请选择主任务" :disabled="!selectedReacceptType">
            <a-option v-for="(mission, index) in filteredReacceptMainMissions" :key="index" :value="mission.value">
              {{ mission.label }}
            </a-option>
          </a-select>
        </div>
      </div>

      <div class="button-group">
        <a-button type="default" shape="round" size="large" @click="reacceptTask">重新接取任务</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { Message } from '@arco-design/web-vue';
import MainMission from './json/MainMission.json';
import SubMission from './json/SubMission.json';

const showNotice = ref(true);
const noticeContent = '梦乡公益服完全免费无任何形式收费，如果你是以任何形式付费购买得到的，那你就被骗了，请及时退款并举报。';

const taskAction = ref('complete');  // 默认选择完成任务
const selectedType = ref(null);
const selectedMainMission = ref(null);
const selectedSubMission = ref(null);
const selectedReacceptType = ref(null);  // 重新接取任务的任务类型
const selectedReacceptMission = ref(null);  // 重新接取任务的主任务

const typeOptions = ref([]);
const mainMissionOptions = ref([]);
const subMissionOptions = ref([]);
const filteredReacceptMainMissions = ref([]);  // 过滤后的主任务选项
const reacceptTypeOptions = ref([]);  // 重新接取任务的类型选项

onMounted(async () => {
  const uid = localStorage.getItem('uid');
  const apiAddress = import.meta.env.VITE_DHWT_API_SERVER + '/api/player';

  if (!uid) {
    Message.info('用户未登录，请重试');
    return;
  }

  try {
    const response = await axios.post(apiAddress, { uid }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data;
    if (responseData.code !== 0) {
      Message.error('获取任务信息失败');
      return;
    }

    const missionInfo = responseData.data.acceptedMissionList;
    const categorizedMissions = {};

    Object.entries(missionInfo).forEach(([mainMissionId, subMissions]) => {
      const typename = MainMission[mainMissionId]?.typename || '未知类型';

      if (!categorizedMissions[typename]) {
        categorizedMissions[typename] = [];
      }

      categorizedMissions[typename].push({
        value: mainMissionId,
        label: MainMission[mainMissionId]?.text || '未知任务',
        children: subMissions.map(subMissionId => ({
          value: subMissionId.toString(),
          label: SubMission[subMissionId.toString()] || '未知子任务'
        }))
      });
    });

    typeOptions.value = Object.keys(categorizedMissions);

    watch(selectedType, (newType) => {
      mainMissionOptions.value = categorizedMissions[newType] || [];
      selectedMainMission.value = null;
      selectedSubMission.value = null;
    });

    watch(selectedMainMission, (newMainMission) => {
      const selectedMission = mainMissionOptions.value.find(mission => mission.value === newMainMission);
      subMissionOptions.value = selectedMission ? selectedMission.children : [];
      selectedSubMission.value = null;
    });
  } catch (error) {
    Message.error('请求失败');
    console.error(error);
  }

  // 初始化重新接取任务的选项
  reacceptTypeOptions.value = Object.keys(MainMission);

  // 仅在选择重新接取任务时才进行过滤
  filteredReacceptMainMissions.value = Object.entries(MainMission)
    .filter(([id, mission]) => mission.text && mission.text !== '触发器任务无文本')  // 过滤掉隐藏任务
    .map(([id, mission]) => ({
      value: id,
      label: mission.text
    }));
});

// 处理任务操作切换
const handleTaskActionChange = (value) => {
  if (value === 'reaccept') {
    selectedMainMission.value = null;
    selectedSubMission.value = null;
  }
};

// 提交命令：完成任务
const submitCommand = async (type) => {
  const uid = localStorage.getItem('uid');
  const apiAddress = import.meta.env.VITE_DHWT_API_SERVER + '/api/submit';

  if (!uid) {
    Message.info('用户未登录，请重试');
    return;
  }

  let command = '';
  if (type === 'main') {
    if (!selectedMainMission.value) {
      Message.info('请选择一个主任务');
      return;
    }
    command = `mission finish ${selectedMainMission.value}`;
  } else if (type === 'sub') {
    if (!selectedSubMission.value) {
      Message.info('请选择一个子任务');
      return;
    }
    command = `mission finish ${selectedSubMission.value}`;
  }

  try {
    const response = await axios.post(apiAddress, { command, uid }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data;
    if (responseData.code === 0) {
      Message.success(`${type === 'main' ? '主任务' : '子任务'}完成成功`);
    } else {
      Message.error(`${type === 'main' ? '主任务' : '子任务'}完成失败`);
    }
  } catch (error) {
    Message.error('请求失败');
    console.error(error);
  }
};

// 重新接取任务
const reacceptTask = async () => {
  const uid = localStorage.getItem('uid');
  const apiAddress = import.meta.env.VITE_DHWT_API_SERVER + '/api/submit';

  if (!uid) {
    Message.info('用户未登录，请重试');
    return;
  }

  if (!selectedReacceptMission.value) {
    Message.info('请选择一个重新接取的任务');
    return;
  }

  const command = `mission reaccept ${selectedReacceptMission.value}`;

  try {
    const response = await axios.post(apiAddress, { command, uid }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data;
    if (responseData.code === 0) {
      Message.success('重新接取任务成功');
    } else {
      Message.error('重新接取任务失败');
    }
  } catch (error) {
    Message.error('请求失败');
    console.error(error);
  }
};
</script>

<style lang="less" scoped>
.scrolling-notice {
  color: #BEBEBE;
  padding: 8px;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  border-radius: 10px; 
}

.commuse {
  width: 500px;
  margin: auto;
}

.commuse-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #000;
  margin: 18px 0;
  margin-bottom: 20px; 

  > div {
    margin-bottom: 10px;

    &:nth-child(1) {
      color: #6b6a6a !important;
    }
  }
}

.select-container {
  width: 100%;
}

.button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

@media screen and (max-width: 768px) {
  .commuse {
    width: 100%;
    padding: 10px;
  }

  .commuse-item {
    margin: 18px 0 10px;
  }

  .commuse-item > div:nth-child(1) {
    width: auto;
    text-align: left;
    padding: 0;
    margin-bottom: 5px;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .button-group button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
