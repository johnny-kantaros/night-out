import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.place import Category, Source


class PlaceSearchResult(BaseModel):
    external_id: str
    source: Source
    name: str
    lat: float
    lng: float
    category: Category
    address: str
    phone: str | None = None
    website: str | None = None
    rating: float | None = None


class AddPlaceRequest(BaseModel):
    source: Source
    external_id: str


class PlaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    lat: float
    lng: float
    category: Category
    address: str
    phone: str | None
    website: str | None
    source: Source
    external_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPlaceResponse(BaseModel):
    id: uuid.UUID
    place: PlaceResponse
    rating: float | None
    notes: str | None
    visited: bool
    want_to_visit: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RatePlaceRequest(BaseModel):
    rating: float
    notes: str | None = None
    visited: bool = True
