<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card"

  const { data, title, unit } = $props()
</script>

<Card
  class="w-60 rounded-2xl bg-white shadow-md border gap-3 border-gray-200 hover:shadow-lg transition-shadow"
>
  <CardHeader class="flex flex-col items-center gap-1">
    <CardTitle class=" flex gap-1 text-xl font-semibold text-gray-800">
      {title}
    </CardTitle>
    <!-- <CardDescription class="text-sm text-gray-500">percentage of bil</CardDescription> -->
  </CardHeader>

  <div class="border w-[calc(100%-20px)] mx-auto"></div>

  <CardContent class="space-y-2  text-2xl text-gray-800">
    <div class="flex justify-center">
      <span class="font-semibold">{data}</span>
      <span class="ml-2 text-gray-600">{unit}</span>
    </div>
  </CardContent>
</Card>
