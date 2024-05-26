export const load = async ({ url }) => {
	return {
		rules: url.searchParams.get("rules")
	};
};
