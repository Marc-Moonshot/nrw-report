<script lang="ts">
  import { BarChart } from "layerchart"

  const { data }: { data: dailyData[] | null } = $props()

  const chartData = $derived(
    data
      ? data.flatMap((entry) =>
          Object.entries(entry).map(([, values]) => ({
            date: new Date(values.date).getDate(),
            nrw_percent: values.nrw_percent,
            daily_flow: values.daily_flow,
            nrw_m3: values.nrw_m3,
          }))
        )
      : []
  )
</script>

<div class="flex flex-col w-full h-[30rem] border rounded-sm p-4">
  <p class="flex mx-auto">Daily</p>

  <BarChart
    data={chartData}
    x="date"
    series={[
      // { key: "nrw_percent", label: "NRW %", color: "var(--chart-2)" },
      { key: "daily_flow", label: "Flow (m³)", color: "var(--chart-2)" },
      { key: "nrw_m3", label: "NRW (m³)", color: "var(--chart-1)" },
    ]}
    seriesLayout="stack"
    renderContext="svg"
    legend
    props={{
      legend: { placement: "bottom" },
      highlight: {
        area: { class: "fill-black opacity-10" },
      },
      bars: { class: "stroke-none" },
      tooltip: {
        root: { class: "bg-zinc-100" },
        header: { class: "text-teal-600" },
        item: { format: "metric" },
      },
      xAxis: { format: "none" },
      yAxis: { format: "metric" },
    }}
  />
</div>
