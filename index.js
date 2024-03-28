const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const groupsTableName = process.env.GROUPS_TABLE;

const { v4: uuidv4 } = require('uuid'); // Ensure you have uuid installed in your lambda environment

exports.handler = async (event) => {
    const { groupName, maxMembers, creatorId } = JSON.parse(event.body);

    const headersTemplate = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }  

    if (!groupName) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'groupName is required', action: 'createGroup' }),
            headers: headersTemplate
        };
    }

    // First, check if a group with the same groupName already exists
    const existingGroupQuery = await dynamoDb.scan({
        TableName: groupsTableName,
        FilterExpression: "groupName = :groupName",
        ExpressionAttributeValues: { ":groupName": groupName }
    }).promise();

    if (existingGroupQuery.Items.length > 0) {
        // Group name already exists, return an error
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'Group name already exists. Please choose a different name.' }),
            headers: headersTemplate
        };
    }

    if (!maxMembers || typeof maxMembers !== 'number') {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'maxMembers is required and must be a number', action: 'createGroup' }),
            headers: headersTemplate
        };
    }

    if (!creatorId) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'creatorId is required', action: 'createGroup' }),
            headers: headersTemplate
        };
    }

    const groupId = uuidv4(); // Generate a unique ID for the group

    const newGroup = {
        groupId,
        groupName,
        usersConnected: [],
        messages: [],
        membersList: [creatorId],
        maxMembers
    };

    try {
        await dynamoDb.put({ TableName: groupsTableName, Item: newGroup }).promise();
        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Group created successfully.', action: 'createGroup', groupId, groupName }),
            headers: headersTemplate
        };
    } catch (err) {
        console.error('Error creating group:', err);
        return { 
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create group', action: 'createGroup' }),
            headers: headersTemplate
        };
    }
};