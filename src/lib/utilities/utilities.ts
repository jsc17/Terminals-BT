export function isJson(input: string): boolean {
	try {
		JSON.parse(input);
	} catch (error) {
		return false;
	}
	return true;
}
