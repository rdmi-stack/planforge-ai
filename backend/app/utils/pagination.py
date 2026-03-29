"""Pagination helpers for offset-based and cursor-based pagination."""

import math
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession


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
class PaginatedResult[T]:
    """Result container with pagination metadata."""

    items: list[T]
    total: int
    page: int
    per_page: int

    @property
    def total_pages(self) -> int:
        return math.ceil(self.total / self.per_page) if self.per_page > 0 else 0

    def to_meta(self) -> dict:
        """Return pagination metadata for API responses."""
        return {
            "page": self.page,
            "per_page": self.per_page,
            "total": self.total,
            "total_pages": self.total_pages,
        }


async def paginate(
    db: AsyncSession,
    query: Select,
    params: PaginationParams,
) -> PaginatedResult:
    """Apply offset-based pagination to a SQLAlchemy select query.

    Executes a count query and the paginated data query.
    Returns a PaginatedResult with items and metadata.
    """
    # Count total matching rows
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Fetch paginated rows
    paginated_query = query.offset(params.offset).limit(params.per_page)
    result = await db.execute(paginated_query)
    items = list(result.scalars().all())

    return PaginatedResult(
        items=items,
        total=total,
        page=params.page,
        per_page=params.per_page,
    )


@dataclass
class CursorParams:
    """Parameters for cursor-based pagination."""

    cursor: UUID | None = None
    limit: int = 20

    def __post_init__(self) -> None:
        self.limit = min(max(1, self.limit), 100)


@dataclass
class CursorResult[T]:
    """Result container for cursor-based pagination."""

    items: list[T]
    next_cursor: UUID | None
    has_more: bool
