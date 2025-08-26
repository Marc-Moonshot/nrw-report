<script lang="ts">
  import { page } from "$app/state"
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public"
  import { getCache, setCache } from "$lib/cache"
  import ComparisonChart from "$lib/components/ComparisonChart.svelte"
  import MonthlyChart from "$lib/components/MonthlyChart.svelte"
  import { onMount } from "svelte"

  const code = page.params.code

  let date = $state(new Date())
  let year = $derived(date.getFullYear())
  let month = $derived(date.getMonth() + 1)

  let chartData: data | null = $state(null)
  let loadingNRW = $state(false)
  let errorNRW: string | null = $state(null)

  let monthlyData: YearlyNRWData | null = $state(null)
  let loadingMonthly = $state(false)
  let errorMonthly: string | null = $state(null)

  async function getNRWData(year: number, month: number) {
    loadingNRW = true
    errorNRW = null
    chartData = null

    const paddedMonth = String(month).padStart(2, "0")

    const cached = getCache<data>(`nrwData-${year}-${paddedMonth}`)
    if (cached) {
      chartData = cached
      loadingNRW = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/daily-flow?station=${code}&month=${year}-${paddedMonth}`
      )
      if (!response.ok) {
        errorNRW = `Request failed with status ${response.status}`
        return
      }
      const json = await response.json()
      setCache(`nrwData-${year}-${paddedMonth}`, json, 1000 * 60 * 60)
      chartData = json
    } catch (e) {
      errorNRW = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingNRW = false
    }
  }

  async function getMonthlyData() {
    loadingMonthly = true
    errorMonthly = null
    monthlyData = null

    const cached = getCache<YearlyNRWData>("monthlyData")
    if (cached) {
      monthlyData = cached
      loadingMonthly = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/volume-data?station=${code}`
      )
      if (!response.ok) {
        errorMonthly = `Request failed with status ${response.status}`
        return
      }
      const json = await response.json()
      setCache("monthlyData", json, 1000 * 60 * 60)
      monthlyData = json
    } catch (e) {
      errorMonthly = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingMonthly = false
    }
  }

  function retry(type: string) {
    if (type === "nrw") getNRWData(year, month)
    else if (type === "monthly") getMonthlyData()
  }

  onMount(() => {
    getMonthlyData()
  })

  $effect(() => {
    getNRWData(year, month)
  })

  $inspect(chartData)
</script>

<div class="flex flex-col items-center p-8 transition-all w-screen">
  <h1 class="flex mx-auto w-fit text-3xl select-none font-semibold">
    {"Non-Revenue Water".toUpperCase()}
  </h1>

  <input
    class="mt-5"
    type="month"
    onchange={(e) => {
      const [y, m] = e.currentTarget.value.split("-").map(Number)
      date = new Date(y, m - 1, 1)
    }}
    value={`${year}-${String(month).padStart(2, "0")}`}
  />

  {#if loadingNRW}
    <div
      class="w-[80rem] h-[40rem] bg-zinc-200 rounded-md mt-10 flex animate-pulse justify-center items-center"
    >
      Loading NRW data...
    </div>
  {:else if errorNRW}
    <div
      class="w-[80rem] h-[40rem] bg-red-100 border border-red-400 rounded-md mt-10 flex flex-col justify-center items-center gap-4"
    >
      <p class="text-red-600 font-semibold">Error: {errorNRW}</p>
      <button
        class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        onclick={() => retry("nrw")}
      >
        Retry
      </button>
    </div>
  {:else if chartData}
    <div class="flex gap-2 p-4 flex-col w-[80rem]">
      <ComparisonChart data={chartData} />
    </div>
  {/if}

  {#if loadingMonthly}
    <div
      class="w-[80rem] h-[40rem] bg-zinc-200 rounded-md mt-10 flex animate-pulse justify-center items-center"
    >
      Loading monthly data...
    </div>
  {:else if errorMonthly}
    <div
      class="w-[80rem] h-[40rem] bg-red-100 border border-red-400 rounded-md mt-10 flex flex-col justify-center items-center gap-4"
    >
      <p class="text-red-600 font-semibold">Error: {errorMonthly}</p>
      <button
        class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        onclick={() => retry("monthly")}
      >
        Retry
      </button>
    </div>
  {:else if monthlyData}
    <div class="flex gap-2 p-4 flex-col w-[80rem]">
      <MonthlyChart data={monthlyData} />
    </div>
  {/if}
</div>
