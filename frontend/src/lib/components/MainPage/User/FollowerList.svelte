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

{#if followers.length === 0}
    {#if isFollowing}
        <p class="text-center text-gray-500 mt-2">You are not following anyone yet! Check our <i>Recommended Users</i> section :)</p>
    {:else}
        <p class="text-center text-gray-500 mt-2 mx-3">There is nobody hanging out in here :( Have you considered inviting your friends?</p>
    {/if}
{/if}

<div class="overflow-y-auto h-full px-3">
    {#each followers as follower (follower)}
        <Follower {follower} {isFollowing} />
    {/each}
</div>
