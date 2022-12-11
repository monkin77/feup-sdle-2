<script>
    import "../app.css";
	import Snackbar from "../lib/components/Snackbar.svelte";
</script>

<main class="bg-slate-800 h-screen overflow-hidden py-8 px-44 text-white">
    <slot />

    <Snackbar />
</main>
