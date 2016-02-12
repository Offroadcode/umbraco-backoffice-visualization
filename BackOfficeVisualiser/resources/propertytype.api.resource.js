angular.module("umbraco.resources").factory("propertypeApiResource", function ($http) {

	var propertytypeApiResource = {};

	propertytypeApiResource.getViewModel = function () {
		return $http.get('/umbraco/backoffice/api/PropertyTypeVisualiser/GetViewModel').then(function(response) {
			console.log(response.data);
			return response.data;
		});
	};

	return propertytypeApiResource;
});
