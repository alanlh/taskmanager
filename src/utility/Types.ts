export type OptionalTuple<T extends readonly any[]> = {
  [K in keyof T]: T[K] | undefined;
};

export type DefaultValueGeneratorArray<T extends readonly any[]> = {
  [K in keyof T]: () => T[K];
};

type Array0ToRecord<T extends any[]> = T["length"] extends 0 ? {} : never;
type Array1ToRecord<T extends any[]> = T["length"] extends 1 ? { [0]: T[0] } & ArrayToRecord0 : Array0ToRecord<T>;
type Array2ToRecord<T extends any[]> = T["length"] extends 2 ? { [1]: T[1] } & ArrayToRecord1<T> : Array1ToRecord<T>;
type Array3ToRecord<T extends any[]> = T["length"] extends 3 ? { [2]: T[2] } & ArrayToRecord2<T> : Array2ToRecord<T>;
type Array4ToRecord<T extends any[]> = T["length"] extends 4 ? { [3]: T[3] } & ArrayToRecord3<T> : Array3ToRecord<T>;
type Array5ToRecord<T extends any[]> = T["length"] extends 5 ? { [4]: T[4] } & ArrayToRecord4<T> : Array4ToRecord<T>;
type Array6ToRecord<T extends any[]> = T["length"] extends 6 ? { [5]: T[5] } & ArrayToRecord5<T> : Array5ToRecord<T>;
type Array7ToRecord<T extends any[]> = T["length"] extends 7 ? { [6]: T[6] } & ArrayToRecord6<T> : Array6ToRecord<T>;
type Array8ToRecord<T extends any[]> = T["length"] extends 8 ? { [7]: T[7] } & ArrayToRecord7<T> : Array7ToRecord<T>;
type Array9ToRecord<T extends any[]> = T["length"] extends 9 ? { [8]: T[8] } & ArrayToRecord8<T> : Array8ToRecord<T>;
type Array10ToRecord<T extends any[]> = T["length"] extends 10 ? { [9]: T[9] } & ArrayToRecord9<T> : Array9ToRecord<T>;
type Array11ToRecord<T extends any[]> = T["length"] extends 11 ? { [10]: T[10] } & ArrayToRecord10<T> : Array10ToRecord<T>;
type Array12ToRecord<T extends any[]> = T["length"] extends 12 ? { [11]: T[11] } & ArrayToRecord11<T> : Array11ToRecord<T>;

type ArrayToRecord0 = {};
type ArrayToRecord1<T extends any[]> = { [0]: T[0] };
type ArrayToRecord2<T extends any[]> = { [1]: T[1] } & ArrayToRecord1<T>;
type ArrayToRecord3<T extends any[]> = { [2]: T[2] } & ArrayToRecord2<T>;
type ArrayToRecord4<T extends any[]> = { [3]: T[3] } & ArrayToRecord3<T>;
type ArrayToRecord5<T extends any[]> = { [4]: T[4] } & ArrayToRecord4<T>;
type ArrayToRecord6<T extends any[]> = { [5]: T[5] } & ArrayToRecord5<T>;
type ArrayToRecord7<T extends any[]> = { [6]: T[6] } & ArrayToRecord6<T>;
type ArrayToRecord8<T extends any[]> = { [7]: T[7] } & ArrayToRecord7<T>;
type ArrayToRecord9<T extends any[]> = { [8]: T[8] } & ArrayToRecord8<T>;
type ArrayToRecord10<T extends any[]> = { [9]: T[9] } & ArrayToRecord9<T>;
type ArrayToRecord11<T extends any[]> = { [10]: T[10] } & ArrayToRecord10<T>;

export type ArrayToRecord<T extends any[]> = Array12ToRecord<T>;