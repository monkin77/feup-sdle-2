export class Info {
    constructor(info) {
        if (info) {
            this.fromJson(info);
        } else {
            this.followers = new Set();
            this.following = new Set();
            this.timeline = [];
        }
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

    addPost(post) {
        this.timeline.push(post);
    }

    /**
     * Followers and followig sets are converted to arrays.
     */
    toJson() {
        return {
            followers: Array.from(this.followers),
            following: Array.from(this.following),
            timeline: this.timeline,
        };
    }
    /**
     * Followers and followig arrays are converted to sets.
     */
    fromJson(json) {
        this.followers = new Set(json.followers);
        this.following = new Set(json.following);
        this.timeline = json.timeline;
    }
}