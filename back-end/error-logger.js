const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format

const myFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


const ErrorLogger = (filename) => {
    const logger = createLogger({
        level: 'info',
        format: combine(
            label({label: filename}),
            timestamp(),
            myFormat
        ),

        transports : [
            new transports.File({filename: filename, level: 'error'})
        ]
    });
    return logger;
};

module.exports = ErrorLogger;