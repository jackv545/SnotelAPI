const isDev = false;
const baseUrl = isDev ? 'http://localhost:3001' : 'https://snotel-api.herokuapp.com';

export function sendServerRequest(requestType) {
    const restfulAPI = `${baseUrl}/api/${requestType}`;
    const requestOptions = {
        method: "GET"
    };
    return processRestfulAPI(restfulAPI, requestOptions);
}

export function sendServerRequestWithBody(requestBody) {
    const restfulAPI = `${baseUrl}/api/${requestBody.requestType}`;
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(requestBody)
    };

    return processRestfulAPI(restfulAPI, requestOptions);
}

async function processRestfulAPI(restfulAPI, requestOptions) {
    try {
        let response = await fetch(restfulAPI, requestOptions);
        return {
            statusCode: response.status,
            statusText: response.statusText,
            body: await response.json()
        };
    }
    catch(err) {
        console.error(err);
        return { statusCode: 0, statusText: 'Client failure', body: null };
    }
}
