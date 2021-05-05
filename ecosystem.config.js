module.exports = {
  apps : [{
    name   : "stepX-api",
    script : "./dist/src/main.js",
    instances: 0,
    exec_mode: "cluster",
    watch: true,
    merge_logs: true,
    env_development: {
      SERVER_PORT: 3003,
      DB_URL: 'mongodb://localhost/stepX',
      SERVER_URL: "localhost:3003",
      NODE_ENV: "development"
    },
    env_production: {
      SERVER_PORT: 3003,
      DB_URL: '',
      SERVER_URL: "",
      NODE_ENV: "production"
    }
  }]
}
