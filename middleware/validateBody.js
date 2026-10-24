import fs from "node:fs";
import { z } from "zod";

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (result.success) {
      req.body = result.data;
      return next();
    }

    // remove the uploaded image if the body is invalid
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(422).json({ errors: z.treeifyError(result.error).properties });
  };
}
