<script setup lang="ts">
const isOpen = ref(false)
</script>

<template>
  <UButton class="cursor-pointer" color="neutral" variant="ghost" icon="i-lucide-info" aria-label="Info" @click="isOpen = true" />
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="max-h-[80vh] space-y-6 overflow-y-auto p-5">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-info" class="size-5 text-muted" />
          <h2 class="text-lg font-bold">Alert Tracking</h2>
        </div>

        <section>
          <h3 class="text-base font-semibold">Severity levels</h3>
          <p class="mb-3 mt-1 text-sm text-muted">Severity badges show the urgency of each log and the recommended response.</p>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead><tr class="border-b"><th class="p-2">Severity</th><th class="p-2">Description</th><th class="p-2">Recommendation</th></tr></thead>
              <tbody>
                <tr v-for="row in SEVERITY_INFO" :key="row.level" class="border-b border-default">
                  <td class="p-2"><UBadge :color="LEVEL_CONFIG[row.level].color" :variant="row.level === 'critical' ? 'solid' : 'subtle'">{{ LEVEL_CONFIG[row.level].label }}</UBadge></td>
                  <td class="p-2">{{ row.description }}</td>
                  <td class="p-2">{{ row.recommendation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
      </div>
    </template>
  </UModal>
</template>