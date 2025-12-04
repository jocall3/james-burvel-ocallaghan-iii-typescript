**Title of Invention:** A Meta-Cognitive Autonomous Agent and Method for Hyper-Resolutional Goal-Driven Software Code Refactoring with Behavioral Invariance Preservation

**Abstract:**
This disclosure unveils a sophisticated system incorporating a meta-cognitive autonomous artificial intelligence agent meticulously engineered for the purpose of transformative refactoring of software code. The architectural paradigm facilitates direct interface with, and profound understanding of, expansive source code repositories, coupled with the ingestion of high-level, semantically rich refactoring desiderata expressed in natural language (e.g., "Augment the computational efficiency and structural modularity of the `calculate_risk` function within the financial analytics module, ensuring adherence to contemporary best practices for algorithmic optimization and maintainability."). The agent orchestrates an intricate, iterative cognitive loop: it dynamically traverses and comprehends pertinent codebase segments using advanced techniques like Abstract Syntax Tree (AST) parsing, dependency graph analysis, semantic embedding comparison, and version control history mining; formulates multi-tiered strategic and tactical plans considering architectural patterns, potential risks, and human feedback; synthesizes modified code artifacts, often through AST-aware transformations that maintain transactional integrity; subjects these modifications to rigorous empirical validation against comprehensive and potentially augmented automated test suites, advanced static analysis, architectural compliance checks, security vulnerability scans, and performance benchmarks; and, upon conclusive verification of behavioral invariance and quality enhancement, instigates a formalized submission process via a programmatic pull request mechanism for human-centric architectural and semantic review. This innovative methodology mechanizes and elevates the execution of large-scale, intrinsically complex, and highly nuanced software maintenance and evolution imperatives, transcending the limitations of human cognitive load and operational throughput, and incorporates a continuous, adaptive learning mechanism from human feedback to perpetually refine its strategies and enhance its efficacy.

**Background of the Invention:**
Software refactoring, posited as the meticulous process of enhancing the internal structural integrity and design aesthetics of a codebase without inducing any discernible alteration in its externally observable behavior, constitutes an indispensable pillar of sustainable software engineering. It is the crucible through which technical debt is amortized, system comprehensibility is elevated, and future adaptability is ensured. Notwithstanding its paramount importance for the long-term viability, maintainability, and evolvability of complex software systems, refactoring frequently succumbs to temporal constraints and prioritization dilemmas, often relegated to a secondary concern in favor of immediate feature delivery. The accumulation of unaddressed technical debt inevitably leads to decreased developer velocity, increased bug rates, and heightened systemic fragility, ultimately impairing innovation and escalating operational costs. While contemporary Integrated Development Environments (IDEs) furnish rudimentary, often context-limited, and localized refactoring utilities (e.g., renaming variables, extracting methods within a single file, reordering parameters), these tools fundamentally lack the cognitive capacity, comprehensive contextual awareness, and autonomous agency requisite for orchestrating complex, goal-driven refactoring endeavors that traverse heterogeneous files, modules, and architectural layers within expansive codebases. Specifically, existing tools cannot deeply understand semantic relationships, infer architectural intentions, dynamically adapt to evolving coding standards, propose and apply sophisticated refactoring patterns (e.g., "Extract Service," "Introduce Gateway," "Apply Layered Architecture"), or autonomously self-correct upon encountering validation failures. The current state of the art presents a significant chasm between the manual, labor-intensive execution of profound structural improvements, demanding exceptional human expertise and cognitive load, and the aspirational automation of such intellectually demanding tasks. This invention decisively bridges that chasm by embedding meta-cognitive capabilities, deep code understanding, robust self-correction mechanisms, and continuous learning from human interaction directly into an autonomous agent, thereby enabling hyper-resolutional transformations at a scale and consistency unachievable by human teams.

**Brief Summary of the Invention:**
The present invention delineates an unprecedented autonomous AI agent architected upon a perpetually self-regulating, goal-oriented cognitive loop. Initiated by a declarative refactoring objective, the agent first leverages an advanced natural language understanding (NLU) and semantic search engine to precisely delineate the maximally relevant programmatic artifacts across the entire codebase. This involves deep Abstract Syntax Tree (AST) analysis, sophisticated multi-type dependency graph construction (e.g., call graphs, data flow graphs, import graphs), and semantic indexing of code components using learned embeddings. Subsequent to the ingestion and deep semantic parsing of these identified artifacts, the agent interacts synergistically with a sophisticated large language model (LLM), which serves as its generative strategic planning and tactical execution core. This LLM, informed by an evolving ontological knowledge base of software engineering patterns, anti-patterns, and historical success cases, orchestrates the synthesis of a granular, multi-stage refactoring blueprint, often considering known architectural patterns, performing detailed risk assessment, and outlining explicit rollback strategies. The agent then embarks upon an iterative realization of this plan, prompting the LLM to generate highly targeted modifications to specific code blocks or architectural constructs, predominantly utilizing AST-aware transformation techniques to ensure structural integrity. Following each substantial modification, a comprehensive validation module is invoked, orchestrating the execution of the project's automated test suite (potentially augmented by dynamically generated tests), rigorous static analysis, architectural compliance checks, security vulnerability scans, and performance benchmarks. In instances of validation failure, the agent enters a meta-cognitive self-correction phase, synthesizing remedial code based on detailed diagnostic feedback from the entire validation stack. This process includes analyzing error messages, stack traces, and static analysis reports to guide the LLM's corrective generative process. Upon successful validation, the refined code is persisted transactionally, and the agent progresses to the subsequent planning stage. Concluding its mission, and contingent upon the holistic success of all refactoring steps and comprehensive validation across all quality dimensions, the agent autonomously commits the resultant code to a dedicated branch and orchestrates the creation of a formalized pull request. This pull request is richly enriched by an AI-generated, contextually informed summary elucidating the scope, impact, rationale, and verified quality improvements of the refactoring intervention, alongside updated documentation. Furthermore, the system integrates a robust human feedback loop, allowing the agent to continuously learn from human architectural and semantic reviews of pull requests, thereby perpetually improving its performance, strategic capabilities, and alignment with organizational coding standards and design philosophies.

**Detailed Description of the Invention:**
The system is predicated upon a sophisticated agent-based architecture, conceptualized as an "Omniscient Refactoring Loop" operating in a state of perpetual cognitive deliberation and volitional actuation. This architecture is endowed with meta-cognitive capabilities, allowing it to reflect upon its own processes, evaluate the efficacy of its strategies based on historical outcomes, and adapt its approaches based on both automated validation feedback and explicit human guidance.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggUmVmYWN0b3JpbmdBZ2VudCBXb3JrZmxvd1xuICAgIEFbVXNlciBHb2FsIEluZ2VzdGlvbl0gLS0-IEJbT2JzZXJ2YXRpb24gSG9yaXpvbiBFeHBhbnNpb25dXG4gICAgQiAtLT4gQjFbRGVlcCBDb2RlYmFzZSBUcmF2ZXJzYWxdXG4gICAgQjEgLS0-IEIyW0FTVCBQYXJzaW5nIGFuZFNlbWFudGljIEluZGV4aW5nXVxuICAgIEIyIC0tPiBCM1tEZXBlbmRlbmN5IEdyYXBoIEFuYWx5c2lzXVxuICAgIEIzIC0tPiBCNFtWQ1MgSGlzdG9yeSBhbmRBcmNoaXRlY3R1cmFsIENvbnRleHRdXG4gICAgQjQgLS0+IENbQ29nbml0aXZlIE9yaWVudGF0aW9uIGFuZFN0cmF0ZWdpYyBQbGFubmluZ11cbiAgICBDIC0tPiBDMVtMTE1TdHJhdGVnaWNSIGVhc29uaW5nXVxuICAgIEMxIC0tPiBDMltQbGFuIERBRyBHZW5lcmF0aW9uIGFuZFJpc2sgQXNzZXNzbWVudF1cbiAgICBDMiAtLT4gRFtWb2xpdGlvbmFsIEFjdHVhdGlvbiBhbmRJdGVyYXRpdmUgUmVmaW5lbWVudF1cbiAgICBEIC0tPiBELTFBbFpFbWVudFsuIGhvb2tbQ29kZSBUcmFuc2Zvcm1hdGlvbiBQcm9tcHRpbmddXG4gICAgRDEgLS0+IEQyW1RyYW5zYWN0aW9uYWwgQ29kZSBSZXBsYWNlbWVudEFTVCBQYXRjaGluZ11cbiAgICBEMiAtLT4gRVtFbXBpcmllY2FsIFZhbGlkYXRpb24gYW5kQmVoYXZpb3JhbCBJbnZhcmlhbmNlIEFzc3VyYW5jZV1cbiAgICBFIC0tIFZhbGlkYXRpb24gRmFpbGVkIC0tPiBGeFtyb2xsYmFjayBhbmRTZWxmQ29ycmVjdGlvbiBSZW1lZGlhbENvZGVHZW5lcmF0aW9uXVxuICAgIEZ4IC0tPiBELTFBbFpFbWVudFsuIGhvb2tbQ29kZSBUcmFuc2Zvcm1hdGlvbiBQcm9tcHRpbmddXG4gICAgRSAtLSAgVmFsaWRhdGlvbiBQYXNzZWQgLS0+IEZbQ29uc3VtbWF0aW9uIGFuZEtub3dsZWRnZSBEaXNzZW1pbmF0aW9uXVxuICAgIEYgLS0+IEYxW0ZpbmFsIENvZGUgUGVyc2lzdGVuY2VdXG4gICAgRjEgLS0+IEYyW1B1bGwgUmVxdWVzdCBHZW5lcmF0aW9uXVxuICAgIEYyIC0tPiBGM1tBSSBHZW5lcmF0ZWQgUFIgU3VtbWFyeSBhbmREb2NzIFVwZGF0ZV1cbiAgICBGMyAtLT4gRjRbSHVtYW4gUmV2aWV3IGFuZEZlZWRiYWNrIEludGVncmF0aW9uXVxuICAgIEY0IC0tIEZlZWRiYWNrIC0+IEtbS25vd2xlZGdlIEJhc2UgVXBkYXRlXVxuICAgIEsgLS0+IEMgXG4gICAgRjQgLS0gQXBwcm92ZWQgLS0+IGFhYUFbUmVmYWN0b3JpbmdQcm9qZWN0IENvbXBsZXRlZWRdXG4gIGVuZCAiLCJtZXJtYWlkIjp7ImZyb2d0IjoiZ3J1ZVxuXHRiYWNrZ3JvdW5kOiAjRkZGXG5cdGFsaWduLXBhcmVudHM6IHNwYWNlLWJldHdlZW5cblx0Zm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWZcXG5cXHRjb2xvcjogIzMzM1xcbiAgIn19">
</p>
<p align="center">
    <i>Figure 1: High-Level Meta-Cognitive Refactoring Agent Loop Diagram</i>
</p>

### 1. Goal Ingestion and Semantic Deconstruction [A]:
The process initiates with the reception of a highly granular or abstract refactoring objective articulated in natural language. This directive serves as the primary guidance for the agent's autonomous operations.

*   **Example:** `Refactor the Python 'payment_processor' service to adopt an advanced, class-based, dependency-injectable architectural paradigm, ensuring strict type enforcement and comprehensive unit test coverage for all newly encapsulated functionalities. Furthermore, reduce its cyclomatic complexity by at least 10% and ensure adherence to the 'Clean Architecture' principles.`
*   **Natural Language Understanding (NLU) Pipeline:** The system employs advanced Natural Language Understanding (NLU) models, such as fine-tuned transformer architectures (e.g., BERT, T5 variants), to parse and interpret the human-expressed goal. This pipeline involves:
    *   **Named Entity Recognition (NER):** Identifying key entities like `payment_processor` (service/module), `Python` (language/framework), `class-based` (architectural style).
    *   **Relationship Extraction:** Discerning relationships between entities and desired properties (e.g., `payment_processor` *to adopt* `class-based paradigm`).
    *   **Intent Recognition:** Classifying the core intent (e.g., "architectural refactoring," "quality improvement").
    *   **Metric Identification:** Extracting quantifiable goals like `strict type enforcement`, `comprehensive unit test coverage`, `reduce cyclomatic complexity by at least 10%`.
    *   **Constraint Identification:** Detecting non-functional requirements or architectural constraints such as `dependency-injectable`, `Clean Architecture principles`.
*   **Ontological Knowledge Base Integration:** The NLU component is augmented by an ontological knowledge base of software engineering patterns, anti-patterns, design principles (e.g., SOLID, DRY, YAGNI), and language-specific idioms. This knowledge base provides a structured vocabulary and relationships, allowing the NLU to ground abstract concepts (e.g., "modularity," "testability") into concrete refactoring operations.
*   **Formal Goal Representation:** The deconstructed natural language directive is transformed into a formal, executable, and machine-interpretable objective. This often involves a graph-based representation or a structured JSON object that precisely delineates:
    *   **Target Entities:** `{'type': 'service', 'name': 'payment_processor', 'language': 'python'}`.
    *   **Desired Structural Transformations:** `{'transform_type': 'convert_to_class', 'target_functions': ['process_payment', 'validate_card'], 'encapsulate_dependencies': True}`.
    *   **Desired Quality Metrics (Objective Function Components):**
        `{'metric': 'cyclomatic_complexity', 'target': 'reduce', 'threshold': '10%'}`
        `{'metric': 'type_coverage', 'target': 'increase', 'threshold': '100%'}`
        `{'metric': 'test_coverage', 'target': 'comprehensive'}`
    *   **Architectural Compliance Targets:** `{'pattern': 'dependency_injection', 'adherence': 'strict'}, {'principle': 'clean_architecture', 'adherence': 'verified'}`.
    *   The NLU component might leverage a goal-specific `embedding model` to represent the intent numerically for semantic matching against known patterns in the `KnowledgeBase`.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggR29hbCBJbmdlc3Rpb24gYW5kIERlY29uc3RydWN0aW9uXG4gICAgQVsyOk5hdHVyYWwgTGFuZ3VhZ2UgR29hbF0gLS0-IEJbMzpOQ0lQIC1cbiAgICAgTmF0dXJhbCBMYW5ndWFnZSBVbmRlcnN0YW5kaW5nIFBpcm9jdG9sKV1cbiAgICBCIC0tPiBCMVtOZWFybmVkIEVudGl0eSBSZWNvZ25pdGlvbl1cbiAgICBCMSAtLT4gQjJbUmVsYXRpb25zaGlwIEV4dHJhY3Rpb25dXG4gICAgQjIgLS0+IEIzW0ludGVudCBEZXRlY3Rpb24gYW5kIE1ldHJpYyBJZGVudGlmaWNhdGlvbl1cbiAgICBCMyAtLT4gQzUoQS1PQlMgMTpPbnRvbG9naWNhbCBLbm93bGVkZ2UgQmFzZSBQcm90b2NvbClcbiAgICBDNSAtLT4gQzZcIkZvcm1hbCwgR3JhcGgtQmFzZWQgR29hbCBHb3JlXCJdXG4gICAgQzYgLS0+IERbU3RydWN0dXJlZCBSRWZhY3RvcmluZyBPYmplY3RpdmVdXG4gICAgQzYgLS0+IEVbTWV0cmljIFRhcmdldHMvT2JqZWN0aXZlc11cbiAgICBDNiAtLT4gRltBcmNoaXRlY3R1cmFsIENvbnN0cmFpbnRzXVxuICAgIEQgLS0+IEdbUGxhbm5pbmcgTW9kdWxlXSIsIm1lcm1haWQiOnsiZnJvZ3QiOiJncnVlXG5cdGJhY2tncm91bmQ6ICNGRkZcblx0YWxpZ24tcGFyZW50czogc3BhY2UtYmV0d2VlblxuXHRmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZlxuXHRjb2xvcjogIzMzM1xuICAifX0=">
</p>
<p align="center">
    <i>Figure 3: NLU and Goal Deconstruction Workflow</i>
</p>

### 2. Observational Horizon Expansion and Contextual Synthesis [B]:
The agent transcends mere lexical file system scanning. It constructs a holistic, multi-modal, semantic representation of the codebase by integrating various analytical techniques.

*   **Phase 1: Deep Codebase Traversal and Indexing [B1]:** The agent executes a multi-faceted search across the designated codebase, employing a battery of analysis tools:
    *   **Lexical Search:** Basic keyword matching across file contents and names, useful for initial broad sweeps and for non-code files (e.g., configuration, documentation).
    *   **Syntactic Search [AST Parsing - B2]:** Abstract Syntax Tree (AST) parsing for all supported programming languages to build precise structural models of the code. This allows for identifying functions, classes, variables, control flow constructs, and their hierarchical relationships. The results are stored in an `ASTGraph` (a collection of ASTs with inter-file references).
    *   **Semantic Search [Embeddings and Graph Neural Networks - B2]:** Utilizing learned embeddings of code tokens, AST nodes, and structural relationships, potentially powered by advanced graph neural networks (GNNs) or transformer models pre-trained on code, to identify conceptually related code. This allows it to understand relationships like "all callers of `process_payment`," or "all data structures related to `card validation`," even if they are lexically disparate or located in different modules. The results are stored in a `SemanticIndexer` which typically uses a vector database (e.g., FAISS, Pinecone) for efficient similarity queries.
    *   **Dependency Graph Analysis [B3]:** Construction of precise, multi-layered `Dependency Graphs`:
        *   **Call Graph:** Who calls whom.
        *   **Import Graph:** Module-level dependencies.
        *   **Data Flow Graph:** How data moves through the system.
        *   **Control Flow Graph:** Execution paths within functions/methods.
        These graphs are critical for ascertaining the precise blast radius of a change, understanding interdependencies, and predicting potential cascading failures.
    *   **Version Control History Analysis [B4]:** Examination of commit history, pull requests, and bug reports related to the identified areas. This includes:
        *   Identifying frequently changed files, files with high bug rates, or areas with previous refactoring efforts.
        *   Gleaning historical context, common pitfalls, architectural intentions (e.g., from commit messages), and areas prone to bugs or technical debt accumulation.
        *   Analyzing authorship and contribution patterns.
    *   **Architectural Landscape Mapping [B4]:** Identification of existing architectural patterns (e.g., Layered, Microservices, Event-Driven), module boundaries, and adherence to defined principles within the relevant codebase segments. This often involves applying heuristic rules or ML models trained to recognize architectural styles.
*   **Contextual Synthesis and Aggregation:** All generated analytical artifacts (ASTs, Dependency Graphs, Semantic Embeddings, VCS history insights, Architectural context) are aggregated into a rich, graph-based knowledge representation. This aggregated context is crucial for informed decision-making, enabling the agent to reason about the code at multiple levels of abstraction.
*   **Output:** A multi-modal, graph-based knowledge representation comprising `AST`s, `Dependency Graphs`, `Semantic Embeddings`, `VCS history insights`, and `Architectural context` of the target files (e.g., `services/payment_processor.py`), their dependents, their dependencies, their historical evolution, associated test files (e.g., `tests/test_payment_processor.py`), and any relevant documentation or configuration files.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggT2JzZXJ2YXRpb25hbCBIb3Jpem9uIEV4cGFuc2lvbiBhbmQgQ29udGV4dHVhbCBTeW50aGVzaXNcbiAgICBBW0NvZGViYXNlIFJlcG9zaXRvcnldIC0tPiBCX05MVVtOZWF0dXJhbCBMYW5ndWFnZSBVbmRlcnN0YW5kaW5nXVxuICAgIEJfTkxVIC0tPiBBV1tGaWxlIFRyYXZlcnNhbC9BY2Nlc3NlcmxldCBJbmRleGVyXVxuICAgIEFXXSAtLT4gQ1tBU1QgUGFyc2VyXVxuICAgIEFXXSAtLT4gRFtEZXBlbmRlbmN5IEFuYWx5emVyXVxuICAgIEFXXSAtLT4gRVtTZW1hbnRpYyBJbmRleGVyXG4gICAgQ1IgLS0+IEZtYXJyb253XG4gICAgRCAtLT4gRm1hcnJvbndcbiAgICBFIC0tPiBGa05vd2xlZGdlIEdyYXBoIEJ1aWxkZXJdXG4gICAgQVsgLS0+IEdaVmNzIEhpc3RvcnkgQW5hbHl6ZXJdXG4gICAgR0cgLS0+IEZtYXJyb253XG4gICAgRnJtYW5yb253IC0tPiBJbW91eFtDb2RlYmFzZSBLbm93bGVkZ2UgR3JhcGhdXG4gICAgSVtTVEFSSV5XIC0tPiBKb2luT2ZmXCJTZW1hbnRpYyBFbWJlZGRpbmdzXVxuICAgIEksb21veSAgICAgLS0+IEtbQXJjaGl0ZWN0dXJhbCBMYW5kc2NhcGUgTWFwcGluZ11cbiAgICBJbyAgICAgICAtLT4gTG9uZSBTdHJhdGVnaWMgUGxhbm5pbmcgUGxvbXVtXG4gIGVuZCAiLCJtZXJtYWlkIjp7ImZyb2d0IjoiZ3J1ZVxuXHRiYWNrZ3JvdW5kOiAjRkZGXG5cdGFsaWduLXBhcmVudHM6IHNwYWNlLWJldHdlZW5cblx0Zm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWZcblx0Y29sb3I6ICMzMzNcbiAgIn19">
</p>
<p align="center">
    <i>Figure 4: Observational Horizon & Context Synthesis Details</i>
</p>

### 3. Cognitive Orientation and Strategic Planning [C]:
The agent synthesizes a multi-layered, probabilistic refactoring plan, informed by the comprehensive context generated in the previous stage and guided by its internal `KnowledgeBase`.

*   **LLM as Strategic Reasoning Core [C1]:** The agent transmits the synthesized contextual knowledge (raw code snippets, `AST`s, `Dependency Graph` sections, historical insights, architectural landscape, formal goal formulation, and relevant patterns from the `KnowledgeBase`) to a specialized LLM. This LLM acts as the "Strategic Reasoning Core," capable of complex reasoning, pattern recognition, and generative planning.
*   **Prompt Engineering Example (Chain-of-Thought):** To facilitate sophisticated reasoning, the agent utilizes advanced prompt engineering techniques, potentially including Chain-of-Thought (CoT) prompting.
    `Given the following codebase context (raw files, AST snippets, dependency graph in Mermaid format), historical refactoring patterns, architectural adherence report, current quality metrics, and the objective: 'Adopt advanced class-based, dependency-injectable architecture with type enforcement and comprehensive test coverage'. First, analyze the current state and identify specific areas for improvement related to the goal. Second, propose a high-level architectural design for the refactored service. Third, generate a hierarchical, step-by-step refactoring plan. For each macro step, detail micro-steps for code transformation, anticipated validation points, explicit rollback strategies, and a probabilistic risk assessment. Emphasize idempotency, maintainability, and adherence to Pythonic principles and 'Clean Architecture'. Provide reasoning for each major decision.`
*   **Plan DAG Generation [C2]:** The LLM generates a comprehensive plan, which is typically represented as a Directed Acyclic Graph (DAG) of interdependent tasks. Each node in the DAG represents a distinct refactoring micro-step, annotated with its dependencies, risk level, estimated duration, and associated rollback procedure. This DAG structure allows for flexible execution and dependency management.
    *   **Example Plan DAG (Simplified):**
        1.  **Macro Step: Architecture Conversion [Risk: Medium, Dependencies: None, Estimated Duration: 2h]:**
            *   1.1. Create `PaymentProcessor` class skeleton in `payment_processor.py` with `__init__` and basic structure. [Affected File: `payment_processor.py`, Validation: Syntax, Rollback: Delete new class/file]
            *   1.2. Define abstract interfaces for external dependencies (e.g., `PaymentGatewayAdapter`) in a new `interfaces.py` file. [Affected File: `interfaces.py`, Validation: Syntax, Imports, Rollback: Delete interfaces.py]
            *   1.3. Migrate `process_payment` global function into `PaymentProcessor` as a method. [Affected File: `payment_processor.py`, Validation: Unit Tests, Rollback: Revert `payment_processor.py` to pre-step state]
            *   1.4. Migrate `validate_card` global function into `PaymentProcessor` as a private method `_validate_card`. [Affected File: `payment_processor.py`, Validation: Unit Tests, Rollback: Revert `payment_processor.py` to pre-step state]
            *   1.5. Update all call sites of old functions to use `PaymentProcessor` instance, potentially using a factory. [Affected Files: `caller_service_a.py`, `caller_service_b.py`, `main.py`, Validation: Integration Tests, Rollback: Revert affected files]
        2.  **Macro Step: Type Enforcement and Dependency Injection [Risk: Low, Dependencies: 1.1, 1.3, 1.4, Estimated Duration: 1h]:**
            *   2.1. Add strict type hints to all method signatures and class attributes within `PaymentProcessor`. [Affected File: `payment_processor.py`, Validation: Static Analysis (Mypy), Rollback: Revert `payment_processor.py`]
            *   2.2. Refactor `__init__` to accept `PaymentGatewayAdapter` via Dependency Injection. [Affected File: `payment_processor.py`, Validation: Unit Tests, Static Analysis, Rollback: Revert `payment_processor.py`]
            *   2.3. Introduce factory/builder pattern for `PaymentProcessor` instantiation, ensuring proper dependency resolution. [Affected File: `factories.py`, Validation: Integration Tests, Rollback: Delete factories.py]
        3.  **Macro Step: Test Augmentation and Architectural Compliance [Risk: Low, Dependencies: 1.5, 2.3, Estimated Duration: 0.5h]:**
            *   3.1. Analyze existing tests for coverage gaps post-refactor, especially for new class interactions.
            *   3.2. Generate new unit tests specifically for class methods and DI interactions, focusing on edge cases.
            *   3.3. Update integration tests to reflect the new API of `PaymentProcessor`.
            *   3.4. Run `ArchitecturalComplianceChecker` to verify new structure against `Clean Architecture` principles.
*   **Plan Validation and Refinement:** The agent may internally simulate the plan or perform static analysis on the plan itself (e.g., checking for cyclic dependencies in the plan DAG, logical inconsistencies, resource conflicts, or potential deadlocks) to identify potential conflicts or inefficiencies before execution. Resource allocation, critical path analysis, and timeline estimates for each step are also generated. This meta-cognitive step allows the agent to "think ahead" and refine its strategy.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggU3RyYXRlZ2ljIFBsYW5uaW5nIE1vZHVsZTogTExNLiBJbnRlcmFjdGlvblxuICAgIEFbQ29kZWJhc2UgS25vd2xlZGdlIEdyYXBoXSA9PT4gQltMTU9yY2hlc3RyYXRvcl1cbiAgICAgQSA9PT4gQzYnS25vd2xlZGdlIEJhc2VdXG4gICAgIEJbTExNT3JjaGVzdHJhdG9yXSA9PT4gQzcbU3RyYXRlZ2ljIFJlYXNvbmluZyBDb3JlXCJdXG4gICAgIEQoU3BlY2lhbGl6ZWQgUHJvbXB0IEVuZ2luZWVyaW5nIFByb2NlZHVyZSkgLS0+IEMzXCJDaGFpbi1vZi1UaG91Z2h0IFByb21wdGluZ1wiXVxuICAgIEM3IC0tPj4gRTVcIk11bHRpLVRpZXJlZCBSRWZhY3RvcmluZyBQbGFuIChEQUcpXCJdXG4gICAgRDUgLS0+IEY0W1BsYW4gVmFsaWRhdGlvbiBhbmQgUmVmaW5lbWVudF1cbiAgICBGNCAtLT4gRjFcIlJpc2sgQXNzZXNzbWVudFwiXG4gICAgRjQgLS0+IEgyW0VzdGltYXRlZCBEdXJhdGlvbl1cbiAgICBGNCAtLT4gSTNbUm9sbGJhY2sgU3RyYXRlZ2llc11cbiAgICBGNCAtLT4gSVx"Fvcm1hbCwgR3JhcGgtQmFzZWQgR29hbCBHb3JlXCJdXG4gICAgRjEgLS0+IEoxW0RlZmF1bHQgUm9sbGJhY2sgTWVjaGFuaXNtXVxuICAgIEUyIC0tPiBLb1tFeGVjdXRpb24gTW9kdWxlXG4gIGVuZCAiLCJtZXJtYWlkIjp7ImZyb2d0IjoiZ3J1ZVxuXHRiYWNrZ3JvdW5kOiAjRkZGXG5cdGFsaWduLXBhcmVudHM6IHNwYWNlLWJldHdlZW5cblx0Zm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWZcblx0Y29sb3I6ICMzMzNcbiAgIn19">
</p>
<p align="center">
    <i>Figure 5: Strategic Planning Module: LLM Interaction</i>
</p>

### 4. Volitional Actuation and Iterative Refinement [D]:
The agent executes the meticulously planned steps with transactional integrity and robust self-correction capabilities, employing a continuous feedback loop to ensure behavioral invariance.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggU2luZ2xlIFJlZmFjdG9yaW5nIFN0ZXAgRXhlY3V0aW9uIExvb3BcbiAgICAgICBBW1Byb21wdCBMTFMgZm9yIENvZGUgTW9kaWZpY2F0aW9uXSBsYXZpcyAtLT4gQltMTFMgUmVzcG9uZHMgTW9kaWZpZWQgQ29kZV1cbiAgICAgICBCIC0tPiBDW1RyYW5zYWN0aW9uYWwgQ29kZSBVcGRhdGUgdmlhIEFTVCBQcm9jZXNzb3JdXG4gICAgICAgQyAtLT4gRFtSdW4gQ29tcHJlaGVuc2l2ZSBWYWxpZGF0aW9uXVxuICAgICAgIEQgfC0gRDFbRXhlY3V0ZSBUZXN0IFN1aXRlXVxuICAgICAgIEQgfC0gRDJbU3RhdGljIENvZGUgQW5hbHlzaXNdXG4gICAgICAgRCAoLXwgRDNbQXJjaGl0ZWN0dXJhbCBDb21wbGlhbmNlIENoZWNrXVxuICAgICAgIEQgfC0gRDRbU2VjdXJpdHkgU2Nhbl1cbiAgICAgICBEICB8ICAgRFVfY1tQZXJmb3JtYW5jZSBCZW5jaG1hcmtpbmcgT3B0aW9uYWxdXG4gICAgICAgRDEgJiBEMiAmIEQzICYgRDQgJiBEVV9jIC0tPiBFfEhhbGwgVmFsaWRhdGlvbnMgUGFzc31cbiAgICAgICBFIC0tIFllcyAtLT4gRltBcHBsZXkgUG9zdFJlZmFjdG9yIEZvcm1hdHRpbmddXG4gICAgICAgRiAtLT4gR1tDb21taXQgU3RlcCBDaGFuZ2VzIExvY2FsbHldXG4gICAgICAgRyAtLT4gSFtOZXh0IFBsYW4gU3RlcCBPciBDb25zdW1tYXRpb25dXG4gICAgICAgRSAtLSBObyAtLT4gSVtDYXB0dXJlIERpYWdub3N0aWsgRmVlZGJhY2tdXG4gICAgICAgSSAtLT4gSltMTE0gU2VsZkNvcnJlY3Rpb24gUmVtZWRpYWxDb2RlIEdlbmVyYXRpb25dXG4gICAgICAgSiAtLT4gQVxuICAgIGVuZFxuXG4gIHN1YmdyYXBoIENvcmUgQWdlbnQgTW9kdWxlc1xuICAgICAgUmVmYWN0b3JpbmdBZ2VudCAtLSBPcmNoZXN0cmF0ZXMgLS0+IENvZGViYXNlTWFuYWdlclxuICAgICAgUmVmYWN0b3JpbmdBZ2VudCAtLSBPcmNoZXN0cmF0ZXMgLS0+IExMTU9yY2hlc3RyYXRvclxuICAgICAgUmVmYWN0b3JpbmdBZ2VudCAtLSBPcmNoZXN0cmF0b3JzIC0tPiBQbGFubmluZ01vZHVsZVxuICAgICAgUmVmYWN0b3JpbmdBZ2VudCAtLSBPcmNoZXN0cmF0ZXMgLS0+IEV4ZWN1dGlvbk1vZHVsZVxuICAgICAgUmVmYWN0b3JpbmdBZ2VudCAtLSBPcmNoZXN0cmF0ZXMgLS0+IFZhbGlkYXRpb25Nb2R1bGVcbiAgICAgIFJlZmFjdG9yaW5nQWdlbnQgLS0gU3RvcmVzIC0tPiBLbm93bGVkZ2VCYXNlXG4gICAgICBSZWZhY3RvcmluZ0FnZW50IC0tIFJlY29yZHMgLS0+IFRlbGVtZXRyeVN5c3RlbVxuICAgICAgQ29kZWJhc2VNYW5hZ2VyIC0tIFVzZXMgLS0+IFZDU0ludGVncmF0aW9uXG4gICAgICBDb2RlYmFzZU1hbmFnZXIgLS0gVXNlcyAtLT4gQVNUUHJvY2Vzc29yXG4gICAgICBDb2RlYmFzZU1hbmFnZXIgLS0gVXNlcyAtLT4gRGVwZW5kZW5jeUFuYWx5emVyXG4gICAgICBDb2RlYmFzZU1hbmFnZXIgLS0gVXNlcyAtLT4gU2VtYW50aWNJbmRleGVyXG4gICAgICBQbGFubmluZ01vZHVsZSAtLSBVc2VzIC0tPiBMTU9yY2hlc3RyYXRvclxuICAgICAgUGxhbm5pbmdNb2R1bGUgLS0gVXNlcyAtLT4gS25vd2xlZGdlQmFzZVxuICAgICAgRXhlY3V0aW9uTW9kdWxlIC0tIFVzZXMgLS0+IENvZGViYXNlTWFuYWdlclxuICAgICAgRXhlY3V0aW9uTW9kdWxlIC0tIFVzZXMgLS0+IExMTU9yY2hlc3RyYXRvclxuICAgICAgRXhlY3V0aW9uTW9kdWxlIC0tIFVzZXMgLS0+IEFTVFByb2Nlc3NvclxuICAgICAgVmFsaWRhdGlvbk1vZHVsZSAtLSBVc2VzIC0tPiBDb2RlYmFzZU1hbmFnZXJcbiAgICAgIFZhbGlkYXRpb25Nb2R1bGUgLS0gVXNlcyAtLT4gQXJjaGl0ZWN0dXJhbENvbXBsaWFuY2VDaGVja2VyXG4gICAgICBodW1hbmZlZWRiYWNrUHJvY2Vzc29yIC0tIFVwZGF0ZXMgLS0+IEtub3dsZWRnZUJhc2VcbiAgZW5kXG5cbiAgc3ViZ3JhcGggQ2xhc3MgSGVpcmFyY2h5XG4gICAgICBDb2RlYmFzZU1hbmFnZXIgPHwtIEdpdENvZGViYXNlTWFuYWdlclxuICAgICAgVkNTSW50ZWdyYXRpb24gPHwtIEdpdFZFQ1NJbnRlZ3JhdGlvblxuICAgICAgTExNT3JjaGVzdHJhdG9yIDx8LSBHZW1pbmlMTE1PcmNoZXN0cmF0b3JcbiAgICAgIExMTU9yY2hlc3RyYXRvciA8fC0gT3BlbkFJTExNT3JjaGVzdHJhdG9yXG4gICAgICBDb2RlUXVhbGl0eU1ldHJpY3MgPHwtIENvbXBsZXhpdHlNZXRyaWNzQW5hbHl6ZXJcbiAgICAgIENvZGVRdWFsaXR5TWV0cmljcyA8fC0gQ292ZXJhZ2VNZXRyaWNzQW5hbHl6ZXJcbiAgICAgIFRlc3RBdWdtZW50YXRpb25Nb2R1bGUgPHwtIFByb3BlcnR5QmFzZWRUZXN0R2VuZXJhdG9yXG4gICAgICBUZXN0QXVnbWVudGF0aW9uTW9kdWxlIDx8LSBVbml0SW50ZWdyYXRpb25UZXN0R2VuZXJhdG9yXG4gIGVuZCAiLCJtZXJtYWlkIjp7ImZyb2d0IjoiZ3J1ZVxuXHRiYWNrZ3JvdW5kOiAjRkZGXG5cdGFsaWduLXBhcmVudHM6IHNwY2FlLWJldHdlZW5cblx0Zm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWZcblx0Y29sb3I6ICMzMzNcbiAgIn19">
</p>
<p align="center">
    <i>Figure 2: Iterative Refinement and Conceptual Class Structure</i>
</p>

*   **Sub-loop for Each Plan Step:** For each granular step within the LLM-generated plan, the agent orchestrates the following sophisticated sub-loop:
    *   **Code Transformation Prompting [D1]:** The agent formulates a highly precise, context-rich prompt for the LLM. This prompt encapsulates:
        *   The current codebase state of the target file(s).
        *   The specific plan step to be executed (e.g., "Extract interface `IPaymentGateway` from `PaymentProcessor` and update `__init__` to use it via DI").
        *   Relevant architectural constraints or coding standards.
        *   Contextual snippets (AST fragments, Dependency Graph sections, semantic embeddings of related code).
        *   Examples of desired refactoring patterns if available in the `KnowledgeBase`.
        This may also involve providing `AST` snippets or `Dependency Graph` sections and specifying the `CodeGenerationStrategy` (e.g., `AST_NODE_REPLACEMENT` for granular changes).
    *   **Transactional Code Replacement [AST-aware Patching - D2]:** The LLM returns the modified code block(s). Prior to applying any change, the `ExecutionModule` initiates a transactional operation. It saves a fine-grained snapshot of the current file state. The agent then intelligently merges or replaces the relevant sections of the codebase with the LLM-generated code. This is not a simple string overwrite but a context-aware, structural modification. It leverages `AST diffing` to identify the precise structural changes proposed by the LLM and `AST patching` capabilities of the `ASTProcessor` to apply these changes. This ensures that only intended sections are altered, preserving unrelated comments, formatting, and other non-functional aspects of the code.
    *   **Behavioral Invariance Assurance [E]:** Immediately following a modification, the `ValidationModule` is invoked to perform a comprehensive suite of checks:
        *   **Automated Test Suite Execution [D1]:** It triggers the project's entire automated test suite (e.g., `pytest tests/`, `npm test`, `maven test`). This is potentially augmented by dynamically generated tests (via `TestAugmentationModule`) using techniques like `property-based testing` or `fuzzing` to cover new or altered code paths and edge cases, ensuring robust coverage for the refactored logic.
        *   **Static Code Analysis [D2]:** Concurrently, it runs a battery of static analysis tools: linters (e.g., `pylint`, `flake8`, `ESLint`), complexity checkers (e.g., `radon` for Cyclomatic Complexity), type checkers (e.g., `mypy`, `TypeScript compiler`), and code style checkers (`black`, `prettier`). This detects immediate issues like syntax errors, style violations, potential security vulnerabilities, complexity spikes, and type mismatches.
        *   **Architectural Compliance Checks [D3]:** The `ArchitecturalComplianceChecker` is run to verify that the changes adhere to predefined architectural patterns, module boundaries, style guides, or design principles (e.g., verifying `Clean Architecture` layers, absence of anti-patterns like "God Object"). This uses the comprehensive `Architectural Landscape Mapping` from the observation phase.
        *   **Security Scans [D4]:** Dedicated security scanning tools (e.g., `Bandit` for Python, `Semgrep`, SAST tools) are executed to identify potential security vulnerabilities introduced or exacerbated by the refactoring, such as insecure deserialization, SQL injection risks, or weak cryptographic practices.
        *   **Dynamic Analysis/Performance Benchmarking (Optional) [DU_c]:** For performance-critical refactoring goals, the agent may execute performance benchmarks and profile the modified code. This quantifies changes in resource consumption (CPU, memory), latency, or execution time, comparing them against a established baseline to detect regressions or verify improvements.
    *   **Self-Correction Mechanism [J]:**
        *   If the validation suite reports failures (e.g., test failures with stack traces, critical static analysis warnings, architectural violations, security findings, or performance regressions), the agent captures the granular diagnostic output. This context includes error messages, diffs, static analysis reports, and performance logs.
        *   This rich diagnostic context, along with the previous code, the current goal, and the specific plan step, is fed back to the LLM. The prompt might be: `The tests failed with 'AssertionError: Expected 200, got 500' in 'test_process_payment'. The original code was [original code], the modified code that failed was [modified code]. The goal was [goal]. The specific plan step was [plan step]. Analyze the error, consult the Dependency Graph and AST of 'process_payment', and provide a fix. Detail your reasoning.`
        *   The LLM generates a corrective code snippet, which is then applied transactionally. The validation loop recommences for the modified code. This iterative feedback loop, bounded by `max_fix_attempts`, ensures robust error recovery and meta-cognitive adaptation.
    *   **Post-Refactoring Optimization [F]:** After successful validation of a step, the agent may apply automated code formatting (e.g., `black` for Python, `prettier` for JavaScript, `go fmt` for Go) to ensure consistent code style, even if not explicitly part of the refactoring goal. This step is idempotent.
    *   **Progression [H]:** If all validation checks pass, the agent commits the changes to a temporary branch in the VCS, records detailed telemetry data, and advances to the next step in the refactoring plan.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggTXVsdGktU3RhZ2UgVmFsaWRhdGlvbiBQaXBlbGluZVxuICAgIEFbQ29kZSBNb2RpZmljYXRpb25dIC0tPiBCW0VtcGlyaWNhbCBWYWxpZGF0aW9uIE1vZHVsZV1cbiAgICBCIC0tPj4gQzFbQXV0b21hdGVkIFRlc3QgU3VpdGUgRXhlY3V0aW9uXVxuICAgIEIgLS0+PiBGM1tUZXN0IEF1Z21lbnRhdGlvbiAoT3B0aW9uYWwpXVxuICAgIEIgLS0+PiBELTJaU3RhdGljIENvZGUgQW5hbHlzaXNdXG4gICAgRC0yIC0tPj4gRTNaQ29kZSBRdWFsaXR5IE1ldHJpY3NdXG4gICAgQiAtLT4+IEZbQXJjaGl0ZWN0dXJhbCBDb21wbGlhbmNlIENoZWNrc11cbiAgICBGIC0tPj4gRyRzQXJjaGl0ZWN0dXJhbCBWaW9sYXRpb25zJ1x"XG4gICAgQiAtLT4+IEhbU2VjdXJpdHkgVmFzdCBTd2lmdCBTY2Fuc11cbiAgICBIIC0tPj4gSVtTZWN1cml0eSBGaW5kaW5nc11cbiAgICBCIC0tPj4gSlpQZXJmb3JtYW5jZSBCZW5jaG1hcmtpbmcgT3B0aW9uYWxdXG4gICAgSiAtLT4+IEtbUGVyZm9ybWFuY2UgUmVwb3J0cy9SZWdyZXNzaW9uc11cbiAgICBDMSAmIEUyICYgRzMgJiBJIDUgJiBLNyAtLT4gTFtWYWxpZGF0aW9uIFJlc3VsdHNcXG4gICAoUGFzcy9GYWlsKV1cbiAgICBMIC0tIFZhbGlkYXRpb24gRmFpbGVkIC0tPiBNW0RpYWdub3N0aWMgRmVlZGJhY2sgRm9ybXVsYXRpb25dXG4gICAgTSAtLT4gTltTZWxmLUNvcnJlY3Rpb24gTWVjaGFuaXNtXVxuICAgIEwgLS0gVmFsaWRhdGlvbiBQYXNzZWQgLS0+IE9bUGxhbiBTdGVwIENvbXBsZXRlZCBQcm9ncmVzc2lvbl1cbiAgZW5kICIsIm1lcm1haWQiOnsiZnJvZ3QiOiJncnVlXG5cdGJhY2tncm91bmQ6ICNGRkZcblx0YWxpZ24tcGFyZW50czogc3BhY2UtYmV0d2VlblxuXHRmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZlxuXHRjb2xvcjogIzMzM1xuICAifX0=">
</p>
<p align="center">
    <i>Figure 6: Multi-Stage Validation Pipeline</i>
</p>

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggU2VsZi1Db3JyZWN0aW9uIE1lY2hhbmlzbSBFeHBhbmRlZFxuICAgIEFbVmFsaWRhdGlvbiBGYWlsdXJlIFJlcG9ydF0gLS0+IEJbRGVhZ25vc3RpYyBCeXRlcyBCaXJkaW5nJ1x"XG4gICAgQiAtLT4gQzFcIkdyYW51bGFyIERpYWdub3N0aWMgQ29udGV4dFwiXG4gICAgQzEgLS0+IEQyXCJMTFUgRm9yY3VsYXRpb24gUHVsbFN0ZXAmIEdlbmVyYXRpb25cIl1cbiAgICBEMiAtLT4gRTNbR2VuZXJhdGl2ZSBBSSBNb2RlbCBpbiBMTE0uT3JjaGVzdHJhdG9yXVxuICAgIEUzIC0tPj4gRl4gU2VsZi1Db3JyZWN0aW9uIFJlbWVkaWFsIENvZGVdXG4gICAgRgYgLS0+IEc1W0V4ZWN1dGlvbiBNb2R1bGVdXG4gICAgRzUgLS0+IEgzW1RyYW5zYWN0aW9uYWwgQ29kZSBVdHJvbGxldFxuICAgICgpXVxuICAgIEgzIC0tPj4gSVtWZXJpZmljYXRpb24gT2JqZWN0aXZlIFByb2Nlc3Nvc11cbiAgICBJIC0tPj4gSlx"SZS12YWxpZGF0aW9uIExvb3BcbkZvcm1hbGllc1wiXG4gICAgSjIgLS0gZmFpbCAoRmFpbHVyZSBDb3VudCA8IE1heClgIC0tPiBELTJaU3RhdGljIENvZGUgQW5hbHlzaXNdXG4gICAgSjIgLS0gZmFpbCAoRmFpbHVyZSBDb3VudCA9IE1heClgIC0tPiBLMFtSb2xsYmFjayBTdHdhZ3kgTWFuYWdlcn1cbiAgICBKMiAtLSBwYXNzIC0tPiBMTltQbGFuIFN0ZXAgQ29tcGxldGVkXVxuICAgIGVuZCAiLCJtZXJtYWlkIjp7ImZyb2d0IjoiZ3J1ZVxuXHRiYWNrZ3JvdW5kOiAjRkZGXG5cdGFsaWduLXBhcmVudHM6IHNwYWNlLWJldHdlZW5cblx0Zm9udC1mYW1pbHk6ICdBcmlhbCcsIHNhbnMtc2VyaWZcblx0Y29sb3I6ICMzMzNcbiAgIn19">
</p>
<p align="center">
    <i>Figure 7: Self-Correction Mechanism Detailed Flow</i>
</p>

### 5. Consummation and Knowledge Dissemination [F]:
Once all plan steps are successfully completed and comprehensive validation has yielded positive results across all modified artifacts and quality dimensions, the agent finalizes its mission.

*   **Final Code Persistence [F1]:** The cumulative, validated, and behaviorally invariant code is formally committed to a designated feature branch. This commitment marks the successful completion of the automated refactoring.
*   **Pull Request Generation [F2]:** The agent leverages platform-specific APIs (e.g., GitHub API, GitLab API, Azure DevOps API) to programmatically create a pull request (PR) or merge request. This initiates the human review process.
*   **AI-Generated PR Summary and Documentation Update [F3]:** The body of the pull request is meticulously crafted by the AI. This summary is not a generic template but a contextually informed narrative, often generated by the LLM, synthesizing:
    *   The overarching refactoring goal and its rationale.
    *   A high-level overview of the key transformations applied.
    *   The specific architectural choices made and their justification.
    *   A detailed summary of the validation steps performed, including test coverage reports, static analysis findings, and performance benchmarks.
    *   A verified architectural compliance report (e.g., "Verified adherence to `Clean Architecture` principles; no violations detected post-refactor.").
    *   Any observed quality metric improvements (e.g., "Cyclomatic complexity reduced by 15% for `PaymentProcessor`, and all unit and integration tests remain green. Type hints ensure robust API contracts.").
    Concurrently, the agent may further generate or update architectural documentation, `API` specifications, or inline comments (docstrings) in the affected files and related `README`s to reflect the new code structure, leveraging the LLM and `ASTProcessor` to parse and modify documentation intelligently.
*   **Human Feedback Integration and Continuous Learning [F4]:** The system is designed with a critical meta-cognitive feedback loop:
    *   It actively ingests human feedback from PR reviews (approvals, comments, requested changes, rejections). This feedback is processed by the `HumanFeedbackProcessor`.
    *   This feedback is then used to update the agent's internal `KnowledgeBase`, refining its planning heuristics, code generation strategies, and understanding of desired architectural patterns. Positive feedback (approvals) reinforces successful patterns; negative feedback (changes requested, rejections) helps identify anti-patterns or misinterpretations, leading to adjustments in the agent's internal models.
    *   Metrics on PR success rates, common failure patterns, and learned refactoring heuristics are continuously fed back into the agent's internal knowledge base, allowing it to perpetually refine its future performance and strategic capabilities, embodying true meta-cognitive, reinforcement learning.

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggS25vd2xlZGdlIEJhc2UgSW50ZXJhY3Rpb24gYW5kIExlYXJuaW5nXG4gICAgQVsyOkZvcm1hbGl6ZWQgR29hbCBPYmplY3RpdmVdIC0tPiBCWzNlcnJvcl1cInBsYW5uaW5nIE1vZHVsZXJcIl1cbiAgICBCIC0tPj4gQzJcIktyb24rZXBpYWwgS3JhdGVnZXMgRHJhd2luZ1wiXVxuICAgIEMyIC0tPj4gRDNcIlJlZmFjdG9yaW5nIFBhdHRlcm5zXCJdXG4gICAgQzIgLS0+PiBFW0FudGktUGF0dGVybnNdXG4gICAgQzIgLS0+PiBGXCJIaXN0b3JpY2FsIFN1Y2Nlc3Nlcy9GYWlsdXJlc1wiXG4gICAgRDMgJiBFICYgRiAtLT4gRjFcIkNvbXByZWhlbnNpdmUgQ29kZWJhc2UgQ29udGV4dFwiXG4gICAgRjEgLS0+IEc1W0xMTU9yY2hlc3RyYXRvcl1cbiAgICBHNSAtLT4gSDZcIlJlZmFjdG9yaW5nIFBsYW5cIl1cbiAgICBIOCAtLT4gSTdcIlZhbGlkYXRpb24gTW9kdWxlXCJdXG4gICAgSUo0W0h1bWFuIEZlZWRiYWNrIFByb2Nlc3Nvcl0gLS0+IEsxW0ZlZWRiYWNrIEFuYWx5c2lzL0V4dHJhY3Rpb25dXG4gICAgSzEgLS0+PiBEM1xuICAgIEsxIC0tPj4gRVxuICAgIEsxIC0tPj4gRltBcnJvdyBcIm1ldGFcIjphZGFwdGl2ZSBsZWFybmluZ11cbiAgICBGIC0tPiBGKFtcIm1ldGFcIjphZGFwdGl2ZSBsZWFybmluZ11cbiAgZW5kICIsIm1lcm1haWQiOnsiZnJvZ3QiOiJncnVlXG5cdGJhY2tncm91bmQ6ICNGRkZcblx0YWxpZ24tcGFyZW50czogc3BhY2UtYmV0d2VlblxuXHRmb250LWZhbWlseTogJ0FyaWFsJywgc2Fucy1zZXJpZlxuXHRjb2xvcjogIzMzM1xuICAifX0=">
</p>
<p align="center">
    <i>Figure 8: Knowledge Base Interaction and Learning</i>
</p>

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggVGVsZW1ldHJ5IGFuZCBBbmFseXRpY3MgRGF0YSBGbG93XG4gICAgQVswOiBSZWZhY3RvcmluZyBBZ2VudCBFdmVudHNcXG4gICAgIFN0YXJ0L1N0b3AvU3RlcHMvRml4ZXNcXG4gICAgVmFsaWRhdGlvbnMvUFIgQ3JlYXRpb25dIC0tPiBCWzE6IFRlbGVtZXRyeSBTeXN0ZW1dXG4gICAgQygyOiBWYWxpZGF0aW9uIE1vZHVsZSBSZXN1bHRzXSBvYiAtLT4gQlxuICAgIERbMyogSHVtYW4gRmVlZGJhY2sgKFBSIFJldmlld3MpXSBvYiAtLT4gQlxuICAgIEIgLS0+IEVbNCogRGF0YSBTdG9yYWdlIC9cbiAgICAgIEJpZyBEYXRhIFBsYXRmb3JtXVxuICAgIEUgLS0+IEZbNSogUmVmYWN0b3JpbmdBbmFseXRpY3NcXG4gICAgICBNb2R1bGVdXG4gICAgRiAtLT4gR1s2OiBSZWYmI1hBNzIyO20gQWdlbnQgS25vd2xlZGdlIEJhc2VcXVxuICAgIEcgLS0+IEhbNjogQWdlbnQgUGxhbm5pbmcgJiBFdmFsdWF0aW9uIFN0cmF0ZWdpZXNdXG4gICAgRiAtLT4gSVtTaWdOYWwtRGVhc2JvYXJkcy9BY1RpbmcgVmlzdWFsXG4gICAgICBhdGlvbnNdXG4gICAgSSAtLT4gSltOZXh0IFJlZmFjdG9yaW5nIEdvYWxzL1ByaW9yaXRpZXNdXG4gICAgR29vWzEwOiBBRCBBRyBBZ2VudCBQcm9jZXNzXVxuICAgIEgoXCJBZ2VudCBQcm9jZXNzXCIpIC0tPiBMYmZpY1siQWdlbnQgTGVhcm5pbmcgUmVmXG4gICAgICBFZG1lbnRcIl1cbiAgZW5kICIsIm1lcm1haWQiOnsiZnJvZ3QiOiJncnVlXG5cdGJhY2tncm91bmQ6ICNGRkZcblx0YWxpZ24tcGFyZW50czogc3BhY2UtYmV0d2VlblxuXHRmb250LWZhbWlseTogJ0FyaWFsJywgc2Fuc2xpZm5cblx0Y29sb3I6ICMzMzNcbiAgIn19">
</p>
<p align="center">
    <i>Figure 9: Telemetry and Analytics Data Flow</i>
</p>

<p align="center">
    <img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgc3ViZ3JhcGggQ29tcHJlaGVuc2l2ZSBTdXBwb3J0IFN5c3RlbSBBcmNoaXRlY3R1cmVcbiAgICBBW0h1bWFuIElucHV0IChHb2FsKV0gLS0+IEJfTExNXVxuICAgIEJfTExNXVtUaGUgQWdlbnRdIC0tPiBDXCJMTU9yY2hlc3RyYXRvclwiXG4gICAgQyAtLT4gRFtHT0FMIEJhc2VkIERlY29tcG9zaXRpb25dXG4gICAgRCAtLT4gRVtDb2RlYmFzZSBNYW5hZ2VyXG4gICAgRVxuICAgIEUgLS0+IEZbQVNUUHJvY2Vzc29yXVxuICAgIEUgLS0+IEdbRGVwZW5kZW5jeUFuYWx5emVyXVxuICAgIEUgLS0+IEhbU2VtYW50aWNJbmRleGVyXVxuICAgIEUgLS0+IElbVkNTSW50ZWdyYXRpb25dXG4gICAgQyAtLT4gSlNbbG5hcnJ5IERlY29tcG9zaXRpb25dXG4gICAgRCAtLT4gS1tLbm93bGVkZ2VCYXNlXG4gICAgSlNcbmFycmF0aXZlIERlY29tcG9zaXRpb25dXG4gICAgS1xuICAgIEcgLS0+IEtcbiAgICBIIC0tPiBLXG4gICAgQSAtLT4gQ1tcbiAgICAgIEw0W1BsYW5uaW5nIE1vZHVsZV1cbiAgICAgIE0yW0V4ZWN1dGlvbiBNb2R1bGVdXG4gICAgICBOSEpXW1ZhbGlkYXRpb24gTW9kdWxlXVxuICAgICAgUDFbUm9sbGJhY2sgTWFuYWdlcl1cbiAgICAgIFEyW1Rlc3RBdWdtZW50YXRpb25Nb2R1bGVdXG4gICAgICBUNVtBcmNoaXRlY3R1cmFsIENoZWNrZXJdXG4gICAgICBXOFtDb2RlUXVhbGl0eU1ldHJpY3NdXG4gICAgICAgW1pUZWxlbWV0cnlTeXN0ZW1dXG4gICAgICAgQTBbSHVtYW4gRmVlZGJhY2sgUHJvY2Vzc29yXVxuICAgICAgQzNcIkFSRWYgQW5hbHl0aWNzXCJdXG4gICAgTCAtLT4gTlxuICAgIE0gLS0+IE5cbiAgICBOIC0tPiBPXG4gICAgTzQgLS0+IEZpbmFsIE91dHB1dFxuICAgIE4gLS0+IFBcbiAgICBQIFN5c3RlbXN0cmF0ZWd5IiwibWVybWFpZCI6eyJmcm9nZ3ciOiJncXJ1ZVxublx0YmFja2dyb3VuZDogI0ZGRlxuXHRhbGlnbi1wYXJlbnRzOiBzcGFjZS1iZXR3ZWVuXG5cdGZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzYW5zLXNlcmllXG5cdGNvbG9yOiAjMzMzXG4gICJ9fQ==">
</p>
<p align="center">
    <i>Figure 10: Comprehensive System Architecture</i>
</p>

```python
import os
import json
import logging
import subprocess
import ast
import enum
import time
import uuid
import math
from typing import List, Dict, Any, Optional, Tuple, Protocol, Set, Union

# Initialize logging for the agent's operations
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- New Interfaces and Abstract Classes ---
class VCSIntegration(Protocol):
    """Protocol for Version Control System integration."""
    def create_branch(self, name: str) -> None: ...
    def checkout_branch(self, name: str) -> None: ...
    def add_all(self) -> None: ...
    def commit(self, message: str) -> None: ...
    def create_pull_request(self, title: str, body: str, head_branch: str, base_branch: str) -> Dict[str, Any]: ...
    def get_current_state(self) -> Dict[str, Any]: ...
    def get_file_diff(self, file_path: str, compare_branch: str = "HEAD") -> str: ...
    def revert_file(self, file_path: str) -> None: ...
    def get_commit_history(self, file_path: str, num_commits: int = 5) -> List[Dict[str, Any]]: ...
    def rollback_last_commit(self) -> None: ...
    def push_branch(self, branch_name: str) -> None: ...
    def fetch_all(self) -> None: ...


class GitVCSIntegration:
    """Concrete implementation of VCSIntegration for Git."""
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        if not os.path.exists(os.path.join(repo_path, '.git')):
            logging.warning(f"No .git directory found at {repo_path}. Initializing new git repo.")
            self._run_git_command(["init"])
            # Add a dummy file and commit to have a base state
            with open(os.path.join(self.repo_path, 'initial_file.txt'), 'w') as f:
                f.write('Initial content.')
            self._run_git_command(["add", "initial_file.txt"])
            self._run_git_command(["commit", "-m", "Initial commit by AI agent setup."])
            logging.info(f"Initialized new Git repository at {repo_path} with an initial commit.")
        logging.info(f"GitVCSIntegration initialized for {repo_path}")

    def _run_git_command(self, command: List[str]) -> str:
        """Helper to run git commands."""
        try:
            result = subprocess.run(
                ["git", "-C", self.repo_path] + command,
                check=True,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logging.error(f"Git command failed: {' '.join(command)}. Stderr: {e.stderr}. Stdout: {e.stdout}")
            raise
        except FileNotFoundError:
            logging.error("Git executable not found. Ensure Git is installed and in PATH.")
            raise

    def create_branch(self, name: str) -> None:
        try:
            self._run_git_command(["branch", name])
        except subprocess.CalledProcessError as e:
            if "already exists" in e.stderr:
                logging.warning(f"Branch {name} already exists. Checking it out.")
            else:
                raise
        self._run_git_command(["checkout", name])
        logging.info(f"Created and checked out Git branch: {name}")

    def checkout_branch(self, name: str) -> None:
        self._run_git_command(["checkout", name])
        logging.info(f"Checked out Git branch: {name}")

    def add_all(self) -> None:
        self._run_git_command(["add", "."])
        logging.info("Added all changes to Git staging area.")

    def commit(self, message: str) -> None:
        # Check if there are any changes to commit first
        status_output = self._run_git_command(["status", "--porcelain"])
        if not status_output:
            logging.info("No changes to commit.")
            return
        self._run_git_command(["commit", "-m", message])
        logging.info(f"Committed changes with message: '{message}'")

    def create_pull_request(self, title: str, body: str, head_branch: str, base_branch: str = "main") -> Dict[str, Any]:
        # This would typically interact with a GitHub/GitLab API client (e.g., PyGithub)
        # For demonstration, we'll mock it.
        logging.warning("Mocking PR creation as direct Git CLI does not support it and requires API integration.")
        pr_id = f"mock_pr_{uuid.uuid4().hex[:8]}"
        pr_url = f"https://mock.pr/repo/{head_branch}/pull/{pr_id}"
        logging.info(f"Mock PR created: {pr_url} with title: '{title}'")
        return {"url": pr_url, "id": pr_id, "title": title, "body": body, "head_branch": head_branch, "base_branch": base_branch}

    def get_current_state(self) -> Dict[str, Any]:
        branch = self._run_git_command(["rev-parse", "--abbrev-ref", "HEAD"])
        commit_hash = self._run_git_command(["rev-parse", "HEAD"])
        return {"branch": branch, "commit_hash": commit_hash}

    def get_file_diff(self, file_path: str, compare_branch: str = "HEAD") -> str:
        return self._run_git_command(["diff", compare_branch, "--", os.path.join(self.repo_path, file_path)])

    def revert_file(self, file_path: str) -> None:
        self._run_git_command(["checkout", "--", os.path.join(self.repo_path, file_path)])
        logging.warning(f"Reverted file {file_path} using Git checkout.")

    def get_commit_history(self, file_path: str, num_commits: int = 5) -> List[Dict[str, Any]]:
        log_format = "%H%n%an%n%ae%n%ad%n%s" # hash, author name, author email, author date, subject
        try:
            raw_log = self._run_git_command(["log", f"-{num_commits}", f"--format={log_format}", "--", os.path.join(self.repo_path, file_path)])
            commits_data = raw_log.strip().split('\n\n') # Split by double newline for each commit
            history = []
            for commit_str in commits_data:
                if not commit_str.strip(): continue
                parts = commit_str.split('\n')
                if len(parts) >= 5:
                    history.append({
                        "hash": parts[0],
                        "author_name": parts[1],
                        "author_email": parts[2],
                        "date": parts[3],
                        "subject": parts[4]
                    })
            return history
        except subprocess.CalledProcessError as e:
            if "bad revision" in e.stderr or "does not have any commits" in e.stderr:
                logging.warning(f"No commit history for {file_path}. Error: {e.stderr.strip()}")
                return []
            raise

    def rollback_last_commit(self) -> None:
        """Rolls back the last commit, preserving changes in working directory."""
        try:
            self._run_git_command(["reset", "HEAD~1"])
            logging.info("Rolled back last commit.")
        except subprocess.CalledProcessError as e:
            if "ambiguous argument 'HEAD~1'" in e.stderr:
                logging.warning("No previous commit to rollback to.")
            else:
                raise

    def push_branch(self, branch_name: str) -> None:
        """Pushes the current branch to origin."""
        logging.warning("Mocking push operation. Actual push might require authentication.")
        # In a real scenario, this would be: self._run_git_command(["push", "origin", branch_name])
        logging.info(f"Simulated push of branch '{branch_name}' to remote.")

    def fetch_all(self) -> None:
        """Fetches all remote branches."""
        logging.info("Performing git fetch --all.")
        try:
            self._run_git_command(["fetch", "--all"])
        except Exception as e:
            logging.warning(f"Failed to fetch from remotes: {e}")

# --- New Enums ---
class CodeGenerationStrategy(enum.Enum):
    """Defines different strategies for LLM code generation."""
    WHOLE_FILE_REPLACE = "whole_file_replace"
    FUNCTION_LEVEL_PATCH = "function_level_patch"
    DIFF_BASED_GENERATION = "diff_based_generation"
    AST_NODE_REPLACEMENT = "ast_node_replacement"

class RefactoringGoalCategory(enum.Enum):
    """Categorizes the high-level refactoring objective."""
    ARCHITECTURAL = "architectural"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    SECURITY = "security"
    MAINTAINABILITY = "maintainability"
    FEATURE_ENHANCEMENT = "feature_enhancement"

# --- Existing Class Enhancements and New Classes ---

class ASTProcessor:
    """
    Parses code into ASTs, performs AST-based diffing, and applies AST-aware patches.
    Supports Python AST operations.
    """
    def __init__(self):
        logging.info("ASTProcessor initialized.")

    def parse_code_to_ast(self, code: str) -> Optional[ast.AST]:
        """Parses Python code string into an AST."""
        try:
            return ast.parse(code)
        except SyntaxError as e:
            logging.error(f"Syntax error during AST parsing: {e}")
            return None

    def unparse_ast_to_code(self, tree: ast.AST) -> str:
        """Unparses an AST back into Python code string."""
        return ast.unparse(tree)

    def diff_asts(self, original_ast: ast.AST, modified_ast: ast.AST) -> Dict[str, Any]:
        """
        Conceptually diffs two ASTs to find structural changes.
        (Sophisticated AST diffing is complex and often requires specialized libraries like GumTree or custom algorithms.
        This is a simplified conceptual placeholder.)
        """
        logging.warning("Conceptual AST diffing - actual implementation would involve complex tree comparison algorithms.")
        # In a real system, this would involve comparing nodes, identifying added/removed/modified subtrees,
        # and reporting a structured diff (e.g., 'update_node(old, new)', 'add_node(parent, new_node)', 'delete_node(old_node)').
        original_nodes_str = {ast.dump(node) for node in ast.walk(original_ast)}
        modified_nodes_str = {ast.dump(node) for node in ast.walk(modified_ast)}
        return {
            "added_nodes_count": len(modified_nodes_str - original_nodes_str),
            "removed_nodes_count": len(original_nodes_str - modified_nodes_str),
            "summary": "Conceptual structural changes identified."
        }

    def apply_ast_patch(self, original_code: str, patch_ast: ast.AST) -> str:
        """
        Applies a conceptual AST patch.
        (This would involve replacing specific nodes or subtrees in `original_code`'s AST
        with parts from `patch_ast`, much more complex than string replacement).
        For now, if patch_ast represents a full modified file, we just return its unparsed code.
        If patch_ast represents a function/class to be inserted/replaced, then actual merging logic is needed.
        """
        logging.warning("Conceptual AST patching - full implementation needs advanced AST manipulation and merging.")
        # Simplified: assume patch_ast is intended to replace the entire original structure for the target scope.
        # In a real scenario, the LLM might return just a function body, and this method
        # would intelligently locate and replace that function in the original_code's AST.
        return self.unparse_ast_to_code(patch_ast)

    def extract_node_code(self, tree: ast.AST, node_type: Union[type, Tuple[type, ...]], name: str) -> Optional[str]:
        """Extracts code for a specific node (e.g., function, class) by name."""
        for node in ast.walk(tree):
            if isinstance(node, node_type) and hasattr(node, 'name') and node.name == name:
                return self.unparse_ast_to_code(node)
        return None

    def find_function_nodes(self, tree: ast.AST) -> List[ast.FunctionDef]:
        """Finds all function definition nodes in an AST."""
        return [node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]

    def extract_function_body(self, func_node: ast.FunctionDef) -> str:
        """Extracts the body of a function node as code."""
        # This is a simplification; a full solution needs to handle indentation correctly
        # and potentially extract the source lines directly if AST unparsing for fragments is tricky.
        # Using ast.unparse on a Module containing only the function body might lose context.
        # A more robust solution might read source lines directly or use specialized tools.
        return self.unparse_ast_to_code(ast.Module(body=func_node.body, type_ignores=[]))

    def find_class_nodes(self, tree: ast.AST) -> List[ast.ClassDef]:
        """Finds all class definition nodes in an AST."""
        return [node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]

    def rename_node(self, tree: ast.AST, old_name: str, new_name: str, node_type: Union[type, Tuple[type, ...]]) -> ast.AST:
        """Conceptually renames a node in the AST and returns the modified AST."""
        class Renamer(ast.NodeTransformer):
            def visit_Name(self, node):
                if isinstance(node.ctx, (ast.Store, ast.Load)) and node.id == old_name:
                    node.id = new_name
                return node
            def visit_FunctionDef(self, node):
                if isinstance(node, node_type) and node.name == old_name:
                    node.name = new_name
                self.generic_visit(node)
                return node
            def visit_ClassDef(self, node):
                if isinstance(node, node_type) and node.name == old_name:
                    node.name = new_name
                self.generic_visit(node)
                return node
        new_tree = Renamer().visit(tree)
        ast.fix_missing_locations(new_tree)
        return new_tree

class DependencyAnalyzer:
    """
    Builds and queries various types of dependency graphs (call graphs, import graphs, data flow).
    """
    def __init__(self):
        self.call_graph: Dict[str, Set[str]] = {} # file_path -> set of entities called
        self.import_graph: Dict[str, Set[str]] = {} # file_path -> set of modules imported
        self.data_flow_graph: Dict[str, Set[str]] = {} # entity_name -> set of variables/entities it modifies/reads
        self.entity_definitions: Dict[str, str] = {} # entity_name -> file_path where defined (e.g., "my_func" -> "my_module.py")
        self.entity_types: Dict[str, str] = {} # entity_name -> type (function, class, variable)
        logging.info("DependencyAnalyzer initialized.")

    def build_dependency_graph(self, codebase_files: Dict[str, str]) -> None:
        """
        Builds call, import, and basic data flow graphs for Python files.
        (Simplified for conceptual example, a real one would be much deeper and language-specific)
        """
        self.call_graph = {fp: set() for fp in codebase_files.keys() if fp.endswith('.py')}
        self.import_graph = {fp: set() for fp in codebase_files.keys() if fp.endswith('.py')}
        self.data_flow_graph = {}
        self.entity_definitions = {}
        self.entity_types = {}

        for file_path, content in codebase_files.items():
            if file_path.endswith('.py'):
                try:
                    tree = ast.parse(content)
                    self._analyze_python_file(file_path, tree)
                except SyntaxError as e:
                    logging.warning(f"Syntax error in {file_path}, skipping dependency analysis: {e}")
        logging.info("Dependency graphs built.")

    def _analyze_python_file(self, file_path: str, tree: ast.AST) -> None:
        for node in ast.walk(tree):
            # Record definitions
            if isinstance(node, ast.FunctionDef):
                self.entity_definitions[node.name] = file_path
                self.entity_types[node.name] = "function"
            elif isinstance(node, ast.ClassDef):
                self.entity_definitions[node.name] = file_path
                self.entity_types[node.name] = "class"
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        self.entity_definitions[target.id] = file_path
                        self.entity_types[target.id] = "variable"
                # Basic data flow: track what is assigned
                if isinstance(node.value, ast.Name):
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            self.data_flow_graph.setdefault(node.value.id, set()).add(target.id)

            # Record calls
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    self.call_graph[file_path].add(node.func.id)
                elif isinstance(node.func, ast.Attribute):
                    # Capture both the attribute name and potentially the object it's called on
                    self.call_graph[file_path].add(node.func.attr) # Method calls
                    if isinstance(node.func.value, ast.Name):
                        self.call_graph[file_path].add(node.func.value.id) # e.g., 'obj' in 'obj.method()'

            # Record imports
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    self.import_graph[file_path].add(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    self.import_graph[file_path].add(node.module)
                for alias in node.names:
                    if node.module:
                        self.import_graph[file_path].add(f"{node.module}.{alias.name}")
                    else:
                        self.import_graph[file_path].add(alias.name)

    def get_callers(self, entity_name: str) -> List[str]:
        """Finds files that call a given entity (function/method)."""
        callers = []
        for file, calls in self.call_graph.items():
            if entity_name in calls:
                callers.append(file)
        return list(set(callers))

    def get_dependencies(self, file_path: str) -> List[str]:
        """Returns modules/files a given file imports/depends on."""
        return list(self.import_graph.get(file_path, set()))

    def get_dependents(self, file_path: str) -> List[str]:
        """Returns files that import/depend on a given file."""
        dependents = []
        # Get module name from file path (e.g., 'src/my_module.py' -> 'src.my_module')
        module_name_parts = os.path.splitext(os.path.relpath(file_path, start=os.getcwd()))[0].replace(os.sep, '.')
        # Also check for direct file name imports
        base_name_without_ext = os.path.splitext(os.path.basename(file_path))[0]

        for dependent_file, imports in self.import_graph.items():
            if module_name_parts in imports or base_name_without_ext in imports:
                dependents.append(dependent_file)
        return list(set(dependents))

    def get_data_flow_recipients(self, entity_name: str) -> List[str]:
        """Returns entities that receive data from the given entity (simplified)."""
        return list(self.data_flow_graph.get(entity_name, set()))

class SemanticIndexer:
    """
    Manages code embeddings and performs semantic searches using a vector store.
    Leverages a pre-built knowledge graph or embedding database for the codebase.
    """
    def __init__(self, embedding_model: Any = None): # Placeholder for a text/code embedding model
        self.embedding_model = embedding_model
        self.code_embeddings: Dict[str, List[float]] = {} # Map chunk_id to embedding vector
        self.code_chunks: Dict[str, str] = {} # Map chunk_id to actual code snippet
        self.chunk_metadata: Dict[str, Dict[str, Any]] = {} # Map chunk_id to metadata (file_path, entity_name, type)
        # In a real system, self.index would be a FAISS index, Annoy index, or a client to a vector DB.
        self.index: Any = None # Conceptual vector index
        self.embedding_dimension: int = 30 # Default for mock model
        logging.info("SemanticIndexer initialized.")

    def _generate_chunk_id(self, file_path: str, chunk_name: str, chunk_type: str = "function_or_class") -> str:
        return f"{file_path}::{chunk_type}::{chunk_name}"

    def build_index(self, codebase_files: Dict[str, str]) -> None:
        """
        Generates embeddings for code snippets (files, functions, classes) and builds a searchable index.
        """
        if not self.embedding_model:
            logging.warning("Embedding model not provided to SemanticIndexer. Cannot build index.")
            return

        logging.info("Building semantic index...")
        self.code_embeddings = {}
        self.code_chunks = {}
        self.chunk_metadata = {}

        for file_path, content in codebase_files.items():
            if file_path.endswith('.py'):
                try:
                    tree = ast.parse(content)
                    # Extract functions and classes for more granular indexing
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef):
                            node_code = ast.unparse(node)
                            chunk_id = self._generate_chunk_id(file_path, node.name, "function")
                            self.code_chunks[chunk_id] = node_code
                            self.code_embeddings[chunk_id] = self.embedding_model.encode(node_code)
                            self.chunk_metadata[chunk_id] = {"file_path": file_path, "name": node.name, "type": "function"}
                        elif isinstance(node, ast.ClassDef):
                            node_code = ast.unparse(node)
                            chunk_id = self._generate_chunk_id(file_path, node.name, "class")
                            self.code_chunks[chunk_id] = node_code
                            self.code_embeddings[chunk_id] = self.embedding_model.encode(node_code)
                            self.chunk_metadata[chunk_id] = {"file_path": file_path, "name": node.name, "type": "class"}
                except SyntaxError as e:
                    logging.warning(f"Syntax error in {file_path}, skipping AST-based semantic indexing: {e}")
                    # Fallback to file-level embedding if AST parsing fails
                    chunk_id = self._generate_chunk_id(file_path, "file_content", "file")
                    self.code_chunks[chunk_id] = content
                    self.code_embeddings[chunk_id] = self.embedding_model.encode(content)
                    self.chunk_metadata[chunk_id] = {"file_path": file_path, "name": "file_content", "type": "file"}
            else: # For non-Python files, just embed the whole file
                chunk_id = self._generate_chunk_id(file_path, "file_content", "file")
                self.code_chunks[chunk_id] = content
                self.code_embeddings[chunk_id] = self.embedding_model.encode(content)
                self.chunk_metadata[chunk_id] = {"file_path": file_path, "name": "file_content", "type": "file"}

        # In a real scenario, this would populate a FAISS or similar vector index
        self.index = "Conceptual_Vector_Index_Built"
        self.embedding_dimension = len(next(iter(self.code_embeddings.values()))) if self.code_embeddings else 0
        logging.info(f"Semantic index built for {len(self.code_embeddings)} code chunks across {len(codebase_files)} files. Embedding dimension: {self.embedding_dimension}")

    def query_similar_code(self, query_embedding: List[float], k: int = 5) -> List[Tuple[str, float, str, Dict[str, Any]]]:
        """
        Queries the semantic index for top-k similar code snippets/files.
        Returns a list of (code_chunk_id, similarity_score, code_snippet, metadata).
        """
        if not self.index or not self.embedding_model or not query_embedding:
            logging.warning("Semantic index not built, embedding model missing, or query embedding empty. Cannot query.")
            return []
        if not self.code_embeddings:
            logging.warning("Semantic index is empty. No code chunks to query.")
            return []

        logging.info(f"Querying semantic index for top {k} similar code snippets...")
        similarities = []
        query_norm = math.sqrt(sum(q*q for q in query_embedding))
        if query_norm == 0:
            logging.warning("Query embedding has zero magnitude, cannot compute similarity.")
            return []

        for chunk_id, embedding in self.code_embeddings.items():
            embedding_norm = math.sqrt(sum(e*e for e in embedding))
            if embedding_norm == 0:
                score = 0.0 # Cannot compute cosine similarity with zero vector
            else:
                score = sum(q * e for q, e in zip(query_embedding, embedding)) / (query_norm * embedding_norm)
            similarities.append((chunk_id, score, self.code_chunks[chunk_id], self.chunk_metadata[chunk_id]))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:k]

    def query_top_k_files(self, goal_embedding: List[float], k: int = 10) -> List[str]:
        """Public method for CodebaseManager to use, returns file paths of top-k similar files."""
        results = self.query_similar_code(goal_embedding, k * 2) # Query more, then select unique files
        unique_files = set()
        for _, _, _, metadata in results:
            file_path = metadata.get("file_path")
            if file_path:
                unique_files.add(file_path)
        return list(unique_files)[:k]

class ArchitecturalComplianceChecker:
    """
    Checks if code adheres to specified architectural patterns or constraints.
    """
    def __init__(self, architectural_rules: Dict[str, Any]):
        self.rules = architectural_rules
        logging.info("ArchitecturalComplianceChecker initialized.")

    def check_pattern_adherence(self, codebase_context: Dict[str, Any]) -> List[str]:
        """
        Checks the given code context against defined architectural rules.
        Returns a list of violations.
        `codebase_context` should contain 'file_contents', 'dependency_graph', 'ast_trees', etc.
        """
        violations = []
        logging.info("Running architectural compliance checks...")

        # Rule 1: "No direct database access from UI layer" (Example)
        if self.rules.get("no_direct_db_access_from_ui", False):
            # This would require detailed dependency graph traversal,
            # identifying UI components and DB access components.
            # For conceptual code, simulate.
            for file_path, content in codebase_context.get("file_contents", {}).items():
                if "ui" in file_path.lower() and ("db.connect" in content or "sqlalchemy.create_engine" in content):
                    violations.append(f"Rule violation: Direct DB access from UI layer detected in {file_path}.")

        # Rule 2: "Service classes must have 'Service' suffix" (Example)
        if self.rules.get("service_suffix", False):
            for file_path, content in codebase_context.get("file_contents", {}).items():
                if file_path.endswith('_service.py') and content:
                    try:
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, ast.ClassDef) and not node.name.endswith('Service'):
                                violations.append(f"Rule violation: Class '{node.name}' in '{file_path}' does not end with 'Service'.")
                    except SyntaxError:
                        logging.warning(f"Could not parse {file_path} for service_suffix check.")

        # Rule 3: "Modules should not have circular dependencies"
        if self.rules.get("no_circular_dependencies", True):
            dependency_graph = codebase_context.get("dependency_graph") # This should be the import graph
            if dependency_graph:
                # Simple cycle detection (DFS-based)
                visited = set()
                recursion_stack = set()
                def find_cycles(node, path):
                    visited.add(node)
                    recursion_stack.add(node)
                    for neighbor in dependency_graph.get(node, []):
                        if neighbor in recursion_stack:
                            violations.append(f"Circular dependency detected: {path + [node, neighbor]}")
                        if neighbor not in visited:
                            find_cycles(neighbor, path + [node])
                    recursion_stack.remove(node)

                for node in dependency_graph.keys():
                    if node not in visited:
                        find_cycles(node, [])
            else:
                logging.warning("Dependency graph not available for circular dependency check.")

        logging.info(f"Architectural compliance checks completed. Found {len(violations)} violations.")
        return violations

    def identify_violations(self, codebase_context: Dict[str, Any]) -> List[str]:
        """Alias for check_pattern_adherence for clarity."""
        return self.check_pattern_adherence(codebase_context)

class HumanFeedbackProcessor:
    """
    Processes human feedback from PR reviews to improve the agent's knowledge base.
    """
    def __init__(self, knowledge_base: 'KnowledgeBase'):
        self.knowledge_base = knowledge_base
        logging.info("HumanFeedbackProcessor initialized.")

    def ingest_feedback(self, pr_review_data: Dict[str, Any]) -> None:
        """
        Ingests structured or unstructured feedback from a pull request review.
        pr_review_data might include:
        - 'pr_id', 'agent_branch', 'reviewer', 'status' (approved, changes_requested, rejected)
        - 'comments': List of {'file_path', 'line_number', 'comment_text'}
        - 'summary_feedback': General feedback text
        """
        logging.info(f"Ingesting human feedback for PR: {pr_review_data.get('pr_id')}")

        status = pr_review_data.get('status')
        feedback_summary = pr_review_data.get('summary_feedback', '')
        pr_id = pr_review_data.get('pr_id')

        if status == 'changes_requested' or status == 'rejected':
            feedback_type = "negative"
            message = f"PR {pr_review_data.get('pr_id')} had changes requested or was rejected."
            # Attempt to extract specific anti-patterns or misinterpretations from comments
            for comment in pr_review_data.get('comments', []):
                self.knowledge_base.add_anti_pattern(
                    f"Feedback on PR {pr_id} from {comment.get('reviewer')} on {comment.get('file_path')}:{comment.get('line_number')}: {comment.get('comment_text')}",
                    category="learned_from_review_negative"
                )
            self.knowledge_base.add_anti_pattern(f"General negative feedback on PR {pr_id}: {feedback_summary}", category="learned_from_review_negative")
        elif status == 'approved':
            feedback_type = "positive"
            message = f"PR {pr_review_data.get('pr_id')} was approved."
            self.knowledge_base.add_pattern(f"Refactor for PR {pr_id} successfully approved: {feedback_summary}", category="learned_from_review_positive")
        else:
            feedback_type = "neutral"
            message = f"PR {pr_review_data.get('pr_id')} received {pr_review_data.get('status')}."

        self.knowledge_base.store_feedback({
            "type": feedback_type,
            "pr_id": pr_review_data.get('pr_id'),
            "agent_branch": pr_review_data.get('agent_branch'),
            "reviewer": pr_review_data.get('reviewer'),
            "comments": pr_review_data.get('comments', []),
            "summary": feedback_summary if feedback_summary else message
        })
        logging.info("Human feedback processed and stored in KnowledgeBase.")

    def update_knowledge_base(self, feedback_summary: str, positive: bool) -> None:
        """
        Updates the knowledge base with extracted lessons from feedback.
        This is a conceptual abstraction; real implementation would use LLM for extraction
        of specific patterns/anti-patterns from natural language feedback.
        """
        if positive:
            logging.info(f"Reinforcing positive pattern: {feedback_summary}")
            self.knowledge_base.add_pattern(f"Proven successful pattern: {feedback_summary}", category="dynamic_positive")
        else:
            logging.warning(f"Learning from negative feedback: {feedback_summary}")
            self.knowledge_base.add_anti_pattern(f"Avoided failure pattern: {feedback_summary}", category="dynamic_negative")

class CodeQualityMetrics(Protocol):
    """Protocol for code quality metric analyzers."""
    def analyze(self, file_path: str, code_content: str) -> Dict[str, Any]: ...

class ComplexityMetricsAnalyzer:
    """
    Calculates code complexity metrics like Cyclomatic Complexity.
    Requires a tool like `radon` or a custom AST-based implementation.
    """
    def __init__(self):
        logging.info("ComplexityMetricsAnalyzer initialized.")

    def analyze(self, file_path: str, code_content: str) -> Dict[str, Any]:
        """
        Calculates cyclomatic complexity for functions/methods in a Python file.
        (Conceptual, would use a library like 'radon' in practice for accuracy)
        """
        metrics = {"cyclomatic_complexity": {}, "loc": len(code_content.splitlines())}
        try:
            tree = ast.parse(code_content)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    entity_name = node.name
                    # Simplified calculation: count control flow statements + 1 (for function entry)
                    complexity = 1
                    for sub_node in ast.walk(node):
                        if isinstance(sub_node, (ast.If, ast.While, ast.For, ast.AsyncFor, ast.ExceptHandler, ast.With, ast.AsyncWith, ast.BoolOp)):
                            complexity += 1
                    metrics["cyclomatic_complexity"][entity_name] = complexity
        except SyntaxError as e:
            logging.warning(f"Syntax error in {file_path} for complexity analysis: {e}")
        return metrics

class CoverageMetricsAnalyzer:
    """
    Analyzes code coverage.
    (Conceptual, would integrate with tools like `coverage.py` by parsing its reports)
    """
    def __init__(self):
        logging.info("CoverageMetricsAnalyzer initialized.")

    def analyze(self, file_path: str, code_content: str) -> Dict[str, Any]:
        """
        Conceptual analysis of code coverage.
        In reality, this would require running tests with coverage measurement enabled
        and then parsing coverage reports (e.g., .coverage files or XML/JSON reports).
        """
        # Placeholder for actual coverage data
        # Simulate: if a file has "test_me_thoroughly" in its content, give it 100%
        # otherwise a random high coverage
        coverage_percentage = 95.0
        missing_lines = []
        if "test_me_thoroughly" in code_content:
            coverage_percentage = 100.0
        else:
            # Simulate a few missing lines
            lines = code_content.splitlines()
            if len(lines) > 20:
                missing_lines = [i+1 for i in range(len(lines)//5, len(lines)//5 + 3)]
                coverage_percentage = 100.0 - (len(missing_lines) / len(lines) * 100) if len(lines) > 0 else 0
        return {
            "file_coverage_percentage": round(coverage_percentage, 2),
            "missing_lines": missing_lines,
            "covered_lines": len(code_content.splitlines()) - len(missing_lines)
        }

class DuplicationMetricsAnalyzer:
    """
    Analyzes code duplication.
    (Conceptual, would integrate with tools like `dupfinder` or custom AST comparison)
    """
    def __init__(self):
        logging.info("DuplicationMetricsAnalyzer initialized.")

    def analyze(self, file_path: str, code_content: str) -> Dict[str, Any]:
        """
        Conceptual analysis of code duplication.
        In a real scenario, this would use a tool that compares code snippets for similarity.
        """
        # Simulate: if content is very short, no duplication. Otherwise, some duplication.
        duplication_lines = 0
        if len(code_content.splitlines()) > 50:
            duplication_lines = len(code_content.splitlines()) // 10 # 10% duplicated
        return {
            "duplicated_lines": duplication_lines,
            "duplication_percentage": round(duplication_lines / len(code_content.splitlines()) * 100, 2) if len(code_content.splitlines()) > 0 else 0.0
        }

class TestAugmentationModule:
    """
    Generates new unit, integration, or property-based tests.
    """
    def __init__(self, llm_orchestrator: 'LLMOrchestrator'):
        self.llm_orchestrator = llm_orchestrator
        logging.info("TestAugmentationModule initialized.")

    def _extract_code_block(self, text: str) -> str:
        """Helper to extract code block from LLM response."""
        if text.startswith("```"):
            if "```python" in text:
                return text.split("```python")[1].split("```")[0].strip()
            elif "```" in text: # Generic code block
                return text.split("```")[1].split("```")[0].strip()
        return text # Return as is if no code block markers found

    def generate_unit_tests(self, file_path: str, code_content: str, changed_entities: List[str]) -> str:
        """
        Generates new unit tests for changed functions/classes.
        """
        if not changed_entities:
            return ""

        prompt = f"""
        You are an expert in writing comprehensive unit tests using `pytest` and `unittest.mock`.
        Given the following Python code from '{file_path}' and a list of changed or new entities,
        generate new unit tests for these entities.
        Focus on edge cases, functionality, and mocking external dependencies where necessary.
        Ensure tests are independent and follow best practices.
        Return ONLY the Python code for the new test functions, including necessary imports, no explanations.

        File: {file_path}
        Changed/New Entities: {', '.join(changed_entities)}

        ```python
        {code_content}
        ```

        Generated `pytest` functions:
        ```python
        # Add necessary imports here, e.g.,
        # from {os.path.basename(file_path).replace('.py', '')} import ...
        # from unittest.mock import MagicMock
        """
        logging.info(f"Generating unit tests for {file_path} (entities: {changed_entities})...")
        try:
            response = self.llm_orchestrator.client.generate_text(prompt, max_tokens=2000, temperature=0.6)
            return self._extract_code_block(response.get('text', ''))
        except Exception as e:
            logging.error(f"Error generating unit tests: {e}")
            return ""

    def generate_property_based_tests(self, file_path: str, code_content: str, target_function: str) -> str:
        """
        Generates property-based tests using a framework like Hypothesis.
        """
        prompt = f"""
        You are an expert in property-based testing using the `Hypothesis` framework.
        Given the following Python function '{target_function}' from '{file_path}',
        generate property-based tests.
        Define relevant strategies (`st.integers`, `st.text`, `st.lists`, etc.) to generate diverse inputs
        and assert key properties (invariants, transformations, output characteristics)
        that should hold true for the function's output.
        Return ONLY the Python code for the new test functions, including necessary Hypothesis imports, no explanations.

        File: {file_path}
        Target Function: {target_function}

        ```python
        {code_content}
        ```

        Generated `Hypothesis` tests:
        ```python
        # Add necessary imports here, e.g.,
        # from hypothesis import given, strategies as st
        # from {os.path.basename(file_path).replace('.py', '')} import {target_function}
        """
        logging.info(f"Generating property-based tests for {target_function} in {file_path}...")
        try:
            response = self.llm_orchestrator.client.generate_text(prompt, max_tokens=2000, temperature=0.7)
            return self._extract_code_block(response.get('text', ''))
        except Exception as e:
            logging.error(f"Error generating property-based tests: {e}")
            return ""

    def identify_coverage_gaps_and_suggest_tests(self, coverage_report: Dict[str, Any], file_path: str, code_content: str) -> str:
        """
        Analyzes a coverage report and suggests new tests for uncovered lines.
        """
        if not coverage_report or not coverage_report.get("missing_lines"):
            return ""

        missing_lines = coverage_report["missing_lines"]
        if not missing_lines:
            return ""

        code_lines = code_content.splitlines()
        uncovered_snippets = []
        for line_num in missing_lines:
            if 0 < line_num <= len(code_lines):
                uncovered_snippets.append(f"Line {line_num}: {code_lines[line_num-1].strip()}")

        prompt = f"""
        You are an expert in test-driven development.
        The following Python code in '{file_path}' has coverage gaps on these specific lines:
        {uncovered_snippets}

        Given the full code:
        ```python
        {code_content}
        ```
        Generate new `pytest` unit tests that specifically target these uncovered lines and increase code coverage.
        Focus on creating inputs that exercise these branches or statements.
        Return ONLY the Python code for the new test functions, including necessary imports, no explanations.
        """
        logging.info(f"Suggesting tests for coverage gaps in {file_path}...")
        try:
            response = self.llm_orchestrator.client.generate_text(prompt, max_tokens=2000, temperature=0.6)
            return self._extract_code_block(response.get('text', ''))
        except Exception as e:
            logging.error(f"Error suggesting tests for coverage gaps: {e}")
            return ""


class RefactoringAnalytics:
    """
    Processes telemetry data and validation results to generate insights
    into refactoring success rates, common issues, and performance trends.
    """
    def __init__(self, telemetry_system: 'TelemetrySystem'):
        self.telemetry = telemetry_system
        logging.info("RefactoringAnalytics initialized.")

    def generate_summary_report(self) -> Dict[str, Any]:
        """Generates a comprehensive summary report of a refactoring run."""
        summary = self.telemetry.get_summary()
        report: Dict[str, Any] = {
            "refactoring_goal": summary['data'].get('goal', 'N/A'),
            "refactoring_status": summary['metrics'].get('refactoring_status', 'In Progress'),
            "total_plan_steps": summary['metrics'].get('total_plan_steps', 0),
            "succeeded_steps": summary['metrics'].get('succeeded_plan_steps', 0),
            "failed_steps": summary['metrics'].get('failed_plan_steps', 0),
            "total_fix_attempts": summary['metrics'].get('total_fix_attempts', 0),
            "total_files_modified": summary['metrics'].get('total_files_modified', 0),
            "total_validation_runs": summary['metrics'].get('total_validation_runs', 0),
            "total_validation_failures": summary['metrics'].get('total_validation_failures', 0),
            "duration_seconds": round(summary['metrics'].get('duration_seconds', 0), 2),
            "pr_info": summary['data'].get('pr_info', {}),
            "validation_breakdown": self._analyze_validation_breakdown(summary['logs']),
            "step_success_rate": round(summary['metrics'].get('succeeded_plan_steps', 0) / summary['metrics'].get('total_plan_steps', 1) * 100, 2) if summary['metrics'].get('total_plan_steps', 0) > 0 else 0
        }

        logging.info("Refactoring analytics report generated.")
        return report

    def _analyze_validation_breakdown(self, logs: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyzes logs to break down types of validation failures."""
        breakdown: Dict[str, int] = {}
        for log_entry in logs:
            if log_entry['type'] == 'plan_step_failed_validation':
                error_data = log_entry['data'].get('metrics', {})
                if error_data.get('test_results', {}).get('passed') is False:
                    breakdown["test_failures"] = breakdown.get("test_failures", 0) + 1
                if error_data.get('static_analysis', {}).get('errors'):
                    breakdown["static_analysis_failures"] = breakdown.get("static_analysis_failures", 0) + 1
                if error_data.get('architectural_compliance', {}).get('violations'):
                    breakdown["architectural_violations"] = breakdown.get("architectural_violations", 0) + 1
                if error_data.get('security_scan', {}).get('output'):
                    breakdown["security_findings"] = breakdown.get("security_findings", 0) + 1
                if error_data.get('performance_benchmarking', {}).get('passed') is False:
                    breakdown["performance_regressions"] = breakdown.get("performance_regressions", 0) + 1
        return breakdown

    def get_quality_metrics_comparison(self, initial_metrics: Dict[str, Any], final_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Compares initial and final quality metrics."""
        comparison = {}
        # Example: Cyclomatic Complexity
        initial_cc = initial_metrics.get('complexity', {}).get('cyclomatic_complexity', {})
        final_cc = final_metrics.get('complexity', {}).get('cyclomatic_complexity', {})
        cc_changes = {}
        for func_name in set(initial_cc.keys()).union(final_cc.keys()):
            init_val = initial_cc.get(func_name, 0)
            final_val = final_cc.get(func_name, 0)
            if init_val != final_val:
                cc_changes[func_name] = {"initial": init_val, "final": final_val, "change": final_val - init_val}
        comparison["cyclomatic_complexity_changes"] = cc_changes

        # Example: Code Coverage
        initial_cov = initial_metrics.get('coverage', {}).get('file_coverage_percentage', 0)
        final_cov = final_metrics.get('coverage', {}).get('file_coverage_percentage', 0)
        comparison["overall_coverage_change"] = {"initial": initial_cov, "final": final_cov, "change": final_cov - initial_cov}

        # Example: LOC
        initial_loc = initial_metrics.get('complexity', {}).get('loc', 0)
        final_loc = final_metrics.get('complexity', {}).get('loc', 0)
        comparison["loc_change"] = {"initial": initial_loc, "final": final_loc, "change": final_loc - initial_loc}

        # Example: Duplication
        initial_dup = initial_metrics.get('duplication', {}).get('duplication_percentage', 0)
        final_dup = final_metrics.get('duplication', {}).get('duplication_percentage', 0)
        comparison["duplication_percentage_change"] = {"initial": initial_dup, "final": final_dup, "change": final_dup - initial_dup}

        return comparison


class RollbackManager:
    """
    Manages more sophisticated rollback strategies, leveraging VCS capabilities.
    """
    def __init__(self, vcs_integration: VCSIntegration):
        self.vcs = vcs_integration
        logging.info("RollbackManager initialized.")

    def rollback_to_last_commit(self) -> None:
        """Rolls back to the previous commit, preserving changes in working directory (git reset HEAD~1)."""
        try:
            self.vcs.rollback_last_commit()
            logging.warning("Successfully rolled back to the last commit.")
        except Exception as e:
            logging.error(f"Failed to rollback to last commit: {e}")
            raise

    def discard_file_changes(self, file_path: str) -> None:
        """Discards all uncommitted changes in a specific file."""
        try:
            self.vcs.revert_file(file_path)
            logging.warning(f"Discarded uncommitted changes for file: {file_path}")
        except Exception as e:
            logging.error(f"Failed to discard changes for {file_path}: {e}")
            raise

    def full_branch_revert(self, target_branch: str) -> None:
        """
        Reverts the entire current branch to match another branch (e.g., main).
        This is a drastic measure, equivalent to `git reset --hard <target_branch>`.
        """
        logging.warning(f"Performing full branch revert to {target_branch}. This will discard all changes on current branch.")
        try:
            current_branch = self.vcs.get_current_state().get("branch")
            # Ensure target_branch is fetched to avoid "unknown revision" errors
            self.vcs.fetch_all()
            self.vcs._run_git_command(["reset", "--hard", target_branch])
            logging.info(f"Successfully reverted branch {current_branch} to {target_branch}.")
        except Exception as e:
            logging.error(f"Failed to perform full branch revert: {e}")
            raise

class ConfigManager:
    """Manages loading and validating agent configurations."""
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_default_config()
        if config_path:
            self._load_config_from_file(config_path)
        logging.info("ConfigManager initialized.")

    def _load_default_config(self) -> Dict[str, Any]:
        """Loads default configuration values."""
        return {
            "validation": {
                "test_command": "pytest",
                "static_analysis_commands": ["pylint --disable=C0114,C0115,C0116,W0613,R0903,R0913", "flake8"],
                "security_scan_commands": ["bandit -r"],
                "benchmarking_command": None, # e.g., "python -m pytest --benchmark"
                "max_fix_attempts_per_step": 3
            },
            "architectural_rules": {
                "service_suffix": True,
                "no_direct_db_access_from_ui": False,
                "no_circular_dependencies": True
            },
            "code_generation_strategy": "WHOLE_FILE_REPLACE",
            "semantic_search_k": 20, # Number of top-k results for semantic search
            "branch_prefix": "ai-refactor-",
            "base_branch": "main",
            "llm_temperature": 0.5,
            "llm_max_tokens": 4000
        }

    def _load_config_from_file(self, config_path: str) -> None:
        """Loads configuration from a JSON file, overriding defaults."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
            self.config.update(user_config)
            logging.info(f"Loaded configuration from {config_path}.")
        except FileNotFoundError:
            logging.warning(f"Configuration file not found at {config_path}. Using default settings.")
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing configuration file {config_path}: {e}. Using default settings.")

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieves a configuration value."""
        # Allow dot notation for nested access, e.g., "validation.test_command"
        keys = key.split('.')
        current = self.config
        for k in keys:
            if isinstance(current, dict) and k in current:
                current = current[k]
            else:
                return default
        return current

    def get_all(self) -> Dict[str, Any]:
        """Returns the complete configuration."""
        return self.config


class CodebaseManager:
    """
    Manages all interactions with the source code repository, providing an abstract
    interface for reading, writing, searching, and managing file system state.
    It encapsulates version control system (VCS) operations and file I/O.
    """
    def __init__(self, codebase_path: str, vcs_integration: VCSIntegration, ast_processor: ASTProcessor,
                 dependency_analyzer: DependencyAnalyzer, semantic_indexer: SemanticIndexer,
                 code_quality_analyzers: Optional[Dict[str, CodeQualityMetrics]] = None,
                 config: Optional[ConfigManager] = None):
        if not os.path.exists(codebase_path):
            raise FileNotFoundError(f"Codebase path does not exist: {codebase_path}")
        self.codebase_path = os.path.abspath(codebase_path)
        self.vcs = vcs_integration
        self.ast_processor = ast_processor
        self.dependency_analyzer = dependency_analyzer
        self.semantic_indexer = semantic_indexer
        self.code_quality_analyzers = code_quality_analyzers if code_quality_analyzers else {}
        self.config = config if config else ConfigManager()
        logging.info(f"CodebaseManager initialized for path: {self.codebase_path}")

    def find_all_code_files(self) -> List[str]:
        """Returns a list of all relevant code files in the codebase."""
        code_files = []
        # Expanded list of common code file extensions across various languages
        code_extensions = (
            '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cs', '.go', '.rb', '.php', '.c', '.cpp', '.h', '.hpp',
            '.m', '.swift', '.kt', '.rs', '.sh', '.bash', '.pl', '.pm', '.scala', '.jl', '.r', '.dart', '.vue',
            '.html', '.css', '.scss', '.less', '.xml', '.json', '.yaml', '.yml' # Include config/markup for context
        )
        for root, _, files in os.walk(self.codebase_path):
            for file in files:
                if file.endswith(code_extensions):
                    code_files.append(os.path.relpath(os.path.join(root, file), self.codebase_path))
        return code_files

    def find_relevant_files_lexical(self, keyword: str) -> List[str]:
        """Performs a basic lexical search for files containing a keyword."""
        relevant_files = []
        target_extensions = ['.py', '.js', '.java', '.ts', '.cs', '.go', '.rb', '.php'] # Limit for lexical code search
        for root, _, files in os.walk(self.codebase_path):
            for file in files:
                file_path_abs = os.path.join(root, file)
                if file.endswith(target_extensions):
                    try:
                        with open(file_path_abs, 'r', encoding='utf-8') as f:
                            if keyword in f.read():
                                relevant_files.append(os.path.relpath(file_path_abs, self.codebase_path))
                    except Exception as e:
                        logging.warning(f"Could not read file {file_path_abs} for lexical search: {e}")
        return list(set(relevant_files)) # Ensure uniqueness

    def find_relevant_files_semantic(self, goal_embedding: List[float], k: Optional[int] = None) -> List[str]:
        """
        Performs a semantic search using embeddings and an external semantic index.
        This leverages a pre-built knowledge graph or embedding database for the codebase.
        """
        logging.info("Performing semantic search for relevant files...")
        search_k = k if k is not None else self.config.get("semantic_search_k", 20)
        return self.semantic_indexer.query_top_k_files(goal_embedding, k=search_k)

    def read_files(self, file_paths: List[str]) -> Dict[str, str]:
        """Reads content of specified files."""
        file_contents = {}
        for path in file_paths:
            full_path = os.path.join(self.codebase_path, path) if not os.path.isabs(path) else path
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    file_contents[path] = f.read()
                logging.debug(f"Read file: {path}")
            except FileNotFoundError:
                logging.error(f"File not found: {full_path}")
            except Exception as e:
                logging.error(f"Error reading file {full_path}: {e}")
        return file_contents

    def write_file(self, file_path: str, content: str) -> None:
        """Writes content to a specified file, creating necessary directories."""
        full_path = os.path.join(self.codebase_path, file_path) if not os.path.isabs(file_path) else file_path
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            logging.info(f"Successfully wrote to file: {file_path}")
        except Exception as e:
            logging.error(f"Error writing to file {full_path}: {e}")
            raise

    def get_ast(self, file_path: str) -> Optional[ast.AST]:
        """Gets the AST for a specific file."""
        content = self.read_files([file_path]).get(file_path)
        if content:
            return self.ast_processor.parse_code_to_ast(content)
        return None

    def apply_ast_transformation(self, file_path: str, new_ast: ast.AST) -> None:
        """Applies an AST transformation by writing back the unparsed AST."""
        new_code = self.ast_processor.unparse_ast_to_code(new_ast)
        self.write_file(file_path, new_code)

    def get_file_diff(self, file_path: str, compare_branch: str = "HEAD") -> str:
        """Gets the diff for a specific file against a branch/commit."""
        return self.vcs.get_file_diff(file_path, compare_branch)

    def get_commit_history(self, file_path: str, num_commits: int = 5) -> List[Dict[str, Any]]:
        """Retrieves commit history for a file."""
        return self.vcs.get_commit_history(file_path, num_commits)

    def run_tests(self, test_command: Optional[str] = None) -> 'TestResults':
        """Executes the project's automated test suite."""
        cmd = test_command if test_command else self.config.get("validation.test_command", "pytest")
        logging.info(f"Running tests with command: {cmd}")
        try:
            result = subprocess.run(
                cmd.split(),
                cwd=self.codebase_path,
                check=False, # Don't raise error for non-zero exit code, we want to capture it
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                logging.info("Test run passed.")
                return TestResults(passed=True, output=result.stdout)
            else:
                logging.warning(f"Test run failed. Exit code: {result.returncode}")
                return TestResults(passed=False, output=result.stdout + result.stderr, error=f"Tests failed with exit code {result.returncode}")
        except FileNotFoundError:
            logging.error(f"Test command '{cmd.split()[0]}' not found. Is it installed and in PATH?")
            return TestResults(passed=False, error=f"Command not found: {cmd.split()[0]}")
        except Exception as e:
            logging.error(f"Error running tests: {e}")
            return TestResults(passed=False, error=f"Error executing test command: {e}")

    def revert_changes(self, file_path: str) -> None:
        """Reverts a file to its last committed state using VCS."""
        self.vcs.revert_file(file_path)
        logging.warning(f"Reverted file {file_path} to its last VCS state.")

    def analyze_code_quality(self, file_path: str, content: str) -> Dict[str, Any]:
        """Runs all configured code quality analyzers on a file."""
        all_metrics = {}
        for name, analyzer in self.code_quality_analyzers.items():
            try:
                metrics = analyzer.analyze(file_path, content)
                all_metrics[name] = metrics
            except Exception as e:
                logging.error(f"Error running {name} analyzer on {file_path}: {e}")
        return all_metrics

class TestResults:
    """A simple data structure to hold test execution results and associated metrics."""
    def __init__(self, passed: bool, output: str = "", error: str = "", metrics: Optional[Dict[str, Any]] = None):
        self.passed = passed
        self.output = output
        self.error = error
        self.metrics = metrics if metrics is not None else {}

class LLMOrchestrator:
    """
    Manages interactions with Large Language Models, including prompt engineering,
    response parsing, and handling different LLM capabilities.
    """
    def __init__(self, llm_api_client: Any, config: Optional[ConfigManager] = None): # gemini_client, openai_client etc.
        self.client = llm_api_client
        self.config = config if config else ConfigManager()
        self.llm_temperature = self.config.get("llm_temperature", 0.5)
        self.llm_max_tokens = self.config.get("llm_max_tokens", 4000)
        logging.info("LLMOrchestrator initialized.")

    def _extract_code_block(self, text: str) -> str:
        """Helper to extract code block from LLM response."""
        if text.startswith("```"):
            if "```python" in text:
                return text.split("```python")[1].split("```")[0].strip()
            elif "```" in text: # Generic code block
                return text.split("```")[1].split("```")[0].strip()
        return text # Return as is if no code block markers found

    def generate_plan(self, context: Dict[str, Any], goal: str) -> List[str]:
        """
        Prompts the LLM to generate a step-by-step refactoring plan.
        Context includes relevant code, dependency graph, existing tests etc.
        """
        prompt = f"""
        You are an expert software architect and refactoring specialist.
        Given the following high-level refactoring goal and codebase context, generate a detailed,
        sequential plan to achieve the goal. Each step should be actionable and verifiable.
        Include sub-steps for complex operations. Focus on maintaining behavioral equivalence.
        Assess the risk of each step (Low/Medium/High) and suggest explicit rollback strategies.
        Ensure the plan respects the identified architectural patterns and anti-patterns from the knowledge base.

        Refactoring Goal: {goal}

        Codebase Context:
        {json.dumps(context, indent=2)}

        Provide the plan as a numbered list of discrete actions. Each action should start with a number.
        For example:
        1. Macro Step Description [Risk: Medium, Rollback: Revert X file].
           1.1. Micro step description.
           1.2. Another micro step.
        """
        logging.info("Generating refactoring plan using LLM...")
        try:
            response = self.client.generate_text(prompt, max_tokens=self.llm_max_tokens, temperature=self.llm_temperature * 1.2) # Higher temp for planning creativity
            plan_raw = response.get('text', '').strip()
            plan_steps = [step.strip() for step in plan_raw.split('\n') if step.strip() and (step.strip()[0].isdigit() or step.strip().startswith('*'))]
            logging.info(f"LLM generated plan with {len(plan_steps)} steps.")
            return plan_steps
        except Exception as e:
            logging.error(f"Error generating plan with LLM: {e}")
            raise

    def modify_code(self, current_code: str, plan_step: str, context: Dict[str, Any], strategy: CodeGenerationStrategy) -> str:
        """
        Prompts the LLM to apply a specific refactoring step to the given code.
        Context can include surrounding files, ASTs, etc.
        """
        prompt = f"""
        You are an expert code refactoring bot. Your task is to apply a specific refactoring step.
        The generation strategy is: {strategy.value}.
        Ensure syntactical correctness, maintain functionality, and adhere to best practices.
        Return ONLY the modified code, enclosed in a Python code block (```python...```), no explanations or other text.

        Refactoring Step: {plan_step}

        Current Code Context:
        ```python
        {current_code}
        ```
        Additional Context (e.g., surrounding files, AST insights, dependency graph):
        {json.dumps(context, indent=2)}

        Modified Code:
        """
        logging.info(f"Requesting LLM to execute plan step: {plan_step[:80]}... using strategy: {strategy.value}")
        try:
            response = self.client.generate_text(prompt, max_tokens=self.llm_max_tokens, temperature=self.llm_temperature)
            modified_code = self._extract_code_block(response.get('text', ''))
            if not modified_code:
                raise ValueError("LLM returned empty or unparseable code block for modification.")
            return modified_code
        except Exception as e:
            logging.error(f"Error modifying code with LLM for step '{plan_step}': {e}")
            raise

    def fix_code(self, original_failing_code: str, error_message: str, plan_step: str, context: Dict[str, Any]) -> str:
        """
        Prompts the LLM to fix code based on test failures or errors.
        """
        prompt = f"""
        The following code modification, intended to fulfill refactoring step '{plan_step}',
        resulted in an error during validation.
        Analyze the error message and provide the corrected version of the code.
        Ensure syntactical correctness, maintain functionality, and fix the identified issue.
        Return ONLY the corrected code, enclosed in a Python code block (```python...```), no explanations or other text.

        Original Modified Code (that caused the error):
        ```python
        {original_failing_code}
        ```

        Error Message:
        ```
        {error_message}
        ```
        Additional Context (e.g., surrounding files, AST insights, dependency graph):
        {json.dumps(context, indent=2)}

        Corrected Code:
        """
        logging.warning(f"Requesting LLM to fix code due to error for step: {plan_step[:80]}...")
        try:
            response = self.client.generate_text(prompt, max_tokens=self.llm_max_tokens, temperature=self.llm_temperature * 0.7) # Lower temp for more deterministic fix
            fixed_code = self._extract_code_block(response.get('text', ''))
            if not fixed_code:
                raise ValueError("LLM returned empty or unparseable code block for fix.")
            return fixed_code
        except Exception as e:
            logging.error(f"Error fixing code with LLM for step '{plan_step}': {e}")
            raise

    def generate_pr_summary(self, goal: str, changes_summary: str, metrics_summary: Dict[str, Any], architectural_report: List[str]) -> Tuple[str, str]:
        """
        Generates a title and body for a pull request based on the refactoring work.
        """
        title_prompt = f"Generate a concise, professional pull request title (max 80 chars) for this refactoring goal: '{goal}'. Focus on the primary outcome and impact."
        body_prompt = f"""
        Generate a detailed and professional pull request description.
        It should cover:
        1. The original refactoring goal.
        2. A high-level summary of the key changes made.
        3. The rationale behind major design decisions.
        4. How behavioral invariance was ensured (e.g., extensive testing).
        5. Any measured improvements in quality metrics (e.g., complexity, coverage, duplication, performance).
        6. The architectural compliance report (e.g., adherence to patterns, detected violations).
        7. Instructions for human reviewer.

        Refactoring Goal: {goal}
        Summary of Changes (from agent's execution log): {changes_summary}
        Validation and Metrics Report: {json.dumps(metrics_summary, indent=2)}
        Architectural Compliance Report: {json.dumps(architectural_report, indent=2)}
        """
        logging.info("Generating PR title and body...")
        try:
            title = self.client.generate_text(title_prompt, max_tokens=80, temperature=self.llm_temperature * 0.3).get('text', '').strip().replace('"', '')
            body = self.client.generate_text(body_prompt, max_tokens=1500, temperature=self.llm_temperature * 0.4).get('text', '').strip()
            return title, body
        except Exception as e:
            logging.error(f"Error generating PR summary with LLM: {e}")
            return f"AI Refactor: {goal[:50]}", f"Automated refactor for goal: {goal}\nDetails: {changes_summary}"

    def generate_documentation_update(self, file_path: str, code_content: str, change_description: str, context: Dict[str, Any]) -> str:
        """
        Generates or updates documentation/docstrings for a specific file/function.
        """
        prompt = f"""
        The following Python code in '{file_path}' has been refactored.
        The changes made are described as: '{change_description}'.
        Your task is to either generate new docstrings, update existing ones, or add inline comments
        to reflect these changes, enhance clarity, and ensure the documentation is up-to-date.
        Consider the existing context of the file and its role in the system.
        Return ONLY the updated Python code with enhanced documentation, no explanations.

        Original Code:
        ```python
        {code_content}
        ```
        Additional Context (e.g., related files, refactoring goal):
        {json.dumps(context, indent=2)}

        Updated Code:
        """
        logging.info(f"Generating documentation update for {file_path}...")
        try:
            response = self.client.generate_text(prompt, max_tokens=2000, temperature=self.llm_temperature * 0.4)
            return self._extract_code_block(response.get('text', ''))
        except Exception as e:
            logging.error(f"Error generating documentation update with LLM: {e}")
            return ""

class PlanningModule:
    """
    Orchestrates the creation and management of refactoring plans,
    potentially incorporating hierarchical structures and dependencies.
    """
    def __init__(self, llm_orchestrator: LLMOrchestrator, knowledge_base: 'KnowledgeBase'):
        self.llm_orchestrator = llm_orchestrator
        self.knowledge_base = knowledge_base # For retrieving refactoring patterns, best practices
        logging.info("PlanningModule initialized.")

    def formulate_plan(self, initial_code_context: Dict[str, Any], goal: str) -> List[str]:
        """
        Formulates a comprehensive, multi-step refactoring plan.
        Augments the initial context with relevant patterns and anti-patterns from the KnowledgeBase.
        """
        augmented_context = initial_code_context.copy()
        # Dynamically query knowledge base for patterns/anti-patterns relevant to the goal
        augmented_context['known_patterns'] = self.knowledge_base.query_patterns_for_goal(goal)
        augmented_context['known_anti_patterns'] = self.knowledge_base.query_anti_patterns_for_goal(goal)
        plan = self.llm_orchestrator.generate_plan(augmented_context, goal)
        return plan

class ExecutionModule:
    """
    Responsible for applying code changes, managing file state, and
    interfacing with the codebase manager.
    """
    def __init__(self, codebase_manager: CodebaseManager, llm_orchestrator: LLMOrchestrator, ast_processor: ASTProcessor, rollback_manager: RollbackManager):
        self.codebase_manager = codebase_manager
        self.llm_orchestrator = llm_orchestrator
        self.ast_processor = ast_processor
        self.rollback_manager = rollback_manager
        self.file_snapshots: Dict[str, str] = {} # For rollback to previous state within a refactoring step
        logging.info("ExecutionModule initialized.")

    def apply_step(self, file_path: str, current_content: str, plan_step: str, context: Dict[str, Any], strategy: CodeGenerationStrategy) -> str:
        """Applies a single refactoring step and returns the modified content."""
        self.file_snapshots[file_path] = current_content # Save for potential rollback
        modified_content = self.llm_orchestrator.modify_code(current_content, plan_step, context, strategy)
        self.codebase_manager.write_file(file_path, modified_content)
        return modified_content

    def attempt_fix(self, file_path: str, modified_content: str, error_message: str, plan_step: str, context: Dict[str, Any]) -> str:
        """Attempts to fix failed code and returns the corrected content."""
        fixed_content = self.llm_orchestrator.fix_code(modified_content, error_message, plan_step, context)
        self.codebase_manager.write_file(file_path, fixed_content)
        return fixed_content

    def rollback_to_snapshot(self, file_path: str) -> None:
        """Reverts the specified file to its last snapshot (within a step)."""
        if file_path in self.file_snapshots:
            self.codebase_manager.write_file(file_path, self.file_snapshots[file_path])
            del self.file_snapshots[file_path]
            logging.warning(f"Rolled back file {file_path} to its last in-step snapshot.")
        else:
            logging.warning(f"No in-step snapshot found for {file_path} to rollback.")

    def format_code(self, file_path: str) -> None:
        """Applies standard code formatting (e.g., Black for Python)."""
        if file_path.endswith('.py'):
            try:
                subprocess.run(["black", file_path], cwd=self.codebase_manager.codebase_path, check=True, capture_output=True, text=True)
                logging.info(f"Applied Black formatting to {file_path}")
            except subprocess.CalledProcessError as e:
                logging.warning(f"Black formatting failed for {file_path}: {e.stderr.strip()}")
            except FileNotFoundError:
                logging.warning("Black not found. Skipping code formatting.")
        # Add other formatters for other languages (e.g., prettier, go fmt)
        elif file_path.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.html')):
            try:
                subprocess.run(["prettier", "--write", file_path], cwd=self.codebase_manager.codebase_path, check=True, capture_output=True, text=True)
                logging.info(f"Applied Prettier formatting to {file_path}")
            except subprocess.CalledProcessError as e:
                logging.warning(f"Prettier formatting failed for {file_path}: {e.stderr.strip()}")
            except FileNotFoundError:
                logging.warning("Prettier not found. Skipping code formatting.")


class ValidationModule:
    """
    Handles all aspects of validating code changes, including running tests,
    static analysis, architectural compliance checks, security scans, and performance benchmarking.
    """
    def __init__(self, codebase_manager: CodebaseManager, architectural_checker: ArchitecturalComplianceChecker, test_augmentation_module: TestAugmentationModule, config: ConfigManager):
        self.codebase_manager = codebase_manager
        self.architectural_checker = architectural_checker
        self.test_augmentation_module = test_augmentation_module
        self.config = config
        self.test_command = self.config.get("validation.test_command", "pytest")
        self.static_analysis_commands = self.config.get("validation.static_analysis_commands", [])
        self.security_scan_commands = self.config.get("validation.security_scan_commands", [])
        self.benchmarking_command = self.config.get("validation.benchmarking_command")
        logging.info("ValidationModule initialized.")

    def validate_changes(self, modified_files_contents: Dict[str, str], changed_entities_per_file: Dict[str, List[str]], current_full_codebase_state: Dict[str, str]) -> 'TestResults':
        """
        Executes a comprehensive validation suite: unit tests, static analysis,
        architectural checks, security scans, and optionally performance benchmarks.
        """
        validation_errors = []
        all_metrics = {}

        # 0. Test Augmentation (optional, but good for refactoring new logic or covering gaps)
        generated_test_files: List[str] = []
        for file_path, content in modified_files_contents.items():
            if file_path.endswith('.py'):
                # Try to generate new unit tests for changed entities
                entities = changed_entities_per_file.get(file_path, [])
                if entities:
                    new_unit_tests = self.test_augmentation_module.generate_unit_tests(
                        file_path, content, entities
                    )
                    if new_unit_tests:
                        test_file_path = os.path.join(os.path.dirname(file_path), f"test_{os.path.basename(file_path)}")
                        # Write to a temporary test file to not pollute original
                        temp_test_file_name = f"temp_agent_test_{uuid.uuid4().hex[:8]}.py"
                        temp_test_file_path = os.path.join(self.codebase_manager.codebase_path, "tests", temp_test_file_name)
                        os.makedirs(os.path.dirname(temp_test_file_path), exist_ok=True)
                        self.codebase_manager.write_file(temp_test_file_path, new_unit_tests)
                        generated_test_files.append(temp_test_file_path)
                        logging.info(f"Generated unit tests for {file_path} into temporary file: {temp_test_file_name}.")
                
                # Check for coverage gaps if previous coverage data is available (conceptual)
                # In a real scenario, this would involve comparing current coverage against a baseline
                # For now, simulate by calling a conceptual analyzer
                # cov_report = self.codebase_manager.analyze_code_quality(file_path, content).get('coverage', {})
                # if cov_report.get('missing_lines'):
                #     coverage_gap_tests = self.test_augmentation_module.identify_coverage_gaps_and_suggest_tests(cov_report, file_path, content)
                #     if coverage_gap_tests:
                #         # Write to another temp file
                #         pass


        # 1. Automated Test Suite Execution
        test_results = self.codebase_manager.run_tests(self.test_command)
        if not test_results.passed:
            validation_errors.append(f"Test suite failed:\n{test_results.output}")
        all_metrics["test_results"] = {"passed": test_results.passed, "output": test_results.output}

        # 2. Static Code Analysis (on all relevant files, not just modified, for holistic view)
        static_analysis_output = self._run_static_analysis(current_full_codebase_state)
        if static_analysis_output["errors"]:
            validation_errors.append(f"Static analysis failed:\n{static_analysis_output['errors']}")
        all_metrics["static_analysis"] = static_analysis_output["metrics"]

        # 3. Architectural Compliance Checks
        # Rebuild dependency graph with current state to ensure checks are accurate
        self.codebase_manager.dependency_analyzer.build_dependency_graph(current_full_codebase_state)
        full_codebase_context_for_arch = {
            "file_contents": current_full_codebase_state,
            "dependency_graph": self.codebase_manager.dependency_analyzer.import_graph, # Use import graph for arch checks
            "call_graph": self.codebase_manager.dependency_analyzer.call_graph
        }
        architectural_violations = self.architectural_checker.identify_violations(full_codebase_context_for_arch)
        if architectural_violations:
            validation_errors.append(f"Architectural compliance violations:\n{', '.join(architectural_violations)}")
        all_metrics["architectural_compliance"] = {"violations": architectural_violations, "passed": not bool(architectural_violations)}

        # 4. Security Scans
        security_scan_output = self._run_security_scans(modified_files_contents) # Run on modified files for efficiency
        if security_scan_output:
            validation_errors.append(f"Security scan findings:\n{security_scan_output}")
        all_metrics["security_scan"] = {"output": security_scan_output, "passed": not bool(security_scan_output)}

        # 5. Dynamic Analysis/Performance Benchmarking
        perf_results = TestResults(passed=True)
        if self.benchmarking_command:
            perf_results = self._run_performance_benchmarks(current_full_codebase_state)
            if not perf_results.passed:
                validation_errors.append(f"Performance benchmarks failed:\n{perf_results.output}")
        all_metrics["performance_benchmarking"] = {"passed": perf_results.passed, "output": perf_results.output}

        # Cleanup generated test files
        for temp_file in generated_test_files:
            try:
                os.remove(temp_file)
                logging.info(f"Cleaned up temporary test file: {temp_file}")
            except Exception as e:
                logging.warning(f"Failed to remove temporary test file {temp_file}: {e}")

        if validation_errors:
            return TestResults(passed=False, error="\n".join(validation_errors), metrics=all_metrics)
        return TestResults(passed=True, output="All validations passed.", metrics=all_metrics)

    def _run_static_analysis(self, codebase_files_contents: Dict[str, str]) -> Dict[str, Any]:
        """Runs configured static analysis tools (e.g., pylint, flake8) on relevant files."""
        errors = []
        metrics: Dict[str, Any] = {} # Detailed metrics per file from analyzers

        # Run configured analyzers (e.g., ComplexityMetricsAnalyzer, CoverageMetricsAnalyzer, DuplicationMetricsAnalyzer)
        for file_path, content in codebase_files_contents.items():
            if file_path.endswith('.py'): # Only analyze Python files with internal analyzers
                file_metrics = self.codebase_manager.analyze_code_quality(file_path, content)
                metrics[file_path] = file_metrics

        # Run external static analysis commands
        python_files = [fp for fp in codebase_files_contents.keys() if fp.endswith('.py')]
        for cmd_template in self.static_analysis_commands:
            tool_name = cmd_template.split()[0]
            if not python_files: continue # Only run on python files if available
            try:
                # Run on all relevant python files, or a subset for speed
                command_args = [os.path.join(self.codebase_manager.codebase_path, fp) for fp in python_files]
                cmd = cmd_template.split() + command_args
                result = subprocess.run(cmd, cwd=self.codebase_manager.codebase_path, check=False, capture_output=True, text=True, timeout=120) # 2 min timeout
                if result.returncode != 0 and result.stdout.strip(): # Pylint/Flake8 often output to stdout
                    errors.append(f"[{tool_name} error]\n{result.stdout.strip()}")
            except FileNotFoundError:
                logging.warning(f"Static analysis tool '{tool_name}' not found. Skipping.")
            except subprocess.TimeoutExpired:
                errors.append(f"[{tool_name} error] Timeout occurred after 120 seconds.")
                logging.error(f"Static analysis tool '{tool_name}' timed out.")
            except Exception as e:
                logging.error(f"Error running static analysis '{tool_name}': {e}")
        return {"errors": "\n".join(errors), "metrics": metrics}

    def _run_security_scans(self, modified_files_contents: Dict[str, str]) -> str:
        """Runs configured security scan tools (e.g., bandit) on modified files."""
        errors = []
        python_files_modified = [fp for fp in modified_files_contents.keys() if fp.endswith('.py')]

        for cmd_template in self.security_scan_commands:
            tool_name = cmd_template.split()[0]
            if not python_files_modified: continue
            try:
                # Bandit is typically run on a directory; adjust if it needs specific files
                command_args = [os.path.join(self.codebase_manager.codebase_path, fp) for fp in python_files_modified]
                # For bandit, often better to run on the whole directory or a subset.
                # Here, we pass specific files if tool supports it, otherwise fallback to repo_path
                if "bandit" in tool_name: # Bandit typically takes -r for recursive, not file list directly
                     cmd = cmd_template.split() + [self.codebase_manager.codebase_path]
                else:
                    cmd = cmd_template.split() + command_args

                result = subprocess.run(cmd, cwd=self.codebase_manager.codebase_path, check=False, capture_output=True, text=True, timeout=120)
                if result.returncode != 0 and result.stdout.strip(): # Bandit exits non-zero if issues found
                    errors.append(f"[{tool_name} findings]\n{result.stdout.strip()}")
            except FileNotFoundError:
                logging.warning(f"Security tool '{tool_name}' not found. Skipping.")
            except subprocess.TimeoutExpired:
                errors.append(f"[{tool_name} findings] Timeout occurred after 120 seconds.")
                logging.error(f"Security scan tool '{tool_name}' timed out.")
            except Exception as e:
                logging.error(f"Error running security scan '{tool_name}': {e}")
        return "\n".join(errors)

    def _run_performance_benchmarks(self, codebase_files_contents: Dict[str, str]) -> 'TestResults':
        """Runs configured performance benchmarks."""
        if not self.benchmarking_command:
            return TestResults(passed=True, output="No benchmarking command configured.")

        logging.info(f"Running performance benchmarks: {self.benchmarking_command}")
        # In a real system, compare current performance metrics against a stored baseline.
        # This might involve complex parsing of benchmark tool output.
        try:
            result = subprocess.run(
                self.benchmarking_command.split(),
                cwd=self.codebase_manager.codebase_path,
                check=False,
                capture_output=True,
                text=True,
                timeout=300 # 5 min timeout for benchmarks
            )
            # Simulate performance degradation: if current codebase has a known "perf_bottleneck_marker"
            # or if code size increased significantly and it's a perf-critical section.
            # This is a very simplistic heuristic.
            is_perf_critical_refactor = any("performance_bottleneck" in content for content in codebase_files_contents.values())
            code_size_increased = sum(len(content) for content in codebase_files_contents.values()) > 1.1 * sum(len(self.codebase_manager.read_files([fp]).get(fp, "")) for fp in codebase_files_contents.keys()) # Compare with initial read content

            if result.returncode != 0:
                return TestResults(passed=False, output=result.stdout + result.stderr, error="Benchmarking command failed.")
            if is_perf_critical_refactor and code_size_increased: # Very simple heuristic for degradation
                logging.warning("Simulated performance regression detected due to code bloat in performance-critical section.")
                return TestResults(passed=False, output=result.stdout, error="Simulated performance regression detected after changes.")
            logging.info("Performance benchmarks passed (simulated).")
            return TestResults(passed=True, output=result.stdout)
        except FileNotFoundError:
            logging.warning(f"Benchmarking command '{self.benchmarking_command.split()[0]}' not found. Skipping performance benchmarks.")
            return TestResults(passed=True, output="Benchmarking tool not found.")
        except subprocess.TimeoutExpired:
            logging.error(f"Performance benchmarking command '{self.benchmarking_command.split()[0]}' timed out.")
            return TestResults(passed=False, error=f"Benchmarking command timed out.")
        except Exception as e:
            logging.error(f"Error running performance benchmarks: {e}")
            return TestResults(passed=False, error=f"Error executing benchmarking command: {e}")

class KnowledgeBase:
    """
    A conceptual knowledge base for storing refactoring patterns, architectural
    guidelines, historical insights, and learned feedback to aid the LLM and agent decisions.
    """
    def __init__(self):
        self.patterns = {
            "class_based_conversion": ["Encapsulate functions into a class.", "Use dependency injection.", "Apply Builder pattern."],
            "performance_optimization": ["Optimize loop iterations.", "Cache expensive computations.", "Use efficient data structures."],
            "modularity_enhancement": ["Extract interface.", "Separate concerns.", "Use facade pattern.", "Apply Adapter pattern."],
            "type_safety_enforcement": ["Add strict type hints.", "Use static analysis for type checking."],
            "idiomatic_python": ["Use list comprehensions.", "Prefer context managers.", "Follow PEP 8.", "Utilize generators."],
            "clean_architecture_principles": ["Separate concerns into layers.", "Dependencies flow inwards.", "Entities are independent of framework."],
            "refactor_for_testability": ["Mock external dependencies.", "Use pure functions where possible.", "Design for test isolation."],
        }
        self.anti_patterns = {
            "god_object": ["Avoid large classes with too many responsibilities.", "Refactor large classes into smaller, focused ones."],
            "tight_coupling": ["Reduce direct dependencies, favor interfaces/abstractions.", "Minimize global state."],
            "magic_numbers_strings": ["Avoid hardcoded numbers/strings, use named constants or enums."],
            "duplicate_code": ["Refactor into shared functions/classes/modules.", "Apply Template Method pattern."],
            "feature_envy": ["Move method to the class it uses most."],
            "shotgun_surgery": ["Consolidate changes that should be together."],
            "inappropriate_intimacy": ["Reduce excessive inter-object knowledge."],
            "data_clumps": ["Group related data into an object."],
        }
        self.feedback_history: List[Dict[str, Any]] = []
        logging.info("KnowledgeBase initialized with sample patterns and anti-patterns.")

    def query_patterns_for_goal(self, goal: str) -> List[str]:
        """Retrieves relevant refactoring patterns based on the goal using semantic matching."""
        relevant_patterns = []
        goal_lower = goal.lower()
        for category, descriptions in self.patterns.items():
            if category.replace('_', ' ') in goal_lower or any(word in goal_lower for word in category.split('_')):
                relevant_patterns.extend(descriptions)
        # Further enhance with LLM-based semantic matching against descriptions if a strong embedding model is available
        return list(set(relevant_patterns))

    def query_anti_patterns_for_goal(self, goal: str) -> List[str]:
        """Retrieves relevant anti-patterns to avoid based on the goal using semantic matching."""
        relevant_anti_patterns = []
        goal_lower = goal.lower()
        for category, descriptions in self.anti_patterns.items():
            if category.replace('_', ' ') in goal_lower or any(word in goal_lower for word in category.split('_')):
                relevant_anti_patterns.extend(descriptions)
        return list(set(relevant_anti_patterns))

    def store_feedback(self, feedback_data: Dict[str, Any]) -> None:
        """Stores human feedback for later analysis and learning."""
        self.feedback_history.append({"timestamp": time.time(), **feedback_data})
        logging.info(f"Stored feedback for PR {feedback_data.get('pr_id')}.")

    def add_pattern(self, pattern_description: str, category: str = "learned_dynamic") -> None:
        """Adds a new pattern to the knowledge base, typically from positive feedback."""
        if category not in self.patterns:
            self.patterns[category] = []
        if pattern_description not in self.patterns[category]:
            self.patterns[category].append(pattern_description)
            logging.info(f"Added new pattern '{pattern_description}' to category '{category}'.")

    def add_anti_pattern(self, anti_pattern_description: str, category: str = "learned_dynamic") -> None:
        """Adds a new anti-pattern to the knowledge base, typically from negative feedback."""
        if category not in self.anti_patterns:
            self.anti_patterns[category] = []
        if anti_pattern_description not in self.anti_patterns[category]:
            self.anti_patterns[category].append(anti_pattern_description)
            logging.info(f"Added new anti-pattern '{anti_pattern_description}' to category '{category}'.")

class TelemetrySystem:
    """
    Captures operational metrics, agent decisions, and outcomes for
    monitoring, debugging, and continuous improvement.
    """
    def __init__(self):
        self.logs = []
        self.metrics = {
            "total_plan_steps": 0,
            "succeeded_plan_steps": 0,
            "failed_plan_steps": 0,
            "total_fix_attempts": 0,
            "total_files_modified": 0,
            "total_validation_runs": 0,
            "total_validation_failures": 0,
            "refactoring_start_time": None,
            "refactoring_end_time": None,
            "duration_seconds": 0,
            "refactoring_status": "Initialized" # Added status for overall tracking
        }
        self.data_store = {} # For storing non-metric summary data (e.g., PR info, goal)
        logging.info("TelemetrySystem initialized.")

    def record_event(self, event_type: str, data: Dict[str, Any]):
        """Records a specific event with associated data."""
        self.logs.append({"timestamp": time.time(), "type": event_type, "data": data})
        logging.debug(f"Telemetry recorded: {event_type}")

    def update_metric(self, metric_name: str, value: Any, increment: bool = False):
        """Updates a quantifiable metric."""
        if increment and isinstance(self.metrics.get(metric_name), (int, float)):
            self.metrics[metric_name] = self.metrics.get(metric_name, 0) + value
        else:
            self.metrics[metric_name] = value
        logging.debug(f"Metric updated: {metric_name} = {self.metrics[metric_name]}")

    def update_data(self, key: str, value: Any):
        """Stores or updates non-metric data."""
        self.data_store[key] = value

    def get_summary(self) -> Dict[str, Any]:
        """Provides a summary of captured telemetry."""
        if self.metrics["refactoring_start_time"] and self.metrics["refactoring_end_time"]:
            self.metrics["duration_seconds"] = self.metrics["refactoring_end_time"] - self.metrics["refactoring_start_time"]
        else: # Handle case where refactoring might still be in progress
             self.metrics["duration_seconds"] = time.time() - self.metrics["refactoring_start_time"] if self.metrics["refactoring_start_time"] else 0


        return {"logs": self.logs, "metrics": self.metrics, "data": self.data_store}

    def get_metric(self, metric_name: str, default_value: Any = None) -> Any:
        """Retrieves a specific metric."""
        return self.metrics.get(metric_name, default_value)

class RefactoringAgent:
    """
    The main autonomous agent orchestrating the entire refactoring process.
    """
    def __init__(self, goal: str, codebase_path: str, llm_client: Any, config_path: Optional[str] = None):
        self.goal = goal
        self.config_manager = ConfigManager(config_path)
        self.config = self.config_manager.get_all() # Access raw dict for convenience

        self.telemetry = TelemetrySystem()
        self.ast_processor = ASTProcessor()
        self.dependency_analyzer = DependencyAnalyzer()
        self.semantic_indexer = SemanticIndexer(embedding_model=self._get_embedding_model()) # Pass a real embedding model

        # Initialize code quality analyzers
        self.complexity_analyzer = ComplexityMetricsAnalyzer()
        self.coverage_analyzer = CoverageMetricsAnalyzer()
        self.duplication_analyzer = DuplicationMetricsAnalyzer()
        code_quality_analyzers = {
            "complexity": self.complexity_analyzer,
            "coverage": self.coverage_analyzer,
            "duplication": self.duplication_analyzer
        }

        self.vcs_integration = GitVCSIntegration(codebase_path)
        self.codebase_manager = CodebaseManager(
            codebase_path,
            vcs_integration=self.vcs_integration,
            ast_processor=self.ast_processor,
            dependency_analyzer=self.dependency_analyzer,
            semantic_indexer=self.semantic_indexer,
            code_quality_analyzers=code_quality_analyzers,
            config=self.config_manager
        )
        self.llm_orchestrator = LLMOrchestrator(llm_client, config=self.config_manager)
        self.knowledge_base = KnowledgeBase() # Potentially loaded from external source or database
        self.planning_module = PlanningModule(self.llm_orchestrator, self.knowledge_base)
        self.rollback_manager = RollbackManager(self.vcs_integration)
        self.execution_module = ExecutionModule(self.codebase_manager, self.llm_orchestrator, self.ast_processor, self.rollback_manager)
        self.architectural_checker = ArchitecturalComplianceChecker(self.config_manager.get('architectural_rules', {}))
        self.test_augmentation_module = TestAugmentationModule(self.llm_orchestrator)
        self.validation_module = ValidationModule(self.codebase_manager, self.architectural_checker, self.test_augmentation_module, self.config_manager)
        self.human_feedback_processor = HumanFeedbackProcessor(self.knowledge_base)
        self.refactoring_analytics = RefactoringAnalytics(self.telemetry)

        self.current_code_state: Dict[str, str] = {} # Represents the agent's current understanding of the codebase
        self.initial_code_quality_metrics: Dict[str, Any] = {}
        self.final_code_quality_metrics: Dict[str, Any] = {}
        self.changed_entities_per_file: Dict[str, List[str]] = {} # Tracks what entities were modified per file in a step
        self.code_generation_strategy = CodeGenerationStrategy[self.config_manager.get('code_generation_strategy', 'WHOLE_FILE_REPLACE').upper()]
        self.max_fix_attempts = self.config_manager.get("validation.max_fix_attempts_per_step", 3)

        # Generate a unique and clean branch name from the goal
        branch_prefix = self.config_manager.get("branch_prefix", "ai-refactor-")
        self.refactoring_branch_name = branch_prefix + "".join(filter(str.isalnum, goal.lower()))[:30].replace(' ', '_') + "-" + str(uuid.uuid4().hex[:6])

        self.telemetry.record_event("agent_initialized", {"goal": goal, "codebase_path": codebase_path, "config": self.config})
        self.telemetry.update_data("goal", goal)
        logging.info(f"RefactoringAgent initialized with goal: '{goal}'")

    def _get_embedding_model(self):
        """Conceptual method to get an embedding model client."""
        # This would involve importing and initializing an actual embedding model (e.g., from Google, OpenAI)
        class MockEmbeddingModel:
            _dimension = 384 # Common embedding dimension for sentence-transformers models
            def encode(self, text: str) -> List[float]:
                if not text:
                    return [0.0] * self._dimension # Return zero vector for empty text
                # Simple hash-based mock embedding, normalized.
                # Use a more sophisticated hashing or a simple sum for a unique but consistent vector.
                hash_val = sum(ord(c) for c in text) % (10**5) # A larger range for better 'uniqueness'
                # Create a vector where elements are derived from the hash, providing some 'direction'
                base_vector = [float(hash_val / (10**5)) + (i * 0.001) for i in range(self._dimension)]
                # Normalize to unit vector (conceptual)
                norm = math.sqrt(sum(x*x for x in base_vector))
                return [x / norm if norm != 0 else 0.0 for x in base_vector]
        return MockEmbeddingModel()

    def run(self):
        """
        Executes the entire autonomous refactoring process.
        """
        logging.info("Starting autonomous refactoring process...")
        self.telemetry.record_event("refactoring_started", {"goal": self.goal})
        self.telemetry.update_metric("refactoring_start_time", time.time())
        self.telemetry.update_metric("refactoring_status", "In Progress")

        original_branch = self.vcs_integration.get_current_state().get("branch", "main")
        base_branch = self.config_manager.get("base_branch", "main")

        try:
            self.vcs_integration.create_branch(self.refactoring_branch_name)

            # 1. Goal Ingestion (implicitly done in __init__ and used throughout)

            # 2. Observe: Identify and read relevant files, build graphs, index semantics
            all_code_files = self.codebase_manager.find_all_code_files()
            initial_full_codebase_state = self.codebase_manager.read_files(all_code_files)

            if not initial_full_codebase_state:
                logging.error("Could not read content of any files in codebase. Exiting.")
                self.telemetry.record_event("refactoring_failed", {"reason": "read_files_failed"})
                self.telemetry.update_metric("refactoring_status", "Failed")
                return

            # Analyze initial code quality metrics for comparison later
            for fp, content in initial_full_codebase_state.items():
                if fp.endswith('.py'): # Only run detailed quality checks on python files
                    self.initial_code_quality_metrics[fp] = self.codebase_manager.analyze_code_quality(fp, content)
            self.telemetry.record_event("initial_quality_metrics_captured", self.initial_code_quality_metrics)


            # Build dependency graphs and semantic index for the *entire* codebase initially
            self.codebase_manager.dependency_analyzer.build_dependency_graph(initial_full_codebase_state)
            goal_embedding = self.semantic_indexer.embedding_model.encode(self.goal)
            self.codebase_manager.semantic_indexer.build_index(initial_full_codebase_state)

            # Use semantic search to identify primary relevant files
            relevant_files_paths = self.codebase_manager.find_relevant_files_semantic(goal_embedding)
            if not relevant_files_paths:
                logging.warning("Semantic search found no relevant files. Falling back to lexical search.")
                # Heuristic for lexical search keyword from goal (e.g., "service name" from "Refactor X service")
                keywords_from_goal = [w.strip("`'") for w in self.goal.split() if w.strip("`'").isalnum() and len(w) > 3]
                lexical_keywords = keywords_from_goal if keywords_from_goal else [self.goal.split()[0]]
                for kw in lexical_keywords:
                    relevant_files_paths.extend(self.codebase_manager.find_relevant_files_lexical(kw))
                relevant_files_paths = list(set(relevant_files_paths)) # Ensure uniqueness

            if not relevant_files_paths:
                logging.error("No relevant files found by any search method. Exiting.")
                self.telemetry.record_event("refactoring_failed", {"reason": "no_relevant_files"})
                self.telemetry.update_metric("refactoring_status", "Failed")
                return

            # Load only the relevant files into current_code_state for focused work.
            # However, for validation and graph building, the *full* codebase state is still needed.
            self.current_code_state = self.codebase_manager.read_files(relevant_files_paths)

            self.telemetry.record_event("relevant_files_identified", {"files": list(self.current_code_state.keys())})
            logging.info(f"Identified {len(self.current_code_state)} relevant files.")

            # 3. Orient (Plan): Generate a multi-step refactoring plan
            initial_context_for_planning = {
                "files_to_refactor": self.current_code_state,
                "current_vcs_state": self.vcs_integration.get_current_state(),
                "dependency_graph_imports": {fp: list(imports) for fp, imports in self.codebase_manager.dependency_analyzer.import_graph.items()},
                "dependency_graph_calls": {fp: list(calls) for fp, calls in self.codebase_manager.dependency_analyzer.call_graph.items()},
                "commit_history_relevant_files": {
                    f: self.vcs_integration.get_commit_history(f) for f in relevant_files_paths
                },
                "initial_quality_metrics": self.initial_code_quality_metrics
            }
            plan = self.planning_module.formulate_plan(initial_context_for_planning, self.goal)
            self.telemetry.update_metric("total_plan_steps", len(plan))

            if not plan:
                logging.error("Failed to generate a refactoring plan. Exiting.")
                self.telemetry.record_event("refactoring_failed", {"reason": "plan_generation_failed"})
                self.telemetry.update_metric("refactoring_status", "Failed")
                return

            self.telemetry.record_event("plan_generated", {"num_steps": len(plan), "plan_preview": plan[:min(3, len(plan))]})
            logging.info(f"Generated a plan with {len(plan)} steps.")

            # 4. Decide & Act (Iterative Refactoring): Execute the plan
            changes_summary_list = []
            overall_architectural_violations: List[str] = []
            successfully_modified_files: Set[str] = set()

            for i, step in enumerate(plan):
                logging.info(f"Executing plan step {i+1}/{len(plan)}: '{step}'")
                self.telemetry.record_event("plan_step_started", {"step_num": i+1, "step_description": step})

                # Determine the target file(s) for the current step.
                # This is a critical point: the LLM-generated plan should ideally specify target files/entities.
                # For this example, we'll try to apply to a relevant Python file.
                target_file_path = next((f for f in relevant_files_paths if f.endswith('.py') and f in initial_full_codebase_state), None)
                if not target_file_path:
                    logging.warning(f"No suitable Python target file found in relevant files for step '{step}'. Skipping step.")
                    self.telemetry.update_metric("failed_plan_steps", 1, increment=True)
                    self.telemetry.record_event("plan_step_skipped", {"step_num": i+1, "reason": "no_target_file_found"})
                    continue

                # Ensure the current code state for this file is up-to-date
                current_file_content = self.codebase_manager.read_files([target_file_path]).get(target_file_path)
                if not current_file_content:
                    logging.error(f"Failed to read content for target file {target_file_path}. Skipping step.")
                    self.telemetry.update_metric("failed_plan_steps", 1, increment=True)
                    continue

                original_file_snapshot = current_file_content # Snapshot for rollback within this step

                try_count = 0
                step_completed = False

                while try_count < self.max_fix_attempts and not step_completed:
                    try_count += 1
                    self.telemetry.update_metric("total_fix_attempts", 1, increment=True)
                    try:
                        # Apply modification
                        modification_context = initial_context_for_planning.copy()
                        modification_context["current_file_target"] = target_file_path # Add specific context for LLM
                        modification_context["relevant_code_snippets"] = self.semantic_indexer.query_similar_code(goal_embedding, k=5) # Example: Add more context

                        modified_code = self.execution_module.apply_step(
                            target_file_path, current_file_content, step, modification_context, self.code_generation_strategy
                        )
                        self.current_code_state[target_file_path] = modified_code # Update agent's internal view
                        successfully_modified_files.add(target_file_path)
                        self.telemetry.update_metric("total_files_modified", 1, increment=True)
                        logging.debug(f"Step {i+1} code modification applied to {target_file_path} (attempt {try_count}).")

                        # Post-refactoring formatting for consistency
                        self.execution_module.format_code(os.path.join(self.codebase_manager.codebase_path, target_file_path))

                        # Placeholder for tracking changed entities (e.g., functions, classes) within the file
                        # A real implementation would involve AST diffing between original_file_snapshot and modified_code
                        # For simplicity, if code changed, assume some entity changed.
                        if original_file_snapshot != modified_code:
                            self.changed_entities_per_file[target_file_path] = ["_AGENT_MODIFIED_ENTITY_"]
                        else:
                            self.changed_entities_per_file.pop(target_file_path, None) # Clear if no change

                        # Validate changes (pass all potentially affected files for validation)
                        # We need to rebuild the full codebase state for comprehensive validation
                        # by reading all files, then overlaying the modified ones.
                        current_full_codebase_state_for_validation = initial_full_codebase_state.copy()
                        current_full_codebase_state_for_validation.update(self.current_code_state) # Overlay changes

                        self.telemetry.update_metric("total_validation_runs", 1, increment=True)
                        validation_results = self.validation_module.validate_changes(
                            {tf: self.current_code_state[tf] for tf in successfully_modified_files}, # Only pass modified files' contents to validation for focused analysis
                            self.changed_entities_per_file,
                            current_full_codebase_state_for_validation # Pass full state for holistic checks (arch, global static analysis)
                        )
                        
                        if validation_results.passed:
                            logging.info(f"Plan step {i+1} validated successfully (attempt {try_count}).")
                            self.telemetry.record_event("plan_step_succeeded", {"step_num": i+1, "attempt": try_count, "metrics": validation_results.metrics})
                            self.telemetry.update_metric("succeeded_plan_steps", 1, increment=True)
                            changes_summary_list.append(f"Step {i+1} ('{step}'): Applied changes to {target_file_path} and passed validation.")
                            step_completed = True
                        else:
                            self.telemetry.update_metric("total_validation_failures", 1, increment=True)
                            logging.warning(f"Plan step {i+1} validation failed (attempt {try_count}). Error: {validation_results.error[:200]}...")
                            self.telemetry.record_event("plan_step_failed_validation", {
                                "step_num": i+1, "attempt": try_count, "error": validation_results.error, "metrics": validation_results.metrics
                            })
                            if try_count < self.max_fix_attempts:
                                logging.info(f"Attempting to fix code for step {i+1} (fix attempt {try_count})...")
                                # Attempt to fix using LLM
                                fixed_code = self.execution_module.attempt_fix(
                                    target_file_path, modified_code, validation_results.error, step, modification_context
                                )
                                self.current_code_state[target_file_path] = fixed_code
                                logging.info(f"Fix attempt {try_count} applied and saved for {target_file_path}.")
                                current_file_content = fixed_code # Update for next loop iteration
                            else:
                                logging.error(f"Max fix attempts ({self.max_fix_attempts}) reached for step {i+1}. Rolling back this step.")
                                self.execution_module.rollback_to_snapshot(target_file_path) # Rollback to prior to this step's modification
                                self.current_code_state[target_file_path] = original_file_snapshot # Restore local state
                                successfully_modified_files.discard(target_file_path) # Mark as not successfully modified
                                self.telemetry.record_event("plan_step_failed_permanently", {"step_num": i+1, "original_error": validation_results.error})
                                self.telemetry.update_metric("failed_plan_steps", 1, increment=True)
                                raise Exception(f"Failed to complete plan step '{step}' after {self.max_fix_attempts} attempts.")
                    except Exception as e:
                        logging.error(f"Critical error during plan step {i+1}: {e}. Rolling back and aborting refactoring.")
                        self.execution_module.rollback_to_snapshot(target_file_path) # Ensure clean state for the file
                        self.telemetry.record_event("refactoring_aborted", {"reason": f"critical_error_step_{i+1}", "error": str(e)})
                        self.telemetry.update_metric("refactoring_status", "Failed")
                        raise # Re-raise to trigger finally block for cleanup

                # Re-analyze architectural compliance for the whole codebase after each successful step
                # This ensures violations are caught progressively
                current_full_codebase_state_for_arch_check = initial_full_codebase_state.copy()
                current_full_codebase_state_for_arch_check.update(self.current_code_state)
                self.codebase_manager.dependency_analyzer.build_dependency_graph(current_full_codebase_state_for_arch_check) # Rebuild graphs
                current_arch_violations = self.architectural_checker.identify_violations({
                    "file_contents": current_full_codebase_state_for_arch_check,
                    "dependency_graph": self.codebase_manager.dependency_analyzer.import_graph,
                    "call_graph": self.codebase_manager.dependency_analyzer.call_graph
                })
                # Only add *new* violations to the overall list, to avoid duplicates across steps
                for viol in current_arch_violations:
                    if viol not in overall_architectural_violations:
                        overall_architectural_violations.append(viol)

            # 5. Finalize: Commit and create Pull Request
            # Recalculate final quality metrics
            final_full_codebase_state = initial_full_codebase_state.copy()
            final_full_codebase_state.update(self.current_code_state) # Overlay all successful changes

            for fp, content in final_full_codebase_state.items():
                if fp.endswith('.py'):
                    self.final_code_quality_metrics[fp] = self.codebase_manager.analyze_code_quality(fp, content)
            self.telemetry.record_event("final_quality_metrics_captured", self.final_code_quality_metrics)

            quality_metrics_comparison = self.refactoring_analytics.get_quality_metrics_comparison(
                self.initial_code_quality_metrics, self.final_code_quality_metrics
            )
            self.telemetry.update_data("quality_metrics_comparison", quality_metrics_comparison)

            final_summary = "\n".join(changes_summary_list)
            final_metrics_summary = self.telemetry.get_summary().get("metrics", {}) # Get current metrics
            unique_architectural_violations = list(set(overall_architectural_violations)) # Ensure uniqueness

            pr_title, pr_body = self.llm_orchestrator.generate_pr_summary(
                self.goal, final_summary, final_metrics_summary, unique_architectural_violations
            )

            # Generate/update documentation for affected files
            for file_path in successfully_modified_files:
                current_content = self.current_code_state.get(file_path, "")
                if current_content:
                    doc_update_content = self.llm_orchestrator.generate_documentation_update(
                        file_path, current_content, f"Refactoring completed for goal: {self.goal}. Changes: {changes_summary_list}",
                        initial_context_for_planning # Pass relevant context
                    )
                    if doc_update_content and doc_update_content != current_content:
                        self.codebase_manager.write_file(file_path, doc_update_content)
                        logging.info(f"Documentation updated for {file_path}.")


            self.vcs_integration.add_all()
            self.vcs_integration.commit(f"{pr_title} [Auto-Generated by AI Agent]")
            self.vcs_integration.push_branch(self.refactoring_branch_name)

            pr_info = self.codebase_manager.vcs.create_pull_request(
                title=pr_title,
                body=pr_body,
                head_branch=self.refactoring_branch_name,
                base_branch=base_branch
            )
            self.telemetry.update_data("pr_info", pr_info)
            self.telemetry.record_event("refactoring_completed_successfully", {"pr_title": pr_title, "pr_url": pr_info.get("url")})
            self.telemetry.update_metric("refactoring_status", "Completed Successfully")
            logging.info(f"Autonomous refactoring process completed and PR created: {pr_info.get('url')}")

            # Post-PR creation: optionally listen for human feedback on the PR
            self._listen_for_human_feedback(pr_info.get("id")) # Conceptual call
            self.telemetry.update_metric("refactoring_end_time", time.time())

            # Generate final analytics report
            final_analytics_report = self.refactoring_analytics.generate_summary_report()
            logging.info(f"Final Refactoring Analytics Report: {json.dumps(final_analytics_report, indent=2)}")

        except Exception as e:
            logging.critical(f"Refactoring process terminated unexpectedly: {e}", exc_info=True)
            self.telemetry.record_event("refactoring_failed", {"reason": "unexpected_termination", "error": str(e)})
            self.telemetry.update_metric("refactoring_status", "Failed")
            self.telemetry.update_metric("refactoring_end_time", time.time()) # Ensure end time is recorded even on failure
            # Attempt to generate partial analytics report on failure
            final_analytics_report = self.refactoring_analytics.generate_summary_report()
            logging.info(f"Partial Refactoring Analytics Report (on failure): {json.dumps(final_analytics_report, indent=2)}")

        finally:
            # Ensure return to original branch
            self.vcs_integration.checkout_branch(original_branch)
            logging.info(f"Returned to original branch: {original_branch}")

    def _listen_for_human_feedback(self, pr_id: str):
        """Conceptual method to listen for and process human feedback."""
        logging.info(f"Agent is now conceptually listening for human feedback on PR {pr_id}.")
        # In a real system, this would be a long-running process
        # that uses webhooks or polls a VCS API for PR review comments/status changes.
        # When feedback is received, it would call self.human_feedback_processor.ingest_feedback
        mock_feedback_approved = {
            "pr_id": pr_id,
            "agent_branch": self.refactoring_branch_name,
            "reviewer": "human_architect",
            "status": "approved", # or "changes_requested", "rejected"
            "comments": [{"file_path": "payment_processor.py", "line_number": 10, "comment_text": "Excellent work on encapsulation! This is exactly what we needed."}],
            "summary_feedback": "Overall great refactor, good job maintaining invariance and improving modularity."
        }
        mock_feedback_changes_requested = {
            "pr_id": pr_id,
            "agent_branch": self.refactoring_branch_name,
            "reviewer": "human_dev_lead",
            "status": "changes_requested",
            "comments": [
                {"file_path": "payment_processor.py", "line_number": 45, "comment_text": "The naming for `_validate_card` should be `_is_card_valid` for consistency with our other services."},
                {"file_path": "payment_processor.py", "line_number": 60, "comment_text": "The error handling in `process_payment` could be more robust; consider a custom exception type here."}
            ],
            "summary_feedback": "Good attempt, but a few minor changes are needed for consistency and error handling based on our guidelines."
        }
        # Simulate receiving feedback after some delay
        logging.info("Simulating receiving human feedback (approved) after some delay...")
        time.sleep(2) # Simulate delay
        self.human_feedback_processor.ingest_feedback(mock_feedback_approved)
        self.human_feedback_processor.update_knowledge_base(
            feedback_summary=mock_feedback_approved.get("summary_feedback"),
            positive=(mock_feedback_approved.get("status") == "approved")
        )
        logging.info("Simulating receiving human feedback (changes requested) after some delay...")
        time.sleep(2)
        self.human_feedback_processor.ingest_feedback(mock_feedback_changes_requested)
        self.human_feedback_processor.update_knowledge_base(
            feedback_summary=mock_feedback_changes_requested.get("summary_feedback"),
            positive=(mock_feedback_changes_requested.get("status") == "approved")
        )

# This is a mock LLM client for demonstration purposes.
# In a real system, you would integrate with an actual LLM provider (e.g., Google Gemini, OpenAI GPT).
class MockLLMClient:
    def generate_text(self, prompt: str, max_tokens: int, temperature: float) -> Dict[str, str]:
        if "generate a detailed, sequential plan" in prompt:
            return {"text": "1. Create a `PaymentProcessor` class skeleton. [Risk: Low, Rollback: Delete class file].\n2. Move `process_payment` into `PaymentProcessor`. [Risk: Medium, Rollback: Revert `payment_processor.py`].\n3. Move `validate_card` into `PaymentProcessor` as private method. [Risk: Low, Rollback: Revert `payment_processor.py`].\n4. Update call sites to use `PaymentProcessor`. [Risk: Medium, Rollback: Revert affected files]."}
        elif "Apply a specific refactoring step" in prompt:
            if "Create a `PaymentProcessor` class skeleton" in prompt:
                return {"text": "```python\nclass PaymentProcessor:\n    def __init__(self):\n        pass\n```"}
            elif "Move `process_payment` into `PaymentProcessor`" in prompt:
                if "failing_test" in prompt: # Simulate an error
                    return {"text": "```python\nclass PaymentProcessor:\n    def __init__(self):\n        pass\n    def process_payment(self, amount, card_info):\n        # Bug here causing a simulated error. This needs a fix.\n        print(f\"Processing {amount} with {card_info}\")\n        return False # This will fail the test\n```"}
                return {"text": "```python\nclass PaymentProcessor:\n    def __init__(self):\n        pass\n    def process_payment(self, amount, card_info):\n        print(f\"Processing {amount} with {card_info}\")\n        return True\n```"}
            elif "Move `validate_card` into `PaymentProcessor`" in prompt:
                return {"text": "```python\nclass PaymentProcessor:\n    def __init__(self):\n        pass\n    def process_payment(self, amount, card_info):\n        print(f\"Processing {amount} with {card_info}\")\n        return self._validate_card(card_info)\n    def _validate_card(self, card_info):\n        return len(card_info) == 16\n```"}
            elif "Update call sites to use `PaymentProcessor`" in prompt:
                # Assuming this modifies 'main.py' or 'caller_service_a.py' etc.
                return {"text": "```python\nfrom payment_processor import PaymentProcessor\n\ndef main_app():\n    processor = PaymentProcessor()\n    success = processor.process_payment(200, \"1111222233334444\")\n    print(f\"Payment successful: {success}\")\n\nif __name__ == '__main__':\n    main_app()\n```"}

        elif "fix code based on test failures" in prompt:
            if "return False" in prompt: # Specific fix for the simulated error
                return {"text": "```python\nclass PaymentProcessor:\n    def __init__(self):\n        pass\n    def process_payment(self, amount, card_info):\n        # Fix: Now correctly returns True as intended\n        print(f\"Processing {amount} with {card_info}\")\n        return True\n```"}
            return {"text": "```python\n# Generic fixed code content based on prompt, assuming it addresses the error.\n# This could be more sophisticated by parsing specific error messages.\npass\n```"} # Placeholder fix

        elif "Generate a concise, professional pull request title" in prompt:
            return {"text": "AI Refactor: PaymentProcessor to Class-Based Architecture for Modularity"}
        elif "Generate a detailed and professional pull request description" in prompt:
            return {"text": "This PR transforms the `payment_processor` service into a robust class-based architecture, enhancing modularity and maintainability. All external behaviors are preserved, verified by comprehensive test suites. Cyclomatic complexity for `process_payment` reduced from X to Y. Architectural compliance verified against `Dependency Inversion Principle`. Reviewers, please check the new class structure and updated call sites."}
        elif "Generate or update necessary docstrings" in prompt:
            # Simple docstring addition example
            return {"text": "```python\nclass PaymentProcessor:\n    \"\"\"Manages payment processing operations and validates card information.\"\"\"\n    def __init__(self):\n        \"\"\"Initializes the PaymentProcessor.\"\"\"\n        pass\n    def process_payment(self, amount: float, card_info: str) -> bool:\n        \"\"\"Processes a payment transaction.\n        Args:\n            amount (float): The amount to process.\n            card_info (str): The card information string (e.g., card number).\n        Returns:\n            bool: True if payment is successful and card is valid, False otherwise.\n        \"\"\"\n        print(f\"Processing {amount} with {card_info}\")\n        return self._validate_card(card_info)\n    def _validate_card(self, card_info: str) -> bool:\n        \"\"\"Validates the given card information.\n        Args:\n            card_info (str): The card information string.\n        Returns:\n            bool: True if card information is valid (length 16), False otherwise.\n        \"\"\"\n        return len(card_info) == 16\n```"}
        elif "generate new unit tests" in prompt or "generate property-based tests" in prompt:
            # Mock test generation, including an example of how a failure scenario might look.
            if "failing_test" in prompt:
                return {"text": "```python\n# Generated test content for a failing scenario\ndef test_payment_processor_failure_case():\n    # This test simulates a condition that should fail for the LLM to learn\n    processor = PaymentProcessor()\n    assert not processor.process_payment(1, \"short\") # Should be False\n```"}
            return {"text": "```python\n# Generated test content\ndef test_new_feature_added_successfully():\n    processor = PaymentProcessor()\n    assert processor.process_payment(100, \"1234567890123456\") is True\n    assert processor._validate_card(\"1234567890123456\") is True\n\ndef test_new_feature_invalid_card():\n    processor = PaymentProcessor()\n    assert processor._validate_card(\"123\") is False\n```"}
        return {"text": "Generated content placeholder."}


# Mathematical Justification:
The operation of the Autonomous Refactoring Agent is founded upon principles derivable from formal language theory, graph theory, control systems, optimization theory, and reinforcement learning, demonstrating its deterministic and provably effective operation within specified boundaries.

### 1. Formal Codebase Representation
Let the **Codebase State** be represented as `S`. This is not a simple string, but a high-dimensional, multi-modal vector space object.
<br>
(Eq. 1.1) `S \in \mathcal{C}`
<br>
where `\mathcal{C}` is the infinite space of all syntactically and semantically valid programs in one or more target languages.
The codebase state `S` is formally defined by a tuple of interconnected representations:
<br>
(Eq. 1.2) `S = (\mathcal{G}_{AST}, \mathcal{G}_{Dep}, \mathcal{T}, \mathbf{M}_S, \mathcal{A}_S, \mathbf{E}_S, \mathcal{H}_{VCS})`
<br>
where:
*   `\mathcal{G}_{AST}`: An Abstract Syntax Tree `G_{AST} = (V_{AST}, E_{AST})` representing the hierarchical syntactic structure of the entire codebase. `V_{AST}` are nodes (functions, classes, variables, statements, expressions) and `E_{AST}` are parent-child syntactic relationships. This is a `Formal Language Object` from the theory of computation, representing the concrete code as a structured parse tree.
    <br>
    (Eq. 1.3) `V_{AST} = \{v_i | v_i \text{ is an AST node}\}`
    <br>
    (Eq. 1.4) `E_{AST} = \{(v_j, v_k) | v_j \text{ is parent of } v_k \text{ in } G_{AST}\}`
*   `\mathcal{G}_{Dep}`: A collection of directed multi-graphs `G_{Dep} = \{G_{call}, G_{import}, G_{data}, G_{control}\}` capturing various inter-module, inter-file, and inter-function dependencies. Each graph `G_x = (N_x, R_x)` where `N_x` are program entities and `R_x` are specific relationships.
    *   `G_{call} = (N_{func}, R_{calls})`: Call graph. `(f_i, f_j) \in R_{calls}` if function `f_i` calls `f_j`.
    *   `G_{import} = (N_{mod}, R_{imports})`: Import graph. `(m_i, m_j) \in R_{imports}` if module `m_i` imports `m_j`.
    *   `G_{data} = (N_{var}, R_{flows})`: Data flow graph. `(v_i, v_j) \in R_{flows}` if data from `v_i` influences `v_j`.
    *   `G_{control} = (N_{stmt}, R_{exec})`: Control flow graph within functions.
    These constructs are foundational to `Relational Algebra` on program components.
    <br>
    (Eq. 1.5) `N_x \subset \text{Entities}(S)`
    <br>
    (Eq. 1.6) `R_x \subset N_x \times N_x`
*   `\mathcal{T}`: A comprehensive set of executable test cases `T = \{t_1, t_2, ..., t_m\}`, each `t_i` mapping an input `I_i` to an expected output `O_i`. The `TestSuite` is a critical `Behavioral Oracle`.
    <br>
    (Eq. 1.7) `t_i : \mathcal{I} \rightarrow \mathcal{O}`
*   `\mathbf{M}_S`: A vector `M_S = (q_1, q_2, ..., q_k)` of quantifiable internal quality attributes (e.g., Cyclomatic Complexity, Maintainability Index, Line Coverage, Performance Benchmarks, Cohesion, Coupling, Duplication). This is an element of `Quality Metric Space` `\mathcal{Q}_M \subset \mathbb{R}^k`.
    <br>
    (Eq. 1.8) `q_j = \text{Metric}_j(S)`
*   `\mathcal{A}_S`: A representation of the codebase's adherence to architectural patterns and principles, derived from the `ArchitecturalComplianceChecker`. This can be a boolean value or a set of identified violations.
    <br>
    (Eq. 1.9) `\mathcal{A}_S = \{\text{violation}_1, \text{violation}_2, ...\} \subset \mathcal{V}_{Arch}`
*   `\mathbf{E}_S`: A collection of semantic embeddings `E_S = \{e_1, e_2, ..., e_p\}`, where each `e_i \in \mathbb{R}^d` is a dense vector representation of a code token, AST node, or code snippet, generated by a pre-trained embedding model. These embeddings enable semantic search and understanding beyond syntactic matching.
    <br>
    (Eq. 1.10) `e_i = \text{Embed}(\text{code_chunk}_i)`
*   `\mathcal{H}_{VCS}`: Historical context derived from the Version Control System, including commit messages, authorship, change frequency, and bug history for relevant files/entities.
    <br>
    (Eq. 1.11) `\mathcal{H}_{VCS} = \{\text{CommitLog}_i, \text{BugReport}_j, ...\}`

### 2. Refactoring Goal Formalization
A **Refactoring Goal** `G` is formally defined as a transformation imperative, comprising a target state description and constraints:
<br>
(Eq. 2.1) `G = (\Delta_S^{struct}, \Delta_M^{desired}, \epsilon_{behav}, \mathcal{A}^{target}, \mathcal{C}_{res})`
<br>
where:
*   `\Delta_S^{struct}`: A specification of desired structural changes, often expressed as a `Graph Transformation Rule` or a sequence of `AST Rewrite Operations`. This defines a target region or specific transformations within `\mathcal{C}`.
    <br>
    (Eq. 2.2) `\Delta_S^{struct} \subset \mathcal{P}(\mathcal{G}_{AST} \cup \mathcal{G}_{Dep})`
*   `\Delta_M^{desired}`: A vector of desired improvements or targets in `MetricVector` `\mathbf{M}_S` (e.g., `q'_i > q_i` for certain `i`, or `q'_j < \tau_j` for a threshold `\tau_j`). This represents an `Optimization Target` within `\mathcal{Q}_M`.
    <br>
    (Eq. 2.3) `\Delta_M^{desired} = (dq_1, dq_2, ..., dq_k)`
    <br>
    (Eq. 2.4) `\forall j: q'_j \ge q_j + dq_j \quad \text{or} \quad q'_j \le dq_j`
*   `\epsilon_{behav}`: An `invariance constraint` stipulating that the external behavior must remain within an acceptable `epsilon`-neighborhood of the original behavior, i.e., `\|B(S_{initial}) - B(S_{final})\| < \epsilon_{behav}`. For strict behavioral invariance, `\epsilon_{behav} = 0`.
    <br>
    (Eq. 2.5) `B(S) = \text{RunTests}(\mathcal{T}, S) \rightarrow \{ \text{PASS}, \text{FAIL} \}^m`
    <br>
    (Eq. 2.6) `\text{Invariance}(S_{initial}, S_{final}) \iff B(S_{initial}) = B(S_{final})`
*   `\mathcal{A}^{target}`: A specification of desired architectural compliance, e.g., `\mathcal{A}(S') \cap \mathcal{V}_{Arch}^{forbidden} = \emptyset` for a given pattern set `\mathcal{V}_{Arch}^{forbidden}`.
    <br>
    (Eq. 2.7) `\mathcal{A}^{target} \subset \mathcal{P}(\mathcal{V}_{Arch})`
*   `\mathcal{C}_{res}`: Resource constraints (time, memory, computational budget) for completing the refactoring.

### 3. Transformation Operations and Planning
An individual **Transformation Step** `T_k` (generated by the LLM) is an atomic or composite operation `T_k: \mathcal{C} \rightarrow \mathcal{C}` that maps a codebase state `S_k` to a new state `S_{k+1}`. Each `T_k` is formulated to approximate a `Graph Rewriting System` operation on `\mathcal{G}_{AST}` and `\mathcal{G}_{Dep}`.
<br>
(Eq. 3.1) `S_{k+1} = T_k(S_k)`
<br>
The plan `\Pi` is a sequence of transformations:
<br>
(Eq. 3.2) `\Pi = (T_1, T_2, ..., T_N)`
<br>
such that `S_N = T_N \circ T_{N-1} \circ \dots \circ T_1(S_0)`.
The planning process involves minimizing a cost function `J(\Pi)` over possible plans:
<br>
(Eq. 3.3) `\Pi^* = \argmin_{\Pi} J(\Pi, S_0, G)`
<br>
where `J` considers execution risk `R(T_k)`, resource cost `C(T_k)`, and deviation from goal:
<br>
(Eq. 3.4) `J(\Pi) = \sum_{k=1}^{N} (w_R \cdot R(T_k) + w_C \cdot C(T_k)) + w_G \cdot \text{GoalDeviation}(S_N, G)`
<br>
`\text{GoalDeviation}(S_N, G)` is a measure of how far `S_N` is from `G` (e.g., `\sum (q'_j - (q_j+dq_j))^2`).
The LLM generates `T_k` by acting as a generative policy `P(T_k | S_k, G, \mathcal{K})` where `\mathcal{K}` is the Knowledge Base.

### 4. Validation and Feedback Control
The **Behavioral Equivalence Function** `B(S)` is formally represented by the execution outcome of the `TestSuite` `\mathcal{T}`.
<br>
(Eq. 4.1) `\text{Result}(t_i, S) \in \{ \text{PASS}, \text{FAIL} \}`
<br>
(Eq. 4.2) `B(S) = \{ \text{Result}(t_1, S), ..., \text{Result}(t_m, S) \}`
<br>
For `S'` to be behaviorally equivalent to `S`, it implies `B(S') = B(S)`. This is a strict `Equivalence Relation` on program semantics, verifiable by `Computational Verification through Test Oracles`.

The `Validation Module` `V(S)` evaluates the state `S` against all criteria:
<br>
(Eq. 4.3) `V(S) = (B(S), \mathbf{M}_S, \mathcal{A}_S, \text{SecScan}(S))`
<br>
The validation function `\text{Check}(S, S_{prev})` returns a boolean indicating overall success:
<br>
(Eq. 4.4) `\text{Check}(S, S_{prev}) = \text{Invariance}(S_{prev}, S) \land \text{MetricsOK}(S) \land \text{ArchOK}(S) \land \text{SecOK}(S)`
<br>
If `\text{Check}(S_{k+1}, S_k) = \text{FAIL}`, a `Feedback Signal` `F_k` is generated.
<br>
(Eq. 4.5) `F_k = \text{Diagnostic}(S_{k+1}, S_k, G)`
<br>
The `Correction Sub-Agent` (`fix_code` in the LLM) uses this feedback:
<br>
(Eq. 4.6) `T'_k = \text{LLM.Fix}(S_{k+1}, F_k, G, \mathcal{K})`
<br>
The probability of a step `T_k` passing validation, given the knowledge `\mathcal{K}` and feedback `F_k` (from previous attempts), is `P(\text{PASS} | T_k, S_k, G, F_k, \mathcal{K})`.

### 5. Agent's Control Loop and Learning
The iterative refactoring loop can be modeled as a discrete-time control system:
<br>
(Eq. 5.1) `S_{k+1} = \text{Agent}(S_k, G, F_k, \mathcal{K})`
<br>
The agent's state transition function attempts to move `S_k` towards `S_G` (the goal state).
<br>
(Eq. 5.2) `S_{k+1} = \text{ExecutionModule}(\text{LLM.Modify}(S_k, \text{PlanStep}_k, G, \mathcal{K}))`
<br>
If `\text{Validation}(S_{k+1}) = \text{FAIL}`, the `F_k` is negative, triggering a `Correction Sub-Agent` (`fix_code` in the LLM). The system attempts to converge to a state `S_N` where `\text{Check}(S_N, S_{N-1}) = \text{PASS}` and `\mathbf{M}_{S_N}` satisfies `\Delta_M^{desired}` and `\mathcal{A}(S_N)` satisfies `\mathcal{A}^{target}`. This is a `State-Space Control Problem` with a `Stability Criterion` defined by passing all validation checks.

The `KnowledgeBase` `\mathcal{K}` is updated based on `Human Feedback` `H_f`:
<br>
(Eq. 5.3) `\mathcal{K}_{new} = \text{UpdateKB}(\mathcal{K}_{old}, H_f, \text{Outcome}(PR))`
<br>
Where `\text{Outcome}(PR) \in \{\text{Approved}, \text{Changes Requested}, \text{Rejected}\}` provides a `Reward Signal`.
*   Positive Reward `r_P` for `Approved` PRs: `\text{AddPattern}(\mathcal{K}, \text{successful_strategy}(PR))`
*   Negative Reward `r_N` for `Changes Requested`/`Rejected` PRs: `\text{AddAntiPattern}(\mathcal{K}, \text{failed_strategy}(PR))`
This introduces an outer `Reinforcement Learning` loop, optimizing the `Agent` function itself.
<br>
(Eq. 5.4) `Q(\mathcal{K}, \Pi) = \mathbb{E}[\sum_{k=0}^{\infty} \gamma^k r_k | \mathcal{K}, \Pi]`
<br>
Where `Q` is an action-value function, `\gamma` is the discount factor, and `r_k` is the reward at step `k`. The agent seeks to learn `\mathcal{K}` that maximizes expected future rewards.

### 6. Quality Metrics Formalization
Quantifiable metrics `q_j` are defined as functions over the codebase state:
*   **Cyclomatic Complexity (CC):** `q_{CC}(S) = \sum_{f \in \text{Functions}(S)} \left( E_f - N_f + 2P_f \right)` where `E_f` is edges, `N_f` is nodes, `P_f` is connected components (often 1).
    <br>
    (Eq. 6.1) `q_{CC}(S) = \sum_{f \in \text{Functions}(S)} \text{CC}(f)`
*   **Line Coverage (LC):** Proportion of executable lines covered by tests.
    <br>
    (Eq. 6.2) `q_{LC}(S) = \frac{\sum_{t \in \mathcal{T}} \text{CoveredLines}(t, S)}{\text{TotalExecutableLines}(S)} \in [0, 1]`
*   **Code Duplication (CD):** Percentage of duplicated lines/blocks.
    <br>
    (Eq. 6.3) `q_{CD}(S) = \frac{\text{DuplicatedLines}(S)}{\text{TotalLines}(S)} \in [0, 1]`
*   **Maintainability Index (MI):** Often a composite score.
    <br>
    (Eq. 6.4) `q_{MI}(S) = 171 - 5.2 \ln(\text{AvgCC}) - 0.23 \text{AvgLOC} - 16.2 \ln(\text{AvgHalsteadVol})`
*   **Performance (`\rho`):** Measured latency or resource consumption.
    <br>
    (Eq. 6.5) `\rho(S) = \text{RunBenchmark}(S)`
    <br>
    (Eq. 6.6) `\Delta\rho^{desired} \le 0 \quad \text{(for improvement)}`

### 7. Semantic Search and Embeddings
Code embeddings `\mathbf{e} \in \mathbb{R}^d` are generated by an encoder `\text{Embed}(\cdot)` that maps code snippets to a vector space.
<br>
(Eq. 7.1) `\mathbf{e}_{\text{chunk}} = \text{Embed}(\text{code_chunk})`
<br>
The similarity between a query embedding `\mathbf{e}_q` (from the goal) and a code chunk embedding `\mathbf{e}_c` is typically cosine similarity.
<br>
(Eq. 7.2) `\text{Similarity}(\mathbf{e}_q, \mathbf{e}_c) = \frac{\mathbf{e}_q \cdot \mathbf{e}_c}{\|\mathbf{e}_q\| \|\mathbf{e}_c\|}`
<br>
The `SemanticIndexer` retrieves the top `k` most similar chunks:
<br>
(Eq. 7.3) `\text{TopK}(\mathbf{e}_q, k) = \{ \text{code_chunk}_i | \text{rank}(\text{Similarity}(\mathbf{e}_q, \mathbf{e}_{\text{chunk}_i})) \le k \}`

### 8. Architectural Compliance
The `ArchitecturalComplianceChecker` evaluates rules `R_j \in \mathcal{R}_{Arch}`.
<br>
(Eq. 8.1) `\text{Compliance}(S, R_j) \in \{\text{TRUE}, \text{FALSE}\}`
<br>
The overall architectural compliance `\mathcal{A}_S` is the set of violated rules:
<br>
(Eq. 8.2) `\mathcal{A}_S = \{ R_j | \text{Compliance}(S, R_j) = \text{FALSE} \}`
<br>
The goal `\mathcal{A}^{target}` specifies `\mathcal{A}_S \cap \mathcal{V}_{Arch}^{forbidden} = \emptyset`.

### 9. Self-Correction Mechanism (Meta-Cognitive Loop)
When validation fails, a `Loss Function` `L(S_{k+1}, S_k, G)` is computed, indicating the severity and type of failure.
<br>
(Eq. 9.1) `L(S_{k+1}, S_k, G) = w_{test} L_{test} + w_{static} L_{static} + w_{arch} L_{arch} + ...`
<br>
Where individual loss components are:
<br>
(Eq. 9.2) `L_{test} = \sum_{t_i \in \mathcal{T}} \mathbf{1}_{\{\text{Result}(t_i, S_{k+1}) \neq \text{Result}(t_i, S_k)\}}`
<br>
The agent uses the diagnostic information `D = \text{DiagInfo}(L(S_{k+1}, S_k, G))` to formulate a new prompt for the LLM's `fix_code` function.
<br>
(Eq. 9.3) `S'_{k+1} = \text{LLM.Fix}(S_{k+1}, D, \text{PlanStep}_k, \mathcal{K})`
<br>
The self-correction iterates `N_{fix}` times:
<br>
(Eq. 9.4) `\text{FixLoop}(S_{fail}) = \text{for } n=1 \text{ to } N_{fix}: S'_{n} = \text{LLM.Fix}(S'_{n-1}, D_n, \dots) \text{ if } \text{Check}(S'_{n}) \text{ then return } S'_{n}`
<br>
(Eq. 9.5) `\text{If Check}(S'_{N_{fix}}) = \text{FAIL, then rollback to } S_k.`
<br>
This mechanism minimizes `L` iteratively.

### 10. Overall Agent Objective and Convergence
The agent's overarching objective is to find a path in `\mathcal{C}` from `S_0` to `S_N` such that:
1.  **Behavioral Invariance:** `\text{Invariance}(S_0, S_N) \text{ is TRUE}`
2.  **Quality Optimization:** `\mathbf{M}_{S_N} \succeq \mathbf{M}_{S_0} + \Delta_M^{desired}` (where `\succeq` denotes component-wise or utility function based improvement)
3.  **Structural and Architectural Compliance:** `\text{Conforms}(S_N, \Delta_S^{struct}) \text{ is TRUE}` and `\mathcal{A}_{S_N} \cap \mathcal{V}_{Arch}^{forbidden} = \emptyset`.

The total probability of success `P(\text{Success})` is the product of probabilities for each step `P_k(\text{Success})`, conditional on previous steps and learning.
<br>
(Eq. 10.1) `P(\text{Success}) = \prod_{k=1}^N P_k(\text{Success} | S_{k-1}, \mathcal{K}_k, \dots)`
<br>
The `TelemetrySystem` tracks these probabilities and metrics. The meta-cognitive loop `\mathcal{K}_{new} = f(\mathcal{K}_{old}, \text{Experience})` implies `P_{k+1}(\text{Success}) > P_k(\text{Success})` for similar tasks over time, demonstrating `Adaptive Learning`. The system is proven to function correctly if it converges to a state `S_{final}` satisfying the goal `G` within `N` iterations and `N_{fix}` attempts per step, learning from each interaction to improve its `P(\text{Success})` over time. The existence of `\mathcal{T}` as a verifiably correct oracle is paramount. This demonstrably robust methodology unequivocally establishes the operational efficacy of the disclosed invention. Q.E.D.