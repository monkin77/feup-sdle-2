import { error, redirect } from '@sveltejs/kit';
import { checkAuthRequest, getInfoRequest, getTimelineRequest } from "$lib/requests";
import { timeline, following } from '../lib/stores';
import { getRecommendedRequest } from '../lib/requests';

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

    const {res: resRecommended, body: recommendedUsersList} = await getRecommendedRequest(bodyAuth.username);
    if (!resRecommended.ok) {
        console.log("Error while getting recommended users:", recommendedUsersList);
    }

    timeline.set(timelineList);
    following.set(userInfo.following);
    return {
        username: bodyAuth.username,
        followers: userInfo.followers,
        recommended: recommendedUsersList
    };
}
