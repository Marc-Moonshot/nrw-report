<script lang="ts">
  import "../app.css"
  import favicon from "$lib/assets/favicon.svg"
  import AppAvatar from "$lib/components/AppAvatar.svelte"
  import {
    onAuthStateChanged,
    signInWithPopup,
    type User,
    GoogleAuthProvider,
  } from "firebase/auth"
  import { auth } from "$lib/client"
  import { onMount } from "svelte"

  let { children } = $props()

  let user: User | null = $state(null)
  let loading = $state(true)
  // Restore user from Firebase on page load
  onMount(() => {
    return onAuthStateChanged(auth, (u) => {
      user = u
      loading = false
    })
  })

  const login = async () => {
    try {
      loading = true
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user = result.user
    } catch (e) {
      console.log(e)
    } finally {
      loading = false
    }
  }
</script>

{#if loading}
  <div class="w-screen h-screen flex justify-center items-center">
    <h1 class="text-2xl font-bold text-gray-800">Wait a while..</h1>
  </div>
{:else if !user}
  <div class="w-screen h-screen flex items-center justify-center bg-gray-50">
    <!-- Unauthenticated view -->
    <div
      class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4 w-80"
    >
      <!-- <img src={favicon} alt="App Logo" class="w-12 h-12" /> -->
      <h1 class="text-xl font-semibold text-[#cc241d]">Unauthenticated</h1>
      <p class="text-sm text-gray-600 text-center">
        Sign in with Google to continue.
      </p>
      <button
        onclick={() => login()}
        class="w-full mt-2 px-4 py-2 rounded-lg bg-[#458588] text-white font-medium hover:bg-[#83a598] transition"
      >
        Sign in with Google
      </button>
    </div>
  </div>
{:else}
  <!-- Authenticated layout -->
  <link rel="icon" href={favicon} />
  <main class="flex w-screen min-h-screen bg-gray-50">
    <AppAvatar {user} />
    <!-- Main content -->
    <section class="flex">
      {@render children?.()}
    </section>
  </main>
{/if}
