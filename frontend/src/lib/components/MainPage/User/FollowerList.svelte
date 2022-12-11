<script>
	import Follower from "./Follower.svelte";

    export let followers;
    export let isFollowing;
    export let title;
    export let emptyMessage;
</script>

<h3 class="text-3xl font-extrabold tracking-wide pl-3">
    {title}
</h3>

{#if followers.length === 0}
    <p class="text-center text-gray-500 mt-2 mx-2">{emptyMessage}</p>
{/if}

<div class="overflow-y-auto h-full px-3">
    {#each followers as follower (follower)}
        <Follower {follower} {isFollowing} />
    {/each}
</div>
