/**
 * The type which includes all nodes.
 */
export type Node = BranchNode | LeafNode

/**
 * The type which includes all branch nodes.
 */
export type BranchNode =
    | Alternative
    | CapturingGroup
    | CharacterClass
    | CharacterClassRange
    | ClassIntersection
    | ClassStringDisjunction
    | ClassSubtraction
    | ExpressionCharacterClass
    | Group
    | LookaroundAssertion
    | Pattern
    | Quantifier
    | RegExpLiteral

/**
 * The type which includes all leaf nodes.
 */
export type LeafNode =
    | Backreference
    | BoundaryAssertion
    | Character
    | CharacterSet
    | Flags

/**
 * The type which includes all atom nodes.
 */
export type Element = Assertion | QuantifiableElement | Quantifier

/**
 * The type which includes all atom nodes that Quantifier node can have as children.
 */
export type QuantifiableElement =
    | Backreference
    | CapturingGroup
    | Character
    | CharacterClass
    | CharacterSet
    | ExpressionCharacterClass
    | Group
    | LookaheadAssertion

/**
 * The type which includes all character class atom nodes.
 */
export type CharacterClassElement =
    | ClassRangesCharacterClassElement
    | UnicodeSetsCharacterClassElement
export type ClassRangesCharacterClassElement =
    | Character
    | CharacterClassRange
    | EscapeCharacterSet
    | UnicodePropertyCharacterSet
export type UnicodeSetsCharacterClassElement =
    | Character
    | CharacterClassRange
    | ClassStringDisjunction
    | EscapeCharacterSet
    | ExpressionCharacterClass
    | UnicodePropertyCharacterSet
    | UnicodeSetsCharacterClass

/**
 * The type which defines common properties for all node types.
 */
export interface NodeBase {
    /** The node type. */
    type: Node["type"]
    /** The parent node. */
    parent: Node["parent"]
    /** The 0-based index that this node starts. */
    start: number
    /** The 0-based index that this node ends. */
    end: number
    /** The raw text of this node. */
    raw: string
}

/**
 * The root node.
 */
export interface RegExpLiteral extends NodeBase {
    type: "RegExpLiteral"
    parent: null
    pattern: Pattern
    flags: Flags
}

/**
 * The pattern.
 */
export interface Pattern extends NodeBase {
    type: "Pattern"
    parent: RegExpLiteral | null
    alternatives: DisjunctionAlternative[]
}

/**
 * The alternative.
 * E.g. `a|b`
 */
export type Alternative = DisjunctionAlternative | StringAlternative
interface BaseAlternative extends NodeBase {
    type: "Alternative"
    parent:
        | CapturingGroup
        | ClassStringDisjunction
        | Group
        | LookaroundAssertion
        | Pattern
    string: boolean
    elements: Element[]
}
export interface DisjunctionAlternative extends BaseAlternative {
    parent: CapturingGroup | Group | LookaroundAssertion | Pattern
    string: false
    elements: Element[]
}
/** StringAlternative is only used for `\q{alt}`({@link ClassStringDisjunction}). */
export interface StringAlternative extends BaseAlternative {
    parent: ClassStringDisjunction
    string: true
    elements: Character[]
}

/**
 * The uncapturing group.
 * E.g. `(?:ab)`
 */
export interface Group extends NodeBase {
    type: "Group"
    parent: DisjunctionAlternative | Quantifier
    alternatives: DisjunctionAlternative[]
}

/**
 * The capturing group.
 * E.g. `(ab)`, `(?<name>ab)`
 */
export interface CapturingGroup extends NodeBase {
    type: "CapturingGroup"
    parent: DisjunctionAlternative | Quantifier
    name: string | null
    alternatives: DisjunctionAlternative[]
    references: Backreference[]
}

/**
 * The lookaround assertion.
 */
export type LookaroundAssertion = LookaheadAssertion | LookbehindAssertion

/**
 * The lookahead assertion.
 * E.g. `(?=ab)`, `(?!ab)`
 */
export interface LookaheadAssertion extends NodeBase {
    type: "Assertion"
    parent: DisjunctionAlternative | Quantifier
    kind: "lookahead"
    negate: boolean
    alternatives: DisjunctionAlternative[]
}

/**
 * The lookbehind assertion.
 * E.g. `(?<=ab)`, `(?<!ab)`
 */
export interface LookbehindAssertion extends NodeBase {
    type: "Assertion"
    parent: DisjunctionAlternative
    kind: "lookbehind"
    negate: boolean
    alternatives: DisjunctionAlternative[]
}

/**
 * The quantifier.
 * E.g. `a?`, `a*`, `a+`, `a{1,2}`, `a??`, `a*?`, `a+?`, `a{1,2}?`
 */
export interface Quantifier extends NodeBase {
    type: "Quantifier"
    parent: DisjunctionAlternative
    min: number
    max: number // can be Number.POSITIVE_INFINITY
    greedy: boolean
    element: QuantifiableElement
}

/**
 * The character class.
 * E.g. `[ab]`, `[^ab]`
 */
export type CharacterClass =
    | ClassRangesCharacterClass
    | UnicodeSetsCharacterClass
interface BaseCharacterClass extends NodeBase {
    type: "CharacterClass"
    parent:
        | DisjunctionAlternative
        | ExpressionCharacterClass
        | Quantifier
        | UnicodeSetsCharacterClass
    unicodeSets: boolean
    negate: boolean
    elements: CharacterClassElement[]
}
export interface ClassRangesCharacterClass extends BaseCharacterClass {
    parent: DisjunctionAlternative | Quantifier
    unicodeSets: false
    elements: ClassRangesCharacterClassElement[]
}
/** UnicodeSetsCharacterClass is the CharacterClass when in Unicode sets mode. So it may contain strings. */
export interface UnicodeSetsCharacterClass extends BaseCharacterClass {
    parent:
        | DisjunctionAlternative
        | ExpressionCharacterClass
        | Quantifier
        | UnicodeSetsCharacterClass
    unicodeSets: true
    elements: UnicodeSetsCharacterClassElement[]
}

/**
 * The character class.
 * E.g. `[a-b]`
 */
export interface CharacterClassRange extends NodeBase {
    type: "CharacterClassRange"
    parent: CharacterClass
    min: Character
    max: Character
}

/**
 * The assertion.
 */
export type Assertion = BoundaryAssertion | LookaroundAssertion

/**
 * The boundary assertion.
 */
export type BoundaryAssertion = EdgeAssertion | WordBoundaryAssertion

/**
 * The edge boundary assertion.
 * E.g. `^`, `$`
 */
export interface EdgeAssertion extends NodeBase {
    type: "Assertion"
    parent: DisjunctionAlternative | Quantifier
    kind: "end" | "start"
}

/**
 * The word bondary assertion.
 * E.g. `\b`, `\B`
 */
export interface WordBoundaryAssertion extends NodeBase {
    type: "Assertion"
    parent: DisjunctionAlternative | Quantifier
    kind: "word"
    negate: boolean
}

/**
 * The character set.
 */
export type CharacterSet =
    | AnyCharacterSet
    | EscapeCharacterSet
    | UnicodePropertyCharacterSet

/**
 * The dot.
 * E.g. `.`
 */
export interface AnyCharacterSet extends NodeBase {
    type: "CharacterSet"
    parent: DisjunctionAlternative | Quantifier
    kind: "any"
}

/**
 * The character class escape.
 * E.g. `\d`, `\s`, `\w`, `\D`, `\S`, `\W`
 */
export interface EscapeCharacterSet extends NodeBase {
    type: "CharacterSet"
    parent:
        | CharacterClass
        | ClassIntersection
        | ClassSubtraction
        | DisjunctionAlternative
        | Quantifier
    kind: "digit" | "space" | "word"
    negate: boolean
}

/**
 * The unicode property escape.
 * E.g. `\p{ASCII}`, `\P{ASCII}`, `\p{Script=Hiragana}`
 */
export type UnicodePropertyCharacterSet =
    | CharacterUnicodePropertyCharacterSet
    | StringsUnicodePropertyCharacterSet
interface BaseUnicodePropertyCharacterSet extends NodeBase {
    type: "CharacterSet"
    parent:
        | CharacterClass
        | ClassIntersection
        | ClassSubtraction
        | DisjunctionAlternative
        | Quantifier
    kind: "property"
    strings: boolean
    key: string
    value: string | null
    negate: boolean
}
export interface CharacterUnicodePropertyCharacterSet
    extends BaseUnicodePropertyCharacterSet {
    strings: false
    value: string | null
    negate: boolean
}
/** StringsUnicodePropertyCharacterSet is Unicode property escape with property of strings. */
export interface StringsUnicodePropertyCharacterSet
    extends BaseUnicodePropertyCharacterSet {
    strings: true
    value: null
    negate: false
}

/**
 * The expression character class.
 * E.g. `[a--b]`, `[a&&b]`,`[^a--b]`, `[^a&&b]`
 */
export interface ExpressionCharacterClass extends NodeBase {
    type: "ExpressionCharacterClass"
    parent:
        | DisjunctionAlternative
        | ExpressionCharacterClass
        | Quantifier
        | UnicodeSetsCharacterClass
    negate: boolean
    expression: ClassIntersection | ClassSubtraction
}

export type ClassSetOperand =
    | Character
    | ClassStringDisjunction
    | EscapeCharacterSet
    | ExpressionCharacterClass
    | UnicodePropertyCharacterSet
    | UnicodeSetsCharacterClass

/**
 * The character class intersection.
 * E.g. `a&&b`
 */
export interface ClassIntersection extends NodeBase {
    type: "ClassIntersection"
    parent: ClassIntersection | ExpressionCharacterClass
    left: ClassIntersection | ClassSetOperand
    right: ClassSetOperand
}

/**
 * The character class subtraction.
 * E.g. `a--b`
 */
export interface ClassSubtraction extends NodeBase {
    type: "ClassSubtraction"
    parent: ClassSubtraction | ExpressionCharacterClass
    left: ClassSetOperand | ClassSubtraction
    right: ClassSetOperand
}

/**
 * The character class string disjunction.
 * E.g. `\q{a|b}`
 */
export interface ClassStringDisjunction extends NodeBase {
    type: "ClassStringDisjunction"
    parent: ClassIntersection | ClassSubtraction | UnicodeSetsCharacterClass
    alternatives: StringAlternative[]
}

/**
 * The character.
 * This includes escape sequences which mean a character.
 * E.g. `a`, `あ`, `✿`, `\x65`, `\u0065`, `\u{65}`, `\/`
 */
export interface Character extends NodeBase {
    type: "Character"
    parent:
        | Alternative
        | CharacterClass
        | CharacterClassRange
        | ClassIntersection
        | ClassSubtraction
        | Quantifier
    value: number // a code point.
}

/**
 * The backreference.
 * E.g. `\1`, `\k<name>`
 */
export interface Backreference extends NodeBase {
    type: "Backreference"
    parent: DisjunctionAlternative | Quantifier
    ref: number | string
    resolved: CapturingGroup
}

/**
 * The flags.
 */
export interface Flags extends NodeBase {
    type: "Flags"
    parent: RegExpLiteral | null
    dotAll: boolean
    global: boolean
    hasIndices: boolean
    ignoreCase: boolean
    multiline: boolean
    sticky: boolean
    unicode: boolean
    unicodeSets: boolean
}
