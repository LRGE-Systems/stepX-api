export const environment = {
    server: { port: process.env.SERVER_PORT || 3003 },
    server_url: process.env.SERVER_URL || 'http://localhost:3000',
    db: {url: process.env.DB_URL ||'mongodb://localhost:27017/stepX'},
    security: {
      saltRounds: process.env.SALT_ROUNDS || 10,
      apiSecret: process.env.API_SECRET || ''
    },
    log: {
      level: process.env.LOG_LEVEL || 'debug',
      name: 'stepX-api-logger'
    },
    smtpServer: {
      service: 'Gmail',
      auth: {
        user: "",
        pass: ""
      }
    },
    mailOptions: {
      from: "",
      to: '',
      subject: "Wellcome to StepX",
      html: null
  }

  }