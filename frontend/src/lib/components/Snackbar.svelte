<!--TODO: Make a better snackbar-->
<script>
    import { snackbarError }  from "../stores";

    $: visible = $snackbarError != null;
    $: if (visible) {
        setTimeout(close, 3000);
    }

    const close = () => {
        snackbarError.set(null);
    }
</script>

{#if visible}
<div class="flex p-5 mb-4 bg-red-200 rounded-lg w-96 absolute bottom-4 right-10 z-10" role="alert">
    <div class="ml-3 font-medium text-red-700">
        {$snackbarError}
    </div>
    <button class="ml-auto bg-red-200 text-red-700 rounded-3xl focus:ring-1 focus:ring-red-400 p-1.5 hover:bg-red-300 inline-flex h-8 w-8" aria-label="Close" on:click={close}>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
</div>
{/if}
