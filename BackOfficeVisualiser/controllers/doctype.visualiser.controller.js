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
                $scope.docTypes.forEach(function(docType) {
                    $scope.names.push(docType.name);
                });
                $scope.matrix = $scope.buildMatrix(false);
            }
            $scope.createGraph();
            $scope.listenForTabClick();
        });
    };

    $scope.setVariables = function() {
        $scope.docTypes = [];
        $scope.matrix = [];
        $scope.names = [];
        $scope.selectedDocType = {
            id: -1,
            name: '',
            breadcrumb: [],
            compositions: []
        };
        $scope.showAll = false;
        $scope.svg = false;
    };

    /*--- Event Handlers ---*/

    // Returns an event handler for fading a given chord group.
    $scope.fade = function () {
        return function(g, i) {
            var si = $scope.getIndexByDocTypeId($scope.selectedDocType.id);
            $scope.svg.selectAll(".chord path").filter(function(d) { return d.source.index == i || d.target.index == si; }).transition().style("opacity", 0.7);
            $scope.svg.selectAll(".chord path")
                .filter(function(d) { return d.source.index != i && d.target.index != i && d.source.index != si && d.target.index != si; })
                .transition()
                .style("opacity", 0.1);
        };
    };

    $scope.selectDocType = function(id) {
        if (!id) {
            return function(g, index) {
                var docTypes = $scope.docTypes;
                if (!$scope.showAll) {
                    docTypes = $scope.filterUnconnectedDocTypes($scope.docTypes);
                }
                var selected = docTypes[index];
                $scope.selectedDocType = {
                    id: selected.id,
                    name: selected.name,
                    breadcrumb: $scope.getBreadcrumb(selected.id),
                    compositions: $scope.getCompositions(selected.id),
                    pagesUsingComp: $scope.getPagesUsingComp(selected.id)
                };
                $scope.svg.selectAll(".chord path").style("opacity", 0.1);
                $scope.svg.selectAll(".chord path").filter(function(d) { return d.source.index == index || d.target.index == index; }).style("opacity", 0.7);
            }
        } else {
            var selected = $scope.getDocTypeById(id);
            var index = $scope.getIndexByDocTypeId(id);
            $scope.selectedDocType = {
                id: selected.id,
                name: selected.name,
                breadcrumb: $scope.getBreadcrumb(selected.id),
                compositions: $scope.getCompositions(selected.id),
                pagesUsingComp: $scope.getPagesUsingComp(selected.id)
            };
            var docTypes = $scope.docTypes;
            if (!$scope.showAll) {
                docTypes = $scope.filterUnconnectedDocTypes($scope.docTypes);
            }
            $scope.svg.selectAll(".chord path").style("opacity", 0.1);
            $scope.svg.selectAll(".chord path").filter(function(d) { return d.source.index == index || d.target.index == index; }).style("opacity", 0.7);
        }
    };

    $scope.toggleShowAll = function() {
        $scope.deleteGraph();
        $scope.createGraph();
    };

    /*--- Helper Functions ---*/

    $scope.buildMatrix = function(isFiltered) {
        var docTypes = $scope.docTypes;
        if (isFiltered) {
            docTypes = $scope.filterUnconnectedDocTypes($scope.docTypes);
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
            labels: $scope.getNames(),
            matrix: $scope.getMatrix()
        };
        // Visualize
        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(data.matrix);
        var width = document.querySelector('#DocTypeVisualiserPlaceHolder').offsetWidth - 200,
            height = document.querySelector('#DocTypeVisualiserPlaceHolder').offsetHeight - 200,
            r1 = height / 2,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1;

        $scope.svg = d3.select("#DocTypeVisualiserPlaceHolder").append("svg")
            .attr("width", width + 200)
            .attr("height", height + 200)
            .append("g")
            .attr("transform", "translate(" + (width + 200) / 2 + "," + (height + 200) / 2 + ")");

        $scope.svg.append("g")
            .selectAll("path")
            .data(chord.groups).enter().append("path")
            .attr("class", "arc")
            .style("fill", function(d) {
                return fill(d.index);
            })
            .style("stroke", function(d) {
                return fill(d.index);
            })
            .attr('stroke-width', 4)
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            .on("click", $scope.selectDocType())
            .on("mouseover", $scope.fade());

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

    $scope.getBreadcrumb = function(id) {
        var breadcrumb = [];
        var docType = $scope.getDocTypeById(id);
        var hasCrumb = true;
        if (id) {
            while (hasCrumb) {
                hasCrumb = (docType.parentId > -1) ? true : false;
                if (hasCrumb) {
                    docType =  $scope.getDocTypeById(docType.parentId);
                    var crumb = {
                        name: docType.name,
                        id: docType.id
                    };
                    breadcrumb.push(crumb);
                }
            }
        }
        return breadcrumb;
    };

    $scope.getCompositions = function(id) {
        var compositions = [];
        var docType = $scope.getDocTypeById(id);
        if (docType.compositions && docType.compositions.length > 0) {
            compositions = docType.compositions.map(function(comp) {
                return $scope.getDocTypeById(comp);
            });
        }
        return compositions;
    };

    $scope.getDocTypeById = function(id) {
        var result = false;
        $scope.docTypes.forEach(function(docType) {
            if (docType.id === id) {
                result = docType;
            }
        });
        return result;
    };

    $scope.getIndexByDocTypeId = function(id) {
        var index = -1;
        var docTypes = $scope.docTypes;
        if (!$scope.showAll) {
            docTypes = $scope.filterUnconnectedDocTypes($scope.docTypes);
        }
        docTypes.forEach(function(dt, i) {
            if (dt.id === id) {
                index = i;
            }
        });
        return index;
    }

    $scope.getMatrix = function() {
        var matrix = $scope.matrix;
        if (!$scope.showAll) {
            matrix = $scope.buildMatrix(true);
        }
        return matrix;
    };

    $scope.getNames = function() {
        var names = $scope.names;
        if (!$scope.showAll) {
            names = $scope.filterUnconnectedDocTypes($scope.docTypes).map(function(docType) {
                return docType.name;
            });
        }
        return names;
    };

    $scope.getPagesUsingComp = function(id) {
        var pages = [];
        if (id) {
            $scope.docTypes.forEach(function(dt) {
                if (dt.compositions && dt.compositions.length > 0) {
                    dt.compositions.forEach(function(comp) {
                        if (comp === id) {
                            pages.push(dt);
                        }
                    })
                }
            });
        }
        return pages;
    };

    $scope.listenForTabClick = function() {
        var tabs = document.querySelectorAll('.nav-tabs a.ng-binding');
        if (tabs && tabs.length > 0) {
            for(var i = 0; i < tabs.length; i++) {
                tabs[i].onclick = function() {
                    if ($('#DocTypeVisualiserPlaceHolder > svg').attr('height') < 101) {
                        window.setTimeout(function() {
                            $scope.toggleShowAll();
                        }, 5);
                    }
                };
            }
        }
        window.onresize = function() {
            $scope.toggleShowAll();
        };
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
