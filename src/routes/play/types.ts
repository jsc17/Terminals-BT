export type LogEntry = {
	unitId: string;
	damageTaken?: number;
	crit?: "engine" | "fireControl" | "mp" | "weapons";
};
