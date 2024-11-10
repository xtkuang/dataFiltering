import express from 'express';
import fileUploadRoutes from './routes';

const app = express();

app.use('/api', fileUploadRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
