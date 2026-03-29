"""Export service: generates project artifacts in various formats."""

import json
from uuid import UUID

import structlog

from app.models.feature import Feature
from app.models.project import Project
from app.models.spec import Spec
from app.models.task import Task

logger = structlog.get_logger()


class ExportService:
    """Exports project plans, specs, and tasks in multiple formats."""

    async def export_project(
        self,
        project_id: UUID,
        format: str,
    ) -> dict:
        """Export a full project in the specified format."""
        exporters = {
            "markdown": self._export_markdown,
            "json": self._export_json,
            "mcp": self._export_mcp,
            "cli": self._export_cli,
        }

        if format not in exporters:
            raise ValueError(f"Unsupported export format: {format}. Use: {', '.join(exporters)}")

        project = await self._get_project(project_id)
        specs = await self._get_specs(project_id)
        features = await self._get_features(project_id)
        tasks = await self._get_tasks(project_id)

        logger.info("export_start", project_id=str(project_id), format=format)

        result = await exporters[format](project, specs, features, tasks)

        logger.info("export_complete", project_id=str(project_id), format=format)
        return result

    async def _export_markdown(
        self,
        project: Project,
        specs: list[Spec],
        features: list[Feature],
        tasks: list[Task],
    ) -> dict:
        """Export as a comprehensive Markdown document."""
        lines: list[str] = []
        lines.append(f"# {project.name}")
        lines.append("")
        if project.description:
            lines.append(project.description)
            lines.append("")

        for spec in specs:
            lines.append(f"## Specification: {spec.title}")
            lines.append("")
            content = spec.content_json.get("markdown", "") if spec.content_json else ""
            lines.append(content)
            lines.append("")

        if features:
            lines.append("## Features")
            lines.append("")
            for f in features:
                mvp = " [MVP]" if f.mvp_classification == "must_have" else ""
                lines.append(f"### {f.title}{mvp}")
                lines.append(f"- **Priority**: {f.priority_score}/10")
                lines.append(f"- **Effort**: {f.effort_estimate}")
                lines.append(f"- **Status**: {f.status}")
                if f.description:
                    lines.append(f"\n{f.description}")
                lines.append("")

        if tasks:
            lines.append("## Implementation Tasks")
            lines.append("")
            for i, t in enumerate(tasks, 1):
                status_icon = {"todo": "[ ]", "in_progress": "[~]", "done": "[x]", "failed": "[!]"}.get(
                    t.status, "[ ]"
                )
                lines.append(f"{i}. {status_icon} **{t.title}** ({t.estimated_minutes}min, {t.regression_risk} risk)")
                if t.description:
                    lines.append(f"   {t.description}")
                lines.append("")

        content = "\n".join(lines)
        return {"content": content, "filename": f"{project.name.lower().replace(' ', '-')}-plan.md"}

    async def _export_json(
        self,
        project: Project,
        specs: list[Spec],
        features: list[Feature],
        tasks: list[Task],
    ) -> dict:
        """Export as structured JSON."""
        data = {
            "project": {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "tech_stack": project.tech_stack,
            },
            "specs": [
                {
                    "id": str(s.id),
                    "title": s.title,
                    "content": s.content_json,
                    "version": s.version,
                    "status": s.status,
                }
                for s in specs
            ],
            "features": [
                {
                    "id": str(f.id),
                    "title": f.title,
                    "description": f.description,
                    "priority_score": f.priority_score,
                    "effort_estimate": f.effort_estimate,
                    "mvp_classification": f.mvp_classification,
                    "status": f.status,
                }
                for f in features
            ],
            "tasks": [
                {
                    "id": str(t.id),
                    "title": t.title,
                    "description": t.description,
                    "prompt_text": t.prompt_text,
                    "acceptance_criteria": t.acceptance_criteria_json,
                    "status": t.status,
                    "estimated_minutes": t.estimated_minutes,
                    "agent_type": t.agent_type,
                }
                for t in tasks
            ],
        }

        content = json.dumps(data, indent=2, default=str)
        return {"content": content, "filename": f"{project.name.lower().replace(' ', '-')}-plan.json"}

    async def _export_mcp(
        self,
        project: Project,
        specs: list[Spec],
        features: list[Feature],
        tasks: list[Task],
    ) -> dict:
        """Export in Model Context Protocol format for AI agent consumption."""
        mcp_tasks = []
        for t in tasks:
            mcp_tasks.append({
                "id": str(t.id),
                "title": t.title,
                "prompt": t.prompt_text,
                "context": {
                    "project": project.name,
                    "tech_stack": project.tech_stack,
                    "acceptance_criteria": t.acceptance_criteria_json,
                },
                "metadata": {
                    "estimated_minutes": t.estimated_minutes,
                    "regression_risk": t.regression_risk,
                    "agent_type": t.agent_type,
                    "sequence_order": t.sequence_order,
                },
            })

        data = {
            "mcp_version": "1.0",
            "project_context": {
                "name": project.name,
                "description": project.description,
                "tech_stack": project.tech_stack,
            },
            "tasks": mcp_tasks,
        }

        content = json.dumps(data, indent=2, default=str)
        return {"content": content, "filename": f"{project.name.lower().replace(' ', '-')}-mcp.json"}

    async def _export_cli(
        self,
        project: Project,
        specs: list[Spec],
        features: list[Feature],
        tasks: list[Task],
    ) -> dict:
        """Export as a shell script of sequential agent commands."""
        lines: list[str] = []
        lines.append("#!/bin/bash")
        lines.append(f"# PlanForge AI - Task execution script for: {project.name}")
        lines.append(f"# Generated tasks: {len(tasks)}")
        lines.append("")

        for i, t in enumerate(tasks, 1):
            lines.append(f"# Task {i}: {t.title}")
            lines.append(f"# Estimated: {t.estimated_minutes} minutes | Risk: {t.regression_risk}")
            escaped_prompt = (t.prompt_text or "").replace("'", "'\\''")
            lines.append(f"echo 'Executing task {i}/{len(tasks)}: {t.title}'")
            lines.append(f"# claude-code --prompt '{escaped_prompt}'")
            lines.append("")

        content = "\n".join(lines)
        return {"content": content, "filename": f"{project.name.lower().replace(' ', '-')}-tasks.sh"}

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    async def _get_specs(self, project_id: UUID) -> list[Spec]:
        return await Spec.find(Spec.project_id == project_id).sort(-Spec.version).to_list()

    async def _get_features(self, project_id: UUID) -> list[Feature]:
        return await Feature.find(Feature.project_id == project_id).sort(+Feature.sort_order).to_list()

    async def _get_tasks(self, project_id: UUID) -> list[Task]:
        return await Task.find(Task.project_id == project_id).sort(+Task.sequence_order).to_list()
