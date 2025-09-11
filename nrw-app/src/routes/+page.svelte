<script lang="ts">
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public"
  import { getCache, setCache } from "$lib/cache"
  import { onMount } from "svelte"
  import Card from "$lib/components/Card.svelte"

  let date = $state(new Date())
  let year = $derived(date.getFullYear())
  let month = $derived(date.getMonth() + 1)
  let paddedMonth = $derived(month.toString().padStart(2, "0"))
  let formattedMonth = $derived(`${year}-${paddedMonth}`)
  let thisMonth = new Date().toISOString().slice(0, 7)

  let monthlyData: YearlyNRWData | null = $state(null)
  let loadingMonthly = $state(false)
  let errorMonthly: string | null = $state(null)

  async function getMonthlyData() {
    loadingMonthly = true
    errorMonthly = null
    monthlyData = null

    const cacheKey = `monthlyData-${year}-${paddedMonth}`

    const cached = getCache<YearlyNRWData>(cacheKey)
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
      setCache(cacheKey, json, 1000 * 60 * 60)
      monthlyData = json
    } catch (e) {
      errorMonthly = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loadingMonthly = false
    }
  }

  function retry() {
    getMonthlyData()
  }

  onMount(() => {
    getMonthlyData()
  })

  $effect(() => {
    year
    paddedMonth
    getMonthlyData()
  })

  $inspect(monthlyData)
</script>

<div class="flex flex-col items-center p-8 w-screen">
 
  <h1 class="text-3xl font-semibold mb-4 select-none text-gray-800">
    SELECT A STATION
  </h1>

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
      onclick={retry}
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
      {/each}
    </div>
  {/if}
</div>
