const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1', credentials:
    new AWS.Credentials(process.env.CF_AWS_ACCESS_KEY_ID, process.env.CF_AWS_SECRET_ACCESS_KEY)
});

const cf = new AWS.CloudFormation();
const herokuAppName = process.env.HEROKU_APP_NAME;
const baseQueueName = process.env.SQS_QUEUE_NAME;
const queueName = `${baseQueueName}-${herokuAppName}`;

const template = {
    Resources: {
        "MyAutoCreatedQueue": {
            Type: "AWS::SQS::Queue",
            Properties: {
                QueueName: queueName
            }
        }
    }
};

cf.createStack({
    StackName: herokuAppName,
    TemplateBody: JSON.stringify(template)
}, function (err) {
    if (err) {
        console.error(err, err.stack);
        throw new Error('Stack creation failed');
    } else {
        cf.waitFor('stackCreateComplete', {
            StackName: herokuAppName
        }, function (err) {
            if (err) {
                console.error(err, err.stack);
                throw new Error('Failed to wait for stack completion');
            }
        });

    }
});