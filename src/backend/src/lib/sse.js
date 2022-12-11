/**
 * Send SSE Response to Web Client with the proper SSE format 
 * More info about SSE (https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app)
 * @param {*} res Express Response object
 * @param {string} data data in JSON format 
 */
export const sendSseResponse = (res, data) => {
    const formattedData = `data: ${data}\n\n`;
    res.write(formattedData);
};