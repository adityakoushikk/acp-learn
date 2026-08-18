# ACPLearn production deployment on AWS EC2

This guide targets one x86_64 Ubuntu EC2 instance administered over SSH with
Termius. Termius is the SSH client; the application and its processes run on
EC2.

## Production architecture

```text
Internet
  -> AWS security group (22 from your IP, 80/443 public)
  -> Nginx (TLS, request limits, rate limiting)
       -> /api/*  -> Gunicorn + Flask on 127.0.0.1:8000
       -> all else -> Next.js on 127.0.0.1:3000
```

Only Nginx is public. Ports 3000 and 8000 must not be added to the EC2 security
group.

Start with an x86_64 instance that has at least 2 vCPUs and 4 GiB RAM; the
frontend build and TensorFlow import both need meaningful memory. Measure CPU,
memory, latency, and request volume before resizing. Use an Ubuntu LTS image and
at least 20 GiB of gp3 storage.

The checked-in service files assume:

- Linux user: `ubuntu`
- Repository: `/home/ubuntu/acp-learn`
- Domain: `acp-learn.com` and `www.acp-learn.com`

If yours differ, replace those values in `deploy/systemd/*.service`,
`deploy/acplearn.env.example`, and `deploy/nginx/acplearn.conf` before installing
them.

## 1. Configure AWS and Termius

1. Launch the EC2 instance in a public subnet.
2. Configure its security group:
   - SSH TCP 22: **your public IP only**.
   - HTTP TCP 80: `0.0.0.0/0` and optionally `::/0`.
   - HTTPS TCP 443: `0.0.0.0/0` and optionally `::/0`.
3. Allocate and associate an Elastic IP so DNS does not change after a reboot.
4. Create DNS `A` records for the root domain and `www` pointing to that IP.
5. In Termius, create a host using the Elastic IP, username `ubuntu`, port 22,
   and the private key selected when the instance was launched.

Do not upload the private key to the repository or server.

## 2. Install system packages

In the Termius SSH session:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential curl git nginx python3 python3-pip python3-venv
```

Install the current Node.js 24 LTS release using an installation method from
nodejs.org. It must be available to systemd as `/usr/local/bin/node` or
`/usr/bin/node`. Then enable the repository's pinned pnpm version:

```bash
node --version
sudo npm install --global pnpm@10.29.3
pnpm --version
```

Expected major versions are Node 24 and pnpm 10. If `command -v node` points
inside `.nvm`, either install Node system-wide or add that Node directory to the
`PATH` line in `deploy/systemd/acplearn-web.service` before installing it.

## 3. Upload or clone the application

Using Git is recommended because it gives each deployment a commit to roll back
to:

```bash
cd /home/ubuntu
git clone YOUR_REPOSITORY_URL acp-learn
cd /home/ubuntu/acp-learn
```

For a private repository, use a read-only deploy key. Termius SFTP can also
upload the directory, but do not upload local `node_modules`, `venv`, `.next`,
or environment files.

Verify that the model assets exist:

```bash
test -f dlmodel2.h5
test -f dlscaler.npz
test -f iFeature/iFeature.py
```

## 4. Build the backend and frontend

Create a fresh Linux Python environment. Never copy a macOS virtual environment
to EC2.

```bash
python3 -m venv venv
venv/bin/python -m pip install --upgrade pip
venv/bin/python -m pip install -r requirements.lock
```

Run the checks and build the minimal Next.js standalone server:

```bash
venv/bin/python -m unittest discover -s tests
chmod +x deploy/build-frontend.sh
./deploy/build-frontend.sh
```

The build script uses the lockfile, runs TypeScript checks, builds Next.js, and
copies `public` plus `.next/static` into the standalone bundle.

## 5. Install the application environment

```bash
sudo install -d -m 0750 -o root -g ubuntu /etc/acplearn
sudo install -m 0640 -o root -g ubuntu deploy/acplearn.env.example /etc/acplearn/acplearn.env
sudo nano /etc/acplearn/acplearn.env
```

Keep `CORS_ORIGINS` blank for this same-origin Nginx deployment. Increase the
request, peptide, sequence, or timeout limits only after considering the CPU and
memory impact.

## 6. Install and start systemd services

Review the absolute paths first, then install the service definitions:

```bash
sudo install -m 0644 deploy/systemd/acplearn-backend.service /etc/systemd/system/acplearn-backend.service
sudo install -m 0644 deploy/systemd/acplearn-web.service /etc/systemd/system/acplearn-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now acplearn-backend acplearn-web
```

TensorFlow can take time to load on the first backend start. Verify both private
services before configuring Nginx:

```bash
sudo systemctl status acplearn-backend --no-pager
sudo systemctl status acplearn-web --no-pager
curl --fail http://127.0.0.1:8000/healthz
curl --fail --head http://127.0.0.1:3000/
```

If either fails, inspect its log:

```bash
sudo journalctl -u acplearn-backend -n 100 --no-pager
sudo journalctl -u acplearn-web -n 100 --no-pager
```

## 7. Configure Nginx

Edit the `server_name` values first if the domain differs, then:

```bash
sudo install -m 0644 deploy/nginx/acplearn.conf /etc/nginx/sites-available/acplearn
sudo ln -s /etc/nginx/sites-available/acplearn /etc/nginx/sites-enabled/acplearn
sudo nginx -t
sudo systemctl reload nginx
```

If the default Nginx page takes precedence, unlink its enabled configuration and
reload after another successful config test:

```bash
sudo unlink /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Confirm `http://YOUR_DOMAIN/healthz` returns `{"status":"ok"}`.

## 8. Enable HTTPS

Wait until DNS resolves to the Elastic IP and HTTP works. Then install Certbot
and let its Nginx integration add the certificate and redirect:

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d acp-learn.com -d www.acp-learn.com
sudo certbot renew --dry-run
```

After HTTPS works, test the UI, sample loader, prediction route, CSV export, and
mobile layout against the public domain.

## Deploying an update

Record the currently deployed commit before updating:

```bash
cd /home/ubuntu/acp-learn
git rev-parse HEAD
git pull --ff-only
venv/bin/python -m pip install -r requirements.lock
venv/bin/python -m unittest discover -s tests
./deploy/build-frontend.sh
sudo systemctl restart acplearn-backend acplearn-web
sudo nginx -t
sudo systemctl reload nginx
curl --fail http://127.0.0.1:8000/healthz
```

`systemctl restart` creates a short interruption. For zero-downtime updates,
move to multiple instances behind an Application Load Balancer or use versioned
release directories and a controlled process handoff.

## Rollback

Use the commit recorded before deployment:

```bash
cd /home/ubuntu/acp-learn
git checkout PREVIOUS_COMMIT
venv/bin/python -m pip install -r requirements.lock
./deploy/build-frontend.sh
sudo systemctl restart acplearn-backend acplearn-web
```

Return to your normal branch after the incident is resolved. Never reset or
discard uncommitted server changes without first inspecting them.

## Operations checklist

- Keep Ubuntu, Node 24 LTS, Python dependencies, and JavaScript dependencies
  patched.
- Run `pnpm audit --audit-level high` and `pip-audit -r requirements.lock`
  as part of releases.
- Monitor disk, memory, CPU, Nginx 5xx responses, and systemd restarts.
- Send logs to CloudWatch or another retained log service; journald alone is not
  a durable off-instance archive.
- Back up the model, scaler, configuration, DNS, and deploy key separately.
- Keep ports 3000 and 8000 private.
- Keep one Gunicorn worker initially: every worker loads its own TensorFlow model
  and consumes additional memory. Scale only after load testing.
- The included Nginx policy limits prediction requests to 10 per minute per IP,
  with a burst of five. Tune it to measured usage.
