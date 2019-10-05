'use strict';
const https = require('https');

const API_BASE = 'drchrono.com';

function getRequest(host, path, headers) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: host,
            path: path,
            headers: headers
        }

        const request = https.get(options, res => {
            let response = []
            res.on('data', chunk => {
                response.push(chunk);
                console.log('CHUNK: ', chunk);
            })
            res.on('end', () => resolve(response.join('')))
            res.on('error', reject)
        })
    })
}

async function sendPatientInformationRequest(accessToken, firstName, lastName, dob) {
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };
    const path = `/api/patients?first_name=${firstName}&last_name=${lastName}&date_of_birth=${dob}`
    const response = await getRequest(API_BASE, path, headers);
    const data = JSON.parse(response);
    console.log('DATA: ', data);
    return data;
}

exports.getPatientInformation = async (event, context, callback) => {
    const accessToken = event.queryStringParameters.accessToken;
    const firstName = event.queryStringParameters.firstName;
    const lastName = event.queryStringParameters.lastName;
    const year = event.queryStringParameters.year;
    const month = event.queryStringParameters.month;
    const day = event.queryStringParameters.day;
    const dob = `${year}-${month}-${day}`

    console.log('EVENT PARAMS: ', event.queryStringParameters);

    if (!accessToken) {
        return callback(null, {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Access token was not specified' })
        });
    }

    try {
        const res = await sendPatientInformationRequest(accessToken, firstName, lastName, dob);
        return callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/html'
            },
            body: JSON.stringify(res)
        })
    } catch (e) {
        console.log(e);
        return callback(null, {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: e.message})
        })
    }



};