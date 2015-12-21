angular.module("umbraco.resources").factory("d3Resource", function ($http) {

	var d3Resource = {};

	d3Resource.test = function () {
		console.info('d3resource works');
	};

	return d3Resource;
});
