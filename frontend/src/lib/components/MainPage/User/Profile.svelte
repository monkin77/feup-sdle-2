<script>
    import Icon from '@iconify/svelte';
	import { isLoggedIn } from '../../../stores';
    import avatar from "./avatar.svg";
    import { PUBLIC_BACKEND_URL } from '$env/static/public';

    export let username;

    const logout = async () => {
        const res = await fetch(PUBLIC_BACKEND_URL + "/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            isLoggedIn.set(false);
        }
        console.log(res);
    }
</script>

<div class="flex justify-between items-center">
    <div class="flex justify-start items-center">
        <img src={avatar} class="rounded-full w-16 h-16" alt="your avatar" />
        <p class="text-xl font-medium px-3">{username}</p>
    </div>
    <button class="hover:bg-slate-700 rounded-md h-9 w-9" on:click={logout}>
        <Icon class="w-9 h-7" icon="material-symbols:logout" />
    </button>
</div>
