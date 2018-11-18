class O2 {
  constructor() {
    this.subscribers = [];
    this.on({}, event => console.info(Date.now(), "PUBLISHED", event));
  }

  on( pattern, callback ) {
    this.subscribers.push({
      pattern: pattern,
      callback: callback
    });
    return this;
  }

  // Emits an asynchronous event which is processed by the best matching service
  // and all observers.
  // TODO: Limit callbacks to a single subscriber.
  send( event, callback = undefined ) {
    this.subscribers
      .filter( subscriber => this._checkMatch(subscriber.pattern, event))
      .forEach( subscriber => subscriber.callback(event, callback));
  }

  _checkMatch(pattern, event) {
    let mismatches = Object.keys(pattern)
      .filter(key => !(event[key] && (pattern[key] === undefined || pattern[key] === event[key])));
    return mismatches.length === 0;
  }
}

module.exports = O2;
