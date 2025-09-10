<script lang="ts">
  import { page } from "$app/state"
  import ComparisonChart from "$lib/components/ComparisonChart.svelte"
  import MonthlyChart from "$lib/components/MonthlyChart.svelte"
  const code = page.params.code

</script>

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
