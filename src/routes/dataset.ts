import { Request, Response, Router } from 'express';
import { DatasetBody, DatasetFile, DatasetRequest } from '../models/requests';
import { submitDataset } from '../processDataset';
import { readFileSync, unlink } from 'fs';
import { Instance } from 'multer';
import { logger } from '../utils/logger';

const JSONvalidate = (sentences: string): DatasetFile => {
  try {
    return JSON.parse(sentences);
  } catch (error) {
    logger.error(error);
    throw new Error('JSONvalidate error');
  }
};

const buildDatasetRoutes = (router: Router, upload: Instance) => {
  router.post(
    '/dataset',
    upload.single('sentences'),
    (req: DatasetRequest, res: Response) => {
      const sentences = readFileSync(req.file.path, 'utf-8');
      try {
        const datasetSentences: DatasetFile = JSONvalidate(sentences);
        const datasetMetadata: DatasetBody = req.body;
        submitDataset(datasetMetadata, datasetSentences)
          .then(() => {
            res.redirect('/success');
          })
          .catch(error => {
            logger.error(
              `Could not submit dataset:${JSON.stringify(
                datasetMetadata
              )}. Error: ${error}`
            );
            res.redirect(500, '/error?errorCode=postDataset');
          })
          .finally(() => {
            unlink(req.file.path, err => {
              if (err) {
                logger.error(`Failed to delete file ${req.file.path}`);
              }
            });
          });
      } catch (error) {
        logger.error(error);
        res.redirect('/error?errorCode=JSONparse');
      }
    }
  );

  router.get('/dataset', (req: Request, res: Response) => {
    res.render('dataset');
  });
};

export { buildDatasetRoutes };
