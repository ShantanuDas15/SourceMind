from pydantic import BaseModel, HttpUrl

class IngestRequest(BaseModel):
    url: HttpUrl
    session_id: str = "sourcemind_default"
