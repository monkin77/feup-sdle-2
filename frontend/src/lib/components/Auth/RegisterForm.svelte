<script>
	import FormField from "../Form/FormField.svelte";
    import Form from "../Form/Form.svelte";
	import AuthModal from "./AuthModal.svelte";
	import { loginRequest, registerRequest } from "../../requests";
	import { goto } from "$app/navigation";

    export let secondaryAction;

    const data = {};
    let errors = {}, snackbarError;

    const register = async () => {
        let {res, validationErrors, error} = await registerRequest(data.username, data.password);
        if (!res.ok) {
            errors = validationErrors;
            snackbarError = error;
            return;
        }

        ({res, validationErrors, error} = await loginRequest(data.username, data.password));
        if (res.ok) {
            goto("/");
        } else {
            errors = validationErrors;
            snackbarError = error;
        }
    }
</script>

<AuthModal>
    <h2 class="text-2xl text-gray-900 font-bold mb-4">Register</h2>
    <Form buttonText="Register" action={register} secondaryText="Sign in" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" bind:value={data.username} error={errors.username} />
        <FormField id="password" label="Password" type="password" placeholder="***********" bind:value={data.password} error={errors.password} />
    </Form>
</AuthModal>
