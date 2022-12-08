<script>
	import Follower from "./Follower.svelte";

    export let followers;
    export let isFollowing;
</script>

<h3 class="text-3xl font-extrabold tracking-wide pl-3">
    {#if isFollowing}
        Following
    {:else}
        Recommended Users
    {/if}
</h3>
<div class="overflow-y-auto h-full px-3">
    {#each followers as follower}
        <Follower {follower} {isFollowing} />
    {/each}
</div>
