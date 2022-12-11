<script>
	import ColumnLayout from "./ColumnLayout.svelte";
    import FollowerList from "./User/FollowerList.svelte";
	import FollowUser from "./User/FollowUser.svelte";

    export let recommendedFollowers;
</script>

<ColumnLayout>
    <FollowUser />
    <FollowerList followers={recommendedFollowers} isFollowing={false} />
</ColumnLayout>
