const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'postEvaluation':
      return 'Unable to save evaluation score.';
    case 'getEvaluation':
      return 'Unable to retrieve sentence pair.';
    case 'postStart':
      return 'Could not get set of sentences for evaluation.';
    case 'postFeedback':
      return 'Could not save feedback.';
    case 'postDataset':
      return 'Could not save data set.';
    default:
      return 'It is not possible to complete that action right now.';
  }
};

export { getErrorText };
