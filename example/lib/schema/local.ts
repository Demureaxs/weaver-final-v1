import { z } from 'zod';

const schema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().trim().min(8).max(32),
});

export default schema;
