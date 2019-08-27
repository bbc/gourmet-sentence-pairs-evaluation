const getErrorText = (errorCode: string): string => {
  switch (errorCode) {
    case 'postEvaluation':
      return 'Unable to save evaluation score.';
    case 'getEvaluation':
      return 'Unable to retrieve sentence pair.';
    case 'postStart':
      return 'Could not get set of sentences for evaluation.';
    default:
      return 'It is not possible to complete that action right now.';
  }
};

export { getErrorText };
