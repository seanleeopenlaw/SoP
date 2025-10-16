📘 agents/README.md

# 🧠 People Profile Web App · Agent System

This folder defines the subagents that collaboratively build the **People Project Profiles** web application — replacing static PDFs with a fully interactive, mobile-responsive UI that uses Sean’s strict theme design tokens and reusable components.

---

## 🧩 Active Subagents

| Agent | Role |
|-------|------|
| 🧠 `PersonaOrchestrator` | Manages task flow, assigns priorities, and coordinates agent handoffs |
| 🎨 `PersonaUI Engineer` | Builds reusable, atomic UI components using Tailwind + Magic UI |
| 🧪 `PersonaValidator` | Reviews and enforces theme consistency, prop structure, and reusability |
| 🧠 `PersonaLogic Builder` | Connects components to state, validation rules, and submission logic |

> Optional agent `PersonaExporter` is excluded from this version.

---

## 🔁 Standard Workflow

```mermaid
graph TD
A[Feature Identified] --> B[PersonaOrchestrator]
B --> C[PersonaUI Engineer]
C --> D[PersonaValidator]
D --> E[PersonaLogic Builder]
E --> F[Integrated Component]


⸻

📐 Agent Usage Guidelines

1. 🎛 Component Creation

Start with PersonaUI Engineer
	•	Define props clearly
	•	Use only custom theme tokens (no Tailwind defaults)
	•	Ensure responsiveness and accessibility

2. 🧪 Code Review

Pass result to PersonaValidator
	•	Enforces token usage
	•	Suggests refactors
	•	Validates prop clarity and reusability

3. 🔧 State & Logic

Then handoff to PersonaLogic Builder
	•	Hook up useState or Zustand logic
	•	Add validation rules (e.g. max 5 values)
	•	Prepare for form submission or profile export

4. 🧠 Project Flow Control

Use PersonaOrchestrator to:
	•	Sequence tasks
	•	Prevent overlap or premature optimization
	•	Maintain cross-agent context
	•	Delegate subtasks with clear prompts

⸻

🧠 Example Execution Flow

/ask PersonaOrchestrator:
"Start BigFiveGroupSelector. Get UI component built by UI Engineer, reviewed by Validator, and wired by Logic Builder. Max score = 100 per group."


⸻

✅ Theme Enforcement

All agents must follow Sean’s custom design token system:
	•	Light & dark mode support
	•	Tokens like --card, --chart-3, --sidebar-ring
	•	No hardcoded Tailwind color utilities (e.g. bg-blue-500 ❌)

⸻

📦 Folder Contents

File	Description
PersonaUIEngineer.md	Component builder
PersonaValidator.md	Theme/style reviewer
PersonaLogicBuilder.md	State manager
PersonaOrchestrator.md	Project controller
README.md	This file


⸻

📍 Goal

Deliver a system where:
	•	All profile inputs (core values, traits, chronotypes) are editable
	•	Traits are hoverable, pinnable, and comparable
	•	All UI is reusable, clean, token-compliant, and modular
