angular.module("umbraco.resources").factory("doctypeApiResource", function ($http) {

	var doctypeApiResource = {};

	doctypeApiResource.getViewModel = function () {
		return $http.get('/umbraco/backoffice/api/DocTypeVisualiser/GetViewModel').then(function(response) {
			return response.data;
		});
	};

	return doctypeApiResource;
});
