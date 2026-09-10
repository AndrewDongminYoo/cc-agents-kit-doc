// AI crawlers and agent user agents that receive Markdown for HTML routes without asking for it.
// The names come from the Anthropic and OpenAI crawler documentation and from the user agents the Is Agentic scanner probes.
// robots.txt lists the same names, and the validator checks that the user-agent routes in vercel.json use exactly this pattern.
export const agentUserAgents = [
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "DeepSeekBot",
  "ora-agent",
]

export const agentUserAgentPattern = agentUserAgents.join("|")

export function isAgentUserAgent(userAgent = "") {
  return new RegExp(agentUserAgentPattern, "i").test(userAgent)
}
