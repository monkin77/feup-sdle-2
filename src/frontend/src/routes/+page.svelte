<script>
	import FeedColumn from "$lib/components/MainPage/FeedColumn.svelte";
    import RecommendedColumn from "$lib/components/MainPage/RecommendedColumn.svelte";
    import UserColumn from "$lib/components/MainPage/UserColumn.svelte";

    export let data;
</script>

<div class="grid grid-cols-4 gap-10 justify-items-center h-full">
    <div class="col-span-1 w-full">
        <UserColumn username={data.username} followers={data.followers} />
    </div>
    <div class="col-span-2 w-full">
        <FeedColumn />
    </div>
    <div class="col-span-1 w-full">
        <RecommendedColumn recommendedFollowers={data.recommended} />
    </div>
</div>
