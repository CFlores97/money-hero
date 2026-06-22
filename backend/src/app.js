import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.routes.js';
import {errorMiddleware} from './middleware/error.middleware.js';

const app = express();

app.use(helmet());

app.use(cors(
    {
        origin: process.env.FRONTEND_URL || 'http://localhost:30083' 
    }
));

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.json({
        message: 'API de Money Hero running'
    });
});

app.use(routes);
app.use(errorMiddleware);

export default app;
