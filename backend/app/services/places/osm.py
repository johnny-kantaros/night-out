import httpx

from app.models.place import Category, Source
from app.services.places.providers import PlaceCandidate, PlaceProvider

_AMENITY_MAP: dict[str, Category] = {
    "restaurant": Category.restaurant,
    "bar": Category.bar,
    "pub": Category.bar,
    "cafe": Category.cafe,
}


class OSMProvider(PlaceProvider):
    """Nominatim-based OSM search. No API key required; rate-limited to 1 req/s."""

    source = Source.osm
    _BASE = "https://nominatim.openstreetmap.org"
    _HEADERS = {"User-Agent": "NightOut/0.1 (contact@example.com)"}

    async def search(
        self, query: str, lat: float, lng: float, radius_m: int = 1000
    ) -> list[PlaceCandidate]:
        async with httpx.AsyncClient(headers=self._HEADERS) as client:
            resp = await client.get(
                f"{self._BASE}/search",
                params={
                    "q": query,
                    "format": "jsonv2",
                    "addressdetails": 1,
                    "extratags": 1,
                    "limit": 10,
                    "viewbox": self._viewbox(lat, lng, radius_m),
                    "bounded": 1,
                },
                timeout=10,
            )
            resp.raise_for_status()
            return [c for r in resp.json() if (c := self._to_candidate(r)) is not None]

    async def get_details(self, external_id: str) -> PlaceCandidate | None:
        async with httpx.AsyncClient(headers=self._HEADERS) as client:
            resp = await client.get(
                f"{self._BASE}/lookup",
                params={"osm_ids": external_id, "format": "jsonv2", "addressdetails": 1, "extratags": 1},
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json()
            return self._to_candidate(results[0]) if results else None

    def _to_candidate(self, data: dict) -> PlaceCandidate | None:
        amenity = data.get("extratags", {}).get("amenity") or data.get("type", "")
        category = _AMENITY_MAP.get(amenity)
        if not category:
            return None

        addr = data.get("address", {})
        address = ", ".join(
            p for p in [addr.get("road", ""), addr.get("city", ""), addr.get("state", "")] if p
        )
        osm_type = data.get("osm_type", "node")
        prefix = {"node": "N", "way": "W", "relation": "R"}.get(osm_type, "N")
        return PlaceCandidate(
            external_id=f"{prefix}{data['osm_id']}",
            source=self.source,
            name=data.get("name", data.get("display_name", "")),
            lat=float(data["lat"]),
            lng=float(data["lon"]),
            category=category,
            address=address,
            phone=data.get("extratags", {}).get("phone"),
            website=data.get("extratags", {}).get("website"),
        )

    def _viewbox(self, lat: float, lng: float, radius_m: int) -> str:
        deg = radius_m / 111_000
        return f"{lng - deg},{lat + deg},{lng + deg},{lat - deg}"
