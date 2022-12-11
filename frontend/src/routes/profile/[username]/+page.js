import { redirect } from '@sveltejs/kit';
import { checkAuthRequest, getInfoRequest } from "../../../lib/requests";
import { following } from '../../../lib/stores';

const defaultData = {
    username: "You",
    followers: [],
    following: [],
    posts: [],
}

export async function load({ params }) {
    const {res: resAuth, body: bodyAuth} = await checkAuthRequest();
    if (!resAuth.ok) {
        console.log("Error while checking auth:", bodyAuth);
        return defaultData;
    }

    if (!bodyAuth.isLoggedIn) {
        throw redirect(302, "/login");
    }

    const {res: resInfo, body: userInfo} = await getInfoRequest(bodyAuth.username);
    if (!resInfo.ok) {
        console.log("Error while getting user info:", userInfo);
        return defaultData;
    }

    const {res: resInfoProfile, body: userInfoProfile} = await getInfoRequest(params.username);
    if (!resInfoProfile.ok) {
        console.log("Error while getting user info:", userInfoProfile);
        return defaultData;
    }

    following.set(userInfo.following);
    return {
        username: params.username,
        followers: userInfoProfile.followers,
        following: userInfoProfile.following,
        posts: userInfoProfile.posts,
    };
}
