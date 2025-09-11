<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card"

  export let name: string
  export let data: monthlyData
  let areas = Object.keys(data.areas)
</script>

<Card
  class="w-80 rounded-2xl shadow-md border gap-3 border-gray-200 hover:cursor-pointer hover:shadow-lg transition-shadow"
>
  <CardHeader class="flex flex-col items-start gap-1 ">
    <CardTitle class="text-lg font-semibold text-gray-800">
      {name ? name : "N/A"}
    </CardTitle>
    <CardDescription class="text-sm text-gray-500">
      {data.device_code ? data.device_code : "-"}
    </CardDescription>
  </CardHeader>
  <div class="border w-[calc(100%-20px)] mx-auto"></div>
  <CardContent class="space-y-2 text-sm text-gray-700">
    <div class="flex justify-between">
      <span class="font-medium">Bill Completion</span>
      <span>{data.billed_complete}</span>
    </div>
    <div class="flex justify-between">
      <span class="font-medium">NRW</span>
      <span>{data.nrw_percent}%</span>
    </div>
    <div class="flex justify-between">
      <span class="font-medium">Total Flow</span>
      <span>{data.total_flow}</span>
    </div>
    <div class="flex justify-between">
      <span class="font-medium">Billed Quantity</span>
      <span>{data.total_bill_qty}</span>
    </div>
    <div class="flex justify-between">
      <span class="font-medium">NRW (m³)</span>
      <span>{data.nrw_m3}</span>
    </div>
  </CardContent>
</Card>
