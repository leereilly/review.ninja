var parse = require('parse-diff');

module.exports = {
    
    getBlob: function(req, blob, done) {

        try {
            blob.content = parse(new Buffer(blob.content, blob.encoding).toString());
        }
        catch(ex) {
            res.content = null;
        }

        done(null, blob);
    }
};
