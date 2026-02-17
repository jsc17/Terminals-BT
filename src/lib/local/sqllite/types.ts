export enum WorkerMessageType {
	DB_INIT,
	DB_INIT_RESPONSE,
	DB_INSERT,
	DB_INSERT_RESPONSE,
	GET_UNIT,
	GET_UNIT_RESPONSE,
	IS_AVAILABLE,
	IS_AVAILABLE_RESPONSE,
	GET_UNIT_AVAILABILITY,
	GET_UNIT_AVAILABILITY_RESPONSE
}

export type WorkerMessage = {
	id: string;
	type: WorkerMessageType;
	payload?: any;
};
