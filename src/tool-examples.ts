import type { Locale } from "./content"

export type ToolExample = {
  title: string
  trigger: string
  result: string
  mechanism: string
}

export const toolExamples: Record<Locale, Record<string, ToolExample>> = {
  en: {
    "dangerous-command-guard": {
      title: "Catch destructive command patterns before they run.",
      trigger:
        "Claude Code attempts to delete the home directory recursively or pipe a download into a shell.",
      result: "The hook blocks the recognized command before execution.",
      mechanism:
        "The check runs at the tool-call boundary. Pattern matching can be bypassed by deliberate obfuscation.",
    },
    "zsh-quoting-guard": {
      title: "Catch quoting mistakes before zsh changes the meaning.",
      trigger: "A find command contains an unquoted filename glob.",
      result: "The hook blocks the command and asks for the glob to be quoted.",
      mechanism:
        "It checks known zsh quoting traps. Quoted-heredoc handling deliberately stops scanning later content.",
    },
    "pathless-rewriter-guard": {
      title: "Give formatters an explicit boundary.",
      trigger:
        "Claude Code prepares a formatter write command without a target path.",
      result:
        "The hook blocks execution until a path or quoted glob is supplied.",
      mechanism:
        "The check covers a known list of rewriters. Aliases and package scripts can hide commands from it.",
    },
    "staged-secret-guard": {
      title: "Check what is about to enter a commit.",
      trigger:
        "Staged additions contain a recognized credential pattern when a commit is requested.",
      result:
        "The hook blocks the commit so the staged content can be corrected.",
      mechanism:
        "It scans added commit content for high-confidence patterns, not every possible secret.",
    },
    "secrets-path-guard": {
      title: "Keep live secret files out of tool access.",
      trigger: "Claude Code requests access to a live credential file.",
      result:
        "The hook blocks a recognized secret path while allowing supported example files.",
      mechanism:
        "Literal paths in prose can also trigger this pattern matcher.",
    },
    "lockfile-drift-check": {
      title: "Notice a manifest edit that leaves the lockfile behind.",
      trigger:
        "package.json changes without its sibling lockfile being regenerated.",
      result:
        "A warning is added after the edit to flag possible lockfile drift.",
      mechanism:
        "This is a post-edit reminder. It does not block the edit or regenerate the lockfile.",
    },
    "shellcheck-on-edit": {
      title: "See shell lint findings while editing.",
      trigger:
        "A shell script is edited and contains an issue recognized by ShellCheck.",
      result: "ShellCheck findings are attached to the tool result.",
      mechanism:
        "The hook uses the installed ShellCheck binary. It does nothing when ShellCheck is unavailable.",
    },
    "output-secret-mask": {
      title: "Mask recognized tokens in Bash output.",
      trigger:
        "A Bash command prints a credential pattern recognized by the scanner.",
      result:
        "The recognized value becomes [REDACTED] before entering the model transcript.",
      mechanism:
        "It runs after execution and requires gitleaks. Only recognized patterns in Bash output under 2 MB are covered.",
    },
    handoff: {
      title: "Start the next session with the decisions already made.",
      trigger:
        "Work needs to move to a fresh session at a clear stopping point.",
      result:
        "The skill prints a self-contained brief in chat for you to copy into the next session.",
      mechanism:
        "You carry the brief into the next session. Summaries lose detail, so use a handoff when context must cross a boundary.",
    },
    "session-export": {
      title: "Turn a session into something you can read later.",
      trigger:
        "You need to review a local Claude conversation without every tool response getting in the way.",
      result:
        "The session becomes Markdown with tool calls collapsed or omitted.",
      mechanism:
        "The export stays local. Default exports truncate individual tool results; choose options for the evidence you need.",
    },
    "log-it": {
      title: "Put a lasting finding where it will be read again.",
      trigger:
        "You discover a project convention that future sessions should know.",
      result: "The finding is routed to the relevant memory store and index.",
      mechanism:
        "The destination follows the intended audience. Memory does not replace repository documentation or an unfinished-work handoff.",
    },
    wayfinder: {
      title: "Find the next decision in a large, unclear task.",
      trigger:
        "A feature spans several sessions, but its specification is not yet clear.",
      result:
        "A map under docs/plans/ breaks the uncertainty into decision tickets.",
      mechanism:
        "Resolve one decision ticket at a time. The skill plans work and stops before implementation.",
    },
    "context-budget": {
      title: "See what may be consuming your context budget.",
      trigger: "Your setup has accumulated many skills and MCP tools.",
      result: "An estimate ranks context overhead and possible reductions.",
      mechanism:
        "These are heuristic estimates for prioritizing inspection, not live runtime measurements.",
    },
    "config-gc": {
      title: "Review stale configuration before removing it.",
      trigger: "An old hook or configuration entry may no longer be used.",
      result:
        "The skill presents evidence and asks for an individual decision before reversible cleanup.",
      mechanism:
        "Removal requires approval for each item. It does not bulk-delete configuration on its own.",
    },
    "semantic-commit": {
      title: "Make a mixed diff easier to review.",
      trigger:
        "A feature change and unrelated documentation edits are mixed together.",
      result:
        "The skill inspects staged and unstaged work and groups changes into Conventional Commits.",
      mechanism:
        "Existing staged work is preserved. Creating commits still depends on the authority you have granted.",
    },
    "setup-trunk": {
      title: "Choose repository checks from the actual project.",
      trigger:
        "A repository needs a quality gate, but its stack and existing violations vary.",
      result:
        "The skill inspects the repository before proposing scoped Trunk checks.",
      mechanism:
        "It uses repository evidence rather than assuming one language or an initially clean codebase.",
    },
    "ci-babysit": {
      title: "Find out why CI failed before trying to fix it.",
      trigger: "A pushed branch fails a lockfile check in CI.",
      result:
        "The skill reads the logs and classifies the failure before proposing a repair.",
      mechanism:
        "Watching is read-only. Reruns, repairs, commits, and pushes require explicit authority.",
    },
    "fix-osv-vulnerabilities": {
      title: "Trace a vulnerability to the dependency that brings it in.",
      trigger:
        "OSV reports a vulnerable transitive dependency with an applicable patched version.",
      result:
        "The advisory and dependency path guide the fix, followed by verification of the resolved graph.",
      mechanism:
        "Overrides are scoped by installed major where needed. Suppression requires reachability evidence and explicit approval.",
    },
    "cspell-triage": {
      title: "Fix spelling reports without filling a dictionary with mistakes.",
      trigger: "CSpell flags a known ecosystem term such as pytest.",
      result:
        "The skill classifies the finding, enables the appropriate dictionary, and reruns the project gate.",
      mechanism:
        "It distinguishes typos, ecosystem terms, and project vocabulary instead of adding every unknown token to a dictionary.",
    },
  },
  ko: {
    "dangerous-command-guard": {
      title: "되돌리기 어려운 명령을 실행 직전에 점검합니다.",
      trigger:
        "Claude Code가 홈 디렉터리를 재귀 삭제하거나, 다운로드한 내용을 셸로 바로 실행하려고 합니다.",
      result: "알려진 위험 명령 형태에 해당하면 실행 전에 차단합니다.",
      mechanism:
        "주의사항을 기억하는 데만 의존하지 않고 도구 호출 시점에 검사합니다. 패턴 검사이므로 의도적으로 우회한 명령까지 막지는 못합니다.",
    },
    "zsh-quoting-guard": {
      title: "따옴표 실수로 명령의 뜻이 바뀌는 일을 점검합니다.",
      trigger: "find 명령에 따옴표 없는 파일명 글로브가 들어갑니다.",
      result: "명령을 차단하고 글로브를 따옴표로 감싸도록 안내합니다.",
      mechanism:
        "알려진 zsh 인용 오류를 검사합니다. 따옴표로 감싼 heredoc을 만나면 이후 내용의 검사는 중단합니다.",
    },
    "pathless-rewriter-guard": {
      title: "포맷터가 바꿀 파일의 범위를 먼저 정합니다.",
      trigger:
        "Claude Code가 대상 경로 없이 포맷터의 파일 쓰기 명령을 실행하려고 합니다.",
      result: "파일 경로나 따옴표로 감싼 글로브를 지정할 때까지 차단합니다.",
      mechanism:
        "등록된 재작성 명령을 점검합니다. 별칭이나 패키지 스크립트 안에 숨은 명령까지 모두 추적하지는 않습니다.",
    },
    "staged-secret-guard": {
      title: "커밋에 들어갈 비밀 정보 패턴을 확인합니다.",
      trigger:
        "스테이징된 추가 내용에 알려진 자격 증명 패턴이 있는 상태에서 커밋을 요청합니다.",
      result: "커밋을 차단해 스테이징된 내용을 수정할 기회를 줍니다.",
      mechanism:
        "커밋에 추가될 내용에서 확실한 패턴을 찾습니다. 모든 형태의 비밀 정보를 탐지하는 범용 스캐너는 아닙니다.",
    },
    "secrets-path-guard": {
      title: "실제 비밀 정보 파일에 대한 도구 접근을 막습니다.",
      trigger: "Claude Code가 실제 자격 증명을 담은 파일에 접근하려고 합니다.",
      result:
        "알려진 비밀 정보 경로의 접근은 차단하고, 지원하는 예시 파일은 읽을 수 있게 둡니다.",
      mechanism:
        "비밀 정보 경로를 패턴으로 검사합니다. 설명문에 적힌 경로도 검사에 걸릴 수 있습니다.",
    },
    "lockfile-drift-check": {
      title: "의존성 목록만 바꾸고 잠금 파일을 놓쳤는지 알립니다.",
      trigger:
        "package.json을 수정한 뒤 해당 잠금 파일을 다시 생성하지 않았습니다.",
      result:
        "편집 후 잠금 파일이 함께 갱신됐는지 확인하라는 경고를 추가합니다.",
      mechanism:
        "편집 후 알려주는 점검입니다. 편집을 차단하거나 잠금 파일을 대신 생성하지는 않습니다.",
    },
    "shellcheck-on-edit": {
      title: "셸 스크립트를 고친 직후 검사 결과를 받습니다.",
      trigger:
        "셸 파일을 편집했고, ShellCheck가 발견할 수 있는 문제가 들어 있습니다.",
      result: "도구 결과에 ShellCheck의 진단을 덧붙입니다.",
      mechanism:
        "설치된 ShellCheck를 사용합니다. ShellCheck가 없으면 검사를 실행하지 않습니다.",
    },
    "output-secret-mask": {
      title: "Bash 출력에서 인식한 토큰을 가립니다.",
      trigger:
        "Bash 명령의 출력에 스캐너가 인식하는 자격 증명 패턴이 포함됩니다.",
      result:
        "모델의 대화 기록으로 전달되기 전에 해당 값을 [REDACTED]로 바꿉니다.",
      mechanism:
        "명령 실행 후 작동하며 gitleaks가 필요합니다. 2MB 미만 Bash 출력의 알려진 패턴을 대상으로 하므로 모든 유출을 막는 기능은 아닙니다.",
    },
    handoff: {
      title: "이미 내린 결정을 다음 세션에서 다시 설명하지 않도록 합니다.",
      trigger: "작업을 잠시 멈추고 새 세션에서 이어가야 합니다.",
      result:
        "이전 맥락과 다음 작업을 정리한 요약을 채팅에 출력합니다. 다음 세션에 복사해 사용할 수 있습니다.",
      mechanism:
        "출력된 요약을 다음 세션으로 가져가 사용합니다. 요약에는 정보 손실이 있으므로 세션 경계를 넘어야 할 때 사용합니다.",
    },
    "session-export": {
      title: "지난 대화를 나중에도 읽기 편한 기록으로 바꿉니다.",
      trigger: "로컬 Claude 대화를 돌아보고 싶지만 도구 출력이 너무 많습니다.",
      result: "도구 호출을 접거나 제외한 Markdown으로 대화를 내보냅니다.",
      mechanism:
        "내보낸 데이터는 로컬에 남습니다. 기본 설정은 개별 도구 결과를 줄여 담으므로 필요한 근거에 맞춰 옵션을 선택해야 합니다.",
    },
    "log-it": {
      title: "다음에도 필요한 발견을 다시 읽힐 곳에 남깁니다.",
      trigger: "이 프로젝트에서 계속 지켜야 할 관례를 발견했습니다.",
      result: "그 내용을 사용할 대상에 맞는 메모리 저장소와 색인에 기록합니다.",
      mechanism:
        "누가 읽을 정보인지에 따라 저장 위치를 고릅니다. 저장소 문서나 미완료 작업의 인수인계를 대신하는 기능은 아닙니다.",
    },
    wayfinder: {
      title: "큰 작업에서 다음에 결정할 문제를 찾습니다.",
      trigger: "여러 세션에 걸칠 기능인데 아직 명세가 분명하지 않습니다.",
      result:
        "docs/plans/ 아래에 작업 지도를 만들고 불확실한 부분을 결정 항목으로 나눕니다.",
      mechanism:
        "한 번에 하나의 결정 항목을 해결하도록 돕습니다. 계획을 세우는 스킬이며 구현 전에는 멈춥니다.",
    },
    "context-budget": {
      title: "컨텍스트를 차지하는 설정부터 살펴봅니다.",
      trigger: "설치한 스킬과 MCP 도구가 계속 늘어났습니다.",
      result:
        "예상 컨텍스트 사용량과 줄일 수 있는 항목을 우선순위로 정리합니다.",
      mechanism:
        "어디부터 점검할지 판단하는 추정치입니다. 실행 중인 세션의 실제 사용량을 측정한 수치는 아닙니다.",
    },
    "config-gc": {
      title: "오래된 설정을 근거를 확인한 뒤 정리합니다.",
      trigger: "예전에 추가한 훅이나 설정을 아직 쓰는지 불분명합니다.",
      result:
        "사용 여부의 근거를 보여주고, 항목별 결정을 받은 뒤 되돌릴 수 있게 정리합니다.",
      mechanism:
        "각 항목의 삭제에는 승인이 필요합니다. 설정을 한꺼번에 자동 삭제하지 않습니다.",
    },
    "semantic-commit": {
      title: "뒤섞인 변경을 리뷰하기 좋은 커밋으로 나눕니다.",
      trigger: "기능 수정과 별개의 문서 변경이 한 diff에 섞여 있습니다.",
      result:
        "스테이징 여부를 함께 확인하고 목적별 Conventional Commit으로 묶습니다.",
      mechanism:
        "기존에 스테이징된 작업을 보존하며 진행합니다. 실제 커밋 생성은 부여한 권한 범위 안에서 이뤄집니다.",
    },
    "setup-trunk": {
      title: "프로젝트를 보고 필요한 검사부터 구성합니다.",
      trigger:
        "품질 검사를 도입하려는데 기술 스택과 기존 오류가 저장소마다 다릅니다.",
      result: "저장소를 조사한 뒤 적용할 Trunk 검사를 범위를 정해 제안합니다.",
      mechanism:
        "한 언어나 오류가 없는 초기 상태를 가정하지 않고, 실제 프로젝트의 상태를 기준으로 구성합니다.",
    },
    "ci-babysit": {
      title: "CI가 왜 실패했는지부터 확인합니다.",
      trigger: "푸시한 브랜치의 CI에서 잠금 파일 검사가 실패했습니다.",
      result: "로그를 읽고 실패 유형을 분류한 뒤 수정 방향을 제안합니다.",
      mechanism:
        "모니터링은 읽기 전용입니다. 재실행, 수정, 커밋, 푸시에는 각각 명시적인 권한이 필요합니다.",
    },
    "fix-osv-vulnerabilities": {
      title: "취약한 패키지가 어디서 들어왔는지 따라갑니다.",
      trigger:
        "OSV가 전이 의존성의 취약점을 보고했고 적용 가능한 패치 버전이 있습니다.",
      result:
        "보안 공지와 의존성 경로를 확인해 수정하고, 실제로 해결된 의존성 구성을 검증합니다.",
      mechanism:
        "필요한 override는 설치된 메이저 버전별로 범위를 정합니다. 보고 제외에는 도달 가능성 근거와 명시적인 승인이 필요합니다.",
    },
    "cspell-triage": {
      title: "맞춤법 경고를 무조건 사전에 넣지 않고 분류합니다.",
      trigger:
        "CSpell이 pytest 같은 생태계 용어를 알 수 없는 단어로 보고합니다.",
      result:
        "단어 유형을 확인하고 적절한 사전을 활성화한 뒤 프로젝트 검사를 다시 실행합니다.",
      mechanism:
        "오타, 생태계 용어, 프로젝트 고유 어휘를 구분합니다. 모든 경고를 사용자 사전에 추가해 숨기지 않습니다.",
    },
  },
}
