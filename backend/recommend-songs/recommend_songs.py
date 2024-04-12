import boto3
import random
import json
from decimal import Decimal


def lambda_handler(event, context):
    try:
        # Initialize DynamoDB client
        print("goint to get dynamodb res")
        dynamodb = boto3.resource('dynamodb')

        print("reading table...")

        # Get reference to the table
        table = dynamodb.Table('song_info')

        print("scanning table..")

        # Scan the table to get all items
        response = table.scan()

        # Get all items
        items = response['Items']

        # Convert Decimal objects to int or float
        for item in items:
            for key, value in item.items():
                if isinstance(value, Decimal):
                    item[key] = int(value)

        # Check if there are less than 8 entries
        if len(items) < 8:
            # If there are less than 8 entries, return all entries
            selected_entries_list = items
        else:
            # Randomly select 8 entries
            selected_entries = random.sample(items, 8)

            # Extract relevant information and put them in a list
            selected_entries_list = selected_entries

        # Prepare response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                    },
            'body': json.dumps(selected_entries_list)
        }

    except Exception as e:
        print("error occurred during fetching recommended songs: ", e)
        # Handle the case where the table does not exist
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
            'body': json.dumps({'error': str(e)})
        }
