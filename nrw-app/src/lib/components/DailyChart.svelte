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

  // let zoomLevel = $state(1)
  // let offset = $state(0)
  // let hoverDate: number | null = null

  // function zoomIn() {
  //   zoomLevel = Math.min(zoomLevel + 0.5, 10)
  // }

  // function zoomOut() {
  //   zoomLevel = Math.max(zoomLevel - 0.5, 1)
  // }

  // const zoomedDomain = $derived(() => {
  //   const total = Array.from(new Set(chartData.map((d) => d.date))).sort(
  //     (a, b) => a - b
  //   )
  //   const visibleCount = Math.ceil(total.length / zoomLevel)

  //   const maxStart = total.length - visibleCount
  //   const startIndex = Math.floor(offset * maxStart)

  //   return total.slice(startIndex, startIndex + visibleCount)
  // })

  // $effect(() => {
  //   console.log("domain", zoomedDomain())
  // })

  // $inspect(zoomLevel)
</script>

<!-- onwheel={(e) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }} -->
<div class="flex flex-col w-full h-[30rem] border rounded-sm p-4">
  <p class="flex mx-auto">Daily</p>

  <BarChart
    data={chartData}
    x="date"
    series={[
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
