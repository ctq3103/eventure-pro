import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import fileUpload from 'express-fileupload';
import { errorHandler, NotFoundError, currentUser } from '@eventure/common';
import { createOrgRouter } from './routes/new';
import { showOrgRouter } from './routes/show';
import { indexOrgRouter } from './routes';
import { updateOrgRouter } from './routes/update';
import { showEventsRouter } from './routes/show-events';
import { updatePhotoOrgRouter } from './routes/update-photo';

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
app.use(fileUpload);

app.use(createOrgRouter);
app.use(showOrgRouter);
app.use(indexOrgRouter);
app.use(updateOrgRouter);
app.use(showEventsRouter);
app.use(updatePhotoOrgRouter);

app.get('*', async () => {
	throw new NotFoundError();
});

//Middlewares
app.use(errorHandler);

export { app };
