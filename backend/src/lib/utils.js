const NO_FILE_ERROR_MSG = "Error: ENOENT: no such file or directory";

/**
 * @param error errorMsg in case of error. Otherwise null
 * @param data data to be returned upon success
 * @Returns Response with structure {error: error, data: data}. 
 */
export const buildStatusRes = (error, data) => {
    return {error, data};
};

/**
 * Function to parse Error message
 * @param {*} error error message
 * @returns If its a No File Error, return {status: 404, error: errorMsg}. Otherwise, return {status: 500, error: errorMsg}
 */
export const parseError = (error) => {
    // parse error, split into , and get the first part
    const errorMsg = error.toString().split(",")[0];
    if (errorMsg == NO_FILE_ERROR_MSG) {
        return { status: 404, error: errorMsg };
    }
    
    return { status: 500, error: errorMsg };
};