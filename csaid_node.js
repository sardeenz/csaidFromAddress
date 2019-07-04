var fs = require('fs'),
    newman = require('newman'),

results = [];
prettyResults = [];

newman.run({
    iterationData: './address.csv',
    reporters: 'cli',
    collection: './csaid.postman_collection.json',
    // environment: '/path/to/environment.json' // This is not necessary
})
    .on('request', function (err, args) {
        if (!err) {
            // here, args.response represents the entire response object
            var rawBody = args.response.stream, // this is a buffer
                body = rawBody.toString(); // stringified JSON

            results.push(JSON.parse(body)); // this is just to aggregate all responses into one object
        } else {
            console.log('the error is ', err);
        }
    })
    // a second argument is also passed to this handler, if more details are needed.
    .on('done', function (err, summary) {
        if (!err) {
            var arrayLength = results.length;
            for (var i = 0; i < arrayLength; i++) {
                if (results[i].features.length > 0) {
                    var csaid = results[i].features[0].attributes.CSAID;
                    prettyResults.push('UPDATE [dbo].[MAILINGADDRESS] set [ADDRESSLINE3] = ' + csaid + ' where [MAILINGADDRESSID] = ');
                } else {
                    prettyResults.push(',');
                }
            }
    
            fs.writeFileSync('migration-report.json', JSON.stringify(prettyResults));
        } else {
            console.log('the error is ', err);
        }


    });