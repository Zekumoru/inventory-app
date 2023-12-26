#!/usr/bin/env ts-node

/**
 * Module dependencies.
 */

import 'dotenv/config';
import app from '../app';
import debugExtended from '../utils/debug-extended';
import http from 'http';
import mongoose from 'mongoose';

const debug = debugExtended('inventory:server');

/**
 * Connect to mongodb
 */

const dbConnectString = process.env.MONGODB_CONNECT_STRING;

mongoose.set('strictQuery', false);

(async () => {
  await mongoose.connect(dbConnectString);
  debug('Server connected successfully to mongodb');
})().catch((error: { message: string }) => {
  debug.error(`Server could not connect to mongodb: ${error.message}`);
});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
const hostname = process.env.HOSTNAME;
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  debug(`Server started running on http://${hostname}:${port}`);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port;
  debug('Listening on ' + bind);
}
