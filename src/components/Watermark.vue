<template>
  <div class="watermark-container" v-show="showWatermark">
    <div v-for="(watermark, index) in watermarks" :key="index" class="watermark">{{ watermark }}</div>
    <div class="ip-watermark" v-if="ip">{{ ip }}</div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const showWatermark = ref(true)
    const watermarks = ref<string[]>([])
    const ip = ref('')

    // 从 API 获取水印数据
    const fetchWatermarks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DHWT_API_SERVER}/watermark`)
        const data = await response.json()

        // 将返回的 JSON 数据提取成数组
        watermarks.value = Object.values(data)
      } catch (error) {
        console.error('无法获取水印数据:', error)
      }
    }

    // 获取用户的 IP 地址及归属地信息
    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://api.vore.top/api/IPdata?ip=')
        const data = await response.json()
        if (data.code === 200 && data.ipinfo && data.ipdata) {
          ip.value = ` ${data.ipinfo.text}, - ${data.ipdata.info1} ${data.ipdata.info2} ${data.ipdata.info3}`
        } else {
          console.error('API 返回错误:', data.msg)
        }
      } catch (error) {
        console.error('无法获取IP归属地信息:', error)
      }
    }

    // 在组件挂载后调用 fetchWatermarks 和 fetchIpLocation
    onMounted(() => {
      fetchWatermarks()
      fetchIpLocation()
    })

    return { showWatermark, watermarks, ip }
  },
}
</script>

<style>
.watermark-container {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.watermark {
  color: rgba(0, 0, 0, 0.1);
  font-size: 20px;
  font-weight: bold;
  transform: rotate(-45deg);
  pointer-events: none;
}

.ip-watermark {
  position: fixed;
  bottom: 10px;
  right: 10px;
  color: rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-weight: bold;
  pointer-events: none;
}
</style>
