'use strict';
const https = require('https');
const querystring = require('querystring');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();







exports.uploadFile = async (event, context, callback) => {

    const resp = await s3.getObject({
        Bucket: 'outcomespdf-clinical',
        Key: 'public/test.pdf'
    }).promise();

    const file = resp.Body;
    
    console.log(file);

    const API_BASE = 'drchrono.com';
    const headers = {
        'Authorization': 'Bearer WbYe9Gv2gkd4zUboft4rrTWoZClsma',
        'ContentType': 'multipart/form-data'
        // Maybe need content-length
    };
    const url = `https://drchrono.com/api/documents`;
    const data = {
        doctor: 239411,
        patient: 81005118,
        description: 'test',
        date: '2019-10-04',
        document: file

    };

    const options = {
        method: 'POST',
        host: API_BASE,
        path: '/api/documents',
        headers: headers
    };

    console.log('sending request');
    var req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });

        return callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/pdf'
            },
            body: 'test'
        });
    });
    /*
    const files = {'document': file}
    var form = req.form();
    form.append('document', file, {
        filename: 'test.pdf',
        contentType: 'application/pdf'
    })*/

    req.on('error', (e) => {
        console.error('request errored', e);

        return callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/pdf'
            },
            body: 'test'
        });
    });

    //req.write(querystring.stringify(data));
    req.write(file);
    req.end();



    



}

