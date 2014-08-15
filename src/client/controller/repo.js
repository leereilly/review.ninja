// *****************************************************
// Repository Controller
//
// tmpl: pull.html
// path: /:user/:repo
// resolve: repo 
// *****************************************************

module.controller('RepoCtrl', ['$scope', '$stateParams', '$HUB', '$RPC', '$modal', 'repo',
    function($scope, $stateParams, $HUB, $RPC, $modal, repo) {

        $HUB.wrap('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo
        }, {
            obj: 'pull',
            fun: 'getAll'
        });

        return;

        $scope.open = {
            value: [],
            meta: null
        };

        $scope.closed = {
            value: [],
            meta: null
        };

        var getDetails = function(pulls) {
            // get stars of each pull request
            pulls.value.forEach(function(pull) {

                $RPC.call('star', 'all', {
                    repo: $scope.repo.value.id,
                    comm: pull.head.sha
                }, function(err, status) {
                    if (!err) {
                        pull.stars = status.value;
                    }
                });

                $HUB.call('issues', 'repoIssues', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    labels: 'review.ninja, pull-request-' + pull.number,
                    state: 'open',
                    per_page: 1
                }, function(err, issues) {
                    if(!err) {
                        pull.open_issue = issues;
                    }

                });

                $HUB.call('issues', 'repoIssues', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    labels: 'review.ninja, pull-request-' + pull.number,
                    state: 'closed',
                    per_page: 1
                }, function(err, issues) {
                    if(!err) {
                        pull.closed_issue = issues;
                    }

                });
            });

            return pulls;
        };
            
        $scope.spinner = $RPC.call('pull', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'open',
            per_page:1
        }, function(err, pulls) {
            console.log(pulls);
            if(!err) {
                pulls = getDetails(pulls);

                $scope.open.value = $scope.open.value.concat(pulls.value);
                $scope.open.meta = pulls.value.meta;
                console.log('META CLIENT');

               
                $HUB.call('page','hasNextPage', $scope.open.meta, function(err,res,meta){

                    $scope.hasMoreOpen = res.value;
                    
                });

            }   

        });

        $scope.spinner = $HUB.call('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'closed',
            per_page:1
        }, function(err, pulls) {

            if(!err) {
                pulls = getDetails(pulls);

                $scope.closed.value = $scope.closed.value.concat(pulls.value);
                $scope.closed.meta = pulls.meta;
                $HUB.call('page','hasNextPage', $scope.closed.meta, function(err,res,meta){

                    $scope.hasMoreClosed = res.value;
                    
                });

            }  

        });



        $scope.openMore = function(){

            $scope.spinner = $HUB.call('page', 'getNextPage', $scope.open.meta, function(err, res, meta) {

                if(!err){
                    getDetails(res);
                    $scope.open.value = $scope.open.value.concat(res.value);
                    $scope.open.meta = res.meta;

                    $HUB.call('page','hasNextPage', $scope.open.meta, function(err,res,meta){

                        if(!err){
                            $scope.hasMoreOpen = res.value;
                        }

                    });
                }

            });
        };

        $scope.closeMore = function(){

            $scope.spinner = $HUB.call('page', 'getNextPage', $scope.closed.meta, function(err, res, meta) {

                if(!err){

                    getDetails(res);
                    $scope.closed.value = $scope.closed.value.concat(res.value);
                    $scope.closed.meta = res.meta;

                    $HUB.call('page','hasNextPage', $scope.closed.meta, function(err,res,meta){

                        if(!err){
                            $scope.hasMoreClosed = res.value;
                        }
                        
                    });
                }


            });
        };

        // get the repo
        $scope.repo = repo;

    }
]);
