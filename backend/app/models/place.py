from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Float, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Category(str, enum.Enum):
    bar = "bar"
    restaurant = "restaurant"
    cafe = "cafe"


class Source(str, enum.Enum):
    google = "google"
    foursquare = "foursquare"
    osm = "osm"


class Place(Base):
    __tablename__ = "places"
    __table_args__ = (UniqueConstraint("source", "external_id", name="uq_place_source_external"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[Category] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[Source] = mapped_column(nullable=False)
    external_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    user_places: Mapped[list[UserPlace]] = relationship(back_populates="place")


from app.models.user_place import UserPlace  # noqa: E402
