'use strict';
const https = require('https');

const API_BASE = 'drchrono.com';
const CLIENT_ID = 'DRVl2hMImEM5NwF6Zfb4LvUKeEqAnzgUFGDWY9ho';
const CLIENT_SECRET = 'HVfXUtrZ5SBrO8LZUkFdHN2mSIY2gip3sVfrE0KkHUrzjzcVjQunHCdMQ9BzXtC72iMK1ImS90WWGw5XyTlmyqBcPNfhAKiqJU0oMtqzshmnsl7TpFRo4KLUC49Fmhkx';
const REDIRECTURI = 'http://localhost:8100';

function postRequest(host, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'post',
      host: host,
      path: path,
      headers: {
        'Content-Length': body.length,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const request = https.request(options, res => {
      res.setEncoding('utf8')
      let response = []
      res.on('data', chunk => response.push(chunk))
      res.on('end', () => resolve(response.join('')))
      res.on('error', reject)
    })

    request.write(body)
  })
}

async function exchangeCodeForToken(code, redirectUri) {
  const body = `grant_type=authorization_code&code=${code}&client_id=${CLIENT_ID}&`
    + `client_secret=${CLIENT_SECRET}&redirect_uri=${redirectUri}`;
  const response = await postRequest(API_BASE, `/o/token/`, body);
  const data = JSON.parse(response)

  return data;
}

async function refreshAToken(refreshToken) {
  const body = `grant_type=refresh_token&client_id=${CLIENT_ID}&`
    + `client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}`;
  const response = await postRequest(API_BASE, `/o/token/`, body);
  const data = JSON.parse(response)

  return data;
}

exports.getToken = async (event, context, callback) => {
  const code = event.queryStringParameters.code;
  const refreshToken = event.queryStringParameters.refreshToken;

  if (!code && !refreshToken) {
    return callback(null, {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({ message: 'Code or refresh token was not specified' })
    });
  }

  try {
    let res;
    if (code) {
      res = await exchangeCodeForToken(code, REDIRECTURI);
    } else {
      res = await refreshAToken(refreshToken);
    }
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'text/html'
      },
      body: JSON.stringify(res)
    })
  } catch (e) {
    return callback(null, {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: e.message })
    });
  }

  // callback(null, {
  //   statusCode: 200,
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Credentials': 'true',
  //   },
  //   body: JSON.stringify(response)
  // });
}

