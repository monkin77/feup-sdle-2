import { isLoggedIn, timeline } from "../lib/stores";
import { checkAuthRequest } from "../lib/requests";

export async function load() {
    const {res, body} = await checkAuthRequest();
    if (res.ok) {
        isLoggedIn.set(body.isLoggedIn);
    }

    const userInfo = {
        username: "BroZendo",
        followers: ["Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes"],
        following: ["Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes"],
        timeline: [
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670549999999
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670547129789
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670547129789
            },
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670549999999
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670549999999
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670405460
            },
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670405480
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670549999999
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670405460
            },
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670405480
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670549999999
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670405460
            },
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670405480
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670549999999
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670405460
            }
        ]
    }

    timeline.set(userInfo.timeline);

    return {
        username: userInfo.username,
        followers: userInfo.followers,
        following: userInfo.following,
    };
}
