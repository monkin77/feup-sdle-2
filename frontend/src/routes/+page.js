import { redirect } from '@sveltejs/kit';
import { checkAuthRequest, getInfoRequest, getTimelineRequest } from "$lib/requests";
import { timeline, following } from '../lib/stores';
import { getRecommendedRequest, timelineSSE } from '../lib/requests';
import { browser } from '$app/environment';

const defaultData = {
    username: "You",
    followers: [],
    recommended: []
}

export async function load() {
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

    const {res: resTimeline, body: timelineList} = await getTimelineRequest(bodyAuth.username);
    if (!resTimeline.ok) {
        console.log("Error while getting timeline:", timelineList);
        return defaultData;
    }

    const {res: resRecommended, body: recommendedUsersList} = await getRecommendedRequest(bodyAuth.username);
    if (!resRecommended.ok) {
        console.log("Error while getting recommended users:", recommendedUsersList);
        return defaultData;
    }

    timeline.set(timelineList);
    following.set(userInfo.following);

    if (browser) {
        // SSE to update timeline
        timelineSSE(data => timeline.update(timeline => [data, ...timeline]));
    }

    return {
        username: bodyAuth.username,
        followers: userInfo.followers,
        recommended: recommendedUsersList
    };
}
