interface Option<T> {}

class Some<T> implements Option<T> {
  constructor(public value: T) {}
}

class None<T> implements Option<T> {
  // tslint:disable-next-line:no-empty
  constructor() {}
}

export { Option, Some, None };
