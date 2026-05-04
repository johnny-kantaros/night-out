import httpx

from app.models.place import Category, Source
from app.services.places.providers import PlaceCandidate, PlaceProvider

_CATEGORY_MAP: dict[str, Category] = {
    "restaurant": Category.restaurant,
    "bar": Category.bar,
    "cafe": Category.cafe,
    "coffee_shop": Category.cafe,
}

_FIELD_MASK = (
    "places.id,places.displayName,places.location,places.primaryType,"
    "places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating"
)
_DETAIL_MASK = _FIELD_MASK.replace("places.", "")


class GooglePlacesProvider(PlaceProvider):
    source = Source.google
    _BASE = "https://places.googleapis.com/v1"

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    async def search(
        self, query: str, lat: float, lng: float, radius_m: int = 1000
    ) -> list[PlaceCandidate]:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._BASE}/places:searchText",
                headers={"X-Goog-Api-Key": self._api_key, "X-Goog-FieldMask": _FIELD_MASK},
                json={
                    "textQuery": query,
                    "locationBias": {
                        "circle": {
                            "center": {"latitude": lat, "longitude": lng},
                            "radius": float(radius_m),
                        }
                    },
                },
                timeout=10,
            )
            resp.raise_for_status()
            return [self._to_candidate(p) for p in resp.json().get("places", [])]

    async def get_details(self, external_id: str) -> PlaceCandidate | None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self._BASE}/places/{external_id}",
                headers={"X-Goog-Api-Key": self._api_key, "X-Goog-FieldMask": _DETAIL_MASK},
                timeout=10,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return self._to_candidate(resp.json())

    def _to_candidate(self, data: dict) -> PlaceCandidate:
        loc = data.get("location", {})
        return PlaceCandidate(
            external_id=data["id"],
            source=self.source,
            name=data.get("displayName", {}).get("text", ""),
            lat=loc.get("latitude", 0.0),
            lng=loc.get("longitude", 0.0),
            category=_CATEGORY_MAP.get(data.get("primaryType", ""), Category.restaurant),
            address=data.get("formattedAddress", ""),
            phone=data.get("nationalPhoneNumber"),
            website=data.get("websiteUri"),
            rating=data.get("rating"),
        )
