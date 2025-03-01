# sync-to-ys

A simple utility that converts JS objects and arrays into `Y.Map` & `Y.Array` respectively. It can also sync js objects and
arrays to existing `Y.Map` objects or `Y.Array` objects.

## Installation

```bash
pnpm install sync-to-yjs
```

## Usage

```ts
import * as Y from 'yjs';
import { syncToY } from 'sync-to-yjs';

const originalData = {
    name: 'John Doe',
    crazy: false,
    height: {
        feet: 5,
        inches: 11
    },
    favorite_snacks: ['eggs', 'chips', 'jet-fuel']
};

// `Y.Doc` object is required to get the first `Y.Map` or `Y.Array`.
const doc = new Y.Doc();
const dataMap = doc.getMap('data');

// Need to pass in `doc` to support `.transact` for bulk operations.
const syncedDataMap = syncToY(doc, originalData, dataMap);

assert(dataMap instanceof Y.Map);
assert(syncedDataMap instanceof Y.Map);

// Note: The object is not changed only diffs are propagated (i.e. syncToY is impure)
assert(syncedData === syncedDataMap);

assert(
    JSON.stringify(originalData)
    === JSON.stringify(syncedDataMap.toJSON())
);
```

## License

MIT
