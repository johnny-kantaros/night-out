import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    display_name: str
    avatar_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
