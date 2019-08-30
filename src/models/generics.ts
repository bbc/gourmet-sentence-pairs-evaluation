interface Option<T> {}

class Some<T> implements Option<T> {
  constructor(public value: T) {}
}

class None<T> implements Option<T> {
  constructor() {}
}

export { Option, Some, None };
