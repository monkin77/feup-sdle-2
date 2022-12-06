import { PUBLIC_BACKEND_URL } from '$env/static/public'

export async function load({ fetch }) {
    return await fetch(PUBLIC_BACKEND_URL).then(r => r.json());
}

