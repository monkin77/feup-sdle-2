<script>
	import LoginForm from "../lib/components/Auth/LoginForm.svelte";

    export let data;
</script>

<LoginForm registerAction={() => console.log("register")} />
