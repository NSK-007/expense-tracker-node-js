const nodemailer = require('nodemailer');
let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'b151558@rgukt.ac.in',
        pass: ''
    }
});

let mailDetails = {
    from: process.env.EMAIL,
    to: 'nshiva900@gmail.com',
    subject: 'CDSV',
    html:`
      <h1>CDSV<h1>
      <img src="https://lh3.googleusercontent.com/RhX3FIHvMZwNs2lm7nGXdk7ZqfE6MRIcOnxbUAsjQjVVhTkgWIXVLrrDAmdjIpg6Oz9ofj1IYaFHvZAgQdossbjfYOhYe1V2iRaDotkJf1mbKdkXGZU_HFwIgXdh3Vbpva-oMuHS6mupzjxCbuVNgi7u0_rieZFV1mR-AgDZo7tPyVs03yzCQ46ahJF-ccaes725GigpSYDkZWTUUPZi0PH8RanYPXo03uh2mUOLvDTKU2kxAZW3gDcIniDGbS70bKMsBQACLN2-cG01tPuunEzqqWQWQmIcEB_v6a2GlNyvoPqmEWE1s4Lkov-5ioEmYAE7N9fBOeePXdnwemlPLLvIasD5QJ4IsLuGDgofs7AFgTBGGnLXZfGIsffbdokLnGnSPgDVaRguPnc9hmlrBXT8tKiKOrjzOk-yJ4_iJZsqbsMLWmApGA6V0afoaeR_GKLnLXufYxhxmxToS2JsrGhbSS58nmjUaSYIduxBphlPkbWzKIP0Y0UNMv5PQzRjS0KjSkNjKExR2bNoLQBof9W8GD9E-5AQIB-6w-Z8z6B6sPsCacVIWnTtK9CcetSExaEWyTIVIbB8ysz725ZYXF43jsOsDpYi1o3zc4gc83qrRgrZ65FlT56qZEj7O5HuGHP5B1M1uHp3CDW_DJll0aDNkx2lHsdHL4JIrPiXY1mLD2h-oAI38RUjF5zc8dHEz3EAr4NVQ5gSLEG6CGVdkrX3ulRs8fNuXu7lPAP6nIXkrueDzpGK48KLCz_n5Gb9b9r1XiwLm528Ch3aAsVIYITwGTAS5wZA_lS1QN-4MztP12dmQjaLv8m4pk0_j8lR7uBiuTu0Uq1tQ2ocHw99J2PNtfMllTcAJivuIDTMpIM1cl06fMQMfclTcxBbjxzJaFvqfxnS89YAGy5qXBzmJ2jlDYvII60h5BXmUAAf31Lz8UwK1t7cFKuKbWw3G19vJP7W2irHjA=w1024-h767-s-no?authuser=0" />
    `,
};

mailTransporter.sendMail(mailDetails, function(err, data){
    if(err){
        console.log(err);
        throw new Error(err.message)
    }
    else{
        console.log('Email Sent');
        res.status(200).json({success: true, message: 'Check your email to reset the password'});
    }
});
