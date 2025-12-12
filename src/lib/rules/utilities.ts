export function failsMax(max: number | `${number}%`, count: number, totalCount: number): boolean {
	if (typeof max == "number") {
		return count > max;
	} else {
		const maxValue = max.match(/\d+/);
		if (maxValue) {
			return (count / totalCount) * 100 > Number(maxValue[0]);
		}
	}
	return false;
}

export function failsMin(min: number | `${number}%`, count: number, totalCount: number): boolean {
	if (typeof min == "number") {
		return count < min;
	} else {
		const minValue = min.match(/\d+/);
		if (minValue) {
			return (count / totalCount) * 100 < Number(minValue[0]);
		}
	}
	return false;
}
