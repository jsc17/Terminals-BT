export enum WorkerMessageType {
	DB_INIT,
	DB_RESET,
	DB_COUNT,
	DB_GET_UNIT
}

export type WorkerMessage = {
	id: string;
	type: WorkerMessageType;
	payload?: any;
};

export type WorkerResponse = {
	id: string;
	result?: any;
	error?: any;
};
