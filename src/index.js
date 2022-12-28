const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const db = require('./configs/db/connect');
const rootRouter = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors());

/**Connect Database */
db.connect();

/**Routes */
app.use('/api/v1', rootRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
