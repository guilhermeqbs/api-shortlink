const winston = require('winston');

// Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true })
        })
    ]
});

// Stream para Morgan
logger.stream = {
    write: (message) => logger.http(message.trim())
};

module.exports = logger;