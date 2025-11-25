<script lang="ts">
  import { page } from "$app/state";
  import { getCache, setCache } from "$lib/cache";
  import MonthlyChart from "$lib/components/MonthlyChart.svelte";
  import { PUBLIC_SERVER_ADDRESS } from "$env/static/public";
  import StatCard from "$lib/components/StatCard.svelte";
  import DailyChart from "$lib/components/DailyChart.svelte";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";

  const deviceID = page.params.deviceID;

  let today = new Date();
  let date = $state(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  let year = $derived(date.getFullYear());
  let month = $derived(date.getMonth() + 1);
  let paddedMonth = $derived(month.toString().padStart(2, "0"));
  let formattedMonth = $derived(`${year}-${paddedMonth}`);
  let thisMonth = new Date().toISOString().slice(0, 7);

  let dailyData: dailyData[] | null = $state(null);
  let monthlyData: monthlyData | null = $state(null);
  let yearlyData: yearlyData | null = $state(null);

  let loadingNRW = $state(true);
  let loadingMonthly = $state(true);
  let loadingYearly = $state(true);

  let errorNRW: string | null = $state(null);
  let errorMonthly: string | null = $state(null);
  let errorYearly: string | null = $state(null);

  let pollTimeouts: number[] = [];

  let firstValue: {
    billed_completed: string;
    billed_qty: number;
    nrw_m3: number;
    nrw_percent: number;
    total_flow: number;
  } | null = $state(null);

  async function getNRWData() {
    loadingNRW = true;
    errorNRW = null;

    const cached = getCache<dailyData[]>(
      `${deviceID}-dailyData-${year}-${paddedMonth}`,
    );
    if (cached) {
      dailyData = cached;
      loadingNRW = false;
      return;
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/daily?month=${year}-${paddedMonth}&device=${deviceID}`,
      );

      if (!response.ok) {
        errorNRW = `Request failed with status: ${response.status}`;
        return;
      }

      if (response.status == 202) {
        pollStatusUntilValid(
          `/nrw/daily?month=${year}-${paddedMonth}&device=${deviceID}`,
          "daily",
        );
        return;
      }

      const json = await response.json();
      setCache(
        `${deviceID}-dailyData-${year}-${paddedMonth}`,
        json,
        1000 * 60 * 60 * 3,
      );
      dailyData = json;
      loadingNRW = false;
    } catch (e) {
      errorNRW = e instanceof Error ? e.message : "Unknown error";
    }
  }

  async function getMonthlyData() {
    loadingMonthly = true;
    errorMonthly = null;

    const cacheKey = `${deviceID}-monthlyData-${year}-${paddedMonth}`;

    const cached = getCache<monthlyData>(cacheKey);
    if (cached) {
      monthlyData = cached;
      loadingMonthly = false;
      return;
    }

    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/monthly?month=${year}-${paddedMonth}&device=${deviceID}`,
      );
      if (!response.ok) {
        errorMonthly = `Request failed with status: ${response.status}`;
        return;
      }

      if (response.status == 202) {
        pollStatusUntilValid(
          `/nrw/monthly?month=${year}-${paddedMonth}&device=${deviceID}`,
          "monthly",
        );
        return;
      }

      const json = await response.json();
      setCache(cacheKey, json, 1000 * 60 * 60 * 3);
      monthlyData = json;
      loadingMonthly = false;
    } catch (e) {
      errorMonthly = e instanceof Error ? e.message : "Unknown error";
    }
  }

  async function getYearlyData() {
    loadingYearly = true;
    errorYearly = null;

    const cacheKey = `${deviceID}-yearlyData-${year}`;

    const cached = getCache<yearlyData>(cacheKey);
    if (cached) {
      yearlyData = cached;
      loadingYearly = false;
      return;
    }
    try {
      const response = await fetch(
        `${PUBLIC_SERVER_ADDRESS}/nrw/yearly?year=${year}&device=${deviceID}`,
      );
      if (!response.ok) {
        errorYearly = `Request failed with status: ${response.status}`;
        return;
      }

      if (response.status == 202) {
        pollStatusUntilValid(
          `/nrw/yearly?year=${year}&device=${deviceID}`,
          "yearly",
        );
        return;
      }

      const json = await response.json();
      setCache(cacheKey, json, 1000 * 60 * 60 * 24 * 3);
      yearlyData = json;
      loadingYearly = false;
    } catch (e) {
      errorYearly = e instanceof Error ? e.message : "Unknown error";
    }
  }

  function retry(type: "daily" | "monthly" | "yearly") {
    if (type === "daily") getNRWData();
    else if (type === "monthly") getMonthlyData();
    else getYearlyData();
  }

  const pollStatusUntilValid = async (
    route: string,
    type: "daily" | "monthly" | "yearly",
  ) => {
    const statusUrl = `/api/status/${route}`;
    let attempts = 0;
    const maxAttempts = 50;
    const delay = 5000;

    async function checkStatus() {
      try {
        const response = await fetch(statusUrl);
        if (!response.ok) {
          console.error(`status check failed: ${response.status}`);
          switch (type) {
            case "daily":
              errorNRW = `Status Check failed: ${response.status}`;
              loadingNRW = false;
              break;
            case "monthly":
              errorMonthly = `Status Check failed: ${response.status}`;
              loadingMonthly = false;
              break;
            case "yearly":
              errorYearly = `Status Check failed: ${response.status}`;
              loadingYearly = false;
              break;
          }
        }

        const payload = await response.json();

        if (payload === "error") {
          console.error("route status: ", payload);
          switch (type) {
            case "daily":
              errorNRW = "Data error";
              loadingNRW = false;
              break;
            case "monthly":
              errorMonthly = "Data error";
              loadingMonthly = false;
              break;
            case "yearly":
              errorYearly = "Data error";
              loadingYearly = false;
              break;
          }
          return;
        }

        if (payload === "valid") {
          console.log("data ready. fetching..");
          switch (type) {
            case "daily":
              await getNRWData();
              break;
            case "monthly":
              await getMonthlyData();
              break;
            case "yearly":
              await getYearlyData();
              break;
          }
          return;
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log("route status: ", payload);
          const timeoutId = window.setTimeout(checkStatus, delay);
          pollTimeouts.push(timeoutId);
        } else {
          console.error("Max attempts reached.");

          switch (type) {
            case "daily":
              errorNRW = "Max attempts reached";
              loadingNRW = false;
              break;
            case "monthly":
              errorMonthly = "Max attempts reached";
              loadingMonthly = false;
              break;
            case "yearly":
              errorYearly = "Max attempts reached";
              loadingYearly = false;
              break;
          }
        }
      } catch (e: any) {
        console.error(e);
        switch (type) {
          case "daily":
            errorNRW = "Client Error";
            loadingNRW = false;
            break;
          case "monthly":
            errorMonthly = "Client Error";
            loadingMonthly = false;
            break;
          case "yearly":
            errorYearly = "Client Error";
            loadingYearly = false;
            break;
        }
      }
    }
    checkStatus();
  };

  $effect(() => {
    date;
    year;
    month;
    getNRWData();
    getMonthlyData();
    getYearlyData();
  });

  $effect(() => {
    if (monthlyData) {
      const entries = Object.entries(monthlyData);
      if (entries.length > 0) {
        [, firstValue] = entries[0];
      } else {
        firstValue = null;
      }
    }
  });

  onDestroy(() => {
    pollTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    pollTimeouts = [];
  });
  // $inspect(monthlyData)
  // $inspect(dailyData)
  // $inspect(yearlyData)
</script>

<div class="flex flex-col w-full items-center p-8 gap-4">
  <input
    type="month"
    value={formattedMonth}
    max={thisMonth}
    onchange={(e) => {
      const [y, m] = e.currentTarget.value.split("-").map(Number);
      date = new Date(y, m - 1, 1);
    }}
  />

  <button
    onclick={() => goto("/")}
    class="rounded-md text-3xl text-gray-600 absolute left-10 top-5 hover:cursor-pointer hover:bg-gray-300 px-2 duration-200 ease-in-out transition-colors"
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
      <div class="flex gap-1 flex-wrap justify-center">
        <StatCard
          data={Number.parseFloat(
            firstValue?.billed_completed.substring(0, 5) ?? "0",
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
    <div class="text-green-700">Yearly NRW data loaded.</div>
    <MonthlyChart data={yearlyData} />
  {/if}
</div>
