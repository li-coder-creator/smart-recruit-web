<template>
  <section class="detail-panel" :aria-label="title" :aria-busy="state.loading">
    <h2>{{ title }}</h2>
    <el-skeleton v-if="state.loading" :rows="2" animated />
    <div v-else-if="state.error" role="alert">
      <p>{{ state.error }}</p>
      <el-button size="small" @click="$emit('retry')">重试{{ title }}</el-button>
    </div>
    <slot v-else :data="state.data" />
  </section>
</template>
<script setup>
defineProps({ title: { type: String, required: true }, state: { type: Object, required: true } })
defineEmits(['retry'])
</script>
<style scoped>
.detail-panel {
  background: white;
  border: 1px solid #e0e9ee;
  border-radius: 10px;
  padding: 22px;
  margin-bottom: 20px;
  overflow-wrap: anywhere;
}
h2 {
  margin: 0 0 18px;
  font-size: 18px;
  color: #20384c;
}
[role='alert'] {
  color: #b04e47;
  font-size: 13px;
}
</style>
