export function stripUndefined<T extends { [key: string]: any }>(obj: T): T {
	return Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
}
