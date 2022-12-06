<script>
	import Form from "../Form/Form.svelte";
    import FormField from "../Form/FormField.svelte";
    import AuthModal from "./AuthModal.svelte";
    export let registerAction;
</script>

<AuthModal>
    <h2 class="text-2xl font-bold mb-4">Login</h2>
    <Form buttonText="Sign In" action={() => console.log("sign in")} secondaryText="Register" secondaryAction={registerAction}>
        <FormField id="username" label="Username" type="text" placeholder="Username" />
        <FormField id="password" label="Password" type="password" placeholder="***********" />
    </Form>
</AuthModal>
