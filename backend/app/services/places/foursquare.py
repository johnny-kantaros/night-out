import httpx

from app.models.place import Category, Source
from app.services.places.providers import PlaceCandidate, PlaceProvider

# Foursquare top-level category IDs → internal category
_CATEGORY_MAP: dict[str, Category] = {
    "13065": Category.restaurant,
    "13003": Category.bar,
    "13032": Category.cafe,
}

_FIELDS = "fsq_id,name,geocodes,categories,location,tel,website,rating"


class FoursquareProvider(PlaceProvider):
    source = Source.foursquare
    _BASE = "https://api.foursquare.com/v3"

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    @property
    def _headers(self) -> dict[str, str]:
        return {"Authorization": self._api_key, "Accept": "application/json"}

    async def search(
        self, query: str, lat: float, lng: float, radius_m: int = 1000
    ) -> list[PlaceCandidate]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self._BASE}/places/search",
                headers=self._headers,
                params={"query": query, "ll": f"{lat},{lng}", "radius": radius_m, "fields": _FIELDS},
                timeout=10,
            )
            resp.raise_for_status()
            return [self._to_candidate(r) for r in resp.json().get("results", [])]

    async def get_details(self, external_id: str) -> PlaceCandidate | None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self._BASE}/places/{external_id}",
                headers=self._headers,
                params={"fields": _FIELDS},
                timeout=10,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return self._to_candidate(resp.json())

    def _to_candidate(self, data: dict) -> PlaceCandidate:
        category = Category.restaurant
        for c in data.get("categories", []):
            if str(c.get("id")) in _CATEGORY_MAP:
                category = _CATEGORY_MAP[str(c["id"])]
                break

        geo = data.get("geocodes", {}).get("main", {})
        loc = data.get("location", {})
        address = ", ".join(
            p for p in [loc.get("address", ""), loc.get("locality", ""), loc.get("region", "")] if p
        )
        return PlaceCandidate(
            external_id=data["fsq_id"],
            source=self.source,
            name=data.get("name", ""),
            lat=geo.get("latitude", 0.0),
            lng=geo.get("longitude", 0.0),
            category=category,
            address=address,
            phone=data.get("tel"),
            website=data.get("website"),
            rating=data.get("rating"),
        )
