angular.module("umbraco").controller("DocTypeVisualiser.Controller", function ($scope, $http, notificationsService, doctypeApiResource, d3Resource) {

    /*--- Init functions ---*/

    $scope.init = function() {
        $scope.setVariables();
        $scope.getData();
    };

    $scope.getData = function() {
        doctypeApiResource.getViewModel().then(function (data) {
            if (data.documentTypes.length) {
                $scope.docTypes = $scope.filterUnconnectedDocTypes(data.documentTypes);
                $scope.docTypes.forEach(function(docType, index) {
                    $scope.ids.push(docType.id);
                    $scope.names.push(docType.name);
                });
                $scope.matrix = $scope.buildMatrix();
            }
            $scope.createGraph();
        });
    };

    $scope.setVariables = function() {
        $scope.docTypes = [];
        $scope.ids = [];
        $scope.matrix = [];
        $scope.names = [];
        $scope.svg = false;
    };

    /*--- Event Handlers ---*/

    // Returns an event handler for fading a given chord group.
    $scope.fade = function (opacity) {
        return function(g, i) {
            $scope.svg.selectAll(".chord path")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .transition()
                .style("opacity", opacity);
        };
    }

    /*--- Helper Functions ---*/

    $scope.buildMatrix = function() {
        var docTypes = $scope.docTypes,
        ids = $scope.ids,
        names = $scope.names,
        matrix = [];
        if (docTypes && docTypes.length > 0) {
            docTypes.forEach(function(docType) {
                var comps = docType.compositions;
                var matrixRow = [];
                ids.forEach(function(id) {
                    var val = 0;
                    // First, check if any of the docType's comps match a given id.
                    if (comps && comps.length > 0) {
                        comps.forEach(function(comp) {
                            if (comp === id) {
                                val = 1;
                            }
                        });
                    }
                    // Second, check if the docType at the given id has a comp that matches this docType.
                    docTypes.forEach(function(dt) {
                        dt.compositions.forEach(function(dtc) {
                            if (dtc === docType.id) {
                                val = 1;
                            }
                        });
                    });
                    matrixRow.push(val);
                });
                matrix.push(matrixRow);
            });
        }
        return matrix;
    };

    $scope.createGraph = function() {
        var fill = d3.scale.category10();
        var data = {
            labels: $scope.names,
            matrix: $scope.matrix
        };

        // Visualize
        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(data.matrix);

        var width = parseInt(d3.select("#DocTypeVisualiserPlaceHolder").style("width"), 10),
            height = parseInt(d3.select("#DocTypeVisualiserPlaceHolder").style("height"), 10),
            r1 = height / 2,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1;

        $scope.svg = d3.select("#DocTypeVisualiserPlaceHolder").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width) / 2 + "," + (height) / 2 + ")");

        $scope.svg.append("g").selectAll("path").data(chord.groups).enter().append("path").attr("class", "arc").style("fill", function(d) {
            return d.index < 4 ? '#444444' : fill(d.index);
        }).attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)).on("mouseover", $scope.fade(.1)).on("mouseout", $scope.fade(.7));

        $scope.svg.append("g")
            .attr("class", "chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("opacity", 0.7);

        $scope.svg.append("g").selectAll(".arc")
            .data(chord.groups)
            .enter().append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return ((d.startAngle + d.endAngle) / 2) > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (((d.startAngle + d.endAngle) / 2) * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r1 - 15) + ")"
                  + (((d.startAngle + d.endAngle) / 2) > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) {
                return data.labels[d.index];
            });
    };

    $scope.doesDocTypeHaveConnection = function(docTypes, id) {
        var hasConnection = false;
        docTypes.forEach(function(docType) {
            if (docType.id == id) {
                if (docType.compositions.length) {
                    hasConnection = true;
                }
            } else {
                var comps = docType.compositions;
                if (comps && comps.length > 0) {
                    comps.forEach(function(comp) {
                        if (comp === id) {
                            hasConnection = true;
                        }
                    });
                }
            }
        });
        return hasConnection;
    };

    $scope.filterUnconnectedDocTypes = function(docTypes) {
        var filtered = [];
        if (docTypes && docTypes.length > 0) {
            docTypes.forEach(function(docType) {
                if ($scope.doesDocTypeHaveConnection(docTypes, docType.id)) {
                    filtered.push(docType);
                }
            });
        }
        return filtered;
    };

    /*---- Init ----*/
    $scope.init();

});
