import { useEffect, useId, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  GitFork,
} from "lucide-react"

import {
  installCommand,
  marketplaceCommand,
  release,
  sourceRepositoryUrl,
  type Locale,
  type PluginId,
  type SiteContent,
  upgradeCommand,
  toolSourceUrl,
} from "@/content"

import { toolExamples } from "@/tool-examples"

type SharedProps = {
  content: SiteContent
  locale: Locale
}

function SectionIntro({
  eyebrow,
  title,
  body,
  inverse = false,
}: {
  eyebrow: string
  title: string
  body: string
  inverse?: boolean
}) {
  return (
    <div
      className={
        inverse ? "section-intro section-intro--inverse" : "section-intro"
      }
    >
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-intro__grid">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </div>
  )
}

type CopyState = "idle" | "copied" | "failed"

function useClipboardCopy(code: string) {
  const [copyState, setCopyState] = useState<CopyState>("idle")

  async function copyToClipboard() {
    let timeoutId: number | undefined

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable")
      }
      await Promise.race([
        navigator.clipboard.writeText(code),
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error("Clipboard request timed out")),
            1500
          )
        }),
      ])
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }

  return { copyState, copyToClipboard }
}

function CopyIcon() {
  return (
    <span className="copy-button__icon" aria-hidden="true">
      <Clipboard />
      <Check />
    </span>
  )
}

function CopyBlock({
  code,
  label,
  copy,
  copied,
  copyFailed,
  manualCopy,
  multiline = false,
  inverse = false,
}: {
  code: string
  label: string
  copy: string
  copied: string
  copyFailed: string
  manualCopy: string
  multiline?: boolean
  inverse?: boolean
}) {
  const { copyState, copyToClipboard } = useClipboardCopy(code)
  const fallbackRef = useRef<HTMLTextAreaElement>(null)
  const statusId = useId()

  useEffect(() => {
    if (copyState === "failed") {
      fallbackRef.current?.focus()
      fallbackRef.current?.select()
    }
  }, [copyState])

  const status =
    copyState === "copied" ? copied : copyState === "failed" ? copyFailed : ""

  return (
    <div
      className={[
        "copy-block",
        multiline ? "copy-block--multiline" : "",
        inverse ? "copy-block--inverse" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="copy-block__header">
        <span>{label}</span>
        <button
          type="button"
          className="copy-button"
          onClick={copyToClipboard}
          aria-describedby={statusId}
          aria-label={`${copy}: ${label}`}
          data-state={copyState}
        >
          <CopyIcon />
          {copyState === "copied" ? copied : copy}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      <p
        id={statusId}
        className={copyState === "idle" ? "sr-status" : "copy-status"}
        aria-live="polite"
      >
        {status}
      </p>
      {copyState === "failed" ? (
        <div className="copy-fallback">
          <label htmlFor={`${statusId}-fallback`}>{manualCopy}</label>
          <textarea
            id={`${statusId}-fallback`}
            ref={fallbackRef}
            readOnly
            value={code}
            rows={multiline ? 9 : 2}
          />
        </div>
      ) : null}
    </div>
  )
}

function MarketplaceCommand({ content }: Pick<SharedProps, "content">) {
  const { copyState, copyToClipboard } = useClipboardCopy(marketplaceCommand)
  const codeRef = useRef<HTMLElement>(null)
  const statusId = useId()

  useEffect(() => {
    // Without clipboard access, leave the command selected so it can be copied by hand.
    if (copyState === "failed" && codeRef.current) {
      window.getSelection()?.selectAllChildren(codeRef.current)
    }
  }, [copyState])

  const status =
    copyState === "copied"
      ? content.installation.copied
      : copyState === "failed"
        ? content.installation.copyFailed
        : ""

  return (
    <div className="command-pill" title={content.installation.marketplaceNote}>
      <code ref={codeRef}>{marketplaceCommand}</code>
      <button
        type="button"
        className="command-pill__copy"
        onClick={copyToClipboard}
        aria-describedby={statusId}
        aria-label={`${content.installation.copy}: ${content.installation.marketplaceLabel}`}
        data-state={copyState}
      >
        <CopyIcon />
      </button>
      <p id={statusId} className="sr-status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}

export function SiteHeader({ content, locale }: SharedProps) {
  const alternateLocale: Locale = locale === "en" ? "ko" : "en"
  const websiteSourceUrl = import.meta.env.VITE_SITE_REPO_URL?.trim()

  function preserveHashOnLocaleChange(
    event: React.MouseEvent<HTMLAnchorElement>
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !window.location.hash
    ) {
      return
    }
    event.preventDefault()
    window.location.href = `/${alternateLocale}/${window.location.hash}`
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {content.skipLink}
      </a>
      <header className="site-header">
        <a className="brand" href={`/${locale}/`} aria-label="cc-agents-kit">
          <span className="brand__mark" aria-hidden="true">
            cc
          </span>
          <span className="brand__text">
            <strong>cc-agents-kit</strong>
            <small>{content.brandNote}</small>
          </span>
        </a>
        <MarketplaceCommand content={content} />
        <div className="header-actions">
          <a
            className="language-link"
            href={`/${alternateLocale}/`}
            hrefLang={alternateLocale}
            onClick={preserveHashOnLocaleChange}
          >
            {content.alternateLanguage}
          </a>
          <details className="github-menu">
            <summary>
              <GitFork aria-hidden="true" />
              <span>{content.nav.github}</span>
              <ChevronDown aria-hidden="true" />
            </summary>
            <div className="github-menu__panel">
              <a href={sourceRepositoryUrl} target="_blank" rel="noreferrer">
                <span>
                  <strong>{content.nav.source}</strong>
                  <small>AndrewDongminYoo/cc-agents-kit</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
              {websiteSourceUrl ? (
                <a href={websiteSourceUrl} target="_blank" rel="noreferrer">
                  <span>
                    <strong>{content.nav.websiteSource}</strong>
                    <small>{websiteSourceUrl}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ) : (
                <span className="github-menu__pending" aria-disabled="true">
                  <span>
                    <strong>{content.nav.websiteSource}</strong>
                    <small>{content.nav.pending}</small>
                  </span>
                </span>
              )}
            </div>
          </details>
        </div>
      </header>
    </>
  )
}

export function Hero({ content }: Pick<SharedProps, "content">) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">Claude Code · cc-agents-kit</p>
        <h1 id="hero-title">
          <span>{content.hero.titleLead}</span>
          <em>{content.hero.titleAccent}</em>
        </h1>
        <p className="hero__body">{content.hero.body}</p>
      </div>
    </section>
  )
}

export function PluginCatalogue({
  content,
  locale,
  selectedPlugin,
  onSelect,
}: SharedProps & {
  selectedPlugin: PluginId
  onSelect: (plugin: PluginId) => void
}) {
  const plugin =
    content.plugins.find((item) => item.id === selectedPlugin) ??
    content.plugins[0]
  const [toolId, setToolId] = useState(plugin.contents[0])
  const activeTool = plugin.contents.includes(toolId)
    ? toolId
    : plugin.contents[0]
  const example = toolExamples[locale][activeTool]
  const problem = content.explorer.problems[plugin.id]

  return (
    <section id="plugins" className="explorer" aria-labelledby="explorer-title">
      <h2 id="explorer-title">{content.explorer.title}</h2>
      <div className="explorer__interactive">
        <fieldset className="problem-picker" aria-labelledby="explorer-title">
          {content.plugins.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedPlugin === item.id}
              aria-controls="tool-explorer"
              onClick={() => {
                onSelect(item.id)
                setToolId(item.contents[0])
              }}
            >
              <strong>{content.explorer.problems[item.id].title}</strong>
              <span>{item.name}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          ))}
        </fieldset>
        <div id="tool-explorer" className="tool-explorer">
          <div className="tool-explorer__heading">
            <p>{problem.summary}</p>
          </div>
          <fieldset
            className="tool-picker"
            aria-label={content.explorer.chooseTool}
          >
            {plugin.contents.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={activeTool === item}
                aria-controls="tool-detail"
                onClick={() => setToolId(item)}
              >
                {item}
              </button>
            ))}
          </fieldset>
          <output className="sr-status">{activeTool}</output>
          <article
            id="tool-detail"
            className="tool-detail"
            aria-labelledby="tool-title"
          >
            <div className="tool-detail__content">
              <p className="eyebrow">{content.explorer.example}</p>
              <h3 id="tool-title">{example.title}</h3>
              <div className="tool-example">
                <div className="tool-example__before">
                  <span>{content.explorer.before}</span>
                  <p>{example.trigger}</p>
                </div>
                <ArrowDown aria-hidden="true" />
                <div className="tool-example__after">
                  <span>{content.explorer.after}</span>
                  <p>{example.result}</p>
                </div>
              </div>
              <div className="tool-detail__explanation">
                <h4>{content.explorer.mechanism}</h4>
                <p>{example.mechanism}</p>
                <a
                  className="text-link"
                  href={toolSourceUrl(plugin.id, activeTool)}
                >
                  {content.explorer.source}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
          <aside className="tool-overlap">
            <strong>{content.explorer.overlap}</strong>
            <p>{problem.overlap}</p>
          </aside>
        </div>
      </div>
      <noscript>
        <style>{".explorer__interactive { display: none; }"}</style>
        <div className="explorer__fallback">
          <p>{content.explorer.fallback}</p>
          {content.plugins.map((item) => (
            <details key={item.id}>
              <summary>{item.name}</summary>
              {item.contents.map((id) => (
                <div key={id}>
                  <h3>{id}</h3>
                  <p>{toolExamples[locale][id].title}</p>
                  <p>{toolExamples[locale][id].trigger}</p>
                  <p>{toolExamples[locale][id].result}</p>
                  <p>{toolExamples[locale][id].mechanism}</p>
                </div>
              ))}
              <pre>
                <code>{installCommand(item.id)}</code>
              </pre>
            </details>
          ))}
        </div>
      </noscript>
    </section>
  )
}

export function Installation({
  content,
  selectedPlugin,
}: Pick<SharedProps, "content"> & {
  selectedPlugin: PluginId
}) {
  return (
    <section id="install" className="installation ruled-section">
      <SectionIntro
        eyebrow={content.installation.eyebrow}
        title={content.installation.title}
        body={content.installation.intro}
        inverse
      />
      <div className="installation__grid">
        <div className="installation__selector">
          <p className="minor-label">{content.installation.selectedLabel}</p>
          <strong className="installation__selected">{selectedPlugin}</strong>
          <p className="installation__stance">{content.installation.stance}</p>
          <Review content={content} />
        </div>
        <div className="installation__commands">
          <CopyBlock
            key={`install-${selectedPlugin}`}
            code={installCommand(selectedPlugin)}
            label={content.installation.pluginLabel}
            copy={content.installation.copy}
            copied={content.installation.copied}
            copyFailed={content.installation.copyFailed}
            manualCopy={content.installation.manualCopy}
            inverse
          />
        </div>
      </div>
      <div className="upgrade-note">
        <div>
          <p className="minor-label">{content.installation.upgradeTitle}</p>
          <p>{content.installation.upgradeBody}</p>
        </div>
        <CopyBlock
          key={`upgrade-${selectedPlugin}`}
          code={upgradeCommand(selectedPlugin)}
          label={content.installation.upgradeLabel}
          copy={content.installation.copy}
          copied={content.installation.copied}
          copyFailed={content.installation.copyFailed}
          manualCopy={content.installation.manualCopy}
          inverse
        />
      </div>
      <p className="restart-note">
        <span aria-hidden="true">↻</span>
        {content.installation.restartNote}
      </p>
    </section>
  )
}

export function Requirements({ content }: Pick<SharedProps, "content">) {
  return (
    <section className="requirements ruled-section">
      <div className="requirements__grid">
        <div className="requirements__scope">
          <p className="eyebrow">{content.requirements.eyebrow}</p>
          <h2>{content.requirements.title}</h2>
          <aside className="limits">
            <h3>{content.requirements.limitsTitle}</h3>
            <p>{content.requirements.limitsIntro}</p>
            <ul>
              {content.requirements.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </aside>
        </div>
        <div className="requirements__runtime">
          <h2>{content.requirements.toolsTitle}</h2>
          <p>{content.requirements.intro}</p>
          <dl className="requirements__list">
            {content.requirements.items.map((item) => (
              <div key={item.name}>
                <dt>
                  <code>{item.name}</code>
                  <span>{item.kind}</span>
                </dt>
                <dd>{item.role}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Review({ content }: Pick<SharedProps, "content">) {
  return (
    <details id="review" className="installation-review">
      <summary>{content.review.title}</summary>
      <p>{content.review.intro}</p>
      <CopyBlock
        code={content.review.prompt}
        label={content.review.promptLabel}
        copy={content.installation.copy}
        copied={content.installation.copied}
        copyFailed={content.installation.copyFailed}
        manualCopy={content.installation.manualCopy}
        multiline
        inverse
      />
      <p>{content.review.note}</p>
    </details>
  )
}

export function Faq({ content }: Pick<SharedProps, "content">) {
  return (
    <section className="faq ruled-section">
      <div className="faq__heading">
        <p className="eyebrow">{content.faq.eyebrow}</p>
        <h2>{content.faq.title}</h2>
      </div>
      <div className="faq__items">
        {content.faq.items.map((item) => (
          <div className="faq__item" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SiteFooter({ content, locale }: SharedProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <span className="brand__mark" aria-hidden="true">
          cc
        </span>
        <div>
          <strong>cc-agents-kit</strong>
          <p>{content.footer.line}</p>
        </div>
      </div>
      <nav aria-label={content.nav.footerLabel}>
        <a href={`/${locale}/about/`}>{content.footer.about}</a>
        <a href={`/${locale}/contact/`}>{content.footer.contact}</a>
        <a href={`/${locale}/privacy/`}>{content.footer.privacy}</a>
        <a href="https://www.donminzzi.kr" target="_blank" rel="noreferrer">
          {content.footer.personalSite}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <a
          href="https://github.com/AndrewDongminYoo"
          target="_blank"
          rel="noreferrer"
        >
          {content.footer.github}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <a
          href={`${sourceRepositoryUrl}/blob/${release.sha}/LICENSE`}
          target="_blank"
          rel="noreferrer"
        >
          {content.footer.license}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <a
          href={`${sourceRepositoryUrl}/blob/${release.sha}/CREDITS.md`}
          target="_blank"
          rel="noreferrer"
        >
          {content.footer.credits}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
    </footer>
  )
}
