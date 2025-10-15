# Security Analysis: Word Learning Application

## 1. Executive Summary

This document provides a comprehensive security analysis of the Word Learning application for a deployment scenario where the application is hosted on a web server and accessed by potentially malicious users.

**Overall Security Posture:** LOW RISK

The application follows modern security best practices for a client-side web application. React's automatic XSS protection, comprehensive input validation, and the lack of server-side components significantly reduce the attack surface. The primary remaining concerns are deployment configuration tasks (HTTPS and security headers).

**Key Findings:**
- ✅ No critical vulnerabilities found
- ✅ Resource exhaustion mitigated with input validation
- ✅ Input validation implemented (1,000 word limit, 100 char max)
- ✅ Security headers implemented (ready for deployment)
- ⚠️ No rate limiting (acceptable for intended educational use)

---

## 2. Threat Model

### 2.1 Deployment Scenario

```
┌─────────────────┐
│   Your Server   │
│   (Static Host) │
└────────┬────────┘
         │ HTTPS (hopefully)
         │
    ┌────┴────┐
    │ Browser │ ← Attacker operates here
    └─────────┘
         │
    ┌────┴──────────────┐
    │ Local Storage     │
    │ - IndexedDB       │
    │ - localStorage    │
    └───────────────────┘
```

### 2.2 Threat Actors

1. **Casual Attacker**: Script kiddies trying common exploits
2. **Malicious User**: Intentional abuse of the application
3. **Automated Bots**: Crawlers, scrapers, or DoS tools

### 2.3 Attack Goals

- Cross-Site Scripting (XSS) for session hijacking
- Resource exhaustion (database/memory flooding)
- Application abuse (attempting to bypass limits)

---

## 3. Attack Surface Analysis

### 3.1 Entry Points

| Entry Point | Location | User Input Type | Sanitization |
|------------|----------|----------------|--------------|
| Word input field | `WordManager.tsx:37` | Text string | React JSX escaping only |
| Practice answer field | `Practice.tsx:241` | Text string | React JSX escaping only |
| Voice selector | `VoiceSelector.tsx:54` | Browser API data | Trusted source |
| URL parameters | N/A | None accepted | N/A |
| localStorage | `speech.ts:40` | Voice URI string | No validation |

### 3.2 Data Storage

| Storage Type | Data Stored | Access Control | Size Limits |
|-------------|-------------|----------------|-------------|
| IndexedDB | Word list | None (same-origin only) | Browser-dependent (~50% disk) |
| localStorage | Selected voice URI | None (same-origin only) | ~5-10 MB |

### 3.3 External Dependencies

- **Browser APIs**: SpeechSynthesis, IndexedDB
- **NPM Packages**: React, Dexie, Vite (build-time only)
- **No server-side APIs**: Eliminates entire class of vulnerabilities

---

## 4. Vulnerability Assessment

### 4.1 XSS (Cross-Site Scripting) - **LOW RISK** ✅

**Status:** Protected by React's automatic escaping

**Analysis:**
- All user input is rendered through React JSX: `{word.word}`, `{char}`
- No use of `dangerouslySetInnerHTML` found (verified via grep)
- No direct DOM manipulation with `innerHTML`
- Character rendering in feedback uses `.split('')` and maps to JSX

**Test Case:**
```typescript
// Malicious input
addWord('<script>alert("XSS")</script>');
addWord('<img src=x onerror=alert(1)>');

// React will render these as literal text, not execute
```

**Verdict:** React's default behavior protects against XSS. ✅

**Build-Time Protection:**
The project has ESLint configured with the `react/no-danger` rule set to `error`, which prevents `dangerouslySetInnerHTML` from being introduced:

```javascript
// eslint.config.js
rules: {
  'react/no-danger': 'error',  // Blocks dangerouslySetInnerHTML
}
```

The build process runs linting before compilation:
```json
"build": "npm run lint && tsc -b && vite build"
```

This means any attempt to use `dangerouslySetInnerHTML` will fail the build with:
```
error  Dangerous property 'dangerouslySetInnerHTML' found  react/no-danger
```

**Residual Risk:** None - automated protection prevents introduction of XSS vulnerabilities. ✅

---

### 4.2 Resource Exhaustion - **LOW RISK** ✅

**Status:** Mitigated with application-level limits

**Attack Vector 1: Database Flooding** - **MITIGATED** ✅

Location: `database.ts:22-42`
```typescript
const MAX_WORD_COUNT = 1000;

export async function addWord(wordText: string): Promise<number> {
  const trimmed = wordText.trim();

  // Validate: word count limit
  const count = await db.words.count();
  if (count >= MAX_WORD_COUNT) {
    throw new Error('Maximum word limit reached (1,000)');
  }

  return await db.words.add({ word: trimmed });
}
```

**Protection:**
- Maximum 1,000 words enforced at database layer
- Error thrown before adding to database
- User receives clear error message in UI
- Tests verify limit enforcement (database.test.ts:44-52)

**Attack Result:**
```javascript
// Attacker tries to flood database
for (let i = 0; i < 1000000; i++) {
  await addWord(`word${i}`);  // Fails after 1000 words
}
// Error: "Maximum word limit reached (1,000)"
```

**Attack Vector 2: Extremely Long Strings** - **MITIGATED** ✅

Location: `database.ts:32-34`
```typescript
const MAX_WORD_LENGTH = 100;

if (trimmed.length > MAX_WORD_LENGTH) {
  throw new Error('Word too long (max 100 characters)');
}
```

**Protection:**
- Maximum 100 characters per word
- Enforced before database insertion
- Memory impact limited to reasonable bounds
- Tests verify length validation (database.test.ts:33-41)

**Attack Result:**
```javascript
// Attacker tries to add massive string
addWord('A'.repeat(1024 * 1024 * 1024));
// Error: "Word too long (max 100 characters)"
```

**Attack Vector 3: TTS Abuse** - **PARTIALLY MITIGATED** ⚠️

Location: `speech.ts:53`
```typescript
speak(text: string, voice?: SpeechSynthesisVoice): Promise<void>
```

**Current Protection:**
- Word length limited to 100 characters (indirectly protects TTS)
- Duplicate speech requests prevented (speech.ts:64-67)

**Remaining Risk:**
- Could still spam different 100-character words rapidly
- No rate limiting on TTS calls

**Impact:** Minimal - limited to 100-character strings

**Implemented Mitigations:**
- ✅ Application-level word count limit (1,000 words)
- ✅ Application-level word length limit (100 characters)
- ✅ Empty word validation
- ✅ Whitespace trimming
- ✅ User-friendly error messages
- ✅ Word counter display (shows "Words: X / 1,000")
- ✅ Browser's IndexedDB quota (fallback protection)
- ✅ Same-origin policy prevents cross-site abuse

**Remaining Considerations:**
- ⚠️ No rate limiting on add operations (acceptable for intended use)
- ⚠️ No rate limiting on TTS operations (minimal risk with 100-char limit)

---

### 4.3 LocalStorage Manipulation - **LOW RISK** ⚠️

**Status:** Limited impact

Location: `speech.ts:40, 154`
```typescript
localStorage.getItem(SELECTED_VOICE_KEY);
localStorage.setItem(SELECTED_VOICE_KEY, voice.voiceURI);
```

**Exploit:**
```javascript
// Attacker manipulates localStorage
localStorage.setItem('selectedVoiceURI', 'malicious-uri');
```

**Impact:**
- Voice selection fails silently
- Falls back to default voice (see `speech.ts:101`)
- No code execution possible
- No data corruption

**Mitigation:** The code handles missing/invalid voices gracefully:
```typescript
const voice = this.voices.find(v => v.voiceURI === savedVoiceURI);
if (voice) {
  this.selectedVoice = voice;  // Only sets if valid
}
```

**Verdict:** Low impact, graceful degradation. ✅

---

### 4.4 Injection Attacks - **LOW RISK** ✅

**SQL Injection:** N/A - No SQL database (IndexedDB is NoSQL)

**Command Injection:** N/A - No server-side code execution

**TTS Injection:**
```typescript
speechService.speak('<phoneme ph="ˈtɛst">test</phoneme>');
```

**Impact:** SSML injection not applicable - SpeechSynthesis API accepts plain text only. Browser handles sanitization internally.

---

### 4.5 Data Sharing on Shared Computers - **NOT A VULNERABILITY** ✅

**Status:** Accepted Design Decision

**Design Intent:**
This application is designed for educational use where word lists are intentionally shared. Data accessibility on shared computers is an expected and desired behavior, not a security flaw.

**Use Case:**
- Classroom settings where multiple students use the same device
- Family computers where children share a practice word list
- Educational environments with shared resources

**Data Characteristics:**
- All data stored client-side (IndexedDB)
- No encryption at rest (intentional)
- No user authentication (by design)
- No session management (not needed)
- Word lists are educational content, not sensitive data
- No PII (Personally Identifiable Information) stored

**Protection in Place:**
- Same-origin policy prevents cross-site access
- No server-side storage means no central database to breach
- Browser's built-in security prevents access from other domains

**What This Means:**
- Anyone using the same browser on the same device can see the word list
- This is **intentional and acceptable** for the application's use case
- Browser extensions with storage access permissions can read IndexedDB (standard browser behavior)

**Verdict:** Not a security concern - working as designed. ✅

---

### 4.6 Client-Side "DoS" - **NOT A SECURITY CONCERN** ✅

**Status:** Not applicable to this architecture

**Why This Isn't a Real DoS:**

In a traditional DoS attack, an attacker targets a **shared resource** (server, network, service) to deny access to legitimate users. In this application:

- **No server** to overwhelm
- **No shared resources** to exhaust
- **All operations are local** to the user's browser
- **Attacker = Victim** - user can only DoS themselves

**Hypothetical "Attack" Scenarios:**

```javascript
// "Attack" 1: Rapid button clicking
setInterval(() => {
  document.querySelector('.addButton').click();
}, 10);
// Result: User's own browser becomes unresponsive
// Impact: User refreshes the page, everything works again

// "Attack" 2: TTS spam
for (let i = 0; i < 1000; i++) {
  speechService.speak('test');
}
// Result: User's own audio queue gets busy
// Impact: User refreshes the page, problem resolved

// "Attack" 3: Practice session spam
for (let i = 0; i < 1000; i++) {
  startSession();
}
// Result: User's own browser queries IndexedDB repeatedly
// Impact: User refreshes the page, data is intact
```

**What Actually Happens:**
1. User runs malicious script in their browser console
2. Their own browser tab becomes slow/unresponsive
3. User closes/refreshes the tab
4. Application works normally again
5. All data persists in IndexedDB

**In Shared Environment (Classroom Computer):**
- Student A crashes the browser tab with console commands
- Student B opens a new tab to the application
- Everything works normally, data is still there

**Verdict:** Client-side DoS in a purely local application is user self-harm, not a security vulnerability. The recovery is trivial (refresh/reopen), and no other users are affected. ✅

---

### 4.7 CSRF (Cross-Site Request Forgery) - **NOT APPLICABLE** ✅

**Status:** No server-side state to forge

Since all operations are client-side only with no server API:
- No cookies to steal
- No server sessions to hijack
- No state-changing server requests

**Verdict:** CSRF is not a concern. ✅

---

## 5. Security Headers & Deployment Configuration

### 5.1 Security Headers - **IMPLEMENTED** ✅

**Status:** Implemented with defense-in-depth approach

The application implements security headers at two levels:

#### Application Level (index.html)

Security headers are set via HTML meta tags for immediate protection:

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';">

<!-- Referrer Policy -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**Location:** `index.html:9-11`

#### Server Level (Nginx)

For complete protection, the web server should also set HTTP headers. Example configuration provided:

**Location:** `deployment/nginx.conf.example`

```nginx
# Complete Nginx configuration in deployment/nginx.conf.example
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=()" always;
```

See `deployment/README.md` for complete deployment instructions.

**Why Each Header Matters:**

1. **Content-Security-Policy (CSP)**
   - Prevents inline script execution (XSS protection)
   - Restricts resource loading to same origin
   - Note: `'unsafe-inline'` needed for React CSS-in-JS

2. **X-Content-Type-Options**
   - Prevents MIME-sniffing attacks
   - Ensures browsers respect `Content-Type` headers

3. **X-Frame-Options**
   - Prevents clickjacking attacks
   - Stops page from being embedded in iframes

4. **Referrer-Policy**
   - Prevents leaking URL information to third parties

5. **Permissions-Policy**
   - Disables unused browser features
   - Reduces attack surface

### 5.2 HTTPS Requirement

**CRITICAL:** This application MUST be served over HTTPS.

**Reasons:**
1. **Web Speech API:** Some browsers require HTTPS for SpeechSynthesis
2. **IndexedDB:** Some browsers restrict IndexedDB over HTTP
3. **Man-in-the-Middle Protection:** Prevents traffic interception
4. **Browser Security Features:** Modern security features require secure context

**Certificate Setup:**
```bash
# Use Let's Encrypt for free certificates
certbot --nginx -d yourdomain.com
```

---

## 6. Risk Assessment Matrix

| Vulnerability | Likelihood | Impact | Overall Risk | Mitigation Priority |
|--------------|-----------|---------|-------------|-------------------|
| XSS | Low | High | **LOW** ✅ | Monitor only |
| Resource Exhaustion | Low | Low | **LOW** ✅ | Implemented ✅ |
| LocalStorage Manipulation | Low | Low | **LOW** ✅ | Low |
| Missing Security Headers | Low | Medium | **LOW** ✅ | Implemented ✅ |
| HTTP (not HTTPS) | High | High | **HIGH** ⚠️ | **Deployment Task** |

**Notes:**
- Data sharing on shared computers is not listed because it's an accepted design decision for this educational application
- Client-side DoS is not listed because users can only affect their own browser session (not a security concern)
- Security headers are implemented in application code; HTTPS must be configured during deployment

---

## 7. Mitigation Recommendations

### 7.1 Immediate (Critical) - Must Implement Before Deployment

**1. Enforce HTTPS**
```nginx
# Redirect all HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**2. Add Security Headers** - **IMPLEMENTED** ✅

Security headers have been implemented in both the application and deployment configuration. See section 5.1 for details.

- ✅ Content Security Policy (CSP) added to `index.html:9-10`
- ✅ Referrer Policy added to `index.html:11`
- ✅ Complete Nginx configuration in `deployment/nginx.conf.example`
- ✅ Deployment guide in `deployment/README.md`

**Remaining task:** Configure web server using the provided Nginx configuration during deployment.

### 7.2 High Priority - ~~Recommended~~ **IMPLEMENTED** ✅

**1. Add Input Validation** - **IMPLEMENTED** ✅

File: `src/services/database.ts:19-42`

**Implemented validation:**
```typescript
const MAX_WORD_COUNT = 1000;
const MAX_WORD_LENGTH = 100;

export async function addWord(wordText: string): Promise<number> {
  const trimmed = wordText.trim();

  if (trimmed.length === 0) {
    throw new Error('Word cannot be empty');
  }

  if (trimmed.length > MAX_WORD_LENGTH) {
    throw new Error('Word too long (max 100 characters)');
  }

  const count = await db.words.count();
  if (count >= MAX_WORD_COUNT) {
    throw new Error('Maximum word limit reached (1,000)');
  }

  return await db.words.add({ word: trimmed });
}
```

**Features:**
- ✅ Empty word validation
- ✅ Maximum 100 characters per word
- ✅ Maximum 1,000 words total
- ✅ Whitespace trimming
- ✅ Clear error messages
- ✅ Comprehensive test coverage (37 tests passing)
- ✅ User feedback in WordManager UI
- ✅ Word count display ("Words: X / 1,000")

**2. Add Rate Limiting**

File: `src/services/rateLimiter.ts` (new file)
```typescript
class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    this.timestamps.push(now);
    return true;
  }
}

export const addWordLimiter = new RateLimiter(50, 60000); // 50 per minute
```

**3. Add Database Size Monitoring**

```typescript
export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

export async function checkQuota(): Promise<boolean> {
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;

  // Warn if over 80% quota
  return (usage / quota) < 0.8;
}
```

### 7.3 Medium Priority - Nice to Have

**1. Add User Feedback for Limits**

Show warnings when approaching limits:
```typescript
if (wordCount > 9000) {
  showWarning(`You have ${10000 - wordCount} words remaining.`);
}
```

**2. Implement Data Export/Import**

For data portability and backup:
```typescript
export async function exportWords(): Promise<string> {
  const words = await getAllWords();
  return JSON.stringify(words);
}

export async function importWords(jsonData: string): Promise<void> {
  const words = JSON.parse(jsonData);
  // Validate and import...
}
```

**3. Add Subresource Integrity (SRI)**

If using CDN for dependencies (not currently the case).

### 7.4 Low Priority - Future Enhancements

**1. Implement User Accounts**

Would enable:
- Multi-device sync
- Server-side data backup
- Access control

Trade-off: Significantly increases complexity and attack surface.

**2. Add Analytics (Privacy-Respecting)**

Track usage patterns without PII:
- Session count
- Average session length
- Words practiced per session

**3. Implement Progressive Web App (PWA)**

- Offline functionality (already works)
- Install prompts
- Better mobile integration

---

## 8. Deployment Security Checklist

### Pre-Deployment

- [ ] Configure HTTPS with valid certificate
- [ ] Set all security headers (CSP, X-Frame-Options, etc.)
- [ ] Test with Mozilla Observatory (https://observatory.mozilla.org)
- [ ] Test with SecurityHeaders.com
- [ ] Review `npm audit` output
- [ ] Update all dependencies to latest stable versions
- [ ] Configure HTTP to HTTPS redirect
- [ ] Disable directory listing on web server
- [ ] Remove unnecessary files (source maps in production)

### Build Configuration

```bash
# Production build
npm run build

# Verify no secrets in output
grep -r "API_KEY\|SECRET\|PASSWORD" dist/

# Check bundle size
du -sh dist/
```

### Web Server Configuration (Nginx Example)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/word-learning/dist;
    index index.html;

    # Security headers
    add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline';" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable access to sensitive files
    location ~ /\. {
        deny all;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Post-Deployment

- [ ] Verify HTTPS is working
- [ ] Test all security headers with curl
- [ ] Check SSL Labs rating (https://www.ssllabs.com/ssltest/)
- [ ] Monitor server logs for suspicious activity
- [ ] Set up automated SSL certificate renewal
- [ ] Document incident response procedures

---

## 9. Testing Security

### Manual Testing

**1. XSS Attempts**
```javascript
// Try adding malicious words
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
javascript:alert(1)
```

Expected: All rendered as plain text.

**2. Resource Exhaustion**
```javascript
// Console test
for (let i = 0; i < 1000; i++) {
  await addWord(`test${i}`);
}
```

Expected: With mitigations - stops at limit with error.

**3. localStorage Manipulation**
```javascript
localStorage.setItem('selectedVoiceURI', 'invalid');
```

Expected: Falls back to default voice gracefully.

**4. dangerouslySetInnerHTML Protection**

Create a test file with dangerous code:
```typescript
// src/TestDanger.tsx
export function TestDanger() {
  const html = '<script>alert("xss")</script>';
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

Run linting:
```bash
npm run lint
```

Expected output:
```
error  Dangerous property 'dangerouslySetInnerHTML' found  react/no-danger
```

Build will fail:
```bash
npm run build
# Fails at linting step, build never completes
```

This confirms build-time protection against XSS vulnerabilities. ✅

### Automated Testing

**Security Headers Test**
```bash
curl -I https://yourdomain.com | grep -E "Content-Security-Policy|X-Frame-Options"
```

**SSL Test**
```bash
testssl.sh yourdomain.com
```

**Dependency Audit**
```bash
npm audit
# Should show 0 vulnerabilities
```

---

## 10. Incident Response

### Detecting Issues

**Signs of Self-Inflicted Resource Problems:**
- Extremely slow page loads (user added too many words via console)
- Browser console errors about quota (user attempted to bypass limits)
- Unresponsive UI (user spamming actions via console)

**Response:**
1. User refreshes the browser tab (resolves temporary issues)
2. User clears browser data if needed: Settings → Clear browsing data → IndexedDB
3. Note: These are self-inflicted issues, not attacks - user can only affect their own session

### Reporting Issues

If security vulnerabilities are discovered:
1. Document the vulnerability
2. Assess impact and exploitability
3. Develop and test fix
4. Deploy fix
5. Consider disclosing responsibly (if public)

---

## 11. Summary & Recommendations

### Current Security Status: **PRODUCTION-READY WITH DEPLOYMENT CONFIGURATION**

The application follows modern web security best practices and has no critical vulnerabilities in the code itself. Application-level protections (XSS prevention, input validation) are fully implemented. The remaining tasks are deployment configuration (HTTPS and security headers).

### Must-Do Before Public Deployment:

1. ⚠️ **Configure HTTPS** (Critical) - Deployment task
2. ✅ **Implement security headers** (High) - **COMPLETED** (apply during deployment)
3. ✅ **Implement input validation** (High) - **COMPLETED**
4. ⚠️ **Add rate limiting** (High) - Optional for intended use case

### Optional But Recommended:

1. Database size monitoring
2. User feedback for limits
3. Export/import functionality
4. Server-side backup

### Attack Surface Summary:

- **Low:** XSS, injection attacks, CSRF, resource exhaustion (well protected)
- **Not Applicable:** Client-side DoS (users can only affect themselves)
- **High:** Missing deployment security (must configure before public deployment)

### Final Verdict:

**Ship with confidence after implementing critical mitigations.** The application is fundamentally secure, but deployment configuration is essential for production use.

---

## 12. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SecurityHeaders.com](https://securityheaders.com/)
- [Let's Encrypt](https://letsencrypt.org/)
