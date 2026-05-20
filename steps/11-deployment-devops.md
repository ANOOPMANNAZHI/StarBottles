# Module 11 — Deployment & DevOps

## Overview
Server configuration, Nginx setup, CI/CD pipeline, environment management, and production deployment steps.

> ⚠️ Client is responsible for providing the Ubuntu 22.04 VPS, domain, and SSL certificate per SRS §16.

---

## Server Setup Tasks

### 1. Create Server Bootstrap Script
File: `scripts/setup-server.sh`

Script must install and configure:

**PHP 8.2:**
```bash
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php
apt install -y php8.2-fpm php8.2-mysql php8.2-redis php8.2-gd php8.2-curl php8.2-mbstring php8.2-xml php8.2-zip php8.2-intl
```

**Nginx:**
```bash
apt install -y nginx
```

**MySQL 8.0:**
```bash
apt install -y mysql-server
mysql_secure_installation
```

**Redis:**
```bash
apt install -y redis-server
systemctl enable redis-server
```

**Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
```

**Composer:**
```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

**Supervisor:**
```bash
apt install -y supervisor
```

**Firewall:**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Create MySQL database:**
```bash
mysql -e "CREATE DATABASE starbottles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'starbottles'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';"
mysql -e "GRANT ALL PRIVILEGES ON starbottles.* TO 'starbottles'@'localhost';"
```

**File permissions for Laravel:**
```bash
chown -R www-data:www-data /var/www/starbottles-backend/storage
chown -R www-data:www-data /var/www/starbottles-backend/bootstrap/cache
chmod -R 775 /var/www/starbottles-backend/storage
```

---

### 2. Create Nginx Config — Laravel Backend
File: `nginx/starbottles-backend.conf`

```nginx
server {
    listen 80;
    server_name api.starbottles.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.starbottles.com;

    root /var/www/starbottles-backend/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/api.starbottles.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.starbottles.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting for login
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

    location /api/v1/auth/login {
        limit_req zone=login burst=5 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /storage {
        alias /var/www/starbottles-backend/storage/app/public;
    }
}
```

---

### 3. Create Nginx Config — Next.js Frontend
File: `nginx/starbottles-frontend.conf`

```nginx
server {
    listen 80;
    server_name starbottles.com www.starbottles.com;
    return 301 https://starbottles.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name starbottles.com;

    ssl_certificate /etc/letsencrypt/live/starbottles.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/starbottles.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000";

    # Cache static Next.js assets
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

### 4. Create Supervisor Config for Queue Workers
File: `supervisor/laravel-worker.conf`

```ini
[program:starbottles-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/starbottles-backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=3
redirect_stderr=true
stdout_logfile=/var/log/supervisor/starbottles-worker.log
stopwaitsecs=3600
```

---

### 5. Create PM2 Config for Next.js
File: `pm2/ecosystem.config.js`

```js
module.exports = {
  apps: [
    {
      name: 'starbottles-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/starbottles-frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

---

### 6. Create GitHub Actions CI/CD Pipeline
File: `.github/workflows/deploy.yml`

```yaml
name: Deploy StarBottles

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install --no-interaction
        working-directory: starbottles-backend
      - name: Run tests
        run: php artisan test
        working-directory: starbottles-backend
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy backend via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/starbottles-backend
            git pull origin main
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan queue:restart
            sudo systemctl reload php8.2-fpm

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy frontend via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/starbottles-frontend
            git pull origin main
            npm ci
            npm run build
            pm2 reload starbottles-frontend
```

---

### 7. Create Production Environment Templates
File: `starbottles-backend/.env.production.example`

```env
APP_NAME=StarBottles
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.starbottles.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=starbottles
DB_USERNAME=starbottles
DB_PASSWORD=         # Set on server

QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
CACHE_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

SANCTUM_STATEFUL_DOMAINS=starbottles.com,www.starbottles.com

# ERP Integration
ERP_BASE_URL=        # Provided by client
ERP_API_KEY=         # Provided by client
ERP_USE_MOCK=false   # Set to false in production
ERP_SYNC_INTERVAL=6

# WhatsApp BSP
WHATSAPP_VERIFY_TOKEN=   # Set a strong random string
WHATSAPP_APP_SECRET=     # Provided by BSP
WHATSAPP_BSP_NAME=       # e.g. "twilio", "360dialog"

# Storage
FILESYSTEM_DISK=public
```

File: `starbottles-frontend/.env.production.example`

```env
NEXT_PUBLIC_API_URL=https://api.starbottles.com/api
NEXTAUTH_URL=https://starbottles.com
NEXTAUTH_SECRET=     # Generate with: openssl rand -base64 32
```

---

## Deployment Steps (Manual First Deploy)

### 8. Document First Deployment Runbook
File: `docs/DEPLOYMENT.md`

Steps:
1. SSH into server, run `scripts/setup-server.sh`
2. Clone repos: `git clone {repo} /var/www/starbottles-backend`
3. Copy `.env.production.example` to `.env`, fill all values
4. Run: `composer install --no-dev`
5. Run: `php artisan key:generate`
6. Run: `php artisan migrate --force`
7. Run: `php artisan db:seed --class=RolesAndPermissionsSeeder`
8. Run: `php artisan storage:link`
9. Copy Nginx configs to `/etc/nginx/sites-available/`, enable, reload Nginx
10. Copy Supervisor config, reload: `supervisorctl reread && supervisorctl update`
11. Clone frontend, `npm ci && npm run build`
12. Copy PM2 config, run: `pm2 start ecosystem.config.js && pm2 save`
13. Set up SSL: `certbot --nginx -d starbottles.com -d api.starbottles.com`
14. Add GitHub Secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`
15. Push to `main` to verify CI/CD pipeline runs

---

## Deliverables Checklist
- [ ] `setup-server.sh` installs all dependencies cleanly
- [ ] Nginx configs redirect HTTP → HTTPS
- [ ] Security headers present on all responses
- [ ] Login rate limiting active in Nginx
- [ ] Supervisor starts 3 queue workers on boot
- [ ] PM2 starts 2 Next.js instances in cluster mode
- [ ] GitHub Actions runs tests on push
- [ ] GitHub Actions deploys backend and frontend on `main` push
- [ ] `php artisan migrate --force` runs in CI without errors
- [ ] `.env.production.example` documents all required variables
- [ ] `DEPLOYMENT.md` runbook complete and accurate
