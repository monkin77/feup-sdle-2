<script>
	import ColumnLayout from "./ColumnLayout.svelte";
    import CreatePostForm from "./Posts/CreatePostForm.svelte";
	import FollowerList from "./User/FollowerList.svelte";
    import Profile from "./User/Profile.svelte";
    import { following } from "$lib/stores";

    export let username;
</script>

<ColumnLayout>
    <div class="mb-4">
        <Profile {username} />
    </div>
    <CreatePostForm />
    <FollowerList followers={$following} isFollowing={true} />
</ColumnLayout>
