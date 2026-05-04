from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.models.place import Category, Source


@dataclass
class PlaceCandidate:
    external_id: str
    source: Source
    name: str
    lat: float
    lng: float
    category: Category
    address: str
    phone: str | None = field(default=None)
    website: str | None = field(default=None)
    rating: float | None = field(default=None)


class PlaceProvider(ABC):
    source: Source

    @abstractmethod
    async def search(
        self, query: str, lat: float, lng: float, radius_m: int = 1000
    ) -> list[PlaceCandidate]: ...

    @abstractmethod
    async def get_details(self, external_id: str) -> PlaceCandidate | None: ...
