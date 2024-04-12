import json
import os
import requests
from bs4 import BeautifulSoup
import boto3
import logging
from redis import Redis
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

cache_endpoint = os.environ['REDIS_ENDPOINT']
service_port = 6379
redis_ttl = 90

def lambda_handler(event, context):
    try:
        # Check if 'queryStringParameters' exists in the event
        query_params = event.get('queryStringParameters')
        # Check if 'songName' exists in the query parameters
        song_name = query_params.get('songName') if query_params else None

        # case when song_name was not provided.
        if not song_name:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Song name is required'})
            }

        # works with lazy loading
        dynamodb = boto3.resource('dynamodb')

        # before searching in genius API, search in the aws redis cache
        # if the song is found in redis cache return the value of the key
        key = create_hash_key(song_name)

        # check in redis if the song is not found log it and proceed
        logger.info("generared hash: %s", key)
        logger.info("cache endpoint from cloudformation**** : %s", cache_endpoint)

        redis = Redis(host=cache_endpoint, port=service_port,
                       decode_responses=True)
                       
        song_info = redis.get(key)

        if song_info is not None:
            # If the song info is found in the cache, return it directly
            logger.info("***redis*** got data song_info: %s", song_info)
            return {
                'statusCode': 200,
                 'headers': {
                        'Access-Control-Allow-Origin': '*',  
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                        },
                'body': song_info
            }
        
        # Case when song not found in Redis, get it from Genius Platform.
        song_search_result = fetch_song_details(song_name)
        logger.info("Song search result: %s", song_search_result)

        # case when song result was not found.
        if not song_search_result:
            return {
                'statusCode': 404,
                 'headers': {
                        'Access-Control-Allow-Origin': '*',  # or specific origin
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                        },
                'body': json.dumps({'error': 'Song not found'})
            }

        # Define the attributes to extract
        attributes_to_extract = [
            "id",
            "title",
            "url",
            "artist_names",
            "full_title",
            "release_date_for_display",
            "header_image_thumbnail_url",
            "header_image_url",
            "song_art_image_thumbnail_url",
            "song_art_image_url"
        ]

        # Extract all required attributes at once
        song_info = parse_song_info(
            song_search_result, attributes_to_extract)

        url = song_info.get("url")

        song_lyrics = extract_lyrics(url)

        song_info["song_lyrics"] = song_lyrics

        #Store the song_info in Redis cache for next time retrieval
        logger.info(
            "****store redis**** next time retrieval song_info: %s", song_info)
        redis.set(key, json.dumps(song_info))

        #adding below two lines after deleting lambda from AWS - TTL part
        #Set TTL for the key (3 minutes)
        
        redis.expire(key, redis_ttl)  
        
        #store the song_info in db
        store_song_info(dynamodb, song_info, key)

        # push the song_id to SQS

        send_song_id_to_sqs(song_info["id"])

        # Prepare response
        return {
            'statusCode': 200,
            'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
             },
            'body': json.dumps(song_info)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # or specific origin
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
            'body': json.dumps({'error': str(e)})
        }


def store_song_info(dynamo_db_resource, song_info, key):
    table = dynamo_db_resource.Table('song_info')
    # put the song details into the table
    try:
        table.put_item(
            Item={
                "song_id": song_info["id"],
                "unq_song_key": key,
                "song_title": song_info["title"],
                "url": song_info["url"],
                "artist_names": song_info["artist_names"],
                "full_title": song_info["full_title"] if song_info["full_title"] is not None else '',
                "release_date_for_display": song_info["release_date_for_display"] if song_info["release_date_for_display"] is not None else '',
                "header_image_thumbnail_url": song_info["header_image_thumbnail_url"] if song_info["header_image_thumbnail_url"] is not None else '',
                "header_image_url": song_info["header_image_url"] if song_info["header_image_url"] is not None else '',
                "song_art_image_thumbnail_url": song_info["song_art_image_thumbnail_url"] if song_info["song_art_image_thumbnail_url"] is not None else '',
                "song_art_image_url": song_info["song_art_image_url"] if song_info["song_art_image_url"] is not None else '',
                "song_lyrics": song_info["song_lyrics"] if song_info["song_lyrics"] is not None else ''
            }
        )

        logger.info("Song saved success: %s", song_info["title"])
    except ClientError as err:
        error_message = f"Couldn't add song item {song_info['title']} to table {table.name}. Error: {err.response['Error']['Code']}: {err.response['Error']['Message']}"
        logger.error(error_message)
        # Reraise the exception to be caught by the lambda_handler
        raise Exception(error_message)


# function to get the song details by name from genius Platform.
# returns the song details JSON

def fetch_song_details(songName):
    url = "https://api.genius.com/search"
    params = dict(q=songName)

    print(params)

    access_token = "_bxXBsZfiQD-_Wp-Ghn6g-tEGjkujluJqf8Ponf_dgCObc5ThcyrEYTjljx69i7x"

    headers = {'Authorization': 'Bearer ' + access_token}
    try:

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors

    except requests.RequestException as e:
        print('Error:', e)

    return response.json()

# function used to get relevant info details by parsing the song JSON


def get_song_info_for_searched_song(songSearchResult, req_info_type):
    first_result = songSearchResult['response']['hits'][0]['result']
    return first_result[req_info_type]

# function used to parse the song info the JSON.


def parse_song_info(song_search_result, req_info_types):
    first_result = song_search_result.get('response', {}).get('hits', [{}])[
        0].get('result', {})
    return {info_type: first_result.get(info_type) for info_type in req_info_types}

# function is used to get the complete cleaned lyrics of the searched song


def extract_lyrics(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Combine potential lyric containers
        lyrics_containers = [soup.find('div', class_='lyrics-root-pin-spacer')] + \
            soup.find_all('div', class_=lambda x: x and x.startswith(
                'Lyrics__Container'))

        lyrics = ""
        for container in lyrics_containers:
            if container:
                # Iterate lines and accumulate lyrics
                for line in container.stripped_strings:
                    lyrics += line + "\n"

        # Remove trailing newline if any
        lyrics = lyrics.rstrip()

        if not lyrics:
            return None

        return lyrics

    except requests.RequestException as e:
        raise e


# function used to create a unique key to be stored in redis cache
def create_hash_key(searched_song_query):
    # Split the input string into words
    words = searched_song_query.split()
    # Convert each word to lowercase and join them with an underscore
    result = '#'.join(word.lower() for word in words)

    return result.strip()


def send_song_id_to_sqs(song_id):

    sqs = boto3.client('sqs')

    queue_url = os.environ['SQS_QUEUE_URL']
    
    sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=str(song_id)
    )
    print("sent song ID to SQS:", song_id)
