# ACPLearn

Deep learning-based anti-cancer peptide prediction from FASTA sequences.

Production site: [acp-learn.com](https://acp-learn.com)

## Local development

Requirements: Node.js 24, pnpm 10, and Python 3.12.

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile

python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.lock
```

Start Flask in one terminal:

```bash
./start-backend.sh
```

Start Next.js in another terminal:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The Next.js development
server proxies `/api/*` to Flask on `127.0.0.1:5001` by default. Override that
with `BACKEND_URL` when necessary.

## Checks

```bash
pnpm typecheck
python3 -m unittest discover -s tests
pnpm audit --audit-level high
```

## AWS production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the EC2, Termius, systemd, Nginx,
HTTPS, logging, update, and rollback procedure.
