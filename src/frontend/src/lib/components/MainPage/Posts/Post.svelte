<script>
    import { timeAgo } from "../../../parser/time";
    import avatar from "../User/avatar.svg";

    export let username;
    export let timestamp;
    export let text;

    $: time = timeAgo(timestamp);
</script>

<div class="flex p-5 bg-slate-900 border-b border-slate-600">
    <img src={avatar} class="w-10 h-10 rounded-full" alt={`${username} avatar`} />

    <div class="flex flex-col flex-grow justify-center ml-3">
        <div class="flex justify-between">
            <p class="font-medium">{username}</p>
            <p class="text-sm text-slate-400">{time}</p>
        </div>
        <p>{text}</p>
    </div>
</div>
