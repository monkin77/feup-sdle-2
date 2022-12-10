<script>
    export let buttonText;
    export let action;
</script>

<button class="bg-indigo-600 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded" on:click|preventDefault={action}>
    {buttonText}
</button>
