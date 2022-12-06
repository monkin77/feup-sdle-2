<script>
    export let buttonText;
    export let action;
    export let secondaryText;
    export let secondaryAction;
</script>

<form>
    <slot />
    <div class="flex items-center justify-around">
        <button class="bg-indigo-600 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded" type="button" on:click={action}>
            {buttonText}
        </button>

        {#if secondaryText}
            <a class="inline-block font-bold text-sm text-indigo-600 hover:text-indigo-900" on:click={secondaryAction} href={"#"}>
                {secondaryText}
            </a>
        {/if}
    </div>
</form>
