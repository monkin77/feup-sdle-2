<script>
	import { following } from "../../stores";
    import UserCard from "./UserCard.svelte";

    export let profileFollowing;
    export let selfUsername;
</script>

<h3 class="text-3xl font-extrabold tracking-wide pl-3">
    Following
</h3>

{#if profileFollowing.length === 0}
    <p class="text-center text-gray-500 mt-2">This user is not following anyone yet!</p>
{/if}

<div class="overflow-y-auto h-full px-3">
    {#each profileFollowing as user }
        <UserCard {user} isFollowing={$following.includes(user)} isSelfUser={selfUsername === user} />
    {/each}
</div>