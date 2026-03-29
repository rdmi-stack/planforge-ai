"""GitHub repository analysis service for codebase-aware planning."""

from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.utils.github_client import GitHubClient, RepoAnalysis

logger = structlog.get_logger()


class CodebaseAnalyzer:
    """Analyzes connected GitHub repositories to provide codebase context.

    Extracts tech stack information, project structure, and key configuration
    files to enrich AI-generated specs, features, and tasks with awareness
    of the existing codebase.
    """

    def __init__(self, db: AsyncSession, github_token: str | None = None) -> None:
        self.db = db
        self.github_client = GitHubClient(token=github_token)

    async def analyze_project_repo(self, project_id: UUID) -> RepoAnalysis | None:
        """Analyze the GitHub repo connected to a project.

        Returns None if no repo is connected.
        """
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project or not project.github_repo_url:
            logger.info("no_repo_connected", project_id=str(project_id))
            return None

        try:
            owner, repo = GitHubClient.parse_github_url(project.github_repo_url)
            analysis = await self.github_client.analyze_repo(owner, repo)
            logger.info(
                "codebase_analysis_complete",
                project_id=str(project_id),
                owner=owner,
                repo=repo,
                languages=list(analysis.languages.keys()),
            )
            return analysis
        except Exception as e:
            logger.error(
                "codebase_analysis_failed",
                project_id=str(project_id),
                error=str(e),
            )
            return None

    async def get_codebase_context_summary(self, project_id: UUID) -> str:
        """Generate a text summary of the codebase for use in AI prompts.

        Provides a condensed overview of languages, frameworks, structure,
        and key files that helps the AI generate more relevant output.
        """
        analysis = await self.analyze_project_repo(project_id)
        if not analysis:
            return ""

        parts: list[str] = []
        parts.append(f"Repository: {analysis.owner}/{analysis.repo}")
        parts.append(f"Default branch: {analysis.default_branch}")

        if analysis.languages:
            sorted_langs = sorted(analysis.languages.items(), key=lambda x: x[1], reverse=True)
            lang_summary = ", ".join(f"{lang} ({bytes_:,} bytes)" for lang, bytes_ in sorted_langs[:5])
            parts.append(f"Languages: {lang_summary}")

        if analysis.framework_hints:
            parts.append(f"Detected frameworks: {', '.join(analysis.framework_hints)}")

        # Key config files
        key_files = []
        if analysis.has_package_json:
            key_files.append("package.json")
        if analysis.has_pyproject:
            key_files.append("pyproject.toml")
        if analysis.has_dockerfile:
            key_files.append("Dockerfile")
        if analysis.has_docker_compose:
            key_files.append("docker-compose.yml")
        if key_files:
            parts.append(f"Key files: {', '.join(key_files)}")

        # Top-level directory structure
        top_dirs = sorted({
            f.path.split("/")[0]
            for f in analysis.file_tree
            if "/" in f.path and f.file_type == "dir"
        })
        if top_dirs:
            parts.append(f"Top-level directories: {', '.join(top_dirs[:15])}")

        file_count = sum(1 for f in analysis.file_tree if f.file_type == "file")
        parts.append(f"Total files: {file_count}")

        return "\n".join(parts)

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self.github_client.close()
