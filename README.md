# Find postgraduate teacher training (prototype)

This prototype is based on the [GOV.UK prototype kit](https://github.com/alphagov/govuk-prototype-kit)

## Requirements

* Node.js - version 10.x.x

## Installation

* Clone this repository to a folder on your computer
* Open Terminal
* In Terminal, change the path to the repository
* Type `npm install` to install the dependencies

## Working locally

* In Terminal, change the path to the repository
* Type `npm start`  and start the application

### API keys

Create a blank file named `.env` and add the following API keys:

```
GCP_API_KEY=
```

## Upgrading the prototype kit

Based on https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit

Add upstream to remotes:

```bash
git remote add upstream https://github.com/alphagov/govuk-prototype-kit.git
```

Merge upstream to a new branch:

```bash
git checkout -b upgrade-kit
git fetch upstream latest-release
git checkout upgrade-kit && git merge FETCH_HEAD --allow-unrelated-histories
```

You’ll get a few merge conflicts where both apps are trying to add the same files.

When merging the upgrade, do a squash and merge to avoid adding 1500 new commits to the timeline.
