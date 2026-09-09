import type { Locale } from "./content"

// Owner contact details shown on the trust pages. Supplied by the operator on 2026-09-09.
const owner = {
  name: "Dongmin Yu",
  koreanName: "유동민",
  alias: "Andrew",
  email: "ydm2790@gmail.com",
  website: "https://www.donminzzi.kr",
  github: "https://github.com/AndrewDongminYoo",
} as const

type PageId = "about" | "contact" | "privacy"

export type SitePage = {
  id: PageId
  title: string
  description: string
  sections: readonly { heading: string; paragraphs: readonly string[] }[]
}

const en: readonly SitePage[] = [
  {
    id: "about",
    title: "About cc-agents-kit",
    description:
      "Who maintains cc-agents-kit, what the plugins are for, and how this site is built.",
    sections: [
      {
        heading: "What this is",
        paragraphs: [
          "cc-agents-kit is a small marketplace of plugins for Claude Code. It contains three plugins with separate jobs: guard-hooks blocks common command mistakes before they run, context-handoff carries decisions and unfinished work into the next session, and repo-gate prepares commits and works through repository checks.",
          "This site is the documentation for those plugins. It explains what each plugin does, what it requires, and where it stops, so that a developer can decide whether to install any of it. The product facts on this site are pinned to one public revision of the source repository, and every claim links back to that revision.",
        ],
      },
      {
        heading: "Who maintains it",
        paragraphs: [
          `The plugins and this site are written and maintained by ${owner.name} (${owner.koreanName}, also known as ${owner.alias}), a mobile developer working mainly in Flutter and React Native who also builds developer tooling for AI coding agents. The source code is published under the GitHub account AndrewDongminYoo.`,
          `The plugin source is licensed under Apache-2.0, with adapted parts that keep their original MIT license. The credits file in the repository lists those parts and their authors.`,
        ],
      },
      {
        heading: "How this site is built",
        paragraphs: [
          "The site is a static build. Both language versions are rendered to HTML at build time, and every page also exists as Markdown so that agents can read the same content without the layout. There is no account system, no database, and no tracking script.",
          "The website source is public. If something on this site is wrong or out of date compared with the plugin source, the fastest fix is an issue or a pull request on the website repository.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    description: "How to reach the maintainer of cc-agents-kit.",
    sections: [
      {
        heading: "Maintainer",
        paragraphs: [
          `${owner.name} (${owner.koreanName}, also known as ${owner.alias}) maintains cc-agents-kit and this documentation site.`,
          `Email: ${owner.email}`,
          `Website: ${owner.website}`,
          `GitHub: ${owner.github}`,
        ],
      },
      {
        heading: "What to send where",
        paragraphs: [
          "For a bug in a hook or a skill, a wrong claim on this site, or a feature request, open an issue on the relevant GitHub repository. Issues are public and easy to reference from a pull request, so they are the best place for anything that another user might also hit.",
          "For anything that should not be public, such as a security concern in a guard hook or a question about licensing, send an email. Include the plugin name, the version you installed, and the Claude Code version if the report is about behavior.",
          "There is no support contract or response time guarantee. This is a personal open-source project, and replies come as time allows.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    description:
      "What this documentation site and the cc-agents-kit plugins do with your data.",
    sections: [
      {
        heading: "This website",
        paragraphs: [
          "This site is a static set of HTML and Markdown files. It has no sign-up, no comment system, no contact form, and no analytics or advertising script. It sets no cookies of its own and does not store anything in your browser except what your browser caches on its own.",
          "The site is hosted on Vercel. Like any web host, Vercel receives your IP address and request headers in order to serve pages and may keep standard access logs. The maintainer does not export, sell, or combine those logs with other data. Vercel's own privacy policy governs how long it keeps them.",
          "The copy buttons on this site use your browser's clipboard API. They write only the command shown next to the button and never read the clipboard.",
        ],
      },
      {
        heading: "The plugins",
        paragraphs: [
          "The cc-agents-kit plugins run locally inside Claude Code. They do not call any server operated by the maintainer, do not collect telemetry, and do not send your code, commands, or file contents anywhere. The guard hooks inspect tool calls on your machine and decide whether to block them; the skills are instructions that Claude Code reads.",
          "One hook masks credential-shaped strings in command output so that they are less likely to reach a transcript. That masking is best-effort and runs after the command, so a secret can still reach a terminal scrollback or a file that the command wrote. Treat it as a reduction, not a guarantee.",
          "When you ask Claude Code to install or run any of these plugins, the request and its output go through Anthropic's service under Anthropic's terms, exactly as any other Claude Code interaction does. This project has no access to that traffic.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [
          `If you have a question about this policy or believe the site or a plugin handles data in a way that this page does not describe, email ${owner.email}.`,
        ],
      },
    ],
  },
]

const ko: readonly SitePage[] = [
  {
    id: "about",
    title: "cc-agents-kit 소개",
    description:
      "cc-agents-kit을 누가 관리하는지, 플러그인이 어떤 용도인지, 이 사이트가 어떻게 만들어졌는지 설명합니다.",
    sections: [
      {
        heading: "무엇인가요",
        paragraphs: [
          "cc-agents-kit은 Claude Code용 플러그인을 모아 둔 작은 마켓플레이스입니다. 역할이 다른 플러그인 세 개로 구성됩니다. guard-hooks는 흔한 명령 실수를 실행 전에 차단하고, context-handoff는 결정 사항과 남은 작업을 다음 세션으로 넘기며, repo-gate는 커밋을 준비하고 저장소 검사를 처리합니다.",
          "이 사이트는 그 플러그인들의 문서입니다. 각 플러그인이 무엇을 하고, 무엇을 요구하며, 어디까지만 책임지는지 설명하여 개발자가 설치 여부를 판단할 수 있게 합니다. 사이트의 제품 정보는 소스 저장소의 공개 리비전 하나에 고정되어 있고, 모든 설명은 그 리비전으로 연결됩니다.",
        ],
      },
      {
        heading: "누가 관리하나요",
        paragraphs: [
          `플러그인과 이 사이트는 ${owner.koreanName}(${owner.name}, ${owner.alias})이 작성하고 관리합니다. Flutter와 React Native를 주로 다루는 모바일 개발자이며, AI 코딩 에이전트를 위한 개발 도구도 만들고 있습니다. 소스 코드는 GitHub 계정 AndrewDongminYoo에 공개되어 있습니다.`,
          "플러그인 소스는 Apache-2.0 라이선스를 따르며, 일부 가져온 부분은 원래의 MIT 라이선스를 유지합니다. 저장소의 크레딧 파일에 해당 부분과 원작자가 정리되어 있습니다.",
        ],
      },
      {
        heading: "이 사이트는 어떻게 만들어졌나요",
        paragraphs: [
          "이 사이트는 정적 빌드입니다. 두 언어 버전이 빌드 시점에 HTML로 렌더링되고, 모든 페이지는 Markdown으로도 제공되어 에이전트가 레이아웃 없이 같은 내용을 읽을 수 있습니다. 계정 시스템, 데이터베이스, 추적 스크립트는 없습니다.",
          "웹사이트 소스는 공개되어 있습니다. 사이트 내용이 플러그인 소스와 다르거나 오래되었다면, 웹사이트 저장소에 이슈나 풀 리퀘스트를 올리는 것이 가장 빠른 해결 방법입니다.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "연락처",
    description: "cc-agents-kit 관리자에게 연락하는 방법을 안내합니다.",
    sections: [
      {
        heading: "관리자",
        paragraphs: [
          `${owner.koreanName}(${owner.name}, ${owner.alias})이 cc-agents-kit과 이 문서 사이트를 관리합니다.`,
          `이메일: ${owner.email}`,
          `웹사이트: ${owner.website}`,
          `GitHub: ${owner.github}`,
        ],
      },
      {
        heading: "어디로 보내야 하나요",
        paragraphs: [
          "훅이나 스킬의 버그, 이 사이트의 잘못된 설명, 기능 요청은 해당 GitHub 저장소에 이슈로 남겨 주세요. 이슈는 공개되어 있고 풀 리퀘스트에서 참조하기 쉬우므로, 다른 사용자도 겪을 수 있는 문제를 알리기에 가장 적합합니다.",
          "가드 훅의 보안 문제나 라이선스 문의처럼 공개하기 어려운 내용은 이메일로 보내 주세요. 동작에 관한 제보라면 플러그인 이름, 설치한 버전, Claude Code 버전을 함께 적어 주세요.",
          "지원 계약이나 응답 시간 보장은 없습니다. 개인이 운영하는 오픈소스 프로젝트이므로 답변은 시간이 허락하는 대로 드립니다.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "개인정보 처리 방침",
    description:
      "이 문서 사이트와 cc-agents-kit 플러그인이 사용자 데이터를 어떻게 다루는지 설명합니다.",
    sections: [
      {
        heading: "이 웹사이트",
        paragraphs: [
          "이 사이트는 정적 HTML과 Markdown 파일로만 구성됩니다. 회원 가입, 댓글, 문의 양식, 분석 스크립트, 광고 스크립트가 없습니다. 사이트 자체는 쿠키를 설정하지 않으며, 브라우저가 스스로 캐시하는 것 외에는 브라우저에 아무것도 저장하지 않습니다.",
          "사이트는 Vercel에 호스팅됩니다. 다른 웹 호스트와 마찬가지로 Vercel은 페이지를 제공하기 위해 IP 주소와 요청 헤더를 받으며, 일반적인 접근 로그를 보관할 수 있습니다. 관리자는 그 로그를 내보내거나 판매하거나 다른 데이터와 결합하지 않습니다. 보관 기간은 Vercel의 개인정보 처리 방침을 따릅니다.",
          "사이트의 복사 버튼은 브라우저의 클립보드 API를 사용합니다. 버튼 옆에 표시된 명령만 클립보드에 기록하며, 클립보드를 읽지는 않습니다.",
        ],
      },
      {
        heading: "플러그인",
        paragraphs: [
          "cc-agents-kit 플러그인은 Claude Code 안에서 로컬로 실행됩니다. 관리자가 운영하는 서버를 호출하지 않고, 사용 통계를 수집하지 않으며, 코드, 명령, 파일 내용을 어디에도 보내지 않습니다. 가드 훅은 사용자의 컴퓨터에서 도구 호출을 검사하여 차단 여부를 결정하고, 스킬은 Claude Code가 읽는 지침입니다.",
          "훅 하나는 명령 출력에서 자격 증명 형태의 문자열을 가려 대화 기록에 남을 가능성을 줄입니다. 이 마스킹은 최선의 노력이며 명령이 끝난 뒤에 실행되므로, 비밀 값이 터미널 스크롤백이나 명령이 기록한 파일에는 남을 수 있습니다. 보장이 아니라 위험을 줄이는 장치로 이해해 주세요.",
          "Claude Code에 플러그인 설치나 실행을 요청하면, 그 요청과 출력은 다른 모든 Claude Code 상호작용과 동일하게 Anthropic의 약관에 따라 Anthropic 서비스를 거칩니다. 이 프로젝트는 그 트래픽에 접근할 수 없습니다.",
        ],
      },
      {
        heading: "문의",
        paragraphs: [
          `이 방침에 관한 질문이 있거나, 사이트나 플러그인이 이 페이지에 설명되지 않은 방식으로 데이터를 다룬다고 생각되면 ${owner.email}로 이메일을 보내 주세요.`,
        ],
      },
    ],
  },
]

const pagesByLocale = { en, ko } as const

export function getPages(locale: Locale): readonly SitePage[] {
  return pagesByLocale[locale]
}

export function getPageMarkdown(page: SitePage): string {
  const sections = page.sections
    .map(
      (section) => `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}`
    )
    .join("\n\n")
  return `# ${page.title}\n\n${page.description}\n\n${sections}\n`
}
