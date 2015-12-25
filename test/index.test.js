import { base, orm, example } from 'feathers-service-tests';
import Waterline from 'waterline';
import diskAdapter from 'sails-disk';
import errors from 'feathers-errors';
import feathers from 'feathers';
import service from '../src';
import exampleServer from '../example/app';

let user;
let people;
const _ids = {};
const app = feathers();
const config = {
  adapters: {
    'disk': diskAdapter
  },
  connections: {
    localDisk: {
      adapter: 'disk'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};
const User = Waterline.Collection.extend({
  identity: 'user',
  connection: 'localDisk',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    age: {
      type: 'integer'
    }
  }
});

const ORM = new Waterline();

ORM.loadCollection(User);
ORM.initialize(config, (error, ontology) => {
  if (error) {
    console.error(error);
  }

  user = ontology.collections.user;
  app.use('/people', service({ Model: user }));
  people = app.service('people');

  describe('Feathers Waterline Service', () => {
    describe('Common functionality', () => {
      beforeEach(done => {
        user.create({
          name: 'Doug',
          age: 32
        }).then(user => {
          _ids.Doug = user.id;
          return done();
        });
      });

      afterEach(done => {
        user.destroy().then(() => {
          return done();
        });
      });

      base(people, _ids, errors);
    });

    describe('Waterline service ORM errors', () => orm(people, _ids, errors));

    describe('Waterline service example test', () => {
      before(done => exampleServer.then(() => done()));
      after(done => exampleServer.then(s => s.close(() => done())));

      example();
    });
  });
});
