import * as express from 'express';
import { Application } from 'express';
import * as multer from 'multer';
import { Instance } from 'multer';
import secureRouter from './utils/secureRouter';

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

// Serve static assets in the public folder
app.use(express.static('public'));

// Enable password authentication on any path starting with /auth
app.use('/auth', secureRouter);

// Use handlebars to render templates
app.set('view engine', 'hbs');
// Instantiate multer for uploads
const upload: Instance = multer({ dest: 'uploads/' });

buildIndexRoute(app);
buildEndRoute(app);
buildSuccessRoute(app);
buildErrorRoute(app);
buildStatusRoute(app);

buildStartRoute(secureRouter);
buildBeginEvaluationRoute(secureRouter);
buildEvaluationRoutes(secureRouter);
buildFeedbackRoutes(secureRouter);
buildDatasetRoutes(secureRouter, upload);
buildExportDataRoute(secureRouter);

export default app;
