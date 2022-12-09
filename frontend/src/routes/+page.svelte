<script>
	import LoginPage from "../lib/pages/LoginPage.svelte";
	import MainPage from "../lib/pages/MainPage.svelte";
    import {isLoggedIn} from "../lib/stores";

    export let data;
</script>

{#if $isLoggedIn}
    <MainPage {data} />
{:else}
    <LoginPage />
{/if}
