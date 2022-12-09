<script>
	import { timeline } from "../../stores";
	import ColumnLayout from "./ColumnLayout.svelte";
    import Post from "./Posts/Post.svelte";
</script>

<ColumnLayout>
    <h3 class="text-3xl text-center font-extrabold tracking-wide pb-5">Welcome to Fake Social! 😁</h3>

    <div class="overflow-y-auto px-2">
        {#each $timeline as post}
            <Post username={post.username} timestamp={post.timestamp} text={post.text} />
        {/each}
    </div>
</ColumnLayout>
