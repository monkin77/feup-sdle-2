<script>
	import CreatePostForm from "./Posts/CreatePostForm.svelte";
    import Profile from "./User/Profile.svelte";

    export let username;
    export let followers;
</script>

<div class="flex flex-col gap-2 h-full">
    <div class="mb-4">
        <Profile {username} />
    </div>
    <CreatePostForm />
</div>
