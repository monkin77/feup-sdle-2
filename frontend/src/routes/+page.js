import { isLoggedIn } from "../lib/stores"
import { PUBLIC_BACKEND_URL } from '$env/static/public';

export async function load() {
    const res = await fetch(PUBLIC_BACKEND_URL + "/auth/me");
    isLoggedIn.set((await res.json()).isLoggedIn);

    return {
        username: "BroZendo",
        followers: ["Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes"],
        following: ["Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes", "Monkerino", "PitRui", "Henry Nunes"],
        timeline: [
            {
                username: "BroZendo",
                text: "This is a really great post, I am so proud of this post omg lol.This is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lolThis is a really great post, I am so proud of this post omg lol\nThis is a really great post, I am so proud of this post omg lol",
                timestamp: 1670405480
            },
            {
                username: "Monkerino",
                text: "I wish I could make interfaces like this one. WOW",
                timestamp: 1670405470
            },
            {
                username: "PitRui",
                text: "WOOWOWOWOWOW XOXOXOXOXO WOWOWOWOWOWOWO",
                timestamp: 1670405460
            }
        ]
    }
}
