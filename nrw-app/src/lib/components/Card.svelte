<script lang="ts">
  import { goto } from "$app/navigation"
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card"

  export let data: device
</script>

<Card
  class="w-80 rounded-2xl bg-white shadow-md border gap-3 border-gray-200 hover:cursor-pointer hover:shadow-lg transition-shadow"
  onclick={() => goto(`/${data.device_number}`)}
>
  <!-- Header -->
  <CardHeader class="flex flex-col items-start gap-1">
    <CardTitle class=" flex gap-1 items-center font-semibold text-gray-800">
      <div
        class={`rounded-full ${data.last_status === "OK" ? "bg-[#689d6a]" : "bg-[#cc241d]"}  w-[10px] h-[10px]`}
      ></div>
      {data.nickname || "Unnamed Device"}
    </CardTitle>
    <CardDescription class="text-sm text-gray-500">
      {data.device_code}
    </CardDescription>
  </CardHeader>

  <div class="border w-[calc(100%-20px)] mx-auto"></div>

  <!-- Content -->
  <CardContent class="space-y-2 text-sm text-gray-700">
    <div class="flex justify-between">
      <span class="font-medium">Device Number</span>
      <span>{data.device_number}</span>
    </div>
    <div class="flex justify-between">
      <span class="font-medium">RTU Assigned</span>
      <span>{data.rtu_assigned}</span>
    </div>
  </CardContent>
</Card>
