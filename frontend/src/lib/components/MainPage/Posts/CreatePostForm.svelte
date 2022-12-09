<script>
	import { postRequest } from "../../../requests";
	import { timeline } from "../../../stores";
	import Button from "../../Form/Button.svelte";

    let text;

    async function post() {
        const {res, body} = await postRequest(text);
        console.log(body);

        if (res.ok) {
            timeline.update((posts) => [body, ...posts]);
        }
    }
</script>

<textarea
    bind:value={text}
    class="bg-slate-900 shadow appearance-none rounded py-2 px-3 h-28 border border-slate-600 leading-tight resize-none"
    placeholder="What's on your mind?"
/>

<div class="self-end">
    <Button buttonText="Poop!" action={post} />
</div>
