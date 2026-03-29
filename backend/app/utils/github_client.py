"""GitHub API wrapper for repository analysis and codebase context extraction."""

from dataclasses import dataclass, field
from pathlib import PurePosixPath

import httpx
import structlog

logger = structlog.get_logger()

GITHUB_API_BASE = "https://api.github.com"


@dataclass
class RepoFile:
    """Represents a file in a GitHub repository."""

    path: str
    size: int
    file_type: str  # "file" or "dir"


@dataclass
class RepoAnalysis:
    """Summary of a GitHub repository's structure and tech stack."""

    owner: str
    repo: str
    default_branch: str
    languages: dict[str, int] = field(default_factory=dict)
    file_tree: list[RepoFile] = field(default_factory=list)
    has_readme: bool = False
    has_package_json: bool = False
    has_pyproject: bool = False
    has_dockerfile: bool = False
    has_docker_compose: bool = False
    framework_hints: list[str] = field(default_factory=list)


class GitHubClient:
    """Async client for GitHub API operations relevant to codebase analysis."""

    def __init__(self, token: str | None = None) -> None:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "PlanForge-AI",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self._client = httpx.AsyncClient(
            base_url=GITHUB_API_BASE,
            headers=headers,
            timeout=30.0,
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_repo_info(self, owner: str, repo: str) -> dict:
        """Fetch basic repository metadata."""
        response = await self._client.get(f"/repos/{owner}/{repo}")
        response.raise_for_status()
        return response.json()

    async def get_languages(self, owner: str, repo: str) -> dict[str, int]:
        """Fetch language breakdown (bytes per language)."""
        response = await self._client.get(f"/repos/{owner}/{repo}/languages")
        response.raise_for_status()
        return response.json()

    async def get_tree(self, owner: str, repo: str, branch: str = "main") -> list[RepoFile]:
        """Fetch the full recursive file tree for a branch."""
        response = await self._client.get(
            f"/repos/{owner}/{repo}/git/trees/{branch}",
            params={"recursive": "1"},
        )
        response.raise_for_status()
        data = response.json()

        files: list[RepoFile] = []
        for item in data.get("tree", []):
            files.append(
                RepoFile(
                    path=item["path"],
                    size=item.get("size", 0),
                    file_type="dir" if item["type"] == "tree" else "file",
                )
            )
        return files

    async def get_file_content(self, owner: str, repo: str, path: str, ref: str = "main") -> str:
        """Fetch raw content of a single file."""
        response = await self._client.get(
            f"/repos/{owner}/{repo}/contents/{path}",
            params={"ref": ref},
            headers={"Accept": "application/vnd.github.v3.raw"},
        )
        response.raise_for_status()
        return response.text

    async def analyze_repo(self, owner: str, repo: str) -> RepoAnalysis:
        """Perform a full analysis of a repository's structure and tech stack.

        Gathers language stats, file tree, and infers frameworks from file presence.
        """
        logger.info("analyzing_repo", owner=owner, repo=repo)

        repo_info = await self.get_repo_info(owner, repo)
        default_branch = repo_info.get("default_branch", "main")
        languages = await self.get_languages(owner, repo)
        file_tree = await self.get_tree(owner, repo, default_branch)

        analysis = RepoAnalysis(
            owner=owner,
            repo=repo,
            default_branch=default_branch,
            languages=languages,
            file_tree=file_tree,
        )

        # Detect key files and frameworks
        file_paths = {f.path for f in file_tree}
        analysis.has_readme = any(
            PurePosixPath(p).name.lower().startswith("readme") for p in file_paths
        )
        analysis.has_package_json = "package.json" in file_paths
        analysis.has_pyproject = "pyproject.toml" in file_paths
        analysis.has_dockerfile = "Dockerfile" in file_paths or "dockerfile" in file_paths
        analysis.has_docker_compose = any(
            "docker-compose" in p.lower() for p in file_paths
        )

        # Framework detection heuristics
        if "next.config.ts" in file_paths or "next.config.js" in file_paths:
            analysis.framework_hints.append("Next.js")
        if "app/main.py" in file_paths or "main.py" in file_paths:
            analysis.framework_hints.append("FastAPI/Python")
        if "requirements.txt" in file_paths or analysis.has_pyproject:
            analysis.framework_hints.append("Python project")
        if "Cargo.toml" in file_paths:
            analysis.framework_hints.append("Rust")
        if "go.mod" in file_paths:
            analysis.framework_hints.append("Go")
        if "tsconfig.json" in file_paths:
            analysis.framework_hints.append("TypeScript")

        logger.info(
            "repo_analysis_complete",
            owner=owner,
            repo=repo,
            languages=list(languages.keys()),
            frameworks=analysis.framework_hints,
        )
        return analysis

    @staticmethod
    def parse_github_url(url: str) -> tuple[str, str]:
        """Extract owner and repo from a GitHub URL.

        Supports formats:
          - https://github.com/owner/repo
          - https://github.com/owner/repo.git
          - github.com/owner/repo
        """
        url = url.rstrip("/")
        if url.endswith(".git"):
            url = url[:-4]

        parts = url.split("/")
        # Find 'github.com' and take the next two parts
        for i, part in enumerate(parts):
            if "github.com" in part and i + 2 < len(parts):
                return parts[i + 1], parts[i + 2]

        raise ValueError(f"Could not parse GitHub URL: {url}")
