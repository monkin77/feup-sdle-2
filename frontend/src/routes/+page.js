import { isLoggedIn, timeline } from "../lib/stores";
import { checkAuthRequest, getInfoRequest, getTimelineRequest } from "../lib/requests";

export async function load() {
    const {res: resAuth, body: bodyAuth} = await checkAuthRequest();
    if (resAuth.ok) {
        isLoggedIn.set(bodyAuth.isLoggedIn);
    }
    if (!bodyAuth.isLoggedIn) return {};

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
