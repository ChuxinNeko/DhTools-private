<template>
  <div>
    <!-- 滚动公告 -->
    <div class="scrolling-notice" v-if="showNotice">
      <marquee behavior="scroll" direction="left">{{ t('main.notice') }}</marquee>
    </div>

    <!-- 原有的组件内容 -->
    <div class="commuse">
      <div v-for="(item, index) in options" :key="index">
        <div class="text-slate-900 dark:text-slate-100">{{ item.title }}</div>
        <div>
          <a-input v-model="item.value" placeholder="" disabled />
        </div>
        <div>
          <a-button type="primary"  @click="copyvalue(item.value)">复制</a-button>
          <a-button type="outline" v-if="appStore.isLogin" @click="send(item.value)">执行</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, inject, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from 'vue-i18n'

const { text, isSupported, copy } = useClipboard()
const appStore = useAppStore()
const { t, locale } = useI18n()
const options = reactive([
   {
    title: '获得全部角色',
    value: '/giveall avatar r6 l80',
  },
  {
    title: '获得所有光锥',
    value: '/giveall equipment r5 l80 x1',
  },
  {
    title: '获得所有遗器',
    value: '/giveall relic',
  },
  {
    title: '获得所有手机主题与头像气泡',
    value: '/giveall unlock',
  },
  {
    title: '获得所有宠物',
    value: '/giveall pet',
  },
  {
    title: '获得所有道具（食物等）',
    value: '/giveall material',
  },
  {
    title: '解锁所有任务',
    value: '/unlockall mission',
  },
  {
    title: '已有所有角色满级',
    value: '/avatar level -1 80',
  },
  {
    title: '开拓等级满级',
    value: '/give 22 x999999',
  },
  {
    title: '1000星轨通票',
    value: '/give 101 x1000',
  },
  {
    title: '1000星轨专票',
    value: '/give 102 x1000',
  },
  {
    title: '治疗队伍所有角色',
    value: '/lineup heal',
  },
  {
    title: '属性特别离谱的遗器',
    value: '/relic 63126 l999 2 7:10000 8:10000 9:10000 5:10000',
  },
  {
    title: '切换男主(重启生效)',
    value: '/hero gender 1',
  },
  {
    title: '切换女主(重启生效)',
    value: '/hero gender 1',
  },
  {
    title: '解锁全部角色命途',
    value: '/giveall path',
  },
  {
    title: '清理背包（全部）',
    value: '/clear all',
  },
  {
    title: '清理背包（仅遗器）',
    value: '/clear relic',
  },
  {
    title: '跳过任务（当前全部进行中子任务）',
    value: '/mission pass',
  },
])

const message = Message

function copyvalue(value: string) {
  copy(value)
  if (isSupported) {
    message.success(`已复制${value}`)
  }
}

const send: any = inject("send")

const showNotice = ref(true)
const noticeContent = '梦乡公益服完全免费无任何形式收费，如果你是以任何形式付费购买得到的，那你就被骗了，请及时退款并举报。'

// 在页面加载时设置一个延时，用于显示滚动公告，你可以根据需求调整延时时长
onMounted(() => {
  setTimeout(() => {
    showNotice.value = true
  }, 1000)
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
  border-radius: 10px;
  /* 添加圆角样式 */
}

.commuse {
  width: 500px;
  margin: auto;

  > div {
    margin: 10px 0;
    display: flex;
    align-items: center;
    color: #000;

    > div {
      &:nth-child(1) {
        width: 130px;
        color: #6b6a6a !important;
      }

      margin: 0 5px;
    }
  }
}

.generate {
  display: flex;
  align-items: center;
  margin-left: 100px;
}
</style>