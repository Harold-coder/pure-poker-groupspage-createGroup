const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const groupsTableName = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
    const { groupId, membersList, maxMembers } = JSON.parse(event.body);

    // Check if groupId is provided
    if (!groupId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'groupId is required', action: 'createGroup' }) };
    }

    // Check if maxMembers is provided and is a number
    if (!maxMembers || typeof maxMembers !== 'number') {
        return { statusCode: 400, body: JSON.stringify({ message: 'maxMembers is required and must be a number', action: 'createGroup' }) };
    }

    const newGroup = {
        groupId: groupId,
        usersConnected: [],
        messages: [],
        membersList: membersList || [],
        maxMembers: maxMembers
    };

    try {
        await dynamoDb.put({ TableName: groupsTableName, Item: newGroup }).promise();
        return { statusCode: 200, body: JSON.stringify({ message: 'Group created successfully.', action: 'createGroup', groupId: groupId }) };
    } catch (err) {
        console.error('Error creating group:', err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Failed to create group', action: 'createGroup' }) };
    }
};
