<script>
    export let id;
    export let label;
    export let type;
    export let placeholder;
    export let value;
    export let error;

    function typeAction(node) {
        node.type = type;
    }
</script>

<div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-3" for={id}>
        {label}
    </label>
    <input bind:value use:typeAction class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight" {id} {placeholder}>
    {#if error}
        <p class="text-red-500 text-xs italic mt-2 ml-1">{error}</p>
    {/if}
</div>
