# VPS Bootstrap — LIA Core v0.1

This runbook deploys only the LIA Core skeleton.

It does **not** install a second Chatwoot, Evolution, n8n or Typebot stack.

## Target

Recommended initial host: the current Atendimento.Center VPS, with LIA in an independent Docker project.

Initial service:
- container: `levelab-lia-core`
- localhost port: `8095`
- public/API domain later: `api.lia.doctor`

## 1. Host checks

```bash
date -Is
uptime
free -h
df -h /
docker --version
docker compose version
docker ps --format 'table {{.Names}}	{{.Status}}	{{.Ports}}'
```

Do not continue if disk/RAM pressure is already critical.

## 2. Clone

```bash
cd /opt
git clone https://github.com/nexflowx-hub/levelab-lia.git
cd levelab-lia
git checkout feat/corpo-forte-v1
```

If already cloned:

```bash
cd /opt/levelab-lia
git fetch origin
git checkout feat/corpo-forte-v1
git pull --ff-only origin feat/corpo-forte-v1
```

## 3. Environment

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Set at minimum:

```dotenv
NODE_ENV=production
PORT=8095
LEVELAB_BACKEND_BASE_URL=https://api.levelab.org/api/v1
ATENDIMENTO_BASE_URL=https://api.atendimento.center/api/v1
LIA_SERVICE_TOKEN=<generate-long-random-secret>
LLM_PROVIDER=openrouter
LLM_API_KEY=
LLM_MODEL=
MEMORY_PROVIDER=internal
```

Generate a service token:

```bash
openssl rand -hex 32
```

Do not add the token to Git.

## 4. Build and start

```bash
docker compose build --pull
docker compose up -d
docker compose ps
```

## 5. Validate locally

```bash
curl -fsS http://127.0.0.1:8095/api/health | jq .
curl -fsS http://127.0.0.1:8095/api/ready | jq .
docker logs --tail=100 levelab-lia-core
```

Expected health:

```json
{
  "service": "LIA Core",
  "product": "LeveLab",
  "version": "0.1.0",
  "status": "ONLINE"
}
```

Readiness will intentionally report dependencies as `NOT_CHECKED` until the next implementation step.

## 6. Reverse proxy

Do not expose port 8095 directly to the internet.

When ready to expose `api.lia.doctor`, add a Caddy site similar to:

```caddy
api.lia.doctor {
  encode zstd gzip
  reverse_proxy 127.0.0.1:8095
}
```

Before enabling DNS/public traffic, implement:
- service authentication;
- rate limiting;
- real readiness checks;
- structured logs;
- request IDs.

## 7. What comes next

After health deployment succeeds:

1. LeveLab Backend context client;
2. Atendimento.Center signed adapter;
3. LLM provider abstraction;
4. policy/safety pipeline;
5. Corpo Forte skill/runtime;
6. memory provider interface;
7. WhatsApp 1:1 test;
8. Chatwoot handoff;
9. group-safe mode;
10. n8n scheduled check-ins.

## Rollback

```bash
docker compose down
git log --oneline -10
git checkout <known-good-commit>
docker compose build
docker compose up -d
```
