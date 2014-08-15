// *****************************************************
// API
// *****************************************************

function ResultSet() {

    this.loaded = false;
    this.loading = true;

}

ResultSet.prototype.set = function(error, value, meta) {

    this.loaded = true;
    this.loading = false;

    this.error = error;
    this.value = value;
    this.meta = meta;

};


module.factory('$RAW', ['$http',
    function($http) {
        return {
            call: function(m, f, d, c) {
                var now = new Date();
                return $http.post('/api/' + m + '/' + f, d)
                    .success(function(res) {
                        // parse result (again)
                        try {
                            res = JSON.parse(res);
                        } catch (ex) {}
                        // yield result
                        c(null, res, new Date() - now);
                    })
                    .error(function(res) {
                        c(res, null, new Date() - now);
                    });
            }
        };
    }
]);


module.factory('$RPC', ['$RAW', '$log',
    function($RAW, $log) {
        return {
            call: function(m, f, d, c) {
                var res = new ResultSet();
                $RAW.call(m, f, d, function(error, value) {
                    res.set(error, value);
                    $log.debug('$RPC', m, f, d, res, res.error);
                    if (typeof c === 'function') {
                        c(res.error, res);
                    }
                });
                return res;
            }
        };
    }
]);


module.factory('$HUB', ['$RAW', '$log',
    function($RAW, $log) {

        var exec = function(type, args, call) {
            console.log(type, args);
            var res = new ResultSet();
            $RAW.call('github', type, args, function(error, value) {

                res.set(error, value.data, value.meta);
                $log.debug('$HUB', args, res, res.error);
                if (typeof call === 'function') {
                    call(res.error, res);
                }
            });
            return res;
        };

        return {
            call: function(o, f, d, c) {
                return exec('call', { obj: o, fun: f, arg: d }, c);
            },
            wrap: function(o, f, d, w, c) {
                return exec('wrap', { obj: o, fun: f, arg: d, wrap: w }, c);
            }
        };
    }


]);


// *****************************************************
// Angular Route Provider Resolve Promises
// *****************************************************


module.factory('$HUBService', ['$q', '$HUB',
    function($q, $HUB) {

        return {
            call: function(o, f, d) {
                var deferred = $q.defer();
                $HUB.call(o, f, d, function(err, obj) {
                    if (err) {
                        deferred.reject();
                    } else {
                        deferred.resolve(obj);
                    }
                });
                return deferred.promise;
            },
            wrap: function(o, f, d, w) {
                var deferred = $q.defer();
                $HUB.wrap(o, f, d, w, function(err, obj) {
                    if (err) {
                        deferred.reject();
                    } else {
                        deferred.resolve(obj);
                    }
                });
                return deferred.promise;
            }
        };
    }
]);


// *****************************************************
// Angular Route Provider Resolve Promises
// *****************************************************


module.factory('$RPCService', ['$q', '$RPC',
    function($q, $RPC) {
        return {
            call: function(o, f, d) {
                var deferred = $q.defer();
                $RPC.call(o, f, d, function(err, obj) {
                    if (err) {
                        deferred.reject();
                    } else {
                        deferred.resolve(obj);
                    }
                });
                return deferred.promise;
            }
        };
    }
]);
