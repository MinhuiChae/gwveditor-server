const express = require('express');

const port = 5000;
import cors from 'cors';
import workRoute from './rest/work';
import * as dotenv from 'dotenv'

dotenv.config();
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

app.listen(port, () => {
  console.log('start')
})

app.use(cors());
app.use(bodyParserErrorHandler());
app.use('/work', workRoute)