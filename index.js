const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

const sqs = new AWS.SQS();
const sqsBaseUrl = process.env.SQS_BASE_URL;

const herokuAppName = process.env.HEROKU_APP_NAME;
const baseQueueName = process.env.SQS_QUEUE_NAME;

let queueName = baseQueueName;
if (herokuAppName) {
    queueName = `${queueName}-${herokuAppName}`;
}

const queueUrl = `${sqsBaseUrl}/${queueName}`;

const receiveParams = {
    QueueUrl: queueUrl,
    WaitTimeSeconds: 2
};

function postMessage() {
    sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: `This is a test message sent at ${new Date()}`
    }, logError)
}

function receiveMessage() {
    sqs.receiveMessage(receiveParams, function(err, data) {
        if (err) {
            console.error(err, err.stack);
        } else if (data && data.Messages && data.Messages.length) {
            data.Messages.forEach(processIndividualMessage);
        }

        setImmediate(receiveMessage);
    });
}

function deleteMessage(message) {
    sqs.deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
    }, logError);
}

function processIndividualMessage(message) {
    console.log(message.Body);
    deleteMessage(message);
}

function logError(err) {
    if (err) {
        console.error(err, err.stack);
    }
}

setInterval(postMessage, 1000);
receiveMessage();

