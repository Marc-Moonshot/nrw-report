<script lang="ts">
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public"
  import { getCache, setCache } from "$lib/cache"
  import { onMount } from "svelte"
  import Card from "$lib/components/Card.svelte"

  let date = $state(new Date())
  let year = $derived(date.getFullYear())
  let month = $derived(date.getMonth() + 1)
  let paddedMonth = $derived(String(month).padStart(2, "0"))

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

    const cached = getCache<data>(`dailyData-${year}-${paddedMonth}`)
    if (cached) {
      chartData = cached
      loadingNRW = false
      return
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/daily?&date=${year}-${paddedMonth}`
      )
      if (!response.ok) {
        errorNRW = `Request failed with status ${response.status}`
        return
      }
      const json = await response.json()
      setCache(`dailyData-${year}-${paddedMonth}`, json, 1000 * 60 * 60)
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
        `${PUBLIC_SERVER_ADDRESS}/nrw/monthly?month=${year}-${paddedMonth}`
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

  function retry(type: "nrw" | "monthly") {
    if (type === "nrw") getNRWData(year, month)
    else if (type === "monthly") getMonthlyData()
  }

  onMount(() => {
    getMonthlyData()
  })

  $effect(() => {
    getNRWData(year, month)
  })

  $inspect(monthlyData)
</script>

<div class="flex flex-col items-center p-8 w-screen">
  <!-- Page title -->
  <h1 class="text-3xl font-semibold mb-4 select-none text-gray-800">
    SELECT A STATION
  </h1>

  {#if loadingNRW}
    <div class="text-gray-600 animate-pulse">Loading daily NRW data...</div>
  {:else if errorNRW}
    <div class="text-red-600 mb-3">{errorNRW}</div>
    <button
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      onclick={() => retry("nrw")}
    >
      Retry
    </button>
  {:else if chartData}
    <div class="text-green-700">Daily NRW data loaded.</div>
  {/if}

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

  {#if monthlyData}
    <div class="mt-4 flex gap-1 flex-wrap justify-stretch">
      {#each Object.entries(monthlyData) as [wtpName, wtpData]}
        <Card data={wtpData} name={wtpName} />
        <!-- <h2 class="font-bold">{wtpName}</h2>
        <p>Total Flow: {wtpData.total_flow}</p>
        <p>Total Bill Qty: {wtpData.total_billed_qty}</p>

        <ul>
          {#each Object.entries(wtpData.areas) as [areaName, area]}
            <li>
              <strong>{areaName}</strong> – Flow: {area.total_flow}, NRW: {area.nrw_percent}%
            </li>
          {/each}
        </ul> -->
      {/each}
    </div>
  {/if}

  <!-- <div class="mt-4">
      
    </div> -->
</div>
