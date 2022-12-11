import { addPostAndGarbageCollect } from "../lib/storage.js";

export class Info {
    constructor(info) {
        if (info) {
            this.fromJson(info);
        } else {
            this.followers = new Set();
            this.following = new Set();
            this.posts = [];
        }
    }

    getFollowers() {
        return this.followers;
    }

    getFollowing() {
        return this.following;
    }

    getTimeline() {
        return this.timeline;
    }

    addFollowing(username) {
        this.following.add(username);
    }

    addFollowers(username) {
        this.followers.add(username);
    }

    removeFollowing(username) {
        this.following.delete(username);
    }

    removeFollowers(username) {
        this.followers.delete(username);
    }

    hasFollowing(username) {
        return this.following.has(username);
    }

    hasFollowers(username) {
        return this.followers.has(username);
    }

    /**
     * Adds a new post to the user's info. If posts length is > NUMBER_OF_POSTS_TO_KEEP the oldest post is removed.
     * @param {*} post 
     */
    addPost(post) {
        addPostAndGarbageCollect(this.posts, post);
    }

    /**
     * Followers and followig sets are converted to arrays.
     * @returns Dictionary representing Info
     */
    toDict() {
        return {
            followers: Array.from(this.followers),
            following: Array.from(this.following),
            posts: this.posts,
        };
    }

    /**
     * Followers and following arrays are converted to sets.
     */
    fromJson(json) {
        this.followers = new Set(json.followers);
        this.following = new Set(json.following);
        this.posts = json.posts;
    }
}