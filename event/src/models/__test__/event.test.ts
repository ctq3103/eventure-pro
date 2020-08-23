import { Event } from '../Event';
import { Error } from 'mongoose';

it('implements optimistic concurrency control', async (done) => {
	// Create an instance of an event
	const event = Event.build({
		title: 'test',
		description: 'test description',
		address: 'test address',
		datetime: new Date('2021-01-01T18:00:00'),
		price: 50,
		userId: '123',
	});

	// Save the event to the database
	await event.save();

	// fetch the event twice
	const firstInstance = await Event.findById(event.id);
	const secondInstance = await Event.findById(event.id);

	// make 2 separate changes to the events we fetched
	firstInstance!.set({ price: 100 });
	secondInstance!.set({ price: 200 });

	//save the first fetched event
	await firstInstance!.save();

	// save the second fetched event and expect an error
	try {
		await secondInstance!.save();
	} catch (err) {
		return done();
	}

	throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
	const event = Event.build({
		title: 'test',
		description: 'test description',
		address: 'test address',
		datetime: new Date('2021-01-01T18:00:00'),
		price: 50,
		userId: '123',
	});

	await event.save();
	expect(event.version).toEqual(0);
	await event.save();
	expect(event.version).toEqual(1);
	await event.save();
	expect(event.version).toEqual(2);
	await event.save();
	expect(event.version).toEqual(3);
});
