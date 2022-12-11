<script>
	import { following } from "../../stores";
    import UserCard from "./UserCard.svelte";

    export let profileFollowers;
    export let selfUsername;
</script>

<h3 class="text-3xl font-extrabold tracking-wide pl-3">
    Followers
</h3>

{#if profileFollowers.length === 0}
    <p class="text-center text-gray-500 mt-2">This user has not any follower, what a shame! </p>
{/if}

<div class="overflow-y-auto h-full px-3">
    {#each profileFollowers as user }
        <UserCard {user} isFollowing={$following.includes(user)} isSelfUser={selfUsername === user} />
    {/each}
</div>