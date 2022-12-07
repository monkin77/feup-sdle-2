<script>
    import Icon from '@iconify/svelte';
	import { isLoggedIn } from '../../../stores';
    import avatar from "./avatar.svg";
    export let username;
</script>

<div class="flex justify-between items-center">
    <div class="flex justify-start items-center">
        <img src={avatar} class="rounded-full w-16 h-16" alt="your avatar" />
        <p class="px-3">{username}</p>
    </div>
    <button class="hover:bg-slate-700 rounded-md h-9 w-9" on:click={() => isLoggedIn.update(() => false)}>
        <Icon class="w-9 h-7" icon="material-symbols:logout" />
    </button>
</div>
