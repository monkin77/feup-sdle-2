<script>
	import ColumnLayout from "./ColumnLayout.svelte";
    import FollowerList from "./User/FollowerList.svelte";
	import FollowUser from "./User/FollowUser.svelte";

    export let recommendedFollowers;
</script>

<ColumnLayout>
    <FollowUser />
    <FollowerList followers={recommendedFollowers} isFollowing={false} title="Recommended Users" emptyMessage="There is nobody hanging out in here :( Have you considered inviting your friends?" />
</ColumnLayout>
