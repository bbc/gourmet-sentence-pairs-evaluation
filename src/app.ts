import * as express from 'express';
import { Application } from 'express';
import * as multer from 'multer';
import { Instance } from 'multer';

import { buildIndexRoute } from './routes/index';
import { buildBeginEvaluationRoute } from './routes/beginEvaluation';
import { buildEvaluationRoutes } from './routes/evaluation';
import { buildFeedbackRoutes } from './routes/feedback';
import { buildDatasetRoutes } from './routes/dataset';
import { buildStartRoute } from './routes/start';
import { buildEndRoute } from './routes/end';
import { buildSuccessRoute } from './routes/success';
import { buildErrorRoute } from './routes/error';
import { buildStatusRoute } from './routes/status';
import { buildExportDataRoute } from './routes/exportData';

import './config';

const app: Application = express();

// support parsing of application/json type post data
app.use(express.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));
// Serve static assets in the public folder
app.use(express.static('public'));
// Use handlebars to render templates
app.set('view engine', 'hbs');
// Instantiate multer for uploads
const upload: Instance = multer({ dest: 'uploads/' });

buildIndexRoute(app);
buildStartRoute(app);
buildBeginEvaluationRoute(app);
buildEvaluationRoutes(app);
buildFeedbackRoutes(app);
buildDatasetRoutes(app, upload);
buildEndRoute(app);
buildSuccessRoute(app);
buildErrorRoute(app);
buildStatusRoute(app);
buildExportDataRoute(app);

export default app;
