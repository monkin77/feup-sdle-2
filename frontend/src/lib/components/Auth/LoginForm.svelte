<script>
    import { goto } from '$app/navigation';
	import Form from "../Form/Form.svelte";
    import FormField from "../Form/FormField.svelte";
    import AuthModal from "./AuthModal.svelte";
    import { loginRequest } from "../../requests";

    export let secondaryAction;

    const data = {};
    let errors = {};

    const login = async () => {
        const {res, validationErrors} = await loginRequest(data.username, data.password);
        if (res.ok) {
            goto("/");
        } else {
            errors = validationErrors;
        }
    }
</script>

<AuthModal>
    <h2 class="text-2xl text-gray-900 font-bold mb-4">Login</h2>
    <Form buttonText="Sign In" action={login} secondaryText="Register" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" bind:value={data.username} error={errors.username} />
        <FormField id="password" label="Password" type="password" placeholder="***********" bind:value={data.password} error={errors.password} />
    </Form>
</AuthModal>
