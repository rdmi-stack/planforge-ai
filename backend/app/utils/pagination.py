"""Pagination helpers for list-like Beanie query results."""

import math
from dataclasses import dataclass
from typing import Generic, Sequence, TypeVar

T = TypeVar("T")


@dataclass
class PaginationParams:
    """Parameters for offset-based pagination."""

    page: int = 1
    per_page: int = 20

    def __post_init__(self) -> None:
        self.page = max(1, self.page)
        self.per_page = min(max(1, self.per_page), 100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page


@dataclass
class PaginatedResult(Generic[T]):
    """Result container with pagination metadata."""

    items: list[T]
    total: int
    page: int
    per_page: int

    @property
    def total_pages(self) -> int:
        return math.ceil(self.total / self.per_page) if self.per_page > 0 else 0

    def to_meta(self) -> dict[str, int]:
        return {
            "page": self.page,
            "per_page": self.per_page,
            "total": self.total,
            "total_pages": self.total_pages,
        }


def paginate_items(items: Sequence[T], params: PaginationParams) -> PaginatedResult[T]:
    """Paginate an in-memory sequence.

    This keeps pagination utilities database-agnostic for the current Beanie
    stack and still matches the response shape used by the API.
    """
    total = len(items)
    paginated = list(items[params.offset : params.offset + params.per_page])
    return PaginatedResult(
        items=paginated,
        total=total,
        page=params.page,
        per_page=params.per_page,
    )


@dataclass
class CursorParams:
    """Parameters for cursor-based pagination."""

    cursor: str | None = None
    limit: int = 20

    def __post_init__(self) -> None:
        self.limit = min(max(1, self.limit), 100)


@dataclass
class CursorResult(Generic[T]):
    """Result container for cursor-based pagination."""

    items: list[T]
    next_cursor: str | None
    has_more: bool
