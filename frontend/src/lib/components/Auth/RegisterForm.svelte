<script>
	import FormField from "../Form/FormField.svelte";
    import Form from "../Form/Form.svelte";
	import AuthModal from "./AuthModal.svelte";
	import { registerRequest } from "../../requests";

    export let secondaryAction;

    const data = {};

    const register = async () => {
        const {res} = await registerRequest(data.username, data.password);
        console.log(res);
    }
</script>

<AuthModal>
    <h2 class="text-2xl text-gray-900 font-bold mb-4">Register</h2>
    <Form buttonText="Register" action={register} secondaryText="Sign in" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" bind:value={data.username} />
        <FormField id="password" label="Password" type="password" placeholder="***********" bind:value={data.password} />
    </Form>
</AuthModal>
