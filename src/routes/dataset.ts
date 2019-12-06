import { Request, Response, Application } from 'express';
import { DatasetBody, DatasetFile, DatasetRequest } from '../models/requests';
import { submitDataset } from '../processDataset';
import { Language } from '../models/models';
import { readFileSync, unlink } from 'fs';
import { Instance } from 'multer';
import { logger } from '../utils/logger';

const buildDatasetRoutes = (app: Application, upload: Instance) => {
  app.post(
    '/dataset',
    upload.single('sentences'),
    (req: DatasetRequest, res: Response) => {
      const sentences = readFileSync(req.file.path, 'utf-8');
      const datasetSentences: DatasetFile = JSON.parse(sentences);
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
          res.redirect('/error?errorCode=postDataset');
        })
        .finally(() => {
          unlink(req.file.path, err => {
            if (err) {
              logger.error(`Failed to delete file ${req.file.path}`);
            }
          });
        });
    }
  );

  app.get('/dataset', (req: Request, res: Response) => {
    const languages = Object.keys(Language);
    // Get all possible values for Language enum
    const languageOptions = languages.map((languageName, i) => {
      return {
        displayName:
          languageName.charAt(0).toUpperCase() +
          languageName.slice(1).toLowerCase(),
        language: languages[i],
      };
    });
    res.render('dataset', { languageOptions });
  });
};

export { buildDatasetRoutes };