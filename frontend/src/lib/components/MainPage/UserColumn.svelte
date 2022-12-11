<script>
	import ColumnLayout from "./ColumnLayout.svelte";
    import CreatePostForm from "./Posts/CreatePostForm.svelte";
	import FollowerList from "./User/FollowerList.svelte";
    import Profile from "./User/Profile.svelte";
    import { following } from "$lib/stores";
	import Button from "../Form/Button.svelte";

    export let username;
    export let followers;

    $: userList = $following;
    let followingSelected = true;

    function toggleFollowing() {
        followingSelected = !followingSelected;
        if (followingSelected) {
            userList = $following;
        } else {
            userList = followers;
        }
    }
</script>

<ColumnLayout>
    <div class="mb-4">
        <Profile {username} />
    </div>
    <CreatePostForm />

    <div class="relative mt-5">
        <div class="absolute right-7">
            <Button buttonText={followingSelected ? "See Followers" : "See Following"} action={toggleFollowing} />
        </div>
        <FollowerList
            followers={userList}
            isFollowing={true}
            title={followingSelected ? "Following" : "Followers"}
            emptyMessage={followingSelected ? "You are not following anyone yet! Check our Recommended Users section :)" : "You have no followers yet! Invite your friends to join us!"}
        />
    </div>
</ColumnLayout>
