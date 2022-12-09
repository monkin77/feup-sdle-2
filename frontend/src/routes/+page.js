import { error, redirect } from '@sveltejs/kit';
import { checkAuthRequest, getInfoRequest, getTimelineRequest } from "$lib/requests";
import { timeline } from '../lib/stores';

export async function load() {
    const {res: resAuth, body: bodyAuth} = await checkAuthRequest();
    if (!resAuth.ok) {
        throw error(resAuth.status, bodyAuth.error);
    }

    if (!bodyAuth.isLoggedIn) {
        throw redirect(302, "/login");
    }

    const {res: resInfo, body: userInfo} = await getInfoRequest(bodyAuth.username);
    if (!resInfo.ok) {
        console.log("Error while getting user info:", userInfo);
    }

    const {res: resTimeline, body: timelineList} = await getTimelineRequest(bodyAuth.username);
    if (!resTimeline.ok) {
        console.log("Error while getting timeline:", timelineList);
    }
    timeline.set(timelineList);

    return {
        username: bodyAuth.username,
        followers: userInfo.followers,
        following: userInfo.following,
    };
}
