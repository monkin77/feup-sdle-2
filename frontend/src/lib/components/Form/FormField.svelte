<script>
    export let id;
    export let label;
    export let type;
    export let placeholder;
</script>

<div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-3" for={id}>
        {label}
    </label>
    <input class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight" {id} {type} {placeholder}>
</div>
