<script>
	import UserColumn from "../components/MainPage/UserColumn.svelte";

    export let data;
</script>

<div class="grid grid-cols-4 gap-10 justify-items-center h-full">
    <div class="col-span-1 w-full">
        <UserColumn username={data.username} following={data.following} />
    </div>
    <div class="col-span-2 w-full">
        Boas
    </div>
    <div class="col-span-1 w-full">
        Boas
    </div>
</div>
