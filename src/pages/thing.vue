<template>
  <div>
    <!-- 滚动公告 -->
    <div class="scrolling-notice" v-if="showNotice">
      <marquee behavior="scroll" direction="left">{{ noticeContent }}</marquee>
    </div>

    <!-- 原有的组件内容 -->
    <div class="commuse">
      <!-- 类别选择 -->
      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100"> 类别: </div>
        <a-select 
          allow-search 
          v-model="selectedCategory" 
          :options="categoryOptions" 
          placeholder="请选择类别" 
          @change="handleCategoryChange"
        />
      </div>
      
      <!-- 物品选择 -->
      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100"> 物品: </div>
        <a-select 
          allow-search 
          v-model="selectedItem" 
          :options="currentItems" 
          placeholder="请选择物品" 
          filterable 
        />
      </div>
      
      <div class="commuse-item">
        <div class="text-slate-900 dark:text-slate-100"> 数量: </div>
        <a-input-number v-model="num" placeholder="请输入数量" mode="button" size="large" class="input-demo" />
      </div>
      
      <div class="generate">
        <a-input v-model="commandValue" placeholder="" />
        <a-button type="primary" shape="round" size="large" @click="copyvalue">复制</a-button>
        <a-button type="primary" shape="round" size="large" @click="execute">执行</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import { Message } from '@arco-design/web-vue'
import JSEncrypt from 'jsencrypt';
import axios from 'axios'

// 静态导入所有JSON文件
import headData from './json/head.json'
import thingData from './json/thing.json'
import weaponData from './json/weapon.json'
import foodData from './json/food.json'
import materialData from './json/material.json'
import avatarData from './json/avatar.json'
import chatData from './json/chat.json'
import avatarskinData from './json/avatarskin.json'
import phonethemeData from './json/phonetheme.json'
import pamskinData from './json/pamskin.json'
import phonecaseData from './json/phonecase.json'
import avatarexpData from './json/avatarexp.json'
import avatarrankData from './json/avatarrank.json'
import equipmentexpData from './json/equipmentexp.json'
import petData from './json/pet.json'
import medalData from './json/medal.json'

const API_BASE_URL = import.meta.env.VITE_DHWT_API_SERVER;
const { text, isSupported, copy } = useClipboard()
const appStore = useAppStore()

// 类别映射表
const category_mapping = {
  "HeadIcon": "head.json", // 头像
  "Virtual": "thing.json", // 货币
  "Equipment": "weapon.json", // 武器
  "Food": "food.json", // 食物
  "Material": "material.json", // 材料
  "AvatarCard": "avatar.json", // 角色
  "ChatBubble": "chat.json", // 聊天气泡
  "AvatarSkin": "avatarskin.json", // 角色皮肤
  "PhoneTheme": "phonetheme.json", // 手机主题
  "PamSkin": "pamskin.json", // 帕姆皮肤
  "PhoneCase": "phonecase.json", // 手机壳
  "AvatarExp": "avatarexp.json", // 经验物品(角色)
  "AvatarRank": "avatarrank.json", // 角色突破材料
  "EquipmentExp": "equipmentexp.json", // 经验物品(武器)
  "NormalPet": "pet.json", // 宠物
  "RogueMedal": "medal.json", // 肉鸽藏品
}

// 类别中文名称映射
const categoryNames = {
  "HeadIcon": "头像",
  "Virtual": "货币",
  "Equipment": "武器",
  "Food": "食物",
  "Material": "材料",
  "AvatarCard": "角色",
  "ChatBubble": "聊天气泡",
  "AvatarSkin": "角色皮肤",
  "PhoneTheme": "手机主题",
  "PamSkin": "帕姆皮肤",
  "PhoneCase": "手机壳",
  "AvatarExp": "角色经验",
  "AvatarRank": "角色突破",
  "EquipmentExp": "武器经验",
  "NormalPet": "宠物",
  "RogueMedal": "肉鸽藏品",
}

const selectedCategory = ref('')
const selectedItem = ref('')
const commandType = ref('give')
const num = ref(1)

// 响应式数据
const categoryOptions = ref<Array<{value: string, label: string}>>([])
const itemsData = reactive<Record<string, any[]>>({})
const currentItems = ref<any[]>([])

// 计算命令值
const commandValue = computed(() => {
  return `${commandType.value} ${selectedItem.value} x${num.value}`
})

// 初始化数据
const initializeData = () => {
  // 静态导入的数据映射
  const staticDataMap = {
    "HeadIcon": headData,
    "Virtual": thingData,
    "Equipment": weaponData,
    "Food": foodData,
    "Material": materialData,
    "AvatarCard": avatarData,
    "ChatBubble": chatData,
    "AvatarSkin": avatarskinData,
    "PhoneTheme": phonethemeData,
    "PamSkin": pamskinData,
    "PhoneCase": phonecaseData,
    "AvatarExp": avatarexpData,
    "AvatarRank": avatarrankData,
    "EquipmentExp": equipmentexpData,
    "NormalPet": petData,
    "RogueMedal": medalData,
  }

  // 填充itemsData
  Object.keys(category_mapping).forEach(category => {
    const fileName = category_mapping[category as keyof typeof category_mapping]
    const dataKey = Object.keys(staticDataMap).find(key => 
      category_mapping[key as keyof typeof category_mapping] === fileName
    )
    
    if (dataKey) {
      itemsData[category] = staticDataMap[dataKey as keyof typeof staticDataMap] || []
      console.log(`加载类别 ${category} 成功，共 ${itemsData[category].length} 个物品`)
    } else {
      itemsData[category] = []
      console.warn(`未找到类别 ${category} 对应的数据`)
    }
  })
}

// 类别选项
categoryOptions.value = Object.keys(category_mapping).map(key => ({
  value: key,
  label: categoryNames[key as keyof typeof categoryNames] || key
}))

// 处理类别变化
const handleCategoryChange = (category: string) => {
  selectedItem.value = '' // 清空当前选择的物品
  if (category && itemsData[category]) {
    currentItems.value = itemsData[category]
  } else {
    currentItems.value = []
  }
}

const message = Message

const execute = async () => {
  const uid = localStorage.getItem('uid');
  if (!uid) {
    message.info('用户未登录，请先前往"远程"页面执行一次命令，然后重试');
    return;
  }

  const command = commandValue.value;
  try {
    const res = await axios.post(`${API_BASE_URL}/api/submit`, {
      keyType: 'PEM',  
      uid: uid,
      command: command
    });

    if (res.data.code !== 0) {
      throw new Error('命令提交失败: ' + res.data.message);
    }
    message.success(`命令提交成功：${res.data.data.message}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '请求失败';
    message.error(errorMessage);
    console.error(err);
  }
};

const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch (e) {
    console.error('Base64解码失败:', e);
    return '解码失败';
  }
};

function copyvalue() {
  copy(commandValue.value)
  if (isSupported) {
    message.success(`已复制${commandValue.value}`)
  }
}

const send: any = inject("send")

const showNotice = ref(true)
const noticeContent = '梦乡公益服完全免费无任何形式收费，如果你是以任何形式付费购买得到的，那你就被骗了，请及时退款并举报。'

// 在页面加载时初始化数据
onMounted(() => {
  setTimeout(() => {
    showNotice.value = true
  }, 1000)
  
  // 初始化数据
  initializeData()
  
  // 默认选择第一个类别
  if (categoryOptions.value.length > 0) {
    selectedCategory.value = categoryOptions.value[0].value
    handleCategoryChange(selectedCategory.value)
  }
})
</script>

<style lang="less" scoped>
/* 添加样式以美化滚动公告 */
.scrolling-notice {
  color: #BEBEBE;
  padding: 8px;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  border-radius: 10px; /* 添加圆角样式 */
}

.commuse {
  width: 500px;
  margin: auto;
}

.commuse-item {
  display: flex;
  align-items: center;
  color: #000;
  margin: 18px 0;

  > div {
    &:nth-child(1) {
      width: 150px;
      text-align: right;
      padding-right: 10px;
      color: #6b6a6a !important;
    }
  }
}

.generate {
  display: flex;
  align-items: center;
  margin-left: 100px;
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

  .generate {
    display: block; 
    margin-left: 0; 
    width: 100%; 
    margin-bottom: 80px; 
    margin-top: 10px; 
    text-align: center; 
  }

  .generate > .arco-input {
    margin-bottom: 10px; 
  }

  .generate button { 
    display: block; 
    width: 100%; 
    margin-top: 10px; 
  }
}
</style>