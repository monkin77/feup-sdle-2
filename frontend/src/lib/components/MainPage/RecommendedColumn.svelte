<script>
	import ColumnLayout from "./ColumnLayout.svelte";
    import FollowerList from "./User/FollowerList.svelte";

    export let recommendedFollowers;
</script>

<ColumnLayout>
    <FollowerList followers={recommendedFollowers} isFollowing={false} />
</ColumnLayout>
