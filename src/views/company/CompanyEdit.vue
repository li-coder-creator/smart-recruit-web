<template><p>正在打开企业档案编辑…</p></template>
<script setup>
// 保留旧书签入口，编辑统一使用档案页弹窗，避免维护两套完整表单。
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => router.replace({ path: '/layout/company/info', query: { edit: '1' } }))
</script>
