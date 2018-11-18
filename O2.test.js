const O2 = require('./O2');

describe("Pattern Matching", () => {
  let o2;
  beforeEach(() => o2 = new O2());
  afterEach(() => o2 = undefined);

  test("Succeeds on an exact match", () => {
    let pattern = { a: "Foo", b: "Bar" };
    let event = { a: "Foo", b: "Bar" };
    expect(o2._checkMatch(pattern, event)).toBe(true);
  });

  test("Fails if the event is missing parameters", () => {
    let pattern = { a: "Foo", b: "Bar" };
    let event = { a: "Foo" };
    expect(o2._checkMatch(pattern, event)).toBe(false);
  });

  test("Fails if the paramters have different values", () => {
    let pattern = { a: "Foo", b: "Bar" };
    let event = { a: "Foo", b:"Bim" };
    expect(o2._checkMatch(pattern, event)).toBe(false);
  });

  test("Succeeds even if the event has more parameters", () => {
    let pattern = { a: "Foo", b: "Bar" };
    let event = { a: "Foo", b:"Bar", c:"Bim" };
    expect(o2._checkMatch(pattern, event)).toBe(true);
  });

  test("undefined can be used as a wildcard in patterns", () => {
    let pattern = { poet: "Frost", topic: undefined };
    let message1 = { poet: "Frost" };
    let message2 = { poet: "Frost", topic: "Snow" };
    let message3 = { poet: "Frost", topic: "Romance" };

    expect(o2._checkMatch(pattern, message1)).toBe(false);
    expect(o2._checkMatch(pattern, message2)).toBe(true);
    expect(o2._checkMatch(pattern, message3)).toBe(true);
  });

  test("Empty patterns trigger match all messages", () => {
    let pattern = {};
    let message1 = {foo:"bar"};
    let message2 = {};

    expect(o2._checkMatch(pattern, message1)).toBe(true);
    expect(o2._checkMatch(pattern, message2)).toBe(true);
  });
});

describe("Plugin System", () => {
  let o2;
  beforeEach(() => o2 = new O2());
  afterEach(() => o2 = undefined);

  test("Single observer receives a message.", (next) => {
    o2.on({poet:"Atticus"}, (event) => {
      expect(event.poet).toBe("Atticus");
      expect(event.message).toBe("Let me die first or I die twice");
      next();
    });
    o2.send({poet:"Frost", message:"Tea the snow man"});
    o2.send({poet:"Atticus", message:"Let me die first or I die twice"});
  });

  test("Multiple observers can get the same message", () => {
    let counter = 0;

    o2.on({poet:"Atticus"}, (event) => {
      // console.debug("POET LISTENER", event.message);
      counter++;
    });
    o2.on({topic:"beauty"}, (event) => {
      // console.debug("TOPIC LISTENER", event.message);
      counter++;
    });

    o2.send({poet:"Atticus", topic:"depression", message: "She knew she was really sad, when she stopped loving the things she loved."});
    o2.send({poet:"Atticus", topic:"beauty", message: "There is nothing more beautiful in the world than a girl talking about the things she loves."});

    expect(counter).toBe(3);
  });

  test("Subscribers execute callbacks", next => {
    o2.on({poet:"Carol"}, (event, callback) => {
      expect(event.title).toBe("Jabberwock");
      callback(undefined, { preview:"'Twas brillig and the slithy toves did gyre and gimble in the wabe..."});
    });

    o2.send({poet:"Carol", title:"Jabberwock"}, (err, res) => {
      expect(err).not.toBeDefined();
      expect(res).toBeDefined();
      expect(res.preview).toMatch(/brillig/);
      next();
    });
  });

  test("Observers can chain events", next => {
    o2.on({price:2}, event => {
      event.price *= 2;
      event.adjusted = true;
      o2.send(event);
    });
    o2.on({adjusted:true}, event => {
      expect(event.price).toBe(4);
      next();
    });

    o2.send({item:"Coffee", price:2});
  });
});
