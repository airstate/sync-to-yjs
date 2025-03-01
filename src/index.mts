import * as Y from 'yjs';

export type TSupported = string | number | boolean | null | TSupported[] | {
    [key: string]: TSupported;
};

export function syncToY<T extends {}>(doc: Y.Doc, value: T, to?: Y.Map<any>): Y.Map<any>;
export function syncToY<T extends TSupported[]>(doc: Y.Doc, alue: T, to?: Y.Array<any>): Y.Array<any>;
export function syncToY(doc: Y.Doc, value: null): null;
export function syncToY(doc: Y.Doc, value: boolean): boolean;
export function syncToY(doc: Y.Doc, value: number): number;
export function syncToY(doc: Y.Doc, value: string): string;
export function syncToY<T extends TSupported>(doc: Y.Doc, value: T, to?: Y.Map<any> | Y.Array<any>): string | number | boolean | null | Y.Array<any> | Y.Map<any> {
    if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' || value === null) {
        return value;
    } else if (Array.isArray(value)) {
        if (!to) {
            return Y.Array.from(value.map((value) => syncToY(doc, value as any)) as any[]);
        } else {
            if (!(to instanceof Y.Array)) {
                throw new Error('`to` must be an instance of Y.Array, Y.Map given')
            }

            doc.transact(() => {
                const till = Math.min(to.length, value.length);

                for (let i = 0; i < till; i++) {
                    if (typeof value[i] === 'object' && to.get(i) instanceof Y.Map) {
                        syncToY(doc, value[i] as any, to.get(i) as Y.Map<any>);
                    } else if (Array.isArray(value[i]) && to.get(i) instanceof Y.Array) {
                        syncToY(doc, value[i] as any[], to.get(i) as Y.Array<any>);
                    } else if (value[i] !== to.get(i)) {
                        to.delete(i, 1);
                        to.insert(i, [syncToY(doc, value[i] as any)]);
                    }
                }

                if (to.length > value.length) {
                    // truncate
                    to.delete(value.length, to.length - value.length)
                } else { 
                    // append
                    to.insert(to.length, value.slice(to.length).map((item) => syncToY(doc, item as any)));
                }
            });

            return to;
        }
    } else if (typeof value === 'object') {
        if (!to) {
            const ymap = new Y.Map<any>();

            for (const key in value) {
                ymap.set(key, syncToY(doc, value[key] as any));
            }

            return ymap;
        } else {
            if (!(to instanceof Y.Map)) {
                throw new Error('`to` must be an instance of Y.Map, Y.Array given')
            }

            doc.transact(() => {
                const keys = to.keys();
                const valueKeySet = new Set<string>();

                for (const key in value) {
                    valueKeySet.add(key);

                    if (!to.has(key)) {
                        to.set(key, syncToY(doc, value[key] as any));
                    } else {
                        if (typeof value[key] === 'object' && to.get(key) instanceof Y.Map) {
                            syncToY(doc, value[key] as any, to.get(key) as Y.Map<any>);
                        } else if (Array.isArray(value[key]) && to.get(key) instanceof Y.Array) {
                            syncToY(doc, value[key] as any[], to.get(key) as Y.Array<any>);
                        } else if (value[key] !== to.get(key)) {
                            to.set(key, syncToY(doc, value[key] as any));
                        }
                    }
                }

                for (const key of keys) {
                    if (!valueKeySet.has(key)) {
                        to.delete(key);
                    }
                }

            });

            return to;
        }
    } else {
        throw new Error(`unsupported type ${typeof value}`);
    }
}
