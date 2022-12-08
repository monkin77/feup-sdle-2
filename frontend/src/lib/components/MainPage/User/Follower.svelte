<script>
    import avatar from "./avatar.svg";

    export let follower;
    export let isFollowing;
</script>

<div class="flex items-center justify-between my-4 p-5 bg-slate-900 rounded-3xl">
    <div class="flex items-center gap-2">
        <img src={avatar} class="w-10 h-10 rounded-full" alt={`${follower} avatar`} />
        <p class="text-lg font-medium ml-1">{follower}</p>
    </div>

    <button class="bg-indigo-600 hover:bg-indigo-900 text-sm font-bold py-1 px-2 rounded-xl" on:click={() => isFollowing = !isFollowing}>
        {#if isFollowing}
            Unfollow
        {:else}
            Follow
        {/if}
    </button>
</div>
