<script lang="ts">
  import { db } from "$lib/client";
  import Card from "$lib/components/Card.svelte";
  import { collection, getDocs, query, where } from "firebase/firestore";
  import { onMount } from "svelte";

  let devices: (device & { id: string })[] = $state([]);

  const fetchDevices = async () => {
    const col = collection(db, "io_devices");

    const q = query(col, where("device_type", "==", "FLOW_METER"));
    const snap = await getDocs(q);

    devices = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as device),
    }));
  };

  onMount(() => fetchDevices());
  $inspect(devices);
</script>

<div class="flex flex-col items-center p-8 w-screen">
  <h1 class="text-3xl font-semibold mb-4 select-none text-gray-800">
    SELECT A STATION
  </h1>

  <div class="flex gap-2 flex-wrap justify-center">
    {#if devices.length}
      {#each devices as device}
        <Card data={device} />
      {/each}
    {:else}
      {#each Array.from({ length: 14 }) as _, i}
        <div
          id={i.toString()}
          class="w-80 h-40 rounded-2xl bg-white shadow-md border gap-3 border-gray-200
          hover:cursor-pointer hover:shadow-lg transition-shadow animate-pulse"
        ></div>
      {/each}
    {/if}
  </div>
</div>
