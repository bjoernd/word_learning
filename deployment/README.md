# Deployment Configuration

This directory contains example configuration files for deploying the Word Learning application to a production web server.

## Files

- `nginx.conf.example` - Example Nginx configuration with security headers

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

This creates a production build in the `dist/` directory.

### 2. Deploy to Web Server

Copy the `dist/` directory contents to your web server:

```bash
# Example: Copy to /var/www/word-learning/dist
rsync -avz dist/ user@yourserver:/var/www/word-learning/dist/
```

### 3. Configure Nginx

#### Option A: Copy and Customize

```bash
# Copy example config
sudo cp deployment/nginx.conf.example /etc/nginx/sites-available/word-learning

# Edit the file and change:
# - yourdomain.com (your actual domain)
# - SSL certificate paths
# - Application root path

sudo nano /etc/nginx/sites-available/word-learning

# Enable the site
sudo ln -s /etc/nginx/sites-available/word-learning /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Option B: Add to Existing Config

If you already have an Nginx configuration, copy the security headers section from `nginx.conf.example` to your existing server block.

### 4. Set Up HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d yourdomain.com

# Certbot will automatically:
# - Obtain a certificate
# - Update your Nginx configuration
# - Set up auto-renewal
```

### 5. Verify Security Headers

After deployment, test your security headers:

```bash
# Check headers
curl -I https://yourdomain.com

# Test with online tools
# - https://securityheaders.com/
# - https://observatory.mozilla.org/
# - https://www.ssllabs.com/ssltest/
```

## Security Checklist

After deployment, verify:

- [ ] HTTPS is working (https://yourdomain.com loads)
- [ ] HTTP redirects to HTTPS
- [ ] All security headers are present (`curl -I` check)
- [ ] CSP is not blocking any functionality (check browser console)
- [ ] SSL/TLS configuration is secure (SSL Labs A+ rating)
- [ ] Certificate auto-renewal is configured (`sudo certbot renew --dry-run`)

## Application-Level Security

The following security measures are already implemented in the application code:

- ✅ XSS Protection: React automatic escaping + ESLint enforcement
- ✅ Input Validation: 1,000 word limit, 100 character maximum
- ✅ Content Security Policy: Set via meta tag in index.html
- ✅ Referrer Policy: Set via meta tag in index.html

## Troubleshooting

### CSP Blocking Resources

If the Content Security Policy blocks legitimate resources, check the browser console for CSP violations. The policy may need adjustment in both:
- `index.html` (meta tag)
- Nginx configuration (HTTP header)

### Certificate Renewal Failing

```bash
# Check certbot timer status
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run

# Check logs
sudo journalctl -u certbot
```

### Application Not Loading

1. Check Nginx error logs: `/var/log/nginx/word-learning-error.log`
2. Verify file permissions: `sudo chown -R www-data:www-data /var/www/word-learning/dist`
3. Check Nginx configuration: `sudo nginx -t`

## Additional Resources

- [Nginx Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Content Security Policy Guide](https://content-security-policy.com/)
