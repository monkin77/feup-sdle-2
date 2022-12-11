import { redirect } from '@sveltejs/kit';
import { checkAuthRequest } from "$lib/requests";

export async function load() {
    const {res, body} = await checkAuthRequest();
    if (!res.ok) {
        console.log("Error while checking auth:", body);
        return;
    }

    if (body.isLoggedIn) {
        throw redirect(302, "/");
    }
}
