<script>
	import { postRequest } from "../../../requests";
	import { timeline } from "../../../stores";
	import Button from "../../Form/Button.svelte";

    let text;
    let errors = {};

    async function post() {
        const {res, body, validationErrors} = await postRequest(text);

        if (res.ok) {
            timeline.update((posts) => [body, ...posts]);
            errors = {};
        } else {
            errors = validationErrors;
        }
    }
</script>

<textarea
    bind:value={text}
    class="bg-slate-900 shadow appearance-none rounded py-2 px-3 h-28 border border-slate-600 leading-tight"
    placeholder="What's on your mind?"
/>

{#if errors.text}
<div class="flex justify-between">
    <p class="text-red-500 text-sm italic mt-1 ml-2">{errors.text}</p>

    <Button buttonText="Poop!" action={post} />
</div>
{:else}
<div class="self-end">
    <Button buttonText="Poop!" action={post} />
</div>
{/if}

