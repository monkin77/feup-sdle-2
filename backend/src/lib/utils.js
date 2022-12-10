/**
 * @param error errorMsg in case of error. Otherwise null
 * @param data data to be returned upon success
 * @Returns Response with structure {error: error, data: data}. 
 */
export const buildStatusRes = (error, data) => {
    return {error, data};
};