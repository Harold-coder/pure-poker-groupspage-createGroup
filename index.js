const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const groupsTableName = process.env.GROUPS_TABLE;

const { v4: uuidv4 } = require('uuid'); // Ensure you have uuid installed in your lambda environment

exports.handler = async (event) => {
    const { groupName, maxMembers, creatorId } = JSON.parse(event.body);

    if (!groupName) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'groupName is required', action: 'createGroup' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
        };
    }

    if (!maxMembers || typeof maxMembers !== 'number') {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'maxMembers is required and must be a number', action: 'createGroup' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
        };
    }

    if (!creatorId) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'creatorId is required', action: 'createGroup' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
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
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
        };
    } catch (err) {
        console.error('Error creating group:', err);
        return { 
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create group', action: 'createGroup' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
        };
    }
};