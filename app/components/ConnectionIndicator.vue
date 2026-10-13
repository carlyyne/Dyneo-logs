<script setup lang="ts">

const props = defineProps<{ state: ConnectionState; sample?: boolean }>()
const config = {
  connecting: { label: 'Connecting…', color: 'neutral' },
  connected: { label: 'Connected, live logs', color: 'success' },
  retrying: { label: 'Service unavailable, retrying…', color: 'warning' },
  failed: { label: 'Service unavailable, reconnection stopped', color: 'error' },
  disconnected: { label: 'Connection closed', color: 'neutral' },
} as const

const current = computed(() => props.sample
  ? { label: 'Sample data', color: 'info' as const }
  : config[props.state])
</script>

<template>
  <div role="status" aria-live="polite" class="status">
    <UBadge :color="current.color" variant="subtle">{{ current.label }}</UBadge>
  </div>
</template>