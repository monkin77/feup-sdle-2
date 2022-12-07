<script>
	import LoginPage from "../lib/pages/LoginPage.svelte";
    import {isLoggedIn} from "../lib/stores";

    export let data;
</script>

{#if $isLoggedIn}
    <h1>Logged in</h1>
{:else}
    <LoginPage />
{/if}
