import {syncToY} from "../src/index.mts";
import diff from "microdiff";
import * as Y from "yjs";

describe("syncToY", () => {
    const doc = new Y.Doc();

    it("should return primitive types as is", () => {
        expect(syncToY(doc, true)).toBe(true);
        expect(syncToY(doc, "tomato")).toBe("tomato");
        expect(syncToY(doc, 3)).toBe(3);
        expect(syncToY(doc, null)).toBe(null);
    });

    it("should return primitive types as is", () => {
        const main: any = doc.getMap('main');

        const original01 = {
            name: 'Omran Jamal',
            height: 173
        };

        syncToY(doc, original01, main);
        expect(diff(original01, main.toJSON()).length).toBe(0);

        const original02 = {
            name: 'Omran Jamal',
            height: 173,
            favorite_food: [
                'sushi', 'spinach', 'salad', 'eggs'
            ]
        };

        syncToY(doc, original02, main);
        expect(diff(original02, main.toJSON()).length).toBe(0);

        const oldArray = main.get('favorite_food');
        expect(oldArray).toBeInstanceOf(Y.Array);

        const original03 = {
            name: 'Omran Jamal',
            height: 173,
            favorite_food: [
                'sushi', 'apples', 'salad', 'eggs', 'beef', 'salmon'
            ]
        };

        syncToY(doc, original03, main);
        expect(diff(original03, main.toJSON()).length).toBe(0);
        const newArray = main.get('favorite_food');

        expect(oldArray === newArray).toBe(true);

        const original04 = {
            name: 'Omran Jamal',
            favorite_food: [
                'sushi', 'apples', 'salad'
            ]
        };

        syncToY(doc, original04, main);
        expect(diff(original04, main.toJSON()).length).toBe(0);

        const original05 = {
            name: 'Omran Jamal',
            favorite_food: [
                'sushi', 'spinach', 'salad', {
                    type: 'fish',
                    specifically: ['rui', 'salmon']
                }
            ]
        };

        syncToY(doc, original05, main);
        expect(diff(original05, main.toJSON()).length).toBe(0);

        const oldMap = main.get('favorite_food').get(3);
        expect(oldMap).toBeInstanceOf(Y.Map);


        const original06 = {
            name: 'Omran Jamal',
            favorite_food: [
                'sushi', 'spinach', 'salad', {
                    type: 'fish',
                    specifically: ['rui', 'salmon', 'bhetki']
                }
            ]
        };

        syncToY(doc, original06, main);
        expect(diff(original06, main.toJSON()).length).toBe(0);

        const newMap = main.get('favorite_food').get(3);
        expect(newMap === oldMap).toBe(true);

        expect(newMap.get('specifically')).toBeInstanceOf(Y.Array);
    });
});
