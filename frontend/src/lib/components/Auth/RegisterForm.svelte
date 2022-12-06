<script>
	import FormField from "../Form/FormField.svelte";
    import Form from "../Form/Form.svelte";
	import AuthModal from "./AuthModal.svelte";

    export let action;
    export let secondaryAction;
</script>

<AuthModal>
    <h2 class="text-2xl font-bold mb-4">Register</h2>
    <Form buttonText="Register" {action} secondaryText="Sign in" {secondaryAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" />
        <FormField id="password" label="Password" type="password" placeholder="***********" />
    </Form>
</AuthModal>
