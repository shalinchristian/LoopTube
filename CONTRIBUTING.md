# Contributing to LoopTube

Thanks for helping out. Bug reports, ideas and pull requests are all welcome.

## Getting set up

```bash
git clone https://github.com/shalinchristian/LoopTube.git
cd LoopTube
npm install
npm start        # builds and opens Firefox with the extension loaded
```

## Making a change

1. Fork the repo and create a branch, like `fix/shortcut` or `feat/playlist-loop`.
2. Keep each pull request to one change.
3. Run `npm run lint` before you push. The same check runs on every pull request.
4. Test on both `www.youtube.com` and `m.youtube.com` if your change touches the player.

## Where things live

Content script code is in `src/content/`, split into numbered files that the build joins in order. Add new features as their own file rather than growing an existing one.

## Reporting a bug

Open an issue with your Firefox version, the YouTube page you were on, and the steps that cause it.
