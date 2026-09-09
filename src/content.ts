import { toolExamples } from "./tool-examples"

export type Locale = "en" | "ko"

export type PluginId = "guard-hooks" | "context-handoff" | "repo-gate"

export const release = {
  version: "0.3.9",
  sha: "4a8947c3110459730e5c91eb75f7ecfe620be394",
  pluginCount: 3,
  skillCount: 11,
  hookCount: 8,
} as const

export const sourceRepositoryUrl =
  "https://github.com/AndrewDongminYoo/cc-agents-kit"

export const marketplaceCommand =
  "/plugin marketplace add AndrewDongminYoo/cc-agents-kit"

export const installCommand = (plugin: PluginId) =>
  `/plugin install ${plugin}@cc-agents-kit`

export const upgradeCommand = (plugin: PluginId) =>
  `claude plugin update ${plugin}@cc-agents-kit`

type PluginContent = {
  id: PluginId
  number: string
  version: string
  type: "hooks" | "skills"
  count: number
  name: string
  shortDescription: string
  description: string
  idealFor: string
  contentsLabel: string
  contents: readonly string[]
  notes: readonly string[]
}

export type SiteContent = {
  meta: {
    title: string
    description: string
  }
  languageName: string
  alternateLanguage: string
  skipLink: string
  brandNote: string
  nav: {
    primaryLabel: string
    plugins: string
    workflow: string
    install: string
    review: string
    github: string
    source: string
    websiteSource: string
    pending: string
    footerLabel: string
  }
  hero: {
    eyebrow: string
    titleLead: string
    titleAccent: string
    body: string
    primaryAction: string
    secondaryAction: string
    releaseLabel: string
    stats: readonly { value: string; label: string }[]
  }
  schematic: {
    input: string
    marketplace: string
    choose: string
    output: string
    installed: string
  }
  explorer: {
    title: string
    chooseTool: string
    example: string
    before: string
    after: string
    mechanism: string
    source: string
    overlap: string
    fallback: string
    install: string
    requirements: string
    review: string
    faq: string
    problems: Record<
      PluginId,
      { title: string; summary: string; overlap: string }
    >
  }
  catalogue: {
    eyebrow: string
    title: string
    intro: string
    indexLabel: string
    fitLabel: string
    versionLabel: string
    installLabel: string
  }
  plugins: readonly PluginContent[]
  workflow: {
    eyebrow: string
    title: string
    intro: string
    steps: readonly { number: string; title: string; body: string }[]
  }
  installation: {
    eyebrow: string
    title: string
    intro: string
    selectedLabel: string
    marketplaceNote: string
    stance: string
    marketplaceLabel: string
    pluginLabel: string
    copy: string
    copied: string
    copyFailed: string
    manualCopy: string
    upgradeTitle: string
    upgradeBody: string
    upgradeLabel: string
    restartNote: string
  }
  requirements: {
    eyebrow: string
    title: string
    toolsTitle: string
    intro: string
    requiredLabel: string
    conditionalLabel: string
    optionalLabel: string
    testsLabel: string
    tableHeaders: readonly [string, string, string]
    items: readonly { name: string; role: string; kind: string }[]
    limitsTitle: string
    limitsIntro: string
    limits: readonly string[]
  }
  review: {
    eyebrow: string
    title: string
    intro: string
    promptLabel: string
    prompt: string
    note: string
    annotation: readonly string[]
  }
  faq: {
    eyebrow: string
    title: string
    items: readonly { question: string; answer: string }[]
  }
  footer: {
    line: string
    release: string
    personalSite: string
    github: string
    license: string
    credits: string
    about: string
    contact: string
    privacy: string
  }
}

const sharedPlugins = {
  "guard-hooks": {
    id: "guard-hooks",
    number: "01",
    version: "0.2.7",
    type: "hooks",
    count: 8,
    contents: [
      "dangerous-command-guard",
      "zsh-quoting-guard",
      "pathless-rewriter-guard",
      "staged-secret-guard",
      "secrets-path-guard",
      "lockfile-drift-check",
      "shellcheck-on-edit",
      "output-secret-mask",
    ],
  },
  "context-handoff": {
    id: "context-handoff",
    number: "02",
    version: "0.1.4",
    type: "skills",
    count: 6,
    contents: [
      "handoff",
      "session-export",
      "log-it",
      "wayfinder",
      "context-budget",
      "config-gc",
    ],
  },
  "repo-gate": {
    id: "repo-gate",
    number: "03",
    version: "0.1.6",
    type: "skills",
    count: 5,
    contents: [
      "semantic-commit",
      "setup-trunk",
      "ci-babysit",
      "fix-osv-vulnerabilities",
      "cspell-triage",
    ],
  },
} as const

export function toolSourceUrl(pluginId: PluginId, toolId: string): string {
  const plugin = sharedPlugins[pluginId]
  if (!plugin.contents.some((item) => item === toolId)) {
    throw new Error("The tool does not belong to the selected plugin.")
  }
  const sourcePath =
    plugin.type === "hooks"
      ? `plugins/${pluginId}/hooks/${toolId}.sh`
      : `plugins/${pluginId}/skills/${toolId}/SKILL.md`
  return `${sourceRepositoryUrl}/blob/${release.sha}/${sourcePath}`
}

const en: SiteContent = {
  meta: {
    title: "cc-agents-kit — Guardrails and workflow tools for Claude Code",
    description:
      "Three focused Claude Code plugins for safer commands, durable context, and deliberate repository delivery.",
  },
  languageName: "English",
  alternateLanguage: "한국어",
  skipLink: "Skip to content",
  brandNote: "A focused Claude Code plugin marketplace",
  nav: {
    primaryLabel: "Primary navigation",
    plugins: "Plugins",
    workflow: "How it works",
    install: "Install",
    review: "AI review",
    github: "GitHub",
    source: "Plugin source",
    websiteSource: "Website source",
    pending: "Website source unavailable",
    footerLabel: "Footer navigation",
  },
  hero: {
    eyebrow: `Public release ${release.version}`,
    titleLead: "Fewer avoidable mistakes.",
    titleAccent: "Less work to repeat.",
    body: "Check risky commands, hand work to the next session, and prepare a careful commit. Choose a problem below to see the tools and concrete examples.",
    primaryAction: "Compare the plugins",
    secondaryAction: "Copy an install command",
    releaseLabel: `Source ${release.sha.slice(0, 7)}`,
    stats: [
      { value: String(release.pluginCount), label: "plugins" },
      { value: String(release.skillCount), label: "workflow skills" },
      { value: String(release.hookCount), label: "defensive hooks" },
    ],
  },
  schematic: {
    input: "your workflow",
    marketplace: "cc-agents-kit",
    choose: "Choose the plugins you need",
    output: "your setup",
    installed: "selected tools only",
  },
  explorer: {
    title: "What keeps interrupting your work?",
    chooseTool: "Explore the included tools",
    example: "How it works · example",
    before: "When this happens",
    after: "What the tool does",
    mechanism: "How it helps",
    source: "Read this tool's source",
    overlap: "When you may not need it",
    fallback: "Browse the tools and installation commands",
    install: "Install the selected plugin",
    requirements: "Requirements and limits",
    review: "Review with your AI before installing",
    faq: "Common questions",
    problems: {
      "guard-hooks": {
        title: "I want checks before risky commands.",
        summary:
          "Inspect commands, secrets, and repository edits with focused hooks.",
        overlap:
          "If your existing hooks cover these checks, compare their rules, behavior, and dependencies before adding another guard.",
      },
      "context-handoff": {
        title: "I keep explaining the same work again.",
        summary:
          "Carry decisions, evidence, and unfinished work across sessions.",
        overlap:
          "If your existing handoff and note workflow already preserves what you need, you may not need another set of skills.",
      },
      "repo-gate": {
        title: "The code works. Delivery still takes work.",
        summary:
          "Prepare commits, follow CI, and work through repository checks.",
        overlap:
          "These skills guide work with your existing tools. If your repository already has equivalent procedures, check the overlap before adding them.",
      },
    },
  },
  catalogue: {
    eyebrow: "Plugin catalogue",
    title: "Three plugins. Three clear jobs.",
    intro:
      "Each plugin owns one part of the work. Read the full inventory, compare the fit, and install only what earns a place in your setup.",
    indexLabel: "Catalogue index",
    fitLabel: "Best fit",
    versionLabel: "Version",
    installLabel: "Prepare install",
  },
  plugins: [
    {
      ...sharedPlugins["guard-hooks"],
      name: "guard-hooks",
      shortDescription:
        "Catch common command mistakes before they become expensive.",
      description:
        "Eight defensive hooks watch Claude Code tool calls. Five can block risky command shapes before execution, two add warnings after edits, and one masks credential-shaped Bash output.",
      idealFor:
        "Teams and solo developers who want practical protection from recurring shell, secret, and lockfile mistakes.",
      contentsLabel: "8 hooks",
      notes: [
        "5 blocking PreToolUse guards",
        "2 warning PostToolUse hooks",
        "1 Bash-output masking hook",
      ],
    },
    {
      ...sharedPlugins["context-handoff"],
      name: "context-handoff",
      shortDescription: "Carry the right context into the next session.",
      description:
        "Six skills keep long-running work understandable across sessions. They cover handoffs, readable exports, durable notes, multi-session wayfinding, context budgets, and configuration cleanup.",
      idealFor:
        "Developers whose work spans long sessions, multiple decisions, or a growing Claude Code configuration.",
      contentsLabel: "6 skills",
      notes: [
        "Transfer and archive session context",
        "Route durable findings",
        "Inspect context and configuration growth",
      ],
    },
    {
      ...sharedPlugins["repo-gate"],
      name: "repo-gate",
      shortDescription: "Move from working code to a careful push.",
      description:
        "Five skills cover the delivery steps around a repository: split changes into clear commits, introduce Trunk, monitor CI, triage OSV findings, and resolve spelling reports.",
      idealFor:
        "Maintainers who want repository checks to follow evidence and project conventions instead of a fixed stack.",
      contentsLabel: "5 skills",
      notes: [
        "Commit and quality-gate setup",
        "CI monitoring with explicit authority",
        "Dependency and spelling triage",
      ],
    },
  ],
  workflow: {
    eyebrow: "A deliberate workflow",
    title: "Inspect first. Add less.",
    intro:
      "The marketplace stays useful when every plugin has to justify its permissions, dependencies, and overlap with tools you already use.",
    steps: [
      {
        number: "01",
        title: "Compare",
        body: "Read each plugin inventory and identify the problem that is present in your own workflow.",
      },
      {
        number: "02",
        title: "Review",
        body: "Ask your AI to inspect the public source, dependencies, permissions, and overlap before it changes your setup.",
      },
      {
        number: "03",
        title: "Install",
        body: "Add the marketplace once. Install only the plugin that passes your review, then restart the session.",
      },
    ],
  },
  installation: {
    eyebrow: "Install",
    title: "Review what you need before installing.",
    intro:
      "The command below installs the selected plugin as a bundle. Review its contents before adding it to your setup.",
    selectedLabel: "Selected plugin",
    marketplaceNote:
      "Add the marketplace to browse its plugins. Choose what to install separately.",
    stance:
      "A useful skill is not a reason to recommend the whole bundle. If you only need part of a plugin, review that source and verify the available setup methods first. Skipping installation is a valid outcome.",
    marketplaceLabel: "In Claude Code: add the marketplace",
    pluginLabel: "In Claude Code: install the selected plugin",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Automatic copying did not complete.",
    manualCopy: "Select the command below and copy it manually.",
    upgradeTitle: "Already installed?",
    upgradeBody:
      "Use the update command with the marketplace suffix. Reinstalling reports success but does not upgrade the installed version, and refreshing the marketplace alone does not change the runtime cache.",
    upgradeLabel: "In your shell: update the plugin",
    restartNote:
      "Restart every open Claude Code session after an install or update. Hooks are read when a session starts.",
  },
  requirements: {
    eyebrow: "Guard requirements & limits",
    title: "Know what the guards can see.",
    toolsTitle: "What guard-hooks needs to run",
    intro:
      "The following runtime requirements apply to guard-hooks. Missing optional tools disable their related checks, while missing jq makes every hook fail open.",
    requiredLabel: "Required",
    conditionalLabel: "Conditional",
    optionalLabel: "Optional",
    testsLabel: "Tests only",
    tableHeaders: ["Tool", "Status", "Role"],
    items: [
      {
        name: "jq",
        role: "Parses hook input; guards fail open without it",
        kind: "Required",
      },
      {
        name: "bash",
        role: "Runs every hook, including on macOS",
        kind: "Required",
      },
      {
        name: "git",
        role: "Reads the candidate staged by staged-secret-guard",
        kind: "Conditional",
      },
      {
        name: "shellcheck",
        role: "Enables shell findings after shell-file edits",
        kind: "Optional",
      },
      {
        name: "gitleaks 8.x",
        role: "Enables credential-shaped output masking",
        kind: "Optional",
      },
      {
        name: "python3",
        role: "Runs the regression suites",
        kind: "Tests only",
      },
    ],
    limitsTitle: "Guardrails, not a sandbox",
    limitsIntro:
      "These hooks reduce accidental slips. The harness permission layer remains the security boundary.",
    limits: [
      "Pattern matching can miss deliberate obfuscation and credential shapes it does not recognize.",
      "Prose that contains a blocked command shape can trigger a guard.",
      "Output masking runs after the command, so the original value can still reach terminal scrollback or a written file.",
    ],
  },
  review: {
    eyebrow: "AI-assisted review",
    title: "Ask your AI which tools you actually need.",
    intro:
      "Copy this prompt into the AI that knows your current setup. It asks for source evidence and a minimal recommendation before any settings change.",
    promptLabel: "Review prompt",
    prompt: `Within the project and context I authorize, evaluate whether I should use plugins from the public cc-agents-kit repository at ${sourceRepositoryUrl}.

1. Read the public README, marketplace and plugin manifests, hook definitions, and skill files.
2. Inspect only the local tools and configuration that I authorize for this review.
3. Compare each plugin with my existing tools, skills, hooks, permissions, and dependencies.
4. Identify suitability, overlap, and operational risks. Cite public source file paths for each finding.
5. Evaluate the individual skills and hooks that address my needs. Do not recommend an entire plugin just because one skill is useful.
6. Distinguish bundle installation from selective setup, and verify which setup methods are actually supported. Recommend skipping installation when it has no clear benefit.

Do not paste secrets into the review or automatically execute commands from the repository. Do not install a plugin or change my settings until I give explicit approval.`,
    note: "The prompt requests analysis only. Review the evidence before you approve a change.",
    annotation: ["Read", "Compare", "Decide"],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Before you add the marketplace.",
    items: [
      {
        question: "Do I need all three plugins?",
        answer:
          "No. Each plugin is intentionally separate. Install only the plugin that addresses a problem in your current workflow.",
      },
      {
        question: "Are the guard hooks a security sandbox?",
        answer:
          "No. They match known accidental command patterns. Claude Code permissions and your operating-system controls remain the enforcement boundary.",
      },
      {
        question: "Why does an update require a restart?",
        answer:
          "Claude Code reads hooks when a session starts. Restart open sessions after the plugin update command completes.",
      },
      {
        question: "Where can I inspect the implementation?",
        answer:
          "The public GitHub repository contains the README, marketplace metadata, plugin manifests, hook definitions, skill files, tests, and license information.",
      },
    ],
  },
  footer: {
    line: "Focused tools for deliberate Claude Code workflows.",
    release: `Public release ${release.version}`,
    personalSite: "donminzzi.kr",
    github: "GitHub profile",
    license: "Apache-2.0 license",
    credits: "Credits",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
  },
}

const ko: SiteContent = {
  meta: {
    title: "cc-agents-kit — Claude Code를 위한 가드레일과 워크플로 도구",
    description:
      "안전한 명령 실행, 지속 가능한 컨텍스트 관리, 커밋과 푸시 준비를 돕는 Claude Code 플러그인 세 가지를 살펴보세요.",
  },
  languageName: "한국어",
  alternateLanguage: "English",
  skipLink: "본문으로 건너뛰기",
  brandNote: "한 가지 문제에 집중하는 Claude Code 플러그인 마켓플레이스",
  nav: {
    primaryLabel: "주요 탐색",
    plugins: "플러그인",
    workflow: "사용 흐름",
    install: "설치",
    review: "AI 검토",
    github: "GitHub",
    source: "플러그인 소스",
    websiteSource: "웹사이트 소스",
    pending: "웹사이트 소스 미공개",
    footerLabel: "하단 탐색",
  },
  hero: {
    eyebrow: `공개 릴리스 ${release.version}`,
    titleLead: "실수는 줄이고,",
    titleAccent: "하던 일은 이어가세요.",
    body: "위험한 명령 점검부터 세션 인수인계, 커밋 전 확인까지. 지금 반복해서 겪는 문제를 고르면 필요한 도구와 작동 예시를 볼 수 있습니다.",
    primaryAction: "플러그인 비교하기",
    secondaryAction: "설치 명령 복사하기",
    releaseLabel: `소스 ${release.sha.slice(0, 7)}`,
    stats: [
      { value: String(release.pluginCount), label: "플러그인" },
      { value: String(release.skillCount), label: "워크플로 스킬" },
      { value: String(release.hookCount), label: "방어용 훅" },
    ],
  },
  schematic: {
    input: "현재 워크플로",
    marketplace: "cc-agents-kit",
    choose: "필요한 플러그인을 선택하세요",
    output: "나만의 환경",
    installed: "선택한 도구만 설치",
  },
  explorer: {
    title: "어떤 일이 자꾸 발목을 잡나요?",
    chooseTool: "포함된 도구 살펴보기",
    example: "이렇게 작동합니다 · 예시",
    before: "이런 상황에서",
    after: "도구가 하는 일",
    mechanism: "도움이 되는 이유",
    source: "이 도구의 소스 보기",
    overlap: "추가 설치가 필요 없을 수도 있어요",
    fallback: "도구와 설치 명령 살펴보기",
    install: "선택한 플러그인 설치하기",
    requirements: "실행 조건과 한계 확인하기",
    review: "설치 전에 내 AI와 검토하기",
    faq: "궁금한 점 확인하기",
    problems: {
      "guard-hooks": {
        title: "위험한 명령은 실행 전에 확인하고 싶어요.",
        summary: "명령, 비밀 정보, 저장소 변경을 훅으로 점검합니다.",
        overlap:
          "기존 훅이 같은 항목을 점검한다면 다른 가드를 추가하기 전에 규칙, 동작, 의존성을 비교하세요.",
      },
      "context-handoff": {
        title: "새 세션마다 같은 설명을 반복해요.",
        summary: "결정 사항과 근거, 남은 작업을 다음 세션으로 가져갑니다.",
        overlap:
          "기존 인수인계와 기록 방식으로 필요한 정보를 충분히 이어가고 있다면, 스킬을 추가할 필요가 없을 수 있습니다.",
      },
      "repo-gate": {
        title: "코드는 됐는데, 마무리할 일이 남았어요.",
        summary: "커밋을 준비하고 CI와 저장소 검사 결과를 처리합니다.",
        overlap:
          "기존 도구를 사용하는 절차를 안내하는 스킬입니다. 저장소에 같은 역할의 절차가 있다면 겹치는 부분부터 확인하세요.",
      },
    },
  },
  catalogue: {
    eyebrow: "플러그인 목록",
    title: "세 가지 플러그인, 세 가지 분명한 역할.",
    intro:
      "각 플러그인은 작업 과정의 한 부분만 담당합니다. 전체 구성 요소를 확인하고 적합성을 비교한 뒤, 현재 환경에 필요한 플러그인만 설치하세요.",
    indexLabel: "목록 바로가기",
    fitLabel: "이런 경우에 적합합니다",
    versionLabel: "버전",
    installLabel: "설치 명령 준비하기",
  },
  plugins: [
    {
      ...sharedPlugins["guard-hooks"],
      name: "guard-hooks",
      shortDescription: "반복되는 명령 실수를 실행 전에 발견합니다.",
      description:
        "Claude Code의 도구 호출을 방어용 훅 여덟 개가 점검합니다. 다섯 개는 위험한 명령 형태를 실행 전에 차단하며, 두 개는 편집 후 경고를 추가하고, 한 개는 Bash 출력에서 자격 증명으로 보이는 값을 가립니다.",
      idealFor:
        "셸 명령, 비밀 정보, 잠금 파일과 관련하여 반복되는 실수를 실용적인 방식으로 줄이려는 팀과 개인 개발자에게 적합합니다.",
      contentsLabel: "훅 8개",
      notes: [
        "차단하는 PreToolUse 가드 5개",
        "경고하는 PostToolUse 훅 2개",
        "Bash 출력을 마스킹하는 훅 1개",
      ],
    },
    {
      ...sharedPlugins["context-handoff"],
      name: "context-handoff",
      shortDescription: "다음 세션에 필요한 컨텍스트를 정확하게 전달합니다.",
      description:
        "장기간 진행되는 작업을 여러 세션에서도 이해할 수 있도록 스킬 여섯 개가 지원합니다. 핸드오프, 읽기 쉬운 내보내기, 장기 기록, 여러 세션에 걸친 작업 계획, 컨텍스트 예산, 설정 정리를 다룹니다.",
      idealFor:
        "작업이 긴 세션과 여러 의사결정에 걸쳐 진행되거나 Claude Code 설정이 계속 늘어나는 개발자에게 적합합니다.",
      contentsLabel: "스킬 6개",
      notes: [
        "세션 컨텍스트 전달 및 보관",
        "장기 보존할 발견 사항 분류",
        "컨텍스트와 설정의 증가 상태 점검",
      ],
    },
    {
      ...sharedPlugins["repo-gate"],
      name: "repo-gate",
      shortDescription: "완성된 코드를 점검하고 푸시합니다.",
      description:
        "커밋과 푸시를 준비하는 스킬 다섯 개를 제공합니다. 변경 사항을 명확한 커밋으로 분리하고, Trunk를 도입하며, CI를 모니터링하고, OSV 취약점과 맞춤법 검사 결과를 분류합니다.",
      idealFor:
        "고정된 기술 스택보다 실제 증거와 프로젝트 관례를 기준으로 저장소 점검을 진행하려는 유지보수 담당자에게 적합합니다.",
      contentsLabel: "스킬 5개",
      notes: [
        "커밋 및 품질 게이트 설정",
        "명시적인 권한에 따른 CI 모니터링",
        "의존성 취약점 및 맞춤법 검사 결과 분류",
      ],
    },
  ],
  workflow: {
    eyebrow: "신중한 사용 흐름",
    title: "먼저 검토하고, 필요한 만큼만 추가하세요.",
    intro:
      "각 플러그인이 요청하는 권한과 의존성, 그리고 기존 도구와 겹치는 기능을 확인해야 마켓플레이스를 필요한 만큼만 사용할 수 있습니다.",
    steps: [
      {
        number: "01",
        title: "비교하기",
        body: "각 플러그인의 구성 요소를 읽고, 현재 워크플로에 실제로 존재하는 문제를 찾아보세요.",
      },
      {
        number: "02",
        title: "검토하기",
        body: "환경을 변경하기 전에 사용 중인 AI가 공개 소스, 의존성, 권한, 중복 기능을 살펴보도록 요청하세요.",
      },
      {
        number: "03",
        title: "설치하기",
        body: "마켓플레이스를 한 번 추가하세요. 검토를 통과한 플러그인만 설치한 뒤 세션을 다시 시작하세요.",
      },
    ],
  },
  installation: {
    eyebrow: "설치",
    title: "필요한 기능을 확인한 뒤 설치하세요.",
    intro:
      "아래 명령은 선택한 플러그인을 묶음으로 설치합니다. 현재 환경에 추가하기 전에 포함된 기능을 확인하세요.",
    selectedLabel: "선택한 플러그인",
    marketplaceNote:
      "마켓플레이스는 플러그인 목록을 등록합니다. 설치할 기능은 별도로 판단하세요.",
    stance:
      "스킬 하나가 유용하다고 플러그인 전체 설치를 권하지 않습니다. 일부 기능만 필요하면 해당 소스와 지원되는 적용 방법부터 검토하세요. 필요하지 않다면 설치하지 않아도 됩니다.",
    marketplaceLabel: "Claude Code에서 마켓플레이스 추가하기",
    pluginLabel: "Claude Code에서 선택한 플러그인 설치하기",
    copy: "복사",
    copied: "복사했습니다",
    copyFailed: "자동 복사를 완료하지 못했습니다.",
    manualCopy: "아래 명령을 선택하여 직접 복사하세요.",
    upgradeTitle: "이미 설치했나요?",
    upgradeBody:
      "마켓플레이스 접미사를 포함한 업데이트 명령을 사용하세요. 다시 설치하는 명령은 성공으로 표시되지만 설치된 버전을 갱신하지 않으며, 마켓플레이스만 새로 고쳐도 런타임 캐시는 바뀌지 않습니다.",
    upgradeLabel: "셸에서 플러그인 업데이트하기",
    restartNote:
      "설치하거나 업데이트한 뒤에는 열려 있는 Claude Code 세션을 모두 다시 시작하세요. 훅은 세션을 시작할 때 로드됩니다.",
  },
  requirements: {
    eyebrow: "가드 요구 사항 및 한계",
    title: "가드가 확인할 수 있는 범위를 알아두세요.",
    toolsTitle: "guard-hooks 실행 조건",
    intro:
      "아래 실행 도구는 guard-hooks에 필요합니다. 선택 도구가 없으면 관련 검사만 비활성화되지만, jq가 없으면 모든 훅이 문제를 차단하지 않고 통과시킵니다.",
    requiredLabel: "필수",
    conditionalLabel: "조건부",
    optionalLabel: "선택",
    testsLabel: "테스트 전용",
    tableHeaders: ["도구", "구분", "역할"],
    items: [
      {
        name: "jq",
        role: "훅 입력을 해석하며, jq가 없으면 가드가 문제를 차단하지 않습니다",
        kind: "필수",
      },
      {
        name: "bash",
        role: "macOS를 포함한 모든 환경에서 훅을 실행합니다",
        kind: "필수",
      },
      {
        name: "git",
        role: "staged-secret-guard가 커밋 후보를 읽을 때 사용합니다",
        kind: "조건부",
      },
      {
        name: "shellcheck",
        role: "셸 파일 편집 후 검사 결과를 제공합니다",
        kind: "선택",
      },
      {
        name: "gitleaks 8.x",
        role: "출력에서 자격 증명으로 보이는 값을 마스킹합니다",
        kind: "선택",
      },
      {
        name: "python3",
        role: "회귀 테스트 모음을 실행합니다",
        kind: "테스트 전용",
      },
    ],
    limitsTitle: "가드레일이며 샌드박스가 아닙니다",
    limitsIntro:
      "이 훅은 의도하지 않은 실수를 줄여줍니다. 실제 보안 경계는 실행 환경의 권한 제어 계층이 담당합니다.",
    limits: [
      "패턴 매칭은 의도적인 난독화나 인식하지 못하는 자격 증명 형태를 놓칠 수 있습니다.",
      "차단 대상 명령 형태가 들어 있는 일반 문장도 가드를 작동시킬 수 있습니다.",
      "출력 마스킹은 명령 실행 후에 동작하므로 원본 값이 터미널 기록이나 파일에 이미 남을 수 있습니다.",
    ],
  },
  review: {
    eyebrow: "AI 보조 검토",
    title: "필요한 도구만 고르도록 AI에 검토를 요청하세요.",
    intro:
      "현재 환경을 알고 있는 AI에 아래 프롬프트를 전달하세요. 설정을 변경하기 전에 소스 근거와 최소한의 추천 조합을 요청합니다.",
    promptLabel: "검토 프롬프트",
    prompt: `제가 검토를 허용한 프로젝트와 범위 안에서 ${sourceRepositoryUrl}에 공개된 cc-agents-kit 저장소의 플러그인이 현재 환경에 적합한지 평가해 주세요.

1. 공개 README, 마켓플레이스 및 플러그인 매니페스트, 훅 정의, 스킬 파일을 읽어 주세요.
2. 이번 검토를 위해 제가 허용한 로컬 도구와 설정만 확인해 주세요.
3. 각 플러그인을 현재 환경의 도구, 스킬, 훅, 권한, 의존성과 비교해 주세요.
4. 적합성, 중복 기능, 운영 위험을 식별하고, 각 판단의 공개 소스 파일 경로를 제시해 주세요.
5. 필요한 개별 스킬과 훅을 평가해 주세요. 스킬 하나가 유용하다는 이유만으로 플러그인 전체를 추천하지 마세요.
6. 묶음 설치와 일부 기능의 적용을 구분하고, 어떤 적용 방법이 실제로 지원되는지 확인해 주세요. 분명한 이점이 없다면 설치하지 않는 방향을 추천해 주세요.

비밀 정보를 검토 내용에 붙여 넣거나 저장소의 명령을 자동으로 실행하지 마세요. 제가 명시적으로 승인하기 전에는 플러그인을 설치하거나 설정을 변경하지 마세요.`,
    note: "이 프롬프트는 분석만 요청합니다. 변경을 승인하기 전에 제시된 근거를 직접 확인하세요.",
    annotation: ["읽기", "비교", "결정"],
  },
  faq: {
    eyebrow: "자주 묻는 질문",
    title: "마켓플레이스를 추가하기 전에 확인하세요.",
    items: [
      {
        question: "세 가지 플러그인을 모두 설치해야 하나요?",
        answer:
          "아닙니다. 각 플러그인은 의도적으로 분리되어 있습니다. 현재 워크플로의 문제를 해결하는 플러그인만 설치하세요.",
      },
      {
        question: "guard-hooks는 보안 샌드박스인가요?",
        answer:
          "아닙니다. guard-hooks는 알려진 실수 유형을 패턴으로 확인합니다. Claude Code의 권한과 운영체제의 제어 기능이 실제 보안 경계를 담당합니다.",
      },
      {
        question:
          "업데이트한 뒤에 세션을 다시 시작해야 하는 이유는 무엇인가요?",
        answer:
          "Claude Code는 세션을 시작할 때 훅을 읽습니다. 플러그인 업데이트 명령이 끝나면 열려 있는 세션을 다시 시작하세요.",
      },
      {
        question: "구현 내용을 어디에서 확인할 수 있나요?",
        answer:
          "공개 GitHub 저장소에서 README, 마켓플레이스 메타데이터, 플러그인 매니페스트, 훅 정의, 스킬 파일, 테스트, 라이선스 정보를 확인할 수 있습니다.",
      },
    ],
  },
  footer: {
    line: "신중한 Claude Code 워크플로를 위한 집중형 도구 모음입니다.",
    release: `공개 릴리스 ${release.version}`,
    personalSite: "donminzzi.kr",
    github: "GitHub 프로필",
    license: "Apache-2.0 라이선스",
    credits: "크레딧",
    about: "소개",
    contact: "연락처",
    privacy: "개인정보 처리 방침",
  },
}

const contentByLocale = { en, ko } as const

export const siteMeta = {
  en: en.meta,
  ko: ko.meta,
} satisfies Record<Locale, { title: string; description: string }>

export function getContent(locale: Locale): SiteContent {
  return contentByLocale[locale]
}

export function getMarkdown(locale: Locale): string {
  const content = getContent(locale)
  const pluginSections = content.plugins
    .map(
      (plugin) => `## ${plugin.name}

${plugin.description}

${content.explorer.problems[plugin.id].summary}

${content.explorer.problems[plugin.id].overlap}

${plugin.contents
  .map((id) => {
    const example = toolExamples[locale][id]
    if (!example) throw new Error(`Missing tool example: ${locale}/${id}`)
    return `### ${id}

${example.title}

${content.explorer.before}: ${example.trigger}

${content.explorer.after}: ${example.result}

${example.mechanism}

[${content.explorer.source}](${toolSourceUrl(plugin.id, id)})`
  })
  .join("\n\n")}

- ${content.catalogue.fitLabel}: ${plugin.idealFor}
- ${plugin.contentsLabel}: ${plugin.contents.map((item) => `\`${item}\``).join(", ")}

\`\`\`plaintext
${installCommand(plugin.id)}
\`\`\``
    )
    .join("\n\n")

  const requirementRows = content.requirements.items
    .map((item) => `| \`${item.name}\` | ${item.kind} | ${item.role} |`)
    .join("\n")

  const faqSections = content.faq.items
    .map((item) => `### ${item.question}\n\n${item.answer}`)
    .join("\n\n")

  const updateSections = content.plugins
    .map(
      (plugin) => `### ${plugin.name}

\`\`\`bash
${upgradeCommand(plugin.id)}
\`\`\``
    )
    .join("\n\n")

  const [toolHeader, statusHeader, roleHeader] =
    content.requirements.tableHeaders

  return `# cc-agents-kit

${content.hero.body}

[${content.nav.source} · ${release.sha}](${sourceRepositoryUrl}/tree/${release.sha}) · [${content.footer.license}](${sourceRepositoryUrl}/blob/${release.sha}/LICENSE) · [${content.footer.credits}](${sourceRepositoryUrl}/blob/${release.sha}/CREDITS.md)

${content.hero.stats.map((stat) => `- ${stat.value} ${stat.label}`).join("\n")}

${pluginSections}

## ${content.installation.title}

${content.installation.intro}

${content.installation.stance}

\`\`\`plaintext
${marketplaceCommand}
\`\`\`

${content.plugins
  .map(
    (plugin) => `\`\`\`plaintext
${installCommand(plugin.id)}
\`\`\``
  )
  .join("\n\n")}

### ${content.installation.upgradeTitle}

${content.installation.upgradeBody}

${updateSections}

${content.installation.restartNote}

## ${content.requirements.title}

${content.requirements.intro}

| ${toolHeader} | ${statusHeader} | ${roleHeader} |
| --- | --- | --- |
${requirementRows}

### ${content.requirements.limitsTitle}

${content.requirements.limitsIntro}

${content.requirements.limits.map((item) => `- ${item}`).join("\n")}

## ${content.review.title}

${content.review.intro}

\`\`\`text
${content.review.prompt}
\`\`\`

## ${content.faq.title}

${faqSections}
`
}
