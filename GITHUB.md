# Push LocuDoc to github.com/taopi74

This repo uses **only local** Git identity (your global Git config is not changed).

## 1. One-time: create the public repo

On GitHub: [github.com/new](https://github.com/new)

| Field | Value |
|-------|--------|
| Owner | **taopi74** |
| Repository name | **LocuDoc** |
| Description | `Privacy-first document toolkit — PDF, Excel, images. On-device. Expo.` |
| Public | Yes |
| Initialize | **Do not** add README, .gitignore, or license (this folder already has them) |

Suggested **Topics** (on the repo page → ⚙️ → Topics):

`expo` `react-native` `typescript` `pdf` `privacy` `offline` `document-tools` `open-source`

## 2. First push from this folder

```powershell
cd "c:\Users\Opi-AI\Desktop\follwoup\notype"

git init
git config user.name "Tarqul Alam Opi"
git config user.email "tarqulopi77@gmail.com"

git add .
git commit -m "Initial release: LocuDoc — on-device document toolkit"
git branch -M main
git remote add origin https://github.com/taopi74/LocuDoc.git
git push -u origin main
```

Use GitHub CLI instead of the website:

```powershell
gh repo create taopi74/LocuDoc --public --source=. --remote=origin --push
```

## GitHub Actions (optional)

If push fails with `workflow scope`, either sign in with a token that includes **workflow**, or add [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) later from the GitHub website after the first push.

## 3. Every later push

```powershell
git add .
git commit -m "Describe your change"
git push
```

## 4. Pin on your profile

[github.com/taopi74](https://github.com/taopi74) → **Customize your pins** → pin **LocuDoc**.

## 5. More stars (honest growth)

- Deploy web on Vercel and add the live URL to the README.
- Add 2–3 screenshots under `docs/screenshots/` and uncomment the block in README.
- Share on LinkedIn / dev communities with the privacy angle.
- Keep issues and PRs responsive — stars follow useful, maintained repos.
