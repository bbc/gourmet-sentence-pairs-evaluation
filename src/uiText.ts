const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'postEvaluation':
      return 'Unable to save evaluation score.';
    case 'getEvaluation':
      return 'Unable to retrieve sentence pair.';
    case 'postStartFailSentenceSet':
      return 'Could not get set of sentences for evaluation.';
    case 'postStartFailEvaluatorId':
      return 'Could not save your evaluation ID.';
    case 'postFeedback':
      return 'Could not save your feedback, please contact us directly to give us feedback. Your scores for the sentence pairs evaluation have been saved you do not need to complete the test again.';
    case 'postDataset':
      return 'Could not save data set.';
    case 'postExportDataFailCSVCreate':
      return 'Could not retrieve score data set. Please try again.';
    case 'postExportFailLanguage':
      return 'The language selected to export data is invalid.';
    default:
      return 'It is not possible to complete that action right now.';
  }
};

export { getErrorText };
