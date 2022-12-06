<script>
    export let buttonText;
    export let action;
    export let secondaryText;
    export let secondaryAction;
</script>

<form>
    <slot />
    <div class="flex items-center justify-around">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button" on:click={action}>
            {buttonText}
        </button>

        {#if secondaryText}
            <a class="inline-block font-bold text-sm text-blue-500 hover:text-blue-800" on:click={secondaryAction} href={"#"}>
                {secondaryText}
            </a>
        {/if}
    </div>
</form>
