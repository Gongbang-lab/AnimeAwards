# Anonymous vote submission

`submitVote` accepts only Firebase-authenticated anonymous users, validates season, award, and candidate IDs against `vote-options.json`, and increments the existing `votes/categories/{season}/{award}` counters in one Realtime Database transaction. A hashed UID receipt in `_voters` makes a retry or second submission from the same anonymous UID a no-op. `localStorage` is no longer the vote lock.

## Deploy

1. Confirm Firebase Authentication has the Anonymous provider enabled.
2. Install the Firebase CLI and sign in to the `animeaward-2c0b9` project.
3. Deploy the function and database rules together with `firebase deploy --only functions,database`.

The rules permit public reads of vote aggregates and deny client writes. The Cloud Function uses the Admin SDK to write counts. Deploying only the frontend will make vote submission fail; deploying only the function while leaving the current permissive rules in place will still allow direct database tampering. Cloud Functions deployment requires the Firebase project to use the Blaze plan.

The catalog is regenerated from `data/manifest.js`, `data/awardData.js`, and the current year data files by the Firebase predeploy hook. Client-created custom award definitions are intentionally not accepted until an administrator adds them to the trusted award catalog.

Existing aggregate counts are preserved, but they have no historical UID receipts. Duplicate prevention therefore starts for votes submitted after the function and rules are deployed; old counts cannot be deduplicated retroactively.

App Check is not enforced yet. Enabling it requires registering a web provider and adding its site key to the client before setting `enforceAppCheck` on the callable function. Anonymous UID checks prevent repeat submissions by the same UID, but clearing browser data or using another device can create a new anonymous UID.
