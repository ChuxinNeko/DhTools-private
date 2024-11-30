import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
let constantRoutes = [
  {
    path: '/',
    component: () => import('@/pages/login.vue'),
  },
  {
    path: '/avatar',
    component: () => import('@/pages/avatar.vue'),
  },
  {
    path: '/thing',
    component: () => import('@/pages/thing.vue'),
  },
  {
    path: '/food',
    component: () => import('@/pages/food.vue'),
  }
  ,
  {
    path: '/commuse',
    component: () => import('@/pages/commuse.vue'),
  },
  {
    path: '/holyrelic',
    component: () => import('@/pages/holyrelic.vue'),
  },
  {
    path: '/holyrelic2',
    component: () => import('@/pages/holyrelic2.vue'),
  },
  {
    path: '/weapon',
    component: () => import('@/pages/weapon.vue'),
  },
  {
    path: '/avatarall',
    component: () => import('@/pages/avatarall.vue'),
  },
  {
    path: '/mission',
    component: () => import('@/pages/mission.vue'),
  },
  {
    path: '/information',
    component: () => import('@/pages/information.vue'),
  },
  {
    path: '/other',
    component: () => import('@/pages/other.vue'),
  },
  {
    path: '/moraxlover',
    component: () => import('@/pages/morax.vue'),
  },
  {
    path: '/scene',
    component: () => import('@/pages/scene.vue'),
  },
  {
    path: '/chatlist',
    component: () => import('@/pages/chatlist.vue'),
  },
  {
    path: '/register',
    component: () => import('@/components/register.vue'),
  },
  {
    path: '/sign',
    component: () => import('@/components/Signup.vue'),
  },
  {
    path: '/opinion',
    component: () => import('@/components/opinion.vue'),
  },
  {
    path: '/feedback',
    component: () => import('@/pages/feedback.vue'),
  },

]



//导入生成的路由数据
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
})

export default router
