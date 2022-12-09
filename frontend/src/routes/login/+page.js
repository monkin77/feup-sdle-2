import { error, redirect } from '@sveltejs/kit';
import { checkAuthRequest } from "$lib/requests";

export async function load() {
    const {res, body} = await checkAuthRequest();
    if (!res.ok) {
        throw error(res.status, body.error);
    }

    if (body.isLoggedIn) {
        throw redirect(302, "/");
    }
}
