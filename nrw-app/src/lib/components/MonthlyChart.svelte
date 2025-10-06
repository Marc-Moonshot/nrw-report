<script lang="ts">
  import { BarChart } from "layerchart"

  const { data }: { data: yearlyData | null } = $props()

  const today = new Date()
  const thisMonth = today.getUTCMonth() + 1
  const thisYear = today.getUTCFullYear()
  const formattedDate = `${thisYear}_${thisMonth}`

  const chartData = $derived(
    data
      ? Object.entries(data).flatMap(([month, wtpValues]) =>
          Object.entries(wtpValues).map(([wtp, values]) => ({
            month,
            percent: month === formattedDate ? 0 : values.nrw_percent / 100,
          }))
        )
      : []
  )
</script>

<div class="flex flex-col w-full h-[30rem] border rounded-sm p-4">
  <BarChart
    data={chartData}
    x="month"
    series={[{ key: "percent", label: "NRW Percent", color: "var(--chart-1)" }]}
    renderContext="svg"
    legend
    props={{
      legend: { placement: "bottom" },
      highlight: {
        area: { class: "fill-black opacity-10" },
      },
      bars: { class: " stroke-none" },
      tooltip: {
        root: { class: "bg-zinc-100" },
        header: { class: "text-teal-600" },
        item: { format: "percentRound" },
      },
    }}
  />
</div>
