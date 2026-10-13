<script setup lang="ts">
const props = defineProps<{
  paused: boolean
  newLogsCount: number
  batchRefresh: boolean
  manuallyClosed: boolean
  sample: boolean
}>()

const emit = defineEmits<{
  togglePause: []
  'update:batchRefresh': [value: boolean]
  addTable: []
  closeConnection: []
  reconnect: []
}>()

function toggleConnection() {
  if (props.manuallyClosed) emit('reconnect')
  else emit('closeConnection')
}
</script>

<template>
  <section class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-default bg-elevated/40 px-4 py-3">
    <div v-if="!sample" class="flex flex-wrap items-center gap-3">
      <UButton
        class="cursor-pointer"
        :color="manuallyClosed ? 'primary' : 'neutral'"
        :variant="manuallyClosed ? 'solid' : 'outline'"
        :icon="manuallyClosed ? 'i-lucide-plug-zap' : 'i-lucide-plug'"
        @click="toggleConnection"
      >
        {{ manuallyClosed ? 'Reconnect' : 'Close connection' }}
      </UButton>
      <UButton 
        class="cursor-pointer" 
        :color="paused ? 'primary' : 'neutral'" 
        :variant="paused ? 'solid' : 'outline'" 
        :icon="paused ? 'i-lucide-play' : 'i-lucide-pause'"
        @click="emit('togglePause')"
      >
        {{ paused ? 'Resume display' : 'Pause display' }}
      </UButton>
      <UBadge 
        :color="paused ? 'warning' : 'success'" variant="subtle" class="gap-1.5">
        <span class="size-1.5 rounded-full" :class="paused ? 'bg-warning' : 'bg-success animate-pulse'"></span>
        {{ paused ? 'Display paused' : 'Display active' }}
      </UBadge>
      <UBadge v-if="paused" color="primary" variant="subtle">{{ newLogsCount }} new logs</UBadge>
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <UCheckbox v-if="!sample" :model-value="batchRefresh" label="Batch refresh (1 s)" @update:model-value="emit('update:batchRefresh', Boolean($event))" />
      <AddTableButton @add="emit('addTable')" />
    </div>
  </section>
</template>
