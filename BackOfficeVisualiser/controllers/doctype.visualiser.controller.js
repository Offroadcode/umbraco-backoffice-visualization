angular.module("umbraco").controller("DocTypeVisualiser.Controller", function ($scope, $http, notificationsService, doctypeApiResource, d3Resource) {

    /*--- Init functions ---*/

    $scope.init = function() {
        $scope.setVariables();
        $scope.getData();
    };

    $scope.getData = function() {
        doctypeApiResource.getViewModel().then(function (data) {
            if (data.documentTypes.length) {
                var sortedDocs = $scope.sortByCompositions(data.documentTypes);
                $scope.docTypes = sortedDocs;
                $scope.filteredDocTypes = $scope.filterUnconnectedDocTypes(sortedDocs);
                $scope.docTypes.forEach(function(docType) {
                    $scope.ids.push(docType.id);
                    $scope.names.push(docType.name);
                });
                $scope.filteredDocTypes.forEach(function(docType) {
                    $scope.filteredIds.push(docType.id);
                    $scope.filteredNames.push(docType.name);
                })
                $scope.matrix = $scope.buildMatrix(false);
                $scope.filteredMatrix = $scope.buildMatrix(true);
            }
            console.info($scope.filteredMatrix);
            console.info($scope.filteredDocTypes);
            $scope.createGraph();
        });
    };

    $scope.setVariables = function() {
        $scope.docTypes = [];
        $scope.ids = [];
        $scope.matrix = [];
        $scope.filteredDocTypes = [];
        $scope.filteredIds = [];
        $scope.filteredMatrix = [];
        $scope.names = [];
        $scope.filteredNames = [];
        $scope.showAll = false;
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
    };

    $scope.toggleShowAll = function() {
        $scope.deleteGraph();
        $scope.createGraph();
    }

    /*--- Helper Functions ---*/

    $scope.buildMatrix = function(isFiltered) {
        var docTypes = $scope.docTypes;
        if (isFiltered) {
            docTypes = $scope.filteredDocTypes;
        }
        matrix = [];
        if (docTypes && docTypes.length > 0) {
            // Loop through each docType
            docTypes.forEach(function(docType) {
                var matrixRow = [];
                var currentComps = docType.comps;
                var currentId = docType.id;
                // Loop through each docType to compare against this one.
                docTypes.forEach(function(otherDocType) {
                    var val = 0;
                    // If other doctype's ID matches one of the compositions for this doctype,then val = 1.
                    if (currentComps && currentComps.length > 0) {
                        currentComps.forEach(function(cc) {
                            if (cc == otherDocType.id) {
                                val = 1;
                            }
                        });
                    }
                    // Alternatively, if this document's id is a compositionin the other doctype, then val = 1.
                    if (otherDocType.compositions && otherDocType.compositions.length > 0) {
                        otherDocType.compositions.forEach(function(odcc) {
                            if (odcc == currentId) {
                                val = 1;
                            }
                        });
                    }
                    // Push the val to the row
                    matrixRow.push(val);
                });
                // For each doctype, push a row to the matrix.
                matrix.push(matrixRow);
            });
        }
        return matrix;
    };

    $scope.createGraph = function() {
        var fill = d3.scale.category10();
        var data = {
            labels: $scope.filteredNames,
            matrix: $scope.filteredMatrix
        };
        if ($scope.showAll) {
            data = {
                labels: $scope.names,
                matrix: $scope.matrix
            };
        }
        // Visualize
        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(data.matrix);

        var width = parseInt(d3.select("#DocTypeVisualiserPlaceHolder").style("width"), 10) - 200,
            height = parseInt(d3.select("#DocTypeVisualiserPlaceHolder").style("height"), 10) - 200,
            r1 = height / 2,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1;

        $scope.svg = d3.select("#DocTypeVisualiserPlaceHolder").append("svg")
            .attr("width", width + 200)
            .attr("height", height + 200)
            .append("g")
            .attr("transform", "translate(" + (width + 200) / 2 + "," + (height + 200) / 2 + ")");

        $scope.svg.append("g").selectAll("path").data(chord.groups).enter().append("path").attr("class", "arc").style("fill", function(d) {
            return fill(d.index);
        }).style("stroke", function(d) { return fill(d.index); }).attr('stroke-width', 4).attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)).on("mouseover", $scope.fade(.1)).on("mouseout", $scope.fade(.7));

        $scope.svg.append("g")
            .attr("class", "chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius - 2))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("stroke", function(d) { return fill(d.target.index); })
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

    $scope.deleteGraph = function() {
        $scope.svg = false;
        $('.doctype-graph').html('');
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

    $scope.sortByCompositions = function(docTypes) {
        if (docTypes && docTypes.length > 0) {
            docTypes.sort(function(a, b) {
                return a.compositions.length - b.compositions.length;
            });
        }
        return docTypes;
    };

    /*---- Init ----*/
    $scope.init();

});
