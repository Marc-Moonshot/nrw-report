<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index"
  import UserIcon from "@lucide/svelte/icons/user"
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "$lib/components/ui/dropdown-menu/index"
  import { auth } from "$lib/client"
  import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    type User,
  } from "firebase/auth"

  export let user: User | null

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user = result.user
    } catch (e) {
      console.log(e)
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Sign-out failed:", error)
    }
  }
</script>

<div class="relative ml-auto right-5 top-5 flex items-center gap-2">
  <p class="text-gray-800 max-[800px]:hidden">
    Logged in as {user?.displayName}
  </p>
  <DropdownMenu>
    <DropdownMenuTrigger class="rounded-full">
      <div class=" hover:cursor-pointer">
        <Avatar.Root class="w-10 h-10">
          <Avatar.Image src={user?.photoURL} />
          <Avatar.Fallback>
            <UserIcon color="gray" />
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-40">
      {#if user}
        <DropdownMenuItem onclick={logout}>Sign Out</DropdownMenuItem>
      {:else}
        <DropdownMenuItem onclick={login}>Sign In</DropdownMenuItem>
      {/if}
    </DropdownMenuContent>
  </DropdownMenu>
</div>
