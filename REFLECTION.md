# Reflection: AI-Augmented Development

## Learning Experience

Working with Claude Opus 4.6 and Gemini 2.5 Pro throughout this FuelEU Maritime assignment fundamentally shifted my role from line-by-line syntax writer to architectural reviewer and domain validator. The agents handled implementation velocity; I handled correctness, architectural integrity, and domain accuracy.

The steepest learning curve was Prisma 7. Both models were trained on older Prisma patterns and confidently produced deprecated syntax — `@default(autoincrement())`, outdated migration CLI commands, and missing SSL configuration for managed PostgreSQL on Render. Recognising these hallucinations required me to cross-reference the official Prisma 7 migration guide, which turned the experience into a genuine deep-dive into the ORM's internals. I now understand Prisma's client generation pipeline, relation modes, and connection pooling well enough to configure a production PostgreSQL deployment independently — something I would not have reached as quickly through passive reading.

The hexagonal architecture requirement was the other significant area of growth. Enforcing a strict boundary between `core/` and `adapters/` demands constant vigilance. Gemini in particular tended to import Express types directly into use-cases — a subtle violation that compiles cleanly but erodes testability. Catching and correcting these patterns trained me to read generated code architecturally rather than just syntactically.

## Efficiency Gains

The productivity improvement was substantial and measurable in specific areas:

**Boilerplate and scaffolding** is where AI agents delivered the most dramatic gains. The Ports & Adapters interface layer — five repository interfaces, three inbound port definitions, and the full folder structure — would have consumed the better part of a day. Both models produced this in minutes, freeing time for the genuinely complex work: the compliance balance formula, the greedy pooling allocation algorithm, and the Render deployment configuration.

**Debugging** was the second major gain. When the SSL connection failure surfaced on Render, Claude interpreted the deployment logs in context and immediately produced the `sslmode=require` fix with the correct Prisma 7 datasource configuration. Without AI assistance, this would have required significant time searching through Render's documentation and community forums.

**Test scaffolding** was faster than expected. Providing Claude with a use-case interface and asking for Vitest unit tests with mock repositories produced accurate, well-structured tests for all five core use-cases. The edge-case tests — negative CB, over-apply bank, invalid pool sum — were generated from a single prompt once the happy-path tests were validated.

## Improvements for Next Time

The single most impactful improvement would be establishing a "Source of Truth" manifest at the very start of the project. A short `TECH_VERSIONS.md` or a pinned preamble sent at the beginning of every session — `"Stack: Prisma 7, Node 22, React 19, TypeScript strict mode"` — would have eliminated the repeated corrections caused by models defaulting to older library versions. Several hours of debugging traced back to this one omission.

I would also structure prompts around test cases first. Asking the agent to write the unit test specification before the implementation produced cleaner interfaces, because the test naturally forced the agent to reason about the use-case's dependencies and outputs before writing any imperative code. This test-first prompting pattern was discovered mid-project and applied retroactively — it should be the default from the start.

Finally, I would use Claude for all architectural and domain logic decisions from the outset, and reserve Gemini for UI component generation only. The two models have different strengths, and mixing them indiscriminately on the same layer introduced inconsistencies in code style and architectural adherence that required reconciliation.

## Conclusion

AI agents are high-speed accelerators for implementation, but they are not autonomous architects. Without a clear understanding of hexagonal patterns, the FuelEU compliance domain, and the specific behaviour of Prisma 7, it would have been impossible to guide the models toward a correct, production-worthy result. The agents surfaced options and generated code quickly; the engineering judgment required to evaluate, correct, and integrate that code remained entirely human.

The most durable outcome of this project is not the codebase itself, but the depth of understanding gained through the process of correcting AI output — particularly around Prisma 7, PostgreSQL SSL, and the practical application of Ports & Adapters at scale.
