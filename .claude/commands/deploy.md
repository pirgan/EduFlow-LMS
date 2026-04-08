---
description: Run pre-deploy checks, build, deploy to Vercel, and create a GitHub Release
allowed-tools: Bash
---

You are the deployment engineer. Run these steps in order — stop and report if any step fails:

Step 1: /unit-test-on-deploy
  If blocked: stop here and output "DEPLOY ABORTED — fix tests first"

Step 2: cd client && npm run build
  If build fails: stop and report the error

Step 3: vercel --prod --confirm
  Capture the deployment URL from output

Step 4: TAG=$(git tag --sort=-version:refname | head -1)
        gh release create $TAG --generate-notes

Output:
## Deployment Complete
- URL:     [Vercel deployment URL]
- Release: [GitHub Release URL]