<script>
	import LoginForm from "../components/Auth/LoginForm.svelte";
	import RegisterForm from "../components/Auth/RegisterForm.svelte";

    let registerSelected = false;
</script>

<h1 class="text-5xl font-extrabold tracking-wide">Fake Social</h1>

{#if registerSelected}
    <RegisterForm secondaryAction={() => registerSelected = false} />
{:else}
    <LoginForm secondaryAction={() => registerSelected = true} />
{/if}
