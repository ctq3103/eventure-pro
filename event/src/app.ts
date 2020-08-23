import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@eventure/common';
import { createEventRouter } from './routes/new';
import { showEventRouter } from './routes/show';
import { indexEventRouter } from './routes';
import { updateEventRouter } from './routes/update';

const app = express();

//traffic is been proxy to the app through ingress nginx,
//by default express does not trust https connection
app.set('trust proxy', true);
//Body parser
app.use(express.json());

app.use(
	cookieSession({
		//disable encryption
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);

app.use(currentUser);

//Routes
app.use(createEventRouter);
app.use(showEventRouter);
app.use(indexEventRouter);
app.use(updateEventRouter);

app.get('*', async () => {
	throw new NotFoundError();
});

//Middlewares
app.use(errorHandler);

export { app };
