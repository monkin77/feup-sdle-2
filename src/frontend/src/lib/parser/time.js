const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_MONTH = MS_PER_DAY * 30;
const MS_PER_YEAR = MS_PER_DAY * 365;

export const timeAgo = (timestamp) => {
    const elapsed = Date.now() - timestamp;

    if (elapsed < MS_PER_SECOND) {
        return "just now";
    }
    else if (elapsed < MS_PER_MINUTE) {
        const seconds = Math.round(elapsed / 1000);
        if (seconds === 1) {
            return `${seconds} second ago`;
        }
        return `${seconds} seconds ago`;
    }

    else if (elapsed < MS_PER_HOUR) {
        const minutes = Math.round(elapsed / MS_PER_MINUTE);
        if (minutes === 1) {
            return `${minutes} minute ago`;
        }
        return `${minutes} minutes ago`;
    }

    else if (elapsed < MS_PER_DAY ) {
        const hours = Math.round(elapsed / MS_PER_HOUR);
        if (hours === 1) {
            return `${hours} hour ago`;
        }
        return `${hours} hours ago`;
    }

    else if (elapsed < MS_PER_MONTH) {
        const days = Math.round(elapsed / MS_PER_DAY);
        if (days === 1) {
            return `${days} day ago`;
        }
        return `${days} days ago`; 
    }

    else if (elapsed < MS_PER_YEAR) {
        const months = Math.round(elapsed / MS_PER_MONTH);
        if (months === 1) {
            return `${months} month ago`;
        }
        return `${months} months ago`; 
    }

    else {
        const years = Math.round(elapsed / MS_PER_YEAR);
        if (years === 1) {
            return `${years} year ago`;
        }
        return `${years} years ago`;
    }
};
