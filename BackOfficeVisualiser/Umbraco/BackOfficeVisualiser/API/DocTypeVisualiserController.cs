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
    public class DocTypeVisualiserController : UmbracoAuthorizedJsonController
    {
        [HttpGet]
        public DocTypeAnalyzerResult GetViewModel()
        {
            var dta = new DocTypeAnalyzer();

            return dta.Analyze();
        }
    }
}