<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card"

  export let name: string
  export let data: monthlyData
  let areas = Object.keys(data.areas)
</script>

<Card class="w-80">
  <CardHeader class="flex items-center ">
    <CardTitle>{name ? name : "N/A"}</CardTitle>
    <CardDescription class=" left-0"
      >{data.device_code ? data.device_code : "-"}</CardDescription
    >
  </CardHeader>
  <CardContent>
    <p>bill completion: {data.billed_complete}</p>
    <p>non-revenue water: {data.nrw_percent}%</p>
    <p>total flow: {data.total_flow}</p>
    <p>total billed quantity: {data.total_bill_qty}</p>
    <p>m3 nrw: {data.nrw_m3}</p>
  </CardContent>
  <CardFooter>
    <!-- <p>{footer}</p> -->
  </CardFooter>
</Card>
