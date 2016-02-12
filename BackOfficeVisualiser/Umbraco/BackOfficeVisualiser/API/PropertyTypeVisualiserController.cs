using System.Web.Http;
using BackOfficeVisualiser.Api.Attributes;
using BackOfficeVisualiser.Models;
using Umbraco.Web.Editors;
using Umbraco.Web.WebApi;
#pragma warning disable 612,618

#pragma warning restore 612,618

namespace BackOfficeVisualiser.Api
{
    [IsBackOffice]
    [CamelCaseController]
    public class PropertyTypeVisualiserController : UmbracoAuthorizedJsonController
    {
        [HttpGet]
        public PropertyTypeAnalyzerResult GetViewModel()
        {
            var pta = new PropertyTypeAnalyzer();

            return pta.Analyze();
        }
    }
}