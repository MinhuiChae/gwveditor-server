const express = require('express');
const app = express();
const port = 5000;
import cors from 'cors';
import workRoute from './rest/work';

app.listen(port, () => {
  console.log('start')
})

app.use(cors());
app.use('/work', workRoute)