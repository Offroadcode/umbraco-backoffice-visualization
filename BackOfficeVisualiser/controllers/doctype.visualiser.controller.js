angular.module("umbraco").controller("DocTypeVisualiser.Controller", function ($scope, $http, notificationsService, doctypeApiResource, d3Resource) {

    /*--- Init functions ---*/

    $scope.init = function() {
        console.info('Controller initialized');
        $scope.setVariables();
        $scope.getData();
    };

    $scope.getData = function() {
        doctypeApiResource.getViewModel().then(function (data) {
            console.info(data);
            if (data.documentTypes.length) {
                $scope.docTypes = data.documentTypes;
                $scope.docTypes.forEach(function(docType) {
                    $scope.ids.push(docType.id);
                    $scope.names.push(docType.name);
                });
                console.info('IDs', $scope.ids, $scope.names);
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
    };

    /*--- Event Handlers ---*/

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
                    if (comps && comps.length > 0) {
                        comps.forEach(function(comp) {
                            if (comp === id) {
                                val = 1;
                            }
                        });
                    }
                    matrixRow.push(val);
                });
                matrix.push(matrixRow);
            });
        }
        console.info('matrix', matrix);
        return matrix;
    };

    $scope.createGraph = function() {
        var fill = d3.scale.category10();
        var data = {
            labels: $scope.names,
            matrix: $scope.matrix
        }

        // Visualize
        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(data.matrix);

        var width = 960,
            height = 500,
            r1 = height / 2,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1;

        var svg = d3.select("#DocTypeVisualiserPlaceHolder").append("svg")
            .attr("width", width+200)
            .attr("height", height+200)
            .append("g")
            .attr("transform", "translate(" + (width+200) / 2 + "," + (height+200) / 2 + ")");

        svg.append("g").selectAll("path").data(chord.groups).enter().append("path").attr("class", "arc").style("fill", function(d) {
            return d.index < 4 ? '#444444' : fill(d.index);
        }).attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)).on("mouseover", fade(.1)).on("mouseout", fade(.7));

            svg.append("g")
                .attr("class", "chord")
                .selectAll("path")
                .data(chord.chords)
                .enter().append("path")
                .attr("d", d3.svg.chord().radius(innerRadius))
                .style("fill", function(d) { return fill(d.target.index); })
                .style("opacity", 0.7);

            svg.append("g").selectAll(".arc")
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

                // Returns an event handler for fading a given chord group.
                function fade(opacity) {
                    return function(g, i) {
                    svg.selectAll(".chord path")
                        .filter(function(d) { return d.source.index != i && d.target.index != i; })
                        .transition()
                        .style("opacity", opacity);
                    };
                }
    };

    /*---- Init ----*/
    $scope.init();




    /*
        doctypeApiResource.getViewModel().then(function (data) {
				console.log( "Success", data );
                var docTypes = [];
                var ids = [];
                if (data.documentTypes.length) {
                    docTypes = data.documentTypes;
                    ids = docTypes.map(function(docType) {
                        return docType.id;
                    });
                    console.info('IDs', ids);
                }
                $scope.vm = data;

				// Following all taken from http://bl.ocks.org/MoritzStefaner/1377729
				var w = 960, h = 500;

				var labelDistance = 0;

				var vis = d3.select("#DocTypeVisualiserPlaceHolder").append("svg:svg").attr("width", w).attr("height", h);

				var nodes = [];
				var labelAnchors = [];
				var labelAnchorLinks = [];
				var links = [];

				for(var i = 0; i < 30; i++) {
					var node = {
						label : "node " + i
					};
					nodes.push(node);
					labelAnchors.push({
						node : node
					});
					labelAnchors.push({
						node : node
					});
				};

				for(var i = 0; i < nodes.length; i++) {
					for(var j = 0; j < i; j++) {
						if(Math.random() > .95)
							links.push({
								source : i,
								target : j,
								weight : Math.random()
							});
					}
					labelAnchorLinks.push({
						source : i * 2,
						target : i * 2 + 1,
						weight : 1
					});
				};

				var force = d3.layout.force().size([w, h]).nodes(nodes).links(links).gravity(1).linkDistance(50).charge(-3000).linkStrength(function(x) {
					return x.weight * 10
				});


				force.start();

				var force2 = d3.layout.force().nodes(labelAnchors).links(labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
				force2.start();

				var link = vis.selectAll("line.link").data(links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");

				var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node");
				node.append("svg:circle").attr("r", 5).style("fill", "#555").style("stroke", "#FFF").style("stroke-width", 3);
				node.call(force.drag);


				var anchorLink = vis.selectAll("line.anchorLink").data(labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

				var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
				anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
					anchorNode.append("svg:text").text(function(d, i) {
					return i % 2 == 0 ? "" : d.node.label
				}).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

				var updateLink = function() {
					this.attr("x1", function(d) {
						return d.source.x;
					}).attr("y1", function(d) {
						return d.source.y;
					}).attr("x2", function(d) {
						return d.target.x;
					}).attr("y2", function(d) {
						return d.target.y;
					});

				}

				var updateNode = function() {
					this.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});

				}


				force.on("tick", function() {

					force2.start();

					node.call(updateNode);

					anchorNode.each(function(d, i) {
						if(i % 2 == 0) {
							d.x = d.node.x;
							d.y = d.node.y;
						} else {
							var b = this.childNodes[1].getBBox();

							var diffX = d.x - d.node.x;
							var diffY = d.y - d.node.y;

							var dist = Math.sqrt(diffX * diffX + diffY * diffY);

							var shiftX = b.width * (diffX - dist) / (dist * 2);
							shiftX = Math.max(-b.width, Math.min(0, shiftX));
							var shiftY = 5;
							this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
						}
					});


					anchorNode.call(updateNode);

					link.call(updateLink);
					anchorLink.call(updateLink);

				});
            });
            */
    });
