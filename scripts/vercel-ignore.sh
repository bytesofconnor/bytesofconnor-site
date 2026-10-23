#!/usr/bin/env bash
# Vercel ignoreCommand: exit 0 skips the build, exit 1 builds.
set -euo pipefail

if ! git rev-parse --verify --quiet 'HEAD^' >/dev/null; then
	echo "build: HEAD^ does not exist"
	exit 1
fi

ref="${VERCEL_GIT_COMMIT_REF:-}"
if [[ "${VERCEL_ENV:-}" == "preview" ]]; then
	case "${ref}" in
		dependabot/* | cursor/*)
			echo "skip: preview ref ${ref}"
			exit 0
			;;
	esac
fi

if git diff --quiet HEAD^ HEAD -- .; then
	echo "skip: no file changes"
	exit 0
fi

echo "build: files changed"
exit 1
