<script>
	import Button from "./Button.svelte";

    export let buttonText;
    export let action;
    export let secondaryText;
    export let secondaryAction;
</script>

<form>
    <slot />
    <div class="flex items-center justify-around">
        <Button {buttonText} {action} />

        {#if secondaryText}
            <a class="inline-block font-bold text-sm text-indigo-600 hover:text-indigo-900" on:click={secondaryAction} href={"#"}>
                {secondaryText}
            </a>
        {/if}
    </div>
</form>
