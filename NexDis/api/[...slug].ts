import { createApiApp } from '../server/apiApp';

const app = createApiApp({ supportSse: false });

export default app;

export const config = {
  maxDuration: 30,
};
