# Agent skills

Each subdirectory is an Agent Skills compatible skill containing `SKILL.md`. The Deep Agent loads each skill's name and description at startup, then reads the full instructions only when the user request matches the description.

## Add a skill

```text
skills/
  my-skill/
    SKILL.md
    references/
    scripts/
    assets/
```

`SKILL.md` must start with YAML frontmatter containing `name` and `description`. Keep descriptions specific: they control whether the agent activates the skill.

## Claude Code compatibility

Claude Code skills using the Agent Skills `SKILL.md` format can be copied into this directory. They are not discovered automatically from `.claude/skills`; keeping a curated copy here makes the LangGraph deployment deterministic and versioned.

Do not place secrets in skills, references, assets, or scripts. Do not put real API keys in this repository.
