<script>
	import LoginPage from "../lib/pages/LoginPage.svelte";
    import {isLoggedIn} from "../lib/stores";

    export let data;
</script>

{#if $isLoggedIn}
<div class="flex h-full items-center justify-center">
    <h1 class="text-white text-3xl">You're in</h1>
</div>
{:else}
    <LoginPage />
{/if}
