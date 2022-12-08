const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_MONTH = MS_PER_DAY * 30;
const MS_PER_YEAR = MS_PER_DAY * 365;

export const timeAgo = (timestamp) => {
    const elapsed = Date.now() - timestamp;

    if (elapsed < MS_PER_MINUTE) {
        return `${Math.round(elapsed / 1000)}s`;
    }

    else if (elapsed < MS_PER_HOUR) {
        return `${Math.round(elapsed / MS_PER_MINUTE)}min`;   
    }

    else if (elapsed < MS_PER_DAY ) {
        return `${Math.round(elapsed / MS_PER_HOUR)}h`;   
    }

    else if (elapsed < MS_PER_MONTH) {
        return `${Math.round(elapsed / MS_PER_DAY)}d`;   
    }

    else if (elapsed < MS_PER_YEAR) {
        return `${Math.round(elapsed / MS_PER_MONTH)}mo`; 
    }

    else {
        return `${Math.round(elapsed / MS_PER_MONTH)}y`; 
    }
};
