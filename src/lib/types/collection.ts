import * as v from "valibot";

export const addTagToUnitSchema = v.object({
	unitId: v.array(v.pipe(v.string(), v.transform(Number))),
	tag: v.array(v.pipe(v.string(), v.transform(Number)))
});
