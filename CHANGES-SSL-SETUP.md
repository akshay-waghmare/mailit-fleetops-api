# Changes: Nginx Reverse Proxy + SSL Setup (mailit-dev.ddns.net)

## Summary
This update adds a production‑ready **Nginx reverse proxy** and **Let’s Encrypt SSL** for `mailit-dev.ddns.net`, hiding the raw `:5001` port and serving your app over HTTPS via Docker Compose.

---

## What Changed
- **docker-compose.hub.yml**
  - Added `web` (Nginx) as the public reverse proxy exposing ports **80/443**.
  - Added `certbot` (Let’s Encrypt) for certificate issuance/renewal.
  - Updated `frontend` to **expose `80` internally** (removed `5001:80` publish).
- **Nginx config (`nginx/conf.d/fleetops.conf`)**
  - HTTP server for ACME challenge during issuance.
  - HTTPS server with redirect from HTTP → HTTPS.
  - Reverse proxy from `mailit-dev.ddns.net` → `frontend:80`.
- **Certificates**
  - Issued and stored under `./certbot/live/mailit-dev.ddns.net/` (mounted into Nginx).
  - Cron-based auto‑renewal + Nginx reload.

---

## Step‑by‑Step: Exactly What We Did

1) **DNS → Server**
   - Pointed `mailit-dev.ddns.net` (No-IP) **A record** to the server IP `139.59.46.120`.

2) **Compose Services**
   - Ensured `frontend` service uses:
     ```yaml
     expose:
       - "80"
     ```
   - Added **Nginx** proxy and **Certbot** services:
     ```yaml
     web:
       image: nginx:alpine
       ports: ["80:80", "443:443"]
       volumes:
         - ./nginx/conf.d:/etc/nginx/conf.d:ro
         - ./nginx/www:/var/www/certbot
         - ./certbot:/etc/letsencrypt
     certbot:
       image: certbot/certbot:latest
       volumes:
         - ./nginx/www:/var/www/certbot
         - ./certbot:/etc/letsencrypt
     ```

3) **Initial Nginx HTTP Config** (`nginx/conf.d/fleetops.conf`):
   ```nginx
   server {
       listen 80;
       server_name mailit-dev.ddns.net;

       location /.well-known/acme-challenge/ { root /var/www/certbot; }

       # optional: proxy HTTP before SSL is ready
       location / {
           proxy_pass http://fleetops-frontend:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   - Start proxy: `docker-compose -f docker-compose.hub.yml up -d web`
   - Preflight (optional): `echo ok > nginx/www/test.txt && curl http://mailit-dev.ddns.net/.well-known/acme-challenge/test.txt`

4) **Issue SSL Certificate (webroot method)**
   ```bash
   docker-compose -f docker-compose.hub.yml run --rm certbot      certonly --webroot      --webroot-path /var/www/certbot      -d mailit-dev.ddns.net      --email akshay.d.waghmare@gmail.com --agree-tos --no-eff-email
   ```
   - Result: certs saved to `/etc/letsencrypt/live/mailit-dev.ddns.net/` (mounted as `./certbot/...` on host).

5) **Switch Nginx to HTTPS**
   Replace `fleetops.conf` with:
   ```nginx
   # Redirect HTTP -> HTTPS
   server {
       listen 80;
       server_name mailit-dev.ddns.net;
       location /.well-known/acme-challenge/ { root /var/www/certbot; }
       return 301 https://$host$request_uri;
   }

   # HTTPS site
   server {
       listen 443 ssl;
       http2 on;
       server_name mailit-dev.ddns.net;

       ssl_certificate     /etc/letsencrypt/live/mailit-dev.ddns.net/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/mailit-dev.ddns.net/privkey.pem;

       ssl_session_timeout 1d;
       ssl_session_cache shared:MozSSL:10m;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers off;

       location /.well-known/acme-challenge/ { root /var/www/certbot; }

       location / {
           proxy_pass http://fleetops-frontend:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   - Test + reload:
     ```bash
     docker-compose -f docker-compose.hub.yml exec web nginx -t
     docker-compose -f docker-compose.hub.yml exec web nginx -s reload
     ```
   - Verify: `curl -I https://mailit-dev.ddns.net`

6) **Auto‑Renew (cron on host)**
   ```cron
   0 3 * * * docker-compose -f /root/mailit-fleetops-api/docker-compose.hub.yml run --rm certbot renew --quiet && docker-compose -f /root/mailit-fleetops-api/docker-compose.hub.yml exec web nginx -s reload
   ```

---

## Git: Safe Merge to `main`
```bash
# snapshot current main
git checkout main && git pull origin main
git tag -a backup/main-before-merge-$(date +%Y%m%d-%H%M) -m "Snapshot main before merge"
git push origin --tags

# update feature and merge
git checkout feature/docker-infrastructure-improvements
git rebase origin/main   # or: git merge origin/main
git checkout main && git merge --no-ff feature/docker-infrastructure-improvements
git push origin main

# tag release
git tag -a v0.1.0 -m "Nginx reverse proxy + Certbot SSL setup"
git push origin v0.1.0
```

---

## Notes / Gotchas
- Ensure inbound **80/443** are allowed (UFW / cloud firewall).
- Make sure `mailit-dev.ddns.net` always resolves to the server IP.
- If you add more sites, replicate two `server` blocks (HTTP redirect + HTTPS) and include their domains in a new certbot run.

