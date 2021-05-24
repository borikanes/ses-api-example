var AWS = require('aws-sdk');
var { v4: uuidv4 } = require('uuid');

// 1. Database and AWS connection setup
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient();

// 2. Entry point for Lambda function
exports.handler = async (event) => {
    if (event.path && event.path === '/customers') { // 3. Check to see what url path is coming in.

        if (event.httpMethod === 'GET') { // 4. Check if the method for the /customers path is GET
            const params = {
                TableName: 'ses-example'
            };
            const items = await dynamoScan(params); // 5. get all customer "items" from database

            return { statusCode: 200, body: JSON.stringify(items) } // 6. Return response to caller/client
        } else if (event.httpMethod === 'POST') { // 7. Check if the http method

            let payload = JSON.parse(event.body); // 8. Convert payload from request to JSON object
            payload["id"] = uuidv4(); // 9. Generate a random id and assign it to the id field in the payload

            const params = {
                TableName: 'ses-example',
                Item: payload // 10. Attach payload to Dynamo database config
            };

            await documentClient.put(params).promise(); // 11. Write payload to Database
            return { statusCode: 201, body: JSON.stringify(payload) }; // 12. Return 201 success response
        }
    }
    return { statusCode: 404, body: "Path doesn't exist" } // 12. Return 404 path not found response
}

// 13. Function to get all items from Database
async function dynamoScan(params) {
    let allItems = [];
    let items;
    do {
        items = await documentClient.scan(params).promise();
        // console.log(`${JSON.stringify(items)}`);
        items.Items.forEach( (item) => {
            allItems.push(item)
        });
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== 'undefined');

    return allItems;
}