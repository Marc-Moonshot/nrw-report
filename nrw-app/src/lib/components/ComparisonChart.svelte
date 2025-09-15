<script lang="ts">
  import { BarChart, Legend } from "layerchart"

  const {
    data,
  }: {
    data: monthlyData
  } = $props()

  let chartData = $derived(
    data
      ? Object.entries(data).map(([wtp, values]) => ({
          wtp,
          billed: values.total_flow,
          nrw: values.nrw_m3,
        }))
      : []
  )
</script>

<div class="flex flex-col w-[20rem] h-[30rem] border rounded-sm p-4">
  <BarChart
    data={chartData}
    x="wtp"
    series={[
      { key: "billed", color: "var(--chart-2)" },
      { key: "nrw", color: "var(--chart-1)" },
    ]}
    seriesLayout="stack"
    renderContext="svg"
    legend
    props={{
      highlight: {
        area: { class: "fill-black opacity-10" },
      },
      bars: {
        class: "stroke-none",
      },
      tooltip: {
        root: { class: "bg-zinc-100" },
        header: {
          class: "text-teal-600",
          // format: (d) => `${month} ${d}`,
        },
        item: { format: "metric" },
      },
      xAxis: { format: "none" },
      yAxis: { format: "metric" },
    }}
  />
</div>

<!-- <BarChart
    data={scaledData}
    x="date"
    y="value"
    renderContext="svg"
    props={{
      highlight: {
        // THIS PIECE OF $#!T TOOK 2 HOURS
        area: {
          class: "fill-black opacity-10",
        },
      },
      bars: {
        class: "fill-teal-600 stroke-none",
      },
      tooltip: {
        root: { class: "bg-zinc-100" },
        header: { class: "text-teal-600" },
        item: { format: "percentRound" },
      },
    }}
  /> -->
