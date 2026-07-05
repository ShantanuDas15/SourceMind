import re
import asyncio
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url: str) -> str:
    # # ponytail: simple regex for standard youtube URLs
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if match:
        return match.group(1)
    raise ValueError("Could not extract YouTube video ID from URL")

async def fetch_youtube_transcript(url: str) -> str:
    video_id = extract_video_id(url)
    try:
        # # ponytail: offload synchronous network call to thread
        transcript = await asyncio.to_thread(YouTubeTranscriptApi.get_transcript, video_id)
        return " ".join([t['text'] for t in transcript])
    except Exception as e:
        raise ValueError(f"Could not fetch transcript: {str(e)}")
