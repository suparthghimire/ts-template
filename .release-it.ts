import type { Config } from "release-it";

export default {
  git: {
    commitMessage: "chore: release v${version}",
  },
  github: {
    release: true,
  },
  npm: {
    publish: true,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      preset: {
        name: "conventionalcommits",
      },
    },
  },
} satisfies Config;
