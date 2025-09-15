<script lang="ts">
  import { page } from "$app/state"
  import { getCache, setCache } from "$lib/cache"
  import ComparisonChart from "$lib/components/ComparisonChart.svelte"
  import MonthlyChart from "$lib/components/MonthlyChart.svelte"
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public"
  import { onMount } from "svelte"
  import StatCard from "$lib/components/StatCard.svelte"
  import DailyChart from "$lib/components/DailyChart.svelte"
  import { goto } from "$app/navigation"

  const deviceID = page.params.deviceID

  let today = new Date()
  let date = $state(new Date(today.getFullYear(), today.getMonth() - 1, 1))
  let year = $derived(date.getFullYear())
  let month = $derived(date.getMonth() + 1)
  let paddedMonth = $derived(month.toString().padStart(2, "0"))
  let formattedMonth = $derived(`${year}-${paddedMonth}`)
  let thisMonth = new Date().toISOString().slice(0, 7)

  let dailyData: dailyData[] | null = $state(null)
  let monthlyData: monthlyData | null = $state(null)
  let yearlyData: yearlyData | null = $state(null)

  let loadingNRW = $state(true)
  let loadingMonthly = $state(false)
  let loadingYearly = $state(false)

  let errorNRW: string | null = $state(null)
  let errorMonthly: string | null = $state(null)
  let errorYearly: string | null = $state(null)

  let firstValue: {
    billed_completed: string
    billed_qty: number
    nrw_m3: number
    nrw_percent: number
    total_flow: number
  } | null = $state(null)

  async function getNRWData() {
    loadingNRW = true
    errorNRW = null

    const cached = getCache<dailyData[]>(
      `${deviceID}-dailyData-${year}-${paddedMonth}`
    )
    if (cached) {
      dailyData = cached
      loadingNRW = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/daily?month=${year}-${paddedMonth}&device=${deviceID}`
      )
      if (!response.ok) {
        errorNRW = `Request failed with status: ${response.status}`
        return
      }
      const json = await response.json()
      setCache(
        `${deviceID}-dailyData-${year}-${paddedMonth}`,
        json,
        1000 * 60 * 60 * 3
      )
      dailyData = json
    } catch (e) {
      errorNRW = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingNRW = false
    }
  }

  async function getMonthlyData() {
    loadingMonthly = true
    errorMonthly = null

    const cacheKey = `${deviceID}-monthlyData-${year}-${paddedMonth}`

    const cached = getCache<monthlyData>(cacheKey)
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
        errorMonthly = `Request failed with status: ${response.status}`
        return
      }
      const json = await response.json()
      setCache(cacheKey, json, 1000 * 60 * 60 * 3)
      monthlyData = json
    } catch (e) {
      errorMonthly = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingMonthly = false
    }
  }

  async function getYearlyData() {
    loadingYearly = true
    errorYearly = null

    const cacheKey = `${deviceID}-yearlyData-${year}`

    const cached = getCache<yearlyData>(cacheKey)
    if (cached) {
      yearlyData = cached
      loadingYearly = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/yearly?year=${year}&device=${deviceID}`
      )
      if (!response.ok) {
        errorYearly = `Request failed with status: ${response.status}`
        return
      }
      const json = await response.json()
      setCache(cacheKey, json, 1000 * 60 * 60 * 24 * 3)
      yearlyData = json
    } catch (e) {
      errorYearly = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingYearly = false
    }
  }

  function retry(type: "daily" | "monthly" | "yearly") {
    if (type === "daily") getNRWData()
    else if (type === "monthly") getMonthlyData()
    else getYearlyData()
  }

  onMount(() => {
    getNRWData()
    getMonthlyData()
    getYearlyData()
  })

  $effect(() => {
    year
    paddedMonth
    getNRWData()
    getMonthlyData()
  })

  $effect(() => {
    year
    getYearlyData()
  })

  $effect(() => {
    if (monthlyData) {
      const entries = Object.entries(monthlyData)
      if (entries.length > 0) {
        ;[, firstValue] = entries[0]
      } else {
        firstValue = null
      }
    }
  })
  // $inspect(monthlyData)
  // $inspect(dailyData)
  // $inspect(yearlyData)
</script>

<div class="flex flex-col items-center min-w-[80rem] p-8 gap-4">
  <input
    type="month"
    value={formattedMonth}
    max={thisMonth}
    onchange={(e) => {
      const [y, m] = e.currentTarget.value.split("-").map(Number)
      date = new Date(y, m - 1, 1)
    }}
  />

  <button
    onclick={() => goto("/")}
    class="rounded-md text-3xl text-gray-600 absolute left-5 hover:cursor-pointer hover:bg-gray-300 px-2 duration-200 ease-in-out transition-colors"
  >
    {"<"}
  </button>
  {#if loadingMonthly}
    <div class="text-gray-600 animate-pulse">Loading monthly data...</div>
  {:else if errorMonthly}
    <div class="text-red-600 mb-3">
      {#if errorMonthly.includes("404")}
        No monthly data found for device {deviceID}
      {:else}
        {errorMonthly}
      {/if}
    </div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("monthly")}
    >
      Retry
    </button>
  {:else if monthlyData}
    <div class="flex flex-col justify-center mt-2 text-green-700">
      <p class="w-fit mx-auto">Monthly NRW data loaded.</p>
      <div class="flex gap-1">
        <StatCard
          data={Number.parseFloat(
            firstValue?.billed_completed.substring(0, 5)!
          )}
          title={"Bill Completion"}
          unit={"%"}
        />
        <StatCard
          data={firstValue?.billed_qty}
          title={"Billed Quantity"}
          unit={"m³"}
        />
        <StatCard
          data={firstValue?.total_flow}
          title={"Total Flow"}
          unit={"m³"}
        />
        <StatCard
          data={firstValue?.nrw_m3}
          title={"NRW Quantity"}
          unit={"m³"}
        />
        <StatCard
          data={firstValue?.nrw_percent}
          title={"NRW percentage"}
          unit={"%"}
        />
      </div>
      <div class="flex gap-2 p-4 flex-col w-[80rem]">
        <!-- <MonthlyChart data={yearlyData} /> -->
        <!-- <ComparisonChart data={monthlyData} /> -->
      </div>
    </div>
  {/if}

  {#if loadingYearly}
    <div class="text-gray-600 animate-pulse">Loading yearly NRW data...</div>
  {:else if errorYearly}
    <div class="text-red-600 mb-3">
      {#if errorYearly.includes("404")}
        No yearly data found for device {deviceID}
      {:else}
        {errorYearly}
      {/if}
    </div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("yearly")}
    >
      Retry
    </button>
  {:else if yearlyData}
    <div class="flex flex-col justify-center mt-2 text-green-700">
      <p class="w-fit mx-auto">Yearly NRW data loaded.</p>
      <div class="flex gap-2 p-4 flex-col w-[80rem]">
        <MonthlyChart data={yearlyData} />
      </div>
    </div>
  {/if}

  {#if loadingNRW}
    <div class="text-gray-600 animate-pulse">Loading daily NRW data...</div>
  {:else if errorNRW}
    <div class="text-red-600 mb-3">
      {#if errorNRW.includes("404")}
        No daily data found for device {deviceID}
      {:else}
        {errorNRW}
      {/if}
    </div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("daily")}
    >
      Retry
    </button>
  {:else if dailyData}
    <div class="text-green-700">Daily NRW data loaded.</div>
    <DailyChart data={dailyData} />
  {/if}
</div>
