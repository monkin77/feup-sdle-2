<script>
	import Button from "../../Form/Button.svelte";

    let text;
</script>

<textarea
    bind:value={text}
    class="bg-slate-900 shadow appearance-none rounded py-2 px-3 h-28 border border-slate-600 leading-tight resize-none"
    placeholder="What's on your mind?"
/>

<div class="self-end">
    <Button buttonText="Poop!" action={() => console.log("posted!")} />
</div>
