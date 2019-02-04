# Find postgraduate teacher training courses – prototype
Also known as “search and compare”

Prototype:<br /> https://search-and-compare-prototype.herokuapp.com/

Design history:<br />
https://search-and-compare-prototype.herokuapp.com/history

Private beta designs and history (see branch [`beta`](https://github.com/DFE-Digital/search-and-compare-prototype/tree/beta)):<br />
https://search-and-compare-beta.herokuapp.com/

Alpha designs and history (see branch [`alpha`](https://github.com/DFE-Digital/search-and-compare-prototype/tree/alpha)):<br />
https://search-and-compare-alpha.herokuapp.com/

Private design documentation in Confluence:<br />
https://dfedigital.atlassian.net/wiki/spaces/BaT/pages/138379265/Search+designs

## Live service

The live service lives at:<br />
* http://find-postgraduate-teacher-training.education.gov.uk/
* https://github.com/DFE-Digital/search-and-compare-ui

Sometimes the original repository is branched and hosted on Heroku to provide a prototype as close to what’s released as possible for accurate user research and experimentation.

These branches are hosted at:<br />
https://search-and-compare-ui.herokuapp.com/

* [Increased search radius to 20 miles](https://github.com/DFE-Digital/search-and-compare-ui/tree/research-2-may)
* [Prototyped no results and disclaimer banner](https://github.com/DFE-Digital/search-and-compare-ui/tree/copy-sweep-cut)

## Update prototype data

* Copy `courses-clean.json` from [courses-clean.zip](https://github.com/DFE-Digital/search-and-compare-data/blob/master/courses-clean.zip) in the search-and-compare-data repo to this repo (it’s in .gitignore already)
* Run the ruby script: `./generate.rb`, which generates a new `prototype_data.json` file
* Commit the changes to master, which auto-deploys to Heroku

## Upgrade the prototype kit

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
