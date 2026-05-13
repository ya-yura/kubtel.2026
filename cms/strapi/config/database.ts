type StrapiConfigContext = {
  env: {
    (key: string, defaultValue?: string): string;
    int(key: string, defaultValue?: number): number;
    bool(key: string, defaultValue?: boolean): boolean;
  };
};

export default ({ env }: StrapiConfigContext) => ({
  connection: {
    client: env("DATABASE_CLIENT", "postgres"),
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "kubtel_cms"),
      user: env("DATABASE_USERNAME", "kubtel"),
      password: env("DATABASE_PASSWORD", "kubtel"),
      ssl: env.bool("DATABASE_SSL", false)
    }
  }
});
