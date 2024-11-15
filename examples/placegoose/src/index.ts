import { Hono } from 'hono';
import type { Bindings } from 'hono/types';
import { instrument } from '@fiberplane/hono-otel';

const app = new Hono<{ Bindings: Bindings }>();


const gagglesApp = new Hono()
  .get('/', (c) => {

    return c.text('READ GAGGLES');

  }).post('/', (c) => {

    return c.text('CREATE GAGGLE');

  }).get('/:id', (c) => {

    return c.text('READ GAGGLE');

  }).post('/:id/geese', (c) => {

    return c.text('READ GAGGLE GEESE');

  }).put('/:id', (c) => {

    return c.text('UPDATE GAGGLE');

  }).delete('/:id', (c) => {

    return c.text('DELETE GAGGLE');

  })

app.route('/gaggles', gagglesApp);

  
const geeseApp = new Hono()
  .get('/', (c) => {

    return c.text('READ GEESE');
  
  }).get('/:id', (c) => {
  
    return c.text('READ GOOSE');
  
  }).get('/:id/honks', (c) => {
  
    return c.text('READ GOOSE HONKS');
  
  });
  
app.route('/geese', geeseApp);


const honksApp = new Hono()
  .get('/', (c) => {

    // gooseId=:id (goose honks)
    return c.text('READ HONKS');

  }).post('/', (c) => {

    return c.text('CREATE HONK');

  }).get('/:id', (c) => {

    return c.text('GET HONK');

  }).patch('/:id', (c) => {

    return c.text('MODIFY HONK');

  }).put('/:id', (c) => {

    return c.text('UPDATE HONK');

  }).delete('/:id', (c) => {

    return c.text('DELETE HONK');

  });

app.route('/honks', honksApp);


export default instrument(app);