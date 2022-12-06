<script>
	import AuthModal from "./AuthModal.svelte";
    export let registerAction;
</script>

<AuthModal>
    <div>
        <h2 class="text-2xl font-bold mb-4">Login</h2>
    </div>
    <div>
        <form>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-3" for="username">
                    Username
                </label>
                <input class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight" id="username" type="text" placeholder="Username">
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-3" for="password">
                    Password
                </label>
                <input class="shadow appearance-none border rounded py-2 px-3 text-gray-700 mb-3 leading-tight" id="password" type="password" placeholder="******************">
            </div>
            <div class="flex items-center justify-around">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button">
                    Sign In
                </button>
                <a class="inline-block font-bold text-sm text-blue-500 hover:text-blue-800" on:click={registerAction} href={"#"}>
                    Register
                </a>
            </div>
        </form>
    </div>
</AuthModal>
