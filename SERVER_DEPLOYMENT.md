# StarBottles — Server Deployment Guide

## Server Overview

| Project | Domain | Server Path | PM2 Name | Port |
|---|---|---|---|---|
| Laravel API (Backend) | api.starbottles.in | `/var/www/starbottles/api` | — (PHP-FPM via Nginx) | — |
| Admin Frontend | app.starbottles.in | `/var/www/starbottles/app` | `sb-app` | 3000 |
| B2B Frontend | web.starbottles.in | `/var/www/starbottles/web` | `web` | 3001 |
| Queue Worker | — | `/var/www/starbottles/api` | `queue-worker` | — |

---

## PM2 Process Status

```bash
pm2 status
```

All 3 processes must be `online`:

| id | name | status |
|---|---|---|
| 0 | sb-app | online |
| 1 | web | online |
| 2 | queue-worker | online |

---

## 1. Backend (Laravel API) — `api.starbottles.in`

### After any PHP / route / config changes

```bash
cd /var/www/starbottles/api

# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Restart PHP-FPM (required after .env changes)
sudo systemctl restart php8.4-fpm
```

### After adding new migrations

```bash
cd /var/www/starbottles/api
php artisan migrate --force
```

### After adding new composer packages

```bash
cd /var/www/starbottles/api
composer install --no-dev --optimize-autoloader
php artisan config:clear
```

### After changing .env values

```bash
cd /var/www/starbottles/api

# Edit the env file
nano .env.production

# Clear config cache and restart FPM
php artisan config:clear
sudo systemctl restart php8.4-fpm
```

### Full backend deploy (all changes)

```bash
cd /var/www/starbottles/api
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan view:clear
sudo systemctl restart php8.4-fpm
pm2 restart queue-worker
```

---

## 2. Admin Frontend — `app.starbottles.in`

### After any code changes

```bash
cd /var/www/starbottles/app
npm install --legacy-peer-deps
npm run build
pm2 restart sb-app
```

### After changing .env.local

```bash
cd /var/www/starbottles/app
nano .env.local
npm run build
pm2 restart sb-app
```

### Check logs if something breaks

```bash
pm2 logs sb-app --lines 50
```

---

## 3. B2B Frontend — `web.starbottles.in`

### After any code changes

```bash
cd /var/www/starbottles/web
npm install --legacy-peer-deps
npm run build
pm2 restart web
```

### After changing .env.local

```bash
cd /var/www/starbottles/web
nano .env.local
npm run build
pm2 restart web
```

### Check logs if something breaks

```bash
pm2 logs web --lines 50
```

---

## 4. Queue Worker

The queue worker processes background jobs (ERP sync, emails, etc).

### Check if running

```bash
pm2 status
```

### Start if not running

```bash
cd /var/www/starbottles/api
pm2 start "php artisan queue:listen --tries=1 --timeout=0" --name "queue-worker"
pm2 save
```

### Restart after backend changes

```bash
pm2 restart queue-worker
```

### Check queue logs

```bash
pm2 logs queue-worker --lines 50
```

### Clear failed jobs

```bash
cd /var/www/starbottles/api
php artisan queue:flush
```

---

## 5. Database (MySQL)

### Connect to MySQL

```bash
mysql -u starbottles -p'Starbottles@123' -h 127.0.0.1 starbottles
```

### Run migrations

```bash
cd /var/www/starbottles/api
php artisan migrate --force
```

### Check migration status

```bash
php artisan migrate:status
```

### Backup database

```bash
mysqldump -u starbottles -p'Starbottles@123' starbottles > /root/backup_$(date +%Y%m%d).sql
```

---

## 6. Nginx

### Test config before reloading

```bash
sudo nginx -t
```

### Reload after config changes

```bash
sudo systemctl reload nginx
```

### Config file locations

```bash
ls /etc/nginx/sites-enabled/
# api.starbottles.in
# app.starbottles.in
# web.starbottles.in
```

---

## 7. SSL Certificates (Certbot)

### Renew certificates

```bash
sudo certbot renew --dry-run   # test first
sudo certbot renew             # actual renewal
```

---

## 8. Logs

| What | Command |
|---|---|
| Laravel errors | `tail -50 /var/www/starbottles/api/storage/logs/laravel.log` |
| Laravel errors (filter) | `grep "production.ERROR" /var/www/starbottles/api/storage/logs/laravel.log \| tail -20` |
| Admin frontend logs | `pm2 logs sb-app --lines 50` |
| B2B frontend logs | `pm2 logs web --lines 50` |
| Queue worker logs | `pm2 logs queue-worker --lines 50` |
| Nginx access log | `tail -50 /var/log/nginx/access.log` |
| Nginx error log | `tail -50 /var/log/nginx/error.log` |
| PHP-FPM log | `tail -50 /var/log/php8.4-fpm.log` |

---

## 9. Server Reboot Recovery

After a server reboot, PM2 processes should auto-start. If not:

```bash
pm2 resurrect
# or start manually
pm2 start sb-app
pm2 start web
cd /var/www/starbottles/api && pm2 start "php artisan queue:listen --tries=1 --timeout=0" --name "queue-worker"
pm2 save
```

To ensure auto-start is set up:

```bash
pm2 startup
# Run the command it outputs, then:
pm2 save
```

---

## 10. Quick Health Check

Run this to verify everything is working:

```bash
# PM2 processes
pm2 status

# API responding
curl -s -o /dev/null -w "%{http_code}" https://api.starbottles.in/api/v1/website/settings

# Check port 3000 (admin)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Check port 3001 (b2b)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001

# MySQL connection
mysql -u starbottles -p'Starbottles@123' -h 127.0.0.1 starbottles -e "SELECT 1;"

# PHP-FPM status
sudo systemctl status php8.4-fpm
```

---

## 11. Environment Files

| Project | File | Key Variables |
|---|---|---|
| Backend | `/var/www/starbottles/api/.env.production` | `DB_PASSWORD`, `APP_KEY`, `APP_URL` |
| Admin Frontend | `/var/www/starbottles/app/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| B2B Frontend | `/var/www/starbottles/web/.env.local` | `NEXT_PUBLIC_API_URL` |

---

## 12. Common Issues & Fixes

| Issue | Fix |
|---|---|
| API returns 500 | `grep "production.ERROR" /var/www/starbottles/api/storage/logs/laravel.log \| tail -5` |
| API returns 429 Too Many Requests | Increase `throttle:300,1` in `routes/api.php` |
| ERP sync not running | `pm2 restart queue-worker` |
| Frontend shows old version | `npm run build && pm2 restart <name>` |
| DB access denied | `ALTER USER 'starbottles'@'127.0.0.1' IDENTIFIED BY 'Starbottles@123'; FLUSH PRIVILEGES;` |
| PHP config not updating | `php artisan config:clear && sudo systemctl restart php8.4-fpm` |
| PM2 process down | `pm2 resurrect` or start manually |
| Manifest syntax error | Hard refresh `Ctrl+Shift+R` or rebuild frontend |
