// *****************************************************
// File Directive
// *****************************************************

module.directive('file', ['Issue', 
    function(Issue) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/file.html',
            scope: {
                path: '=',
                content: '=',
                selected: '='
            },
            link: function(scope, elem, attrs) {

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
