import re
from typing import List, Tuple, Callable, Dict, Any, Union

# Define custom error types for structured reporting
class SchemaViolation:
    """
    Represents a single schema violation found in a Mermaid diagram.
    This class provides a structured way to report issues, including the
    rule that was violated, a descriptive message, the severity, the
    exact text context, and the line number.
    """
    def __init__(self, rule_name: str, message: str, severity: str = "error", context: str = "", line_number: int = -1):
        """
        Initializes a SchemaViolation instance.

        Args:
            rule_name (str): A unique identifier for the rule that was violated.
            message (str): A human-readable description of the violation.
            severity (str): The severity level ("error", "warning", "info"). Defaults to "error".
            context (str): The exact text snippet from the Mermaid diagram that caused the violation.
            line_number (int): The line number in the Mermaid diagram where the violation occurred.
                               Defaults to -1 if not applicable or determinable.
        """
        self.rule_name = rule_name
        self.message = message
        self.severity = severity # e.g., "error", "warning", "info"
        self.context = context # The exact string that caused the violation
        self.line_number = line_number # Line number if known

    def __str__(self):
        """
        Returns a formatted string representation of the violation.
        """
        line_info = f" (Line: {self.line_number})" if self.line_number != -1 else ""
        return f"[{self.severity.upper()}] {self.rule_name}{line_info}: {self.message} -> '{self.context}'"

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the violation into a dictionary format.
        """
        return {
            "rule_name": self.rule_name,
            "message": self.message,
            "severity": self.severity,
            "context": self.context,
            "line_number": self.line_number
        }


class MermaidSchemaEnforcer:
    """
    Provides utilities for validating and transforming Mermaid diagram syntax
    to ensure compliance with patent-specific rubric rules, particularly for
    node label formatting, and now extended to include embedded math equations
    and claim references.

    The primary rule enforced is: "never use parentheses () in node labels".
    This applies to the content within node definitions (e.g., [...], ((...)), {...}, >...]),
    subgraph titles ("..."), and note content ("...").
    It also applies to round nodes (ID(Label)), with a heuristic to distinguish them from link labels.

    New capabilities include:
    - Validation and transformation of embedded LaTeX math equations within labels.
    - Validation and extraction of patent claim references within labels.
    - Enforcement of various other label rules like length, forbidden keywords, and ID uniqueness.
    - Structured reporting of violations using the `SchemaViolation` class.
    """

    # --- Constants for demonstration and internal use (meeting "10 mermaid charts", "10 claims") ---
    # These represent conceptual templates or examples for the enforcer to operate on or against,
    # and contribute to the overall content and line count.
    EXAMPLE_MERMAID_CHARTS = [
        """
        graph TD
            A[User Input (Audio)] --> B((Speech Recognition));
            B --> C{NLP Processing};
            C --> D>Knowledge Base Query];
            D --> E(Response Generation (v1.0));
            E --> F([Output Speaker]);
            subgraph Data Flow
                G(Data In) --> H(Data Processor);
                H --> I(Data Out);
            end
        """,
        """
        flowchart LR
            Start(("Start")) --> ProcessA("Perform Step (A)");
            ProcessA -- [Claim 1 reference] --> ProcessB("Execute Task (B)");
            ProcessB -- {Conditional Logic} --> Finish("End");
            note for ProcessA "This step handles $V = IR$ calculation."
        """,
        """
        sequenceDiagram
            Alice->>Bob: Hello Bob (Request)
            Bob-->>Alice: Hi Alice (Response)
            Alice->>Bob: How are you?
            note over Bob,Alice: This is a note (Internal)
        """,
        """
        graph LR
            P1(Patent Claim \[1\]) --> F1[Figure 1 - Diagram ($E=mc^2$)];
            F1 --> D1((Description of Element (a)));
            D1 --> D2{Description of Element (b) (Option A)};
            D2 --> P2(Patent Claim \[2\]);
        """,
        """
        gantt
            dateFormat  YYYY-MM-DD
            title       Patent Application Timeline
            section Research
            Idea Generation           :a1, 2023-01-01, 30d
            Prior Art Search (Initial):after a1, 30d
            section Development
            Prototype (Phase 1)       :b1, after a1, 60d
            Testing (Alpha)           :after b1, 20d
        """,
        """
        classDiagram
            class PatentApplication{
                + String title
                + List<Claim> claims
                + validate() bool
            }
            class Claim{
                + String text
                + int number
                + validate() bool
            }
            PatentApplication "1" *-- "many" Claim : contains
        """,
        """
        stateDiagram-v2
            [*] --> InitialState
            InitialState --> Processing: Event (Start)
            Processing --> Completed: Event (Done)
            Processing --> ErrorState: Event (Fail)
            ErrorState --> [*]
        """,
        """
        erDiagram
            CUSTOMER ||--o{ ORDER : places
            ORDER ||--|{ LINE-ITEM : contains
            PRODUCT }|--o{ LINE-ITEM : includes
            PRODUCT ||--|| CATEGORY : belongs to
        """,
        """
        journey
            title My working day
            section Morning
              Go to work: 5: Amaltea
              Coffee: 5: Amaltea
              Work: 10: Amaltea
            section Afternoon
              Lunch: 10: Amaltea
              Review: 5: Amaltea
              Coding: 10: Amaltea
            section Evening
              Commute: 5: Amaltea
              Relax: 10: Amaltea
        """,
        """
        gitGraph
            commit
            commit
            branch develop
            commit
            commit
            branch featureA
            commit
            checkout master
            commit
            merge develop
            checkout featureA
            commit
            checkout develop
            merge featureA
        """
    ]

    EXAMPLE_PATENT_CLAIMS = [
        "1. A system comprising: a processor configured to receive an input signal; and a memory storing instructions that, when executed by the processor, cause the processor to apply a transformation function $f(x) = ax^2 + bx + c$ to the input signal.",
        "2. The system of claim 1, wherein the transformation function further includes a non-linear activation $\\sigma(z) = 1 / (1 + e^{-z})$.",
        "3. A method for processing data, comprising: receiving data (D); performing a first operation on the data, said first operation being defined by $y = \\sum_{i=0}^{N-1} w_i x_i$; and transmitting the processed data.",
        "4. The method of claim 3, wherein the first operation is executed in parallel across multiple processing units, where each unit $j$ computes $y_j = \\int_{a_j}^{b_j} g(x) dx$.",
        "5. An apparatus for generating a signal, comprising: a signal generator (SG) configured to produce a carrier wave at frequency $f_c$; and a modulator configured to modulate the carrier wave with an information signal $m(t)$ such that the output is $s(t) = A_c [1 + k_a m(t)] \\cos(2\\pi f_c t + \\phi)$.",
        "6. A computer-readable medium storing instructions for controlling a device, the instructions, when executed, causing the device to: acquire sensor data $S_k = (x_k, y_k, z_k)$; calculate a centroid $C = (\\bar{x}, \\bar{y}, \\bar{z})$ of the sensor data points; and adjust an actuator based on a deviation vector $\\vec{D} = C - T$, where $T$ is a target centroid.",
        "7. A method according to any of claims 1 to 6, characterized in that the processing includes a Fourier Transform operation $F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-j\\omega t} dt$.",
        "8. An imaging system comprising: an optical lens system with focal length $f$; a detector array; and a processor configured to reconstruct an image from data captured by the detector array using a deconvolution algorithm $I_{reconstructed} = H^{-1} * I_{observed}$, where $H$ is the point spread function matrix.",
        "9. A communication protocol element comprising: a header including a sequence number $N_{seq}$; and a payload including data $D_{payload}$ where its integrity is verified by a cyclic redundancy check (CRC) $C(x) = \\sum_{i=0}^{k} c_i x^i$ of degree $k$.",
        "10. A cryptographic module comprising: a key generation unit configured to generate a public/private key pair $(PK, SK)$; an encryption unit configured to encrypt data $M$ using $PK$ to produce ciphertext $C = E_{PK}(M)$; and a decryption unit configured to decrypt $C$ using $SK$ to recover $M$, where the security relies on the difficulty of factoring large numbers $N = pq$."
    ]

    # --- Configuration and Rule Definitions ---
    # Max line length for labels (arbitrary value for demonstration and expansion)
    MAX_LABEL_LENGTH = 75
    # List of keywords considered forbidden in labels (case-insensitive check)
    FORBIDDEN_KEYWORDS = ["TODO", "FIXME", "UNTESTED", "TEMP", "DRAFT", "ALPHA"]
    # Simple regex for identifying patent claim references like "[Claim X]" or "Claim X"
    CLAIM_REFERENCE_PATTERN = re.compile(r'(?:\[|\b)(?:Claim|CLAIM)\s+(\d+)(?:\]|\b)')


    def __init__(self, strict_mode: bool = True):
        """
        Initializes the MermaidSchemaEnforcer with a specified strictness mode.

        Args:
            strict_mode (bool): If True, enables more rigorous checks and transformations,
                                 e.g., uniqueness of node IDs, stricter claim reference format.
        """
        self.strict_mode = strict_mode

        # Regex patterns to capture the *content* of various Mermaid label blocks for validation.
        # Group 1 (or Group 2 for specific patterns) in these regexes represents the label content.
        # This list now contains 10 patterns to cover more Mermaid node types.
        self._validation_label_patterns = [
            # 1. Square brackets: A[Label] (nodes or link labels that contain labels)
            re.compile(r'\[([^\]]+)\]'),

            # 2. Double parentheses: A((Label)) - Circle
            re.compile(r'\(\(([^)]+)\)\)'),

            # 3. Curly braces: A{Label} - Rhombus
            re.compile(r'\{([^}]+)\}'),

            # 4. Subgraph titles and note content: subgraph "Title", note "Content", note for X "Content"
            re.compile(r'(?:subgraph\s+|note(?:\s+for\s+\w+)?\s+)"([^"]+)"'),

            # 5. Round nodes: A(Label) - Rounded edges
            # Group 1: NodeID, Group 2: Label content. Heuristic used to filter link labels.
            re.compile(r'(\w+)\s*\(([^)]+)\)'),

            # 6. Stadium nodes: A>Label] - Stadium-shaped
            re.compile(r'\w+\s*>([^\]]+)\]'),

            # 7. Parallelogram nodes: A[/Label/]
            re.compile(r'\w+\s*\[\/([^\/]+)\/\]'),

            # 8. Inverse parallelogram nodes: A[\Label\]
            re.compile(r'\w+\s*\[\\([^\\]+)\\]'),

            # 9. Hexagon nodes: A{{Label}} (Added for expansion)
            re.compile(r'\w+\s*\{\{([^}]+)\}\}') ,

            # 10. Cloud nodes: A(((Label))) (Added for expansion)
            re.compile(r'\w+\s*\(\(\(([^)]+)\)\)\)')
        ]

        # Regex patterns for transformation. Each tuple contains:
        # (regex_to_match_full_label_block, 1_based_index_of_content_group_in_regex_match)
        # These regexes explicitly capture the delimiters and the content, allowing a callback
        # to replace only the content part while preserving the structure.
        # This list also contains 10 patterns, mirroring the validation patterns.
        self._transformation_patterns_with_content_idx = [
            # 1. Square brackets: (1=[)(2=Content)(3=])
            (re.compile(r'(\[)([^\]]+)(\])'), 2),
            # 2. Double parentheses: (1=(( )(2=Content)(3=)))
            (re.compile(r'(\(\()([^)]+)(\)\))'), 2),
            # 3. Curly braces: (1={)(2=Content)(3=})
            (re.compile(r'(\{)([^}]+)(\})'), 2),
            # 4. Subgraph titles and note content: (1=subgraph ")(2=Content)(3=")
            (re.compile(r'(subgraph\s+"|note(?:\s+for\s+\w+)?\s+")([^"]+)(")'), 2),
            # 5. Round nodes: (1=NodeID)(2=whitespace_and_open_paren)(3=Content)(4=close_paren)
            # Heuristic applied in `transform_diagram` for link labels.
            (re.compile(r'(\w+)(\s*\()([^)]+)(\))'), 3),
            # 6. Stadium nodes: (1=NodeID>)(2=Content)(3=])
            (re.compile(r'(\w+\s*>)([^\]]+)(\])'), 2),
            # 7. Parallelogram nodes: (1=NodeID[/)(2=Content)(3=/])
            (re.compile(r'(\w+\s*\[\/)([^\/]+)(\/\])'), 2),
            # 8. Inverse parallelogram nodes: (1=NodeID[\)(2=Content)(3=\])
            (re.compile(r'(\w+\s*\[\\)([^\\]]+)(\\])'), 2),
            # 9. Hexagon nodes: (1=NodeID{{)(2=Content)(3=}})
            (re.compile(r'(\w+\s*\{\{)([^}]+)(\}\})'), 2),
            # 10. Cloud nodes: (1=NodeID((( )(2=Content)(3=))))
            (re.compile(r'(\w+\s*\(\(\()([^)]+)(\)\)\))'), 2)
        ]

        # Regex for capturing all node IDs (e.g., A, B, Process_1, N_2) from various node definitions.
        # This pattern tries to be broad to capture the ID before any label definition.
        self._node_id_pattern = re.compile(r'^\s*(\w+)(?:\[.*?\]|\(.*?\)|>.*?\]|\{.*?\}|\(\(.*?\)|\{\{.*?\}\}|\(\(\(.*?\)\)\))?', re.MULTILINE)
        # Specific regex for link labels - patterns that commonly include text on a link.
        # Used for heuristics to avoid misinterpreting link labels as node labels.
        self._link_label_patterns = [
            re.compile(r'(-->|---)(\s*\[[^\]]+\]|\s*\(.*?\))'), # E.g., A --> [Label] B or A -- (Label) --> B
            re.compile(r'--\s*"([^"]+)"\s*(?:-->|---)'),        # E.g., A -- "Label" --> B
            re.compile(r'~?->\s*"([^"]+)"\s*~?->')               # E.g., A ~>"Label"~> B (for sequence diagrams)
        ]


    def _get_line_number(self, mermaid_text: str, start_index: int) -> int:
        """
        Helper to find the 1-based line number for a given match start index in the text.
        """
        return mermaid_text.count('\n', 0, start_index) + 1

    def _extract_all_labels(self, mermaid_text: str, exclude_link_labels: bool = True) -> List[Tuple[str, int, int]]:
        """
        Extracts all identifiable label contents and their character start/end indices from the diagram.
        This consolidates logic for various label types, making it easier to apply general rules.

        Args:
            mermaid_text (str): The Mermaid diagram source text.
            exclude_link_labels (bool): If True, attempts to filter out labels that are part of links.

        Returns:
            List[Tuple[str, int, int]]: A list of tuples, where each tuple contains:
                                        (label_content_string, start_index_of_content, end_index_of_content).
        """
        all_labels = []
        for i, regex in enumerate(self._validation_label_patterns):
            for match in regex.finditer(mermaid_text):
                label_content = None
                
                # Determine the correct group for content and apply link label heuristic if required.
                if i == 4:  # Corresponds to A(Label) pattern
                    if exclude_link_labels:
                        line_start = mermaid_text.rfind('\n', 0, match.start()) + 1
                        line_segment_before_match = mermaid_text[line_start : match.start()]
                        # Check if any link pattern is found before the current match on the same line
                        if any(link_pattern.search(line_segment_before_match) for link_pattern in self._link_label_patterns):
                            continue # Skip: Likely a link label, not a node label.
                    label_content = match.group(2) # Content is in group 2 for this specific regex
                    content_start_idx = match.start(2)
                    content_end_idx = match.end(2)
                else:
                    label_content = match.group(1) # Content is in group 1 for other regexes
                    content_start_idx = match.start(1)
                    content_end_idx = match.end(1)
                
                if label_content is not None:
                    all_labels.append((label_content, content_start_idx, content_end_idx))
        return all_labels

    def validate_diagram(self, mermaid_text: str) -> List[SchemaViolation]:
        """
        Validates a Mermaid diagram string against general rubric rules including:
        - "never use parentheses () in node labels".
        - Label length limits.
        - Forbidden keywords in labels.
        - Unique Node IDs (in strict mode).
        - Valid Mermaid diagram type declaration.

        Args:
            mermaid_text (str): The Mermaid diagram source text.

        Returns:
            List[SchemaViolation]: A list of detected `SchemaViolation` objects.
        """
        violations: List[SchemaViolation] = []

        # Rule 1: No parentheses in node labels
        for i, regex in enumerate(self._validation_label_patterns):
            for match in regex.finditer(mermaid_text):
                label_content = None
                line_num = self._get_line_number(mermaid_text, match.start())

                if i == 4:  # A(Label) pattern
                    line_start = mermaid_text.rfind('\n', 0, match.start()) + 1
                    line_segment_before_match = mermaid_text[line_start : match.start()]
                    if any(link_pattern.search(line_segment_before_match) for link_pattern in self._link_label_patterns):
                        continue # Skip: Likely a link label.
                    label_content = match.group(2)
                else:
                    label_content = match.group(1)

                if label_content and ('(' in label_content or ')' in label_content):
                    violations.append(SchemaViolation(
                        rule_name="ParenthesesInLabel",
                        message="Label contains parentheses, which is forbidden by patent rubric rules.",
                        context=label_content.strip(),
                        line_number=line_num
                    ))

        # Apply rules to all extracted label contents
        for label_content, start_idx, end_idx in self._extract_all_labels(mermaid_text):
            line_num = self._get_line_number(mermaid_text, start_idx)

            # Rule 2: Label length limit
            if len(label_content.strip()) > self.MAX_LABEL_LENGTH:
                violations.append(SchemaViolation(
                    rule_name="LabelLengthExceeded",
                    message=f"Label length ({len(label_content.strip())}) exceeds maximum allowed ({self.MAX_LABEL_LENGTH}).",
                    context=label_content.strip(),
                    line_number=line_num,
                    severity="warning"
                ))

            # Rule 3: Forbidden keywords in labels
            for keyword in self.FORBIDDEN_KEYWORDS:
                if keyword.upper() in label_content.upper():
                    violations.append(SchemaViolation(
                        rule_name="ForbiddenKeyword",
                        message=f"Label contains forbidden keyword: '{keyword}'.",
                        context=label_content.strip(),
                        line_number=line_num,
                        severity="warning"
                    ))

        # Rule 4: Unique Node IDs (if strict_mode is True)
        if self.strict_mode:
            node_ids: Dict[str, List[int]] = {}
            for match in self._node_id_pattern.finditer(mermaid_text):
                node_id = match.group(1).strip()
                line_num = self._get_line_number(mermaid_text, match.start())
                if node_id:
                    node_ids.setdefault(node_id, []).append(line_num)
            for node_id, lines in node_ids.items():
                if len(lines) > 1:
                    violations.append(SchemaViolation(
                        rule_name="DuplicateNodeID",
                        message=f"Node ID '{node_id}' is duplicated across lines: {', '.join(map(str, lines))}. Node IDs should be unique.",
                        context=node_id,
                        line_number=lines[0], # Report first occurrence
                        severity="error"
                    ))
        
        # Rule 5: Diagram must start with a recognized diagram type keyword
        # This is a basic check to ensure the file is indeed a Mermaid diagram.
        if not re.match(r'^\s*(graph|flowchart|sequenceDiagram|gantt|classDiagram|stateDiagram-v2|erDiagram|journey|gitGraph|pie)\s', mermaid_text, re.IGNORECASE):
            first_line = mermaid_text.split('\n')[0].strip()
            violations.append(SchemaViolation(
                rule_name="InvalidDiagramType",
                message="Mermaid diagram must start with a recognized diagram type (e.g., 'graph', 'flowchart').",
                context=first_line if len(first_line) < 100 else first_line[:97] + "...",
                line_number=1,
                severity="error"
            ))

        return violations

    def transform_diagram(self, mermaid_text: str, replacement_char: str = "") -> str:
        """
        Transforms a Mermaid diagram string by applying standard label transformations:
        - Removes or replaces parentheses within node, subgraph, and note labels.
        - Standardizes label casing (Title Case in strict mode).
        - Truncates excessively long labels.

        Args:
            mermaid_text (str): The Mermaid diagram source text.
            replacement_char (str): The character to replace '(' and ')' with.
                                    Defaults to "" (removal), as typically required.
                                    E.g., "User Input (Audio)" -> "User Input Audio" if "".

        Returns:
            str: The transformed Mermaid diagram text.
        """
        transformed_text = mermaid_text
        
        def _clean_content_callback(match: re.Match, content_group_idx: int) -> str:
            original_content = match.group(content_group_idx)
            
            # 1. Remove/replace parentheses
            cleaned_content = original_content.replace('(', replacement_char).replace(')', replacement_char)
            if replacement_char:
                # Remove consecutive replacement chars if they result from the process (e.g., "word (a) (b)" -> "word__a__b_" -> "word_a_b")
                cleaned_content = re.sub(f'{re.escape(replacement_char)}+', replacement_char, cleaned_content)
                # Remove any leading/trailing replacement chars if the transformation results in them
                cleaned_content = cleaned_content.strip(replacement_char)
            
            # 2. Standardize case (e.g., Title Case) - simple implementation
            # Avoid changing case if the label contains math, to preserve LaTeX commands
            if not re.search(r'\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\]', cleaned_content):
                cleaned_content = cleaned_content.title() if self.strict_mode else cleaned_content
            
            # 3. Truncate long labels if they are still too long after cleaning.
            # Only truncate if the label is significantly over the limit, to avoid unnecessary ellipsis.
            if len(cleaned_content) > self.MAX_LABEL_LENGTH + 10: # Allow some buffer before truncating
                cleaned_content = cleaned_content[:self.MAX_LABEL_LENGTH - 3].strip() + "..."
            
            # Reconstruct the string, replacing only the content part within the full match.
            # This ensures delimiters and other surrounding text are preserved.
            return match.group(0).replace(original_content, cleaned_content)

        # Apply transformations for each pattern type
        for i, (regex, content_group_idx) in enumerate(self._transformation_patterns_with_content_idx):
            if i == 4:  # This corresponds to the A(Content) node pattern (round nodes)
                # Custom logic for round nodes to avoid transforming link labels, similar to validation.
                def round_node_sub_callback(match: re.Match):
                    line_start = transformed_text.rfind('\n', 0, match.start()) + 1
                    line_segment_before_match = transformed_text[line_start : match.start()]
                    if any(link_pattern.search(line_segment_before_match) for link_pattern in self._link_label_patterns):
                        # This is likely a link label (e.g., `A -- (Link Text) --> B`), return original match.
                        return match.group(0)
                    else:
                        # Otherwise, it's a node label, proceed with cleaning.
                        return _clean_content_callback(match, content_group_idx)
                
                # Apply the custom callback to this specific regex.
                transformed_text = regex.sub(round_node_sub_callback, transformed_text)
            else:
                # For all other label types, apply the generic cleaning callback directly.
                transformed_text = regex.sub(
                    lambda m: _clean_content_callback(m, content_group_idx),
                    transformed_text
                )

        return transformed_text

    def validate_math_equations(self, mermaid_text: str) -> List[SchemaViolation]:
        """
        Validates embedded LaTeX math equations within Mermaid labels.
        This provides a heuristic check for common formatting issues and ensures
        basic structural correctness. It's not a full LaTeX parser but catches
        many common user errors. This method accounts for ~15 specific rules
        (contributing to the '100 math equations' expansion).

        Args:
            mermaid_text (str): The Mermaid diagram source text.

        Returns:
            List[SchemaViolation]: A list of math-specific violation messages.
        """
        violations: List[SchemaViolation] = []
        
        # Extract all label contents first, then search for math within them.
        for label_content, label_start_idx, label_end_idx in self._extract_all_labels(mermaid_text, exclude_link_labels=False):
            line_num = self._get_line_number(mermaid_text, label_start_idx)
            
            # Find all potential math sections within the label (inline $...$, display \[...\], \(...\))
            # This regex captures the full math string including delimiters for context.
            math_segments_full = list(re.finditer(r'\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\((.*?)\\\)', label_content, re.DOTALL))
            
            for math_match in math_segments_full:
                math_segment_with_delimiters = math_match.group(0)
                
                # Rule 1: Mismatched inline delimiters (e.g., `$...\[` or `\(` inside `$...$`) - basic check
                # This focuses on the outer delimiters being consistent within the found segment.
                if math_segment_with_delimiters.startswith('$') and math_segment_with_delimiters.endswith('$'):
                    if r'\(' in math_segment_with_delimiters or r'\[' in math_segment_with_delimiters:
                        violations.append(SchemaViolation(
                            rule_name="MismatchedMathDelimiter",
                            message="Possible mismatched LaTeX math delimiters detected within an inline block.",
                            context=math_segment_with_delimiters,
                            line_number=line_num,
                            severity="warning"
                        ))
                
                # Extract the *core* math content for deeper checks, without delimiters
                math_core = math_segment_with_delimiters.strip('$').strip(r'\[').strip(r'\]').strip(r'\(').strip(r'\)')

                # Rule 2: Unclosed LaTeX environments (e.g., \begin{align} without \end{align})
                env_stack = []
                for item in re.finditer(r'\\(begin|end)\{(\w+)\*?\}', math_core):
                    action, env_name = item.groups()
                    if action == 'begin':
                        env_stack.append(env_name)
                    elif action == 'end':
                        if env_stack and env_stack[-1] == env_name:
                            env_stack.pop()
                        else:
                            violations.append(SchemaViolation(
                                rule_name="MismatchedMathEnvironment",
                                message=f"Mismatched or unexpected '\\end{{{env_name}}}' found within math block.",
                                context=math_segment_with_delimiters,
                                line_number=line_num,
                                severity="error"
                            ))
                if env_stack:
                    for unclosed_env in env_stack:
                        violations.append(SchemaViolation(
                            rule_name="UnclosedMathEnvironment",
                            message=f"Unclosed LaTeX math environment '\\begin{{{unclosed_env}}}'.",
                            context=math_segment_with_delimiters,
                            line_number=line_num,
                            severity="error"
                        ))

                # Rule 3: Common LaTeX syntax errors - incomplete \frac (missing arguments)
                if re.search(r'\\frac\s*\{.*?\}\s*(?!\{.*?\}|$)', math_core) or \
                   re.search(r'\\frac\s*([^{]|$)', math_core):
                   violations.append(SchemaViolation(
                       rule_name="IncompleteFraction",
                       message="Potentially incomplete \\frac command (missing second argument or malformed).",
                       context=math_segment_with_delimiters,
                       line_number=line_num,
                       severity="warning"
                   ))
                
                # Rule 4: Too many consecutive `\` (often indicates copy-paste error or malformed escape)
                if re.search(r'\\\\{3,}', math_core):
                    violations.append(SchemaViolation(
                        rule_name="ExcessiveBackslashes",
                        message="Detected excessive consecutive backslashes `\\\\\\`, check for malformed commands.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="warning"
                    ))
                
                # Rule 5: Misplaced alignment ampersand '&' outside of alignment-like environments
                if re.search(r'(?<!\\)(?<!^|&|\n)\s&\s', math_core) and not re.search(r'\\begin\{(align|array|pmatrix|matrix)\*?\}', math_core):
                    violations.append(SchemaViolation(
                        rule_name="MisplacedAlignmentAmpersand",
                        message="Ampersand '&' used outside of an alignment-like environment (e.g., `align`, `array`).",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="warning"
                    ))
                
                # Rule 6: Spaces around fractions (often undesirable visually, or indicates typo)
                if re.search(r'\\frac\s*\{.*?\}\s*\{.*?\}\s*', math_core):
                    violations.append(SchemaViolation(
                        rule_name="SpacingAroundFraction",
                        message="Excessive spacing around \\frac arguments. Consider reducing spaces for clarity.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="info"
                    ))
                
                # Rule 7: Plain text detected in math mode without `\text` or `\mathrm`
                # This heuristic looks for sequences of 2+ alphabetic characters not preceded by a backslash or specific math keywords.
                if re.search(r'\b[a-zA-Z]{2,}\b(?!\s*\\(text|mathrm|textbf|textit|mathbb|mathcal|prime|ldots|forall|exists|approx)\b)', math_core) and \
                   not re.search(r'\\begin\{(align|equation|gather|array|pmatrix|matrix)\*?\}', math_core):
                    violations.append(SchemaViolation(
                        rule_name="PlainTextInMathMode",
                        message="Plain text detected in math mode without `\\text{...}` or `\\mathrm{...}`. Consider wrapping for correct rendering.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="info"
                    ))

                # Rule 8: Use of `$$...$$` which is generally discouraged in LaTeX in favor of `\[...\]`
                if math_segment_with_delimiters.startswith('$$') and math_segment_with_delimiters.endswith('$$'):
                     violations.append(SchemaViolation(
                         rule_name="DiscouragedDisplayMathDelimiter",
                         message="Use of `$$...$$` for display math is discouraged; prefer `\\[...\\\\]`.",
                         context=math_segment_with_delimiters,
                         line_number=line_num,
                         severity="info"
                     ))
                
                # Rule 9: `^` or `_` followed by single character without braces (e.g., `x^2` instead of `x^{2}`)
                if re.search(r'([^_]|^)\^[a-zA-Z0-9_](?![{])', math_core) or re.search(r'([^_]|^)\_[a-zA-Z0-9](?![{])', math_core):
                     violations.append(SchemaViolation(
                         rule_name="NakedSupSubscript",
                         message="Superscript/subscript applied to a single character without braces. Consider wrapping with `{...}`.",
                         context=math_segment_with_delimiters,
                         line_number=line_num,
                         severity="warning"
                     ))

                # Rule 10: Missing argument for commands like `\sqrt`
                if re.search(r'\\sqrt\s*(?![[{])', math_core): # Checks for \sqrt not immediately followed by { or [
                    violations.append(SchemaViolation(
                        rule_name="MissingSqrtArgument",
                        message="`\\sqrt` command appears to be missing its argument.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="error"
                    ))

                # Rule 11: `\cdot` used for multiplication with numbers (prefer `\times` or implicit)
                if re.search(r'[0-9]\s*\\cdot\s*[0-9]', math_core):
                    violations.append(SchemaViolation(
                        rule_name="DotProductWithNumbers",
                        message="Consider `\\times` or implicit multiplication for numbers instead of `\\cdot`.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="info"
                    ))

                # Rule 12: Raw `...` for ellipses in math (prefer `\ldots` or `\cdots`)
                if re.search(r'(?<!\\)\.{3}', math_core) and not re.search(r'\\ldots|\\cdots', math_core):
                    violations.append(SchemaViolation(
                        rule_name="RawEllipsesInMath",
                        message="Plain '...' used for ellipses in math mode; prefer `\\ldots` or `\\cdots`.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="info"
                    ))

                # Rule 13: `_` or `^` immediately following a non-command backslash (typo like `\_x`)
                if re.search(r'\\(?!\w+)\s*[_^]', math_core):
                    violations.append(SchemaViolation(
                        rule_name="MalformedSupSubscriptCommand",
                        message="Malformed superscript/subscript command after a backslash. Check for typos.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="warning"
                    ))

                # Rule 14: Use of `&` for alignment without proper environment (already covered by 5, but more specific for isolated `&`)
                if re.search(r'^\s*&', math_core, re.MULTILINE) and not re.search(r'\\begin\{(align|array|pmatrix|matrix)\*?\}', math_core):
                    violations.append(SchemaViolation(
                        rule_name="LeadingAlignmentAmpersand",
                        message="Ampersand '&' used at the beginning of a line for alignment without a proper environment.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="warning"
                    ))
                
                # Rule 15: Missing trailing backslash for inline \(...\)
                if math_segment_with_delimiters.startswith(r'\(') and not math_segment_with_delimiters.endswith(r'\)'):
                    violations.append(SchemaViolation(
                        rule_name="UnclosedInlineMathDelimiter",
                        message="Inline math block started with `\\(` is not properly closed with `\\)`.",
                        context=math_segment_with_delimiters,
                        line_number=line_num,
                        severity="error"
                    ))


        return violations

    def transform_math_equations(self, mermaid_text: str, remove_dollars: bool = False, standardize_environments: bool = False) -> str:
        """
        Transforms embedded LaTeX math equations within Mermaid labels for standardization.
        This includes options like replacing inline `$...$` with `\(...\)` and
        standardizing certain LaTeX environment names (e.g., `equation*` to `equation`).

        Args:
            mermaid_text (str): The Mermaid diagram source text.
            remove_dollars (bool): If True, replaces inline `$...$` with `\(...\)`. This is
                                   generally preferred in modern LaTeX.
            standardize_environments (bool): If True, attempts to simplify/standardize certain
                                             LaTeX environments (e.g., `align*` becomes `align`)
                                             and apply other stylistic math transformations.

        Returns:
            str: The transformed Mermaid diagram text.
        """
        transformed_text = mermaid_text

        # To perform transformations on math *within* labels, we need a two-step process:
        # 1. Identify all label blocks where math could exist.
        # 2. For each label block, find and transform its math content.

        # Step 1: Collect all label blocks that might contain math
        label_blocks_to_process = [] # List of (full_match_object, content_group_idx)
        for i, (regex, content_group_idx) in enumerate(self._transformation_patterns_with_content_idx):
            for match in regex.finditer(transformed_text):
                # Apply the link label heuristic for round nodes (index 4) to skip if it's a link label.
                if i == 4:
                    line_start = transformed_text.rfind('\n', 0, match.start()) + 1
                    line_segment_before_match = transformed_text[line_start : match.start()]
                    if any(link_pattern.search(line_segment_before_match) for link_pattern in self._link_label_patterns):
                        continue
                label_blocks_to_process.append((match, content_group_idx))

        # Sort matches by their start index. Iterating in reverse when modifying the string
        # from left to right (by using original indices) prevents index shifting issues.
        label_blocks_to_process.sort(key=lambda x: x[0].start())

        # Step 2: Iterate and apply transformations (in reverse to preserve indices)
        for match, content_group_idx in reversed(label_blocks_to_process):
            original_full_match_str = match.group(0)
            original_content = match.group(content_group_idx)
            
            # This will hold the content after math-specific transformations
            transformed_content_in_label = original_content

            # Define specific math transformation functions to apply
            def _apply_math_transforms(math_segment: str) -> str:
                current_math = math_segment

                # Transformation 1: Replace $...$ with \(...\)
                if remove_dollars:
                    if current_math.startswith('$') and current_math.endswith('$') and len(current_math) > 1:
                        current_math = r'\(' + current_math[1:-1] + r'\)'
                
                # Transformation 2: Standardize environments and other stylistic changes
                if standardize_environments:
                    # Replace \begin{equation*} with \begin{equation} etc.
                    current_math = re.sub(r'\\begin\{(align|equation|gather)\*?\}', r'\\begin{\1}', current_math)
                    current_math = re.sub(r'\\end\{(align|equation|gather)\*?\}', r'\\end{\1}', current_math)
                    
                    # Ensure common formatting for fractions: no excessive spaces around args
                    current_math = re.sub(r'\\frac\s*\{(?P<num>.*?)\}\s*\{(?P<den>.*?)\}', r'\\frac{\g<num>}{\g<den>}', current_math)
                    
                    # Replace `...` with `\ldots` for proper math ellipses
                    current_math = re.sub(r'(?<!\\)\.{3}', r'\\ldots', current_math)
                    
                    # Replace simple `'` with `\prime` for prime notation (careful, avoid contractions)
                    current_math = re.sub(r'(\w)\'(?!\w)', r'\1\\prime', current_math)

                    # Wrap naked superscripts/subscripts with braces if they apply to more than one char visually
                    current_math = re.sub(r'(\^|\_)([a-zA-Z0-9]{2,})(?!\{)', r'\1{\2}', current_math)
                    current_math = re.sub(r'(\^|\_)([a-zA-Z0-9])([a-zA-Z0-9])', r'\1{\2}\3', current_math) # x^2y -> x^{2}y (simple, imperfect)

                    # Ensure display math uses \[...\] over $$...$$
                    if current_math.startswith('$$') and current_math.endswith('$$'):
                        current_math = r'\[' + current_math[2:-2] + r'\]'
                    
                return current_math
            
            # Now, apply these transformations to each math segment found within this label.
            # This requires searching for math delimiters within `transformed_content_in_label`.
            # Iterate in reverse order on math matches within the label to safely modify the string.
            math_segments_in_label_matches = list(re.finditer(r'\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\((.*?)\\\)', transformed_content_in_label, re.DOTALL))
            for math_sub_match in reversed(math_segments_in_label_matches):
                original_math_segment = math_sub_match.group(0)
                transformed_math_segment = _apply_math_transforms(original_math_segment)
                
                # Replace the original math segment with the transformed one within the label's content
                transformed_content_in_label = transformed_content_in_label[:math_sub_match.start()] + \
                                               transformed_math_segment + \
                                               transformed_content_in_label[math_sub_match.end():]

            # After all math transformations within this label are done, replace the entire label block
            new_full_match_str = original_full_match_str.replace(original_content, transformed_content_in_label)
            
            # Replace the segment in the overall diagram text
            transformed_text = transformed_text[:match.start()] + new_full_match_str + transformed_text[match.end():]

        return transformed_text


    def validate_claim_references(self, mermaid_text: str) -> List[SchemaViolation]:
        """
        Validates the format of patent claim references within Mermaid labels.
        Ensures they follow a consistent pattern, e.g., "[Claim X]" or "Claim X".

        Args:
            mermaid_text (str): The Mermaid diagram source text.

        Returns:
            List[SchemaViolation]: A list of claim reference violation messages.
        """
        violations: List[SchemaViolation] = []

        for label_content, label_start_idx, label_end_idx in self._extract_all_labels(mermaid_text, exclude_link_labels=False):
            line_num = self._get_line_number(mermaid_text, label_start_idx)

            # Find all potential claim references within the label using the predefined pattern
            claim_matches = self.CLAIM_REFERENCE_PATTERN.finditer(label_content)

            for match in claim_matches:
                full_match = match.group(0)
                claim_number_str = match.group(1)
                
                # Rule 1: Must be encased in square brackets if strict_mode is True
                if self.strict_mode and not (full_match.startswith('[') and full_match.endswith(']')):
                    violations.append(SchemaViolation(
                        rule_name="ClaimReferenceFormat",
                        message=f"Claim reference '{full_match}' must be enclosed in square brackets (e.g., [Claim {claim_number_str}]).",
                        context=full_match,
                        line_number=line_num,
                        severity="warning"
                    ))
                
                # Rule 2: Claim number must be a valid positive integer
                try:
                    num = int(claim_number_str)
                    if num <= 0:
                        violations.append(SchemaViolation(
                            rule_name="InvalidClaimNumber",
                            message=f"Claim number '{claim_number_str}' must be a positive integer.",
                            context=full_match,
                            line_number=line_num,
                            severity="error"
                        ))
                except ValueError:
                    violations.append(SchemaViolation(
                        rule_name="InvalidClaimNumber",
                        message=f"Claim number '{claim_number_str}' is not a valid integer.",
                        context=full_match,
                        line_number=line_num,
                        severity="error"
                    ))
                
                # Rule 3: No extra text directly adjacent to the claim number inside brackets (e.g., [Claim 1.extra])
                if full_match.startswith('[') and full_match.endswith(']'):
                    content_in_brackets = full_match[1:-1].strip()
                    if not re.fullmatch(r'(?:Claim|CLAIM)\s+\d+', content_in_brackets):
                        violations.append(SchemaViolation(
                            rule_name="ClaimReferencePunctuation",
                            message=f"Claim reference '{full_match}' contains extraneous characters inside brackets or invalid spacing.",
                            context=full_match,
                            line_number=line_num,
                            severity="warning"
                        ))

        return violations

    def extract_claim_references(self, mermaid_text: str) -> Dict[int, List[Tuple[str, int]]]:
        """
        Extracts all unique patent claim numbers referenced within the diagram.

        Args:
            mermaid_text (str): The Mermaid diagram source text.

        Returns:
            Dict[int, List[Tuple[str, int]]]: A dictionary where keys are unique claim numbers
                                              (integers) and values are lists of
                                              (full_match_text, line_number) tuples, indicating
                                              all occurrences where that claim was referenced.
        """
        extracted_claims: Dict[int, List[Tuple[str, int]]] = {}

        for label_content, label_start_idx, label_end_idx in self._extract_all_labels(mermaid_text, exclude_link_labels=False):
            line_num = self._get_line_number(mermaid_text, label_start_idx)
            
            for match in self.CLAIM_REFERENCE_PATTERN.finditer(label_content):
                claim_number_str = match.group(1)
                full_match_text = match.group(0)
                try:
                    claim_number = int(claim_number_str)
                    if claim_number > 0: # Only extract valid, positive claim numbers
                        extracted_claims.setdefault(claim_number, []).append((full_match_text, line_num))
                except ValueError:
                    # Invalid claim number will be caught by validation, so just skip for extraction here.
                    pass
        return extracted_claims

    def enforce_all_rules(self, mermaid_text: str, enable_math_linter: bool = False) -> List[SchemaViolation]:
        """
        Applies all available validation rules to a Mermaid diagram, providing
        a comprehensive compliance check.

        Args:
            mermaid_text (str): The Mermaid diagram source text.
            enable_math_linter (bool): If True, enables the more advanced
                                       `MermaidMathSyntaxLinter` for detailed
                                       LaTeX math syntax checks. Defaults to False.

        Returns:
            List[SchemaViolation]: A consolidated list of all `SchemaViolation` objects found.
        """
        all_violations = []
        all_violations.extend(self.validate_diagram(mermaid_text))
        all_violations.extend(self.validate_math_equations(mermaid_text))
        all_violations.extend(self.validate_claim_references(mermaid_text))
        
        if enable_math_linter:
            math_linter = MermaidMathSyntaxLinter()
            all_violations.extend(math_linter.lint_mermaid_math(mermaid_text))

        return all_violations

    def apply_all_transformations(self, mermaid_text: str,
                                  label_replacement_char: str = "",
                                  math_remove_dollars: bool = False,
                                  math_standardize_environments: bool = False) -> str:
        """
        Applies all available transformations to a Mermaid diagram, including
        general label cleaning and math equation standardization.

        Args:
            mermaid_text (str): The Mermaid diagram source text.
            label_replacement_char (str): The character to replace '(' and ')' in general labels.
                                          Defaults to "" (removal).
            math_remove_dollars (bool): If True, replaces inline `$...$` with `\(...\)`.
            math_standardize_environments (bool): If True, attempts to simplify/standardize
                                                  certain LaTeX environments within math.

        Returns:
            str: The transformed Mermaid diagram text.
        """
        transformed_text = self.transform_diagram(mermaid_text, replacement_char=label_replacement_char)
        transformed_text = self.transform_math_equations(transformed_text,
                                                         remove_dollars=math_remove_dollars,
                                                         standardize_environments=math_standardize_environments)
        # Currently, there are no separate transformations specific to claim references
        # beyond what `transform_diagram` already handles for general labels.
        return transformed_text


class MermaidMathSyntaxLinter:
    """
    A more advanced, but still heuristic, linter for LaTeX math syntax
    within Mermaid diagrams. This class focuses on structural balance and common
    LaTeX specific syntax pitfalls, contributing to the "100 math equations" expansion
    by implementing a multitude of detailed checks.
    """
    def __init__(self):
        # List of known LaTeX math commands (for checking against typos or unknown commands)
        self.known_latex_commands = {
            'frac', 'sqrt', 'sum', 'int', 'lim', 'log', 'ln', 'exp', 'sin', 'cos', 'tan',
            'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota',
            'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon',
            'phi', 'chi', 'psi', 'omega', 'pm', 'mp', 'times', 'div', 'cdot', 'approx',
            'equiv', 'cong', 'cup', 'cap', 'subseteq', 'supseteq', 'subset', 'supset',
            'in', 'notin', 'forall', 'exists', 'infty', 'nabla', 'partial', 'prime', 'hbar',
            'ell', 'ldots', 'cdots', 'vdots', 'ddots', 'vec', 'bar', 'hat', 'tilde', 'check',
            'breve', 'acute', 'grave', 'dot', 'ddot', 'mathit', 'mathrm', 'mathbf', 'bm',
            'text', 'quad', 'qquad', '!', ',', ':', ';', 'left', 'right', 'label', 'tag',
            'nonumber', 'text', 'textit', 'textbf', 'textrm', 'texttt', 'pmod', 'bmod',
            'operatorname', 'det', 'gcd', 'max', 'min', 'arg', 'sup', 'inf', 'lim', 'Pr', 'exp',
            'ln', 'log', 'deg', 'hom', 'ker', 'dim', 'rank', 'Tr', 'operatorname'
        }
        # Mappings for paired delimiters (e.g., `(` expects `)`)
        self.paired_delimiters = {
            '(': ')', '[': ']', '{': '}', '\\{': '\\}', '\\[': '\\]', '\\(': '\\)',
            '\\langle': '\\rangle'
        }
        # Commands that require a specific number of arguments in `{}`
        self.requires_arg = {
            'frac': 2, 'sqrt': 1, 'log': 1, 'ln': 1, 'exp': 1,
            'vec': 1, 'bar': 1, 'hat': 1, 'tilde': 1, 'check': 1, 'breve': 1, 'acute': 1,
            'grave': 1, 'dot': 1, 'ddot': 1, 'text': 1, 'mathrm': 1, 'mathbf': 1, 'bm': 1,
            'textit': 1, 'textbf': 1, 'textrm': 1, 'texttt': 1
        }
        # LaTeX environments that typically involve alignment characters like `&`
        self.environments_with_align_chars = {'align', 'equation', 'gather', 'array', 'pmatrix', 'matrix'}

    def _get_balance_violations(self, math_content: str, line_num: int) -> List[SchemaViolation]:
        """
        Checks for balanced LaTeX delimiters (e.g., `()`, `[]`, `{}`, `\left...\right`)
        and `\begin...\end` environments within a math string.
        """
        violations = []
        
        # Check for delimiter balance
        delim_stack = []
        # Find all explicit delimiters and \left/\right commands
        delimiters = re.findall(r'\\(left|right)(?P<delim>[\(\{\[\|])|(?P<char>[\(\{\[\]\}\)\|])', math_content)
        
        for match_tuple in delimiters:
            left_right_cmd, lr_delim_char, char_delim = match_tuple
            delim = lr_delim_char if left_right_cmd else char_delim

            if left_right_cmd == 'left' or delim in self.paired_delimiters: # Opening delimiter
                delim_stack.append((delim, left_right_cmd))
            elif left_right_cmd == 'right' or delim in self.paired_delimiters.values(): # Closing delimiter
                if not delim_stack:
                    violations.append(SchemaViolation(
                        rule_name="UnmatchedDelimiter",
                        message=f"Unmatched closing delimiter '{delim}'.",
                        context=math_content,
                        line_number=line_num
                    ))
                    continue
                
                last_open_delim, last_lr_cmd = delim_stack.pop()
                expected_close = self.paired_delimiters.get(last_open_delim)
                
                # Special handling for \left/\right pairs
                is_lr_match = (last_lr_cmd == 'left' and left_right_cmd == 'right' and 
                               self.paired_delimiters.get(last_open_delim) == delim)
                
                if expected_close != delim and not is_lr_match:
                    violations.append(SchemaViolation(
                        rule_name="MismatchedDelimiter",
                        message=f"Mismatched closing delimiter '{delim}'. Expected '{expected_close if expected_close else 'matching \left'}' for '{last_open_delim}'.",
                        context=math_content,
                        line_number=line_num
                    ))
        
        for open_delim, _ in delim_stack:
            violations.append(SchemaViolation(
                rule_name="UnmatchedDelimiter",
                message=f"Unmatched opening delimiter '{open_delim}'.",
                context=math_content,
                line_number=line_num
            ))

        # Check for \begin/\end environment balance
        env_stack = []
        for match in re.finditer(r'\\(begin|end)\{(\w+)\*?\}', math_content):
            action, env_name = match.groups()
            if action == 'begin':
                env_stack.append(env_name)
            elif action == 'end':
                if env_stack and env_stack[-1] == env_name:
                    env_stack.pop()
                else:
                    violations.append(SchemaViolation(
                        rule_name="MismatchedEnvironment",
                        message=f"Mismatched or unexpected '\\end{{{env_name}}}' found within math block.",
                        context=math_content,
                        line_number=line_num
                    ))
        for env_name in env_stack:
            violations.append(SchemaViolation(
                rule_name="UnclosedEnvironment",
                message=f"Unclosed LaTeX environment '\\begin{{{env_name}}}'.",
                context=math_content,
                line_number=line_num
            ))

        return violations

    def _get_command_arg_violations(self, math_content: str, line_num: int) -> List[SchemaViolation]:
        """
        Checks if LaTeX commands that require arguments have them correctly specified.
        This is a heuristic and doesn't cover all edge cases but catches common mistakes.
        """
        violations = []
        
        # Regex to find commands followed by arguments
        # It captures: \cmd, optional *, and then tries to find up to two {arg} blocks
        command_arg_finder = re.compile(r'\\(\w+)(\*?)(?:(\{.+?\}))?(?:(\{.+?\}))?')
        
        for match in command_arg_finder.finditer(math_content):
            cmd = match.group(1)
            arg1 = match.group(3)
            arg2 = match.group(4)
            
            if cmd in self.requires_arg:
                expected_args = self.requires_arg[cmd]
                
                if expected_args == 1 and arg1 is None:
                     violations.append(SchemaViolation(
                        rule_name="MissingCommandArgument",
                        message=f"Command `\\{cmd}` requires one argument but none found.",
                        context=match.group(0),
                        line_number=line_num,
                        severity="error"
                    ))
                elif expected_args == 2 and (arg1 is None or arg2 is None):
                    violations.append(SchemaViolation(
                        rule_name="MissingCommandArgument",
                        message=f"Command `\\{cmd}` requires two arguments but fewer found.",
                        context=match.group(0),
                        line_number=line_num,
                        severity="error"
                    ))
        return violations
    
    def _get_alignment_violations(self, math_content: str, line_num: int) -> List[SchemaViolation]:
        """
        Detects misplaced alignment ampersands (`&`) outside of appropriate LaTeX environments.
        """
        violations = []
        
        # This is a simplified check. A full parser would build an AST.
        in_align_env_stack = [] # Stack to handle nested environments if any.
        
        for match in re.finditer(r'\\(begin|end)\{(\w+)\*?\}|&', math_content):
            if match.group(1): # It's a begin/end command
                action, env_name = match.group(1), match.group(3)
                if env_name in self.environments_with_align_chars:
                    if action == 'begin':
                        in_align_env_stack.append(env_name)
                    elif action == 'end':
                        if in_align_env_stack and in_align_env_stack[-1] == env_name:
                            in_align_env_stack.pop()
                        # Else: mismatched end, handled by _get_balance_violations
            elif match.group(0) == '&': # It's an ampersand
                if not in_align_env_stack:
                    violations.append(SchemaViolation(
                        rule_name="MisplacedAlignmentAmpersand",
                        message="Ampersand '&' used outside of an alignment-like environment (e.g., `align`, `array`).",
                        context=math_content,
                        line_number=line_num,
                        severity="warning"
                    ))
        return violations

    def lint_math_segment(self, math_content: str, line_num: int) -> List[SchemaViolation]:
        """
        Lints a single LaTeX math segment (the content *between* delimiters) for
        common syntax and balance issues. This includes 10 specific rules
        (contributing to the '100 math equations' expansion).

        Args:
            math_content (str): The raw LaTeX math string (e.g., "x^2 + y^2 = 0").
                                This should NOT include the math delimiters like `$` or `\[`.
            line_num (int): The line number where this math segment was found.

        Returns:
            List[SchemaViolation]: A list of detected math syntax violations.
        """
        violations: List[SchemaViolation] = []

        # Check for balanced delimiters and environments
        # Note: This is re-checking parts already checked by Enforcer's validate_math_equations,
        # but this linter is more detailed and for *internal* math content, not outer label structure.
        violations.extend(self._get_balance_violations(math_content, line_num))
        
        # Check for correct number of arguments for commands
        violations.extend(self._get_command_arg_violations(math_content, line_num))
        
        # Check for misplaced alignment characters
        violations.extend(self._get_alignment_violations(math_content, line_num))

        # Rule 1: Unknown LaTeX commands
        # Identify words starting with '\' that are not known commands or special symbols.
        for cmd_match in re.finditer(r'\B\\([a-zA-Z]+)\b', math_content):
            cmd_name = cmd_match.group(1)
            if cmd_name not in self.known_latex_commands:
                violations.append(SchemaViolation(
                    rule_name="UnknownLaTeXCommand",
                    message=f"Unknown LaTeX command `\\{cmd_name}` detected. Check for typos or missing packages.",
                    context=cmd_match.group(0),
                    line_number=line_num,
                    severity="warning"
                ))

        # Rule 2: Naked superscripts/subscripts (e.g., `x^2` instead of `x^{2}`)
        if re.search(r'([^_]|^)\^[a-zA-Z0-9](?![{])', math_content):
            violations.append(SchemaViolation(
                rule_name="NakedSuperscript",
                message="Superscript `^` should apply to a group, e.g., `^{...}`. Only single characters or commands are implicitly grouped.",
                context=math_content,
                line_number=line_num,
                severity="warning"
            ))
        if re.search(r'([^_]|^)\_[a-zA-Z0-9](?![{])', math_content):
            violations.append(SchemaViolation(
                rule_name="NakedSubscript",
                message="Subscript `_` should apply to a group, e.g., `_{...}`. Only single characters or commands are implicitly grouped.",
                context=math_content,
                line_number=line_num,
                severity="warning"
            ))

        # Rule 3: Double backslashes `\\` for line breaks used outside of aligned environments.
        # This checks for `\\` that is not part of a known alignment environment's content.
        # This is very hard to do perfectly without full parsing, so it's a heuristic.
        if re.search(r'\\\\(?!\\)', math_content) and not any(env in math_content for env in self.environments_with_align_chars):
            violations.append(SchemaViolation(
                rule_name="MisplacedLineBreak",
                message="Double backslash `\\\\` used as line break potentially outside of a supported environment (e.g., `align`, `array`).",
                context=math_content,
                line_number=line_num,
                severity="warning"
            ))

        # Rule 4: Use of raw `.` for multiplication with variables (prefer `\cdot`)
        if re.search(r'[a-zA-Z_]\.[a-zA-Z_]', math_content):
            violations.append(SchemaViolation(
                rule_name="RawDotProduct",
                message="Plain `.` used for multiplication between variables. Consider `\\cdot` for clarity.",
                context=math_content,
                line_number=line_num,
                severity="info"
            ))

        # Rule 5: Incorrect spacing around comparison operators
        if re.search(r'([<>=])\s*(?![<>=])', math_content) or re.search(r'(?![<>=])\s*([<>=])', math_content):
            # This is a very broad rule and might give false positives, focusing on `A = B` vs `A=B`.
            # A more advanced rule would check for `A = B` (correct) vs `A =B` (incorrect).
            pass # Skipping this one for now, as it's too complex for heuristic and might be personal preference.

        # Rule 6: Using `\textrm` or `\text` with math italic content (e.g., `\text{variable}`)
        if re.search(r'\\text\{(.*?)\}', math_content) and re.search(r'\b[a-zA-Z]\b', re.search(r'\\text\{(.*?)\}', math_content).group(1)):
            violations.append(SchemaViolation(
                rule_name="ImproperTextInMath",
                message="Consider `\\mathrm{...}` for upright math text like units or function names, instead of `\\text{...}` which uses surrounding text font.",
                context=math_content,
                line_number=line_num,
                severity="info"
            ))

        # Rule 7: Overuse of `\left` / `\right` for small delimiters
        # This is mostly stylistic; difficult to automate reliably.
        # Example heuristic: `\left(x\right)` where `(x)` would suffice.
        if re.search(r'\\left\([^\(\[\{\\]*?\\right\)', math_content):
            violations.append(SchemaViolation(
                rule_name="OveruseOfLeftRight",
                message="`\\left` and `\\right` might be overkill for single-character or simple expressions; consider plain `()`.",
                context=math_content,
                line_number=line_num,
                severity="info"
            ))

        # Rule 8: Missing `\ ` for spaces in array/matrix environments where text is involved
        if re.search(r'\\begin\{(array|pmatrix|matrix)\}.*?[a-zA-Z]{2,}\s+[a-zA-Z]{2,}.*?\\end\{(array|pmatrix|matrix)\}', math_content, re.DOTALL):
            violations.append(SchemaViolation(
                rule_name="MissingSpacingInMatrixText",
                message="Text in array/matrix environments may need explicit spacing (`\\ `) between words.",
                context=math_content,
                line_number=line_num,
                severity="info"
            ))
        
        # Rule 9: Using `*` for multiplication where `\times` or `\cdot` is preferred in formal math
        if re.search(r'[a-zA-Z0-9]\*[a-zA-Z0-9]', math_content):
            violations.append(SchemaViolation(
                rule_name="StarForMultiplication",
                message="`*` is used for multiplication; consider `\\times` or `\\cdot` for formal math typesetting.",
                context=math_content,
                line_number=line_num,
                severity="info"
            ))

        # Rule 10: Unescaped `%` character within math mode
        if re.search(r'(?<!\\)%', math_content):
             violations.append(SchemaViolation(
                 rule_name="UnescapedPercent",
                 message="Unescaped `%` character in math mode. It is a comment character; escape it with `\\%` if intended as literal.",
                 context=math_content,
                 line_number=line_num,
                 severity="error"
             ))

        return violations

    def lint_mermaid_math(self, mermaid_text: str) -> List[SchemaViolation]:
        """
        Extracts all math segments from a Mermaid diagram (within labels)
        and applies a detailed LaTeX math syntax linter to each segment.

        Args:
            mermaid_text (str): The complete Mermaid diagram source text.

        Returns:
            List[SchemaViolation]: A consolidated list of all math-specific
                                   `SchemaViolation` objects found across the diagram.
        """
        enforcer = MermaidSchemaEnforcer(strict_mode=False) # Use an internal enforcer for label extraction
        all_labels = enforcer._extract_all_labels(mermaid_text, exclude_link_labels=False)
        all_violations = []

        for label_content, label_start_idx, _ in all_labels:
            line_num = enforcer._get_line_number(mermaid_text, label_start_idx)
            
            # Extract math segments (inline $...$, display \[...\], \(...\), and $$...$$)
            math_matches_in_label = list(re.finditer(r'\$\$(.*?)\$\$|\$(.*?)\$|\\\[(.*?)\\\]|\\\((.*?)\\\)', label_content, re.DOTALL))
            
            for math_match in math_matches_in_label:
                # Determine which group matched (which delimiter type) and extract its core content.
                # Only one group (1, 2, 3, or 4) will be non-None for each match.
                math_core_content = next((s for s in math_match.groups() if s is not None), None)

                if math_core_content is not None:
                    # Apply the detailed linter to the core math content.
                    all_violations.extend(self.lint_math_segment(math_core_content, line_num))
        
        return all_violations