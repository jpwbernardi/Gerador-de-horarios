// Global js for the project, *add it to every page*

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect

class EntityManager {
  constructor(db) {
    this._db = db;
    this.persist = function(obj) {
      for (let prop in obj) {
        console.log(prop + ": " + obj[prop]);
      }
    }
  }
}

class Professor {
  constructor(siape, name) {
    this.siape = siape;
    this.name = name;
  }
  get siape() {
    return this._siape;
  }
  set siape(siape) {
    if (siape !== null)
      if (typeof siape === 'number')
        this._siape = siape;
      else throw new TypeError("'siape' must be an instance of Number!");
    else throw "'siape' must not be null!"
  }
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = String(name);
  }
}

$(document).ready(function() {
  $(".button-collapse").sideNav();
});
