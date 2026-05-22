from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
