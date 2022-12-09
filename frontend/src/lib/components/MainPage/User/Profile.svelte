<script>
    import Icon from '@iconify/svelte';
	import { isLoggedIn } from '../../../stores';
    import avatar from "./avatar.svg";
	import { logoutRequest } from '../../../requests';

    export let username;

    const logout = async () => {
        const {res, body} = await logoutRequest();
        if (res.ok) {
            isLoggedIn.set(false);
        }
        console.log(body);
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
