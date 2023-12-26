declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HOSTNAME: string;
      HOST: string;
      PORT: string;
      NODE_ENV: 'development' | 'production';
      DEBUG: string;
    }
  }
}

export { };
