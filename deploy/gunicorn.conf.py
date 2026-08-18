import os


def env_int(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


bind = os.environ.get("BACKEND_BIND", "127.0.0.1:8000")
workers = env_int("GUNICORN_WORKERS", 1)
worker_class = "gthread"
threads = env_int("GUNICORN_THREADS", 2)
timeout = env_int("GUNICORN_TIMEOUT", 300)
graceful_timeout = 30
keepalive = 5

accesslog = "-"
errorlog = "-"
capture_output = True
loglevel = os.environ.get("LOG_LEVEL", "info").lower()

# Only the local Nginx proxy is trusted to supply X-Forwarded-* headers.
forwarded_allow_ips = "127.0.0.1"
