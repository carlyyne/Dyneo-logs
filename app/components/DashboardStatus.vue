<script setup lang="ts">
defineProps<{
  state: ConnectionState
  logCount: number
  invalidCount: number
  sample?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <ConnectionIndicator :state="state" :sample="sample" />
    <p class="whitespace-nowrap text-sm text-muted">{{ logCount }} logs · {{ invalidCount }} ignored</p>
  </div>
</template>