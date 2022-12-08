<script>
	import Post from "./Posts/Post.svelte";

    export let timeline;
</script>

{#each timeline as post}
    <Post username={post.username} timestamp={post.timestamp} text={post.text} />
{/each}
