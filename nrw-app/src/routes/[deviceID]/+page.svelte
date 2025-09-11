<script lang="ts">
  import { page } from "$app/state"
  import { getCache, setCache } from "$lib/cache"
  import ComparisonChart from "$lib/components/ComparisonChart.svelte"
  import MonthlyChart from "$lib/components/MonthlyChart.svelte"
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public"
  import { onMount } from "svelte"
  import Card from "$lib/components/Card.svelte"

  const deviceID = page.params.deviceID

  let date = $state(new Date())
  let year = $derived(date.getFullYear())
  let month = $derived(date.getMonth() + 1)
  let paddedMonth = $derived(month.toString().padStart(2, "0"))
  let formattedMonth = $derived(`${year}-${paddedMonth}`)
  let thisMonth = new Date().toISOString().slice(0, 7)

  let chartData: data | null = $state(null)
  let loadingNRW = $state(true)
  let errorNRW: string | null = $state(null)
  let monthlyData: YearlyNRWData | null = $state(null)
  let loadingMonthly = $state(false)
  let errorMonthly: string | null = $state(null)

  async function getNRWData() {
    loadingNRW = true
    errorNRW = null
    chartData = null

    const cached = getCache<data>(
      `${deviceID}-dailyData-${year}-${paddedMonth}`
    )
    if (cached) {
      chartData = cached
      loadingNRW = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/daily?month=${year}-${paddedMonth}&device=${deviceID}`
      )
      if (!response.ok) {
        errorNRW = `Request failed with status ${response.status}`
        return
      }
      const json = await response.json()
      setCache(
        `${deviceID}-dailyData-${year}-${paddedMonth}`,
        json,
        1000 * 60 * 60
      )
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

    const cacheKey = `${deviceID}-monthlyData-${year}-${paddedMonth}`

    const cached = getCache<YearlyNRWData>(cacheKey)
    if (cached) {
      monthlyData = cached
      loadingMonthly = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/monthly?month=${year}-${paddedMonth}&device=${deviceID}`
      )
      if (!response.ok) {
        errorMonthly = `Request failed with status ${response.status}`
        return
      }
      const json = await response.json()
      setCache(cacheKey, json, 1000 * 60 * 60)
      monthlyData = json
    } catch (e) {
      errorMonthly = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingMonthly = false
    }
  }

  function retry(type: "daily" | "monthly") {
    if (type === "daily") getNRWData()
    else getMonthlyData()
  }

  onMount(() => {
    getNRWData()
    getMonthlyData()
  })

  $effect(() => {
    year
    paddedMonth
    getNRWData()
    getMonthlyData()
  })

  $inspect(monthlyData)
  $inspect(chartData)
</script>

<div class="flex flex-col items-center p-8 w-screen">
  <input
    type="month"
    value={formattedMonth}
    max={thisMonth}
    onchange={(e) => {
      const [y, m] = e.currentTarget.value.split("-").map(Number)
      date = new Date(y, m - 1, 1)
    }}
  />

  {#if loadingMonthly}
    <div class="text-gray-600 animate-pulse">Loading monthly data...</div>
  {:else if errorMonthly}
    <div class="text-red-600 mb-3">{errorMonthly}</div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("monthly")}
    >
      Retry
    </button>
  {:else if monthlyData}
    <div class="flex relative right-0 text-green-700">
      Monthly NRW data loaded.
    </div>
  {/if}

  {#if monthlyData}{/if}

  {#if loadingNRW}
    <div class="text-gray-600 animate-pulse">Loading daily NRW data...</div>
  {:else if errorNRW}
    <div class="text-red-600 mb-3">{errorNRW}</div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("daily")}
    >
      Retry
    </button>
  {:else if chartData}
    <div class="text-green-700">Daily NRW data loaded.</div>
  {/if}
</div>
<!-- <div class="flex flex-col items-center p-8 transition-all w-screen">
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
</div> -->
