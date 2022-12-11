<script>
	import FollowingColumn from "$lib/components/ProfilePage/FollowingColumn.svelte";
    import FollowersColumn from "$lib/components/ProfilePage/FollowersColumn.svelte";
    import Post from "$lib/components/MainPage/Posts/Post.svelte";

    export let data;
</script>

<div class="grid grid-cols-4 gap-10 justify-items-center h-full">
    <div class="col-span-1 w-full">
        <FollowingColumn profileFollowing={data.following} selfUsername={data.selfUsername} />
    </div>
    <div class="col-span-2 w-full">
        <h1 class="text-3xl font-extrabold text-center tracking-wide pb-5">
            {data.username}
        </h1>
        <div class="overflow-y-auto h-full px-3">
            {#if data.posts.length === 0}
                <p class="text-center text-gray-500">Such an empty section... this user should totally share what's going on with them!</p>
            {/if}
            {#each data.posts as post}
                <Post username={post.username} timestamp={post.timestamp} text={post.text} />
            {/each}
        </div>
    </div>
    <div class="col-span-1 w-full">
        <FollowersColumn profileFollowers={data.followers} selfUsername={data.selfUsername} />
    </div>
</div>
