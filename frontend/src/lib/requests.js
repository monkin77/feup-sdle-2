import { PUBLIC_BACKEND_URL } from '$env/static/public';

export const loginRequest = async (username, password) => {
    const res = await fetch(PUBLIC_BACKEND_URL + "/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });
    const body = await res.json();

    return {res, body};
};

export const registerRequest = async (username, password) => {
    const res = await fetch(PUBLIC_BACKEND_URL + "/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });
    const body = await res.json();

    return {res, body};
};

export const logoutRequest = async () => {
    const res = await fetch(PUBLIC_BACKEND_URL + "/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const body = await res.json();

    return {res, body};
};

export const checkAuthRequest = async () => {
    const res = await fetch(PUBLIC_BACKEND_URL + "/auth/me", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const body = await res.json();

    return {res, body};
};

export const followRequest = async (username) => {
    const res = await fetch(`${PUBLIC_BACKEND_URL}/users/${username}/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const body = await res.json();

    return {res, body};
};

export const unfollowRequest = async (username) => {
    const res = await fetch(`${PUBLIC_BACKEND_URL}/users/${username}/unfollow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const body = await res.json();

    return {res, body};
}
