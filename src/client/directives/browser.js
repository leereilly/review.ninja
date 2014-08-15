// *****************************************************
// File Browser Directive
// *****************************************************

module.directive('browser', ['$stateParams', '$HUB', '$RPC',
    function($stateParams, $HUB, $RPC) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/browser.html',
            scope: {
                tree: '=',
                selected: '='
            },
            link: function(scope, elem, attrs) {

                scope.stack=[], scope.path=[];

                scope.up = function() {

                    if(scope.stack.length) {
                        scope.file = null;
                        scope.path.pop();
                        scope.tree = scope.stack.pop();
                    }
                };

                scope.down = function(node) {

                    if(node.type === 'tree') {

                        $HUB.call('gitdata', 'getTree', {
                            user: $stateParams.user,
                            repo: $stateParams.repo,
                            sha: node.sha,
                        }, function(err, res) {
                            if(!err) {
                                scope.path.push(node.path);
                                scope.stack.push(scope.tree);
                                scope.tree = res.value;
                            }
                        });
                    } 
                    else if(node.type === 'blob') {

                        $RPC.call('files', 'get', {
                            user: $stateParams.user,
                            repo: $stateParams.repo,
                            sha: node.sha
                        }, function(err, res) {
                            if(!err) {
                                scope.path.push(node.path);
                                scope.stack.push(scope.tree);
                                scope.file = res.value;
                            }
                        });
                    }
                };
            }
        };
    }
]);
