<script>
    import { goto } from '$app/navigation';
	import Form from "../Form/Form.svelte";
    import FormField from "../Form/FormField.svelte";
    import AuthModal from "./AuthModal.svelte";
    import { loginRequest } from "../../requests";

    export let secondaryAction;

    const data = {};

    const login = async () => {
        const {res, body} = await loginRequest(data.username, data.password);
        if (res.ok) {
            goto("/");
        }
        console.log(body);
    }
</script>

<AuthModal>
    <h2 class="text-2xl text-gray-900 font-bold mb-4">Login</h2>
    <Form buttonText="Sign In" action={login} secondaryText="Register" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" bind:value={data.username} />
        <FormField id="password" label="Password" type="password" placeholder="***********" bind:value={data.password} />
    </Form>
</AuthModal>
