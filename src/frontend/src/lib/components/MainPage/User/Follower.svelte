<script>
	import { followRequest, unfollowRequest } from "../../../requests";
	import { following } from "../../../stores";
    import avatar from "./avatar.svg";

    export let follower;

    $: isFollowing = $following.includes(follower);

    async function followAction() {
        let res;
        if (isFollowing) ({res} = await unfollowRequest(follower));
        else ({res} = await followRequest(follower));

        if (res.ok) {
            isFollowing = !isFollowing;
        }
    }
</script>

<div class="flex items-center justify-between my-4 p-5 bg-slate-900 rounded-3xl">
    <div class="flex items-center gap-2">
        <a href="/profile/{follower}">
            <img src={avatar} class="w-10 h-10 rounded-full" alt={`${follower} avatar`} />
        </a>
        <p class="text-lg font-medium ml-1">{follower}</p>
    </div>

    {#if isFollowing}
        <button class="bg-slate-900 hover:bg-indigo-900 border border-indigo-600 text-indigo-500 text-sm font-bold py-1 px-2 rounded-xl" on:click={followAction}>
            Unfollow
        </button>
    {:else}
        <button class="bg-indigo-600 hover:bg-indigo-900 text-sm font-bold py-1 px-2 rounded-xl" on:click={followAction}>
            Follow
        </button>
    {/if}
    
</div>
