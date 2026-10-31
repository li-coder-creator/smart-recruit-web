<template>
  <section class="app-overview" aria-label="全部历史投递概览" :aria-busy="loading">
    <template v-if="!error">
      <button
        v-for="item in summaryItems"
        :key="item.countKey"
        type="button"
        class="app-stat"
        :class="{
          pending: item.value === APPLICATION_STATUS.PENDING,
          interview: item.value === APPLICATION_STATUS.INTERVIEW,
        }"
        :aria-label="`筛选${item.label}投递`"
        :aria-pressed="selected === item.value"
        @click="$emit('select', item.value)"
      >
        <span>{{ item.value === null ? '全部投递' : item.label }}</span>
        <strong>{{ loading ? '—' : (data?.[item.countKey] ?? '—') }}</strong>
      </button>
    </template>
    <div v-else class="app-overview-error" role="alert">
      <span>{{ error }}</span
      ><button type="button" class="app-text-button" @click="$emit('retry')">重新读取概览</button>
    </div>
  </section>
</template>
<script setup>
import { APPLICATION_FILTERS, APPLICATION_STATUS } from '@/constants/application'
defineProps({
  data: { type: Object, default: null },
  loading: Boolean,
  error: { type: String, default: '' },
  selected: { type: Number, default: null },
})
defineEmits(['select', 'retry'])
const summaryItems = APPLICATION_FILTERS.filter(
  (item) => item.value !== APPLICATION_STATUS.REJECTED,
)
</script>
<style scoped>
.app-overview {
  background: white;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-radius: 14px;
  padding: 20px 8px;
  margin-bottom: 22px;
  min-height: 108px;
  box-sizing: border-box;
}
.app-stat {
  border: 0;
  background: none;
  text-align: center;
  position: relative;
  padding: 0 5px;
}
.app-stat + .app-stat:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--app-line);
}
.app-stat span {
  display: block;
  font-size: 14px;
  color: #526379;
}
.app-stat strong {
  display: block;
  font-size: 30px;
  line-height: 1.4;
  color: var(--app-green);
  font-weight: 700;
}
.app-stat.pending strong {
  color: #758399;
}
.app-stat.interview strong {
  color: var(--app-orange);
}
.app-stat:hover {
  background: #f8fcfb;
}
.app-overview-error {
  grid-column: 1/-1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  color: #b04e47;
  font-size: 13px;
}
@media (max-width: 600px) {
  .app-overview {
    padding: 16px 3px;
    min-height: 90px;
  }
  .app-stat span {
    font-size: 11px;
  }
  .app-stat strong {
    font-size: 24px;
  }
}
</style>
