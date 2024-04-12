import requests
import boto3

def fetch_song_meta_data(song_id):
    url = f"https://api.genius.com/songs/{song_id}"
    
    access_token = "SECRET"

    headers = {'Authorization': 'Bearer ' + access_token}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.RequestException as e:
        print('Error:', e)

    return response.json()

def parse_song_info(song_search_result, req_info_types):
    first_result = song_search_result.get('response', {}).get('song', {})
    return {info_type: first_result.get(info_type) for info_type in req_info_types}

def update_dynamodb_entry(song_id, new_attributes):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('song_info')

    try:
        response = table.update_item(
            Key={'song_id': song_id},
            UpdateExpression='SET apple_music_id = :val1, apple_music_player_url = :val2, youtube_watch_url = :val3',
            ExpressionAttributeValues={':val1': new_attributes.get('apple_music_id', ''),
                                        ':val2': new_attributes.get('apple_music_player_url', ''),
                                        ':val3': new_attributes.get('youtube_watch_url', '')},
            ReturnValues='UPDATED_NEW'
        )
        print("DynamoDB Update Response:", response)
    except Exception as e:
        print("Error updating DynamoDB entry:", e)

def lambda_handler(event, context):
    
    # Get the SQS record from the event
    sqs_record = event['Records'][0]
    # Extract the song_id as int from the SQS record
    song_id = int(sqs_record['body'])
    
    print("*** got SQS song id " + str(song_id))
    song_search_result = fetch_song_meta_data(song_id)
    song_meta_info = parse_song_info(song_search_result, ["apple_music_id", "apple_music_player_url"])
    media_info = parse_song_info(song_search_result, ["media"])

    if media_info is not None and "media" in media_info:
        media = media_info["media"]
        youtube_watch_url = media[0]["url"] if media else ''
    else:
        youtube_watch_url = ''

    print("video url: " + youtube_watch_url)

    song_meta_info["youtube_watch_url"] = youtube_watch_url
    
    print("**going to update the dynamodb table for song id: " + str(song_id))
    # Update DynamoDB entry with existing attributes
    update_dynamodb_entry(song_id, song_meta_info)
    
    print(song_meta_info)

    return {
        'statusCode': 200,
        'body': 'Successfully fetched song metadata and update dynamodb info.'
    }
