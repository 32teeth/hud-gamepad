#!/bin/bash
version=0.0.0

github() {
  local version="$1"
  local reset="$2"

  if [ "$reset" == "--reset" ]; then
    git checkout --orphan orphan
  fi

  git add .
  git commit -am "build: $version"
  git tag "$version" -m "build: $version"

  git push origin "$version"

  if [ "$reset" == "--reset" ]; then
    git branch -M main
    git push --force origin main
  else
    git push
  fi

  gh release create "$version" --generate-notes --title "$version" --notes "Release $version"

  echo "Running npm publish"
  npm run publish
  if [ $? -ne 0 ]; then
    echo "npm publish failed"
    exit 1
  else
    echo "npm publish succeeded"
  fi
}

changelog() {
  local file="CHANGELOG.md"
  local version="$1"
  local changes="What changed in this version?"
  local list="* Change 1
* Change 2
* Change 3"

  sed '1,2d' "$file" > temp_changelog.mdx

  cat <<EOF > "$file"
# Changelog

### $version

$changes

$list

$(cat temp_changelog.mdx)
EOF

  rm temp_changelog.mdx
}

update_version() {
  local package="package.json"
  version=$(jq -r '.version' "$package")

  IFS='.' read -r major minor patch <<< "$version"

  if (( patch < 9 )); then
    (( patch++ ))
  elif (( minor < 9 )); then
    (( minor++ ))
    patch=0
  else
    (( major++ ))
    minor=0
    patch=0
  fi

  version="$major.$minor.$patch"

  jq ".version = \"$version\"" "$package" > temp.json && mv temp.json "$package"
}

update() {
  update_version
  changelog "$version"
  github "$version" "$1"
}

update "$@"
