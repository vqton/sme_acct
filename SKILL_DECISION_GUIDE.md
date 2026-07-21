# Skill Decision Guide — 5W1H Framework

Route any task to the right skill(s). Use this guide when you're unsure which skill to load.

---

## Entry Point

```
User asks to do something
        │
        ▼
   ┌─────────────┐
   │ Know which   │──No──→ load "ask-matt" (it routes to skills)
   │ skill to use?│
   └──────┬───────┘
          │Yes
          ▼
   Load that skill directly
```

**When unsure, load `ask-matt` first.** It's the meta-router.

---

## Quick Lookup Table

| If the task is about... | Load this skill | 5W1H Why |
|---|---|---|
| Implement a feature from spec | `implement` | What: feature; Who: developer; When: after planning; Where: codebase; Why: spec exists; How: follow spec |
| Write tests first (TDD) | `tdd` | What: tests; Who: developer; When: before code; Where: test files; Why: design quality; How: red-green-refactor |
| Build throwaway prototype | `prototype` | What: prototype; Who: developer; When: design validation; Where: throwaway dir; Why: sanity-check design; How: quick & dirty |
| Review a PR/diff/branch | `code-review` | What: code changes; Who: reviewer; When: before merge; Where: git diff; Why: catch issues; How: standards + spec check |
| Review code style only | `caveman-review` | What: code changes; Who: reviewer; When: quick review; Where: diff; Why: compressed feedback; How: one-line findings |
| Debug hard bug | `diagnosing-bugs` | What: bug; Who: debugger; When: bug reported; Where: codebase; Why: root cause; How: diagnosis loop |
| QA session (report bugs) | `qa` | What: bugs; Who: tester; When: testing; Where: conversation; Why: file issues; How: interactive reporting |
| Design module interface | `design-an-interface` | What: API/interface; Who: designer; When: before implementation; Where: module boundary; Why: explore options; How: parallel sub-agents |
| Design/improve deep module | `codebase-design` | What: module design; Who: architect; When: before refactor; Where: module; Why: deepen; How: shared vocabulary |
| Build domain model | `domain-modeling` | What: domain terms; Who: team; When: early project; Where: UBIQUITOUS_LANGUAGE.md; Why: shared understanding; How: extract from conversation |
| Extract glossary terms | `ubiquitous-language` | What: terminology; Who: team; When: new terms appear; Where: UBIQUITOUS_LANGUAGE.md; Why: precision; How: DDD glossary |
| Plan huge work chunk | `wayfinder` | What: big plan; Who: planner; When: >1 session; Where: issue tracker; Why: shared map; How: decision tickets |
| Plan refactor | `request-refactor-plan` | What: refactor plan; Who: planner; When: tech debt; Where: issue tracker; Why: incremental steps; How: tiny commits |
| Break plan into tickets | `to-tickets` | What: tickets; Who: planner; When: plan ready; Where: issue tracker; Why: execution units; How: tracer bullets |
| Turn conversation into spec | `to-spec` | What: spec; Who: planner; When: discussion done; Where: issue tracker; Why: documented decisions; How: synthesis |
| Turn decision into questionnaire | `to-questionnaire` | What: questionnaire; Who: planner; When: can't decide; Where: document; Why: gather input; How: structured questions |
| Grill plan/idea | `grill-me` | What: plan quality; Who: interviewer; When: before commitment; Where: conversation; Why: stress-test; How: relentless questions |
| Grill + create docs | `grill-with-docs` | What: plan + docs; Who: interviewer; When: before commitment; Where: ADR + glossary; Why: stress-test + document; How: grill + ADR |
| Grill about specs | `loop-me` | What: workflow specs; Who: interviewer; When: designing workflows; Where: conversation; Why: sharpen; How: grill loop |
| Edit article | `edit-article` | What: article; Who: editor; When: draft ready; Where: document; Why: improve quality; How: restructure + tighten |
| Write article (exploit) | `writing-shape` | What: article; Who: writer; When: raw material ready; Where: document; Why: shape content; How: paragraph by paragraph |
| Write article (explore) | `writing-fragments` | What: fragments; Who: writer; When: brainstorming; Where: document; Why: mine material; How: no structure yet |
| Write article (journey) | `writing-beats` | What: beats; Who: writer; When: structure clear; Where: document; Why: ground terms; How: beat by beat |
| Research a topic | `research` | What: research; Who: researcher; When: questions arise; Where: markdown file; Why: high-trust info; How: primary sources |
| Compress memory files | `caveman-compress` | What: memory file; Who: any; When: file too long; Where: file path; Why: save tokens; How: caveman format |
| Set up pre-commit hooks | `setup-pre-commit` | What: hooks; Who: devops; When: project setup; Where: .husky/; Why: commit quality; How: husky + lint-staged |
| Set up dependency-cruiser | `setup-ts-deep-modules` | What: deep modules; Who: devops; When: project setup; Where: src/; Why: module boundaries; How: dependency-cruiser |
| Resolve merge conflict | `resolving-merge-conflicts` | What: conflict; Who: developer; When: git conflict; Where: git repo; Why: unblock merge; How: conflict resolution |
| Set up git safety hooks | `git-guardrails-claude-code` | What: git hooks; Who: devops; When: project setup; Where: .claude/; Why: prevent destructive ops; How: hook config |
| Set up opencode config | `customize-opencode` | What: opencode config; Who: admin; When: project setup; Where: .opencode/; Why: customize behavior; How: edit config files |
| Write opencode skills | `writing-great-skills` | What: skill; Who: skill author; When: creating skill; Where: .opencode/skills/; Why: quality skills; How: vocabulary + principles |
| Scaffold exercises | `scaffold-exercises` | What: exercises; Who: educator; When: course setup; Where: exercises/; Why: structured learning; How: sections + problems |
| Teach a concept | `teach` | What: concept; Who: teacher; When: learning request; Where: workspace; Why: knowledge transfer; How: teach in context |
| Create JSON Canvas | `json-canvas` | What: canvas file; Who: any; When: visual mapping; Where: .canvas file; Why: visual thinking; How: nodes + edges |
| Create Obsidian Bases | `obsidian-bases` | What: base file; Who: note-taker; When: organizing notes; Where: .base file; Why: database views; How: filters + formulas |
| Interact with Obsidian | `obsidian-cli` | What: vault operations; Who: note-taker; When: vault management; Where: vault; Why: automate; How: CLI commands |
| Write Obsidian markdown | `obsidian-markdown` | What: obsidian note; Who: note-taker; When: writing notes; Where: .md file; Why: obsidian syntax; How: wikilinks + callouts |
| Manage Obsidian vault | `obsidian-vault` | What: vault content; Who: note-taker; When: organizing; Where: vault; Why: find/create notes; How: search + index |
| Search vault (QMD) | `qmd` | What: vault search; Who: any; When: finding past decisions; Where: vault; Why: semantic search; How: QMD index |
| Generate bash wizard | `wizard` | What: wizard script; Who: devops; When: manual procedure; Where: bash script; Why: guide humans; How: step-by-step interactive |
| Delegate to subagent | `cavecrew` | What: subagent; Who: main agent; When: context pressure; Where: any; Why: save tokens; How: compressed output |
| Handoff to fresh agent | `claude-handoff` / `handoff` | What: conversation; Who: agent; When: context full; Where: handoff doc; Why: continue work; How: compact + hand off |
| Compressed communication | `caveman` | What: output mode; Who: any; When: token efficiency; Where: all output; Why: save tokens; How: caveman speak |
| Compressed commit message | `caveman-commit` | What: commit msg; Who: developer; When: committing; Where: git; Why: concise msg; How: conventional + terse |
| Show token stats | `caveman-stats` | What: token usage; Who: any; When: checking savings; Where: session; Why: measure impact; How: read session log |
| Quick reference for caveman | `caveman-help` | What: caveman help; Who: any; When: need refresher; Where: one-shot display; Why: quick lookup; How: display card |
| Set up engineering skills | `setup-matt-pocock-skills` | What: skill setup; Who: admin; When: first use; Where: project root; Why: enable skills; How: issue tracker + labels |
| Improve codebase architecture | `improve-codebase-architecture` | What: architecture; Who: architect; When: tech debt review; Where: codebase; Why: find opportunities; How: scan + report + grill |
| Migrate tests to shoehorn | `migrate-to-shoehorn` | What: test migration; Who: developer; When: test cleanup; Where: test files; Why: remove `as` assertions; How: shoehorn patterns |
| Move issues through triage | `triage` | What: issue triage; Who: triage lead; When: issues filed; Where: issue tracker; Why: categorize + brief; How: state machine |

---

## 5W1H Decision Matrix

### Category 1: Development & Implementation

| Dimension | `implement` | `tdd` | `prototype` |
|---|---|---|---|
| **What** | Build feature from spec | Write tests first, then code | Build throwaway validation |
| **Who** | Developer with spec | Developer wanting design quality | Developer validating design |
| **When** | After planning + spec ready | Before writing production code | Before committing to architecture |
| **Where** | Production codebase | Test files + production code | Throwaway directory |
| **Why** | Spec exists, need execution | Force clear design, prevent bugs | Validate approach before investment |
| **How** | Follow spec step by step | Red → Green → Refactor cycle | Quick & dirty, delete after |

**Decision flow:**
```
Have a spec?
  ├─Yes→ implement
  └─No→ Want to design through tests?
           ├─Yes→ tdd
           └─No→ Need to validate approach first?
                    ├─Yes→ prototype
                    └─No→ Use grill-me to sharpen idea first
```

---

### Category 2: Code Quality & Review

| Dimension | `code-review` | `caveman-review` | `diagnosing-bugs` | `qa` |
|---|---|---|---|---|
| **What** | Full review (standards + spec) | Compressed review (findings only) | Root cause analysis | Interactive bug reporting |
| **Who** | Reviewer with context | Reviewer wanting speed | Debugger with access | Tester reporting issues |
| **When** | Before merge, PR ready | Quick review needed | Bug reported, root cause unknown | Testing session, bugs found |
| **Where** | Git diff / PR | Git diff / file | Codebase exploration | Conversation |
| **Why** | Catch issues + verify spec match | Fast feedback, save tokens | Find root cause, not symptoms | File issues conversationally |
| **How** | Standards + spec review | One-line severity-tagged | Diagnosis loop | Explore + file GitHub issues |

**Decision flow:**
```
What's the task?
  ├─Review code→ code-review (full) or caveman-review (quick)
  ├─Bug report→ qa (interactive filing)
  └─Hard bug→ diagnosing-bugs (root cause analysis)
```

---

### Category 3: Architecture & Design

| Dimension | `design-an-interface` | `codebase-design` | `domain-modeling` | `ubiquitous-language` | `improve-codebase-architecture` |
|---|---|---|---|---|---|
| **What** | Multiple interface options | Deep module vocabulary | Domain model | DDD glossary | Architecture scan |
| **Who** | Architect exploring options | Architect deepening | Team building model | Team defining terms | Architect reviewing debt |
| **When** | Before implementing module | Before refactoring | Early project / new domain | New terms appear | Periodic review |
| **Where** | Module boundary | Module design | UBIQUITOUS_LANGUAGE.md | UBIQUITOUS_LANGUAGE.md | Full codebase |
| **Why** | Compare designs | Shared understanding | Precision in domain | Eliminate ambiguity | Find improvement opportunities |
| **How** | Parallel sub-agents | Deep module analysis | Extract from conversation | Extract + flag ambiguities | Scan + HTML report + grill |

**Decision flow:**
```
What's the architecture need?
  ├─Design new module→ design-an-interface (explore options)
  ├─Improve existing module→ codebase-design (deepen)
  ├─New domain terms→ domain-modeling or ubiquitous-language
  └─Review whole codebase→ improve-codebase-architecture
```

---

### Category 4: Planning & Project Management

| Dimension | `wayfinder` | `to-spec` | `to-tickets` | `request-refactor-plan` | `to-questionnaire` |
|---|---|---|---|---|---|
| **What** | Huge work map | Spec from conversation | Tickets from plan | Refactor steps | Questionnaire from decision |
| **Who** | Planner (multi-session) | Planner (single discussion) | Planner (execution) | Planner (refactor) | Anyone (decision blocked) |
| **When** | >1 session needed | Discussion complete | Plan/spec ready | Tech debt identified | Can't decide alone |
| **Where** | Issue tracker | Issue tracker | Issue tracker | Issue tracker | Document |
| **Why** | Shared map for big work | Document decisions | Break into units | Incremental safe steps | Gather input |
| **How** | Decision tickets | Synthesize discussion | Tracer bullets | Tiny commits | Structured questions |

**Decision flow:**
```
What's the planning need?
  ├─Big work (>1 session)→ wayfinder
  ├─Document decisions→ to-spec
  ├─Break into execution units→ to-tickets
  ├─Plan refactor→ request-refactor-plan
  └─Need input from others→ to-questionnaire
```

---

### Category 5: Stress-Testing Ideas

| Dimension | `grill-me` | `grill-with-docs` | `grilling` | `loop-me` |
|---|---|---|---|---|
| **What** | Interview to sharpen | Grill + create ADR + glossary | Grill about plan/idea | Grill about workflow specs |
| **Who** | Anyone with a plan | Anyone with a plan | Anyone with an idea | Anyone designing workflows |
| **When** | Before commitment | Before commitment + docs needed | Before commitment | Designing workflows |
| **Where** | Conversation | Conversation + files | Conversation | Conversation |
| **Why** | Find weaknesses | Find weaknesses + document | Find weaknesses | Sharpen workflow specs |
| **How** | Relentless questions | Grill + ADR + glossary | Relentless questions | Grill loop |

**Decision flow:**
```
Need to stress-test?
  ├─Just grill→ grill-me
  ├─Grill + save decisions→ grill-with-docs
  ├─About a specific plan→ grilling
  └─About workflow specs→ loop-me
```

---

### Category 6: Research & Knowledge

| Dimension | `research` | `qmd` | `teach` |
|---|---|---|---|
| **What** | Investigate topic | Search vault semantically | Teach concept |
| **Who** | Researcher | Anyone | Teacher + learner |
| **When** | Questions arise | Need past decisions/context | Learning request |
| **Where** | Markdown file in repo | Obsidian vault | Workspace |
| **Why** | High-trust primary sources | Find existing knowledge | Knowledge transfer |
| **How** | Web search + sources | QMD semantic search | Teach in context |

---

### Category 7: Writing & Documentation

| Dimension | `edit-article` | `writing-shape` | `writing-fragments` | `writing-beats` |
|---|---|---|---|---|
| **What** | Edit existing article | Shape raw material | Mine raw fragments | Build journey of beats |
| **Who** | Editor | Writer (exploit) | Writer (explore) | Writer (exploit) |
| **When** | Draft ready | Raw material ready | Brainstorming | Structure clear |
| **Where** | Document | Document | Document | Document |
| **Why** | Improve quality | Paragraph by paragraph | No structure yet | Ground terms before beats |
| **How** | Restructure + tighten | Shape content | Mine fragments | Beat by beat |

**Writing flow:**
```
Where are you in the writing process?
  ├─Brainstorming→ writing-fragments (mine material)
  ├─Have raw material→ writing-shape (shape it)
  ├─Need to ground terms→ writing-beats (beat by beat)
  └─Draft ready→ edit-article (improve it)
```

---

### Category 8: Workflow & Communication

| Dimension | `cavecrew` | `claude-handoff` / `handoff` | `caveman` | `caveman-commit` |
|---|---|---|---|---|
| **What** | Delegate to subagent | Hand off to fresh agent | Compressed output mode | Compressed commit message |
| **Who** | Main agent | Agent (context full) | Any (token pressure) | Developer (committing) |
| **When** | Context pressure | Context full | All output | Git commit |
| **Where** | Any | Handoff document | All output | Git |
| **Why** | Save tokens, parallel work | Continue without context loss | Save 65% tokens | Concise conventional msg |
| **How** | Spawn investigator/builder/reviewer | Compact + hand off | Caveman speak | Conventional + terse |

**Decision flow:**
```
Context pressure?
  ├─Need to delegate work→ cavecrew (spawn subagent)
  ├─Context nearly full→ claude-handoff (hand off to fresh)
  └─Want to save tokens→ caveman (compressed mode)
```

---

### Category 9: Obsidian & Vault

| Dimension | `obsidian-bases` | `obsidian-cli` | `obsidian-markdown` | `obsidian-vault` | `qmd` |
|---|---|---|---|---|---|
| **What** | Database-like views | CLI vault operations | Obsidian-flavored markdown | Search/create/manage notes | Semantic search |
| **Who** | Note-taker | Note-taker | Note-taker | Note-taker | Anyone |
| **When** | Creating views | Vault automation | Writing .md files | Organizing notes | Finding past content |
| **Where** | .base files | Vault | .md files | Vault | Vault |
| **Why** | Database views from notes | Automate vault tasks | Obsidian syntax | Find/create notes | Semantic discovery |
| **How** | Filters + formulas | CLI commands | Wikilinks + callouts | Search + index | QMD index |

---

### Category 10: Project Setup & DevOps

| Dimension | `setup-pre-commit` | `setup-ts-deep-modules` | `git-guardrails-claude-code` | `customize-opencode` | `setup-matt-pocock-skills` |
|---|---|---|---|---|---|
| **What** | Husky + lint-staged | dependency-cruiser | Git safety hooks | opencode config | Engineering skills setup |
| **Who** | DevOps | DevOps | DevOps | Admin | Admin |
| **When** | Project setup | Project setup | Project setup | Project setup | First skill use |
| **Where** | .husky/ | src/ | .claude/ | .opencode/ | Project root |
| **Why** | Commit quality | Module boundaries | Prevent destructive ops | Customize behavior | Enable skill ecosystem |
| **How** | husky + lint-staged | dependency-cruiser config | Hook config | Edit config files | Issue tracker + labels |

---

## Composition Rules

Many tasks need **multiple skills**. Use this table to compose:

| Task Pattern | Skill Chain | Why |
|---|---|---|
| New feature from idea to code | `grill-me` → `to-spec` → `implement` → `tdd` → `code-review` | Sharpen → Document → Build → Test → Review |
| Refactor existing code | `improve-codebase-architecture` → `request-refactor-plan` → `implement` → `tdd` | Find → Plan → Execute → Verify |
| Big project kickoff | `wayfinder` → `domain-modeling` → `ubiquitous-language` | Map work → Model domain → Define terms |
| Bug found in production | `diagnosing-bugs` → `implement` → `tdd` → `code-review` | Find cause → Fix → Test → Review |
| New team member onboarding | `ubiquitous-language` → `teach` → `scaffold-exercises` | Define terms → Teach → Practice |
| Architecture decision | `grill-with-docs` → `design-an-interface` → `to-spec` | Stress-test → Design → Document |
| Writing technical article | `writing-fragments` → `writing-beats` → `writing-shape` → `edit-article` | Mine → Ground → Shape → Polish |
| QA sprint | `qa` → `diagnosing-bugs` → `to-tickets` → `implement` | Find → Analyze → Plan → Fix |
| Token-efficient session | `caveman` → `cavecrew` → `caveman-commit` | Compress mode → Delegate → Committed msg |

---

## Token Efficiency Rules

When context window is a concern:

| Situation | Action |
|---|---|
| Long conversation, need to continue later | `claude-handoff` or `handoff` |
| Large codebase exploration needed | `cavecrew` (investigator subagent) |
| Review needed but context full | `cavecrew` (reviewer subagent) |
| 1-2 file edit, scope clear | `cavecrew` (builder subagent) |
| All output should be terse | `caveman` mode |
| Memory files too long | `caveman-compress` |
| Need to check token usage | `caveman-stats` |

---

## Priority Order

When multiple skills could apply, use this priority:

1. **Safety first** — `git-guardrails-claude-code` before any destructive git ops
2. **Plan before code** — `grill-me` / `to-spec` / `wayfinder` before `implement`
3. **Test alongside code** — `tdd` alongside `implement`
4. **Review after code** — `code-review` after `implement`
5. **Document decisions** — `grill-with-docs` / `to-spec` when architectural choices made
6. **Compress when pressured** — `caveman` / `cavecrew` when context limited
