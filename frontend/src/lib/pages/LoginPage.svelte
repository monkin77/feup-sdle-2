<script>
	import LoginForm from "../components/Auth/LoginForm.svelte";
	import RegisterForm from "../components/Auth/RegisterForm.svelte";


    let registerSelected = false;
</script>

{#if registerSelected}
    <RegisterForm action={() => console.log("register")} secondaryAction={() => registerSelected = false} />
{:else}
    <LoginForm action={() => console.log("login")} secondaryAction={() => registerSelected = true} />
{/if}
