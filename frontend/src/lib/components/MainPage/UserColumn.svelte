<script>
	import CreatePostForm from "./Posts/CreatePostForm.svelte";
	import FollowerList from "./User/FollowerList.svelte";
    import Profile from "./User/Profile.svelte";

    export let username;
    export let following;
</script>

<div class="flex flex-col gap-2 max-h-screen">
    <div class="mb-4">
        <Profile {username} />
    </div>
    <CreatePostForm />
    <FollowerList followers={following} isFollowing={true} />
    <div class="h-16" />
</div>
