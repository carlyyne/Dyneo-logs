<script setup lang="ts">
const emit = defineEmits<{ add: [] }>()
</script>

<template>
  <UButton class="cursor-pointer" icon="i-lucide-plus" color="primary" variant="subtle" @click="emit('add')">
    Add table
  </UButton>
</template>