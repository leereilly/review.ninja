// *****************************************************
// Diff File Directive
// *****************************************************

module.directive('diff', ['$stateParams', '$HUB', '$RPC', 'Issue',
    function($stateParams, $HUB, $RPC, Issue) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/diff.html',
            scope: {
                sha: '=',
                path: '=',
                patch: '=',
                status: '=',
                selected: '='
            },
            link: function(scope, elem, attrs) {

                scope.file = null;

                scope.open = true;

                scope.expanded = false;

                // To Do:
                // fix this

                scope.$watch('patch', function() {

                    if(scope.patch && scope.patch.length && scope.sha) {

                        $RPC.call('files', 'get', {
                            user: $stateParams.user,
                            repo: $stateParams.repo,
                            sha: scope.sha
                        }, function(err, res) {

                            if(!err) {

                                var file=[], chunks=[];

                                var index = 0;

                                // find the chunks
                                while (index < scope.patch.length) {

                                    if(scope.patch[index].chunk) {

                                        var start=0, end=0, c=[];

                                        while( ++index<scope.patch.length && !scope.patch[index].chunk ) {

                                            start = start ? start : scope.patch[index].head;

                                            end = scope.patch[index].head ? scope.patch[index].head : end;

                                            c.push(scope.patch[index]);
                                        }

                                        chunks.push({ start:start, end:end, chunk:c });

                                        continue;
                                    }

                                    index = index + 1;
                                }


                                index = 0;

                                // insert the chunks
                                while (index < res.value.content.length) {

                                    if( chunks[0] && res.value.content[index].head===chunks[0].start ) {

                                        chunk = chunks.shift();

                                        file = file.concat( chunk.chunk );

                                        index = chunk.end;

                                        continue;
                                    }

                                    file.push( res.value.content[index] );

                                    index = index + 1;
                                }

                                scope.file = file;
                            }

                        });
                    }

                });

                // 
                // actions
                //

                scope.match = Issue.line;

                scope.select = function(line) {
                    if(line.head) {
                        var selected = Issue.line(scope.path, line.head);
                        scope.selected = scope.selected!==selected ? selected : null;
                    }   
                };

            }
        };
    }
]);
