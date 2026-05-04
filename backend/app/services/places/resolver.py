import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.place import Place, Source
from app.services.places.foursquare import FoursquareProvider
from app.services.places.google import GooglePlacesProvider
from app.services.places.osm import OSMProvider
from app.services.places.providers import PlaceCandidate, PlaceProvider


class PlaceResolver:
    def __init__(self, providers: list[PlaceProvider]) -> None:
        self._providers: dict[Source, PlaceProvider] = {p.source: p for p in providers}

    @classmethod
    def from_settings(cls) -> "PlaceResolver":
        providers: list[PlaceProvider] = []
        if settings.GOOGLE_PLACES_API_KEY:
            providers.append(GooglePlacesProvider(settings.GOOGLE_PLACES_API_KEY))
        if settings.FOURSQUARE_API_KEY:
            providers.append(FoursquareProvider(settings.FOURSQUARE_API_KEY))
        if settings.ENABLE_OSM:
            providers.append(OSMProvider())
        return cls(providers)

    async def search(self, query: str, lat: float, lng: float) -> list[PlaceCandidate]:
        results = await asyncio.gather(
            *(p.search(query, lat, lng) for p in self._providers.values()),
            return_exceptions=True,
        )
        candidates: list[PlaceCandidate] = []
        for r in results:
            if isinstance(r, list):
                candidates.extend(r)
        return candidates

    async def resolve_and_upsert(
        self, source: Source, external_id: str, db: AsyncSession
    ) -> Place:
        existing = await db.execute(
            select(Place).where(Place.source == source, Place.external_id == external_id)
        )
        place = existing.scalar_one_or_none()
        if place:
            return place

        provider = self._providers.get(source)
        if not provider:
            raise ValueError(f"No provider configured for source: {source}")

        candidate = await provider.get_details(external_id)
        if not candidate:
            raise ValueError(f"Place not found: {source}/{external_id}")

        place = Place(
            name=candidate.name,
            lat=candidate.lat,
            lng=candidate.lng,
            category=candidate.category,
            address=candidate.address,
            phone=candidate.phone,
            website=candidate.website,
            source=candidate.source,
            external_id=candidate.external_id,
        )
        db.add(place)
        await db.flush()
        return place
