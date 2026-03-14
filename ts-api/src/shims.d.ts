declare const process: {
  env: Record<string, string | undefined>;
};

declare module "cors" {
  const cors: any;
  export default cors;
}

declare module "express" {
  export type Request = any;
  export type Response = any;
  const express: any;
  export default express;
}

declare module "mysql2/promise" {
  const mysql: any;
  export default mysql;
}
