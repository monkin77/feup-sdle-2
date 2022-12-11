<script>
	import { followRequest } from "../../../requests";
    import { following } from "../../../stores";

    let username;

    async function follow() {
        if (!username) return;

        // TODO: Confirmation/Error message
        const {res, body} = await followRequest(username);
        console.log(body);

        if (res.ok) {
            following.update((users) => {
                users = users.filter((user) => user !== username);
                return [username, ...users];
            });
            username = undefined;
        }
    }
</script>

<h3 class="text-3xl font-extrabold tracking-wide pl-3">
    Follow a Friend
</h3>

<div class="flex items-center justify-center gap-4 my-4 p-5 mx-1 bg-slate-900 rounded-md border border-slate-700">
    <input bind:value={username} class="bg-slate-800 appearance-none rounded-md px-2 border border-slate-700" placeholder="Username" />
    <button class="bg-indigo-600 hover:bg-indigo-900 text-sm font-bold py-1 px-5 rounded-xl" on:click={follow}>
            Follow
    </button>
</div>
