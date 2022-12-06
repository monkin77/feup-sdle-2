<script>
	import Form from "../Form/Form.svelte";
    import FormField from "../Form/FormField.svelte";
    import AuthModal from "./AuthModal.svelte";
    import { PUBLIC_BACKEND_URL } from '$env/static/public';

    export let secondaryAction;

    const data = {};

    const login = async () => {
        console.log(data);
        const res = await fetch(PUBLIC_BACKEND_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => res.json());

        console.log(res);
    }
</script>

<AuthModal>
    <h2 class="text-2xl font-bold mb-4">Login</h2>
    <Form buttonText="Sign In" action={login} secondaryText="Register" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" bind:value={data.username} />
        <FormField id="password" label="Password" type="password" placeholder="***********" bind:value={data.password} />
    </Form>
</AuthModal>
