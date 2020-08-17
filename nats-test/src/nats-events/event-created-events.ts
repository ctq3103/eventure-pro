import { Subjects } from './subjects';

export interface EventCreatedEvent {
	subject: Subjects.EventCreated;
	data: {
		id: string;
		name: string;
		description: string;
		address: string;
		date: Date;
		price: number;
	};
}
