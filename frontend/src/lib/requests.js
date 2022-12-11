import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { snackbarError } from './stores';

const generalRequest = async (method, endpoint, body) => {
    const res = await fetch(PUBLIC_BACKEND_URL + endpoint, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const json = await res.json();

    const validationErrors = {};
    if (json.errors) {
        json.errors.forEach(error => {
            if (!validationErrors[error.param]) // Prioritize first error
                validationErrors[error.param] = error.msg;
        });
    }

    if (!res.ok) {
        if (json.error) {
            snackbarError.set(json.error);
        } else if (Object.keys(validationErrors).length === 0) {
            snackbarError.set("Unknown error");
        }
        return {res, body: json, validationErrors};
    }

    return {res, body: json};
};

export const loginRequest = async (username, password) => generalRequest("POST", "/auth/login", {username, password});
export const registerRequest = async (username, password) => generalRequest("POST", "/auth/register", {username, password});
export const logoutRequest = async () => generalRequest("POST", "/auth/logout");
export const checkAuthRequest = async () => generalRequest("GET", "/auth/me");

export const followRequest = async (username) => generalRequest("POST", `/users/${username}/follow`);
export const unfollowRequest = async (username) => generalRequest("POST", `/users/${username}/unfollow`);

export const postRequest = async (text) => generalRequest("POST", "/posts/new", {text});

export const getInfoRequest = async (username) => generalRequest("GET", `/users/${username}/info`);
export const getTimelineRequest = async (username) => generalRequest("GET", `/users/${username}/timeline`);
export const getRecommendedRequest = async (username) => generalRequest("GET", `/users/${username}/recommended`);
