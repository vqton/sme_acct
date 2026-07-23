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
| Design stable APIs & interfaces | `api-and-interface-design` | What: API design; Who: designer; When: before implementation; Where: module boundary; Why: hard-to-misuse interfaces; How: contract-first |
| Test in real browsers | `browser-testing-with-devtools` | What: browser testing; Who: tester; When: building UI; Where: browser; Why: verify runtime; How: Chrome DevTools |
| Set up CI/CD pipeline | `ci-cd-and-automation` | What: CI/CD; Who: devops; When: project setup; Where: GitHub Actions; Why: automate quality gates; How: pipeline config |
| Full multi-axis code review | `code-review-and-quality` | What: code review; Who: reviewer; When: before merge; Where: codebase; Why: 5-axis quality; How: correctness + readability + architecture + security + performance |
| Simplify existing code | `code-simplification` | What: simplification; Who: developer; When: after feature works; Where: source files; Why: easier maintenance; How: incremental refactor, preserve behavior |
| Optimize agent context | `context-engineering` | What: context setup; Who: any; When: starting session; Where: rules files; Why: better agent output; How: structured context hierarchy |
| Debug systematically | `debugging-and-error-recovery` | What: debugging; Who: debugger; When: bug reported; Where: codebase; Why: find root cause; How: triage checklist (reproduce → localize → reduce → fix → guard) |
| Extract web page content | `defuddle` | What: content extraction; Who: any; When: reading URLs; Where: web pages; Why: save tokens; How: defuddle CLI |
| Deprecate & migrate | `deprecation-and-migration` | What: deprecation; Who: engineer; When: removing old system; Where: codebase; Why: safe removal; How: strangler pattern / expand-contract |
| Write docs & ADRs | `documentation-and-adrs` | What: documentation; Who: engineer; When: making decisions; Where: docs/; Why: capture why; How: ADRs + inline docs |
| Adversarial pre-commit review | `doubt-driven-development` | What: doubt; Who: any; When: before non-trivial decision; Where: artifact; Why: catch blind spots; How: fresh-context adversarial review |
| Build production UI | `frontend-ui-engineering` | What: UI; Who: frontend engineer; When: building interfaces; Where: components; Why: production quality; How: design system + WCAG a11y |
| Manage git workflow & versioning | `git-workflow-and-versioning` | What: git workflow; Who: developer; When: always; Where: git; Why: safe version control; How: atomic commits + trunk-based dev |
| Refine raw idea | `idea-refine` | What: idea refinement; Who: any; When: idea vague; Where: conversation; Why: stress-test assumptions; How: divergent → convergent thinking |
| Implement incrementally | `incremental-implementation` | What: implementation; Who: developer; When: large feature; Where: codebase; Why: safe delivery; How: thin vertical slices |
| Interview user's actual needs | `interview-me` | What: requirements; Who: interviewer; When: underspecified ask; Where: conversation; Why: extract true intent; How: one-question-at-a-time |
| Add observability | `observability-and-instrumentation` | What: observability; Who: engineer; When: shipping features; Where: codebase; Why: operate in production; How: logging + metrics + tracing |
| Optimize performance | `performance-optimization` | What: performance; Who: engineer; When: bottlenecks found; Where: codebase; Why: faster app; How: measure → fix → measure |
| Break work into tasks | `planning-and-task-breakdown` | What: task breakdown; Who: planner; When: spec ready; Where: task list; Why: manageable units; How: small verifiable tasks with acceptance criteria |
| Harden security | `security-and-hardening` | What: security; Who: engineer; When: handling sensitive data; Where: codebase; Why: prevent vulnerabilities; How: input validation + auth + injection prevention |
| Ship to production | `shipping-and-launch` | What: launch; Who: engineer; When: ready to deploy; Where: production; Why: safe releases; How: checklist + monitoring + rollback plan |
| Ground code in official docs | `source-driven-development` | What: source-verified code; Who: engineer; When: using frameworks; Where: implementation; Why: authoritative patterns; How: verify + cite |
| Create spec before coding | `spec-driven-development` | What: spec; Who: planner; When: no spec exists; Where: document; Why: clear requirements; How: structured specification |
| TDD (full skill) | `test-driven-development` | What: TDD; Who: developer; When: implementing logic; Where: test + code; Why: prove correctness; How: red-green-refactor |
| Discover & invoke skills | `using-agent-skills` | What: skill discovery; Who: agent; When: session start; Where: conversation; Why: find right skill; How: meta-skill routing |
| Daily standup summary | `dev-standup` | What: standup; Who: developer; When: daily; Where: conversation; Why: progress summary; How: git changes + build + blockers |
| Avoid LLM coding mistakes | `karpathy-guidelines` | What: guidelines; Who: any; When: writing code; Where: codebase; Why: reduce errors; How: overcomplication avoidance + surgical changes |

---

## 5W1H Decision Matrix

### Category 1: Development & Implementation

| Dimension | `implement` | `tdd` | `prototype` | `spec-driven-development` | `test-driven-development` | `incremental-implementation` |
|---|---|---|---|---|---|---|
| **What** | Build feature from spec | Write tests first, then code | Build throwaway validation | Create spec before coding | Full TDD discipline | Build in thin vertical slices |
| **Who** | Developer with spec | Developer wanting design quality | Developer validating design | Planner, spec writer | Developer proving correctness | Developer managing complexity |
| **When** | After planning + spec ready | Before writing production code | Before committing to architecture | Before any code | When implementing logic | When feature is large |
| **Where** | Production codebase | Test files + production code | Throwaway directory | Document / issue tracker | Test + production code | Codebase |
| **Why** | Spec exists, need execution | Force clear design, prevent bugs | Validate approach before investment | Clear requirements | Prove correctness | Safe delivery, reviewable diffs |
| **How** | Follow spec step by step | Red → Green → Refactor cycle | Quick & dirty, delete after | Structured specification | Red-green-refactor + TDD patterns | One slice at a time, test each |

**Decision flow:**
```
Have a spec?
  ├─Yes→ implement or incremental-implementation
  └─No→ Want to write a spec first?
           ├─Yes→ spec-driven-development
           └─No→ Want to design through tests?
                    ├─Yes→ tdd or test-driven-development
                    └─No→ Need to validate approach first?
                             ├─Yes→ prototype
                             └─No→ Use grill-me or idea-refine to sharpen first
```

---

### Category 2: Code Quality & Review

| Dimension | `code-review` | `caveman-review` | `code-review-and-quality` | `code-simplification` | `doubt-driven-development` |
|---|---|---|---|---|---|
| **What** | Full review (standards + spec) | Compressed review (findings only) | Multi-axis review (5 axes) | Simplify code for clarity | Adversarial pre-commit review |
| **Who** | Reviewer with context | Reviewer wanting speed | Reviewer with quality focus | Developer after feature works | Any making non-trivial decision |
| **When** | Before merge, PR ready | Quick review needed | Before any merge | After feature is working | Before non-trivial decision stands |
| **Where** | Git diff / PR | Git diff / file | Full codebase | Source files | Artifact (code or decision) |
| **Why** | Catch issues + verify spec match | Fast feedback, save tokens | Catch architectural + security + perf issues | Reduce maintenance burden | Catch blind spots while cheap to fix |
| **How** | Standards + spec review | One-line severity-tagged | Correctness → readability → architecture → security → performance | Incremental refactor, preserve behavior | Fresh-context adversarial review |

**Decision flow:**
```
What's the review need?
  ├─Full review before merge→ code-review or code-review-and-quality
  ├─Quick review→ caveman-review
  ├─Pre-commit adversarial check→ doubt-driven-development
  ├─Simplify existing code→ code-simplification
  └─Bug investigation→ See Category 13: Debugging & Recovery
```

### Category 13: Debugging & Recovery

| Dimension | `diagnosing-bugs` | `debugging-and-error-recovery` | `qa` |
|---|---|---|---|
| **What** | Root cause analysis | Systematic debugging triage | Interactive bug reporting |
| **Who** | Debugger with access | Debugger following process | Tester reporting issues |
| **When** | Bug reported, root cause unknown | Test fail / build break / runtime error | Testing session, bugs found |
| **Where** | Codebase exploration | Codebase + CI + runtime | Conversation |
| **Why** | Find root cause, not symptoms | Stop-the-line, structured process | File issues conversationally |
| **How** | Diagnosis loop | Reproduce → Localize → Reduce → Fix → Guard | Explore + file GitHub issues |

**Decision flow:**
```
What broke?
  ├─Known bug with no clear cause→ diagnosing-bugs
  ├─Test failure / build break→ debugging-and-error-recovery
  └─Found during testing→ qa (interactive filing)
```

---

### Category 3: Architecture & Design

| Dimension | `design-an-interface` | `codebase-design` | `domain-modeling` | `ubiquitous-language` | `improve-codebase-architecture` | `api-and-interface-design` | `documentation-and-adrs` |
|---|---|---|---|---|---|---|---|
| **What** | Multiple interface options | Deep module vocabulary | Domain model | DDD glossary | Architecture scan | Design stable APIs & interfaces | Write documentation & ADRs |
| **Who** | Architect exploring options | Architect deepening | Team building model | Team defining terms | Architect reviewing debt | Designer of public API | Engineer documenting decisions |
| **When** | Before implementing module | Before refactoring | Early project / new domain | New terms appear | Periodic review | Before building module boundaries | When making significant decisions |
| **Where** | Module boundary | Module design | UBIQUITOUS_LANGUAGE.md | UBIQUITOUS_LANGUAGE.md | Full codebase | REST/GraphQL/component boundaries | docs/decisions/ + inline |
| **Why** | Compare designs | Shared understanding | Precision in domain | Eliminate ambiguity | Find improvement opportunities | Hard-to-misuse interfaces | Capture why, not just what |
| **How** | Parallel sub-agents | Deep module analysis | Extract from conversation | Extract + flag ambiguities | Scan + HTML report + grill | Contract-first, Hyrum's Law | ADRs + inline documentation |

**Decision flow:**
```
What's the architecture need?
  ├─Design new module→ design-an-interface (explore options) or api-and-interface-design (contracts)
  ├─Improve existing module→ codebase-design (deepen)
  ├─Document decisions→ documentation-and-adrs
  ├─New domain terms→ domain-modeling or ubiquitous-language
  └─Review whole codebase→ improve-codebase-architecture
```

---

### Category 4: Planning & Project Management

| Dimension | `wayfinder` | `to-spec` | `to-tickets` | `request-refactor-plan` | `to-questionnaire` | `planning-and-task-breakdown` | `idea-refine` | `interview-me` |
|---|---|---|---|---|---|---|---|---|
| **What** | Huge work map | Spec from conversation | Tickets from plan | Refactor steps | Questionnaire from decision | Break work into tasks | Refine raw idea | Extract user's actual needs |
| **Who** | Planner (multi-session) | Planner (single discussion) | Planner (execution) | Planner (refactor) | Anyone (decision blocked) | Planner with spec | Anyone with vague idea | Interviewer with unclear ask |
| **When** | >1 session needed | Discussion complete | Plan/spec ready | Tech debt identified | Can't decide alone | Spec ready, need tasks | Idea still abstract | Ask underspecified |
| **Where** | Issue tracker | Issue tracker | Issue tracker | Issue tracker | Document | Task list | Conversation | Conversation |
| **Why** | Shared map for big work | Document decisions | Break into units | Incremental safe steps | Gather input | Manageable execution | Stress-test assumptions | Find true intent |
| **How** | Decision tickets | Synthesize discussion | Tracer bullets | Tiny commits | Structured questions | Small verifiable tasks with acceptance criteria | Divergent → convergent thinking | One-question-at-a-time interview |

**Decision flow:**
```
What's the planning need?
  ├─Big work (>1 session)→ wayfinder
  ├─Document decisions→ to-spec
  ├─Break into execution units→ to-tickets
  ├─Plan refactor→ request-refactor-plan
  ├─Break spec into tasks→ planning-and-task-breakdown
  ├─Need input from others→ to-questionnaire
  ├─Refine a vague idea→ idea-refine
  └─Understand what user actually wants→ interview-me
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

| Dimension | `research` | `qmd` | `teach` | `defuddle` | `source-driven-development` |
|---|---|---|---|---|---|
| **What** | Investigate topic | Search vault semantically | Teach concept | Extract clean web content | Ground code in official docs |
| **Who** | Researcher | Anyone | Teacher + learner | Anyone needing web content | Engineer using frameworks |
| **When** | Questions arise | Need past decisions/context | Learning request | Reading URLs | Building with any library/framework |
| **Where** | Markdown file in repo | Obsidian vault | Workspace | Web pages | Implementation code |
| **Why** | High-trust primary sources | Find existing knowledge | Knowledge transfer | Save tokens, reduce clutter | Authoritative patterns |
| **How** | Web search + sources | QMD semantic search | Teach in context | Defuddle CLI extraction | Verify + cite official docs |

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

| Dimension | `cavecrew` | `claude-handoff` / `handoff` | `caveman` | `caveman-commit` | `context-engineering` | `using-agent-skills` | `dev-standup` | `karpathy-guidelines` |
|---|---|---|---|---|---|---|---|---|
| **What** | Delegate to subagent | Hand off to fresh agent | Compressed output mode | Compressed commit message | Optimize agent context | Discover & invoke skills | Daily standup summary | Avoid LLM coding mistakes |
| **Who** | Main agent | Agent (context full) | Any (token pressure) | Developer (committing) | Any starting session | Agent finding right skill | Developer | Anyone writing code |
| **When** | Context pressure | Context full | All output | Git commit | Session start / quality decline | Session start | Daily | Writing code |
| **Where** | Any | Handoff document | All output | Git | Rules files + specs | Conversation | Conversation | Codebase |
| **Why** | Save tokens, parallel work | Continue without context loss | Save 65% tokens | Concise conventional msg | Improve agent output quality | Route to right workflow | Quick progress snapshot | Reduce common errors |
| **How** | Spawn investigator/builder/reviewer | Compact + hand off | Caveman speak | Conventional + terse | Rules hierarchy + selective context | Meta-skill routing | Git + build + blockers | Overcomplication avoidance + surgical changes |

**Decision flow:**
```
Context pressure?
  ├─Need to delegate work→ cavecrew (spawn subagent)
  ├─Context nearly full→ claude-handoff (hand off to fresh)
  └─Want to save tokens→ caveman (compressed mode)

Agent quality issues?
  ├─Output doesn't follow conventions→ context-engineering
  ├─Don't know which skill to use→ using-agent-skills
  └─Codegetting too complex→ karpathy-guidelines
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

| Dimension | `setup-pre-commit` | `setup-ts-deep-modules` | `git-guardrails-claude-code` | `customize-opencode` | `setup-matt-pocock-skills` | `ci-cd-and-automation` | `git-workflow-and-versioning` | `shipping-and-launch` |
|---|---|---|---|---|---|---|---|
| **What** | Husky + lint-staged | dependency-cruiser | Git safety hooks | opencode config | Engineering skills setup | CI/CD pipeline setup | Git workflow & versioning | Production launch prep |
| **Who** | DevOps | DevOps | DevOps | Admin | Admin | DevOps | Developer | Engineer |
| **When** | Project setup | Project setup | Project setup | Project setup | First skill use | Project setup / CI changes | Always | Ready to deploy |
| **Where** | .husky/ | src/ | .claude/ | .opencode/ | Project root | .github/workflows | Git | Production |
| **Why** | Commit quality | Module boundaries | Prevent destructive ops | Customize behavior | Enable skill ecosystem | Automate quality gates | Safe version control | Safe, reversible releases |
| **How** | husky + lint-staged | dependency-cruiser config | Hook config | Edit config files | Issue tracker + labels | GitHub Actions + quality gates | Atomic commits + trunk-based dev | Pre-launch checklist + monitoring + rollback |

---

### Category 11: Security & Performance

| Dimension | `security-and-hardening` | `performance-optimization` | `observability-and-instrumentation` |
|---|---|---|---|
| **What** | Harden code against vulnerabilities | Optimize application performance | Add observability telemetry |
| **Who** | Engineer handling sensitive data | Engineer with performance targets | Engineer shipping features |
| **When** | Building auth, input handling, data storage | Bottlenecks found, Core Web Vitals need improvement | Before shipping to production |
| **Where** | Auth, input boundaries, data layer | Frontend, backend, queries, DB | Codebase (logs, metrics, traces) |
| **Why** | Prevent injection, XSS, auth bypass | Fix real bottlenecks, not guessed ones | Answer "what is the system doing?" |
| **How** | Input validation + parameterized queries + auth + secrets mgmt | Measure → identify → fix → re-measure | Logging + metrics + tracing + alerting |

**Decision flow:**
```
What's the concern?
  ├─Security (auth, input, secrets)→ security-and-hardening
  ├─Speed (load time, queries, N+1)→ performance-optimization
  └─Observability (monitoring, debugging in prod)→ observability-and-instrumentation
```

---

### Category 12: Frontend & Browser

| Dimension | `frontend-ui-engineering` | `browser-testing-with-devtools` |
|---|---|---|
| **What** | Build production-quality UI | Test in real browsers via DevTools |
| **Who** | Frontend engineer | Developer debugging UI |
| **When** | Building or modifying interfaces | Any browser-facing change |
| **Where** | Components, pages, layouts | Browser (DOM, console, network) |
| **Why** | Production look & feel + WCAG a11y | Verify runtime behavior, not just code |
| **How** | Design system + composable components + responsive | Chrome DevTools MCP (DOM, console, network, perf) |

**Decision flow:**
```
What's the frontend need?
  ├─Build production UI→ frontend-ui-engineering
  └─Debug / test in browser→ browser-testing-with-devtools
```

---

### Category 14: Deprecation & Maintenance

| Dimension | `deprecation-and-migration` | `code-simplification` |
|---|---|---|
| **What** | Remove old systems safely | Simplify existing code |
| **Who** | Engineer maintaining codebase | Developer cleaning up |
| **When** | Replacing legacy systems | After feature works, code feels heavy |
| **Where** | Codebase + consumers | Source files |
| **Why** | Code is a liability, not an asset | Reduce maintenance burden |
| **How** | Strangler pattern / expand-contract / adapters | Incremental refactor, preserve behavior |

---

## Composition Rules

Many tasks need **multiple skills**. Use this table to compose:

| Task Pattern | Skill Chain | Why |
|---|---|---|
| New feature from idea to code | `interview-me` → `idea-refine` → `spec-driven-development` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` | Extract intent → Sharpen → Spec → Build incrementally → TDD → Multi-axis review |
| Large feature (safe delivery) | `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` | Break down → Build slice-by-slice → Prove each slice |
| Refactor existing code | `improve-codebase-architecture` → `request-refactor-plan` → `code-simplification` → `test-driven-development` | Find → Plan → Simplify → Verify |
| Big project kickoff | `wayfinder` → `domain-modeling` → `ubiquitous-language` | Map work → Model domain → Define terms |
| Bug found in production | `debugging-and-error-recovery` or `diagnosing-bugs` → `test-driven-development` → `code-review` | Systematically debug → Reproduce with test → Fix → Review |
| New team member onboarding | `ubiquitous-language` → `teach` → `scaffold-exercises` | Define terms → Teach → Practice |
| Architecture decision | `grill-with-docs` → `api-and-interface-design` or `design-an-interface` → `documentation-and-adrs` → `to-spec` | Stress-test → Design → Document → Publish |
| Writing technical article | `writing-fragments` → `writing-beats` → `writing-shape` → `edit-article` | Mine → Ground → Shape → Polish |
| QA sprint | `qa` → `debugging-and-error-recovery` → `to-tickets` → `implement` | Find → Diagnose → Plan → Fix |
| Token-efficient session | `caveman` → `cavecrew` → `caveman-commit` | Compress mode → Delegate → Committed msg |
| CI/CD setup | `setup-pre-commit` → `ci-cd-and-automation` → `shipping-and-launch` | Local hooks → Pipeline → Deploy safely |
| Security audit | `security-and-hardening` → `code-review-and-quality` → `observability-and-instrumentation` | Harden → Verify → Monitor |
| Performance fix | `browser-testing-with-devtools` → `performance-optimization` → `incremental-implementation` | Profile → Fix → Ship incrementally |
| Deprecation | `deprecation-and-migration` → `documentation-and-adrs` → `shipping-and-launch` | Plan removal → Document → Execute |

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
| Agent output quality degrading | `context-engineering` (refresh context) |
| Too many skills, don't know which | `using-agent-skills` (meta-router) |
| Code getting too complex | `karpathy-guidelines` (simplify approach) |
| Web page using too many tokens | `defuddle` (extract clean content) |

---

## Priority Order

When multiple skills could apply, use this priority:

1. **Safety first** — `git-guardrails-claude-code` before any destructive git ops; `security-and-hardening` before handling sensitive data
2. **Understand before building** — `interview-me` → `idea-refine` → `spec-driven-development` before writing code
3. **Plan before code** — `grill-me` / `to-spec` / `wayfinder` / `planning-and-task-breakdown` before `implement`
4. **Spec before implementation** — `spec-driven-development` or `source-driven-development` when correctness matters
5. **Test alongside code** — `tdd` / `test-driven-development` alongside `implement` or `incremental-implementation`
6. **Build incrementally** — `incremental-implementation` for large features; thin vertical slices
7. **Doubt before committing** — `doubt-driven-development` for non-trivial decisions
8. **Review after code** — `code-review` / `code-review-and-quality` after `implement`
9. **Document decisions** — `documentation-and-adrs` / `grill-with-docs` / `to-spec` when architectural choices made
10. **Observe in production** — `observability-and-instrumentation` before shipping; `shipping-and-launch` for safe rollout
11. **Compress when pressured** — `caveman` / `cavecrew` when context limited
12. **Context refresh when quality drops** — `context-engineering` when agent output degrades
