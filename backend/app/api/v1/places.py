import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.place import Place
from app.models.user import User
from app.models.user_place import UserPlace
from app.schemas.place import (
    AddPlaceRequest,
    PlaceSearchResult,
    RatePlaceRequest,
    UserPlaceResponse,
)
from app.services.places.resolver import PlaceResolver

router = APIRouter()


@router.get("/search", response_model=list[PlaceSearchResult])
async def search_places(
    q: str = Query(..., min_length=1),
    lat: float = Query(...),
    lng: float = Query(...),
    _: User = Depends(get_current_user),
    resolver: PlaceResolver = Depends(PlaceResolver.from_settings),
):
    return await resolver.search(q, lat, lng)


@router.post("", response_model=UserPlaceResponse, status_code=201)
async def add_place(
    body: AddPlaceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    resolver: PlaceResolver = Depends(PlaceResolver.from_settings),
):
    place = await resolver.resolve_and_upsert(body.source, body.external_id, db)

    existing = await db.execute(
        select(UserPlace).where(
            UserPlace.user_id == current_user.id,
            UserPlace.place_id == place.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Place already in your list")

    user_place = UserPlace(user_id=current_user.id, place_id=place.id)
    db.add(user_place)
    await db.commit()
    await db.refresh(user_place)

    result = await db.execute(
        select(UserPlace)
        .where(UserPlace.id == user_place.id)
        .options(selectinload(UserPlace.place))
    )
    return result.scalar_one()


@router.get("", response_model=list[UserPlaceResponse])
async def list_my_places(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserPlace)
        .where(UserPlace.user_id == current_user.id)
        .options(selectinload(UserPlace.place))
        .order_by(UserPlace.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{user_place_id}/rating", response_model=UserPlaceResponse)
async def rate_place(
    user_place_id: uuid.UUID,
    body: RatePlaceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserPlace)
        .where(UserPlace.id == user_place_id, UserPlace.user_id == current_user.id)
        .options(selectinload(UserPlace.place))
    )
    user_place = result.scalar_one_or_none()
    if not user_place:
        raise HTTPException(status_code=404, detail="Not found")

    user_place.rating = body.rating
    user_place.notes = body.notes
    user_place.visited = body.visited
    await db.commit()
    await db.refresh(user_place)
    return user_place
