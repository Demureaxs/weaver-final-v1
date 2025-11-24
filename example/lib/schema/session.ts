import z from 'zod';

const schema = z.object({
  email: z.string().trim().min(1).email(),
  userId: z.string().regex(/^[0-9a-f]{24}$/),
});

export default schema;
