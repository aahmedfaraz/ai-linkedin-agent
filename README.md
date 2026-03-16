# AI LinkedIn Post Agent

An AI-powered web app that lets you connect your LinkedIn account, generate professional posts with AI, refine them in a chat, and publish directly to your profile all in one flow.

## App URL
Visit the live [application](https://ai-linkedin-agent.vercel.app/)

## What it does

1. **Connect LinkedIn** Sign in with LinkedIn OAuth so the app can post on your behalf (with your approval).
2. **Generate posts** Describe your topic or idea; the AI drafts a LinkedIn-ready post (hook, short paragraphs, emojis, hashtags).
3. **Review & improve** See the draft in a chat thread. Ask for edits (e.g. “make it shorter”, “add more emojis”) and get updated drafts.
4. **Publish** When you’re happy, ask the agent to publish the post.

## Features

- **LinkedIn OAuth** Secure connection
- **Dual AI backends** Post generation via **Amazon Nova** or **Groq** (Llama)
- **Intent detection** Groq classifies whether you want to **publish** or **improve** the post so you can say “looks good, publish it” or “make it more professional” in natural language.
- **Chat-style UX** Conversation history with the latest draft; you always approve before anything is posted.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS
- **AI:** Amazon Nove or Groq (Llama 3.1 8B)
- **Auth:** LinkedIn OAuth
- **APIs:** LinkedIn Share API

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/aahmedfaraz/ai-linkedin-agent.git
cd ai-linkedin-agent
npm install
```

### 2. Environment variables

Create a `.env.local` in the project root (or use `.env`; never commit it).

**Required for LinkedIn**

| Variable | Description |
|----------|-------------|
| `LINKEDIN_CLIENT_ID` | LinkedIn app Client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app Client Secret |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |

**Required for AI (at least one path)**

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key (used for post generation and intent detection) |
| `AI_PROVIDER` | `groq` (default) or `nova`. If `nova`, Nova is used for generation; Groq is still used for intent. |

**Required only when `AI_PROVIDER=nova`**

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region for Bedrock (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |

Example `.env.local` (Groq-only):

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=gorq
GROQ_API_KEY=your_groq_api_key
```


### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Connect LinkedIn**, generate a post, refine it in the chat, then say something like “publish it” to post.
