#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

cd "$ROOT_DIR"

echo "[levay-squad] validating squad manifest"
node - <<'NODE'
const { SquadValidator } = require('./.aiox-core/development/scripts/squad');
(async () => {
  const validator = new SquadValidator({ verbose: false });
  const result = await validator.validate('./squads/levay-sollu-execution');
  if (!result.valid) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log('squad valid');
})();
NODE

echo "[levay-squad] running workspace tests"
npm test --workspace apps/api
npm test --workspace apps/web
npm test --workspace apps/workers

echo "[levay-squad] done"
