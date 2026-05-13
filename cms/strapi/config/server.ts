type StrapiConfigContext = {
  env: {
    (key: string, defaultValue?: string): string;
    int(key: string, defaultValue?: number): number;
    array(key: string, defaultValue?: string[]): string[];
  };
};

export default ({ env }: StrapiConfigContext) => ({
  host: env("HOST", "127.0.0.1"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS")
  }
});
